---
title: "ACRL is turning 3 (and also drmorr is turning an age greater than 3)"
authors:
  - drmorr
datetime: 2026-06-08 11:00:00
template: post.html
---

It is kindof wild to me that ACRL was founded 3 years ago; in June of 2023 I stepped out on this crazy adventure and I
had no idea where it was going to go or how long it would last, but here we are, three years later, and ACRL is still
alive.  I feel like "company years" are kind of like "dog years", which means I'm pretty sure ACRL is now old enough to
vote[^1].  It also just so happens to be _my_ birthday today, which I don't think we need to discuss any further, except
to say that "drmorr years" are like "inverse dog years", which means I am _also_ just now old enough to vote.

I've heard from a number of folks that it takes, on average, about five years for a company to go from "I don't know if
this will succeed _at all_" to something that is somewhat sustainable.  Which means that ACRL is about halfway there,
statistically speaking!  I have been thinking a lot about what that means over the last few months, and one of the
conclusions that I reached is that, while I am doing pretty well[^2], I would like to be doing "pretty well faster".
The traditional thing that tech companies do when they reach this stage is to go raise a bunch of VC money, but that
door is closed to me, given my core tenet of "absolutely no way in hell".  So instead, I ended up securing a private
investor, who also happens to be me.

One of the goals of this blog (in additional to starting flamewars about Rust vs Go and rambling endlessly about
SimKube) is to document my process for bootstrapping a company, so I thought I would spend this birthday post talking a
little bit about why we decided that "right now" is the right time for such an investment, what we're planning to do
with the funds, and how we're going to know if it's successful.

## Supporting the next phase in ACRL's journey

When I started ACRL, I had a small amount of "seed money" that I took into the business.  I knew, intellectually, that
"you have to spend money to make money", and I also knew that there's just a lot of financial overhead involved in
running a business.  The rough goal was, if the seed money ran out before I'd gotten people to pay me, I was giving up
and going to get a real job.

As evidenced by the fact that I'm still here, that seed money didn't run out.  Between the work that [I did at
Yelp](https://engineeringblog.yelp.com/2024/08/multi-metric-paasta.html) and the work that [I've been doing at
Astronomer](2025-08-04-astronomer.md), I've approximately managed to 10x the initial seed money for ACRL over the last
three years[^3].  It should be noted that I'm not attempting to brag here: this is a remarkable achievement for a small
business and it needs to be acknowledged that there was (and continues to be) an extremely large amount of both luck and
privilege involved in this success.  Nevertheless, it _is_ a success, and I'm proud of where we've gotten.

Unfortunately, we've somewhat hit the limit with my current business model; with the exception of this blog[^4], all of
our work is supported via consulting hours[^5], where Ian and I embed as expert consultants in client teams to help with
Kubernetes.  We are at a point where clients are paying us to use SimKube for them, which is---honestly---an amazing
feeling, but there is a limit to how many clients we can support in this model, and that limit is, basically, two.
Maybe three if we really wanted to burn ourselves out.  It's been clear to me for a while[^6] that if I want to scale
beyond this, I need to change my business model.

So that's the goal: we are trying to move a step up the "business" ladder from "selling our expertise" to "selling a
product that has been developed using our expertise".  And that's why we've got this investment right now: it's going to
support this next phase in our journey[^7].  The goal (which I fully recognize is ambitious and not fully in my control)
is to achieve _something like_ a similar return on investment to what we got on ACRL's seed money.

## Let's write down some go-tay-jars

Astute readers may remember a post I made a while back about [OKRs](2024-02-05-okrs-are-bullshit.md).  So, I'd just like
to clarify that the things I'm going to talk about in this section are _goals_.  This goals are artisanal, organic,
home-grown, non-GMO, and contain absolutely nothing rhyming with "Bokay Arrr" or "Jay Pee Eyes".

Anyways, with that out of the way, it's one thing to say that we're going to approximately 10x our investment over the
next few years, and another thing to actually do it.  We need to have _some_ target that we're aiming for besides "I
really hope someone gives us money!"  So what are these targets?  I've identified two:

1. Have a product to demo at KubeCon: in the course of my conversations with potential clients and other interested
   parties over the last couple years, it's been made extremely clear to me that SimKube (as it currently stands) is not
   a product, it's a tool.  It is (in my opinion) an _extremely_ cool tool, but it's also a tool that can probably only
   be used by myself and Ian.  It's easy to _explain_ the high-level concept, but as soon as someone wants to go deeper,
   it's easy to get lost in the weeds.  There's just something about showing a CLI interface and a terrible Grafana
   dashboard that makes people's eyes glaze over; so if we're going to move from "selling our expertise" to "selling a
   product" we need an actual, real, demo that we can show to people.
