---
title: "Postmortem: Intermittent Failure in SimKube CI Runners"
authors:
  - drmorr
datetime: 2025-12-08 11:00:00
template: post.html
---

On Wednesday, November 26, 2025, while testing changes to ACRL's SimKube CI Runner[^1], an [ACRL employee](2025-09-08-now-there-are-two-of-them.md)
discovered an intermittent failure in the runner.  This failure caused approximately 50% of the simulations scheduled on
the runner to fail, resulting in failed actions in users' CI pipelines, which prevented new deploys of mission-critical
code.  We at ACRL take our responsibility as the world's leading provider of Kubernetes simulation analysis very
seriously, and we understand the severe impact this incident had on users of our CI runner.  We deeply apologize for
this incident, and are committed to taking whatever actions necessary to restore trust with our customers.  In the
remainder of this post we will outline the timeline of this incident, a detailed analysis of the underlying causes, and
the remediation steps we have taken to prevent a recurrence of this incident.

## Timeline of events

The aforementioned ACRL employee discovered the issue late Wednesday afternoon.  However, because the following day was
Thanksgiving, the investigation was postponed until the following week under the hypothesis that it was likely a
transient error, it'd probably go away if we didn't look at it too hard, and we had a lot of Thanksgiving food to eat.

On the following Monday (December 1st), during our regularly-scheduled company all-hands, we re-triggered the CI
pipeline once and it succeeded, whereupon we decided the problem had fixed itself.  It wasn't until Thursday, December
4th, when the incident re-occurred that we decided to bother spending some time investigating.  We then spent most of
the afternoon troubleshooting until we found the inciting factors[^2] and identified a series of remediations.  Those
fixes were published at some point later on, when we got around to it.

## Background and terminology

