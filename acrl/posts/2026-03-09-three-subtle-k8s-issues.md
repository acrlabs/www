---
title: "Three subtle Kubernetes issues I've seen in the last week"
authors:
  - drmorr
datetime: 2026-03-09 11:00:00
template: post.html
---

<figure markdown>
  ![alt text here](/img/posts/XXXX.png)
  <figcaption>XXXX</figcaption>
</figure>

Well I was _going_ to use this post to provide a follow-up to the [hot garbage](2026-01-26-what-to-expect.md) from a few
weeks ago, wherein I complain about my efforts to stand up an internal ACRL Kubernetes cluster and run something useful
on it, but that post is going to have to wait because I've spent an inordinate amount of time over the last week
debugging three separate, extremely subtle, Kubernetes issues.  So I'm going to use this post to complain about that
instead!  When it rains, it storms, I suppose.

## Issue #1: OOMs on First?

This first issue actually sparked a [long rant](https://hachyderm.io/@drmorr/116134479810826760) on Mastodon, which I
started off by saying,

> Sometimes problems are hard to solve because of something inherent in the problem domain that makes it hard.
> Other times, the problems are hard because we make it hard all on our own.
> This tale is one of the latter ones.

And it's true, I stand by every word of that post.  And since not all of you read Mastodon, and I'm still kindof upset,
I figured I'd recap the issue here.

The problem that we're trying to solve here is, how frequently is your pod or application running out of memory
(commonly called an OOM)?  This seems like a useful thing that you might want to know, because it might, say, indicate a
memory leak, an increase in data or requests, or even just misconfigured resource requests.  Maybe you'd want to know if
this is happening several times a week, or day, or hour.  Anyways, Kubernetes exposes a whole host of metrics from
basically every single part of the system, and if you install [kube-state-metrics](https://github.com/kubernetes/kube-state-metrics)
(KSM) you can get even more!  Surely among those hundreds of thousands of metrics, there's one that tells you how often
your applications run out of memory?

Wrong!  There's not one, there's actually _four_[^1].  They are:

1. `kube_pod_container_status_terminated_reason`: this one comes from KSM and is a binary value that is one if the
   container is terminated because it was out of memory, and zero otherwise.
2. `kube_pod_container_status_last_terminated_reason`: this one also comes from KSM and is a binary value that indicates
   why the given container terminated last, including if it OOMed.
3. `container_oom_events_total`: this metric comes from the Linux kernel, and reports the number of times that a
   container has run out of memory
4. The Kubernetes event stream: this is sortof cheating, because it's not a metric exactly, but Kubernetes emits an
   event any time a container runs out of memory, and that event stream can be queried and stuffed into some other
   database somewhere else down the line if you want.

This all seems great and stuff, maybe there are a few too many metrics here, but we can just pick one and move on with
our lives, right?  Wrong[^2]!

It turns out that none of those four metrics give you the information that you want, and thus there is actually no
way---in Kubernetes---to tell how frequently your pods are OOMing.  😖😖😖

I go into details in the Mastodon thread, but lets break it down real quick here, too.  Metrics (1) and (2) are both
gauges, not counters, which means they can go up and down.  The first metric goes back to zero whenever the container
state changes[^3].  The second goes back to zero whenever the container terminates for a second time for some different
reason.  That means you can't just slap a `delta` function on it and call it a day, because sometimes that delta is
negative!  The third metric actually doesn't work at all.  It just always emits zero.  There's a [GitHub issue](https://github.com/google/cadvisor/issues/3015)
about this where the answer is "welp, tough luck".  And to round it out, the last "metric" (event) doesn't tell you
which pod or container is affected, it just tells you "hey something on this node OOMed, oopsies!"

So there you have it.  Or rather, there you don't have it, because it's literally impossible[^4] for no good reason.

## Issue #2: When is closing time again?

This one's a quickie that I learned about yesterday.  Pods in Kubernetes have a `deletionTimestamp` field which
indicates (as you might expect) when the pod was requested to be deleted[^5].  Except!  That's not actually what it
indicates.

The deletion timestamp shows the time when the pod was requested to be deleted _plus_ the pod's termination grace period
delay[^6].  Fine, OK, whatever, just subtract the termination grace period delay from the deletion timestamp and you get
the time when the pod was requested to be deleted.  A little bit annoying, but not a big deal.  But wait!  It gets
better!

If the pod finishes all of its work and shuts down before the termination grace period expires, the deletion timestamp
is updated to the _actual time the pod went away_.  Hope you like time travelling, baby, cuz we're going B2k to the
F4e!

## Issue 3: When is a map not a map?  When it's been merged!

I spent an inordinate amount of time troubleshooting this issue yesterday and today.  The short version is: you've got
some [custom resource](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) in
Kubernetes that creates some pods[^7].  Inside your custom resource, you have a pod template spec, which defines how and
where that pod should be created.  Inside the pod template spec, you have a node selector, which specifies which node(s)
the pod is eligible to run on.  The node selector is a map, it looks something like this:

```yaml
nodeSelector:
  simkube.dev/type: virtual
```

This node selector is saying that the pod can only run on nodes that have the `simkube.dev/type=virtual` node label.

Now, suppose you perform the following sequence of actions:

1. Change the node selector to `appliedcomputing.io/simkube-type: real` (Why are you making this change?  Who knows,
   who cares, it's not important right now).
2. Re-apply the custom resource, using...
3. `kubectl apply --server-side`[^8]

What is the resulting node selector on your newly-applied custom resource?  Is it:

```yaml
nodeSelector:
  simkube.dev/type: virtual
```

or is it

```yaml
nodeSelector:
  appliedcomputing.io/simkube-type: real
```

or, lastly, is it

```yaml
nodeSelector:
  simkube.dev/type: virtual
  appliedcomputing.io/simkube-type: real
```

If you guessed the last one, you've been doing this software thing too long, you really ought to go do something else
with your life so you don't lose what little bit of sanity you have left.  But also, if you guessed the last one, you
were 100% correct, thanks to the slightly counter-intuitive [merge semantics of server-side-apply in Kubernetes](https://kubernetes.io/docs/reference/using-api/server-side-apply/#merge-strategy).
This might be a problem for you if, for example, it's impossible for something to be virtual and real at the same time.

Fortunately, this last one is fairly easy to fix, you can just add a field to the custom resource specification that
tells Kubernetes "hey don't do this".  But if you're not expecting it, I hope you enjoy spending a couple days of your
life pondering increasingly-unlikely scenarios, like gremlins and gamma rays.

Anyways, that's all I've got for this week!  Come back next week to read more about how hard it is to actually run
applications on Kubernetes.

Thanks for reading!

~drmorr

*[OOM]: Out Of Memory
*[KSM]: kube-state-metrics

[^1]: I bet you didn't see that coming.

[^2]: I bet you _did_ see that one coming.

[^3]: [Except for when it doesn't](https://hachyderm.io/@drmorr/116134527390208807).

[^4]: Obviously this statement is hyperbole.  It's not actually impossible, it's just that nobody has made this
    extremely basic thing that probably everybody wants to do possible out-of-the-box.

[^5]: Yet another thing that you as a cluster operator and/or application owner might wish to know.

[^6]: The termination grace period is used to give pods some time to cleanly shut down, handle any last requests, etc.
    etc. etc. before they die.

[^7]: Look I'm playing fast-and-loose here, I know the custom resource is just the spec and doesn't create any pods,
    it's the controller that reads the spec and takes actions that creates pods, OK, captain pedantic?

[^8]: Some of you already know where this is going.
