---
title: "SimKube: Part 1 - Why do we need a Simulator?"
authors:
  - drmorr
datetime: 2023-08-28 11:00:00
template: post.html
---

Alright, it's time for my first multi-part series on this blog! I'm gonna talk about my first "big" project that I've
been working on at Applied Computing. I think this is going to be a three (or maybe four?) part series. I'll link to the
other posts from here as I write them. Here's the outline:

* Part 1 (this post) - Why do we need a simulator?
* [Part 2](2023-09-04-simkube-part-2.md) (next week) - Building a simulated cluster with Virtual Kubelet
* [Part 3](2023-09-18-simkube-part-3.md) (in three weeks) - Recording traces and replaying them
* [Part 4](2024-02-26-simkube-part-4.md) (i dunno when) - Analyzing the data

Excited? I am! So buckle up, it's gonna be a ride.

## Understanding distributed systems sucks

If you've spent any time at all working with large distributed systems, you'll know that trying to understand their
behaviour is _really hard_. Distributed systems are, well, distributed — which means that by definition, they are broken
up into a bunch of tiny[^1] components which operate _mostly_ in isolation but periodically have to communicate something
about their state to other components in the system. A lot of the research in distributed systems has been around "what
happens if something goes wrong with the network"[^2], which admittedly is a very hard problem. There has been
comparatively less research around "what happens when everything is going normally?", which I might argue is an even
harder problem.

