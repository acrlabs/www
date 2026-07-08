---
title: "The Seven Stages of CI Grief"
authors:
  - ian
datetime: XXXX-XX-XX 11:00:00
template: post.html
---

On the pain scale, a root canal might be an eight. CI-related pain is an eleven. After months of successfully, if
slowly[^1], churning out AMIs for ACRL, my Packer pipeline started failing. But I write to you with hope. I am happy to
report that after working through the Seven Stages of CI Grief I have finally fixed our AMI pipeline and did not leave
the profession to raise goats.

Six months and several millicores ago I [built an AMI pipeline](./2026-04-13-boy-ami-glad-to-see-you.md) for ACRL. We
needed a way to automate builds for the SimKube AMI and SimKube GitHub Action Runner AMI. Each piece of our pipeline was
carefully chosen and to this day mostly defensible: Ansible, Packer, and GitHub Actions. Simple and boring. One of these
helpful tools was about to ruin my ~~week~~ month.

## The Seven Stages

### Stage 0: Blame

It was a rainy Tuesday morning[^2]. I logged in to AWS to find an EC2 instance had escaped containment. My AMI pipeline
hit an error and unfortunately bypassed cleanup. Not the end of the world but certainly annoying and wasteful. The
GitHub Actions log showed an error during the
[Ansible provisioner](https://developer.hashicorp.com/packer/integrations/hashicorp/ansible/latest/components/provisioner/ansible)
phase of my Packer build. The error type was new, an EOF. Which I Googled. The first result said that EOF stood for "End
of File" and could be a connection issue. I immediately thought "Oh, some change in our Ansible repo is causing our
connection to time out, no big deal." The last commit to the Ansible repo was authored by @drmorr so obviously I didn't
cause this problem.

Adding it to our issue tracker, I set it aside. I told myself I had other, more important, things to work on. This would
be an easy fix I could get to later. Right?

### Stage 1: Retrying

A few weeks later I'm finally getting back to it. Now I really need to sort this out. The AMIs must flow. I look at the
last commit in the Ansible repo, the suspect one that @drmorr shipped. There is nothing obviously wrong with it, just
some [CopyFail](https://github.com/theori-io/copy-fail-CVE-2026-31431) mitigation. I do the most optimistic thing
possible: I rerun the pipeline. It's probably worth noting that our AMI pipeline is initiated via a GitHub Action which
clones our Ansible repo and configures Packer. Then, it runs our Packer build which provisions an EC2 instance and runs
the Ansible provisioner against it. Finally, once the provisioner steps complete we snapshot the instance and copy it to
the regions it needs to appear in[^3].

The rerun fails: EOF. I rerun it again this omitting @drmorr's changes by reverting to the previous commit. Same
failure, EOF. No detail. I test it again with an even older branch and, yep, EOF again.

This is starting to get weird. That last commit I tried was the code used to produce and ship our last AMI artifact. It
isn't working now. Now I'm scared. A known-good version is now no longer good, so we aren't chasing a simple bad commit.

### Stage 2: Self-Recrimination

I'm looking at my creation with disdain and realize that I am Dr. Frankenstein and this CI pipeline is MY monster.
Lovingly crafted from parts of FOSS, abstractions I thought I understood. For what? To be trapped in an EOF prison of my
own design. There are so many places this issue could be. I wanted to do anything else. I suspect every piece of the
pipeline, including its creator, is to blame. Pinching the bridge of my nose I tell myself: "It's not the end of the
world. We've got a few culprits." This issue could be Packer, Ansible, GitHub Actions, SSH, EC2 networking, the bastion,
or a poltergeist. At this stage it's dangerous to rule anything out. It **has** to be one of them.

### Stage 3: Isolation

Debugging CI sucks. So I have an idea: let's first make sure it's a CI problem. Because if I can choose, I would rather
solve a non-CI problem. I'm an optimist. The easiest isolation is running the Ansible playbook locally, it isn't the
exact same as configuring a remote, but it will rule out a lot of Ansible[^4] and it's **fast**. I run the Ansible
playbook locally and it works, no errors. I now know that the vast majority of our configuration management system is
working. Now I can move a little closer to reality, so I create an EC2 instance and add it to a test inventory and
repeat my Ansible playbook run. Now I'm configuring a remote host, so all of our common remote configurations will also
be applied. This is where I expect the issue to arise. It does not. The playbook completes, I do some spot testing to
confirm, and everything is as it should be.

The problem was not "Ansible can't configure the instance." The problem was "Ansible can't configure the instance when
Packer is orchestrating from CI". I'm devastated because the issue only appears in CI which means repeated testing is
going to be an absolute **pain in the ass**[^5].

### Stage 4: Bargaining with SSH

If you've ever used Packer, or any image build tool, you know how slow the feedback loop can get. I'm devastated because
my feedback loop just went from a few minutes to a meaningful fraction of an hour. At this point I know I've got
something weird going on, and it doesn't seem to be related to one of our Ansible roles.

So I get sidetracked and start furiously Googling: "Packer+EOF", "Ansible+EOF", "EOF+WTF?". None of the GitHub issues
and StackOverflow posts I am finding seem to align with the EOF error I am seeing. Lots of comments like "EOF means End
of File, dummy," as if that tells me everything I need to know. When I stop skimming and start reading in more detail it
seems that EOF is often a symptom of connection-related issues. Somewhere in the communication between my GitHub runner
that is executing the configuration and the EC2 instance that is being configured we are losing the plot. Ansible is
waiting for a signal that it is never going to receive and the result is EOF.

It's going so poorly at this point I ask Claude and it says this is a classic issue with SSH multiplexing. Spoiler: it
was not SSH multiplexing.

I don't believe Claude. But I try changing our SSH configuration anyway. I change SSH variables in Ansible and pass
extra SSH args via Packer. Now I'm turning off multiplexing: EOF, increasing timeouts: EOF, and fiddling with
keepalives: EOF. In frustration, I have to walk away.

I'm stuck in an SSH tunnel, and my canary just died.

### Stage 5: Log Diving

Okay, it's a new day now. We're going back to basics. I turn Ansible verbosity way up `-vvvv` and set it to output to a
logfile. I turn on `PACKER_LOG` too. The build now takes forever. The reason is that all these logs are being
round-tripped over SSH and it's slow as hell. The build takes so long my build times out at my 90-minute cutoff. I drop
verbosity to `-vvv`; still timing out. I set the build timeout to two hours, I **finally** make it to my EOF with some
enhanced logging. The logging doesn't provide any more context. I can't live like this.

While I'm at it I keep a builder EC2 alive after the provisioner fails to inspect it. The EC2 instance is fine[^6]. It's
patiently waiting for the next instruction from Ansible. The logs don't point to what is broken, but they do tell me one
thing: the build isn't failing because of a specific Ansible task. The issue is not with the target machine. It seems to
be somewhere in my connection to it. I haven't found a smoking gun. I'm starting to become SSH-skeptical.

### Stage 6: Acceptance

It could be an SSH issue. We have some proxying going on. Our GitHub Action runner has to tunnel through a bastion to
get to our EC2 instance. I start looking into how Packer handles connections, and it has its own
[SSH communicator](https://developer.hashicorp.com/packer/docs/communicators/ssh). I experiment with Packer's SSH
settings and realize that I can remove another layer: by turning off the Packer proxy and using a standalone SSH agent.
On a whim, I add [webfactory/ssh-agent](https://github.com/webfactory/ssh-agent), configure the agent once early in the
run, and set `packer_proxy = false`. Boom, it works the first time and we haven't seen an EOF since.

I wish I could say I know exactly what I was doing wrong with our Packer SSH settings. I am pretty sure it was a "me"
problem because lots of folks are using it without issue. Perhaps they have less proxying, fewer long-running Ansible
tasks, or simply aren't cursed by the Packer gods. But if it doesn't spark joy, remove it. I find the standalone SSH
agent much more comprehensible. It actually makes all the SSH management more straightforward and transparent.

## Conclusion

Maybe you saw a little of your own CI frustrations in this post. Maybe you think I'm being silly and should just be
using the
[ansible-local provisioner](https://developer.hashicorp.com/packer/integrations/hashicorp/ansible/latest/components/provisioner/ansible-local)
in Packer and cleaning up my AMI before it's published. That also would have solved my problem, but one of the reasons
we wanted to avoid the `ansible-local` provisioner was specifically to prevent unnecessary cleanup work for our public
AMIs. Yes, executing Ansible over SSH is slow, but it's been fast enough for our needs. We want a ~~simple~~ boring AMI
pipeline. By adding a standalone SSH agent we managed to make it a little more boring. We are using Packer only for the
piece we really need Packer for and that's for the best.

I hope that my misguided meanderings trying to debug this issue and recounting it here for your enjoyment will save one
person a little time. If you find this post in the year 2056 and are experiencing EOF errors in your Packer pipeline, I
would recommend the following EOF pain-reduction plan:

1. Rule out the easy stuff: run a local Ansible test.
2. Test the build against an EC2 instance using a test inventory.
3. If that all worked fine, but you are still getting EOFs, I would recommend testing a standalone SSH agent and turning
   off the Packer proxy: `packer_proxy = false`
4. If you are still getting EOFs, I apologize. I have failed to solve your problem. Please send your complaints directly
   to @drmorr.

Cheers,

Ian

P.S. @drmorr set up a Tailscale tailnet for ACRL. So in the future I'll be adding my GitHub Runner that executes the AMI
pipeline to the ACRL tailnet. That means we won't have to make the bastion hop to reach the EC2 instance. Exciting!

[^1]: VERY slowlyyyyy.

[^2]: I live in Portland, Oregon it rains on average ~3 out of 7 days.

[^3]: Mold moves faster. About half of our pipeline's total runtime is copying the snapshot across regions.

[^4]: We have a LOT of Ansible.

[^5]: To the editorial board, I plead for mercy.

[^6]: Later I forget to terminate it. Our AWS bill is now forty billion dollars. Send help.
