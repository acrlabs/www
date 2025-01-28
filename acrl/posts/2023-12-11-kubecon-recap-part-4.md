---
title: "KubeCon Recap, Part 4: My favorite talks"
authors:
  - drmorr
datetime: 2023-12-11 11:00:00
template: post.html
---

We're getting towards the close of the year, and I'm busy with two separate grant proposals, so I'm gonna phone it in a
little bit today.  This will be my wrap-up KubeCon summary post; now that all the talks are online, I'm going to
highlight a few of my favorites.

## Swimming with the current: making it easy to stay up to date (Jordan Liggitt, Google)

[Video Link](https://www.youtube.com/watch?v=OtigVP3lRh4)

I [already did a deep dive](./2023-11-20-kubecon-recap-part-2.md) on one of the talks from the contributor summit (I
added a link to the video from that post), but my other favorite contributor summit talk was by Jordan Liggitt, talking
about the challenges of keeping your Kubernetes install up to date.  In multiple previous lives, I've experienced the
pain of a) running an old Kubernetes version and b) trying to get off that old version onto a supported version.  It's
not an easy problem, by any stretch of the imagination, and Kubernetes has an _extremely_ aggressive release cycle.
Three major versions a year means that you basically have to have (at least!) one full-time engineer dedicated to _just_
doing upgrades, all year long.  Yikes.

In his talk, Jordan highlighted a few of the things the Kubernetes community can do to make it easier for cluster
operators to upgrade.  One of the things I thought was the most surprising was "stop doing regressions!"  There are a
huge number of regressions caused by supposed bug-fixes and backports---you know, those things that are supposed to fix
things instead of making them worse?  Even worse, 90% of the regressions he analyzed were caused between _patch_
versions, not minor version bumps!  If engineers can't even trust that a _patch version bump_ isn't going to break
everything horribly, how on earth can we expect them to keep updated on _minor_ versions?

Anyways, my summary of the talk is "this is a damn hard problem and fixing it is going to require a concerted,
coordinated effort", but I'd encourage you to go watch the talk to see some of Jordan's specific suggestions.

## Writing Better Controllers (Jon Howard, Google)

