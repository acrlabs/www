---
title: "XXXX"
authors:
  - drmorr
datetime: YYYY-MM-DD 11:00:00
template: post.html
---

Earlier this year, I had the opportunity to chat with Courtney Nash at SREcon, and one of the things she reminded me is
that "it's OK to say that you're an expert".  So, what am I an expert in?  Well, for the last decade-plus, I've been
working with autoscalers for distributed systems.  I built [Clusterman](XXXX) at Yelp---originally for Apache Mesos, and
then migrated to Kubernetes; I've contributed to both the [Kubernetes Cluster Autoscaler](XXXX) and [Karpenter](XXXX);
and I've helped a lot of companies do autoscaling better.  So, I think it's safe to say that I'm something of an
autoscaling expert.

Autoscaling is a bit of a funny topic: it's one of those domains that _seems_ like it shouldn't be that hard, but once
you start digging into it, you realize that there are a _lot_ of subtleties.  Do you scale up reactively, or do you try
to predict when new resources will be necessary?  How long do you keep unused resources around before scaling down?  How
do you put guardrails around your system so it doesn't scale out of control, and then what do you do when your
applications run into those guardrails naturally?  How do your answers change when you're in the middle of an incident
or outage, instead of normal operations[^1]?

Thus, I thought it would be interesting over the next several weeks to deep dive into autoscaling: why do we do it, and
how do we do it well?  At ACRL, we've identified five "key metrics" that you should be tracking for your autoscaling
engines, and---spoiler---they might not be the normal ones you think of.  In this post, we'll do a quick overview, and
then spend future posts digging into some details.  If you're curious, follow along below!

## Why do we autoscale?

Before we talk about anything else, it's important to understand _why_ we autoscale.  There are two main reasons: the
first, which is the one everybody talks about, is cost.  When you were a small baby startup, you had lots of AWS credits
and not that much infrastructure, so you just massively overprovisioned everything, because why not?  It's all free
anyways.  At some point, however, you ran out of AWS credits and you have a _LOT_ more infrastructure, and your VP of
Finance comes to you with a bill.  What do you do?  Just shove some autoscaling in there!  It'll be easy!  Take your
tech lead a couple weeks at most.  Massive savings!  Problem solved!

But it turns out to not be that easy; two weeks later, your tech lead has "shoved some autoscaling in there" and you've
just had your first autoscaling-related outage.  Whoops.  So then you kick off a months- or years-long effort to balance
your cost savings efforts and your reliability efforts.  Better [write some OKRs about that!](2024-02-05-okrs-are-bullshit.md).

The above example highlights something that I've said hundreds of times: cost and reliability are diametrically opposed.
You can make your system extremely robust by purchasing all of the largest, most expensive compute that you can get your
hands on[^2], but then you're gonna get another visit from your VP of Finance.  On the flip side, you can make your
system extremely cheap by shutting off all your compute, but then you're going to get an unpleasant visit from your CEO
because they no longer have a company.  Obviously these are extreme examples; in reality, you're going to be constantly
balancing the tension between these two extremes.

However, there's another reason for autoscaling that most people _don't_ talk about, that I might argue is even more
important.  Even if you're running at peak capacity all the time, one of these days your little startup is going to run
into limits.  You're a hyperscaling growth company, after all!  You double the number of users of your product every
other week!  Congratulations!  You've won capitalism!

Back in the previous century, you would handle this by going through an extremely rigorous data analysis exercise called
"capacity planning".  Unlike today, when you can ask AWS for a new machine and get it approximately instantly[^3], it
would take between 3 months and a year between when you "place an order for new hardware" and "when it shows up in your
datacenter" and then another several weeks or months after that to when it was actually available for use.  So you would
need to predict, somewhere between 3 months and a year in advance, how many compute resources you would need.  And if
you got it wrong, welp, good luck.

Autoscaling makes that easier; it doesn't obviate the need to do capacity planning, but it gives you more leeway if and
when your predictions don't pan out.  This isn't a cost thing; it's a "long-term viability of your business" thing.
And, at least to me, that's an extremely compelling reason as to "why you should think about autoscaling even when your
business is small."

## What things can we autoscale?

Conversations around autoscaling tend to be very confusing, because everyone is talking about something slightly
different in the process.  As an industry, we've landed on three different types of scaling activities, which I'll
briefly overview here and then make the probably controversial claim that "they're all the same".

1. Node autoscaling: this is what we were studying in [my comparison](2024-09-09-simkube-kca-karpenter-part-1.md)
   of the Kubernetes Cluster Autoscaler and Karpenter.  How many compute resources do we need at any given time, and can
   we get those from your cloud provider of choice?  In "most" organization, node autoscaling is the purview of the
   platform or infrastructure team(s).
2. Application (horizontal) autoscaling: if node autoscaling is managing your hardware, application-level autoscaling is
   managing your software.  How many copies of your webserver do you need running at a time?  How many shards does your
   database need?  Application-level autoscaling is typically handled by the team that owns the application or service;
   some applications can scale really well (e.g., your stateless webserver), and some do not (scaling out read replicas
   for a database is generally not "too hard", but scaling out write replicas is typically much more difficult).
3. Vertical autoscaling: also called "right-sizing", vertical autoscaling is a less-frequently-used form of
   autoscaling[^4].  If application scaling is answering the question, "How many copies of my application do I need?",
   vertical scaling is answering the question, "How many compute resources does a _single copy_ of my application need?"
   Vertical scaling is typically also owned by the application owner, but as mentioned, it's a less-frequently
   reached-for tool.  It should also be noted that, if implemented poorly, there is a nasty feedback loop between
   vertical and horizontal scaling, which means that you can't use both unless you do it intelligently.

