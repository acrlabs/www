---
title: Writing Better Design Docs
authors:
  - drmorr
datetime: 2024-03-11 11:00:00
template: post.html
---

<figure markdown>
  ![]()
  <figcaption></figcaption>
</figure>

Welcome back, and happy March!  I've been dealing with a bunch of sortof gnarly design decisions with SimKube recently,
and so I thought this week I'd talk about my approach to writing design docs since I started Applied Computing[^1].  In
this post, we'll a) talk about what I think design docs should achieve, b) talk about what to do with all the other crap
that you need to write down when you're starting a new project that doesn't belong in the design doc, and c) walk
through an example doc I've written for SimKube.

## Design docs: What are they good for?  (huh!)

I've written a lot of design docs over the years, and my opinions on them have evolved significantly in that time, so
let's talk about how I work on projects and how I use design docs to help with my process.  But first, some history:
back when I was a baby engineer, the first design doc I ever wrote was essentially to get permission to refactor a
terrible codebase into a slightly less terrible codebase.  As is common at most places, there was a design doc
template[^2] that had all kinds of irrelevant fields, like "What is your database schema?" and "What are the security
implications you need to consider?" and I was like, "Idk, man, I just want to move some code from this file to that
file."

The problem with "design docs" at most companies[^3] is that they're trying to do too many things for too many people
and so they end up just being bad at all of them.  They are a) explaining the background and problem space, b)
describing at a high level the proposed solution or project, c) trying to justify why this particular problem is the
correct one, d) trying to make a prioritization argument for why this project should be done instead of other projects,
e) providing an in-depth technical specification for the project, f) describing the public API and/or user experience
for the project, g) trying to articulate important trade-offs or decisions that need to be made, h) responding to
security concerns, i) describing how the project will be productionized (monitoring, alerting, all that jazz), j)
describing the rollout plan, k), describing the project timeline and important milestones along the way, and l) I dunno,
your company probably has some other random requirements in here that I didn't cover.  Whew!

Now don't get me wrong---all of those topics are important topics to consider, and definitely require some form of
communication to your stakeholders.  It _may_ be the case that that communication should be written down, but it doesn't
_have_ to be written down for each of those categories.  It really depends on the context that the project is being
considered in.  But what I can say with absolute certainty is that if you try to have one document answer all of those
questions, you're going to end up with a 20+ page Google doc that nobody is going to read, is tonally all over the
place, and will provide basically anyone in the company the opportunity to hamstring your project because they don't
like this one section that you probably just pulled out of a hat because actually implementing that part is two years
away and who knows what's going to change between now and then[^4].

So, if we all agree that we've had too many 20+ page Google docs in our lives, let me talk about ways that we can still
write about our technical designs without resorting to the canonical design doc.  At Applied Computing, I don't write
design docs; instead, I write what I've taken to calling "Technical Decision Records"[^5].  What's that?

> A technical decision record is a _narrowly scoped_<sub>1</sub> document that aims to _answer_<sub>2</sub> between _one
> and three_<sub>3</sub> _closely related_<sub>4</sub> _technical_<sub>5</sub> questions about a project's design.

There's a bunch of load-bearing words in that definition, so let's break it down a bit more.

1. _Narrowly scoped_: The decision record should have a single focus area that it's trying to resolve.  If there are
   bunch of unrelated open questions about your design, then you should have one technical decision record[^6] for each.
2. _Answer_: Maybe this goes without saying, but the goal of one of these documents is to help you make a decision!  If
   you don't need to make a decision, or worse, at the end of the process you haven't _made_ a decision, why are you
   wasting your time???
3. _One and three_: This is related to the first point, but I find that limiting my scope to at most three questions
   helps me keep the focus on a single topic.  If I find myself needing more than three questions, that's a signal that
   maybe I need to break the problem down further.  This isn't a hard and fast rule, though, if you have four questions
   you need to answer nobody's going to come after you.
4. _Closely related_: Have I said this needs to be a tightly-focused document enough times yet?
5. _Technical_: It's in the name, y'all.  Similar ideas probably work for non-technical decisions that you need to make,
   but a _technical_ decision record needs to talk about the technical aspects of your problem.  Stuff like "milestones"
   and "rollout plans" etc., can and should _influence_ your technical decisions but you shouldn't use this document to
   _articulate_ what your rollout plan is going to be.

