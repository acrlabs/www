---
title: '"Move Fast and Break Things" considered harmful'
authors:
  - drmorr
datetime: 2024-07-22 11:00:00
template: post.html
---

<figure markdown>
  ![an empty urban environment with many broken windows. there is a dark grey sky. drawn in a comic book style](/img/posts/windows.jpg)
  <figcaption>
    What I imagine working as a software engineer will look like in 20 years.
  </figcaption>
</figure>

Whew!  It's been almost a month since I posted here[^1].  I was travelling for several weeks on a well-needed vacation.
But I'm back now, and I have some bangin' posts lined up for the next few weeks.  We're going to talk about graph
theory, simulation, Kubernetes, some other projects I've been working on, and (of course) more hot takes about the tech
industry! Today's topic falls into that last category: we’re going to talk about moving fast and breaking things.

Before we go any further, though, I do need a big caveat up front: everything we're talking about in here is a tradeoff.
I am not, for example, arguing that we should go back to design-doc-driven, waterfall-style development.  There is a
tradeoff between speed and reliability, and I'm trying to make the point that maybe as an industry we've gone too far in
one direction.  I'm not going to include that caveat everywhere in this post that I employ a bit of artful hyperbole,
however.

## Thanks, Bezos

So a long time ago, way back when the dinosaurs and humans were meandering around together, this guy named Jeff
Bezos[^2] espoused his philosophy for decision-making in an [investor-relations letter](https://www.aboutamazon.com/news/company-news/2016-letter-to-shareholders).
There's been endless ink spilled about it all over the interwebs, but in case you're unfamiliar, (one of) the general
themes of the letter was "make high-velocity, high-quality decisions" (in the same section of this letter, Bezos (re-?)
iterated the now famous "disagree and commit" line[^3]).  Anyways, the rough idea is that "most decisions don't cost
very much to make, and the consequences aren't that bad if you make a bad decision, because you can always make another
decision later on if you get more information and learn that your previous decision was bad."

Now, this idea _sounds_ great in principle.  We all want to make good decisions, and we'd like to have them made now,
dammit.  I think that Bezos's mindset grew out of the "tech revolution" of the late 90s and early 2000s, wherein
many people were tired of the slow-moving ancient tech behemoths that took forever to release new software, and when the
software _was_ released it was buggy as all get-out, and then it took another three years for them to release a patch
which fixed the bugs but also introduced a bunch of new bugs[^4].

These leadership trends are so popular and so widely quoted that people almost take them as axioms.  Indeed, if you do a
Google search for "Disagree and Commit" you'll be met with pages and pages of leadership articles, blogs, LinkedIn
posts, etc. praising the DaC virtues, and almost nothing questioning whether this is actually a good idea.  I could only
find two pieces of work that contradict this wisdom: one is an off-hand comment by Hazel Weakly in a [blog post about
observability](https://hazelweakly.me/blog/redefining-observability/), and another by a guy who (apparently) made a zine
called "[Why Disagree and Commit is a Bad Idea (and 7 ALTERNATIVES you can try instead](https://mastodon.social/@stephenpa/112170759522145113)",
which, by the way, I would love to read but can't actually find a copy of anywhere :(

Anyways all of this is to say, "I would like to use this post to question some common wisdom in the tech community and
maybe add a tiny bit of balance to the conversation, but probably not very much balance because I'm unlikely to have any
good solutions."

## Thanks, Facebook

Another extremely popular concept in Silicon Valley culture is "move fast and break things".  I didn't realize it until
I started writing this post, but this maxim was actually [coined by Mark Zuckerberg](https://en.wikipedia.org/wiki/Meta_Platforms#History)
at Facebook.  The words are different, but the similarity to Bezos's letter is clear: speed is more important than
accuracy.

And look.  Ok.  Sure.  Sometimes?  I guess?  But you know what happens when you move fast and break things?  You leave a
lot of broken shit behind in your wake.  And who's gonna clean up after you?  Not me, not unless you pay me a whole heck
of a lot of money[^5].

The argument, I guess, is that sometimes things need to be broken and not fixed.  But I think that's the exception, not
the rule.  Humans don't _like_ broken things; it makes us very unhappy[^6].  And I don't know about you, but I didn't
get into this business to make people unhappy.  I'd like to make things _better_, not _worse_.  And I certainly don't
want to make things worse and tell everybody I'm making things better, which seems to be the tack that many modern
companies are taking.

Somewhat humorously, in 2014, Mark Zuckerberg changed Facebook's motto from "move fast and break things" to "move fast
with stable infrastructure", which, you know, just doesn't quite have the same catchy ring to it.  _That_ motto
certainly hasn't caught on in the industry.

## Thanks, Applied Computing

Ok, this is the section where I toot my own horn a little bit, and claim that I'm smarter than Bezos and Zuckerberg, or
whatever.  I mean, who knows, really, they both own billion-dollar companies and I don't, so maybe I'm not actually
smarter, but I can tell you that I've spent a lot of time cleaning up people's messes, and I'm tired of it.

I just finished reading [The Pragmatic Programmer](https://www.amazon.com/Pragmatic-Programmer-Anniversary-Journey-Mastery/dp/B0833FBNHV/ref=sr_1_1)[^7]
and one of the major themes of the book is "Don't abide broken windows".  The idea actually comes from urban planning:
studies[^8] have shown that buildings can sit uninhabited for years without the quality of the rest of the neighborhood
declining, but as soon as a single window in the building is broken, everything else goes to hell in a handbasket.  The
moral of the story is "the cost of fixing a few broken windows now is less than the cost of fixing the entire
neighborhood in a year".

The authors of the book apply this same principle to software development.  As we build things, write new code, etc.
etc. etc., some things are going to break.  It might not even be our fault, but the entire universe is in a constant
state of change, and change breaks things.  But if you don't spend time up front fixing the things that are broken,
eventually you're going to end up in a state where _so many things are broken_ that the only solution you can think of
is to burn it all down and start from scratch.  And let me tell you, that strategy rarely goes well for anybody.

So here we get to the thesis of this post: if you take the industry "wisdom" to "move fast and break things" (or
equivalently, "make lots of decisions quickly and fix the bad ones later"), you're going to end up with a lot of broken
windows. And I'm tired of broken windows, so I've worked hard to take a different approach at ACRL. It's maybe not as
pithy, maybe not as exciting-sounding, but I'm hoping that it will pay off for me in the long run: "move slowly and make
sure you're solving the right problems."

As with everything in life there are always tradeoffs.  If you move too slowly, you're going to miss your window of
opportunity; the world will have moved on[^9].  But if you move too fast, all you're gonna get are broken windows.  So
in the work that I've been doing for the past year, I've tried really hard to make sure that I'm solving the right
problems, and then spend time solving those problems the right way.  For example, SimKube has ~75% test coverage, and CI
pipelines that work[^10].  Why?  Why bother, when nobody's using it except me right now?  Couldn't I have made more progress
on SimKube by moving faster and ignoring that stuff?  Yes, absolutely, but also SimKube would not be nearly as robust as
it is right now.  Spending the time to do the basic stuff right, right now, will (I _hope_) have compounding returns for
me in the future.

What about everything else?  The stuff that "isn't the right problem, but still needs to be solved?"  If I can, my motto
in these cases is "move fast and don't leave a broken window behind".  In many cases, that looks like "paying somebody
else to solve the problem".  I don't have infinite money, but I do have _some_ money, and I'm trying to use that
strategically.  For example: I didn't _have_ to find a lawyer to fill out the paperwork for my LLC.  That paperwork
isn't hard.  I could have done it myself, or used LegalZoom's service.  But I chose to establish a relationship with an
attorney early, because a) I really really wanted it done correctly, b) I knew they could do it faster than I could, and
c) now I have an attorney that I trust to do good work for me, which has payed off many many times over.

But like I said, I don't have infinite money, and there are problems that a) I need solved, b) now, and that c) I can't
afford or don't want to pay someone else to solve.  In these cases my motto is "move fast and minimize the impact of the
broken window".  If we go back to the urban planning example, I put up plywood over the window.  Is it perfect?  No.
Does it look nice?  Absolutely not.  Does it work?  For now.

In some cases, this just looks like "writing down what I did".  You'd be honestly amazed at how many broken software
windows could be mitigated just be somebody writing down "what they did and why".  I have extensive notes on "how I have
my computer system set up" and "how I have my AWS infra configured".  Are they all perfect systems?  Of course not, I've
taken a bunch of shortcuts all over the place---but I have those shortcuts _documented_ so that in the future I can try
to improve them.

The other strategy I take here is to isolate or abstract the broken window; maybe I have a bit of code that is really
gross, but I don't have time or the ability to fix it right now.  I stuff that sucker behind a "clean" abstraction layer
and then write a bunch of tests around the abstraction layer to make sure it's behaving correctly.  That way, the broken
window isn't visible from the outside, and in the future it's easy for me to _fix_ the broken window without impacting
the rest of the system[^11].

So what's the point of all this?  Aside from me getting another opportunity to rant about the state of the industry, I
guess I'm hoping I can popularize a new motto: "move fast; solve the right problems; pay someone else to solve the
problems you don't have time for; don't break too many things and do your best to minimize the impact of the things you
did break."  It's kinda long and cumbersome as a motto, maybe I should workshop it a bit or something, but you know
what?  I don't have time for that right now. 😛

Thanks for reading, and I hope you're all enjoying your summer!

~drmorr

[^1]: Look, I know I said several weeks ago that I was going to stop acknowledging or apologizing for gaps in my writing
    frequency on this blog, but in my defense, I'm very bad at writing introductions.

[^2]: Maybe you've heard of him?

[^3]: I'm not actually really sure of the anthropological timelines for these ideas, and it's pretty hard to piece
    together.  "Disagree and commit" certainly wasn't a new idea by Jeff Bezos, and people have been studying "how to
    make good decisions" for a lot longer than he's been around too.  But the terms are so popular and regurgitated
    these days that it's basically impossible to do a search for them that doesn't end up back at that shareholder letter.

[^4]: Other trends that I believe grew as a reaction to this phenomenon: agile, CI/CD, the very existence of "the
    cloud".

[^5]: Do you have a whole trail of broken shit that needs cleaning up?  I can help!  [Get in touch!](https://appliedcomputing.io/contact/)

[^6]: In an incredibly timely example, ask all the people who were impacted by the [CrowdStrike
    update](https://arstechnica.com/information-technology/2024/07/crowdstrike-fixes-start-at-reboot-up-to-15-times-and-get-more-complex-from-there/)
    whether they like broken things.

[^7]: 30-second review: I generally agreed with the content, but I felt like it didn't go deep enough.  Lots of pithy
    advice and aphorisms, relatively light on the "How do you actually apply this when you're working in a company with
    30 years of technical debt and limited support from upper management to make things better."

[^8]: Which studies?  [Top.  Studies.](https://www.youtube.com/watch?v=Fdjf4lMmiiI)

[^9]: I'm re-reading [The Dark Tower series](https://www.amazon.com/The-Dark-Tower-I-Stephen-King-audiobook/dp/B019NOJ4JG/ref=sr_1_1)
    by Stephen King, which is another book with lots of great sayings and wisdom.

[^10]: And ok, look, I'm using "test coverage" and "CI pipelines" as proxies here.  Having high test coverage for the
    sake of high test coverage is a waste of time.  You have to make sure you're testing the right things.  Having a CI
    pipeline for the sake of having a CI pipeline is a waste of time.  You have a CI pipeline so that you can make sure
    your product is meeting the reliability bar that you've set for it.  Don't at me.

[^11]: _And_, because I already wrote the tests, it’s easy to verify that I fixed the broken window.
