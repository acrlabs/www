---
title: NSDI Recap, Part 2 - Load Balancing and Autoscaling
authors:
  - drmorr
datetime: 2024-06-03 11:00:00
template: post.html
---

<figure markdown>
  !["Is this a pigeon" meme with drmorr asking if a load balancer is an autoscaler](/img/posts/autoscaler.jpg)
  <figcaption>This is one of my favorite meme templates of all time.</figcaption>
</figure>

Howdy, friends!  Hope you all had a good Memorial Day weekend (if you're in the US).  In today's post, I'm picking up
where I left off to talk about more papers from [NSDI '24](https://www.usenix.org/conference/nsdi24)[^1].  The paper I'm
going to cover today is about [load balancing](https://en.wikipedia.org/wiki/Load_balancing_(computing)), but in a
strange and unexpected twist I'm going to bring that back around to something I actually care about, which is
autoscaling.  Let's dive in!

## Load is not what you should balance: Introducing Prequal

**Authors**: Bartek Wydrowski, Google Research; Robert Kleinberg, Google Research and Cornell; Stephen M. Rumble, Google
(YouTube); Aaron Archer, Google Research

[**Link to the paper**](https://www.usenix.org/system/files/nsdi24-wydrowski.pdf)

Similarly to the paper in [my last post](2024-05-20-nsdi-recap-part-1.md), the title of this paper grabbed me; I've
spent a lot of time thinking about "how you measure when a service is overloaded", and how CPU utilization is a bad
metric for this[^2], so I was curious to know why "load" isn't a good thing to balance either.

Turns out, they were actually saying the same thing: don't use CPU utilization to do load balancing.  They give an
example in the paper showing why this is the case, but in effect it boils down to: CPU utilization is a trailing
indicator, and it has to be averaged over some period of time to be meaningful, so the delay between "when a server
starts getting overloaded" and "when we stop sending requests to it" is significant.  This has a noticeable impact on
your [tail latency](https://en.wikipedia.org/wiki/Software_fault_tolerance), which in turn translates to a noticeable
impact on your end users.

So what should you use instead of CPU utilization?  In this paper, the authors propose Probing to Reduce Queuing and
Latency (Prequal), which is a new load-balancing policy based on the [power-of-d-choices](https://www.f5.com/company/blog/nginx/nginx-power-of-two-choices-load-balancing-algorithm)
algorithm.  The core idea here is to sample some subset of replicas for your application, and then send the next request
to the "best" one.  As the authors point out in the introduction of the paper, the two questions to answer in this
algorithm are 1) "How do you sample?" and 2) "What does 'best' mean?"

I'm going to skip to the punchline and give the paper's answer to these two questions: to determine the machines to
sample, the Prequal algorithm maintains a pool of at most 16 replicas per client; clients update their pools whenever a
new request comes in, or at a periodic frequency if no requests have arrived recently.  The clients then pick a replica
to send the request to from this pool, based on two metrics: the replica's current requests-in-flight (RIF; a simple
counter measuring the number of requests the client has received but hasn't finished processing) and the replica's
recent latency.  Unlike CPU utilization, RIF is both a) instantaneous to calculate, and b) often correlated with future
load, which means that it's a good leading indicator instead of a trailing indicator.  The second metric, recent
latency, is more similar to CPU utilization in that it's a trailing indicator, but it is still "relatively"
instantaneous: Prequal simply looks at the most recent latency numbers and takes the median.

Instead of taking a simple linear combination of these metrics to select the "best", Prequal instead maintains a set of
"hot" and "cold" replicas within the pool, based on the replicas' current RIF -- if the replica is handling a large
number of requests, it is "hot", and otherwise it is cold.  Then, if all the replicas in the pool are hot, Prequal
selects the one with the fewest requests in flight; otherwise, it picks the cold replica with the lowest latency
numbers.

The authors do quite a bit of evaluation work (they implemented this at Google for YouTube, and demonstrate that it has
a noticeable and significant impact in reducing tail latencies and improving end user experience), but I'm going to skip
most of that and redirect you to the paper for details.  Instead, I'm going to spend the rest of this blog post talking
about me[^3].

## Load balancing and autoscaling: are they the same thing?

While I was in the presentation for this paper, I dashed off a random, half-formed thought to [Mastodon](https://hachyderm.io/@drmorr/112289474170277160):

> This is maybe out of left field, but we've "known" for a while that services shouldn't autoscale based on CPU
> utilization, but instead you should scale based on request rate or some other metric that is more applicable to the
> thing you care about.  In this talk, we learned that the same is true of load balancing.
>
> Is there some deeper connection between autoscaling and load balancing that we could explore?

I didn't really think anything of it, but ended up getting quite a few responses, my favorite of which was [from Thomas
Depierre](https://hachyderm.io/@Di4na/112290781460704636):

> @drmorr i mean it is fundamentally a scheduling/binpacking/optimisation problem with feedback loops.

Awwww, I feel seen!  Thanks, Thomas.  But also, Thomas is right on.  In Kubernetes, for example, we've got (at least)
two feedback loops in play here: the [Horizontal Pod Autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
(HPA) controls the number of active replicas for an application, based on user-configurable metric signals; often this
is just CPU utilization, but you can also wire it up to your service mesh to scale based on requests-in-flight or
latency (or, as I just spent a bunch of time doing, you can configure it to scale on multiple different metrics sources
at once).  Then, somewhere else in Kubernetes, you have a load balancer sitting in front of your service; maybe you're
using Kubernetes [Service objects](https://kubernetes.io/docs/concepts/services-networking/service/) or an external
physical load balancer, or maybe you have a service mesh like [Envoy](https://www.envoyproxy.io) or
[Linkerd](https://linkerd.io) set up.

But, in classic Kubernetes fashion, the HPA and your load balancer don't talk to each other, meaning that there is an
implicit feedback loop between the components that suddenly gets very hard to reason about.  So, in the running theme
for this blog, I have been pondering the question, "What if we got rid of some of the layers?"[^4]  Here we've got two
systems trying to solve the same problem ("How can we keep this application from getting overloaded?") using the same
metrics in different ways.  But what if, instead, these two components were just the same component?

This is a little bit tricky from the Prequal perspective, because each client is maintaining its own independent view of
reality, and clients don't really have the ability to say "Hey, I've, like, got this request, like yea, and I don't
really, like, want to send it to any of your replicas, maybe you should, like, scale up or something?[^5]"  But in
Kubernetes-land, it would be totally doable to merge the HPA (or [KEDA](https://keda.sh), if you're so inclined) with
your load balancer, and then you could make real-time decisions about scaling as you're observing requests coming in and
out.

Would that actually solve anything?  I mean, who knows, this is all just a half-baked idea I came up with while I was in
a conference haze, so someone would have to, like, test it out or something.  But that's a lot harder than just throwing
ideas out into the void.

Actually, Dan Ciruli, one of the Istio steering committee members [responded](https://hachyderm.io/@danciruli) to my
Mastodon post as well:

> @drmorr Very, very early on in the life of Istio we talked about this as a "killer use case" -- monitoring latency and
> using HPA to scale if it hit a certain threshold. Not sure if anyone ever built a POC (which would be pretty easy) or
> tried to do it in production (which would require solving a bunch of issues).

So it sounds like at least someone else has had this same idea!  Would love to know if anybody has actually tried it
out, and whether it solves any problems.  For now, though, we'll just have to wonder.

Thanks for reading!

~drmorr

[^1]: As an aside the further away from the conference we get the less I remember about what I wanted to talk about.
    So... not really sure how many more of these I'll do.

[^2]: See also: the [KEDA talks](2024-04-29-spring-conference-season-part-1.md) from KubeCon this year.

[^3]: That's why you read this blog, isn't it???

[^4]: Drink!

[^5]: This is what we call VGRPC, aka valley girl remote process communication.