[SimKube](https://simkube.dev) is ACRL's [simulation environment for Kubernetes](2023-08-28-simkube-part-1.md).  It is
designed to allow organizations to study changes in their production Kubernetes clusters in a safe and isolated
environment.  One way of using SimKube is as a dedicated step in CI pipeline; this would enable users to check for
regressions or bugs in their Kubernetes code before it is deployed.

The SimKube CI runner is published[^3] as an Amazon Machine Image (AMI)[^4], which contains a complete SimKube
environment.  The runner can replay [trace files](2025-06-09-anatomy-of-a-trace.md) contained in the codebase, and will
check the outcome of the simulation to see if it's `Succeeded` or `Failed`.  The symptoms of this incident were that
periodically, a simulation would report as "failed" after completing its entire run.  The SimKube driver pod (the
component responsible for running the events in the trace file) would report the following error, along with a stack
trace and a panic:

```
timed out deleting simulation root sk-test-sim-driver-sn295-root
```

The "simulation root" is a Kubernetes [custom resource](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/)
which acts as a "hook" to hang all the other simulation objects off of.  The simulation root exists to make for a
one-step clean-up procedure: because of Kubernetes [garbage collection](https://kubernetes.io/docs/concepts/architecture/garbage-collection/),
when the root is deleted, all objects owned by the simulation root will also be deleted.

## Detailed analysis

The first step we took in our investigation was to study the trace file running in the simulation.  This trace file
(also available as an [example trace](https://github.com/acrlabs/simkube/blob/main/examples/traces/cronjob.sktrace) in
the SimKube repo) creates a single `CronJob`, lets it run for three minutes, and then deletes the `CronJob`.  The
`CronJob` is configured to create a new pod every minute, and the pod sleeps for 30 seconds before terminating.  This
trace file is used to test the pod lifecycle management features of SimKube.

We investigated the log files from all the relevant controllers, including the SimKube driver pod, the Kubernetes
controller manager, and the Kubernetes API server.  The results were, to use the technical terminology, extremely
f\*$&ing weird.  The SimKube driver pod had dozens of log lines which looked like the following:

```
INFO mutate_pod: mutating pod (hash=10855072724872030168, seq=66) pod.namespaced_name="virtual-default/hello-simkube-29414550-tcr49"
INFO mutate_pod: first time seeing pod, adding tracking annotations pod.namespaced_name="virtual-default/hello-simkube-29414550-tcr49"
```

What do these lines mean?  Well, the SimKube driver registers itself as a [mutating webhook](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#mutatingadmissionwebhook)
so that it can redirect simulated pods to the fake nodes and apply other labels and annotations to them.  The
`hello-simkube` pod is the one that's owned by the simulated CronJob.  What's curious about these log lines is that they
repeat over, and over, and over again, even after the CronJob object itself has been deleted!  At first we thought this
meant that the CronJob hadn't actually been deleted, but after some further study we realized that the pod name was the
same for every single one of these log entries: in other words, the SimKube mutating webhook is trying to mutate the
same pod for 10 minutes, well after the simulation was over and everything (supposedly) had been deleted.

The next clue came from the Kubernetes controller manager logs:

```
 "syncing orphan pod failed" err=<
        Pod "hello-simkube-29414550-tcr49" is invalid: spec: Forbidden: pod updates may not change fields other than `spec.containers[*].image`,`spec.initContainers[*].image`,`spec.activeDeadlineSeconds`,`spec.tolerations` (only additions to existing tolerations),`spec.terminationGracePeriodSeconds` (allow it to be set to 1 if it was previously negative)
        @@ -140,7 +140,9 @@
          "TerminationGracePeriodSeconds": 30,
          "ActiveDeadlineSeconds": null,
          "DNSPolicy": "ClusterFirst",
        - "NodeSelector": null,
        + "NodeSelector": {
        +  "type": "virtual"
        + },
          "ServiceAccountName": "default",
          "AutomountServiceAccountToken": null,
          "NodeName": "cluster-worker",
 > logger="job-controller" pod="virtual-default/hello-simkube-29414550-tcr49"
```

This is a standard error that gets returned when something (a user, a controller, etc) tries to update a read-only
field.  In this case, it's showing that something is trying to update the pod's node selector after the pod has already
been created, which is not allowed.  There are two curious things to note in this log entry: first, the timestamp is
after SimKube has deleted the CronJob, and it states that the pod has been orphaned, which means it's not owned by
anything.  In other words, the CronJob really was deleted!  Secondly, we got lucky in that some of the additional
context shows that the pod has been scheduled to a node, that is, `cluster-worker`.  This is not one of our simulated
nodes!  This is a real node!  That shouldn't happen.

The last clue came from the API server logs, where we discovered that the SimKube driver mutating webhook had been
configured to fail open[^5].  This means that, if the webhook fails (for whatever reason), the pod object will be
allowed through anyways.  Specifically, we saw that the webhook was failing because of a certificate error.

The certificate error immediately cast suspicion on [cert-manager](https://cert-manager.io), which is the component that
manages all of the TLS certificates for SimKube.  Cert-manager is quite a complex bit of machinery, but is nevertheless
required because mutating webhooks _must_ communicate over TLS, which means they need certificates.  In SimKube, we
create a self-signed certificate issuer for this purpose.  Cert-manager is actually a very robust tool, and has the
really nice feature that it can auto-inject certificates into your webhook configuration if you apply the
`cert-manager.io/inject-ca-from` annotation, which we do in SimKube.  Investigating the cert-manager logs, everything
seemed like it was working as designed at first, until we inspected the timestamps more closely.  Then these two lines
stood out:

```
I1204 18:29:07.814009 attempting to acquire leader lease kube-system/cert-manager-cainjector-leader-election...
I1204 18:30:11.466829 successfully acquired lease kube-system/cert-manager-cainjector-leader-election
```

By default, cert-manager, like many other components in Kubernetes, operates in a semi-[HA](https://en.wikipedia.org/wiki/High_availability) fashion.
There is one "leader" pod and a number of hot standby pods.  That way, if the leader pod crashes or gets evicted, one
of the standby pods can immediately take over.  Kubernetes provides a [distributed locking](https://kubernetes.io/docs/concepts/architecture/leases/#leader-election)
mechanism to ensure that only one pod can be the leader at a time.  Until the lease is acquired, the cert-manager pod
can't do any work.  What's interesting to note here is that it took almost a minute to acquire the lease; and moreover,
the simulation start time on the runner was 18:29:41, which means that the first CronJob pod, created at 18:30:00, was
created _before_ the cert-manager injector could provide the SimKube mutating webhook with its certificate.

So that's one mystery answered: if the webhook didn't have a certificate, it can't apply the proper node selector, and
because it fails open, the pod gets scheduled onto a real Kubernetes node instead of the intended fake node.  But why
and how does this pod become orphaned and stick around in the cluster until the SimKube driver times out?

Now that we knew the mechanism for the failure, it was easy to develop a local reproduction: delete the cert-manager
injector pod from the cluster, start a simulation, and then after the first CronJob pod was created, recreate the
cert-manager injector pod.  This simulates[^6] the effect of the injector waiting for the lease.  In fact, the first
time we did this, we didn't recreate the injector pod until _after_ the simulated-cronjob-sleep-pod-that-got-scheduled-on-a-real-node-by-mistake[^7]
had finished, and in _this_ case it was correctly cleaned up and the simulation finished as normal.

Repeating the test locally, we observed that the critical failure _only occurs_ if the cert-manager injector pod comes
up _while the CronJob pod is running_.  Since we had a reliable way to reproduce the error, we decided to take a quick
peek at the kubelet logs and saw this log line repeated over and over again:

```
Failed to update status for pod" err="failed to patch status
...
<long status update message>
...
for pod \"virtual-default\"/\"hello-simkube-29414879-r22m5\":
pods \"hello-simkube-29414879-r22m5\" is forbidden: node \"karpenter-worker\" cannot update labels through pod status"
```

Aha!  This is the last piece of the puzzle: kubelet is _trying_ to update the status of the pod to say that it's
finished running, but it can't.  The error message is slightly weird, it's saying that kubelet is sending a modification
to the pod _labels_ to the pod _status endpoint_, which is forbidden because pod labels aren't part of the pod status.
What's strange about this is, if you look at the actual update kubelet is sending, there are no label updates.

I suspect those of you who've written admission webhooks are nodding along by now.  The flow of data looks like this:

```
kubelet status update -> API server -> SimKube mutating webhook -> API server -> kubelet
```

In other words: because the SimKube mutating webhook was subscribed to both `CREATE` and `UPDATE` events[^8], it
intercepted the kubelet's status update, said "hey, this pod doesn't have any of the right simulation labels or the
proper node-selector on it, lemme add those!"  The Kubernetes API server received the modification and said (in the
logs) "Hey, you can't add a node selector on an UPDATE!", and said (to kubelet) "Hey, you can't add a label from the
`/status` endpoint!", and said (to the mutating webhook) nothing[^9].  Kubelet continued to retry the status update for
the pod every 10 seconds until the simulation driver terminated.

Wait, but why did everything clean up after the simulation crashed?  Well, once the simulation driver pod terminated,
there was no longer a mutating webhook in place to add labels to the pods based on a status update, so the update went
through, Kubernetes realized the pod had completed, and it deleted it to finish its cleanup.

## Remediation steps

After conducting this detailed analysis, ACRL engineers identified the following remediation steps:

1. Stop running cert-manager in HA mode, because our one-replica cert-manager injector pod definitely doesn't need to be
   spending up to one (1) minute trying to claim a lock that nobody else is holding.
2. Configure the SimKube driver mutating webhook to fail closed: we basically never want a pod that is designated for a
   simulated node to get scheduled on a real node, because that could cause all kinds of issues.
3. Configure the SimKube driver mutating webhook to only listen to pod `CREATE` events, not `UPDATE` events.  Once the
   simulated pod is running, the driver never makes any further changes, so there's no reason to listen for updates.
4. Modify the SimKube simulation controller to wait for the driver pod to receive its certificate before continuing with
   simulation setup.
5. Improve our logging and metrics monitoring infrastructure so that it's easier to identify and troubleshoot these
   issues in the future.

As is common with incidents of this nature and scale, there was no single point of failure that caused the issue; had
any one of these remediations been in place, the incident would not have occurred.  To prevent future recurrence of this
issue, and to enable defense in depth, we will prioritize getting these fixes in place at some point in the future when
we feel like getting around to it.

## Conclusion

ACRL cares strongly about the experience of the zero customers who are using this SimKube CI Runner action.  We deeply
apologize for the impact that our failure had on your CI pipelines and deploy process, and will be issuing refunds to
all zero of customers who tried to use our runner image during the period of this outage.  Please feel free to
[contact our support team](https://appliedcomputing.io/contact/) if you have any further questions or concerns about
this outage, and rest assured we will strive to do better next time.

~drmorr

[^1]: Currently available to zero customers because AWS hasn't approved it yet.

[^2]: Less-enlightened organizations than ACRL might call this a "root cause" but as we all know around here, the root
    cause language is actively harmful to organizations' treatment and understanding of outages, so we don't use that
    terminology on this blog.

[^3]: Err, it will be published.  Sometime.

[^4]: Definitely pronounced Ayyy-Emm-Eyye, not "ah-me".

[^5]: We practice blameless postmortems around here, so you'll notice that we don't actually include the name of the
    engineer who made this mind-bogglingly dumb decision two years ago.

[^6]: Hehehehehheeuuuhehe

[^7]: Are you confused yet?

[^8]: Another, shall we say, _extremely baffling_ decision made by the only ACRL engineer who existed at the company two
    years ago, but who shall remain nameless, because again, Blameless Postmortems ™️

[^9]: By the way, this is one of the surprising behaviors of mutating webhooks: if the API server rejects the update for
    whatever reason, the webhook _is not notified_.  It has no idea that the mutation that it tried to make just failed.
    The other surprising bit here is that the error message returned to the initiator of the request _includes_ the
    mutations made by the webhook, which can result in some extremely weird and hard-to-troubleshoot
    spooky-action-at-a-distance issues, like in this case.
