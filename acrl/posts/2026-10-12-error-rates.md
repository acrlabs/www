---
title: "Key Autoscaling Metric #3: Error Rates and Termination Grace Periods"
authors:
  - drmorr
datetime: 2026-10-12 11:00:00
template: post.html
---

<figure markdown>
  ![A purple octopus holding a sign that says "my autoscalar", and is covered with boxes and arrows going every which way](/img/posts/squidlers-autoscaler.png)
  <figcaption>Mr. Squidler brought his own whiteboard to his system design interview, does that get him bonus points?</figcaption>
</figure>

This is the third post in our [Five Key Autoscaling Metrics](./2026-09-22-five-key-metrics.md) series; in the
[first post](./2026-09-28-autoscaling-metric-1-workload-committed.md), Ian broke down the Workload Committed Capacity
metric, or "why your utilization isn't as good as you think it is".  [Last week](./2026-10-05-mean-time-to-first-byte.md),
I talked about measuring the "scale-up" performance of your autoscaler from the perspective of your users: namely, how
long they have to wait before they can see their AI-generated cat pics.  This week, we're going to look at the inverse:
how much your users notice when your autoscaler scales down (and why Kubernetes makes it virtually guaranteed that your
users _will_ notice).

## Can you please design an autoscaler on the whiteboard?

If I've learned anything from doing endless architecture and/or system-design interviews (on both sides of the table),
it's that what software development looks like in an interview has _nothing at all_ to do with what software development
looks like in real life.  See, in an interview, typically you're asked to "design a system" for the interviewer, who can
then ask you arbitrary questions like "how many requests per second can your whiteboard handle?"  In real software
engineering, "design" is a naughty word and most people skip right past it.  But I digress; just for the sake of
argument, let's suppose that somebody asked us in an interview to design an autoscaler that gracefully scales down.  How
would you do it?

Well, let's think about what can go wrong on scale-down: if your pod isn't doing anything, you can just kill it.  If
it _is_ doing something, then maybe you should let it finish before you shut it down.  But how do you know if your pod
is doing something?

Spoiler warning: you don't.  You're the platform, you have _literally no idea_ what kinds of applications are running on
top of the platform, so it is literally impossible for you to understand whether it's safe to terminate your
application.  So anyways, I guess we're going to fail this system design interview, because most interviewers don't like
being told "the problem you're asking me to solve is impossible"[^1].

Just kidding, we actually _can_ do something: we could (*gasp*) ask the application whether or not it's ready to be
terminated[^2]!  And then we could give it some kind of, idk, "[termination grace period](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination-flow)"
 or something so that the application has a reasonable amount of time to shut down but it can't greedily just hang on to
its resources forever.

So, putting my interviewer hat back on for a minute, I say "Huh.  That seems like a reasonable approach, but how can you
tell whether it's successful?  In other words, how do you know whether your autoscaling policy is actually impacting
your user experience?"

And then I take my interviewer hat off and I respond "Users?  What are those?  I'm a platform engineer, I don't care
about the users!"[^3]

## I thought this post was supposed to be about metrics

Ok, I'm kindof burying the lede in this post[^4], but the actual answer to the hypothetical interviewer's question is,
"You measure it!"  Specifically, you need to understand a) what kind of errors your application can throw, and b) how
many of them are happening.  In some cases, this is easy: is it a webserver?  Then it probably throws a 500 error when
the HTTP request abruptly gets canceled.  Is it some kind of queue processor?  Maybe the task it was working on ends up
in a dead letter queue.  In other cases, you may need to think a little bit more creatively about your application's
errors and how to measure them.

But!  It's not sufficient to just "count errors", because your application can throw errors for any number of different
reasons.  What you _really_ want to be able to do (because this is all about autoscaling, remember) is connect the
errors that get thrown to the actions taken by your autoscaler.  Seems easy, right[^5]?

Welllllll it turns out that in _today's_ world, about the best you can do is correlation, not causation.  You "probably"
have some metrics getting emitted about your `5xx` response rate for various pods, and you might also have some metrics
from your autoscaler indicating whether it took a scale-down action.  You can then do some extremely ugly PromQL to
apply some kind of envelope function to your error rates metric, so that you can produce a count over time of "errors
occurring during scaledown".

Normally I would try to be helpful and actually tell you what that PromQL is, but that honestly sounds harrowing enough
that I don't want to try, and I give you 10-to-1 odds that your monitoring platform just chokes on the query anyways.
So that's not great.  But hey, maybe we can do better?

## What if we just asked them

I'm going back to a point I made earlier in the post: your application is the _only thing_ that knows when it's safe to
scale down, and it's also the _only thing_ that knows if it's throwing an error or not.  So what if we tied those two
things together?  What if we made a communication channel to your pods that tracks "disruption safety"?  What if we
"just asked"?

