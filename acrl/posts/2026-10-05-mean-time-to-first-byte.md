---
title: "Key Autoscaling Metric #2 - Mean Time to Stop Sucking"
authors:
  - drmorr
datetime: 2026-10-05 14:30:00
template: post.html
---

<figure markdown>
  ![a picture of a purple octopus holding a sign that says "i don't suck and so can you"](/img/posts/2026-10-05/suck.png)
  <figcaption>Mr. Squidler's firing on all cylinders today.</figcaption>
</figure>

Welcome to the second deep dive in our "[Five Key Metrics for Kubernetes Autoscaling](2026-09-22-five-key-metrics.md)"
series!  In last [week's post](2026-09-28-autoscaling-metric-1-workload-committed.md), Ian broke down the node workload
committed capacity metric: how this is a useful proxy for "wasted money" and why nobody is actually computing this
correctly.  In _this_ week's post, we're going to do the same thing, but on the flip side of the cost-reliability coin.
Specifically, how can your autoscaling behaviour impact the actual end-user experience for your application?

We're going to do this via a metric that nobody's ever heard of before, called "Mean Time to Stop Sucking" (MTSS).  Just
like in last week's post, I'm going to argue that, despite the name, this is a _real_ metric that you _ought_ to be
tracking in your autoscaler, and then explain why nobody does[^1].

But first, let's revisit the "cost-reliability" coin, since it's been a minute[^2] since we've talked about it.

## Heads, it's cheap.  Tails, it's not broken.

Like I mentioned in the intro post, there are two reasons why you might be interested in autoscaling: cost, and capacity
planning.  The first reason is the one that everybody talks about, but in my favorite thought experiment of all time, I
can make your infrastructure _extremely_ cheap by turning it all off.  Or, I can make your infrastructure extremely
robust and reliable by provisioning a [c7i.48xlarge](https://aws.amazon.com/ec2/instance-types/c7i/) for every pod in
your cluster, but I don't think your CFO will like that very much.  Ideally you'd like your infrastructure to be
"somewhat" cheap, but also "somewhat" reliable, but how do you know where you are on that curve?

Ian's post last week covered the "cheap" side of things; this week and next week we'll cover the "reliability" aspect.
I'm actually going to break "reliability" into two sub-components, that is, "scaling up" and "scaling down", because
they're both important and you need to measure different things for them.  On scale up, you need to know if your users'
experience is degraded (and for how long) because it's taking you too long to provision new capacity.  On scale down,
you need to know if your users' experience is degraded because they were actively doing work and your autoscaler rudely
interrupted them.

So there you have it: autoscaling metrics two and three!  We're all done here, you can go home now.

## "Mean Time to Thing" metrics considered ~~harmful~~ awesome

Just kidding.  Let's talk more about scaling up.  In Kubernetes, this is how it works: your vibe-coded project gets
posted to the orange site and all of a sudden five million AI bros are hitting your homepage.  Unfortunately, you only
have two pods backing that homepage; so those pods' CPU utilization goes through the roof, but fortunately you
configured the Horizontal Pod Autoscaler (HPA) to watch for overloaded pods, so after sending back a few million 503s, a
bunch of new Kubernetes pods get created.  Unfortunately, you're still on the AWS free tier, so you've only got a single
`t3.medium` instance, and it's all full!  However, you _did_ actually set up Karpenter to scale up more nodes, so it
sees all these pending pods and requests some GPU instances from AWS, because your vibe-coded app needs GPU instances to
display your home page for some reason.  Sadly, Anthropic has sucked up all the GPU instances so it takes 10 minutes to
get some, but this is a fine and normal experience these days.  ANYWAYS, once you've finally gotten your compute
hardware, your pods can get scheduled on them---just kidding, actually you have to install 10 years of security updates
before Kubelet will start.  NOW your pods can start!

<figure markdown>
  ![A bar chart showing the breakdown of steps in scaling up your application; the labels are "pending pods created",
"node provisioning", "node configuration management", "kubernetes scheduling loop", "pod startup", and "application
readiness"](/img/posts/2026-10-05/mtss.png)
  <figcaption>All the steps your infrastructure needs to take before your user can see a cat picture.</figcaption>
</figure>

You're done, right?  Your users can now click buttons on your vibe-coded home page?  Ha!  Hahahaha!  Nope.  Sadly,
Claude Code wrote your app in Java, which means it takes another five minutes to load your entire database into memory,
and do all of the JIT compilation things, and then _finally_ the AI bros can see a vibe-coded picture of a cat.

<figure markdown>
  ![An extremely poorly drawn picture of a cat; the colors are horrendous and none of the strokes are within the lines](/img/posts/2026-10-05/cat.png)
  <figcaption>
    I kid you not, this is the image that ChatGPT made for me when I asked for a cat.  I actually had to
    refine it a couple of times.
  </figcaption>
</figure>

OK, so this situation probably isn't great, but how can you make it better?  Well, the first step is, you need a metric
to game!  In most organizations that I've worked at, the metric folks look at is "time from pending pod to scheduled
pod"[^3].  Even _this_ metric is somewhat challenging to track, but Karpenter, at least, has an alpha timeseries called
`karpenter_pods_unbound_time_seconds`, which tracks the time from pod creation to pod binding.

But as you can see, this metric _really_ doesn't capture the performance of your autoscaling.  In fact, mostly what this
metric captures is the cloud provider provisioning delay.  That's, like, a tiny fraction of what your user cares about!
So in the post, I'd like to propose a different metric, called "Mean Time to Stop Sucking": this is the length of time
between when a user _makes a request_ and when their user experience stops being utter dogshit[^4].

## WAHHHHHH, that's so hard to measure, I don't wanna!

I've been in a number of these conversations with folks, and whenever I've pitched this as a metric to monitor, most
people have said something to the effect of "That's a really hard metric to measure, and also we don't have control over
half the things in there.  We should just monitor the bits we have control over."

And, like, excuse me.  You're _distributed systems engineers_.  Your literal job description is to do hard things.  And
also: there's _lots_ of stuff in life you don't have any control over, but you monitor anyways[^5].  The first step to
"improving things" is ~~asking Claude to fix your broken everything~~ understanding them.  If you don't _understand_
where all the delays in your scaling are coming from, how on earth do you meaningfully expect to do anything about them?

Anyways, maybe that's a little bit unfair.  This _is_ actually a really hard thing to measure, at least in a useful way;
if you just measure MTSS as a single number, you know that things are bad, but you don't understand why things are
bad.  But to understand _why_ things are bad, you need to correlate/connect events from multiple different sources.
You need to know when your users make requests, which you probably don't have a good way to track unless you're running
some kind of service mesh.  You need to link that time to your horizontal autoscaler response, which is based on a bunch
of aggregated metrics data from cAdvisor.  Then you need to connect the HPA scaling behaviour to your cluster autoscaler
response, and _finally_ you need to understand your application performance on startup.  So that's like, five different
metrics you need to track just to track one single metric[^6]!

The good news is, with various distributed tracing infrastructure, you actually _can_ track all of this stuff and get a
good breakdown of your scaling activity.  Setting up the distributed tracing infrastructure is left as an exercise for
the reader.

## We have achieved suckitude!  Now what???

So OK, now you understand a) that your application sucks, and b) _why_ your application sucks.  How do you make it suck
less?  Step one is the hardest step: "convincing your CEO that having an application that sucks is bad for business."
But this isn't an advice column, so I'm not going to dig into that one any further.

What I _will_ talk about is how you, as (purportedly) a member of your platform team, can have a positive impact on your
scaling up time.  It might feel like you don't have many levers to pull, but it turns out there's actually quite a lot
you can do here!  Here are some ideas:

1. **Use a faster node autoscaler**: as I pointed out a long, long time ago, there is [a marked difference in scaling speed
   between the Kubernetes Cluster Autoscaler and Karpenter](2024-09-16-simkube-kca-karpenter-part-2.md ).  There's a
   pretty good chance that "just" switching to Karpenter is going to have a noticeable improvement on your cluster
   scaling speed.  You don't even have to be on AWS for this, there's a [Azure Karpenter Provider](https://github.com/Azure/karpenter-provider-azure)
   that's been around for a couple years now, and even a [GCP Karpenter Provider](https://github.com/cloudpilot-ai/karpenter-provider-gcp)!
2. **Optimize your node provisioning time**: most of the cloud providers are "pretty fast" at providing you with hardware
   when you ask for it[^7].  And yet, the number of folks I've talked to who are like "it takes 5+ minutes for a node to
   become available" is _incredibly_ high.  It turns out that as much as we talk wanting about our compute hardware to
   be [cattle, not pets](https://cloudscaling.com/blog/cloud-computing/the-history-of-pets-vs-cattle/), actually _doing_
   that is, well, pretty hard.  So usually when a new node comes up, there's a lot of "stuff" that needs to be done
   before it can join your Kubernetes cluster: installing OS security updates, node configuration based on environment
   (prod vs staging), region (US vs somewhere else), etc.  All of that stuff takes time, and if you can make it go
   faster then you can improve your MTSS.  I don't have a ton of specific advice here because it likely depends on a lot
   of specific architectural decisions you've made about your infrastructure, but one thing I've seen be effective for
   some organizations is to [bake as much of your architecture into an AMI as possible](2026-04-13-boy-ami-glad-to-see-you.md).
3. **Use a faster horizontal autoscaler**: one of the more common reasons[^8] that folks reach for [KEDA](https://keda.sh)
   is that you can configure the metrics evaluation loop to be more performant than the vanilla HPA.  The more often you
   evaluate your metrics, the faster you can react to changes in those metric values.
4. **Use better horizontal scaling metrics**: in what is the definition of the word "irony", every platform engineer on
   the planet will tell you that you [should not scale on pod CPU utilization](https://www.youtube.com/watch?v=gSiGFH4ZnS8),
   and also every platform engineer on the planet scales their pods on CPU utilization.  If you scale on something else
   (requests per second, queue depth, really anything at all is better than CPU utilization), you're going to have an
   earlier signal that load is increasing, which means you're going to have an earlier response time, and your
   application is going to suck less.  KEDA is also a great choice if you want to scale on arbitrary non-CPU metrics.
5. **Scale your entire dependency chain at once**: this lever is the corollary to #4.  A very common pattern is that in
   your microservice architecture, you have a chain of dependencies, \(A \to B \to C \to D\).  Service \(A\) starts
   getting increased load based on user requests, which it eventually solves by scaling up.  Service \(B\) then starts
   getting increased load based on requests from service \(A\), so then _it_ starts scaling up.  This continues until
   service \(D\) has scaled up, and then---and _only_ then---will your users stop seeing errors.  The better way to do
   this is to scale your entire dependency chain at once as soon as service \(A\) starts seeing increased load.  The
   hard part here is identifying what your dependency chains are, but there was a [very cool paper](https://www.usenix.org/system/files/osdi20-qiu.pdf)
   published a few years ago that provides some insights on how to do this.
6. **Make your application start faster**: I'm pretty sure that you, as a putative platform engineer, had a visceral
   reaction when I said this.  "But we don't control the application code, bro!  Those are the product teams, and we try
   as hard as possible to never talk to them!"  Well, OK, I think I've identified one problem in your organization
   already.  But also, even if you absolutely can't change anything at all about your application code, there's still
   stuff here you can change: how many init containers are you running in your pods?  How many sidecars are you running
   that all need to be healthy before your pod readiness check succeeds[^9]?  Maybe get rid of some of those.
7. **Use a predictive autoscaler**: this is the thing that literally everybody jumps to.  "If we could just _predict_ when
   our load is going to occur, then we don't have to do any of the hard work of actually making our application suck
   less!"  I think folks really like this approach because it sounds sexy as hell, and also probably because
   implementing a predictive autoscaler is likely going to get you a promotion.  But unfortunately I have bad news and
   worse news for you: a) you're probably never going to get it right, because doing predictive autoscaling is really,
   really, really hard to do well, and b) even if you _do_ get it right, it's probably not going to solve all your
   problems[^10].  That's not to say that predictive autoscaling is _always_ a bad idea or that it's _never_ going to
   work well, but it wouldn't be the first thing I reach for in my toolbox.  However, if you _do_ decide to go this
   route, I recommend paying a vendor instead of trying to implement it yourself: there are a couple vendors who do this
   really well, and about 67 other vendors who do it extremely poorly, and if you pay me a bunch of money I might tell
   you which is which.

So anyways, there you have it, ACRL's simple seven-step guide to making your application scaling suck less!  Tune in
next time to find out all our secret strategies for scaling back down once you no longer need less suckage.

As always, thanks for reading!

~drmorr

[^1]: tldr: it's hard and people are lazy

[^2]: Like, probably, literally a minute, this is all I ever talk about in real life, people come up to me all the time
    and are like "David won't you shut up about cost and reliability already?"  Probably the only thing I talk about
    more is [layers](https://blog.appliedcomputing.io/p/thoughts-on-scheduling-and-autoscaling).

[^3]: I'm just kidding, most organizations I've worked at don't look at metrics.

[^4]: BTW, there're a bunch of interesting/related metrics in the frontend space: the "normal" one folks use there is
    ["first contentful paint"](https://web.dev/articles/fcp).  There are various modules in React/Vue/whatever
    vibe-coded Javascript-framework-of-the-week you're using that provide this metric, but these don't work for services
    that don't necessarily "paint" things---and while I've never used them, I'm reasonably certain that none of these
    front-end services have any way to measure or attribute delays in your infrastructure scaling.

    There is another closely-related metric called "Mean Time to First Byte", which is the length of time between a user
    request and the first byte that the application returns, but this also isn't quite appropriate here because
    sometimes your Kubernetes apps aren't necessarily "returning bytes".

[^5]: The weather app on your phone would like a word.

[^6]: And then once you've started tracking all of these metrics, your observability team is going to complain at you
    incessantly about how expensive it all is, but thems the breaks.

[^7]: Again, unless you need a GPU, in which case you're SOL, say it with me now, "Thanks, Anthropic".

[^8]: The other incredibly common reason that folks reach for KEDA is that, up until a few months ago, KEDA was the only
    open-source pod autoscaler that supported "scaling to zero", which is, when you think about it, is kind of bonkers.
    Anyways, HPA now supports [scale to zero](https://kubernetes.io/blog/2026/09/02/kubernetes-v1-37-hpa-scale-to-zero-beta/).

[^9]: If the answer to these questions is "under 10", congratulations, you're already doing better than most everybody
    else out there.

[^10]: Well, except for getting you that promotion.  It's virtually guaranteed to do that, even if the autoscaler never
    works.
