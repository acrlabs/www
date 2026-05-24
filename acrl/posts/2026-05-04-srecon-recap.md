---
title: "SRECon 2026 Recap"
authors:
  - drmorr
datetime: 2024-05-04 11:00:00
template: post.html
---

Last month I had the pleasure of going to [SRECon 2026 Americas](https://www.usenix.org/conference/srecon26americas) in
Seattle; I realized that I posted [the transcript of _my_ talk](2026-04-06-srecon.md) but I didn't actually do a recap
of the conference itself, so I'm going to use this post to do so.  In short: it was a wonderful conference, and I'm
definitely hoping to attend again next year!

## The highlights

A loooooong time ago in a past life, I had the opportunity to go to LISA[^1], which was another Usenix conference
focused on sysadmin/devops-type content.  Unfortunately, LISA stopped being a thing; the last LISA was in 2021 as a
virtual event, and the last in-person LISA was in 2019 in Portland.  I had several folks at SRECon this year tell me
that SRECon has become kindof the "spiritual successor" to LISA, and I can definitely say that feels true based on my
experience!  Both LISA and SRECon were/are smaller conferences[^2] with a really strong focus on high-quality talks and
giving lots of space for people to meet and interact[^3].  While some of the talks made me grumpy with how much Ayyy
Eyye was in them, there wasn't a single talk that was _bad_.  All the presenters that I saw gave very highly polished
presentations about really interesting topics.

But, as I think is the case for a lot of folks, the highlight of the conference was the hallway track.  There's a lot of
space and expectation that you can just walk up to somebody and start a conversation, and then they will see somebody
else passing by that they know professionally and be like "Hey so-and-so, we're talking about X, wanna join us," and
suddenly you're in a conversation with 10 really smart people you've never met before.  AND, the thing that's cool about
smaller conferences is that it's _highly likely_ you will see those same people again later, so you can go back to them
and say "Hey, I was thinking about this thing you said yesterday..." and start the whole process over again, and then a
total stranger shoves a clipboard in your face and says, "Hey you seem like you have a lot to say, do you want to be on
a podcast, we're recording it in that room, sign up for a time slot here!" and then all of sudden you're recording a
ten-minute podcast episode with some really influential folks from Google[^4].  It's a really refreshing change from
something like KubeCon, where the conference is so big and broad that it can be hard to
find "your crowd", so to speak.

The other thing that SRECon did that I've not seen anywhere else is, in addition to two tracks of normal conference
talks, every timeslot had a "discussion session" on a particular topic.  These sessions typically had one or two
facilitators, who might have some light rules/guidelines/suggestions of things to talk about, but by-and-large it was a
safe space[^5] to have an hour-and-a-half focused conversation with a group of ten or so strangers on a dedicated
topic.  I went to a really interesting discussion on mental health in software engineering, and part of a discussion
around AI and SRE/devops[^6].

## The talks

Like I said above, all of the talks I went to were really high quality, but I'll just put a few of my favorites here
(also, the SRECon 2026 [YouTube playlist](https://www.youtube.com/playlist?list=PLbRoZ5Rrl5lfnl2qlgWH48uttpkVF4-4R) is
available, so you can watch all of them online!)

- [The WTF Problem: Developer Experience as a Reliability Property](https://www.youtube.com/watch?v=aYq9a4qUszs): This
  talk by Nicole Forsgren at Google[^7], was the second plenary talk of the conference, and I loved the premise: your
  developer tooling is impacting your ability to quickly respond to incidents.  Nicole started off with a series of
  questions: How many have been paged for something your tooling should have caught?  How many have a runbook that you
  don't trust?  How many have context-switched out of an incident and into "how do my debugging tools work?"  (Nearly)
  every single person in the room raised their hand for every question.  She then segued into a new thing we can
  measure, which she called "Mean Time to WTF (MTTW)"---basically, how long does it take for an engineer on your team to
  go from "I got paged" to "I understand what is happening here?"  Much of the friction that impacts MTTW is about
  developer tooling that doesn't work or is out of date, and if you invest in improving in that you will improve your
  reliability posture.  I thought this was a great talk, and it really reinforced my decision at ACRL to "act like a big
  company" with respect to tooling, automation, and the like: it would be "easier" to just click buttons on the AWS
  console to get the resources and things that I need, but by spending time getting the automation right _now_ when
  we're small means (hopefully) we have less pain in the future as we grow.
- [Infinity is not a strategy: right-sizing the cloud](https://www.youtube.com/watch?v=OFMR8BYKvCU): This talk was by
  Praval Panwar from Microsoft.  The talk was largely a discussion about the tensions between cost and reliability,
  which any of my long-time readers will know is something that I harp on a lot.  You can have 100% reliability by
  scaling to infinity, but that strategy is neither a) feasible or b) cost-effective.  Praval spent the remainder of the
  talk discussing strategies you can use to manage this tension: things like oversubscription, load forecasting,
  load-shedding, error budgets, etc. etc. etc.  I really liked in this talk that he got into some of the math and
  statistics behind these techniques.  At its core, risk is about "quantifying uncertainty", which sometimes I think
  devops people forget means "doing math".  Also he mentioned mixed-integer programming, which is near and dear to my
  PhD research, so I was just extra happy to be in this talk.
- [Keeping a Hypervisor Fleet Up to Date with Minimal Customer Disruption](https://www.youtube.com/watch?v=5z3NJGVj0AE):
  This talk, by Atalay Kutlay at Akamai, was really fun because (again) it's a really cool application of mathematical
  optimization to distributed systems.  Atalay described how they use mixed-integer programming[^8] to keep their fleet
  of hypervisors (read: virtual machines) up to date.  The problem, more or less, is whenever you need to update a VM,
  you have to a) kick all the workloads off, and b) reschedule them somewhere else, before you can update the VM.  You
  want to do this in a "fair" manner, for some definition of fair, and it turns out that you can just write this all
  down in a big linear program and solve it to get your maintenance schedule!  Super cool work, and I continue to be
  convinced that we could be doing a lot more of this type of optimization in distributed systems than we are doing.

Those were probably my top three talks at the conference, but there were just so many good talks that I feel compelled
to put down a list of "honorable mentions":

- [From ESXi to Kubernetes: Modernizing 1,400 Edge Locations with Open Source](https://www.youtube.com/watch?v=GF6PqeV_l2s):
  this talk was a really nice "user story" about converting a giant grocery chain in Canada to Kubernetes.
- [The Case of the Misnamed Cities: CAST Analysis of a Google Maps Incident](https://www.youtube.com/watch?v=e0_TSfDM2XY):
  this talk was a cool post-incident analysis of a Google Maps issue from a few years ago, and showed compared a
  systems-theoretic approach to postmortems to a more traditional "root-cause analysis".
- [The Gashlycrumb Tinies of AI Networking You Must Know (or Languish!)](https://www.youtube.com/watch?v=jKLG4Jh7eRY):
  this talk was _absolutely delightful_ for the darkly gothic vibes, definitely worth the watch even if you don't know
  or care about AI stuff.
- [How Security Incidents Are Different ... and How They're Exactly the Same](https://www.youtube.com/watch?v=F1JYRchNmdo):
  this was a deep dive into the lifecycle of a security incident by two former DataDog security engineers who would like
  me to stress that everything in this talk is STRICTLY HYPOTHETICAL and IS NOT FROM A REAL SECURITY INCIDENT.  Anyways,
  tldr, security incidents are just like regular incidents except with more lawyers involved.

## AI?  In _my_ SRECon??  It's more likely than you think!

Look, it wouldn't be a blog post by me if I didn't include _some_ degree of complaining.  And of course, given the
current tech zeitgeist, that complaining is (of course) about Ayyyy Eyyyee.  Every single talk (including mine, sadly)
at least _mentioned_ AI, and _many_ of the talks were fully bought in on "AI all the things all the time".  The first
plenary talk was about how we were are all going to survive as SREs in this new magical AI-ified world, and just...
SIGH.  I am... Just.  So.  Tired.  This discourse is _exhausting_ and it's _everywhere_, even in the conferences that I
love.

That said, the discourse about AI at this conference was... _somewhat_... more measured than your standard AI bro on
LinkedIn.  The first plenary talk (and a number of other talks) spent quite a bit of time talking about [Jevon's
Paradox](https://en.wikipedia.org/wiki/Jevons_paradox), which more-or-less says "the easier something is to produce, the
_more_ expertise you need in that field, not less."  The obvious application here is code generation: it's now become
trivially easy to generate hundreds of thousands of lines of sloppy code.  So even _if_[^9] gets better than your
typical "expert software engineer", and is able to significantly reduce the error rate in generated code compared to a
human, that error rate is never going to go to zero, which means the absolute number of errors in code is going to
_increase_ because there will just be _so much code_ out there.

Is this a hopeful view of reality?  Eh.  Not really, but, I mean, I think it's a more _realistic_ view of reality.  I'm
not worried about my job, as I've said many times before, I get paid a lot of money because I _am_ an expert in the
field.  Do I hate that we've collectively turned our job description into "software plumbers", aka, "manage all the shit
that AI spews out"?  Yes, yes I do.  Am I going to continue forcing my way upstream against that trend as best as I can?
Yes, yes I am.  Am I confident that in a year or two ACRL is going to suddenly have a lot of business opportunities?
Yes, yes I am.

But do I wish I could go to a conference and hear a little less about it?  Sure do, Jan.

As always, thanks for reading!

~drmorr

[^1]: Originally LISA was the Large Installation System Administration conference, and then it expanded its scope
    slightly and (the story I heard was) that the acronym didn't stand for anything any more, but I just looked on the
    Usenix website and even the most recent conference had the acronym expanded, so now I don't know who to believe.

[^2]: Two tracks, ballpark 1000 people—this honestly feels like the perfect size for a conference, imo.  Fewer than that
    and it feels like there’s not enough “content” (I’m using the term broadly) to justify the expense.

[^3]: I also love that every Usenix conference I've been to has an event coordinator just walk around the common area
    with chimes to announce the start of the next session.  It's very relaxing in a way.

[^4]: This is, of course, purely hypothetical and did not happen to yours truly at SRECon 2026 last month, and you will
    definitely never hear anything about this strange and extremely contrived circumstance again.

[^5]: Aside from that one dudebro who tried really hard to insert himself into every conversation at the table and make
    it all about him, seriously, screw that guy.

[^6]: I actually wasn't planning on going to any of these, because I didn't really know what they were, but had someone
    I ran into in the hallway strongly encourage me to go to one, and I'm really glad I did!

[^7]: Nicole has also written a book called [Frictionless](https://www.amazon.com/Frictionless-Remove-Barriers-Outpace-Competition/dp/1662966377),
    discussing many of these same topics, which I have not read yet but am planning to read.... sometime when I have
    time again.

[^8]: Drink!

[^9]: [That's a big if](https://www.reddit.com/media?url=https%3A%2F%2Fpreview.redd.it%2Fthats-a-big-if-v0-kt157h7xkslb1.jpg%3Fauto%3Dwebp%26s%3Dafe464a63e0ab655d6a410636661f37a8e6d38a3)