The most important thing here is that you _don't write a technical decision record until you have a decision to make_.
If the path forward is obvious or straightforward?  Don't write a document, just do it.  If you know you'll need to
eventually make a decision, but you don't need to know the answer right now?  Don't write the document!  Nobody's going
to care and you might have new information by the time you actually _need_ to make the decision.

"But drmorr," I hear you saying.  "What about all that other stuff?  Don't all of those other things play into your
technical decisions?"  Absolutely they do.  The technical decisions you make will should 100% be influenced by your
project's prioritization, your organization's security posture, your target customer experience, etc.  You can even
_reference_ these factors in your decision record.  But those should be _separate pieces of communication_.

"But drmorr," I hear you saying again[^7].  "If those are in separate documents, and someone doesn't know about those
other documents, and they come across your &lt;grimace&gt;TDR&lt;/grimace&gt;, how will they be able to understand the
context behind it?"

This is a great question, but it's a different problem than what I'm trying to solve.  The question you just asked me is
about documentation _discoverability_.  I can't tell you how to solve this problem, but what I can tell you is that if
you try to solve the discoverability problem by stuffing everything into a single Google doc, that's how you end up with
20+ page Google docs that nobody reads[^8].

## Example: A SimKube decision record

In this section, I'm going to show you an example of a decision record I recently wrote up for SimKube so you can get an
idea of how I approach these documents.  I'm going to break this down into sections and cover each section one-at-a-time
with some commentary thrown in the middle.  Contents from the design doc itself are quoted, and my commentary is in the
regular style.  For context, this design doc is one that I wrote when I was trying to reason about how to get data out
of SimKube for future analysis, and is what ultimately led to the creation of [prom2parquet](2024-02-26-simkube-part-4.md).

