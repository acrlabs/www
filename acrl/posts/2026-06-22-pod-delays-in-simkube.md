---
title: "Worth the Wait: Realistic Pod Delays in SimKube"
authors:
  - ian
datetime: 2026-06-22 11:00:00
template: post.html
---

SimKube simulations just got even more realistic! In the next release of [SimKube](https://simkube.dev/) we are making a
slight change in the behavior of simulated Pods. If you are detail oriented, skeptical or just downright crazy you may
have noticed in previous releases that simulated Pods move to Running nearly instantly. Instant Pods, are a devious lie.
The Pods in your production cluster are never Running instantly, rather they proceed, and I say this with real hope for
your sanity, from Pending to Running in an orderly fashion. Since the Pods in your production clusters don't start
instantly neither should simulated Pods. If simulated pods skip straight to Running, your replay isn't modeling the
cluster you actually run, let's fix that today!

## Satisfaction: Delayed

To go from instant to realistic timing in SimKube replays we are going to focus on two previously unincorporated but
important delays in the pod lifecycle: image pull time and container startup time. There are other small delays related
to scheduling and API response time but since we are running a real control plane these delays are already baked in.
So how do we go about baking in delays for container startup and image pull?

The [KWOK](https://kwok.sigs.k8s.io/) team did us a great service here by making it nearly painless to introduce common
delays into our simulated Pod lifecycle using [KWOK Stages](https://kwok.sigs.k8s.io/docs/user/stages-configuration/).
Stages allow us to define specific lifecycle steps for Kubernetes resources and the conditions on which they advance,
for our needs we specifically want to setup stages for Pods. It is worth noting here that the KWOK repo has two sets of
examples showing a [Pod Fast Stage](https://github.com/kubernetes-sigs/kwok/tree/main/kustomize/stage/pod/fast) which is
a minimal stages configuration and
[Pod General Stage (WIP)](https://github.com/kubernetes-sigs/kwok/tree/main/kustomize/stage/pod/general) is a higher
fidelity set of stages meant to more closely mimic the realistic Pod lifecycle.

Stages are fairly straightforward Kubernetes objects, each stage targets a resource via a `resourceRef` and uses a
`selector` to determine when the stage should fire. The details of the Stage are defined in the spec, crucially there is
a section called delay that includes four fields that give stages customizable delay conditions. The simplest way to
introduce delays in KWOK stages is by setting a `spec.delay.durationMilliseconds`, you can easily incorporate jitter by
adding `spec.delay.jitterDurationMilliseconds`. Jitter is what gives a delay randomness just like delays you expect to
see in your production cluster, sometimes an image pull takes a bit more time or a bit less time.

```yaml
kind: Stage
apiVersion: kwok.x-k8s.io/v1alpha1
metadata:
  name: <string>
spec:
  delay:
    durationMilliseconds: <int>
    durationFrom:
      expressionFrom: <expressions-string>
    jitterDurationMilliseconds: <int>
    jitterDurationFrom:
      expressionFrom: <expressions-string>
```

So this is great, we now can add delays to our stages but where it gets really interesting is layering our stages to
create a realistic lifecycle and timing. Right now we introduced a single delay in a Stage, but we have pointed out two
areas we want to introduce delays, container start and image pull. We could repeat our configuration above and chain two
stages back to back to introduce two delays with random jitter. To do that we just need to make sure our selector in
stage 1 matches a recognizable starting state to pick up a Pod, it then must leave that Pod in a state that will only
be matched by stage 2. Note if both stages match you can create a race condition so its best to setup your stages
thoughtfully so that you can create easy match conditions for your selector. For example you might set your
`Status.Conditions` then match on it in the next step.

To illustrate this lets look at how we are chaining two stages in the SimKube KWOK Stages, pod-create and pod-running.
For brevity and the sake of your eyeballs, I will include selector snippets below and provide links to the full spec in
the SimKube repo.

`pod-create` is our first KWOK Stage and this is where we insert our image pull delay. Our match expression is
intentionally wide. We want to match any Pods that do not have a `metadata.deletionTimestamp` or a `status.podIP`.

```yaml
# Stage pod-create
selector:
  matchExpressions:
    - key: .metadata.deletionTimestamp
      operator: DoesNotExist
    - key: .status.podIP
      operator: DoesNotExist
```

Inside our pod-create Stage `spec.next.statusTemplate` is where we define our Pod transformations, mainly we are
updating the resource status to mimic the stages of the pod lifecycle in a production cluster. In pod-create that means
setting our Pod's `status.phase` to Pending, setting a `status.podIP` and setting 'Initialized' `status` to True.
By setting these conditions we can easily identify and match Pods that are post pod-create in later stages. Note that
Pods will now no longer match our selector in pod-create because we have assigned them an IP! You can see the full
pod-create stage [here](https://github.com/acrlabs/simkube/blob/main/config/kwok/pod-create.yml) specifically
`spec.next.statusTemplate` (trigger warning, Go templating).

In our next stage `pod-running`, we are still matching all Pods without a `metadata.deletionTimestamp` (we don't want to
grab deleted pods by mistake), but we are also matching on `status.phase` of Pending and `status.conditions` that
include 'Initialized', both of which we set in the prior stage. We exclude `status.containerStatuses` that have a
`state.running.startedAt` because we set startedAt in pod-running stage  itself so this condition prevents a Pod from
re-matching this stage. You can see the whole pod-running stage
[here](https://github.com/acrlabs/simkube/blob/main/config/kwok/pod-ready.yml).

```yaml
# Stage pod-running
selector:
  matchExpressions:
    - key: .metadata.deletionTimestamp
      operator: DoesNotExist
    - key: .status.phase
      operator: In
      values:
        - Pending
    - key: .status.conditions.[] | select( .type == "Initialized" ) | .status
      operator: In
      values:
        - "True"
    - key: .status.containerStatuses.[].state.running.startedAt
      operator: DoesNotExist
```

In SimKube, we used these exact layering approaches to create a set of stages which were based on the General Stages
examples provided by KWOK. Combined they walk a Pod from Pending -> Waiting (ContainerCreating) -> Running. We use these
stages to front load a delay on Pending to simulate image pull time, and Waiting, to simulate container startup time.
With the delays in place our Pod transitions now look and feel like a normal Pod lifecycle with natural variation.
Wow, that feels good!

## Advanced Delays for the Curious and Crazy

In the KWOK Stages we implemented in SimKube we chose to make our delays and jitter fully configurable by SimKube users,
meaning that when you run a simulation you can inject the jitter and delays specific to your production environment
right in your `skctl run` command with optional arguments
`--pod-startup-delay 1000 --pod-startup-jitter 5000 --image-pull-delay 1000 --image-pull-jitter 5000`.
These optionsare globally defined at the start of the simulation in milliseconds.

To accomplish this we have to use some slightly more advanced features in the KWOK stages specifically
`spec.delay.durationFrom` and `spec.delay.jitterDurationFrom` these fields allow us to pull values from annotations
dynamically via JQ expressions. We pass delay values through as pod annotations via our existing admission
`MutatingWebhook`. This is what those expressions look like:

```yaml
# Example from pod-create
spec:
  delay:
    durationFrom:
      expressionFrom: .metadata.annotations["simkube.io/kwok-stage-create-delay"]
    jitterDurationFrom:
      expressionFrom: .metadata.annotations["simkube.io/kwok-stage-create-delay-jitter"]
```

Note: a similar set of delays are configured on `pod-ready`, using the `simkube.io/kwok-stage-ready-delay` and
`simkube.io/kwok-stage-ready-delay-jitter`.

## TL;DR for the Impatient

To recap, we started with pods that moved nearly instantaneously to Running. We then introduced static delays and how to
add them via `spec.delay.durationMilliseconds` and jitter via `spec.delay.jitterDurationMilliseconds`. Then we covered
how to layer KWOK stages to create realistic steps to mimic the Pod lifecycle. Finally, we discussed fully configurable
delays like we have implemented in SimKube using Pod annotations and KWOKs advanced `expressionFrom` supported in
`spec.delay.DurationFrom` and `spec.delay.jitterDurationFrom`. Without a ton of heavy lifting, and only a small amount
of Go templating (which the KWOK team mercifully has examples of) we now have fully configurable delays using only
Kubernetes native resources!

## Without further Delay

So why even go to these lengths just to add some small delays in a simulation that already has a high level of fidelity
and, moreover, why make them configurable? Well, in short, we think these delays matter for SimKube users. Image pull
time and container startup are real and vary from cluster to cluster. Your cluster isn't our cluster, so providing a way
to configure delays helps us take another small step towards realism for users and in this case the cost is quite low.
So without further delay give our configurable delays a try in the next SimKube release and let us know what you think!

Cheers,

Ian
