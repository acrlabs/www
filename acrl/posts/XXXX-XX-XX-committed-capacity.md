---
title: "Committed Capacity: Utilization of what?"
authors:
  - ian
datetime: 2026-09-28 11:00:00
template: post.html
---

At ACRL, we get to talk to a lot of clusters... I mean people. Many of those people manage clusters at scale, which
we don't recommend, but we all have our own burdens. In conversations with these individuals, who will remain nameless
to protect the guilty, we often hear something like, "at made-up-for-this-fake-example Corp., we're only utilizing 63.2%
of our capacity".

And to that I want to say: "What do you even mean, bro?"

I'm a bit of a student of economics, by which I mean I lost a lot of money in crypto scams and now I have to do this to
survive. But I once had an economics professor who would respond whenever you mentioned a rate like productivity,
efficiency, or utilization with a simple question: "Of what?" This was a polite way of saying: "Tell me the damn
numerator and denominator, and do it right now."

Specificity matters, and at scale, it matters a hell of a lot. Today, lets give ourselves permission to be a bit
pedantic because we can't afford not to.

## A cluster (under)utilized

In the lead-in to this series, drmorr introduced the five key metrics for evaluating autoscalers. We're starting off
with committed capacity percentage: a cost-oriented metric that reveals how much of our provisioned capacity we've
committed to workloads.

"Cluster Utilization" sounds like a straightforward efficiency metric. Unfortunately, as an industry, we are pretty
abstract about what utilization is, how we calculate it. If you google cluster utilization, you will get a terrible AI
overview, followed by an ad, followed by a fistful of different definitions, including the following:

- Request Efficiency = usage / requests -- How much of the requested capacity is being used?
- Allocatable Utilization = usage / allocatable -- How much capacity available to Pods is being used?
- Scheduler Saturation = requests / allocatable -- How much capacity available to Pods has been requested?
- Committed Capacity = requests / provisioned -- How much total provisioned capacity has been requested?

These are all perfectly valid calculations, but they all measure different things. When someone says "Our utilization is
57.62%". I still have to ask "Of what?"

Our interest here is an inverse proxy for waste. For a comparable workload, higher committed capacity indicates we are
provisioning less excess capacity. It does not prove that those uncommitted resources are removable or that all the
requests are necessary. We'll get to that in a moment.

## Show me the money

I'm going to spoil this right out of the gate. If we had to choose just one metric for the cost component of our five
metrics for evaluating autoscalers, it would be Committed Capacity Percentage.

Committed Capacity Percentage = total scheduled Pod requests / total provisioned node capacity × 100

Calculate it separately for CPU and memory. Here, "requests" means the resource requests of non-terminated pods on the
nodes we are measuring. Include both application pods and platform pods (including DaemonSets). Unscheduled Pods
represent unmet demand rather than commitments against the current nodes and should be tracked separately.

Why this ratio? We love money, dude.

We're paying somebody good money to provision Nodes. Any capacity above what is required to support our workload is a
cost worth investigating. The numerator tells us how much capacity workloads have claimed. Our denominator shows the
full node capacity.

A useful comparison is fairly straightforward: can one autoscaler accommodate the same workloads, with similar
reliability, with less provisioned capacity?

<figure markdown>
  ![""](/img/posts/autoscaler_3_vs_4_node.png)
  <figcaption>Both clusters accommodate the same workload requests. Using three identical nodes instead of four
  increases commitment and reduces node cost by 25% over the same period, assuming the same per-node rate. Simplified
  example.</figcaption>
</figure>

For example, 8 CPU and 36 GiB of requests on four 4-CPU, 16-GiB nodes gives us 50% CPU commitment and ~56% memory
commitment. Fit those same requests onto three nodes, and the numbers become approximately 67% and 75%.

The resource requests for our application pods didn't change. The capacity we needed to provision decreased. Now that's
the kind of savings I can get behind!

## Waste REVEAL thyself

Before we start hunting down waste, we need to understand where that capacity went. Total provision capacity is not all
available to Pods. First, we have to reduce our provisioned capacity by host reservations and eviction headroom giving
us our allocatable capacity. Pod requests can claim up to all the remaining allocatable capacity.