Note that I cut some of the sections down for length purposes, but if you want to follow along and read the entire
document, you can find that [here](https://ember-bottle-fbb.notion.site/Data-Analysis-for-Kubernetes-Clusters-e0a9ec3818fe4954a65775164621c3a3).

> ### What problem are we solving?
>
> We want to be able to perform data analysis on Kubernetes scheduling and autoscaling behaviour.

Ok, first up I define the scope of the document.  This is a one or two sentence high level description of the problem
I'm trying to solve, and helps set the stage for the rest of the doc.

> ### What steps do we need to take to get there?
>
> - We need to be able to import data from (say) multiple scheduling simulations
> - We need to be able to compute metrics and nice visualizations based on the input data
> - We need to be able to save all of the data analysis somewhere persistent (S3)

Now we're starting to scope things down a bit more.  These are essentially our hard requirements, and generally
correspond closely to the questions we're trying to answer.

> ### What questions do we need to answer?

Ok, here they are; I have three questions defined in this particular document.

> ### Where do we get the data from?
>
> - Basically the “only” option we have here is Prometheus.  Any other solution for scraping metrics involves us
>   re-inventing a huge amount of stuff that Prometheus already does.
> - The real question here is, how do we get fine-enough-grained data so that we can do some reasonable analysis on it?
>   We need at a minimum 1s resolution, I think.  We can’t expect users to run their existing prometheus at 1s
>  `scrape_interval, so this essentially means we have to launch our own Prometheus pod per simulation.
>     - Option 1: rely on the prometheus operator
>         - pros: this is what we’re already using in our stack, I think it’s not super hard to create a new prometheus
>              object in sk-ctrl that targets the things we want.
>         - cons: we introduce a dependency on the prometheus operator into SimKube.
>     - Option 2: construct either fireconfig, helm, or raw YAML to ship
>         - pros: no extra dependency needed
>         - cons: *ugh*.
>     - Decision: we’re not expecting users to run this in their production clusters, simulation clusters are *supposed*
>       to be ephemeral, so we can care a little less about another dependency in here.  Let’s do the Prometheus
>       operator because it’s easier.  At some point down the line, if someone complains, we can revisit.

Ok, above you see the rough format I follow for each of the questions.  I put the question I want to answer in bold, I
(optionally) write down a bit of extra context[^9], and then write down all the options I can think of.  It's important
to write down _all_ the options, even if you're reasonably sure you're not going to take one of them.  You're
brainstorming here.  There aren't any dumb options.

Once I've written down all the options I can think of, I go back to each and write down all the pros and cons I can
think of for each option.  Sometimes you end up with "pro of option A is con of option B" and vice versa, but I'd
encourage you to try to think a little bit deeper than that.  Each option you write down _probably_ has some advantages
or disadvantages that just aren't present in the other options.  Figure out what those are and write them down.

By this point, the very act of writing down all the options may have made it obvious what you need to do, so go ahead
and write down your decision.  Note here that I explicitly call out in my decision that it's OK to revisit later if we
need to.  If I'm in doubt about a decision, I tend to err towards the decision that lets me course-correct later the
easiest.  If you still _don't_ know what the right answer to your question is, that's ok!  Leave the decision blank and
go on to the next question.

> ### How do we get the data out?
>
> - Option 1: dump the TSDB
> - Option 2: targeted export
> - Maybe Option 3: can we provide “export hooks” in the simulation?
> - Decision: let’s try going down the Option 3 route and see how far that gets us.
>     - Update: we ended up using Prometheus remote write targets, which basically let users send their data anywhere
>       they want.  The remote write targets need to be set up outside of SimKube, which is maybe a bit annoying, but I
>       don’t *really* want SimKube to be responsible for configuring this.

For the sake of "trying not to make this post too long", this is an abridged version of what I actually wrote down.
There are two things I want to call out about this section.  The first is that the original decision I made basically
says "I don't know what the right answer is, let's try to collect more data."  This is a fantastic outcome from a
decision record!  Remember, the whole point of this document is to try to help you make a decision, and if you truly
don't have enough information to make the decision, then your next step is to either a) pick _something_ because you
don't have time or it's not important enough, or b) go collect the data that you need.

The second thing I want to call out here is that I went back and _updated_ the decision record once I got that data.
This document isn't _just_ to help you make the decision, it's also to provide context for anyone else (maybe even you)
who comes along six months later to understand _why_ you made the decision that you did.  I know this is a little bit
annoying to do, but your future self will thank you for it.

> ### What format do we want to store the data in (while we’re doing the analysis?  After we’re done?)
>
> ...

I'm eliding the last section for length reasons, but I just want you to notice that I'm not using particularly formal
writing here in this document, either.  Part of that is because my only audience for this doc is me, but also it's
partly because formal writing takes time and I'm trying to drive to a decision _quickly_.  So I don't worry (much) about
proper grammar, punctuation, I throw in words like "ugh", I have excessive parentheses, all of the stuff that I would
cut out if this were a more formal document.  What matters here is _not_ the formatting, it's the content.  So get the
content right and who cares about the formatting.

## Yo dawg, I heard you like design docs...

So there you have it!  A design doc for your design docs.  I don't know that any of the ideas I wrote about in this post
are particularly _new_---you can definitely find other people who advocate for similar formats or ideas all over the
Internet, but for some reason it doesn't seem like they stick at a lot of companies.  I think maintaining a healthy,
iterative, uh, agile[^10] culture requires a lot of strict discipline and support from leadership, and it's not always
immediately obvious what the benefit is (in fact, sometimes the short-term benefit is negative, because you have to tell
somebody "No, I'm not sticking that in my design doc template").  So I can see why it's hard to do, particularly at
larger organizations.  But, if you _can_ make it happen, your engineers will thank you.

Anyways, that's all I've got for this week!  Thanks for reading,

~drmorr

[^1]: What, you thought just because I'm the only employee and I basically get to do whatever I want that I'm throwing
    all sense of decorum and best practice out the window?  I can't believe you have such a low opinion of me.  My code
    even has unit tests!

[^2]: Stop me if you've heard this one before.

[^3]: And possibly also with how they're taught in university, I dunno, I changed majors primarily so that I didn't have
    to take the class where we learned how to write design docs.

[^4]: I swear, if I had a nickel for every time I've written something in a design doc where I said to myself, "Please
    God don't ever let me have to actually implement this," I'd probably have, idk, ten nickels or something.

[^5]: I really wanted something that acronymized to "<a href="https://www.youtube.com/watch?v=Fy3rjQGc6lA">TPS
    Report</a>", but I couldn't think of anything.

[^6]: I am working _extremely hard_ to not abbreviate this as TDR, because that's just too corporate for me.

[^7]: My goodness you're whiny today.

[^8]: Shocking everyone, I do have _some_ opinions on discoverability, actually, which basically boil down to "all your
    documentation for a project should live in the same place."  Maybe they're all in the same Notion teamspace, or all
    under the same Confluence or wiki heading, or all in the same folder in Google drive.  You can also aggressively use
    links between documents to aid in discoverability.  Oh, and your technical specification should just be an API doc
    that lives next to your code.  But hopefully the API docs get published somewhere so that they're easy to link to
    from everything else.

[^9]: Note here that I'm actually refining the question I'm trying to answer in the second bullet point.

[^10]: Ugh, fine, I said it.
