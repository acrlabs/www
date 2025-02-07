---
title: "2020 IV: A New Hope"
authors:
  - drmorr
datetime: 2024-01-22 11:00:00
template: post.html
---

<figure markdown>
  ![A collection of people and droids, some of them carrying lightsabers, underneath a fleet of giant spaceships with
  legs in improbable configurations.  The caption reads "Teenty Teety A New VIV Hope" in approximately Star Wars font.](/img/posts/anewhope.jpg)
  <figcaption>We ended last year with a cursed Star Trek image so I figured we should start this year with a cursed Star
  Wars image.  Created by Bing Image Creator.</figcaption>
</figure>

Welcome back to the Applied Computing Research Labs blog!  Happy new year!  I hope you all had a good holiday season.
My holidays were lovely, though I worked more than I would have preferred---I had 2 (two) grant proposals due in late
December and early January, which took a bit of doing to pull off, but I had some vacation time last week to recover.

This is my first post for the new year, and before we dive back into technical content, I want to talk a little bit more
about Applied Computing itself, what it took to get it started, and what my vision is for the company.  But before we
can do that, we first need to talk about...

## The Substack Problem

As you (probably) know, this blog is hosted on the Substack writing platform[^1].  I've done as much as I can to remove
most of the annoying Substack branding (like the interstitial you get on a lot of pages asking you to subscribe before
you can continue reading), but especially if you've subscribed, it's hard to miss that this is Substack under the hood.
Some of you may also be aware that Substack came under fire over the holidays for not only _hosting_ Nazi and alt-right
content, but also (algorithmically) promoting it to users.  In response to criticism, Substack trotted out the usual
"free speech" apologia, which, frankly, is kindof insulting for a platform whose shtick is "well-reasoned long-form
writing".  I'm not going to go into the details here, if you want to learn more, Ken White (aka Popehat) has [a very
nice writeup](https://popehat.substack.com/p/substack-has-a-nazi-opportunity) about the issue.  In response to this
kerfuffle, a number of prominent Substack writers (including the excellent [Molly White](https://citationneeded.news)
and [the team behind Platformer](https://www.platformer.news/why-platformer-is-leaving-substack/)) have decided to
abandon Substack.  Ken White, as far as I'm aware, is staying with the platform "for now", but it's possible that could
change.

The question I want to answer here is, "What am I going to do about it?"  The short answer is, in the short term,
nothing.  To be clear: Applied Computing does not agree with, tolerate, or support Nazi bigotry or hate speech in any
form, and Substack's stance on this content is, uh, troubling, to put it extremely mildly.  At the same time, my current
reality is that I am (currently) a one-person shop and I'm juggling a _lot_ of different things.  I have a small (but
growing) platform here, and while my blog is an important part of my business, "becoming a famous writer" is _not_ my
business model with ACRL.  So while I have never planned to stick around Substack forever[^2], at this current time,
trying to get everything migrated to a new platform and juggling followers and such seems too disruptive to my primary
goal of "finding funding for my growing small business".

So, with that said, what can you do?  As Ken White (and others) have said, "reasonable minds can differ on the morality
of renting a walled garden at an estate that also rents walled gardens to Nazis", and if you think that "stopping Nazis
should obviously be a higher priority than making money," I honestly can't really argue with that.  I certainly can't
fault you if you decide to unsubscribe from this publication as a result.  However, I do want to provide two options for
you in case your viewpoint is "I like drmorr but I can't in good conscience continue to support Substack":

1. There is a not-well-advertised [copy of this blog](https://appliedcomputing.io/posts.html) hosted on ACRL's website
   with an RSS feed[^3].  It doesn't have all of the backlogged posts on there (yet), but it will have all the posts I
   make going forward.  So, you can easily keep up with my writing without having to interact with Substack at all if
   you want.
2. If you are a paid supporter (thank you!) or you want to become a paid supporter, but you don't want Substack taking a
   cut, you could consider becoming a [sponsor of ACRL on GitHub](https://github.com/sponsors/acrlabs) instead.

But, if you disagree with everything I've said this far and just want to unsubscribe completely, that is also totally
OK.  I appreciate deeply your support, but if ACRL ever becomes dependent upon it, then I'm doing something wrong.
Which in fact, is a perfect segue to the rest of this post.  So, let's talk about...

## ACRL's business model!

In my [final post](2023-12-18-acrl-wrapped.md) last year, I talked about some of my goals for 2024, and the first goal I
mentioned was "get funded".  So let's talk about that a little bit.

When I tell people I'm doing open-source research and development, often the first question I get asked is "who's going
to pay for that?"  And it's a fair question.  I'm giving away stuff for free and hoping to get paid, which is basically
a nonsense business model in a capitalist society.  But, it's not impossible to do, and there are people who are
successful doing it---just, not very many.  An acquaintance told me this week that it's kindof like having a career goal
of "becoming a professional sportsball player"---it's _possible_, just not very likely.

So what makes me think that I have what it takes to be a professional open-source sportsball player?  Aside from a bit
of hubris, I do think we are beginning to see some changes in our industry.  The success of CNCF and Kubernetes has
really shown the world that open-source products can have a lot more value than (badly) re-inventing the same wheel at
every single corporation.  Couple this with a number of high-profile incidents around poorly-funded but highly important
open-source projects ([leftpad](https://qz.com/646467/how-one-programmer-broke-the-internet-by-deleting-a-tiny-piece-of-code),
[heartbleed](https://heartbleed.com), [log4j](https://theconversation.com/what-is-log4j-a-cybersecurity-expert-explains-the-latest-internet-vulnerability-how-bad-it-is-and-whats-at-stake-173896))
, and I think we are beginning to see a shift in the mindset of folks in tech.  Specifically, my hypothesis is that as
an industry, we are now more willing than ever to pay for open-source development, and I predict/hope that this trend
continues to accelerate.

But you can't build a business on hope, so what am I doing _right now_ to get funding?  I am essentially taking a
three-pronged approach:

1. Consulting work: people ask me all the time if ACRL is a consulting business, and I tell them emphatically "no".  We
   do research and development.  Sometimes, however, that R&D takes the form of "consulting for another company".   I do
   have expertise and skills that are in demand in the tech industry, and consulting is a well-tested and effective way
   to leverage that expertise for income.
2. Grant funding: I mentioned in the beginning of this post that I applied for two research grants over the break.
   Grant-based funding is a riskier bet than consulting work: writing a grant takes a ton of effort, it takes anywhere
   from 3 months to a year or more to actually hear back, and the acceptance rates are low.  But, it has a higher reward
   than consulting: there is a _lot_ of money out there for grants if you have the time and patience to apply for them
   and are willing to get rejected a lot.
3. Sponsorship: this is the biggest wildcard in terms of funding, but _some_ projects are successful because they have
   big-budget sponsors from the community.  Sponsorship basically boils down to the "I like what you're doing so I'm going
   to give you money and expect nothing in return" business model, which again, is very foreign to a lot of folks.  I've
   asked a lot of people to sponsor my work and the standard question I get back is "What's in it for me?"  But I'm
   going to continue asking, because I want people to start thinking about uncertain, risky, future societal returns as
   a worthwhile investment, even if it doesn't benefit them personally.

In terms of our current business model: I envision that most of my short-term funding will be through consulting work
while I wait for grant funding to come through.  That grant funding "may" happen this year if I get lucky, or it might
take 3-5 years if I get really unlucky.  So I want to have a solid base of clients that I can help until such time as
one of my grant applications is accepted.

In the long term, my vision is that ACRL is funded predominately by grants and sponsorship.  The other day, I told
someone I wanted to be 80% funded by grants and 20% funded by consulting business as my "steady state" and they said
that if I flipped those numbers I'd probably have something more realistic.  But as my PhD advisor told me, research is
a bit like a flywheel: it takes a long time to get a research program funded and going, but once it _is_ going it's
(somewhat) easy to maintain that momentum.

And, to close the loop, you'll notice that conspicuously absent from the above list is "this blog".  I've said before
that I greatly very much appreciate my paid subscribers to this publication, but I don't envision a world where I am
primarily supported for my writing.  For one, that sort of funding is extremely volatile[^4], and for another, while
writing and communication is _important_ and I like doing it, I want to be writing about _what I'm actually doing_,
which is the research.  This platform is a way for me to build my network and increase the visibility of my work, it is
not the work itself.

## ACRL's monetary goals

Now that you have an understanding of my business model, such as it is, let's talk about "what success looks like".  The
conventional figure I've heard in the industry is that a software engineer costs about $250,000 per year, once you
factor in salary and benefits.  And even that number is low if you look at high-paying companies like Google or
Facebook, particularly if you get lots of stock benefits as a part of employment.  But we don't have stock at ACRL[^5],
and I'm not interested in becoming a billionaire, so let's stick with that $250k number for now.

I do want to grow the company this year---if we could double in size that would be amazing!  And I'd like to have about
2 years of runway in the bank, so that means that I somehow need to come up with about $1,000,000.  The early-stage
grants that I'm looking at pay somewhere between $100-300k, and I think I can realistically come up with another $150k
or so in consulting, so _assuming_ that all of those opportunities come through, that gets me halfway to my goal!
However, if one of my current grant opportunities comes through, there will likely be follow-on opportunities for higher
dollar amounts, so the rough plan of attack is: get enough funding to make it through this year, do a bang-up job on my
grant proposals, and then (hopefully) set myself up for another 2 years of work starting in 2025.

Whew!  When you put it that way it sounds simultaneously terrifying and totally doable.

## Dude, why are you sharing all of this?

I confess it feels a little weird to be talking about how I want to make money, and even weirder to put specific dollar
amounts out there.  Does it somehow hurt my chances at success to share this information?  I don't _think_ so, but I've
never done this before, and most other companies tend to be fairly tight-lipped about their balance sheets.  But ACRL
isn't most other companies.  One of my goals with the business is to be truly "open-source", not just in the technology
but also in the business operations.  People don't really talk about salaries or "what an engineer costs" or any of
that, except when they're bragging about the umpty bajillion dollars they raised in series W funding or whatever.  Well,
I'm not here to brag, I'm just trying to provide an honest outlook on my goals and chances of success, in the hopes
that---if I'm successful, maybe this can be useful information for someone to follow along in my footsteps, and if I
fail, maybe someone else can learn from it and do better.  Either way, it's gonna be a wild ride, and I'm here for it.

So that's all I got for now!  Hope you all are as excited for the upcoming year as I am!

Thanks for reading,

~drmorr

P.S. Thanks to my two reviewers who took a look at this post before I published it to make sure I wasn't saying anything
completely asinine or offensive ❤️

[^1]: Substack prefers to call publications "newsletters" instead of "blogs", I guess because the term "blog" has fallen
    out of style, and maybe because they think people would rather read an email than a webpage?  But anyways I think
    that's dumb and still call this publication a blog.
[^2]: Honestly, the Substack platform is kinda terrible.  For a platform that's all about the writing, the writing
    interface is junk.  It doesn't support Markdown, it doesn't have basic formatting options that I want, code syntax
    highlighting is non-existent, it doesn't let me put footnotes inside of footnotes, etc.  Your styling options are
    also limited; I've done the best I can to match the style between this blog and the [ACRL website](https://appliedcomputing.io)
    but it's not a perfect match and I have no access to the CSS, so I can't _make_ it a perfect match.  Substack also
    takes a large (10%) cut of any paid subscriptions, which is significantly more than something like Patreon.  When I
    first set up this blog, I considered using Patreon instead but decided to go with Substack for discoverability.  But
    for these and other reasons, I've never intended to stick around Substack for the long term.
[^3]: Fun fact, the way I currently publish this blog is that I write everything in Markdown, publish it on my website,
    and then copy-paste the formatting into the Substack editor.  You can actually see [all the Markdown files](https://github.com/acrlabs/www/tree/master/root/posts)
    on GitHub, if you're curious.
[^4]: You can imagine that if I depended on my writing for my salary, the decision about "whether to stay on Substack or
    not" becomes _much_ more fraught: any significant shift in platform is almost assuredly going to result in a loss of
    subscribers and income.  I am glad that folks like Molly White and others have been able to shift their platforms
    and remain successful, but I'm sure there are many other folks who don't feel like they can make that change, even
    if they wanted to.
[^5]: Not technically true: there's one share and I own it.  No, you can't have it.
