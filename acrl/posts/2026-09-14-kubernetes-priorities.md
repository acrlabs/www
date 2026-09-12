---
title: "Dear Kubernetes: You need to get your priorities straight"
authors:
  - drmorr
datetime: 2026-09-14 11:00:00
template: post.html
---

<figure markdown>
  ![Comic-book style graphic that says "Dr. Morr says NO!"](/img/posts/drmorr-says-no.png)
  <figcaption>
    I spent way too much time making this image, I am extremely proud of it, and I am 100,000,000,000% turning
    this into a laptop sticker.
  </figcaption>
</figure>

> Editor's note: I've been informed that the introduction to this post is convoluted and confusing.  If you'd like, feel
> free to skip it go straight to the first subsection.

When I was in grad school, I spent a LOT of time thinking about [mixed integer programming](https://en.wikipedia.org/wiki/Linear_programming#Integer_unknowns);
in fact, my [PhD thesis](https://evokewonder.com/research/docs/dmorrison-2014-thesis.pdf) was primarily focused on
developing new techniques for solving (certain classes of) integer programs).  In short, if you're unfamiliar with this
concept, an "integer program" is just a system of equations that encodes certain "state" as variables that can only take
certain (integer) values.  The goal is to find the "best" set of assignments to those variables so as to maximize some
objective or goal.

See, the thing is, though, integer programming is hard.  Like, [really hard](https://en.wikipedia.org/wiki/P_versus_NP_problem).
Like, [as hard as a lot of other really hard problems](https://blog.computationalcomplexity.org/2025/10/ai-and-intro-theory.html).
And so when you're confronted with one of these problems, one of the things you might do is "try to make it easier".
For mixed-integer programming, one of the ways you can make things easier is called the ["Big-M
Method"](https://en.wikipedia.org/wiki/Big_M_method#Other_usage).  The idea is, "Well, OK, it's really hard to find
integer solutions to the equation \(x = y\), but maybe instead we can replace that equation with \(x - y \leq Mz\) and
\(x - y \geq Mz\) for some other variable \(z\) and some extremely large constant \(M\)".

The problem with this approach is that \(M\) has to be "big enough" so that your solver can't "cheat" and find a
solution to these equations where \(x \neq y\).  BUT, and this is the important piece for the rest of this entire post,
which I promise is relevant, the bigger you make \(M\), the harder the problem is to solve in practice, _specifically_
because \(M\) doesn’t have any meaning or relationship to the problem you’re actually trying to solve[^1].  And therein
lies the problem with Kubernetes.

## Weight, weight, don't tell me

So I'm pretty sure at least all of you are going "WTF is drmorr on about today?" and are ready to ragequit your browser.
But if you bear with me[^2] I promise I'll make it all make sense.

Let's back up.  I work on this extremely complex distributed system called "Kubernetes".  And because Kubernetes wants
to be all things for all people, there are a lot of different ways that any individual user can _configure_ Kubernetes.
And in many cases it is impossible[^3] for the authors of Kubernetes to know _how_ end users might want to configure
Kubernetes; questions like "is _this_ thing more important than _that_ thing?" might reasonably have different answers
for different people.  And whenever we run into one of those questions, instead of doing the hard work of understanding
our customers, we just do the distributed-systems equivalent of Big-M and say "Screw it, we'll just slap a priority on
that sucker and let the users decide."

Here is a (non-exhaustive) list of where I've encountered this behaviour:

- The [kube-scheduler scoring step](https://kubernetes.io/docs/reference/scheduling/config/): kube-scheduler operates on
  pods one-at-a-time[^4], and for each pod it goes through a long pipeline which first filters out nodes that the pod
  can't schedule on, and then scores the remaining nodes.  There are a lot of different tests that are run to compute
  the score of a node: things like "how many pods are already on the node", "how many resources would be left
  on the node if the pod gets scheduled there", "are there any 'soft' affinity or anti-affinity rules in play", etc.
  Now the thing is that each of these tests are weighted, and the weight controls how much the test contributes to the
  final score.  And of course, because different users might have different goals and priorities, these weights are
  user-configurable.
- The [Cluster Autoscaler priority expander](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/FAQ.md#what-are-expanders):
  Same deal as kube-scheduler, different problem.  Cluster Autoscaler needs to pick one of \(N\) different node groups
  to scale up when there are pending pods in the cluster; it first filters out the invalid ones and then selects the
  node group based on a weighted rank of the remainder.  This one’s fun because in 98% of cases, it reduces to "picking
  the first entry in a sorted list"; the _values_ of the weights are completely irrelevant.
- The [Pod Priority mechanism](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/):
  Kubernetes allows you to specify priorities on your pods themselves, so that if there isn't enough space in your
  cluster for a pending pod and it's a higher priority than another (currently running) pod, the lower-priority pod will
  get evicted and the higher-priority pod can then take up the newly-freed slot[^5].  This one's particularly fun
  because setting pod priorities can have unintended knock-on effects to your pod's QoS class.
- [Pod Deletion Cost annotations](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/#pod-deletion-cost):
  If you didn't want just _one_ way of setting pod priorities, don't worry, here's another!  You can set the
  `controller.kubernetes.io/pod-deletion-cost` annotation on your pods to tell Kubernetes, hey, when my ReplicaSet
  scales down, delete the pods with lower deletion cost before the ones with higher deletion cost!  As a fun bonus,
  [Karpenter's balanced](https://github.com/kubernetes-sigs/karpenter/blob/main/designs/balanced-consolidation.md#separate-disruption-cost-annotation)
  consolidation mode also now relies on this annotation to determine the cost of consolidating a node.

I'm sure there are others, but these are ones that I've personally interacted with (and been bitten by) in the past.
The problem in each of these cases is the same as the Big-M problem in integer programming: these numeric weights a)
have no meaning except that which is assigned by the users of the system, b) changing the value of the weights can have
unintended consequences in distant parts of the system, and c) the temptation is to make these weight values really,
really large to signal "Hey this thing is REALLY IMPORTANT, don't touch it", and bigger numbers = bigger problems.

Let's look at a couple of examples.

## Example 1: kube-scheduler node scoring

The first example of how this can bite you is in kube-scheduler; here, the weights are being applied to the different
tests that kube-scheduler executes as part of node scoring.  Let's imagine that there are five different such tests.
For our purposes, a test \(T_i\) is a real-valued function that takes some arbitrary inputs about the state of the
cluster and the node under consideration; in other words, in math-y lingo, \(T_i: \mathcal{K} \times n \to \mathbb{R}\).

Each test is then given a user-specified weight \(w_i \in \mathbb{R}\), and the score for a particular node in the
cluster is calculated as the weighted sum of the tests evaluated for that node.  Moreover, the selected node is the one
that maximizes this weighted sum:

\[
    \max_n w_1 T_1(\mathcal{K}, n) +
    w_2 T_2(\mathcal{K}, n) +
    w_3 T_3(\mathcal{K}, n) + \\
    w_4 T_4(\mathcal{K}, n) +
    w_5 T_5(\mathcal{K}, n)
\]

Now, let's suppose as the administrator of the cluster, you want to ensure that pods always get scheduled on cheaper
nodes before they get scheduled on more expensive nodes[^6].  Let's say that \(T_5\) returns the cost of the node, so
you set \(w_5\) to the largest negative number you can think of, say, -100.  Then you go about your day, and all of a
sudden you get paged because some pod got scheduled to an expensive node before a cheap node!  What!  How can this be???

Well, in this example, you didn't care about any of the other tests, so you just left \(w_1,...,w_4 = 1\).  Each of the
other tests \(T_1,...,T_4\) returns the value 300, and since the expensive node of course [costs $10](https://www.youtube.com/watch?v=KEjFjpHKi2M&list=PLOgtqKaB5McAOIyl18Gwh7Ks9CUWYxWwQ&index=4),
the final node score is 200.  Turns out that for all the other (cheaper) nodes, the other tests returned 1, so the
weighted sum for those nodes was -96.

"Well, ok, that can't be right," I hear you say from all the way over here.  "Lemme just adjust some of those other
weights real quick!"  And bam!  You have just entered the 12th circle of hell without even realizing it.

## Example 2: pod deletion cost and balanced consolidation

In the previous example, there is a single hypothetical user that is controlling all of the numeric weights.  So even
though the weights don't have any semantic meaning to the system, there is a single user that can assign some semantic
meaning to their choices.  This second example is more insidious, because it involves multiple users with competing
incentives getting to pick the weights.

In Karpenter 1.14, the [Balanced Consolidation](https://karpenter.sh/docs/concepts/disruption/#balanced-consolidation)
disruption mode was introduced.  The high-level idea here is that Karpenter shouldn't disrupt nodes where the benefits
don't outweigh the drawbacks.  Since Karpenter's whole shtick is "save money", the authors used "the amount you would
save by disrupting the node" for the "benefit" side of that equation.  On the "drawbacks" side of the equation is "how
much disruption does this cause", and the entire calculation boils down to comparing the "benefits / disruption" ratio
[to 2](https://github.com/kubernetes-sigs/karpenter/blob/main/designs/balanced-consolidation.md#why-k2).

The problem is that the "disruption" part of this ratio is (essentially) just a weighted sum of the pods on the node,
and the _owners of the pods_ (who may or may not be on the same team, and who may or may not have an antagonistic
relationship towards each other) get to set those weights, via the `pod-deletion-cost` annotation.  So if engineers on
one team see their pods getting frequently disrupted by Karpenter, they're going to increase the weight of those pods so
that some other team of losers gets _their_ pods disrupted instead.  And then that other team is going to play a
tit-for-tat game until both teams have set their deletion costs to `INT_MAX` and are furious with each other, and
congratulations, you're back in the 12th circle of hell[^7].

## Who could have foreseen this?

I'd like to argue in this post that the underlying cause of all these problems (including the Big-M problem at the
beginning of the post) boils down to two factors:

1. Allowing (essentially) unbounded range on your weights
2. Using unit-less values for your weights

The first problem is somewhat obvious: allowing big numbers means there is always the temptation to just say "well THIS
thing is really important, so lemme 10x the weight!"  And then later on when the math fails you, you go and 10x some
_other_ really important thing, and the cycle continues ad infinitum.

The second problem I think is more fundamental.  You're trying to compare _fundamentally incomparable things_ by
assigning them numeric weights.  You, as the external operator, give those weights some semantic meaning, but math
doesn't know what that semantic meaning is: all math sees is numbers, and numbers are easy to compare[^8]!  The "right"
answer here is "don't compare incomparable things" but I admit that isn't always practical, so my second-place
recommendation is to always make sure the things you're comparing have units.  As we all learned in physics class,
unitless numbers are bad.

For example, in the Karpenter balanced consolidation case, an arguably "better" notion of disruption might be something
like "time needed to get all the pods on the node back to `Running`".  Then you can consider the ratio of "dollars saved
/ time spent rescheduling", and that lets you start to semantically-encode some of your external priorities into your
policy engine.  It might be fine to spend 2 minutes rescheduling all the pods if you're going to save $100, but if
you're only going to save 50 cent, it might not be worth it[^9].

My last suggestion here is, if you _do_ have to make up some unitless integer weights, consider dramatically
constraining the range of values those weights can take on.  Nobody can reason about the difference between something
with weight 147938964 and 147938965, but people can actually think about the difference between, say, 1 and 3.  And as a
corollary to this, if you find that you only need a few weight values, maybe see if you can get that number down to two,
because then you can replace it with a boolean: I claim that nobody ever needs to set a pod deletion cost in
[-2147483648, 2147483647].  All anybody ever _actually_ cares about is "delete these pods first, then delete those
ones", which is just two states.

In closing, just remember, kids: the next time you think about adding in a user-configurable integer weight value to
your distributed system (or your integer program), "Dr. Morr says NO!"

As always, thanks for reading.

~drmorr

[^1]: And also in part because large values of \(M\) start to introduce all kinds of floating-point errors in your
    calculations.

[^2]: [https://strikerless.com/wp-content/uploads/2016/07/bear-with-me.jpg](https://strikerless.com/wp-content/uploads/2016/07/bear-with-me.jpg)

[^3]: Or at least, it's really hard and everybody is lazy.

[^4]: More-or-less

[^5]: By the way, this is how people typically configure "warm pools" in Kubernetes: use something like the [cluster
    proportional autoscaler](https://github.com/kubernetes-sigs/cluster-proportional-autoscaler) to schedule a bunch of
    "do-nothing" pods with extremely low priority.  When higher-priority workloads come in, they can evict the
    do-nothing pods and start doing work immediately.  The do-nothing pods then will trigger your node autoscaler to
    scale up and refill your warm pool.

[^6]: This isn't a real Kubernetes scheduler priority, but it _could_ be, and it's useful for illustrative purposes.

[^7]: As a fun aside, you've _also_ entered the NaN'th circle of hell, because the Karpenter balanced mode computation
    does a bunch of numeric divisions, and big numbers are murder on floating point calculations.

[^8]: [Citation needed]

[^9]: Although he does make some pretty good rap.
