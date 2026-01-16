---
title: "ACRL, Warpped 3"
authors:
  - drmorr
datetime: 2026-01-20 11:00:00
template: post.html
---

<figure markdown>
  ![The New York City LOVE sculpture but instead it says ACRL with a crooked C](/img/posts/acrl-nyc.png)
  <figcaption>Thanks, chatgpt</figcaption>
</figure>

Whale hello there, happy new year!  I hope you all had a good holiday season!  It's been a minute since I've written
anything here---I've been meaning to write this post ever since, well, before Christmas, but I had a bunch of travel and
illness at the end of last year, and it's taken me.... several weeks, lol, to get back into the swing of things in the
new year.  In any event, we're back now!  As is tradition, I want to take this post to do a recap of last year's
significant accomplishments and events, and then briefly discuss my goals and plans for the upcoming year.

Before jumping in, I do want to briefly acknowledge something: the world is a fucking shitshow right now.  I don't talk
about it _much_ on my blog, but things are hard out there, and I do really hope you are all taking care of each other.
And, while I am personally optimistic about ACRL, I am... less optimistic about other things.  It's a difficult
balancing act to hold both of those things at the same time, but I hope that the work that we do at ACRL is, in some
small tiny way, an act of resistance against all of the bad things out there.

Anyways I don't know how to segue from that, so I'm just going to do the world's most awkward transition: anyways!

## 2025 by the numbers

As always, we'll start off by looking a bunch of statistics and numbers that are, ultimately, meaningless.

* The big news of 2025 was that the company [doubled in size](2025-09-08-now-there-are-two-of-them.md)!  Ian has been
  doing a fantastic job, and I'm very happy to have him on the team.  Looking forward to lots more good stuff this year!
* I only had 26 meetings in 2025 (where I remembered to take notes).  That's a 17% decline in meetings from last year,
  which I feel like is a net improvement in things that could have been emails (or naps).
