---
title: "KubeCon Recap: Can U Fit in the Kube?"
authors:
  - drmorr
datetime: 2025-11-24 11:00:00
template: post.html
---

KubeCon was last week!  In past years, I've tried to do a big "recap" series, but that ends up being hard because it
always runs into the holidays and the series tends to peter out, so this year I'm going to try to stuff everything into
one post.  Let's see how it goes!  Before we get started though, you should all go watch the video I posted at the top:
I'll talk more about it in a minute, but it genuinely was one of the highlights of the conference for me.

## The vibes

It's unfortunate that KubeCon was in Atlanta the same weekend that the US government announced disruptions to flights at
major airports around the country.  I was lucky in that my flight was "only" delayed 2 hours[^1], but my HMC clinic
students this year had their flight canceled, which was a major bummer.  A few of them were able to make it out anyways,
but it was definitely disappointing.  I was having trouble telling how much the FAA disruptions impacted the conference
as a whole, though---it still seemed like the event was well-attended, so aside from a lot of worrying on social media,
it was still a big, loud, chaotic event just like normal.

While we're talking about vibes, of course AI was _everywhere_.  All the vendors were advertising their agentic
thingmajiggywhatsit, and (at least based on the abstracts) more than half the talks were about AI.  I also heard from a
bunch of people that the conference felt way more "vendor-focused" than in the past.  I'm not sure if I agree with this
or not---KubeCon has always as far as I can remember had a veneer of vendors pretending to be open-source so they can
sell you something[^2]---but I did see more people _complaining_ about it.  The interesting technical content and
hallway track conversations are still present, but I think folks are realizing that you have to work a lot harder to
find it.  And to be clear, _I'm_ not complaining about this[^3], I think this is just the natural progression for events
that are as large as KubeCon and have as much money swirling around.

In terms of my personal experience, just like last year I went to very few talks, so I have a big backlog of things that
I want to catch up on when the videos are posted to YouTube.  Unlike last year, where I spent a lot of time on the
vendor floor, this year I did the pre-game thing where I set up a ton of meetings ahead of time with folks that I wanted
to talk to.  I think this was a much more effective strategy, and I had a lot of really energizing and productive
conversations with folks.  It was also really fun to attend with my [new coworker](2025-09-08-now-there-are-two-of-them.md),
we had a really good time.

## The talks

But let's go over the talks I _did_ manage to attend: I only went to five, I think, but they were all 🔥.  I'll give a
quick overview here, in order of appearance:

* Slurm Bridge: Slurm Scheduling Superpowers in Kubernetes by Alan Mutschelknaus & Tim Wickberg, SchedMD: this talk was
  a deeply technical talk about how to incorporate the OG distributed scheduler (aka Slurm) into Kubernetes.  If you're
  not familiar, Slurm is a fairly old tool used in many different high-performance computing (HPC) contexts.  It is, I'd
  say, harder to use than Kubernetes and has an "Old Unix Sysadmin" appeal to it, but it's also extremely good at what
  it does[^4].  To this end, there have been a lot of efforts to integrate Slurm and Kubernetes, and this talk described
  one such effort called SlurmBridge.  The high-level framework for SlurmBridge is that workloads (Pods) are scheduled
  by Slurm but launched by kubelet.  I don't have a _ton_ of personal experience with Slurm, but this seems like a
  really interesting approach and I'd love to play around with it some more!
