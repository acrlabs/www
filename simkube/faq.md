<!--
template: docs.html
sidebar: false
title: FAQ
-->

# Frequently Asked Questions

[TOC]

## What kinds of things can you simulate?

In the standard configuration, your simulation cluster is running a real Kubernetes control plane, and fake nodes via
KWOK.  This means that any control plane behaviour (kube-scheduler, cluster autoscaler, a custom operator) can be
tested, and you can be sure it's running the same code that would be running in production.  However, the "data plane"
(that is, all of the other nodes and workloads) are fake.  So there's no Docker containers, no code, no network
requests, etc.  KWOK is simply reporting the pod status _as if_ there were real code running.

## Can you simulate the HPA or VPA?

The Horizontal and Vertical Pod Autoscalers not only rely on your configuration, but also on external metrics from
Prometheus, DataDog, or some other source.  Currently, SimKube doesn't know how to simulate metrics coming from
Prometheus, so the HPA will not work with SimKube right now.  However, that feature is on our roadmap for 2025!

## Can you simulate network traffic?

No.  There are no real pods running, which means there's nothing to respond to your network requests.  This is a
deliberate design decision, as there are a variety of other tools that are focused on the load testing, tracing, and
simulation of network requests for your applications.

## Can you simulate my custom controller?

It depends.  If your custom controller is using data sources other than what gets passed through the Kubernetes
apiserver, it won't work right now; otherwise, it should be fine!

## How can you analyze the results of a simulation?

SimKube includes some hooks for spinning up a temporary high-fidelity Prometheus instance, which is able to collect data
from your simulation while it is running.  You can export that data anywhere you want that understands Prometheus
metrics.

If you want to do in-depth data analysis on your simulation data, you might try using [prom2parquet](https://github.com/acrlabs/prom2parquet),
which acts as a remote write endpoint for Prometheus and will save all your data to Parquet files in Amazon S3 or
elsewhere.  You can then analyze this data using your favorite tool that understands Parquet files---DuckDB, Pandas,
etc.

Note that SimKube itself doesn't start `prom2parquet`, you'll have to install that separately in your cluster, but once
you have it installed, you can configure SimKube to write to it with the `--remote-write-endpoint` flag to `skctl run`.

## How does KWOK work?

The short answer is that it runs a Kubernetes controller that watches for Kubernetes `Node` objects, and updates these
Node objects to walk them through the node lifecycle states.  This "tricks" other Kubernetes components into thinking
there are real nodes present even though there's no hardware backing them.  For more details, see the
[KWOK](https://kwok.sigs.k8s.io) website.

## If everything is simulated with KWOK, where is the control plane running?

Your simulation cluster needs to have _some_ real nodes in it to run the apiserver, scheduler, and whatever other
components you want to analyze (as well as, of course, the KWOK controller).  It's all the _other_ stuff (application
code, etc.) that "runs" on the simulated nodes.

## Do you have to use KWOK?

No.  You can install the SimKube controller in any Kubernetes cluster you want; KWOK just gives you the ability to
simulate extremely large clusters in a cost-effective manner.

## How can you inspect the contents of a trace file?

As of SimKube 2.0, you can use `skctl xray` to inspect and validate the contents of a trace file.  The raw trace data is
stored in the [msgpack](https://msgpack.org) format, so if `skctl xray` isn't working for you, you can also use the
[msgpack-tools](https://github.com/ludocode/msgpack-tools) utility to view the contents of a trace file:

```
> msgpack2json -di path/to/trace
[
        "trackedObjects": {
            "apps/v1.Deployment": {
                "podSpecTemplatePath": "/spec/template"
            }
        }
    },
    [
        {
            "ts": 1711247936,
            "applied_objs": [],
            "deleted_objs": []
        },
        {
            "ts": 1711247936,
            "applied_objs": [
                {
                    "apiVersion": "apps/v1",
                    "kind": "Deployment",
                    "metadata": {
                        "annotations": {
                            "meta.helm.sh/release-name": "dsb-social-network",
                            "meta.helm.sh/release-namespace": "dsb"
                        },
                        "labels": {
                            "app.kubernetes.io/managed-by": "Helm",
                            "service": "compose-post-service"
                        },
                        "name": "compose-post-service",
                        "namespace": "dsb"
                    },
    ...
```