* I completed 296 issues on my task list!  That's, like, 5 tasks a week, or just about one per day!  If you want to work
  with somebody who is really good at creating tasks and then crossing them off, I'm ur guy!  In a (slightly) more
  serious vein, in [last year's recap](2025-01-20-2024-warpped.md) I mentioned needing a better routine for task
  tracking.  Early on the year, I switched to [Linear](https://linear.app) for task tracking, and I've been very happy
  with it.  It's pretty lightweight, easy to use, has some nice GitHub integrations, and is fairly inexpensive.  It also
  has a good set of keyboard shortcuts, which I'm still learning but make your life easier once you get the hang of
  them.
* In terms of code written, I only made 483 contributions on GitHub.  This is slightly lower than in 2024 (which was, in
  turn, slightly lower than 2023).  If we extrapolate this out, this means I will stop writing code sometime in 2030.
  Presumably this means I will have struck it rich and can retire.  Thanks, linear algebra!
* We can also look at "lines of code written", which we all know is the best metric for software engineering, and it
  totally un-gameable[^1].  Looking at my major repos, we have a total "source lines of code" count of 107,630.  This is
  90k more lines of code written in 2025!  According to my estimates, this cost about **$3 million** to develop,
  took **75 months**, and required **30 people**.  And this doesn't even count work that I did for my clients!  Not bad
  for a couple o' hacks[^2].  If you want to hire somebody who knows how to write lines of code, [get in touch!](https://appliedcomputing.io/contact)
* The above two statistics don't include any of the private work I did for clients in 2025; I had two clients that I was
  working with, and that kept me _very_ busy throughout the year.  Honestly it's a miracle I managed to get any other
  code written at all, lol.  I did have the opportunity to do some [very successful work](2025-08-04-astronomer.md) for
  Astronomer, a small company you may have heard of.
* By the way, just in case you were wondering, ACRL is now a Certificate Authority!
* My blog was a little less active in 2025 than it was in 2024; I only wrote 20 posts last year, but I also produced a
  whole heck of a lot of video content[^3], which is a new area for me, and is a lot harder and more time consuming than
  written content.  Even so, I have been slowly adding new subscribers: I have 220 total subscribers, up 30 from last
  year!  And 11 of you are paid subscribers: as always, thank you so much for your support.  I don't finance my business
  off of Substack, but I _do_ finance my coffee addiction, and that's not nothing.  We also had two (2) posts make it
  big on the Orange Site: [How to log in to ECR from Kubernetes the right way](2025-04-22-how-to-log-in-to-ecr.md) in
  April, and and [Make the Easy Change Hard](2025-08-25-make-the-easy-change-hard.md) in August.  So if you want to view
  content that the Orange Site thinks is valuable, uh, check those two out I guess.
* I'm still keeping up with the conference attendance: I was at the [SoCal Linux Expo](2025-04-07-what-ive-been-up-to.md)
  in the spring, and (of course) [KubeCon](2025-11-24-kubecon-recap.md) in the fall!  I also made it to the [Kubernetes
  Community Days](2025-09-15-kcd-sf-recap.md) event in San Francisco, which was a delightful smaller/more focused event
  than KubeCon is.  My talks at KubeCon didn't get accepted, but I was able to give [a talk](https://youtu.be/661wqxu6DlE?si=6WQc7Hb49urI8xfd)
  as well as an [impromptu lightning talk](https://youtu.be/yLxbfl3CAxE?si=P179PxrEcODelHpr) at [Cloud Native Rejekts](https://cfp.cloud-native.rejekts.io/cloud-native-rejekts-atlanta-na-atlanta-2025/schedule/)
  before the main KubeCon event.  Also at KubeCon, we sponsored the first-ever ["Can U Fit In The Kube?"](https://youtu.be/ZDlQzhAl8zI?list=PLOgtqKaB5McAOIyl18Gwh7Ks9CUWYxWwQ)
  challenge, which was ridiculous and delightful and a ton of fun.
* My first [clinic project](2025-07-28-contraction-hierarchies.md) with [Harvey Mudd College](https://hmc.edu) wrapped
  up in spring of last year, and was a great experience!  I've been sponsoring another project this year, which is also
  going very well; I have a great team that I'm working with, and I'm very excited about the project that they're
  working on.
* Towards the end of the year, ACRL published its first [public postmortem](2025-12-08-postmortem-ci-runner.md) for a
  product that is (still) not publicly available[^4].  We just want to re-iterate that we're deeply sorry for the
  impact that this issue caused, and to emphasize that we are making changes to prevent this from happening again.
* Lastly, I just want to shout out to the ACRL BOD[^5]---I've had an informal BOD ever since the company started, and I
  would not have gotten anywhere near as far along in this endeavour without them.  But, last year, we took a step
  towards making the informal BOD (slightly) more formal: I'm now paying them for their time!  I also added one
  additional person to the BOD, who I am extremely excited and grateful to have.  Thank you so much for all your help so
  far.

There were a lot of other things that happened in 2025, too many to write about here, but just know that no matter what
pointless metrics you choose to measure things by, it was a very successful year for the business!

## Plans for 2026

Let's also take a brief look forward as to what's coming in 2026!  I'm pretty excited about the upcoming year, I think
there's some great things happening, and I can't wait to share them with you:

* SimKube development continues: if you've been following along, you might have noticed that "core" SimKube development
  has slowed down quite a bit, which honestly is a good thing.  We have a core piece of software that works pretty well
  and has had a lot of bugs and kinks ironed out over the last year.  There are a bunch of planned new features for
  SimKube, but the main focus for the last 6 months has been "how do we make this thing easier to use?", and I expect
  this to continue into 2026.  ACRL is (still) probably the only team in the world that can _actually_ use SimKube
  effectively, and I'd love to make it so that this is not the case.  To this end, we have a number of projects in
  flight:
    * A GitHub action runner that you can plug into your CI pipeline so that you can run simulations of your project on
      production data
    * A scraping tool similar to [kemu](https://datastrophic.io/declarative-kubernetes-cluster-emulation-with-kemu/)
      that allows you to more easily replicate or clone a production environment into a simulation environment
    * A variety of other quality-of-life improvements to make the system easier to work with
    * [STRETCH GOAL] Maybe some kind of UI?  I am increasingly coming to the conclusion that to _really_ make SimKube
      take off, it needs a way to interact that isn't just a CLI.  We need ways to inspect, modify, and extend [trace
      files](2025-06-09-anatomy-of-a-trace.md), we need controls to start, stop, and re-run simulations, and we need
      dashboards to see the results of simulations.  All of this is _possible_ right now, but having a unified interface
      will be a huge improvement.  The only slightly concerning challenge with this goal is that I am not, have no
      interest in, and will never be a front-end person, so to make this a reality I'm gonna need to find someone to do
      it for me.
* Client work will also be continuing in 2026: at the encouragement of my BOD, I am exploring ways to transition away
  from consulting work and move more towards "having a product I can sell"; this has always been the long-term goal, but
  I also do need ways of paying the bills.  So I'm happy to say that I have one client that I'm continuing to work with
  in 2026, and several other potential clients in the sales pipeline!  I'm hoping to have some more blog posts to share
  based on client work in 2026 as well.
* We[^6] are also spending a bunch of time ~writing a lot of YAML~ shoring up some of ACRL's core infrastructure.  It's
  _probably_ overkill, but I'm trying to start incorporating as many "best practices" for infrastructure management;
  we're using [Pulumi](https://pulumi.com) for our infrastructure-as-code tooling and [ansible](https://docs.ansible.com/projects/ansible/latest/index.html)
  for configuration management.  On this front, ACRL is actively working towards running its very own permanent
  Kubernetes cluster, which I will have a very exciting blog post about in the coming weeks.
* Conference attendance will continue in 2026 until morale improves.  I'm going to be presenting at
  [SRECon](https://www.usenix.org/conference/srecon26americas) in Seattle in a couple months; I'm very excited to go
  back to Salt Lake City for KubeCon in November, where we will be presenting "Can U Fit In The Kube 2"; and I am
  debating attending RustConf in Montreal for the first time!  I'm also hoping that KCD SF will happen again, because I
  had a great time there.  In any event, there will be lots of opportunities to meet up with us in 2026.
* Blogging will continue in 2026 until morale improves.  I am very grateful to all of you for continuing to read this
  publication, and I really enjoy getting to share the work that I'm doing with you all here.  I'm also hoping to get
  Ian regularly contributing to this space in 2026, so you can get to know him a bit better as well.

I'm sure 2026 is going to have its own twists and turns as well, but at least to start off with, that's where we'll be
going!  Follow along this year to learn how the plans worked out :)

## Warpping Up

These wrap-up posts are always one of my favorite things to write on the blog: when you're in the weeds as a business
owner/small business person, there are a lot of hats to wear and a lot of things to do, and sometimes it can be
frustrating and demoralizing that "we're not moving faster".  So this is always a great way for me to look back at the
year and go "Wow, we really did accomplish a lot!"  It's very validating to see: I'm two and a half years into this
journey, and I'm so excited to see how successful it's been so far.  Of course anything can happen, who knows if this
thing will still be around next year, blah blah blah, but I'm optimistic and excited!

[^1]: I have been using [scc](https://github.com/boyter/scc) to count lines of code in my repos, and I'm leaving a link
    to it here because I use it once a year and never remember what it was called when it comes time to write the next
    warpped post.

[^2]: If you really want to dig into to the numbers, you might ask "how many lines of those are YAML?"  And the answer
    to that is... [35k lines](https://pbs.twimg.com/media/Dfwl3oSW4AING2Z.jpg)..

[^3]: By which I mean, I spent a whole heck of a lot of time producing.... 6 videos.  Many video.  Much produce.

[^4]: Thanks AWS.

[^5]: Bored of Directors, naturally.

[^6]: And by "we" I mean "mostly Ian".
