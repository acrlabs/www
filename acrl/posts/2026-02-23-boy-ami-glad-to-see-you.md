---
title: "Boy AMI glad to see you"
authors:
  - ian
datetime: 2026-02-23 11:00:00
template: post.html
---

We're pleased to announce that two AMIs
([Amazon Machine Images](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html)) have joined the
[SimKube](https://simkube.dev/) family! Yes, twins: `simkube-x86-64` and `simkube-github-runner-x86-64` are now
available in the AWS Marketplace. Each came in at a healthy 17 GiB snapshot weight[^1]. They arrived about two months
apart due to the famously transparent AWS Marketplace approval process.

I'll explain what each of these AMIs are and how we build them in due course, but first off, let's address an important
question:

## Two AMIs, in THIS economy?

We know it's crazy, who even has the action minutes to raise AMIs these days; we sure don't. But we had a problem, or
maybe an opportunity. SimKube just keeps getting better and better but configuring it can be, frankly, difficult.
Building high-fidelity simulation environments requires installing and configuring a long list of tools:
[kind](https://kind.sigs.k8s.io/), [KWOK](https://kwok.sigs.k8s.io/),
[kubectl](https://kubernetes.io/docs/reference/kubectl/), [Docker](https://docs.docker.com/),
[prometheus](https://prometheus.io/docs/introduction/overview/), and SimKube, to name a few. So spinning up a
ready-to-go SimKube environment takes some doing.

Internally, we have a configuration management repository called
[isengard](https://blog.appliedcomputing.io/p/what-to-expect-when-youre-expecting)[^2]. It is ~48k lines of pure
[Ansible](https://docs.ansible.com/) bliss. We use it to automate the deployment of repeatable simulation environments.
It occurred to us that users of SimKube probably don't want step one of using it to be "here's ~48k lines of Ansible,
good luck!". It turns out there is a better way: a custom SimKube AMI.

## Why not a Docker image like a normal person?

That's a fair question. We did evaluate using a Docker image because one of our primary goals is a fast, one-click
startup.

The challenge is that SimKube relies on `kind`, which spins up Kubernetes nodes as Docker containers. Initializing and
configuring the kind cluster requires access to a live Docker daemon. During `docker build`, there is no Docker daemon
available inside the build environment, which means we can’t just “run all the setup steps in our Dockerfile” and ship
the result.

We also looked at snapshotting a running Docker environment, but that's complicated for a different set of reasons. So
after a long side quest that included Vagrant and QEMU, we realized what we actually need isn't a container image but a
prebuilt machine image that preserves the state of our configured simulation cluster. Since we primarily work in AWS, an
AMI fits naturally.

## Baking the AMIs

Fortunately, baking AMIs is a fairly straightforward task that our ancestors have been doing for thousands of years. We
can reuse a lot of what we have already built in our configuration management system (which I will remind you is lots
and lots of Ansible). We use [Packer](https://developer.hashicorp.com/packer/docs) to bake our AMIs, so the first step
is selecting a base image which our custom AMI will be built on top of. We chose Ubuntu 24.04 LTS for its stability,
compatibility with our tooling, and long term security patching.

Using Packer we can initiate an automated build via a GitHub Action. For configuration, Packer includes a range of
provisioners---[including one for Ansible](https://developer.hashicorp.com/packer/integrations/hashicorp/ansible/latest/components/provisioner/ansible)--so
we are able to leverage our existing configuration library in `isengard`. The GitHub Action itself is fairly simple: it
clones the repo and runs packer. This helps keep our Packer configuration sparse and maintainable. We only need to
configure a handful of things: the Ansible playbook to run, the region of our builder, our base AMI, regions to copy the
finished AMI to, and any cleanup activities or supplemental provisioners.

<figure markdown>
  ![A screenshot of a an AMI pipeline showing the relationships between GitHub Actions, Packer and Ansible](/img/posts/ami-pipeline.png)
  <figcaption>An AMI pipeline we can live with.</figcaption>
</figure>

Our AMI pipeline is triggered by a weekly cron trigger, or by a manual build via a dispatch trigger[^3]. After some bake
time, we end up with a custom AMI image backed by the snapshot created during the build. That AMI is then listed on the
Marketplace.

## AMI patching

Shipping a public AMI means we own patching it. At a minimum, Ubuntu is going to ship security patches (we really want
those) and there will be patches for other software in our stack. Instead of patching in place, we treat each AMI build
as an immutable artifact tied to the `isengard` git hash used to produce it. Every build is traceable and reproducible.

Every time our pipeline runs, it starts fresh with a clean Ubuntu image and pulls down the latest patches so each AMI is
fully up to date at build time. The result is a simple, deterministic build process that is easy to maintain. AMIs are
short-lived, they won't drift over time, and there is no ambiguity about which code produced which image.

The tradeoff is that older AMIs are never patched. If you launch an older version, you get exactly what existed at build
time. For our use case, this ends up being a feature since we value the reproducibility this gives us. This comes in
handy for debugging thorny issues in our AMIs, especially those that manage to bypass our validation tests. We can fire
up an AWS EC2 instance and watch one of our services get clobbered in real time by some bad code that I definitely
didn't write.

For the most part our AMI pipeline quietly churns out new images. To keep our account from piling up with tons of old
AMIs[^4], we use a
[Packer post-processing block](https://developer.hashicorp.com/packer/docs/templates/hcl_templates/blocks/build/post-processor)
to deprecate old AMIs and clean up their snapshots automatically.

## You said TWO AMIs

I did say that! We have two versions of our AMI. The first is the SimKube AMI with everything needed to run SimKube
including a running kind cluster and management tools. This is our free-to-use simulation environment. All the user
needs to do is launch it in AWS EC2 and get right to running simulations---though you will need a trace from the cluster
you are simulating.

The second AMI is our SimKube GitHub Action Runner. it includes everything in the SimKube AMI but also has some extra
configuration applied. We use an iterative build process, so this version is literally built on top of the base SimKube
AMI[^5].

<figure markdown>
  ![A screenshot of a an an AMI lineage diagram showing the inheritance of AMIs from Ubuntu 24.04 LTS, down to simkube-x86-64, and finally to simkube-github-runner-x86-64](/img/posts/ami-lineage.png)
  <figcaption>Built on the shoulders of giants.</figcaption>
</figure>

This cuts down on build time and allows us to patch the GitHub Action Runner software independently of the base AMI if
we wish. The additional configuration in this version is the GitHub runner software and a systemd wrapper that manages
it. We use this version to run SimKube in CI pipelines (via
[GitHub Actions](https://docs.github.com/en/actions/get-started/understand-github-actions)). Effectively, this AMI is
primed to register itself with a GitHub repo as a custom action runner when it receives the information contained in our
User Data script.

## A world of opportunities

Our SimKube AMI is a step forward in making SimKube approachable and easy to use. Instead of spending a few hours
setting up a simulation environment, you can grab the SimKube AMI off the AWS Marketplace and have SimKube up and
running in a couple of minutes. You will need to
[grab a trace](https://simkube.dev/simkube/docs/intro/running/#step-1-collect-a-trace) from your production cluster, but
the environment for running those simulations is available at the click of a button or at the end of a AWS CLI command.

We want to continue to extend Kubernetes simulation into CI pipelines using our GitHub runner AMI. The vision is an
engineer, maybe you, checks in some change to your cluster. Then, SimKube CI simulates it based on your production
cluster and sends you back metrics you can use to evaluate your change before it hits production.

Today, ACRL is already running small simulations in CI in the
[SimKube repo](https://github.com/acrlabs/simkube/blob/main/.github/workflows/simkube_e2e.yml). We have developed custom
GitHub Actions to make launching runners backed by SimKube AMIs as easy as adding a few lines in your GitHub Actions
workflow.

So maybe you find SimKube interesting but setting it up has been too much of a hassle. Or perhaps you are already
running SimKube locally but want to run a dozen simultaneous simulations in AWS. The AMIs are there for you, and the
SimKube AMI is free-to-use--though you still have to pay AWS for the compute (sorry).

If you want to learn more, we've added a new [SimKube in the Cloud](https://simkube.dev/simkube/docs/infra/overview/)
section to the documentation that walks through how they work and how to get started.

So get out there and simulate some trouble... before it makes it to prod!

Cheers,

Ian

[^1]: Is snapshot weight part of the APGAR score?

[^2]: Pronounced: nerds

[^3]: Builds are expensive from an action minutes perspective

[^4]: Ask me how I know that EBS volume storage costs extra

[^5]: Andddd now the twins metaphor has completely broken down.
