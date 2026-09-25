---
title: "Capacity Utilization: of what?"
authors:
  - ian
datetime: 2026-09-28 11:00:00
template: post.html
---

At ACRL, we get to talk to a lot of clusters... I mean people. Many of those people manage clusters at scale, which
we don't recommend, but we all have our burdens. In conversations with these individuals, who will remain nameless
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

In the lead-in to this series, drmorr teased the five key metrics for evaluating autoscalers. We're starting off
with committed capacity percentage: a cost-oriented metric that reveals how much of our provisioned capacity we've
committed to workloads.

"Cluster Utilization" sounds like a straightforward efficiency metric. Unfortunately, as an industry, we are pretty
abstract about what utilization is, how we calculate it. If you google cluster utilization, you will get a terrible AI
overview, followed by an ad, followed by a fistful of different definitions, including the following:

| Metric | Calculation | Question answered |
| --- | --- | --- |
| Request Efficiency | usage / requests | How much of the requested capacity is being used? |
| Allocatable Utilization | usage / allocatable | How much capacity available to Pods is being used? |
| Scheduler Saturation | requests / allocatable | How much capacity available to Pods has been requested? |
| Committed Capacity | requests / provisioned | How much total provisioned capacity has been requested? |

These are all perfectly valid calculations, but they all measure different things. When someone says "Our utilization is
57.62%". I still have to ask "Of what?"

For our five metrics for evaluating autoscalers our interest in utilization is as an inverse proxy for waste. For a
comparable workload, a higher utilization metric should indicate we are provisioning less excess capacity. It does not
prove that those uncommitted resources are removable or that all the requests are necessary. We'll get to that in a
moment.

## Show me the money

I'm going to spoil this right out of the gate. If we had to choose just one metric for the cost component of our five
metrics for evaluating autoscalers, it would be Committed Capacity Percentage. Well... sort of.

\[
    \text{Committed Capacity Percentage}
    =
    \frac{\text{Total scheduled Pod requests}}
         {\text{Total provisioned node capacity}}
    \times 100
\]

Calculated it separately for CPU and memory. Here, "requests" means the resource requests of non-terminated pods on the
nodes we are measuring. Include both application pods and platform pods (including DaemonSets). Unscheduled Pods
represent unmet demand rather than commitments against the current nodes and should be tracked separately.

Why this ratio? We love money, dude.

We're paying somebody good money to provision Nodes. Any capacity above what is required to support our workload is a
cost worth investigating. The numerator tells us how much capacity workloads have claimed. Our denominator shows the
full node capacity.

A useful comparison is fairly straightforward: can one autoscaler accommodate the same workloads, with similar
reliability, with less provisioned capacity?

## Waste REVEAL thyself

Before we start hunting down waste, we need to understand where that capacity went. Total provisioned capacity is not
all available to Pods. First, we have to reduce our provisioned capacity by host reservations and eviction headroom
giving us our allocatable capacity. Pod requests can claim up to all the remaining allocatable capacity.

It's important to note that `kubeReserved` and `systemReserved` belong to different class of reservation and are not
included in pod requests (our numerator). Requests from DaemonSets, however are pod requests and are included numerator.
If we were to use allocatable capacity as the divisor we would lose visibility of the overhead inherent in
`kubeReserved` and `systemReserved`. Some of this overhead is 100% necessary.

The capacity of a node has two primary dimensions CPU and Memory. How the scheduler fits workloads onto nodes is called
bin packing and since we have two dimensions we actually have a 2D bin packing problem. Bin packing is a fascinating,
complex domain, however, it is quite easy to visualize potential excess capacity with a conceptual diagram.

<figure markdown>
  ![""](/img/posts/2d-bin-packing.png)
  <figcaption>2d bin packing example.</figcaption>
</figure>

Bin packing is just one place inefficiencies can appear, other sources of excess capacity may include slow or
inefficient scale-down, node/pod shape misalignment, and stranded resources due to scheduling constraints. When these
cause additional resources to be provisioned for the same requests, committed capacity falls. Committed Capacity
percentage can show us that one or more of these symptoms are present but it will not identify the cause.

