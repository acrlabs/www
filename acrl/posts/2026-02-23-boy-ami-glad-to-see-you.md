---
title: "Boy AMI glad to see you"
authors:
  - ian
datetime: 2026-02-23 11:00:00
template: post.html
---

We're pleased to announce that two AMIs ([Amazon Machine Images](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html)) have joined the [SimKube](https://simkube.dev/) family! Yes, twins: `simkube-x86-64` and `simkube-github-runner-x86-64` are now available in the AWS Marketplace. Each came in at a healthy 17 GiB snapshot weight.[^1] They arrived about ten days apart due to AWS' famously transparent Marketplace approval process. 

I'll explain what each of these AMIs are and how we build them in due course but first off lets address an important question:

## Two AMIs, in THIS economy?

We know it's crazy, who even has the action minutes to raise AMIs these days; we sure don't. But we had a problem, or maybe an opportunity. SimKube just keeps getting better and better but configuring it can be, frankly, difficult. Building high-fidelity simulation environments requires installing and configuring a long list of tools: [kind](https://kind.sigs.k8s.io/), [KWOK](https://kwok.sigs.k8s.io/), [kubectl](https://kubernetes.io/docs/reference/kubectl/), [docker](https://docs.docker.com/), [prometheus](https://prometheus.io/docs/introduction/overview/) and SimKube to name a few. So shipping a usable SimKube environment batteries included takes some doing.

Internally, we have a configuration library called `isengard`[^2]. It is ~48k lines of pure [Ansible](https://docs.ansible.com/) bliss. We use it to automate the deployment of repeatable simulation environments. It occurred to us that users of SimKube probably don't want step one of using it to be "here's ~48k lines of Ansible, good luck!". It turns out there is a better way: a custom SimKube AMI. 

## Why not a docker image like a normal person?
That's a fair question. A docker image was our initial direction, but not for very long. The tools we depend on expect direct access to a docker engine on the host not one nested inside another container. 

We've  experimented with some [docker-in-docker](https://www.docker.com/resources/docker-in-docker-containerized-ci-workflows-dockercon-2023/) before, and while it works there are trade offs. For our specific use case, the decision came down to fidelity and predictability. SimKube is designed to model production Kubernetes clusters in a repeatable way. Introducing a nested container runtime adds indirection, performance variability and more difficult debugging.

Since we primarily work in AWS, an AMI fits naturally. In our case, the operational cost of DinD outweighed the convenience of shipping everything as a docker image.

## Baking the AMIs
Fortunately, baking AMIs is a fairly straightforward task that our ancestors have been doing for thousands of years.  We can reuse a lot of what we have already built in our configuration management system (which I will remind you is lots and lots of Ansible). We use [Packer](https://developer.hashicorp.com/packer/docs) to bake our AMIs so the first step is selecting a base image, the base image is what our custom AMI will be built on top of. We chose Ubuntu 24.04 LTS for its stability, compatibility with our tooling, and long term security patching. 

Using Packer we can initiate an automated build via a GitHub Action. For configuration, Packer includes a range of provisioners including one for Ansible so we are able to leverage our existing configuration library in `isengard`. Our action is fairly simple, we clone our repos and run packer. Since all our configuration and validation is in Ansible which keeps our Packer configuration fairly sparse. We only need to configure a handful of things like the Ansible playbook to run, the region of our builder, our base AMI, regions to copy the finished AMI to and any cleanup activities or supplemental provisioners.

<figure markdown>
  ![A screenshot of a an AMI pipeline showing the relationships between GitHub Actions, Packer and Ansible](/img/posts/ami-pipeline.svg)
  <figcaption>An AMI pipeline we can live with.</figcaption>
</figure>

Our AMI pipeline is triggered by a weekly cron trigger in our GitHub Action since builds are relatively expensive from an action minutes perspective. In practice we also end up doing some manual builds here or there using a dispatch trigger. After some bake time, we end up with a custom AMI image backed by the snapshot created during the build. That AMI is then listed on the Marketplace. 

## AMI patching
Shipping a public AMI means we own patching it. At a minimum, Ubuntu is going to ship security patches, we really want those, and there will be patches for other software in our stack. Instead of patching in place we treat each AMI build as an immutable artifact tied to the git hash of the configuration library used to produce it. Every build is traceable and reproducible. 

During provisioning, we pull the latest available patches. Every time our pipeline runs, we are rebuilding the image from a clean base Ubuntu image and applying any updates. The upside is a simple, deterministic build process that is easy to maintain. AMIs are relatively short lived, they won't drift over time, and there is never ambiguity about which code produced which image.

The tradeoff is that older AMIs are never patched. If you launch an older version, you get exactly what existed at build time. For our use case, this ends up being a feature since we value the reproducibility this gives us. This comes in handy for debugging thorny issues in our AMIs, especially those that manage to bypass our validation tests. We can fire up an AWS EC2 instance and watch one of our services get clobbered in real time by some bad code that I definitely didn't write. 

For the most part our AMI pipeline quietly churns out new images. To keep our account from piling up with tons of old AMIs[^3], we use a Packer post-processing step to deprecate old AMIs and clean up their snapshots automatically. 

## You said TWO AMIs
I did, we have two versions of our AMI. The first is the SimKube AMI with everything needed to run SimKube including a running kind cluster and management tools. This is our free to use simulation environment. All the user needs to do is launch it in AWS EC2 and get right to running simulations, though you will need a trace from the cluster you are simulating. 

The second AMI is our Simkube GitHub Action Runner, it includes everything in the SimKube AMI but also some extra configuration steps. We use an iterative build process, so this version is leterally built on top of the base SimKube AMI.[^4] 

<figure markdown>
  ![A screenshot of a an an AMI lineage diagram showing the inheritance of AMIs from Ubuntu 24.04 LTS, down to simkube-x86-64m, and finally to simkube-github-runner-x86-64](/img/posts/ami-lineage.svg)
  <figcaption>Built on the shoulders of giants.</figcaption>
</figure>

This cuts down on build time and allows us to patch the GitHub Action Runner software independently of the base AMI if we wish. The additional configuration in this version is the GitHub runner software and a systemd wrapper that manages it. We use this version to run SimKube in CI pipelines (via [GitHub Actions](https://docs.github.com/en/actions/get-started/understand-github-actions)). Effectively, this AMI is primed to register itself with a GitHub repo as a custom action runner when it receives the information contained in our User Data script. 

## A world of opportunities
Our SimKube AMI is a step forward in making SimKube approachable and easy to use. Instead of spending a few hours setting up a simulation environment you can grab the SimKube AMI off the AWS Marketplace and have a simulation environment up and running in a couple of minutes. You will need to grab a trace from your production cluster, but the environment for running those simulations is available at the click of a button or at the end of a AWS CLI command. 

We want to continue to extend kubernetes simulation into CI pipelines using our GitHub runner AMI. The vision is an engineer, maybe you, checks in some change to your cluster. SimKube CI simulates it based on your production cluster and sends you back metrics you can use to evaluate your change before it hits production.  

Today, ACRL is already running small simulations in CI in the SimKube repo. We have developed custom GitHub Actions to make launching runners backed by SimKube AMIs as easy as adding a few lines in your GitHub Actions workflow.

So maybe you find SimKube interesting but setting it up has been too much of a hassle. Or perhaps you are already running SimKube locally but want to run a dozen simultaneous simulations in AWS. The AMIs are there for you and the SimKube AMI is free to use though you still have to pay AWS for the compute (sorry).

So get out there and simulate some trouble... before it makes it to prod!

Cheers,

Ian

[^1]:  Is snapshot weight part of the APGAR score?

[^2]: Pronounced: nerds

[^3]: Ask me how I know that EBS volume storage costs extra

[^4]: Andddd now the twins metaphor has completely broken down.
