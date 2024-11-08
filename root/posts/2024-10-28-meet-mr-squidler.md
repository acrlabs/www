---
title: Meet Mr. Squidler!
authors:
  - drmorr
datetime: 2024-10-28 11:00:00
template: post.html
---

<figure markdown>
  ![An orange octopus with a serious, but inquisitive and slightly playful expression on his face, holding a magnifying glass up to his eye.](/img/posts/mascot.png)
  <figcaption>Meet Mr. Squidler, the Kubernetes octopus detective.</figcaption>
</figure>

Hi, everyone -- short post this week!  I've been super-heads-down on a) finishing up a client project, b) getting my
talks ready for KubeCon[^1] [^2] [^3] [^4], and c) trying to drum up some new business.  I just wanted to share a couple
quick SimKube updates!

## A mascot _and_ a logo?  In this economy?

As I obliquely hinted at in my last post, SimKube now has an official mascot and a logo!  Mr. Squidler, the octopus
detective, was designed by the very talented [Mariana Mejia](http://marianamejiadesign.com/)[^5].  You can see him in the
header image for this post!

Despite his name, Mr. Squidler is actually an octopus.  An early conflict with a fiendish distributed systems villain
gave him his unfortunate name, which now causes no end of confusion with everyone he meets.  His ultimate goal is to
track down the dastardly miscreant who bestowed the sobriquet and exact revenge[^6], but in the meantime he helps people
save money on their Kubernetes infra by running experiments and simulations of their environment.

Mariana _also_ designed a new logo for SimKube, which I'm super-stoked about as well:

![a stylized SK logo, that looks vaguely like a network with circles and lines connecting them](/img/posts/sklogo.png)

I'm super happy with how this all turned out, and would definitely recommend working with Mariana in the future if you
have the opportunity!

## Skctl xray

The other bit that I wanted to share is a quick demo video of some new functionality that's (slowly) making its way into
SimKube.  As I mentioned last week, one common complaint that people have is the difficulty of getting started with
SimKube, and one source of that difficulty is "being able to tell if a trace file will work in a simulation."  A common
example is if your Kubernetes Pods have a particular [ServiceAccount](https://kubernetes.io/docs/concepts/security/service-accounts/)
that they belong to, but you forgot to configure `sk-tracer` to collect or export the ServiceAccounts in your production
cluster, then your simulation will fail to run.

An even more basic feature that people have asked for is the ability to see inside a trace file to understand what it's
(supposed to be) doing.  Well, both of these features can now be solved with a single tool that's built-in to the
SimKube CLI (called `skctl`[^7]).  If you run `skctl xray` on a trace, it will pop up a TUI[^8] that will show you the
contents of the trace, as well as highlight any problems that it detected with the trace file.  Check this demo out
(note: there's no sound)!

<video width="800" controls>
  <source src="/videos/posts/xray-demo.mp4" type="video/mp4">
</video>

Not all of the code for this is complete or published yet, but it should be "soon", and hopefully you can see the
vision.  I'm particularly excited about this work because I'm hoping that eventually `skctl xray` might be the main
entry point or interface for SimKube: I have visions of being able to launch, monitor, and analyze data from your
simulations all right from your command line!  But we're still a long ways from that being a reality.

Anyways, that's all I have for today.  Let me know if you try out `skctl xray`, or if you like this slightly
shorter-form content!  I may try putting out a bit more "short" content on weeks where I don't have as much to
share[^9].

Thanks for reading,

~drmorr

[^1]: I can't believe this is in two weeks!  Eeep!

[^2]: Did you know I'm giving not one, but _two_ talks at KubeCon and/or KubeCon adjacent events?  Oh, yea, I already
    mentioned that in my [last post](./2024-10-21-whats-next-simkube.md).

[^3]: Do you want to meet up sometime while I'm there?  Feel free to [reach out](https://appliedcomputing.io/contact)!

[^4]: This is a short post, so in order to meet my footnote quota I'm having to batch them up a little bit.

[^5]: Mariana also designed the [Kuack the Duck](https://github.com/knative/community/blob/main/mascot/kuack.png?raw=true),
    the [Knative](https://knative.dev/) mascot, so Mr. Squidler feels like he's in good company.

[^6]: But, like, _nice_ revenge; he's not a violent octopus.

[^7]: Pronounced "scuttle".

[^8]: "Text User Interface", as opposed to GUI, or "Graphical User Interface".

[^9]: I didn't _quite_ make it to double-digit footnotes on this post, but I still feel like I got a pretty respectable
    number in.
