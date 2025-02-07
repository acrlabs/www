---
title: What's next for SimKube?
authors:
  - drmorr
datetime: 2024-10-21 11:00:00
template: post.html
---

<figure markdown>
</figure>

It's been a couple weeks since I've posted my [first SimKube results](./2024-09-09-simkube-kca-karpenter-part-1.md), and
I've gotten a lot of good engagement and feedback from the posts.  There are two fairly common questions that I get
after someone finishes reading the series, so I thought it would be good to take some time to address those, and also to
share a little bit about my future plans for the project.

Before we jump into the questions, just a quick announcement/update before we dive in: I'm going to be at KubeCon in
Salt Lake City in a few weeks, and would love to connect with anybody there who wants to chat!  I'm giving two talks:
one is at the [Cloud Native Rejekts](https://cloud-native.rejekts.io) "pre-conference", entitled ["Karpenter and Cluster
Autoscaler: A data-driven comparison"](https://cfp.cloud-native.rejekts.io/cloud-native-rejekts-na-salt-lake-city-2024/talk/CZ9VGR/),
 and the second is at KubeCon itself, entitled ["What if Kubernetes was a compiler target?"](https://kccncna2024.sched.com/event/1i7pc/what-if-kubernetes-was-a-compiler-target-david-morrison-applied-computing-research-labs-tim-goodwin-uc-santa-cruz)[^1].
I'm also expecting to spend quite a bit of time in the hallway track this year, so come find me!  I'll have a cool
t-shirt, and if I get my act together in time, maybe even some SimKube stickers!

But anyways let's get back to our regularly scheduled content:

## How the &$@) do I use SimKube anyways?

This is probably the most common question I've gotten after my blog series: I've had quite a few folks come in, try to
get a simple version of SimKube working, and fail.  Despite the fact that SimKube is "1.0" now[^2], and I've put a bunch
of work into making it _easier_ to use, it's still not _easy_ to use.  Even something simple like "take the trace file
I used in my blog series and replay it" requires a bunch of manual setup: you have to have a cluster, you have to figure
out how to get all the SimKube pods on there, and there's not a ton of guidance if things are going wrong.  This is
obviously a problem: if people can't get even a simple, basic version of SimKube working, they're never going to see the
value of doing all the setup in a real environment.

So fixing that is priority #1 for me: in the next few weeks (hopefully before KubeCon) I want to have a simple,
one-click "environment" that you can provide a trace file to and see a simulation working.  A couple of my [clinic
students](./2024-08-26-kubernetes-graph.md) are taking a first pass at this, which I'm pretty stoked about.  Watch this
space for more details!

## What can SimKube actually simulate?

The second most common question I've gotten from folks is some variation of "but what does it do?"  Other common
iterations of this question include "So, is this thing just for scheduling and autoscaling?" or "What events does it
monitor?" or "Can it simulate ConfigMaps or Volumes, or just Pods?"

I think this question comes because I haven't done a great job in the documentation or tutorials about explaining what,
exactly, it means when "there are no actual pods running in the simulation."  I'm going to try to explain a bit about
that now, and will (hopefully this week) port some of this content over to the [official docs](https://appliedcomputing.io/simkube)
as well.

So as you may recall, SimKube is based on [KWOK](https://kwok.sigs.k8s.io).  KWOK is a Kubernetes controller that
watches for Kubernetes Nodes and Pods, and performs updates on those Nodes and Pods.  I am deliberately capitalizing
"Node" and "Pod" here because I want to distinguish between the "Kubernetes object" and the actual physical resource or
application.  A Kubernetes Node is just a bunch of YAML that gets persisted into [etcd](https://etcd.io).  It has
literally no relation to any piece of physical hardware anywhere in the world.  Seriously!  You can go create a new node
in your Kubernetes cluster right now!  Just `kubectl apply` this YAML file:

```yaml
---
apiVersion: v1
kind: Node
metadata:
  annotations:
    im-fake: hahaha
  name: totally-not-a-fake-node
```

It will work just fine; you can run `kubectl get nodes` and it will dutifully report the Node exists, but there is
definitely no physical hardware that can run any containers backing that Node.

The same is true of Pods.  A Kubernetes Pod is just some YAML that gets persisted to etcd.  It does not (have to)
correspond to any containers running on any host anywhere in the system.  It's just YAML.

So what KWOK does is, it watches for Kubernetes Nodes and Pods, and it updates the YAML that's been stored in etcd to
make it _look like_ the Nodes and Pods are real, even though they're not.  There is no code running anywhere, and there
is no physical hardware.  This clearly puts some limits on what you can simulate with SimKube: the most natural
application is scheduling and autoscaling.  As I've shown, you can pretty easily[^3] simulate both of these aspects of
your cluster with SimKube, but even here there's a catch: if your autoscaling relies on metrics about what's happening
_inside the (running) pod_, SimKube can't simulate it, because there's no running pod.  This means that simulations
about the [Horizontal Pod Autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
(for example) don't work.

This is kindof a bummer, because in some ways understanding pod-level scaling is way more interesting than understanding
cluster-level scaling.  Fortunately, I don't think all hope is lost here.  My next big "feature release" for SimKube
is going to focus on being able to simulate this type of behaviour.  The thing is, that HPA (and similar systems) aren't
_actually_ SSH'ing into the node and looking at resource utilization for every container in the cluster; they're instead
relying on external metrics (like [Prometheus](https://prometheus.io/docs/introduction/overview/)) to collect and
aggregate those metrics into a centralized location[^4].  So, for SimKube, "all" we have to do is feed fake metrics into
that source.  It requires a little bit of work, but it's not impossible.

We can also think about how ConfigMaps, Secrets, and Volumes work.  The first two are easy: they're just plain old data,
so all KWOK has to do is say "yes your pod is running and the configmap mounted successfully"---this assumes, of course,
that the ConfigMap or Secret was present in the trace file.  For ConfigMaps, this might be fine[^5], but even if the
Secret's data is encrypted in the trace file (which it is, SimKube isn't doing any decryption of anything), you still
probably don't want the Secret stored in places it doesn't need to be.  Volumes are actually even more complicated: if
the Pod is requesting a [Persistent Volume](https://kubernetes.io/docs/concepts/storage/persistent-volumes/), the Pod
creation will fail if the PV doesn't exist, and the PV won't exist because it has to be backed by, you know, a real
volume.  So how can SimKube handle cases like this?

Well, the answer is, it probably depends.  In some cases, you may not care about the presence or absence of these types
of "dependent" resources, and you can just cut them out of the PodSpec entirely.  In other cases, you may want them
around (maybe you're troubleshooting an incident where pods were failing to start because of some misconfiguration
here).  Unfortunately, "it depends" isn't very useful when you need to actually run your simulation.  So I've been
working on a new "validation" feature for SimKube that will take your trace file and look for potential problems (like
missing ConfigMaps) and then present you with a variety of options for what to do about it.  The goal is that this can
get all wrapped up behind a new user interface[^6] that I can eventually extend to do very complex and arbitrary
modifications to trace files before you submit them for simulation.

The last (and hardest) thing you might want to simulate with SimKube is "actual network requests".  This is hard for two
reasons: first is, of course, there's no running pod to respond to the request, and second is, there's not even a
running network to route the request to.  Sure, the pod might get assigned an IP address, but that IP address doesn't
"mean anything".  You can't ping it or curl it or, really, do anything with it.  Now, there _are_ some ways around this.
We could, for example, built a fake pod, and redirect network requests to that fake pod, and have it respond with fake
data, and there's probably a lot of valuable insights we might be able to glean from that... But, this level of
simulation is _really hard_ to do at all, and maybe impossible to do well.  I don't know.  It's so far down the line for
what I can or want to be able to simulate that I'm not really even willing to make any predictions about it.

## What things can you even use SimKube for?

This is probably the third most common question I get about SimKube: "What's it good for?"  And this is where I start to
get _really_ excited, because there are a ton of cool applications.  I've talked at length about postmortem analysis:
something broke, you run some simulations to understand what, and then you run some more simulations to understand why,
and then you run even _more_ simulations to figure out how to fix it.  That's cool and all, but I think it just
scratches the surface of what we can do.

I've also talked at length about scheduling and autoscaling.  We can definitely use simulated environments to understand
how and why the scheduler or the autoscaler is doing what it's doing, and then we can run additional simulations to
understand how we might tweak the scheduler or the scaler to improve efficiency and reduce costs.  Again, a very cool
and important bit of functionality, but we can do better.

For example: now that simulations are cheap and easy to run, we can run hundreds of them!  What information can we gain
from that?  Well, consider the above two examples: reliability and cost savings.  Very often, these two goals are in
conflict: you can make things more reliable, but it's probably going to cost more money.  You can reduce costs, but it's
probably going to increase the likelihood of an outage.  They aren't independent variables.  And when you have an
optimization problem with non-independent and conflicting variables, you generally can't find one single "optimal"
solution.  Instead, you have to look at what's called the [Pareto frontier](https://en.wikipedia.org/wiki/Pareto_front):
it's a bit complicated and I'm not going to go into the details, but essentially this represents the space of "best
possible" solutions.  In the example we're considering, it's the space of solutions where you can't reduce costs without
also reducing reliability, or vice versa.

What does all this have to do with simulation?  Well, now that we can run hundreds of simulations at once, we can
actually _visualize_ what the Pareto frontier looks like for some of these systems.  You can take that graph to your CTO
and be like "OK, you need to tell me where we want to be on this cost/reliability curve, and I will go make it happen."
No more guessing about these factors and then having everybody get upset when costs go up[^7]!

There's one other example that I think we can use simulation for, which I'm a bit hesitant to mention because of all the
hype and _feelings_ that the topic stirs up, but I've never been one to shy away from controversy, so: now that we have
a simulated playground, we have a really great (and cost-effective) environment for people to start training AI agents
to manage infrastructure.  Now before you angrily starting leaving a comment about how dumb this all is and how you
can't believe I've sold out to the AI hype wave, a) remember that only paying subscribers get to leave angry comments,
and b) I am not convinced that our current crop of AI models are actually going to be able to be useful or productive
agents for these types of complex systems[^8].  _BUT_ I do think it's an area that's worth exploring in more detail, and
given the vast amounts of training data and time that AI agents require, I don't see any successful means of training
them effectively _without_ a simulation environment like SimKube.

So anyways: I hope this post has helped you understand more about SimKube's current capabilities, as well as my goals
and roadmap for the future, and as always: if you've used SimKube, tried to use SimKube and bounced off, or want to use
SimKube and don't know where to start, I'd [love to hear from you!](https://appliedcomputing.io/contact).

As always, thanks for reading.

~drmorr

[^1]: I just got the demo code for this talk working yesterday, and I'm quite excited about it; I might have a sneak
    peak available sometime in the next couple weeks, keep your eyes peeled.

[^2]: Well ACKSHUALLY it's 1.1.1 at time of writing, but who's counting?

[^3]: I mean, it's easy _for me_.

[^4]: Which is super fun when your metrics collector breaks and then all the data that your autoscaler was relying on to
    make scaling decisions is no longer present.  Ask me how I know.

[^5]: Though, I recently discovered that---at least for the default kind setup---the "root certificate" for the cluster
    is just a ConfigMap in the default namespace, which, idk, probably you don't want to be shipping around in a trace
    file...

[^6]: I've been having a lot of fun with [ratatui](https://ratatui.rs), which is a text user interface library for Rust
    with a lot of nifty features.

[^7]: Yes, I know, it's more complicated than that and people will probably get upset when costs go up regardless, but
    at least now you can blame the CTO and the CTO can justify their decision based on data.

[^8]: I have a whole blog post written out in my head about the state of AI research and the current hype wave, but
    that's going to have to wait until some other time.  The short version is, I think that AI (and LLMs specifically)
    _probably_ have some useful applications, but I'm not sure we've discovered any of them yet, and I'm frustrated that
    (as an industry) we seem to have settled on using them in the dumbest way possible while simultaneously drastically
    overinflating their capabilities.