But OK, back to my original claim, which I said was going to be controversial: these three types of autoscaling _are all
the same thing_.  Or, to put it slightly more precisely, they're all answering the same question: "How do I ensure that
my application has the resources it needs to do whatever it needs to do _right now_?"  The only reason we've split
"autoscaling" into these three different buckets is to make it easier to reason about[^5].

In an ideal world, however, we'd have a single autoscaler that behaves as follows[^6]:

1. Ooops, we can't handle the application load right now!
2. Which thing will resolve the situation?  Is it:
  a. Add more hardware
  b. Add more software
  c. Make the software bigger
  d. Some combination of the above
  e. Some combination of the above while also kicking out some other software that isn't needed right now
3. Do the thing you identified in step 2.

If you really wanted to get fancy, you'd through a machine learning algorithm on top of that and add some predictive
capabilities to your autoscaler, but I'd argue that in 98% of cases, as long as you can provision new resources quickly
enough, predictive scaling isn't needed.

But anyways, now that we know _why_ we autoscale and _how_ we can autoscale, let's wrap up this post by answering the
question, "How do we know if we're doing a good job?"

## The five key autoscaling metrics

Most organizations look at one metric for their autoscalers: provisioned capacity versus requested capacity.  This is,
basically, _only_ looking at the cost side of things.  The higher your utilization, the fewer resources you need, and
the less money you have to pay AWS.  But as we've already identified, this is an extremely reductive way of looking at
things.  Autoscaling is a tool that we are using to find our place on the cost, reliability, and capacity-planning
spectrum, and if you're not paying attention to metrics that address all three of these areas, then you're flying blind.
So let's briefly talk about ACRL's Five Key Metrics for Autoscaling :tm:

1. Committed capacity percentage - I already described this metric, but just for the sake of putting it in a nice list,
   your capacity metric measures "how many resources you're wasting".  Higher committed capacity = less wasted money.
   Easy.  'Nuff said.
2. Error rates - If capacity commitment is measuring your cost, error rates measure your reliability.  When you get a
   burst of traffic and you have to scale up, do you throw a bunch of errors until the capacity comes online?  When you
   start scaling down, do you interrupt a bunch of in-flight requests and force retries?  Or do you do graceful scaling,
   both _up_ and _down_?[^7]
3. Mean Time to First Byte (MTFB) - this is a concept I borrowed from the front-end community, where they have the
   concept of "mean time to content": basically, how long does it take from when a user enters a URL in their browser to
   when they can do something meaningful on the webpage?  MTFB is a similar concept: how long does it take from when an
   autoscaler decides to scale up, to that application or service actually doing useful work?[^8].  If capacity and
   error rates are tracking your cost and reliability metrics, MTFB is tracking your "scaling responsiveness".
4. Application disruption - this metric is one of my personal pet peeves, because Kubernetes gives you basically no
   ability to control for this.  But, ideally, your autoscaling engine isn't causing a bunch of disruption to running
   pods that is forcing you to repeat a bunch of work, because that's just wasteful.  Stay tuned for the longer rant on
   this one.
5. Application churn - this final metric is not often talked about, but anybody who's written an autoscaler (or, heck,
   any kind of engineering system) has dealt with the problem: your autoscaler thinks you need two and a half replicas,
   but unfortunately, you can't _have_ two and a half replicas, so instead you get two.  And then three.  And then two.
   And then three.  And then two.  And then.... Anyways, go look up [PID controllers](XXXX)[^9].

So there you have it!  Track those metrics, optimize your autoscaler for all five of them at the same time, and boom!
You're all done!

Ahahahahah.  Haha!  HAHA!  I can't even say that with a straight face.  Anyways, we're going to take a closer look at
each of these metrics over the next several weeks, and we'll give some examples from our past experience about why
they're important and what can happen if you don't pay attention to them.  Hope you enjoy the ride!

As always, thanks for reading.

~drmorr

[^1]: I can't count the number of times I've seen or been involved in an incident where the system loses all its
    traffic, the autoscaler scales everything down (because there's no traffic and thus no reason to keep the resources
    around!), and then when the traffic comes back, it causes a second "thundering herd" outage because there are no
    longer any resources to handle the load.

[^2]: This is Anthropic's strategy, but for some reason it doesn't seem to be working out for them.

[^3]: Unless it's [a GPU-backed node](XXXX-mean-time-to-GPU-post).

[^4]: However, with the advent of [in-place pod resizing](XXXX) in Kubernetes XXXX, I expect to see a lot more places
    experimenting with vertical scaling.

[^5]: If you really want to throw a monkey wrench into things, I also believe that _scheduling_ is the same thing as
    well!  If this weren't true, why does every autoscaler in existence also run a scheduling simulation as a part of
    its feedback loop?

[^6]: Astute readers might notice that this is just "getting rid of some of the layers" which is a concept I haven't
    talked about [on the blog](./XXXX-2023-08-14-thoughts-scheduling-autoscaling.md) for a while, but I still think
    about basically all the time.

[^7]: "But David," I hear you say, "I'm just a lowly platform engineer, and that stuff is controlled by our service mesh
    team!  I can't control how we do retries!"  To which I respond, "Don't make me tap the 'layers' sign."

[^8]: Most of the other articles I've read about this look at "mean time to scheduling", e.g., how long between an
    autoscaler action and a running application?  But a running application isn't necessarily a _useful_ application,
    and we care about useful things here.  The objection to this metric is the same as before: we don't have control
    over the application stack!  Again: sign.  Layers.

[^9]: I've been having a lot of conversations recently with folks about how the software engineering community refuses
    to learn any lessons from any of the other engineering communities that have predated it, and instead just treats
    every problem as "100% brand new and nobody else in the world could possibly have any insight or encountered it
    before", and, well, I unfortunately think the "application churn" metric is one of these cases.
