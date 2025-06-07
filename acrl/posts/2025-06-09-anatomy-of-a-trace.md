---
title: "Anatomy of a Trace"
authors:
  - drmorr
datetime: 2025-06-09 11:00:00
template: post.html
---

<figure markdown>
  ![A cartoon of a character in a spelling bee, trying to spell the word "EVENT", but failing miserably; the character spells it E-V-NT.  A judge sits off to the side saying "WRONG"](/img/posts/spellingbee.png)
  <figcaption>What does the picture have to do with the contents of this article?  Absolutely nothing, it’s just the setup for an extremely tortured analogy (joke?  maybe it’s a joke) that gets half-way through the post and then dropped on the floor like yesterday’s laundry.</figcaption>
</figure>

OK I've been promising to write more technical content for a while now, instead of me just [moping about turning
40](2025-05-26-ennui.md)[^1], and in this post, we're actually gonna do it!  Of course it's going to be about SimKube,
what else would I write about?

Anyways, the most common set of questions I get when I present SimKube to new folks are about the trace file; at the
[Cloud Native PDX meetup](https://www.meetup.com/cloud-native-pdx/events/306802106/) a couple weeks ago, that was
definitely the case, and after I was finished, one of my friends said, "Maybe you should write a blog post about that,"
and, well, here we are.  The types of questions I get are all along the lines of "What is a trace really?  What can you
do with it?  Can you modify traces to produce new simulated scenarios?"

One cool thing that I don't think a lot of people realize is that you can use traces for _more_ than just simulation: a
trace is just a repeatable sequence of events.  You could play that trace in a simulated cluster, in a real cluster, or
anything in between where you want to guarantee that "events" happen in a consistent, reproducible way.  You could
potentially even do things like _stream_ the events from one Kubernetes cluster directly into another one!  But before
you can start thinking about these possibilities, you need to know talk about what a trace actually is, and how you can
do things with it (currently).

## Please spell the word "event"

When I describe a SimKube in my talks, I typically start by saying "It's a timeline of events that happened in
your cluster".  This is actually sorta confusing, because these are _not_ Kubernetes [_Events_](https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/event-v1/#Event)[^2];
instead, these are Kubernetes _events_[^3]---that is, "a thing that happened in the cluster."  But what kind of events
do we actually care about?  I typically use two examples here: a Deployment scaling up and a CronJob launching a
periodic pod.  Both of these are nice examples, because they illustrate what's captured in the trace: literally just the
Kubernetes resource manifest that contains the replica count change or the CronJob schedule.

But the other
interesting property to notice is that there is a separation between the event that is stored in the trace and the
actual, observable outcome that happens in the cluster.  When the Deployment's replica count changes, it doesn't
immediately launch a new pod; instead, it updates the ReplicaSet that is owned by the Deployment.  Then the _ReplicaSet_
actually creates the pod[^4].  Similarly, the CronJob doesn't create a pod, it creates a Job which creates a pod.  The
obvious question here is, "Aren't _those_ things events too?  Why aren't they stored in the trace?"

Now, you absolutely could store the ReplicaSet/Job changes in the trace as well, but because they are _owned_ by another
resource, it turns out to be unhelpful to also store that data; when we replay a trace, we want the resource owners to
still take the actions that they are programmed to take, and it would get really confusing if the trace is _also_ trying
to dictate what should happen to the owned resources.  It would very quickly lead to a conflict in the cluster state.

The exception to the rule is at the pod level: there are events that happen to pods which it is important for the trace
to know about: for example, we need to know how long Job executions take, so that we can appropriately replay the
actions of the CronJob.  If we didn't track how long a Job's pod ran (at least for the purposes of simulation), it could
end up just running forever, which would disrupt the fidelity of the trace.  You can imagine also tracking other pod
lifecycle events, like crashes, image pull errors, etc.

## Can you use "event" in a sentence?

Ok, so now that we (hopefully) know what events are, we can go back to the question of "What is a trace?"  In case my
extremely tortured spelling bee analogy in the headers wasn't obvious, a trace is just a collection of events that form
a "sentence".  Each event is just some Kubernetes resources, along with an action (created, modified, or deleted), and a
timestamp.  They're stored in order, so that when we replay a trace, everything happens in the same order as in the
original trace.  It looks like this:

```json
{
  "version": "2",
  "events": [
    {
      ts: 0,
      applied_objs: [
        {
          "apiVersion": "apps/v1",
          "kind": "Deployment",
          "metadata": {
            "name": "foo",
          },
          "spec": {
            "replicas": 1,
            ...
          },
        }
      ],
      deleted_objs: [],
    },
    {
      ts: 10,
      applied_objs: [
        {
          "apiVersion": "apps/v1",
          "kind": "Deployment",
          "metadata": {
            "name": "foo",
          },
          "spec": {
            "replicas": 5,
            ...
          },
        }
      ],
      deleted_objs: [],
    }
  ],
  ...
}
```

Here we can see that at time 0, the Deployment has 1 replica, and at time 10, the Deployment has 5.  Buuuuutttt if you
were paying attention, you'll realize that can't be all that we store in a trace: let's go back to the pod lifecycle
example.  We want to know details about each pod, but we can't be assured that the pods are going to appear in the same
sequence when we replay a trace.  Why not?  Well, there are all kinds of things (both in and out of our control) that
impact how pods get created and scheduled, so that while the Deployment still changes its replica count, the actual pods
that are linked to that change might run at wildly different times (or not at all).

The current way that this is tracked is through a separate "pod index" in the trace that associates pod lifecycle events
with a (hopefully unique) hash value.  When we replay a trace, and a new pod appears, we can compute the hash of that
pod's spec and then look up in the index all of the lifecycle data that we care about.  If this sounds complicated, it's
because it is---this logic is some of the gnarliest code in SimKube right now.

However, at a high level at least, now you can understand what a trace is: a timeline of changes to "owning" resources,
and an index of pod hash to pod lifecycle.  There's some other metadata that gets stored in the trace as well, and it
all gets stuffed into a [msgpack](https://msgpack.org) file at the end for... well, I dunno why it's in msgpack, except
that I went looking around at different binary data storage formats a couple years ago and just picked that one
arbitrarily since it seemed like it had the features that I wanted and there's a [Rust serialization
library](https://docs.rs/rmp-serde/latest/rmp_serde/) for it.

## Can you use "event" in a different sentence?

So what happens if you want to modify a trace?  There's all kinds of reasons why you might want to do this.  Maybe you
need to correct or fix some data in the trace; maybe you want to obfuscate some data in some way; maybe you want to
explore similar-but-not-identical scenarios.  Easy, right?  All you have to do is download [msgpack-tools](https://github.com/ludocode/msgpack-tools),
convert the trace from msgpack to JSON, find the Deployment that you want to modify, make the change to every instance
of that Deployment in the timeline, update the hash and index for any pods that might belong to that Deployment (along
with any other relevant metadata), re-package it up with msgpack-tools, and then realize that the whole thing was a
pointless endeavour because JSON and msgpack aren't 1-1 compatible and you can't actually round-trip them like that.
Easy, right?  Next question.

So actually this isn't very easy, which is why SimKube comes with a bunch of machinery to view and modify traces,
through the `skctl xray` and `skctl validate` commands.  The first command brings up a full TUI that lets you navigate
around the trace and see all of its contents.  Then, in the beginning part of this year, I spent a whole bunch of time
building verification code into SimKube that enables you to check a trace file for a number of common error
conditions[^5] and fix/correct them[^6].  Pretty cool, huh?  I think so, at least.  Here, watch this video and see for
yourself (don't worry, there is no sound):

<div class="youtube-container">
  <iframe
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen="allowfullscreen"
    frameborder="0"
    referrerpolicy="strict-origin-when-cross-origin"
    src="https://www.youtube.com/embed/tAyoWAhm1Q0?si=9S64GLreURNZdOTk">
  </iframe>
</div>

## Are there any alternate pronunciations of "event"?

It turns out, though, that there are still more events that we need to be able to track.  Not _everything_ that happens
in a Kubernetes cluster is dictated by YAML[^7].  Some things are dictated by even more arcane forces, like the ancient
god known as "Prometheus".  For example, the horizontal pod autoscaler (HPA) bases its decisions on things like "the
average CPU utilization of this set of pods."  I don't know if you noticed, but there's nothing in the trace file that
looks anything like CPU utilization of a set of pods.

This feels pretty important, though!  How are we going to simulate the behaviour of the HPA?  We're gonna need more
events.  And in fact, this is one of my major [OKRs](2024-02-05-okrs-are-bullshit.md) for the second half of 2025: I
think it _should_ be possible to register a fake Prometheus endpoint that reports simulated timeseries metrics data to
the HPA when we replay a trace.  Once I get that done, it will _dramatically_ increase the range of things that SimKube
can do, and I'm pretty excited about it.  Watch this space for more to come on this topic!

Anyways, for now, if you want to know more details about anything I wrote in this post, you can look at the [trace file
documentation](https://simkube.dev/simkube/docs/components/sk-tracer/), the [`skctl validate` documentation](https://simkube.dev/simkube/docs/components/skctl/),
or the [source code itself](https://github.com/acrlabs/simkube).  And hey, maybe if you get really inspired, you can
jump in and help me out.  Those OKRs ain't gonna meet themselves.

As always, thanks for reading!

~drmorr


[^1]: See what I did there?  Definitely not fishing for birthday wishes, no way.

[^2]: Kubernetes Events are similar to logs, except different somehow, in some weird way that nobody can articulate.

[^3]: Which you can tell are totally different things because I used a lower-case 'e'.

[^4]: If you really want to be technical about it, the Deployment and the ReplicaSet don't do anything at all; instead,
    the controller-manager pod (part of the Kubernetes control plane) observes the changes to these resources, and then
    makes other changes as appropriate.

[^5]: Imagine, for example, that your pods are associated with a ServiceAccount, but you forgot to collect the
    ServiceAccount as part of the trace; you can either remove the `serviceAccountName` field from the trace entirely,
    because your pods are all simulated and fake and can't take any actions anyways, or you can insert the
    ServiceAccount resource at the beginning of the trace so it is created during replay.

[^6]: You know when I said that tracking pod lifecycles was the gnarliest part of SimKube?  I may have lied.  It's
    possible the trace validation and modification code is now the most complicated code in the project.  Keeping track
    of "what changes were made and how that impacts or affects the rest of the trace is quite a mess.

[^7]: Unpossible.
