# Research

Applied Computing Research Labs is dedicated to advancing the state of the art in distributed systems through rigorous,
open-source research applied in practical settings.  ACRL's team, led by experts with strong academic credentials, has
pioneered innovative approaches to solving complex computational challenges.

Here are some of our most exciting research projects:

<div class="subsection" markdown="1">
### Kompile

Kompile allows you to sidestep the "monolith vs. microservices" question; write a single program in Go and automatically
"compile" it to run on Kubernetes.  Goroutines are converted to microservice calls, and channel communications are
converted to network requests.  Joint work with Tim Goodwin at UCSC.

<div class="buttons">
  <a href="https://www.youtube.com/watch?v=QcYsGytNBe8" class="primary external">Watch the talk!</a>
  <a href="https://github.com/acrlabs/kompile" class="github"></a>
</div>

</div>

<div class="subsection" markdown="1">
### Cluster Autoscaler/Karpenter Comparison

An in-depth analysis comparing the performance of the Kubernetes Cluster Autoscaler and Karpenter, two competing
node autoscaling solutions for Kubernetes.

<div class="buttons">
  <a href="https://www.youtube.com/watch?v=DvNh4Isqjng" class="primary external">Watch the talk!</a>
  <a href="https://blog.appliedcomputing.io/p/using-simkube-10-comparing-kubernetes" class="primary external">Read the post!</a>
  <a href="https://github.com/acrlabs/simkube" class="github"></a>
</div>

</div>

<div class="subsection" markdown="1">
### Kube-scheduler-rs

A "reference" implementation for building a Kubernetes scheduler in Rust, using the [kube-rs](https://github.com/kube-rs/kube)
Kubernetes API bindings and controller utils.

<div class="buttons">
  <a href="https://blog.appliedcomputing.io/p/writing-a-kubernetes-scheduler-in" class="primary external">Read the post!</a>
  <a href="https://github.com/acrlabs/kube-scheduler-rs-reference" class="github"></a>
</div>

</div>

<div class="subsection" markdown="1">
### prom2parquet and DataKube

Tools for collecting, storing, and analyzing Prometheus metrics from Kubernetes.  `prom2parquet` is a remote-write
backend for Prometheus that saves time-series data to parquet files.  DataKube is a DuckDB-backed collection of utility
functions for analyzing the collected data.

<div class="buttons">
  <a href="https://blog.appliedcomputing.io/p/introducing-prom2parquet-its-time" class="primary external">Read about prom2parquet!</a>
  <a href="https://blog.appliedcomputing.io/p/analyzing-simkube-10-how-well-does?utm_source=publication-search" class="primary external">Read about DataKube!</a>
  <a href="https://github.com/acrlabs/prom2parquet" class="github"></a>
</div>

</div>

<div class="subsection" markdown="1">
### 🔥Config

FireConfig is a prototype of a Python-based configuration-as-code library for generating Kubernetes manifests built on top
of [cdk8s](https://cdk8s.io).

<div class="buttons">
  <a href="https://blog.appliedcomputing.io/p/revisiting-config" class="primary external">Read the post!</a>
  <a href="https://github.com/acrlabs/fireconfig" class="github"></a>
</div>

</div>