* Zero Downtime Migration of Monolith To K8s Using Sidecar and Container Lifecycle Hooks by Deepak Kosaraju & James
  Dabbs, Procore: the next talk I went to was by a former coworker who's now at ProCore Technologies, which is a
  construction management software company.  This talk was a very hands-on, practical introduction to a problem that
  many companies face, namely, "We've got a giant monolithic code base and we want to figure out how to run it on
  Kuberentes".  The talk included a lot of practical advice about how to do autoscaling and configure timeouts and
  application behaviour to minimize downtime when Kubernetes, you know, does its Kubernetes thing.  There's also a
  [GitHub repo](https://github.com/deepak-kosaraju/kubecon25-zero-downtime) where you can follow along and try out a
  bunch of these techniques on your own!
* I've Got 99 Problems and They’re All Controllers by Tim Goodwin, UC Santa Cruz: you might recognize the name of this
  presenter, I gave a joint presentation with Tim on our [Kompile project](https://www.youtube.com/watch?v=QcYsGytNBe8)
  at KubeCon last year.  This year Tim was back talking about (wait for it) Kubernetes simulation!  Tim is approaching
  this problem from a slightly different perspective than I am: instead of trying to simulate the _whole_ cluster for
  the purposes of analyzing the control plane, Tim wants to simulate the _control plane_ for the purposes of testing a
  single Kubernetes controller.  To accomplish this, Tim built a tool called [Kamera](https://github.com/tgoodwin/kamera)[^5]
  which provides a fake Kubernetes API server that you can wire into your controller(s).  The fake API server can
  automatically produce events for your controller in any arbitrary order, and check the outputs from your controller to
  see if it does the right thing.  In essence, it's a big Kubernetes controller fuzzer, and it's _incredibly_ cool.
  This was one of my favorite talks from the conference and I definitely recommend that you watch it.
* From Panic To Peace: Making K8s Controller Observability Suck Less by Cat Morris & Derik Evangelista, Syntasso: this
  was another talk about building and testing Kubernetes controllers, which reviewed a lot of very practical "best
  practices" for how to write controllers and make them robust, observable, and debuggable.  It also included a fun
  Shrek story throughline throughout the talk, which was a fun touch.  Definitely recommend this one as well if you're
  in the Kubernetes controller/operator space!
* Evicted! All the Ways Kubernetes Kills Your Pods (and How To Avoid Them) by Ahmet Alp Balkan[^6], LinkedIn: this was
  far and away the best talk I saw at KubeCon this year.  The whole premise of the talk was "Kubernetes has a lot of
  ways to kill your pods, and generally people don't like it when their pods get killed, so let's enumerate all the ways
  this can happen so you can be prepared."  He discussed 9 different pod eviction pathways, at least 8 of which I've
  personally experienced.  He then demonstrated that none of these eviction pathways are aware of each other or play
  nicely together, and also that existing Kubernetes primitives for managing pod eviction are _WOEFULLY_ inadequate, one
  of my personal pet peeves[^7].  If you watch one talk from this conference, make it this one.  It's so good.
* Evolving Kubernetes Scheduling by Eric Tune & Wojciech Tyczyński at Google: this talk was in (almost) the last slot on
  Thursday afternoon, but it was still really well-attended!  The presenters in this talk discussed the future of
  Kubernetes scheduling to handle the needs of batch and ML workloads running on Kubernetes.  This is, as previously
  discussed, a challenging problem, because Kubernetes was never designed to handle these types of workloads, and is
  completely unaware of things like hardware/network topologies that are critically important to HPC/ML workloads.  The
  scheduling framework is also missing many primitives that are necessary to operate in this environment.  The quote
  from the talk that resonated the most with me is that, "The Kubernetes scheduler is designed to schedule one pod on
  one node at a time, and we now need it to schedule groups of pods on groups of nodes at a time."  They discussed a
  number of proposals and extension points that they are hoping to add to the Kubernetes scheduler to handle this use
  case.  Personally, I am somewhat unconvinced that kube-scheduler is up to the challenge, but I'm still very interested
  to see where this ends up!

## The vendor floor

So that was it for the talks I attended!  I also promised to discuss the video that I included at the beginning of this
post.  As you may have noticed, if you've been following along, I did a huge[^8] [video marketing campaign](2025-10-20-oh-we-doin-video.md)
leading up to KubeCon this year, and the [second-to-last video](https://youtube.com/shorts/ngsHBkfEoho) was of my good
friend and colleague Liz trying to climb into a tiny cardboard box to see if she could "fit in the kube".  This was,
objectively, hilarious, and I had the objectively genius idea to see how many other people at KubeCon could "fit in the
kube".

So $20 and one extremely tiny FedEx box later, we launched the first-ever "ACRL Can U Fit In The Kube" challenge.  I
paid five people $50 each if they could "fit in the kube", defined somewhat subjectively as "being able to more-or-less
close the lid of the cardboard box without it ripping".  We had a _lot_ of people stop by our guerilla marketing
"booth", and I handed up a bunch of SimKube business cards, and got to meet and laugh with a bunch of really cool
people.  This was probably the highlight of the conference for me: it was so fun to see peoples' reactions and
double-takes when they walked by our "booth", and I think maybe brightened some people's days as well in what can be an
long, gruelling, exhausting week.  So that's the story of our first-ever KubeCon promotional challenge, and it will
absolutely be back next year with "Can U Fit In The Kube 2"[^9]!!!

## Aside: ACRL video campaigns

Also speaking of videos, I thought it would be interesting to briefly cover some stats about the marketing videos that I
posted in the lead-up to KubeCon.  It was definitely eye-opening for me, and a window into a whole world of advertising
that I've heretofore never experienced.  For a quick summary, we posted five videos, one per week, starting at the
beginning of October.  Each video I posted here, on LinkedIn, on YouTube, and on my social media sites (Hachyderm and
Bluesky)[^10].  I spent $100 on LinkedIn to "boost" them for a week, and I also spent $100 on YouTube for the first one, just
to compare what sort of reach and viewership we got on the two platforms.  The results were somewhat surprising!  Here's
a few stats:

* [Video 1: "What's SimKube, Precious???"](https://youtube.com/shorts/jUE2YdUpAYQ) - Lord of the Rings is
  near and dear to my heart, so this was a very fun video to make.  On LinkedIn, we got 16k "impressions", 5000 views,
  14 reactions, and 1 comment on the post.  On YouTube, we got 25k views, and 43 "likes".  The big difference between
  YouTube and LinkedIn is the degree of targeting that you can do.  LinkedIn has very fine-grained controls over your
  audience, in terms of who the video gets shown to, whereas YouTube was basically "are they in the US" and "what
  gender".  So even though YouTube got five times the views, I kindof suspect that most of the people who watched the
  video probably didn't even know what Kubernetes is.
* [Video 2: How to pronounce skctl](https://youtu.be/CGkrE0DbH1Y) - this was definitely my least favorite of the video
  series; it took a _long_ time to make, and the result wasn't quite what I'd envisioned.  Nevertheless, I got a lot of
  good feedback from the video, and other people seemed to genuinely enjoy it.  We got 17k "impressions", 4800 views,
  18 reactions, and 7 comments on the post on LinkedIn.
* [Video 3: The Bluth family does Kubernetes](https://youtube.com/shorts/KEjFjpHKi2M) - This was my favorite video in
  in the series.  It was short and easy to film, and resonates with a cultural touchpoint that I think is familiar to a
  _lot_ of people in my "target market".  Also I just love Arrested Development.  We only got 10k "impressions" and 4000
  views (possibly because I was experimenting with a smaller target audience for this post), but 22 reactions and 3
  comments.  The folks who did watch this video seemed to love it!
* [Video 4: Mission Impossible XII: Upgrade Kubernetes](https://youtube.com/shorts/BW-iYyO_QG8) - I was _expecting_ this
  post to be a lot more popular than it was, particularly given how painful and near-to-home the Kubernetes upgrade
  problem is for folks, but I actually got very little engagement with it.  We had 12k impressions, but only 2500 views,
  5 reactions, and no comments.  I don't know if if people were just getting tired of SimKube content, or if there was
  some other factor outside of my control that was impacting viewership.
* [Video 5: Can you fit in the cube?](https://youtube.com/shorts/ngsHBkfEoho) - Of course, the video that spawned our
  "challenge" at KubeCon.  My friend Liz filmed it on a total whim, and (I found out later) wasn't even intending for me
  to post it[^11].  Nevertheless, the video was (imo) brilliant, and outperformed every other post we made, with 29k
  impressions, almost 9000 views, and 16 reactions---still no comments, though.
* [Video 6: Can U Fit In The Kube challenge recap](https://youtube.com/shorts/ZDlQzhAl8zI) - This is the same video at
  the top of this post, and the "boost" campaign is still ongoing.  So far, we've gotten 9k impressions and 1700 views,
  along with 5 reactions and 2 comments.  It "feels like" this video hasn't gotten as much engagement as I was
  expecting, but I don't know why: maybe folks are just not on LinkedIn as much now that KubeCon is over?  No idea.

So anyways, that's the summary of my KubeCon experience!  It was a good conference, despite a few rough patches here and
there, and I'm definitely looking forward to returning to Salt Lake next year!

As always, thanks for reading.  We've got some banger content coming up in the next few weeks to close out the year, so
follow along if you want!

~drmorr

[^1]: Humorously (???), it had nothing to do with the ATC shortages, but instead was a "genuinely minor fuel leak" that
    they resolved by "turning the plane on and off again".  You cannot make this stuff up.

[^2]: Present company---of course, of _course_---excluded.

[^3]: I know, shocking, right?  I complain about _everything_.

[^4]: I have detected some bitterness in the Slurm community that Kubernetes is so popular, and that so many people are
    trying to stuff HPC/ML workloads onto it, despite it being nowhere near as suitable for ML/HPC workloads as Slurm
    is.

[^5]: Pronounced like "camera" but with a 'K' for obvious reasons.

[^6]: Ahmet, by the way, is the writer and maintainer of the [kubectx/kubens](https://github.com/ahmetb/kubectx) tools,
    which, if you're not using them already, you absolutely should.  They will save you at least as much time and
    frustration as whatever agentic thingamajiggywhatsit you're using today.

[^7]: I feel like I'm beating a dead horse at this point, but did you know that the core Kubernetes controllers---e.g.,
    the Deployment controller---do not even know that PDBs exist, much less how to query or interact with them???  I
    understand how we got into this situation, but I also find it completely appalling that this is the situation we're
    in.  UGH.

[^8]: Well, huge for _me_, not huge in the grand scheme of things.

[^9]: I wasn't initially planning to go to KubeCon Amsterdam, but I kindof want to go just so we can repeat the
    challenge there!  We'll see if that happens or not...

[^10]: I also posted the first few videos on TikTok, partly because I was curious to see if I got any engagement there,
    and also because I thought it would be funny to say that ACRL has a TikTok.  But after each of the first three
    videos got a grand total of zero (0) views, I gave up on the TikTok thing.  Clearly the TikTok algorithm can detect
    elder millenials trying to pose as the cool kids.

[^11]: Whoops.
