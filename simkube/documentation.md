---
template: docs.html
---

# Documentation

## Overview

SimKube is a record-and-replay simulation environment for Kubernetes based on [KWOK](https://kwok.sigs.k8s.io), the
Kubernetes WithOut Kubelet project.  Read on to learn more!

<div class="buttons">
  <a href="/docs/install">Install SimKube</a>
</div>

<div class="subsection" markdown="1">
## Get started with SimKube!

Run the following commands for a SimKube quickstart!

1. `curl https://simkube.dev/traces/dsb-socialnetwork-scaling.trace > /tmp/dsb-socialnetwork-scaling.trace`
   (or click [here](https://simkube.dev/traces/dsb-socialnetwork-scaling.trace))
2. `git clone https://github.com/acrlabs/simkube && cd simkube`
3. `kubectl apply -k k8s/kustomize/sim`
4. `cargo install skctl`
5. `skctl run test-simulation -f ~/downloads/dsb-socialnetwork-scaling.trace`
</div>

<div class="subsection" markdown="1">
## How does SimKube work?

<div class="textwrap">
  <div id="architecture" class="img"></div>
  <figcaption>SimKube architecture diagram</figcaption>
</div>

SimKube has four main components, shown in orange in the diagram and described briefly here:

1. `sk-tracer` is responsible for collecting a _trace_, that is, a timeline of "important" events from your production
   Kubernetes cluster, and saving that trace to long-term storage (such as Amazon S3).
2. Your simulation environment is a separate Kubernetes cluster running `sk-ctrl` and `sk-driver`; `sk-ctrl` is a
   Kubernetes controller that orchestrates your simulation, and `sk-driver` is responsible for downloading a trace file
   and replaying it in the simulation cluster.
3. The user (you!) interacts with both the production and simulation clusters through the `skctl` CLI tool.

Your simulation environment is running a real Kubernetes control plane, including the apiserver, scheduler, and any
other control plane components (such as cluster autoscaler) that are relevant.  All of the nodes are fake---we use KWOK
to efficiently mock out hundreds or thousands of nodes and pods in your cluster on your laptop!
</div>