It's important to note that `kubeReserved` and `systemReserved` belong to different class of reservation and are not
included in pod requests (our numerator). Requests from DaemonSets, however are pod requests and are included numerator.
We think that's important because if we were to use allocatable capacity as the divisor we would lose visibility of the
overhead inherent in `kubeReserved` and `systemReserved`. Some of this overhead is 100% necessary, of course.

<figure markdown>
  ![""](/img/posts/where_did_capacity_go.png)
  <figcaption>Breakdown of provisioned capacity.</figcaption>
</figure>

Other sources of excess capacity may include slow or inefficient scale-down, poor bin-packing, node/pod shape
misalignment, and stranded resources due to scheduling constraints. When these cause additional resources to be
provisioned for the same requests, committed capacity falls. Committed Capacity percentage can notify us that one or
more of these symptoms are present but it will not identify the cause.

We also can't tell from this metric alone that that excess capacity is waste. Some headroom is necessary for a
well-functioning cluster; it aids in faster scheduling and resilience. That's why the goal is never 100% committed
capacity Percentage. An organization might
have a lower Committed Capacity because of a valid reliability concern, which is also why this is just one of our five
metrics.

## Point of order: Why not X?

### Why not requests / allocatable?

What we are call Scheduler Saturation helps us understand how much of the schedulable budget is claimed. For our
cost-oriented comparison, we want the full provisioned resource budget in the denominator. Necessary host reservations
still occupy capacity on the nodes we are paying for.

### Why not usage / requests?

Request efficiency helps us determine how closely requests match observed consumption. It can expose oversized requests,
which are worth investigating. But it can't see an empty node. Add an idle node without changing the Pods, their
requests, or their usage, and this ratio stays exactly the same, but our bill won't. Additionally, requests are not
limits, so usage over 100% of requests is possible and a value below 100% isn't necessarily waste.

### Why not usage / allocatable?

Allocatable Utilization tells us how busy the capacity available to Pods is. This is a helpful metric for investigating
resource pressure.

For evaluating node autoscaling, this leaves something to be desired. The denominator is only our allocatable capacity,
which is not what we actually pay for. It is a useful metric for answering a different question.

### Why not usage / provisioned?

Measuring usage to the full provisioned budget can help evaluate our overall infrastructure efficiency. We choose
requests because we're interested in how efficiently the autoscaler accommodates the resource demands of the cluster.
Whether that demand is appropriately sized is another question that is absolutely worth asking.

## Let me break this for you

Great, we have a metric. Let's game it.

If we simply traversed our cluster and increased the requests on our application pods, we could improve our Committed
Capacity without doing anything useful like reducing our costs. We can
also inflate DaemonSet requests to accomplish the same trick.

Larger requests also reduce the placement options for pods and make node consolidation harder. If the changes require
more nodes, even the apparent "improvement" could disappear and costs could increase.

There are other ways this percentage can mislead us:

- A cluster-wide average can hide resources stranded on specific nodes. You can't take CPU from one node and supply it
to a pod on another node.
- An autoscaler could leave unsatisfied demand and earn a good score by keeping its existing nodes full. So we would see
a high percentage but many pods awaiting capacity.
- A higher percentage on expensive nodes could cost more than a lower percentage on cheaper nodes. CPU and memory
percentages are not denominated in dollars.

For node autoscalers to reduce node spend they must make a change at the node level: fewer nodes, cheaper instance
types, or both. Other pricing changes can reduce spending too, but committed capacity doesn't measure them.

Use this metric to compare provisioning under comparable workload and reliability requirements. Don't treat it as proof
of savings or a ranking system for otherwise unrelated clusters.

## Why track it anyway?

Maybe you are thinking, "Well, Committed Capacity is imperfect maybe we shouldn't worry about tracking it at all." This
is a useful signal that is cheap to calculate. You can get all the request data easily from Kubernetes' native metric
sources. Committed Capacity is a great frontline metric and provides a good indication of avoidable cluster costs.

## Conclusion

Committed Capacity percentage is our first look at the cost side of evaluating autoscalers. It tells us how much
provisioned capacity has been claimed through requests. It can't tell us if the requested amounts are sensible, if
excess capacity is justified, or whether our applications received the capacity they needed quickly enough. That's why
we have four more metrics on the way.

Thanks for reading the ACRL blog. Be sure to subscribe to catch the rest of the series!

Cheers,

Ian