[Video Link](https://www.youtube.com/watch?v=GKPBQDJ2Hjk)

I feel like this talk is sortof "spiritually similar" to the previous one; in this talk, another Google engineer (Jon
Howard) discusses what it's like to write bug-free controllers[^1].  This was of particular interest to me, since I've
written a few controllers[^2] and I've never really understood how to do it _correctly_.  The most challenging bit of
writing a controller is that they need to be _idempotent_, meaning that if they're called multiple times with the same
input, they only generate their side-effects once.  Idempotence is one of the hardest problems in distributed
systems[^3], and Kubernetes kinda just throws controller writers into the deep end without a lot of tools or
hand-holding to make it easier.

Jon pitched an alternate vision for writing controllers, based on his extensive experience with [Istio](https://istio.io).
What he proposed is that we should move from an _imperative_ programming model for controllers into a _declarative_
programming model.  This would allow the controller developers to focus on the _business logic_ of their controller,
instead of worrying about things like "Does adding this block of code to my for-loop break idempotence?"

The difference between these two programming models is as follows: in an _imperative_ model, the programmer says "First,
create a pod; then create a configmap; then check the state of something in a database; then..."  In this sort of model,
the developer has to have some way to track the state of the system---what happens if something breaks between step 1
and 2?  How does the controller know where to pick back up?  In contrast, in a _declarative_ model, the programmer says
"_When you need to create a pod_, here's how you do it.  _When you need to check the state in our database_, here's how
you do it."  And then they're able to leave the details up to the framework.

My summary of this talk is: wow, fascinating idea, but I wonder how well it will work in real life.  Definitely worth
watching the talk, though!

## Dungeons and Deployments: Leveling up in Kubernetes (Noah Abrahams, Oracle; Natali Vlatko, Cisco; Kat Cosgrove, Dell; Seth McCombs, AcuityMD)

[Video Link](https://www.youtube.com/watch?v=-CPrDLFM1Aw)

I'm not even gonna try to summarize this talk, but it was easily one of the best "talks" (if you can call it that) at
the conference.  I live-blogged the entire thing [on Mastodon](https://hachyderm.io/@drmorr/111377280330685580) but
honestly, really, just watch the talk.  It's worth it.

## Rapidly Scaling for Breaking News with Karpenter and KEDA (Mel Cone and Deepak Goel, New York Times)

[Video Link](https://www.youtube.com/watch?v=3U_qoCCZyNk)

There were two "end-user" talks that I wend to that I thought were really interesting; the first was this talk about
running Kubernetes at the New York Times.  The rough premise of the talk is that whenever a "breaking news alert" push
notification goes out from the Times, it results in a surge of traffic to NYTimes webservers as all the users click on
the alert to read the article.  There's little-to-no advance notice that a push notification is going to go out, so the
compute cluster has to be ready to scale at a moment's notice basically at all times.  Mel and Deepak described the
system they build using Karpenter for node scaling and KEDA for application scaling.

I mostly went to this talk because I'm curious to know how people are using KEDA and Karpenter in practice, and this
talk didn't disappoint in that regard.  I learned quite a bit about both KEDA and Karpenter from this talk, and in
general came away with a much better appreciation for why folks are excited about Karpenter: namely, that it's not tied
to ASGs and instead just manages individual nodes, doing scale-up and consolidation as needed.  This is roughly the
vision that I had for [Clusterman](https://github.com/Yelp/Clusterman) back in the day, but unfortunately was never able
to make happen, so I at least feel validated that the vision was sound and _someone_ was able to build it.

## 15,000 Minecraft players vs one k8s cluster: Who wins? (Justin Head, Super League; Cornelia Davis, Spectro Cloud)

[Video Link](https://www.youtube.com/watch?v=4YNp2vb9NTA)

This was the other end-user talk that I really enjoyed, partially because it had "Minecraft" in the name.  The talk
described the infrastructure behind Minehut, which is one of the largest "hosted" Minecraft server platforms out there.
In the first part of the talk, they described how they moved Minehut from a bare-metal platform to a cloud-hosted
platform, and then back again.  GCP is expensive, who knew?

Anyways, the part that I thought was interesting about this talk was the conversation about lifecycle management and
disruption of pods.  Unlike "most" applications, Minecraft servers are long-lived and stateful, and if you shut one
down, you prevent a whole bunch of people from playing Minecraft, which means that when you need to do any sort of
upgrade or migration, you have to do it very slowly and carefully[^4].  The main takeaway here is that in order to do
any sort of sane disruption, you have to be able to communicate the intended disruption to the pod (and, ideally, the
players as well) well in advance.  You can also pre-provision extra capacity for when you expect the downtime to occur.
Then you can (carefully) snapshot your game state, mass-delete everything at once, and bring it all back up as quickly
as possible.

## A Tale of Two Flamegraphs (Ryan Perry, Grafana Labs)

[Video Link](https://www.youtube.com/watch?v=XES5Irk08qw)

The last talk I'm going to highlight in this post is a discussion on profiling Kubernetes applications.  I am not an
observability person, but I have a vested interest in _having good observability tools_, because I've experienced life
without them and it's not fun.  A typical observability stack is "metrics, logs, and traces", but Ryan argued in this
talk that we should also include "profiling" in that list.  You don't always need to profile your apps, he said
(paraphrasing), but when you do, you want to have the tools available to do it.  Enter flamegraphs.

[Flamegraphs](https://www.brendangregg.com/flamegraphs.html) were popularized back in 2011 by Brendan Gregg, and what I
find somewhat mind-boggling is that today, 12 years later, the _recommended way to generate a flamegraph_ is to go clone
Brendan's [GitHub repo](https://github.com/brendangregg/FlameGraph), make sure you have the right perl things installed,
and run some arcane shell commands to build an SVG.  There are _some_ tools out there to help sortof automate this
process but it still seems like a relatively niche thing to do.

Ryan's talk, therefore, was all about how to make this easier and more common in distributed computing.  There are
essentially two components: the first collects a continuous profile of the application, and the second provides a nice
interface to view and explore the profile.  For the latter component, Ryan presented (naturally) some Grafana plugins
that you can run to explore your flamegraphs, but the bulk of the talk was actually on the former bit.  Profiling
applications continuously can generate a lot of data, and so there's a bunch of neat tips and tricks you can do to store
profiles over longer periods of time.  Definitely worth a watch if that kind of stuff interests you!

## That's all, folks!

Alrighty, that's a wrap for KubeCon this year!  Next week I'm going to have a wrap-up post for Applied Computing, and
then we're to the holidays and 2024!  Let's gooooo!

Thanks for reading,

~drmorr

[^1]: If you're unfamiliar, _controllers_ (or sometimes we call them _operators_) are the bits of code that _reconcile_
    the actual state of the world with the desired state of the world, usually by creating or deleting pods, configmaps,
    or other primitives.  There are dozens of controllers built in to Kubernetes to manage Deployments, StatefulSets,
    and many more, but users can also implement their own controllers for [custom resources](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/)

[^2]: Shameless plug: [SimKube](https://github.com/acrlabs/simkube) has a controller in it!

[^3]: Along with naming things and exactly-once processing.

[^4]: This isn't helped by the fact that the disruption primitives that Kubernetes offers are _abysmal_, but that's a
    rant for a different blog post.