2. By this time next year, we should have approximately doubled our ARR: obviously if we're going to 10x our investment
   over three years, we need to be making some progress on that _this_ year.  Just like when ACRL started, it's going to
   take some time to kickstart this process, so we're not going to get all of that 10x all at once.  But approximately
   doubling our current ARR seems like an ambitious, but still achievable, goal.  As a part of that, I've been spending
   a _lot_ of time learning how to be a salesperson---and it's kinda fun!  I really did not expect to like this part of
   running a business[^8], nor did I expect to be particularly good at it, so it's been a pleasant surprise to learn
   that I _do_ kindof like it and I _am_ kindof good at it.  It's definitely an untrained muscle for me though, so a big
   part of being able to hit this goal is going to depend on how quickly I can level up my sales skills[^9].

## So how do we get there?

A couple of weeks ago, I met up with Ian and a few other "trusted" advisors in Portland to talk about our strategy for
achieving these goals.  It was an extremely valuable (and extremely intense) few days, with a lot of good conversation
and good food[^10].  A lot of the conversation revolved around refining ACRL's target market: what types of companies we
want to be talking to, and who we need to be talking to within those companies.  The rest of the conversation was
concerned with "what we're trying to sell."

You'll be hearing _a lot_ more about the strategy in the upcoming weeks and months leading up to KubeCon, but the high
level theme is "Using SimKube to solve autoscaling."  Autoscaling is (still) an area that many companies struggle with,
and justifiably so: it turns out to be _really hard_ to do well[^11].  But the general consensus from both our Portland
strategy session, and conversations that I've had with many other people in the industry, is that ACRL is
well-positioned to tackle this problem.  I've been doing some variant of "distributed systems autoscaling" for over ten
years at this point, and as one of my friends pointed out, SimKube is (at least) the third time I've tilted at the
"distributed systems" windmill: so we have a really great combination of deep expertise, deep excitement and passion for
the subject area, and lots of hard problems that still need to be solved.

Like I said: we'll be talking a lot more about this strategy for the remainder of the year and I don't want to give away
all the magic right now, but I do want to close with a teaser: at KubeCon last year, we ran "Can U Fit In the Kube", an
[epic guerilla marketing scheme](https://www.youtube.com/watch?v=ZDlQzhAl8zI), which was a ton of fun and generated a
lot of laughs and good vibes.  We're going to do something a little bit different at KubeCon this year: ACRL is going to
host the world's first-ever ✨️Autoscaling Grand Prix✨️.  Just like everything we do, it's going to be fun, a little bit
snarky, a little bit tongue-in-cheek, and a lot of autoscaling goodness.

We are actively looking for sponsors and partners for the Autoscaling Grand Prix, so if that's you---or you work at a
company that might be interested in this---we would [love to talk to you](https://appliedcomputing.io/contact).

I'm so excited that ACRL has made it to its three-year birthday, and I'm extremely excited and hopeful for what's to
come; thanks to all of you for coming along with us on this crazy journey.  I'm so grateful for your support.

As always, thanks for reading.

~drmorr

*[ARR]: Annual Recurring Revenue

[^1]: Everybody in the USA please go vote while you're still allowed to, thanks.

[^2]: Particularly in this economy and job market, my goodness, what a dumpster fire.

[^3]: I'm strictly speaking in terms of revenue here; turns out paying salaries and stuff is expensive, who knew?

[^4]: Thank you to my paid subscribers!  Wouldn't you like to [become one](https://blog.appliedcomputing.io/subscribe)?

[^5]: Long-time readers of my blog might notice that this is extremely backwards from my initial vision for funding; back
    in the good old days (aka 2023), I was hoping and expecting to be largely supported by federal grant money, at least
    for a while.  I had a number of grant submissions that I'd made that, while unsuccessful, were _extremely close_ to
    meeting the funding criteria.  However, given the, uh, ["current state"](https://arstechnica.com/science/2026/05/the-office-of-management-and-budget-tries-again-to-cripple-us-science/)
    of the United States government, coupled with the fact that writing grant proposals is _incredibly_ time consuming,
    I've made the decision to halt pursuing that as a funding source for the time being.  Maybe that will change again
    in the future?  We'll see.

[^6]: Mostly because the ACRL board has been pounding me over the head with it for the last two years.

[^7]: I keep wanting to call it a pivot, but it's really not a pivot.  In the early days of the business, I was willing
    to take money from just about anybody to do just about anything; it was all about staying afloat.  Once I felt
    "reasonable" comfortable and secure, the next step was to narrow the focus: I'm no longer willing to take money from
    anybody to do anything.  If I can't tie (at least a tenuous) line from the work to SimKube, I'm not really
    interested in doing it.  And we're now that the next phase of development: we're still doing SimKube, we're still
    going to be working extremely closely with teams who are using it, but the product is no longer "drmorr".  So from
    that perspective, this is not a pivot at all, but an extremely natural progression in ACRL's growth.

[^8]: Largely based on prior experiences where I was asked to sell things that I did not care about and did not believe
    in.

[^9]: I have a sales coach I've been working with who is absolutely fantastic, I cannot recommend her enough---let me
    know if you'd like an intro.

[^10]: Turns out Portland is a cool city!  Who knew???

[^11]: And no, before you ask, Claude can't help you.
