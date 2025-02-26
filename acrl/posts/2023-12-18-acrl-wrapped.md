---
title: "ACRL, Warpped"
authors:
  - drmorr
datetime: 2023-12-18 11:00:00
template: post.html
---

<figure markdown>
  ![Captain Picard, sitting in his captain's chair, looking ever-so-slightly-uncanny-valley-ish.  The caption reads, "WARPPED SPEED." in yellow Star Trek font.](/img/posts/picard.jpg)
  <figcaption>Captain Picard in his captain's chair, saying "Warpped Speed"; generated by Bing AI</figcaption>
</figure>


Well, folks, we're getting towards the end of the year!  This is going to be my last post of 2023, so I thought I'd take
some time to do a bit of a retrospective on the year and talk about some of my plans for 2024 and beyond.

## 2023 by the numbers

First, let's do some data analysis!  Here's some fun statistics from the year:

- I had 29 "official" meetings this year (where official means "I took notes").  On a serious front, the first meeting I
  had as a part of Applied Computing was with the inestimable [Kris Nóva](https://krisnova.net/bio/), who was just a
  delightful individual and gave me some really solid wisdom and advice.  Sadly, she passed away on August 16 of this
  year.  I only ever met her that single time, and a _lot_ of people knew Kris way better than I did, but I will never
  forget her kindness and joy for life that was on display during our conversation.
- I completed 99 items on my todo list!  I know this is an extremely important metric and task lists can't be gamed in
  any way shape or form.  This is approximately 4 tasks per week, which I feel like is a very solid showing.  Go me.
  I think I'll give myself a promotion since I'm clearly exceeding expectations[^1].
- Another very important business metric is "contributions on GitHub"---since June, I've had 362 contributions to
  various repos on GitHub, which is very exciting to me.  In the prior 6 months before I started ACRL, I had exactly 13
  contributions.  I love being able to be a part of the open source community!
- While we're tracking code contributions, I used [`scc`](https://github.com/boyter/scc) to do an extremely rough "lines
  of code" analysis for my major repos.  According to that tool, I wrote 11,793 lines of code this year.  It claims
  that this should have taken 19.7 months to develop, so I'm feeling pretty good about my productivity for only doing it
  in 6!  The tool also claims that the cost to develop all this code is $346,079.  I dunno where it gets these
  numbers from, but... I'm gonna need some more paid subscribers on here to make up that difference. 😂
- Speaking of subscribers: I have 72 subscribers to this blog, 9 of which are paying subscribers!  I know this is a
  small platform by a lot of measures, but I'm really grateful to all of you for coming along with me on this wild ride.
  I also recognize that asking you to pay for something that I'm giving away for free a few days later is kinda weird,
  but I'm trying to buck trends and point the way to a more sustainable tech industry here, and I deeply appreciate you
  all for the support you've given me thus far.
- And, speaking of the blog, I wrote 19 posts this year (counting this one)!  The first one was on July 21, and I
  covered all kinds of different topics, from scheduling and autoscaling, to an epic faceoff between Go and Rust.  I had
  2 "live-blogging" posts where I just shamelessly ripped some content off of Mastodon and replayed it here, so all told
  that's 17 "real" posts.  My post popular post _by far_ was on [Conway's Law and Kubernetes](2023-08-21-conways-law-kubernetes.md),
  with nearly 800 views.  In contrast, most of my other posts are generating somewhere between 1-200 views.  I continue
  to see the Conway's Law post floating around social media from time to time, as well!
- On the social media front: I have 1.4k posts on Mastodon with a total of 116 followers.  This is where I do most of my
  💩-posting, so if your favorite part of this blog is "reading the snarky footnotes", maybe consider following me
  [on Mastodon](https://hachyderm.io/@drmorr).  I also joined [Bluesky](https://bsky.app/profile/drmorr.bsky.social)
  this year, but I'm putting a lot less effort into that account.  I have 6 followers and I'm following 6 people, and
  I've made 54 posts.  I'll probably try to keep some presence there but in general I like the vibe and the community of
  folks I engage with on Mastodon much better.
- I attended 2 conferences this year!  One, of course, was KubeCon, which I'm still on a bit of a high from---I had such
  a good experience this year, and I can't wait for next year!  The other was the SBIR/STTR Fall Innovation Conference
  in Washington, D.C., where I learned a lot more about applying for grants and receiving federal funding.
- I also read 12 papers this year.  That's about one paper every other week since I started the company, which is not a
  terrible pace.  I was hoping to have this number be more like 1-2/week, and the distribution of "when I read papers"
  is a little sporadic, so hopefully this is something I can improve upon in the next year.  I have another 46 papers
  that I've flagged as wanting to read, and that list isn't gonna get shorter, so I need to pick up the pace here a
  little bit.

All-in-all, not too bad for my first year in business, I think!  Now let's talk a little bit about next year.

## Goals for 2024

I've had many people tell me that my model for Applied Computing is wildly ambitious and that I'm "playing on hard
mode", which is absolutely correct, but I have just enough... hubris?  chutzpah?  self-confidence?  to think that I can
pull it off anyways, or at least to give it my best possible shot.  So I've got a lot of goals[^2] for 2024:

- My number one goal for 2024 is to have positive cash flow.  I'm not interested in the "hyper-scale,
  late-stage-capitalist, growth-at-all-costs" mindset that's so common in so much of this industry, but I do need to be
  able to make a living, and I'd like to be paid fairly commensurate to my experience and expertise.  I do think I've
  done a good job in 2023 of laying a solid foundation for the business, and I have a number of leads that I'm exploring
  on this front.  I don't want to say too much more here until after something is set in stone, however.
- My second goal for the year is to hire somebody!  I _really_ want ACRL to be more than "just me", I want to build the
  best independent research and development firm in the country.  I already have more work than I can accomplish on my
  own, so hopefully I can get some more folks in here to help me out, and hopefully soon[^3]!
- My third goal revolves around Diversity, Equity, and Inclusion (DEI) efforts.  We do _such a bad job of this_ in our
  industry, and as with many of my goals for ACRL, I'm trying to demonstrate to the world that _it doesn't have to be
  this way_.  Diversity of experience is _important_ and I really want that to be a core component of ACRL.  I have a
  few ideas of things to do here, but one concrete goal is that I really want to offer a sponsorship or scholarship for
  under-represented groups in 2024 to attend conferences or in some other way further their professional development in
  the tech industry.  Watch this space for more!
- On the "technical goals" front, I want to continue development on [SimKube](https://github.com/acrlabs/simkube);
  I really want to build this out beyond the "proof-of-concept" that it is right now into something that is actually
  helpful and usable by folks.  I have a pretty solid roadmap of how I think we can get there, but first I need to stop
  writing so many freakin' grant proposals.
- The other technical goal that I have is that I'm really hoping to start my dive into the deep scheduling research that
  I founded ACRL to do.  SimKube was only always ever designed to be a _tool_ to help me "do scheduling better", so I'm
  really hopeful that in 2024 I can start tackling the "do scheduling better" problem.
- On the communications and outreach front, I fully intend to keep publishing here in the new year; my goal is always "1
  post a week", but sometimes stuff comes up and I'm not able to hit that goal.  I also intend to submit another talk to
  KubeCon next fall, and I'm also really hoping that I can get a journal article written and submitted somewhere by the
  end of the year!  That's a bit contingent on me actually getting some work done first, though.

## That's all, folks!

So there you have it!  A year in review for ACRL.  I was debating doing a retrospective-style "things to keep
doing/things to improve" section, but honestly, I think the above two lists more-or-less cover it!  So I'm gonna keep
this post (a little) shorter, and just say "that's a warp!"

I hope you all had/are having/will have a holiday season full of love and joy, and I can't wait to keep this up in the
new year.

As always, thanks for reading,

~drmorr

[^1]: I still have another 41 tasks on my list, I figure once I accomplish those 41 tasks, I'll have hit the big
    leagues.  If I keep this pace up, I should be a bazillionaire by March.

[^2]: But 0 [OKRs](https://en.wikipedia.org/wiki/Objectives_and_key_results).  I hate OKRs.  They are an abysmal way
    to... you know, I don't even know what they're supposed to do, but whatever it is, they're bad at it.  Maybe I
    should write a blog post about this someday.

[^3]: On that note: if you are an extremely talented individual and enjoy working for $0/year in a job with absolutely
    no benefits and a 50/50 chance of going under by this time next year, feel free to reach out!  I'd love to connect.