We also can't tell from this metric alone that that excess capacity is waste. Some headroom is necessary for a
well-functioning cluster; it aids in faster scheduling and overall resilience. That's why the goal is not 100% committed
capacity percentage. An organization might
have a lower provisioned capacity because of a valid reliability concern, which is also why this is just one of our five
metrics. That all sounds great, right?

Wait a second. Some of our allocatable capacity is claimed by DaemonSet replicas on each of our nodes. If we increased
our node count while keeping total provisioned CPU and Memory unchanged (more smaller nodes) our DaemonSet replica
count would rise and committed capacity percentage would also rise. That seems like the opposite of what we want in a
metric for evaluating autoscalers. We would prefer a measure that decreases as overhead increases. Additionally,
our output metric (the numerator) should be as closely aligned with the actual application workloads the platform is
oriented around serving to customers (you have those right?).

With that said we are pleased to announce Workload Commitment Percentage a modified committed capacity metric which
closes this loophole and is more closely aligned with the actual business objective of your clusters.

\[
    \text{Workload Commitment Percentage}
    =
    \frac{\text{Total scheduled Pod requests} - \text{DaemonSet Pod requests}}
         {\text{Total provisioned node capacity}}
    \times 100
\]

By keeping the denominator as our total provisioned capacity we still have the broadest possible cost basis for our
metric. We exclude DaemonSets from the denominator so as DaemonSet overhead rises our Workload Committment will fall.

<figure markdown>
  ![""](/img/posts/where-does-all-the-capacity-go.png)
  <figcaption>Breakdown of provisioned capacity.</figcaption>
</figure>

## Point of order: Ian, are you stupid?

### Why not requests / allocatable?

What we are calling Scheduler Saturation helps us understand how much of the schedulable budget is claimed. For our
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
which is not what we actually pay for. A useful metric for answering a different question.

### Why not usage / provisioned?

Measuring usage to the full provisioned budget can help evaluate our overall infrastructure efficiency. We choose
requests because we're interested in how efficiently the autoscaler accommodates the resource demands of the cluster.
Whether that demand is appropriately sized is another question that is absolutely worth asking.

## Let me break this for you

Great, we have a metric. Let's game it.

If we simply traversed our cluster and increased the requests on our application pods, we could improve our Workload
Commitment without doing anything useful like, I dunno, reducing total cloud costs.

Larger requests also reduce the placement options for pods and make node consolidation harder for node autoscalers. If
the changes produce more nodes costs could increase.

There are other ways this percentage can mislead us:

- A cluster-wide average can hide resources stranded on specific nodes. You can't take CPU from one node and supply it
to a pod on another node.
- An autoscaler could leave unsatisfied demand and earn a good score by keeping its existing nodes full. So we would see
a high workload commitment percentage but many pods awaiting capacity.
- A higher percentage on expensive nodes could cost more than a lower percentage on cheaper nodes. CPU and memory
percentages are not denominated in dollars.

For autoscalers to reduce spend they must make or induce changes at the node level: fewer nodes, cheaper instance
types, or both. Other pricing changes can reduce spending too, but workload commitment doesn't measure them.

Use this metric to compare provisioning under comparable workload and reliability requirements. Don't treat it as proof
of savings or a ranking system for otherwise unrelated clusters.

## Why track it anyway?

Maybe you are thinking, "Well, Workload Commitment is imperfect maybe we shouldn't worry about tracking it at all." This
is a useful signal that is cheap to calculate. You can get all the request data easily from Kubernetes' native metric
sources. Workload Commitment is a great frontline metric and provides a good indicator of avoidable cluster costs.

## Conclusion

Workload Commitment Percentage is our first look at the cost side of evaluating autoscalers. It tells us how much
provisioned capacity has been claimed through requests for non-DaemonSet workloads. It can't tell us if the requested
amounts are sensible, if excess capacity is justified, or whether our applications received the capacity they needed
quickly enough. That's why we have four more metrics on the way.

Thanks for reading the ACRL blog. Be sure to subscribe to catch the rest of the series!

Cheers,

Ian
