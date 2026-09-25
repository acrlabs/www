---
title: "Key Autoscaling Metric #2 - Mean Time to First Byte"
authors:
  - drmorr
datetime: YYYY-MM-DD 11:00:00
template: post.html
---

<figure markdown>
  ![alt text here](/img/posts/XXXX.png)
  <figcaption>XXXX</figcaption>
</figure>

Welcome to the second deep dive in our ["Five Key Metrics for Kubernetes Autoscaling"](2026-09-22-five-key-metrics.md)
series!  In last [week's post](XXXX), Ian broke down the node committed capacity metric: how this is a useful proxy for
"wasted money" and why nobody is actually computing this correctly.  In _this_ week's post, we're going to do the same
thing, but on the flip side of the cost-reliability coin.  Specifically, how can your autoscaling behaviour impact the
actual end-user experience for your application?

We're going to do this via a metric that nobody's ever heard of before, called "Mean Time to First Byte" (MTFB).  Just
like in last week's post, I'm going to argue that this is the _real_ metric that you _ought_ to be tracking in your
autoscaler, and then explain why nobody does[^1].

But first, let's revisit the "cost-reliability" coin, since it's been a minute[^2] since we've talked about it.

## Heads, it's cheap.  Tails, it's not broken.

Like I mentioned in the intro post, there are two reasons why you might be interested in autoscaling: cost, and capacity
planning.  The first reason is the one that everybody talks about, but in my favorite thought experiment of all time, I
can make your infrastructure _extremely_ cheap by turning it all off.  Or, I can make your infrastructure extremely
robust and reliable by provisioning a [c7i.48xlarge](https://aws.amazon.com/ec2/instance-types/c7i/) but I don't think
your CFO will like that very much.  Ideally you'd like your infrastructure to be "somewhat" cheap, but also "somewhat"
reliable, but how do you know where you are on that curve?

Ian's post last week covered the "cheap" side of things; this week and next week we'll cover the "reliability" aspect.
I'm actually going to break "reliability" into two sub-components, that is, "scaling up" and "scaling down", because
they're both important and you need to measure different things for them.  On scale up, you need to know if your users'
experience is degraded (and for how long) because it's taking you too long to provision new capacity.  On scale down,
you need to know if your users' experience is degraded because they were actively doing work and your autoscaler rudely
interrupted them.

So there you have it: autoscaling metrics two and three!  We're all done here, you can go home now.

## "Mean Time to Thing" metrics considered ~harmful~ awesome

Just kidding.  Let's talk more about scaling up.  In Kubernetes, this is how it works: your vibe-coded project gets
posted to the orange site and all of a sudden five million AI bros are hitting your homepage.  Unfortunately, you only
have two pods backing that homepage; so those pods' CPU utilization goes through the roof, but fortunately you
configured the Horizontal Pod Autoscaler (HPA) to watch for overloaded pods, so after sending back a few million 503s, a
bunch of new Kubernetes pods get created.  Unfortunately, you're still on the AWS free tier, so you've only got a single
`t4.large` instance, and it's all full!  However, you _did_ actually set up Karpenter to scale up more nodes, so it sees
all these pending pods and requests some GPU instances from AWS, because your vibe-coded app needs GPU instances to
display your home page for some reason.  Sadly, Anthropic has sucked up all the GPU instances so it takes 10 minutes to
get some, but this is a fine and normal experience these days.  ANYWAYS, once you've finally gotten your compute
hardware, your pods can get scheduled on them---just kidding, actually you have to install 10 years of security updates
before Kubelet will start.  NOW your pods can start!

{Diagram showing all the steps in scaling up}

You're done, right?  Your users can now click buttons on your vibe-coded home page?  Ha!  Hahahaha!  Nope.  Sadly,
Claude Code wrote your app in Java, which means it takes another five minutes to load your entire database into memory,
and do all of the JIT compilation things, and then _finally_ the AI bros can see a vibe-coded picture of a cat.

{TODO vibe-coded picture of a cat}

OK, so this situation probably isn't great, but how can you make it better?  Well, the first step is, you need a metric
to game!  In most organizations that I've worked at, the metric folks look at is "time from pending pod to scheduled
pod"[^3].  Even _this_ metric is somewhat challenging to track, but Karpenter, at least, has an alpha timeseries called
`karpenter_pods_unbound_time_seconds`, which tracks the time from pod creation to pod binding.

But as you can see, this metric _really_ doesn't capture the performance of your autoscaling.  In fact, mostly what this
metric captures is the cloud provider provisioning delay.  That's, like, a tiny fraction of what your user cares about!
So in the post, I'd like to propose a different metric, called "Mean Time to First Byte": this is the length of time
between when a user _makes a request_ and when they get a response back[^4].

## WAHHHHHH, that's so hard to measure, I don't wanna!

I've been in a number of these conversations with folks, and whenever I've pitched this as a metric to monitor, most
people have said something to the effect of "That's a really hard metric to measure, and also we don't have control over
half the things in there.  We should just monitor the bits we have control over."

And, like, excuse me.  You're _distributed systems engineers_.  Your literal job description is to do hard things.  And
also: there's _lots_ of shit in life you don't have any control over, but you monitor anyways[^5].  The first step to
"improving things" is ~asking Claude to fix your shit~ understanding them.  If you don't _understand_ where all the
delays in your scaling are coming from, how on earth do you meaningfully expect to do anything about them?

Anyways, maybe that's a little bit unfair.  This _is_ actually a really hard thing to measure, at least in a useful way;
if you _just_ measure MTTFB, you don't understand where all that time is going, but to understand where all the time is
going, you need to correlate/connect events from _multiple_ different sources.  You need to know when your users make
requests, which you probably don't have a good way to track unless you're running some kind of service mesh.  You need
to link that time to your horizontal autoscaler response, which is looking at a bunch of aggregated data.  Then you need
to connect the HPA scaling behaviour to your cluster autoscaler response, and _finally_ you need to understand your
application performance on startup.  So that's like, five different metrics you need to track just to track one single
metric[^6]!

The good news is, with various distributed tracing infrastructure, you actually _can_ track all of this stuff and get a
good breakdown of your scaling activity.  Setting up the distributed tracing infrastructure is left as an exercise for
the reader.

## We have achieved enlightenment!  Now what???

[^1]: tldr: it's hard and people are lazy

[^2]: Like, probably, literally a minute, this is all I ever talk about in real life, people come up to me all the time
    and are like "David won't you shut up about cost and reliability already?"  Probably the only thing I talk about
    more is [layers](XXXX).

[^3]: I'm just kidding, most organizations I've worked at don't look at metrics.

[^4]: BTW, there're a bunch of interesting/related metrics in the frontend space: the "normal" one folks use there is
    ["first contentful paint"](https://web.dev/articles/fcp).  There are various modules in React/Vue/whatever
    vibe-coded Javascript-framework-of-the-week you're using that provide this metric, but these don't work for services
    that don't necessarily "paint" things---and while I've never used them, I'm reasonably certain that none of these
    front-end services have any way to measure or attribute delays in your infrastructure scaling.

[^5]: The weather app on your phone would like a word.

[^6]: And then once you've started tracking all of these metrics, your observability team is going to complain at you
    incessantly about how expensive it all is, but thems the breaks.