Then we could actually do two things at once: we could have a single built-in metric to track the number of pods that
get disrupted outside their "disruption safety" window, _and_ we could have a good autoscaling flow:

1. Autoscaler: hey I need to scale some stuff down, those pods looks good.  Hey pods, can I scale you down?
2. Pod 1: Sure, go ahead!
3. Pod 2: Uhhh I've got some cleanup I need to do, check back in five minutes.
4. Pod 3: Nope, I'm never going away, I am immortal! 😈😈😈
5. Autoscaler: OK, I'm gonna shut Pod 1 down now.  Pod 2, thanks for getting back to me, I'll try again in five minutes.
   Pod 3, you are not immortal, you've got 10 minutes before I pull the plug.  Make the best of it.

I'm going to spend a _lot_ more time on this in my rant about pod disruption budgets next week, but unfortunately
something like this just isn't possible today.  The best we can do are hacks like Karpenter's [`do-not-disrupt`](https://karpenter.sh/docs/concepts/disruption/#pod-level-controls)
annotation or messing around with [pod deletion cost](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/#pod-deletion-cost)
values.

But here's the thing: there's already _some_ precedent for Kubernetes communicating with pods: we have [three different
probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/) to monitor one half of a pod's lifecycle, and while
it's frequently confusing what the difference is between startup probes, readiness checks, and liveness checks, doesn't
it seem a bit unbalanced that we don't have _any_ probes for the scaledown side of things?  It wouldn't be _that_ hard
to create a `disruptionReadiness` probe that various other Kubernetes components could query to coordinate
scaledown[^6].

## Did u just write a KEP?

Ehhhhh, the thing is, is that it actually _would_ be pretty hard to create that probe.  Not because the code would be
that complicated, but because the process of getting _any_ changes made to the core Pod spec is incredibly burdensome
these days[^7].  But sure; I guess if any of the Kubernetes authors are reading this and want to write a [KEP](https://www.kubernetes.dev/resources/keps/)
for this, I wouldn't complain.  I do think I'd be remiss to mention how most organizations handle scaling down _today_,
though.  There are three steps:

1. Add middleware that does retries.
2. Set an exorbitantly-large value for [`terminationGracePeriodSeconds`](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination-flow).
3. If you're feeling extremely up to the challenge, add a [`preStop` hook](https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/)
   to gracefully stop doing work and shut down the application before the pod is terminated.

Though to be honest, most people stop at step 2, because step 3 is hard and people are lazy.  And so, given that we're
supposed to be talking about metrics for autoscaling, here are two that you can track to monitor your scale-down
performance: first, track your error rates.  You probably don't even have to do any sort of fancy PromQL envelope
function, if you just overlay your error rate metric with your replica count on Grafana, it'll be pretty clear if you're
getting a burst of errors due to scaledown.  And second, maybe track how long your pods are sitting in a "waiting for
deletion" state because you've set your termination grace period seconds to 400 years.

As always, thanks for reading, and if you do get a job based on my hot interview tips, remember you owe me 10% of your
signing bonus.

~drmorr

[^1]: Fun fact, my goto interview question for a long time was "design an orchestration platform like Kubernetes that
    can handle stateful workloads gracefully."  The number of engineers who just told me flat-out "that's impossible"
    and refused to engage further was... higher than you might expect.

[^2]: "Asking the application" will become a recurring theme throughout the remainder of this post, and also next week's
    post, so maybe get your shot glass ready.

[^3]: You didn't know that you were going to be getting free software engineering interviewing tips alongside this post,
    did you?  I can pretty much guarantee that if you follow this script exactly, you'll be drowning in offers.

[^4]: There was [another post making the Internet rounds this week](https://refactoringenglish.com/blog/anti-patterns-software-blogging/)
    talking about how long, meandering introductions are bad for technical blogs, and so I took that as a personal
    challenge.

[^5]: Surely you've been reading this blog long enough not to fall for that.  And if you haven't, maybe you should
    [subscribe](https://blog.appliedcomputing.io/subscribe)!

[^6]: Not coincidentally, a disruption readiness probe would also be a _great_ feature to have for that "stateful
    version of Kubernetes" I mentioned in footnote 1.  It's amazing how many people I interviewed who weren't able to
    get there.

[^7]: And for good reason: Pods are extremely core to how Kubernetes operates, so making any changes to them need to be
    very carefully considered.  This is also why we've seen such a proliferation of custom resources and controllers get
    layered on top of pods in the last five years or so, even within "core Kubernetes"---because it's easier to add
    another layer than it is to make the change where it makes the most sense.  Also probably because nobody's going to
    get promoted for making a change to the Pod spec.
