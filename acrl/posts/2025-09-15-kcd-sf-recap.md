---
title: "Kubernetes Community Day SF Bay Area - Recap"
authors:
  - drmorr
datetime: 2025-09-15 11:00:00
template: post.html
---

Last week I had the privilege[^1] of attending the first-ever [Kubernetes Community Days in the San Francisco Bay
Area](https://kcdsfbayarea.com)!  It was a super cool event, and I had a bunch of great conversations with folks.  I
loved how it had the feel of a mini-KubeCon, but was way smaller.  I was able to attend every single talk!  Amazing!

Anyways in this post I'm gonna do a quick recap of my top three favorite talks, in order of appearance.  I _believe_ the
sessions were recorded and will get posted online at some point, but I don't see them there yet.  I'll update this post
with links once that happens!

## You Can’t Handle the Root! Container Isolation for Secure Multi-tenancy by Mariana Moore at Edera

This was the second talk of the day and it was a really great overview of the state of security primitives and isolation
in Kubernetes.  The tl;dr here is that containers aren't _actually_ a good security boundary; it's better to think about
them as an abstraction boundary.  The reason for this is that containers all share the same underlying kernel, which
means that if there's a kernel exploit, users can break out of containers and learn information about the host or about
other containers on the system.  And while the Linux kernel is "reasonably" secure, it's still a big attack surface and
it has lots of CVEs.  So what other isolation mechanisms are out there for security in a cloud-native world?

Mariana broke down three alternatives: runtime isolation, node isolation, and hardware isolation.  Runtime isolation
relies on virtualization primitives offered by the hardware, instead of kernel-level isolation.  Traditionally this has
meant "virtual machines" like VirtualBox or Qemu, but recently there've been a bunch of interesting "microVM" projects
that try to provide a smaller, more light-weight, "container-like" interface while still relying on hardware
virtualization.  [Firecracker](https://github.com/firecracker-microvm/firecracker?tab=readme-ov-file) and [Cloud
Hypervisor](https://github.com/cloud-hypervisor/cloud-hypervisor) are a couple projects in this space, and [kata
containers](https://katacontainers.io) provide a Kubernetes interface to microVMs.  There's some really cool stuff
happening in this space, and I've dabbled with it just a tiny amount, but would love to do more!

The next level of isolation Mariana discussed is "node-level" isolation, where you just run your entire system on a
single (bare metal) node, which allows you to directly control everything that's running and impose whatever security
boundaries you want.  This is very easy to do, but you lose a lot of benefits of cloud native technology by doing this.

The last level of isolation is hardware isolation.  One way of doing this is by running an air-gapped cluster, but
another option that Mariana discussed is using cryptographically-secure hardware primitives to provide processes with
their own memory space that is provably[^2] inaccessible to any other processes on the system.  This is still a fairly
new space, and there's not good support for these kinds of features in Kubernetes yet, but we're getting there.

The last point Mariana made, which I thought was fascinating and concerning, is that many of these primitives are fairly
well understood in the traditional hardware model, but they totally break down when we start looking at GPUs.  GPUs (by
design) have almost no isolation primitives, and especially with the advent and adoption of [DRA](https://kubernetes.io/docs/concepts/scheduling-eviction/dynamic-resource-allocation/)
in Kubernetes, this is a space that's rife for exploitation.

## Best Practices for GitOps Promotions by Dan Garfield (Argo, CodeFresh, Open GitOps)

Later in the day, there was a great talk about how to actually deploy your software.  The tl;dr of this talk is that
everybody means something different when they use words like "application", "service"[^3], or "production", and, maybe
we should stop overloading all these damn terms and agree on some common terminology.

Dan went through a bunch of "best practices" for developers and organizations who want to "get their change in front of
users with as few problems as possible"; he presented from a "GitOps" perspective, which makes sense since
[ArgoCD](https://argo-cd.readthedocs.io/en/stable/) is a giant GitOps platform[^4], but I think all of these best
practices make sense regardless of your deployment tool of choice.  Here are a couple of the insights Dan shared:

First, pick a versioning that actually conveys information.  Lots of people like to use SHAs, because it "uniquely"
identifies the code that's running, but these are actually the worst version indicator.  They convey _zero_ information
about what's actually running.  SemVer is slightly better, because at least it gives you some ordering information
(_this_ version comes before _that_ version).  But even this isn't perfect, because Docker tags (which commonly
reference a version number) are _mutable_[^5].

Secondly, make sure things are discoverable, simple, and obvious.  The example he gave here is that, in some circles, it
is "in vogue" to store different environment configuration on different branches in your Git repo.  This seems really
appealing at first, but it's actually a huge trap!  Not only is it not obvious what branch corresponds to what
environment, when it comes to making changes, it's exceptionally brittle.  What if you need to make the same change
across all environments?  Oh!  We'll just cherry-pick!  Except that the commit that you cherry-picked accidentally
included some code that isn't relevant to the new environment, so we have to go revert that.  And now it's not really
the same commit anymore, and who knows if it's going to break when you roll it out.  Instead, if you keep things all on
your main branch, separated by folders, it's much easier to understand what code is supposed to be running when and
where[^6].

Dan wrote up a [blog post](https://codefresh.io/blog/why-environments-beat-clusters-for-dev-experience/) version of this
talk if you'd like to learn more and don't want to watch the talk.

## 10 Things That Super Mario Taught Me About Platform Engineering by Ramiro Berrelleza at Okteto

The last talk I'm going to highlight I'd seen a version of before at the Cloud Native PDX meetup I went to a couple
months ago.  This talk was not super-technical, but it _was_ a delightful discussion of how to keep our jobs _fun_.  I
loved this talk both times I saw it, Ramiro is a really engaging speaker and there's lots of fun anecdotes and analogies
between classic platform games and modern platform teams[^7].  I'm just going to spoil his talk here by posting the
summary of his "ten things platform teams should do", but I'd really strongly encourage you to go watch the original!

<figure markdown>
![Summary of 10 things that Super Mario taught me about Platform Engineering, with Ramiro on stage at KCD SF](/img/posts/supermario.jpg)
</figure>

1. Save them from jumping into cliffs
2. Start easy, then expose the complexity
3. Repeatable patterns let you build a strong foundation
4. Have a clear win after the big boss
5. Ship a sequel so you build a following
6. Let Princess Peach save _you_ from time to time
7. Give your players shortcuts
8. Have your Nintendo Power Hotline available
9. Everyone should have fun
10. If you die, restart!

## Introduction to Bootable Containers by Josh Berkus (Red Hat)

OK I know I said "top three" but this one is my honorable mention.  Josh's talk was the last one of the day, and I'm not
going to cover all the details, because this post is already too long[^8], but the short version is that
[bootc](https://github.com/bootc-dev/bootc) is a tool that lets you build bootable virtual machine images from container
files[^9].  Josh showed how you could use `bootc` to construct a bootable Kubernetes VM image that you could load onto a
bare-metal host, which also handles a bunch of nifty details with rollbacks and failure scenarios.  Super-cool tech,
would definitely recommend checking it out!

Anyways, that was my summary of my first KCD event---definitely would recommend seeing if there's one in your area and
checking it out[^10][^11]!  And I'm getting excited to gear up for the full-scale version, i.e., KubeCon in Atlanta this
November!  I have a bunch of cool stuff lined up in advance of KubeCon that I'm excited to share with you all!  But that
will have to wait for another post.

As always, thanks for reading.

~drmorr

[^1]: Well, except for the traffic in Mountain View, holy cow, I can't even comprehend how y'all deal with that on a
    daily basis.

[^2]: Insofar as anything in modern day cryptography is provable, at any rate, which is to say, [not provable at
    all](https://www.ams.org/notices/201003/rtx100300357p.pdf)

[^3]: I will never understand the rationale behind using "[Service](https://kubernetes.io/docs/concepts/services-networking/service/)"
    in the Kubernetes lingo to refer to, essentially, a DNS entry.

[^4]: It's also apparently the third-most-popular project in the CNCF???  I haven't gotten a chance to use it yet, but
    I'm hoping to get it set up someday.

[^5]: Another design decision I will never understand.

[^6]: I've actually hit this exact issue in a small scale when I was back in grad school.  I would keep my papers in a
    Git repo; the main branch would contain my unformatted pre-print text, and when I prepared the article for
    submission to a specific journal, I would branch off from main for that specific journal.  This worked great until I
    got reviewer feedback, and then I needed to either apply that to the branch and backport to main, or vice versa, and
    it became _extremely_ difficult to tell what version of the paper was where.  If I were to do this again in the
    future, I'd organize everything in folders, and maybe see if there was some clever thing I could do using symlinks
    or whatever to the main paper source.

[^7]: Hehehehehehe.  See what he did there?  I see what he did there.

[^8]: Though I have a long [mastodon thread](https://hachyderm.io/@drmorr/115176873209244750) with the blow-by-blow, if
    you're curious.

[^9]: For example, your `Dockerfile`, unless you're using `podman` and then I guess they're called `Containerfile`s.

[^10]: And hopefully wherever you are has better traffic than Mountain View.  Holy hell, that traffic tho.

[^11]: Ok look I promised myself I wouldn't spend the whole post complaining about the Mountain View traffic, but
    the folks there were complaining about all the rain on the roads, and how drivers in California don't know how to
    drive in the rain, _and it wasn't even raining outside!!!!!!!_
