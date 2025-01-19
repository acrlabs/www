---
title: "ACRL Report: State of the Lab"
authors:
  - drmorr
datetime: 2024-10-07 11:00:00
template: post.html
---

<figure markdown>
</figure>

Welcome back!  Now that I'm done with my [SimKube analysis](./2024-09-09-simkube-kca-karpenter-part-1.md), I thought it
would be a good idea to take a step back and look at the bigger picture: why am I doing all this work in the first
place, and more importantly, am I succeeding?  This post will mirror a bunch of internal introspection I've been doing
over the last few weeks, and one of my goals with this platform is to be a place where I can be transparent[^1] about my
progress, so here we go: it's a State of the Lab report!

## Recap: What am I even doing here?

As a reminder (or if you're new around here), I started Applied Computing a little over a year ago, with the goal of
doing open-source research and development in distributed systems (primarily Kubernetes to start with, but I have bigger
ambitions in the long run).  The initial goal was to lean into a perceived wave of support for open-source
development[^2], as well as support from the government and/or private foundations in the form of grant funding.  But,
it's been over a year, and things have changed a lot in the intervening period.  So it's reasonable to ask the question:
should my goals be changing as well?

Let's start with the "open source ecosystem": the overwhelming narrative over the past year is that companies are
tightening their belts, and the idea of funding open-source development has always had a nebulous ROI.  It's somewhere
between "feel-good" money and "the right thing to do but hard to control".  And with the (perceived) upheaval in the
tech industry caused by the AI "revolution", RTO mandates, layoffs, etc etc etc, I think it's fair to say that
"investing in open-source development" is a pretty low priority on a lot of companies' budgets right now.

What about the government grants?  There is definitely a lot of uncertainty and fear about the state of government right
now, but in some ways grant money is more stable: most of the big government agencies (NSF, DoD, DoE, etc) are legally
mandated to allocate a minimum percentage of their research budget towards [grants for small businesses](http://sbir.gov),
and these agencies have large budgets.  So there's definitely money there!  The problem is that accessing it is slow and
difficult.  I've been through two grant cycles in the last year, and even though I felt like I had strong proposals,
didn't make any headway.

The last source of funding I was looking into is "consulting" or contract work.  I've had some limited success here: I
have [one client](https://engineeringblog.yelp.com/2024/08/multi-metric-paasta.html) that I've been doing some good work
for, and thanks to them I've been able to meet my funding goals for 2024.  But I've also had two other (potential)
clients fall through, and very late in the process: I spent a bunch of money on legal fees to negotiate a contract, and
then things happened and it didn't work out.

So that's where I'm at: some success on the consulting front, but I'm going to need to do something different if I want
to be able to continue this into 2025 and beyond.  I've spent a lot of time thinking about this over the last several
weeks, and chatted with a bunch of really smart folks, and have a plan, so let's talk about that!

## The plan: building a sales pipeline

Let's get one thing out of the way first: I still want to build a high-class research lab, and I still want my "core
product" to be open-source.  So how am I going to make any money?  I had an opportunity to talk to [Hazel Weakly](https://hazelweakly.me)
several weeks ago, and she gave me some really solid advice: namely, that I've built a really cool [piece of technology](https://github.com/acrlabs/simkube),
but my "target market" for SimKube has up-til-now been "infrastructure engineers": a group of people who, as a broad
generalization, are overworked and burned out, and have very little political capital to convince their organizations to
spend money.  And that doesn't seem like a good group of people to serve as the foundation of my business.

Hazel also pointed me to a couple of other folks in this space trying to do similar sorts of things.  One of these
people is [Michael Drogalis](https://michaeldrogalis.substack.com), who's spent the last year or so trying to bootstrap
his own business around Kafka streaming simulations[^3].  I've aggressively read through a bunch of his posts to
understand how he's approached the problem differently than me, and one of the things I realized is: Michael has a sales
pipeline, and I do not.  And, I think this makes some amount of sense, given my focus on grant applications over the
last year, but I'm now at a point where I don't have enough runway to go through another grant application cycle.  So
I've started trying to build a sales pipeline.

But what, exactly, am I selling?  Well, Hazel also pointed me to [Jepsen](https://jepsen.io), which is an open-source
piece of software used for testing claims about distributed datastores.  The guy behind Jepsen makes his business work
by providing detailed analyses for companies building databases, where he uses his expertise and the software that he's
written to provide detailed reports on the stability and correctness of these databases.  In short, while the software
he builds is open source, the expertise to use it is scarce---and [Aphyr](https://aphyr.com) (the guy behind Jepsen)
makes his living monetizing his expertise.

That sounds a lot like something I could do with SimKube!  I think my Karpenter/KCA analysis demonstrates that SimKube
is able to provide useful insights and value to organizations, and being able to leverage my expertise as the author of
the system might be able to get organizations that value a lot more quickly than if they try to do it themselves.

So, over the last few weeks, I've combined these two insights, and put together a [pilot program](https://appliedcomputing.io/services)
for small-to-medium-size companies to help use SimKube to reason about their scaling limits and cost savings
opportunities.  But, just developing the program and the sales pitch isn't enough: one of the points that Michael made
in his blog is,

> If you don’t have enough prospects interested in your product, this is the most important thing. Spending time in your
> editor will _not_ drive new business.

I got kindof upset reading that, because, uh, I like spending time in my editor writing code.  But the point is valid:
building new functionality is an important part of the business, but if nobody is going to use that functionality, it's
not actually worth, well, anything.  So, I've been trying to build a sales pipeline.  How do you build a sales pipeline?
For me, at least right, it looks like a _lot_ of talking to people.  I've been reaching out to a lot of folks in my
network to reconnect, and have given them a very specific sales pitch: "I can come help test your scalability".  It's a
bit of an experiment, and we'll see how well it works, but so far I've received middling-to-positive feedback and have a
few potential leads that have come out of it, so I feel semi-optimistic.

I've also been putting a lot more effort into what my informal board calls "content marketing": the SimKube series I put
out was one aspect of this.  I've been sharing a lot more of my work on various media[^4], and I've been working on
putting together a 60-second "product demo" that can hopefully showcase the value of SimKube to folks in a really
easy-to-grok way.  I also have some articles coming out in other venues in the next couple months, and I've been
attempting to get myself on a podcast, although that hasn't panned out yet[^5].  And, of course, I'm going to be at
KubeCon this year: I am giving a couple talks, but I'm anticipating having a fairly different conference experience this
year than I previously have had---I'm probably not going to as many talks, and probably spending a lot more time on the
vendor floor and the hallway track trying to showcase my demo that I will 100% have working before the conference
happens.

None of this is easy.  It's required me to be a bit pushy, and to put myself out of my comfort zone on a daily basis,
and, while I've been learning a lot and actually kindof enjoying myself, it's also really hard.  One of the analogies
I've heard for sales pipelines is that they're like flywheels: it takes a huge amount of effort to spin them up, but
once they're going, it takes less effort (though, crucially, not _zero_ effort) to keep them going.  But I'm definitely
still in the "huge amount of effort" stage of this process.

## Conclusion: it's OK to ask for money

When I started this business a year ago, I had this vision that money would just magically fall from the sky.  Of
course, I knew intellectually that is was not how things work[^6], but there's a difference between knowing something
intellectually and experiencing it.  I think the last few months I've moved into the "experiencing it" phase.

Marco Rogers, a tech leader I follow on Mastodon, posted [the following](https://social.polotek.net/@polotek/113194492689919589)
a couple weeks ago:

> If you're doing something because you're hoping it becomes important enough to generate money, just say that. That's
> not volunteer work though. It's actually entrepreneurship. That's actually a good thing. And I wish more open source
> people would lean into it.

That post was really nicely timed with a lot of the other introspection I've been doing.  I believe pretty strongly that
people should get paid for the work that they do, and I make an effort to pay people for the work that they do for me.
What I'm trying to lean more into is the realization that "I can do work in the open, but I should still get paid for
it", and this post is my attempt to distill down my strategy for doing so.  I guess we'll know in a few months how well
it works (or not)!  In any case, I'm doing my best to enjoy the ride, and I'm really grateful to have all of you coming
along with me vicariously.

Thanks for reading,

~drmorr

[^1]: This is leadership-speak for "excessively complain about all my problems and expect someone else to fix them".

[^2]: [CNCF](https://www.cncf.io) showed that it _is_ possible to build a thriving and successful ecosystem around
    open-source development, although the counterpoint to that argument is that it was only successful because it was
    backed by Google.

[^3]: TBH I'm a little jealous of his Substack... he's been a lot more transparent on a weekly basis about what he's
    doing for his business and how successful---or not---those activities have been.  When I started ACRL, I had the
    idea that I would do something similar, but I've ended up blogging a lot more about "whatever was on my mind at the
    time" and less about "how my business is doing".  It probably helps that his blog posts are a lot shorter than mine,
    on average: I feel compelled to put out about 2000 words at a time or it doesn't seem worthwhile, and I can only
    spend 2000 words a week on my business operations for so many weeks in a row before I run out of things to say.
    Anyways I guess the point of this long rambly footnote is, if you want to know what it's _actually_ like to
    bootstrap a small software business, his blog is a really good one to read.

[^4]: I've been getting a surprising amount of engagement on LinkedIn, which makes me feel a little gross, but also
    seems like something I should maybe stop neglecting quite as much as I have in the past.

[^5]: Hi! Do you have a podcast?  Are you looking for guests?  Pick me!  Pick me!

[^6]: At least not until capitalism is abolished, and maybe not even then.