To put it another way, distributed systems have [emergent](https://en.wikipedia.org/wiki/Emergence#Emergent_properties_and_processes)
behaviour. From the Wikipedia article,

> **emergence** occurs when a complex entity has properties or behaviors that its parts do not have on their own, and
> emerge only when they interact in a wider whole.

This is almost the textbook definition of a distributed system: we have a bunch of small components that create a
complex entity, and the complex entity only works _because of_ the interactions of the small components. The trouble is
that emergent behaviour is extremely hard to reason about. You can understand each of the small components perfectly in
isolation and still not understand the system. You can understand the system at a small scale perfectly, and still not
understand the system at a large scale. And distributed systems like Kubernetes, which are built up of dozens or
hundreds of "small components" are extremely susceptible to this. In fact, I would say that 75% of the incidents I've
witnessed at big companies have been caused because of emergent behaviour that we didn't understand.

Actually it's even worse than that. Because we don't _understand_ the behaviour, when something breaks (and it _will_
break), we don't understand how to fix it. So we make a guess, and apply a band-aid, and change some parameter to fix
the immediate problem. But then two months later, something else breaks, and we apply another band-aid, and then
another, and then three years later your system is coated in band-aids that _themselves_ interact in unpredictable ways
until you can't even fix your existing problem without creating a new one.

This is obviously not a sustainable long-term situation, but what can we do about it? If you come from a mathematics or
theoretical CS background, you might try to prove the behaviour of your system. If you can formalize your system and
apply logical reasoning, maybe you can show that "undesired" behaviour can't happen. This is not going to be easy,
though: formal verification is nearly intractable even for non-distributed systems[^3]. Even ignoring that small
difficulty, to have a stable and reliable system we need to somehow be able to reason about all the failure modes we'd
like to avoid, and almost by definition we don't _know_ all the failure cases of an emergent system.

Another option, which is more tractable, is testing. Writing good tests is a really important part of software
development, and you will find all kinds of arguments on the Internet about the "best" way to write tests. But one of
the truisms about testing is that "the bigger and more integrated the system under test, the harder the tests are to
write". Tests of small, isolated components are easy; tests of a few components working together are harder; end-to-end
tests of the entire system are very hard to write and very hard to maintain[^4]. And you still have the problem that you
can only test for the failure cases that you can think of!

A third method that you can use, which initially sounds really promising, is simulation. We don't know how the system
will behave with this change, so let's just simulate it and see what happens! Then we can have a lot of confidence in
our change! Easy peasy, this blog series is over.

Except... it's not really that simple. The main problem with simulating complex systems is that you have to ignore some
of the complexity in order to create the simulation. And when you start ignoring complexity, the results of your
simulation are going to diverge from reality, which means you can't always trust your simulation[^5]. So the name of the
game here is trying to pick the critical parts of the system that drive the majority of the behaviour that you're
interested and throw away the rest. And then hope that the resulting simulation provides some interesting insights[^6].

## Simulating distributed systems sucks

Back when I was a baby developer, I wrote a simulator as a part of [Clusterman](https://engineeringblog.yelp.com/2019/02/autoscaling-mesos-clusters-with-clusterman.html),
which was an autoscaler that we built at Yelp for Apache Mesos. I'm maybe biased, but it worked pretty well, and it
actually did help our infra teams uncover bugs before shipping code out to production. The main problem we ran into back
then is that "maintaining a simulator" requires duplicating a bunch of effort whenever things change. First you have to
make the change to your production system, and then you have to also make changes to your simulator so that it continues
to behave "the same". Eventually for Clusterman, the way things worked in the real world diverged enough from the
simulator, and we didn't have enough headcount to maintain two parallel code paths, that most of the simulation code
became useless and was removed.

The second problem I ran into with our simulator is "where does the data come from?" In other words, we want to simulate
a system running at scale, but how do we know what "at scale" looks like? You could randomly generate 100,000 pods and
schedule them at random on 2,000 nodes, but it's fairly well-known that random data isn't often a good representation of
reality. The other thing you can do is collect a "trace" of real data and then use that (or a perturbation of it) in
your simulation, but how do you know you're collecting the right trace? Separately, how do you store that data and
ensure that it's useful in the future?

The last problem I encountered during this time was that understanding the results of a simulation is extremely
challenging. We as an industry don't (in my opinion) have a good story around doing data analysis on distributed
systems[^7]. In Clusterman, for example, I wrote a bunch of bespoke code to generate some (very pretty, imo) graphs, but
if we wanted to change the analysis or look at something different, I had to go write a bunch more code, which proved to
not be sustainable.

After that experience, I took a pretty hard-line "simulation is impossible" stance for a few years, but I've recently
been revisiting that position. Maybe this is because I've matured[^8] as a developer and realized that saying something is
"impossible" isn't helpful, but also maybe this is because the existence of tools like Kubernetes-in-Docker (aka kind)
make it possible to actually run a full-fledged distributed cluster _locally_ with all the "real" control-plane
components present. This solves the first (and, imo, the hardest) issue that I ran into with the Clusterman
simulator—`kind` ensures that we don't have to worry about drift between "real" Kubernetes and "simulated" Kubernetes.

From there, we pretty much can see a path to the solution, which coincidentally lines up with the outline for the rest
of this blog series. First we need to build some small components to scale the number of simulated nodes in a cluster up
and down, and we need to mock out the actual workloads on those nodes (we'll use [Virtual Kubelet](https://virtual-kubelet.io/)
for this). Next, we need to describe what a trace looks like, and build some tools to collect and store them; at the
core, this is just a data collection problem, and we roughly know how to do that. Lastly, we need to answer the data
analysis question—this is the one part that I don't have a good solution for right now, but I don't think that this is
impossible, either, and I have a few ideas for how to proceed.

## Everything sucks

Well, my goodness, that blog post was negative! Hopefully it wasn't _too_ negative. My goal here was to try to outline
the problem space and explain why this is a hard (but not _too_ hard) and important problem to solve. I've talked with
quite a few people who _really want_ some way to simulate their Kubernetes clusters; and more to the point, this is also
something that I want. As I start getting into my main goal of "doing scheduling in Kubernetes better", I'm going to
need some way to compare the performance between the default scheduler and whatever it is that I'm going to build, and
simulation is one way to do that. So that's where we'll be going for the rest of this series! Hope you enjoy.

Thanks for reading,

~drmorr

## Appendix: Related work

The main article is long enough already, but I do want to call out that there is some related work in this area. I'll
just include a few links below with a brief description, and also the caveat that I may be missing something — If I am
missing a project here, I'd love to know about it!

* [Kubemark](https://github.com/kubernetes/kubernetes/blob/release-1.3/docs/devel/kubemark-guide.md): Kubemark is part
  of the Kubernetes suite of tools and uses a technically similar approach to what I'm going to be outlining here,
  though with a different aim: it's really targeted at performance testing of the control plane (making sure it stays
  within SLOs and so forth), whereas I'm interested in understanding the behaviour of the system.  It's possible that my
  approach and Kubemark could converge at some point in the future, however.
* [Locust](https://locust.io/), [Vegeta](https://github.com/tsenart/vegeta), [Siege](https://github.com/JoeDog/siege),
  etc: There are a host of different load-testing tools out there that are targeted primarily at testing individual
  services. The idea is they do traffic replay or generate a bunch of artificial load on your service and you watch to
  see when it falls over or where the hot spots are. This is not really the problem I'm trying to solve at all, I'm
  interested in the holistic performance of the system, not any one service.
* [kube-scheduler-simulator](https://github.com/kubernetes-sigs/kube-scheduler-simulator): This is another project that
  is trying to understand the behaviour of the system, however it's looking at things at an individual pod level, and is
  concerned with just the scheduler. It will annotate pods with the results of the scheduler scoring algorithm so that
  you can understand how and why a particular pod got scheduled where it did. I would like to understand the broader
  ecosystem---scheduler, HPA, VPA, cluster autoscaler, etc. However, I think the kube-scheduler-simulator has some good
  ideas and it's again possible that these approaches might converge in the future.

[^1]: And here I use the word "tiny" very liberally

[^2]: See also: [CAP theorem](https://en.wikipedia.org/wiki/CAP_theorem)

[^3]: There has been a bunch of progress on this in recent years; there's been some efforts to [formally verify the
    Linux kernel](https://link.springer.com/chapter/10.1007/978-3-030-30446-1_17), and Airbus has been using formal
    methods to [verify their avionics software](https://www.di.ens.fr/~delmas/papers/fm09.pdf) for over twenty years!
    But there's still a long way to go before we can easily do formal verification for arbitrary software.

[^4]: And to top it off, if you're running an end-to-end test at scale, it's gonna cost you a pretty penny, so you're
    probably not going to do it very often.

[^5]: In physics, this is the [three-body problem](https://en.wikipedia.org/wiki/Three-body_problem). If you have two
    objects and you want to understand how they interact, you can run a computer simulation (or solve for a closed-form
    solution). If you have three or more objects and you want to understand how they interact, you can't. Or, well, you
    can, but the way to understand it is to set them up and press "go", and then watch what happens—you can't have a
    computer simulate it for you. Three-body systems are chaotic, which means that very small changes in their initial
    conditions lead to wildly divergent outcomes.

    Perhaps amusingly, I think about this problem in the context of video and role-playing games too. There's a big
    tension in game design between making things realistic and making things fun. Games try to simulate some version of
    reality with dice rolls and stats and complex rules, but there's almost always a situation where [the rules break
    down](https://www.dandwiki.com/wiki/Pushing_the_Speed_Limit_(5e_Optimized_Character_Build)#:~:text=Using%20your%20normal%20action%2C%20action,That's%20575%20miles%20per%20hour.).
    You get to a point where the only way to simulate reality is to "try it in real life and see what happens" but this
    becomes problematic when you're trying to stab other creatures with a sword for fun.

[^6]: [All models are wrong, but some are useful](https://en.wikipedia.org/wiki/All_models_are_wrong).

[^7]: There're a lot of reasons for this: metrics collection is hard, visualizing data is hard, and statistics is hard.
    Things have gotten a bit better in recent years with [Prometheus](https://prometheus.io/) and
    [Grafana](https://grafana.com/), but these are _monitoring_ tools, not _data analysis_ tools, which seem like the
    same problem at first glance until you realize that they're subtly different in a hundred different ways.

[^8]: Dear peanut gallery: shut up.
