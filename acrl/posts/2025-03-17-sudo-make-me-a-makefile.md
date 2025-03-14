---
title: "Sudo make me a makefile"
authors:
  - drmorr
datetime: 2025-03-17 11:00:00
template: post.html
---

OK, it's been a year and a half of writing on this blog, and I've successfully avoided posting anything about the latest
zeitgeist in tech, namely AYYYYYYY EYYYYYYE.  I think I'm finally at a point where I'm ready to change that.  I fully
recognize that this conversation is, uh, controversial in certain circles, and I've kinda stayed on the fringes of
the technology, so I want to acknowledge before we dive in that a) this is a hard topic which I am not an expert in[^1],
b) I think reasonable people can have differing opinions about the use of the technology, and c) if you'd like to leave
an angry comment on my blog, you have to be a paid subscriber first :P

Also, this is more than twice as long as one of my normal posts, just so you're aware up-front.  I felt like I couldn't
write a post about AI without discussing all of the complex cultural issues around it, and there are a lot of those.
But I didn't really want to split this into two posts, because the first post would just be seen as another rant about
how "AI is bad, actually", when I think there's more nuance there than that.  And, the interesting bit that I really
wanted to share is actually the experiment that I did, and I didn't want to wait a week before posting that.  So
anyways, if you don't care about how AI is bad, actually, you can just skip to the experiment in the second section.
Otherwise, read on!

## Caveats Emptor

Before we even talk about the experiment that I ran or any of the results, I think it's important to acknowledge a whole
laundry list of caveats.  Firstly: AI[^2] as it's understood today---that is, "large language models like ChatGPT"---do
not encompass the entire field of AI.  There are lots of other really interesting and active research areas in AI that
have nothing to do with LLMs.  In this blog post, however, I'm not talking about other areas of AI---I'm really
interested in trying to cut through the LLM hype.  Secondly: I do not believe we are anywhere even remotely close to
anything resembling "artificial general intelligence" (or AGI); we don't even have a good definition of what that term
means[^3], and anyone who tries to tell you otherwise is probably a scam artist.  Thirdly: I have an _EXTREMELY STRONG_
knee-jerk reaction to "hype" in general, and in particular to this hype wave.  So I am attempting to keep this blog post
_mostly_ judgement-free, but my take on AI/LLMs up till this point has mostly been "Wow, people sure are spewing a lot
of bullshit."

I also want to point out the legal, ethical, and moral issues surrounding this topic, and point out that _none_ of them
are cut-and-dry.  This is a complex, multi-faceted, rapidly-changing topic and reasonable people can disagree on the
particulars of any or all of these things, but I think any conversation that doesn't at least acknowledge these topics
is disingenuous.  So, in the same way that I'm not an AI researcher, I'm also not a lawyer or a philosopher, but I want
to attempt to distill some of the very valid concerns that are raised in these areas:

1. The "fair use" question: it is still an unanswered question whether the training of these LLMs (particularly on
   copyrighted material) is legal.  The body of copyright law is complicated and deliberately vague: many questions of
   copyright come down to "it depends" and "we'll see what the courts say"[^4].  The main legal question around LLMs is
   whether the training process is "fair use" or not; there are secondary legal questions around "what happens if you
   use an LLM to reproduce somebody else's copyrighted work".  Neither of these are clear-cut, but OpenAI's stance is
   ["what we did is fair use"](https://arstechnica.com/google/2025/03/google-agrees-with-openai-that-copyright-has-no-place-in-ai-development/)
   and ["LLMs don't work if we can't use copyrighted data"](https://arstechnica.com/information-technology/2024/01/openai-says-its-impossible-to-create-useful-ai-models-without-copyrighted-material/).

   A lot of the online discourse takes the reductionist tone of "Apparently it's legal to steal other people's
   copyrighted work as long as you have enough money," or "OpenAI thinks it's better to ask for forgiveness than to ask
   for permission," and I think this misses the point.  Our[^5] system of copyright incentivizes the "do questionable
   things and then claim it's fair use in court" style of behaviour.  OpenAI isn't the first company to do this, and
   they won't be the last; they're just the first company to do this at such an enormous scale.

   And, for whatever it's worth, I actually think it's fairly likely that the courts will decide that training AI on
   copyrighted material is fair use.  It's still going to take several years to reach that conclusion (probably), but I
   bet that's where we end up[^6].
2. But OK, what's "legal" is not the same thing as what's "ethical", and even if the courts decide that AI training can
   be considered fair use, you could make a totally reasonable argument that this training is using people's generated
   content without permission, and that's not OK.  My thinking in this area hasn't solidified completely, but I suspect
   it's nuanced.  Before AI image generation was a thing, lots of blogs just shamelessly used someone else's art as a
   header image or whatever.  Sometimes they'd include a "I don't own the copyright to this image but I'm using it
   anyways because I want to, please don't sue me" blurb, which is especially hilarious to me.  Now we have a lot of
   blogs (including mine, sometimes) that use AI-generated images as header images[^7].  I don't know about anybody
   else, but I'm not hiring a graphics designer to create dumb images for my blog, and sometimes I think the images that
   I create are really funny.  I understand if other people don't, but they'll probably keep showing up, at least on
   some posts.

   On the other hand, I didn't just use AI to generate me a [SimKube logo or mascot](./2024-10-28-meet-mr-squidler.md);
   I actually hired a graphics designer for that, because it's important and visible part of my brand and I felt like
   it's important to support and pay for work that is foundational to your product or business.  There's definitely a
   line here somewhere, and even in writing this post I feel like I'm being inconsistent about where the line is for me
   personally, so it's no surprise that lots of other people land in lots of different spots both for and against the
   use of this technology.
3. There's also (I think) a very real moral question about how AI is impacting our society and our planet.  I _despise_
   the current state of the internet, which is 98% AI-generated slop at this point.  We have gone from a society in the
   2010s where it was possible to find information about... basically anything you wanted to know, to a society where
   finding information about even basic subjects is impossible, and completely poisoned by AI slop.  Search engines
   these days are terrible: I switched from Google to DuckDuckGo years ago, but would still occasionally fall back to
   Google when DDG couldn't find something I wanted, but now even DDG's results are bad, and Google is unusable.  I
   think this is a _huge_ step backwards from the society that I want to live in, where anybody can learn about anything
   they want to know.

   There's also the climate change question: training AIs requires _A LOT_ of computing hardware, which requires _A LOT_
   of energy, and keeping them cool requires _A LOT_ of water, and all of these things require massive datacenters, and
   all of this is coming at a point where "we're probably not gonna meet any of our climate goals but at least we could
   make a choice to not make things worse".  So independent of anything else, is it worth destroying our planet for this
   kinda-cool bit of technology?  I think for me the question comes down to "how bad" and "how long" -- I have seen a
   lot of competing information about what the energy requirements for AI _actually_ are (particularly in comparison to
   any of the other massive datacenters we've been running for decades), as well as a lot of research on making training
   much more cost- and energy-efficient.  I think it's conceivable that the technology progresses to a point that in
   5-10 years, we can do training and inference much much more efficiently than we can now, so maybe it's OK?  I dunno.

However, even with all of those caveats and concerns, there's still a part of me that's like... is there something here?
The technology itself is _incredibly_ cool, and I've always insisted that I was not going to be one of those people that
became incapable of doing basic things with computers as I get older, and that "staying up-to-date on latest technology
and trends" is important to me.  So, I really wanted to spend some time digging in and understanding what LLMs are
currently capable of doing, which led me to this experiment.

## Who makes the Makefiles?

I've tried using some of the various "free" LLM tools in the past and have been fairly unimpressed.  I posted this [on
Mastodon](https://hachyderm.io/@drmorr/113992926028683291) the other day:

> Things I want an AI assistant to be able to do:
>
> 1. This compute node came up with broken networking configuration so now it can't connect to the internet at all, just
> fucking fix it.
> 2. Please turn this Figma design into a working website with minimal JavaScript in less than 6 weeks
> so that I don't have to.
> 3. Figure out my payroll so that I get paid in a timely fashion and make sure I'm complying with all local and federal
> laws.
>
> Things AI assistants can actually do:
>
> 1. Here's some code, it might work but you're gonna have to spend hours debugging it before you're sure
> 2. Hey look I can make funny pictures in a not-very-believable artistic style
> 3. Hahahahahah I'm destroying the climate so that billionaires can fire you and make more money.

This post is a bit tongue-in-cheek, but is also fairly representative of my experience thus far.  I _want_ AI to do the
boring hard stuff that I can't figure out, so that I can spend my time doing the fun interesting work.  Unfortunately,
the boring hard stuff seems to generally require a lot of understanding of "external context", which is something that
LLMs still aren't good at.  As such, I've had very limited success getting any of the existing free agents[^8] from
doing anything useful for me, code-generation-wise[^9].  It _has_ been helpful for small things, mostly shell scripting,
but I haven't gotten much actually-useful code out of them.

But last week, I was doing a bunch of work on SimKube, which meant that I was doing some work on one of SimKube's
dependencies, which I tried to release a new version of, and couldn't remember how, so then I started looking into all
of my Makefiles and other build-related scripts to try to make them better/easier to use, and spent 4 or 5 hours trying
improve them to refactor them and make them better, and then realized that this probably wasn't the best use of my time.
So I started wondering if I could get an LLM to do better (or at least as good) as I could, and if I could do it in less
time.  So I spent even _more_ time not doing the things I need to be doing running an experiment with LLMs instead.

The design of the experiment was this: I wanted to see if the "best" LLMs available today could take my existing build
scripts, which have a bunch of rough edges, and make them more composable, extensible, and re-usable while meeting a set
of particular requirements that I've run into.  There are some legitimately challenging build issues that I've run into
(particularly with SimKube), and I wanted to see if the LLMs understood and were able to reason about these issues.

First, some context: the way my build system is set up is through a [build-scripts](https://github.com/acrlabs/build-scripts)
repo that gets imported as a Git submodule into my various projects.  In here, there are a bunch of Makefiles that can
be extended or overridden to satisfy project-specific requirements[^10].  I have projects in Rust, Golang, and Python;
SimKube could at least arguably be called a monorepo[^11], so I need to be able to handle that; I need to be able to
build things cross-platform; I need to (sometimes) build Docker images, and I need to (sometimes) build Kubernetes
manifests.  And I'd like to expose a standard interface for all of these things so that I don't have to remember "in
_this_ project you build things _this_ way and in _that_ project you build things _that_ way."

To this end, I wrote a little [mini-design-doc](https://github.com/acrlabs/llm-build-scripts/blob/master/prompt)[^12]
that captured (most of) my requirements.  In here I outlined 15 different things I needed my build scripts to do, and I
used that design doc as my prompt to the LLM.  I also uploaded [four files](https://github.com/acrlabs/llm-build-scripts/tree/master/inputs)
that more-or-less encapsulate my existing system, which I was hoping the LLM could adapt into whatever new system it
built.

I did this all as a one-shot exercise.  The output that the LLM gave is the output that the LLM gave; I didn't spend any
time trying to correct its hallucinations, or do better prompting, or any of that.  I totally recognize that this isn't
the best way to get good results out of LLMs, but a) I wanted to time-box the experiment to a degree, and b) if I'm
going to be spending a bunch of time telling an LLM "No, you did it wrong, fix it," I'd honestly rather just do it
myself.  It's like I'm working with a junior developer, except that I'm not actually helping another human being grow
their skills, I'm just yelling at a computer to do better, and frankly, I don't need any more of that in my life.  Going
back to my snarky Mastodon post above, I really just want an AI to fix the hard, boring stuff so I don't have to think
about it.

So anyways, what are the results?  I evaluated each of six different LLMs on how well they met these 15 requirements, as
well as five additional requirements that I didn't tell the LLM about ahead of time[^13].  For each of the twenty
requirements, I gave a final score so I could compare[^14], and then I summed up all the scores for each LLM.  And
here's what we got:

- `llama-3.1-405b`: 7.5/20
- `chatgpt-o3-mini-reasoning`: 9.3/20
- `chatgpt-4.5-preview`: 9.45/20
- `chatgpt-o1`: 10.2/20
- `deepseek-r1`: 12.9/20
- `claude-3.7-sonnet-reasoning`: 15.6/20

If you want to see details on how I scored the models, you can look at the `analysis.md` file for each LLM [in the
repo](https://github.com/acrlabs/llm-build-scripts/tree/master).  For the remainder of this post, I'm going to discuss
higher-level trends and observations:

1. There's a _huge_ difference between the "free" models and the "paid" models.  LLaMA, ChatGPT-o3-mini, and deepseek-r1
   are all the free models out there.  DeepSeek, of course, being the Chinese model that made waves recently for being
   head-and-shoulders above what any of the American companies have put out, and we can definitely see that in the data;
   it does quite a bit better than LLaMA or o3-mini.  The paid models (chatgpt-o1, chatgpt-4.5, and claude-3.7-sonnet)
   generally outperform the free models.  I guess this really isn't that surprising, but it also kinda sucks; up until
   now I've not spent any money on these products, because the output from their free offerings was so bad: there's
   nothing about the free models that would entice me to spend money on these products.
2. None of the models _actually_ solved the problem that I posed; they all missed various aspects or requirements, and I
   don't think any of them produced a solution that is better than the one I created by hand.  Some of the models
   produced results that were close, and it's _possible_ I could have gotten something that met all the requirements
   with a bit more prompting.  What is unclear to me is whether it would have saved me any time.  I spent 4-5 hours
   solving this problem by hand, and I can easily imagine spending 2-3 hours telling these LLMs "No you did it wrong"
   and _still_ not getting something out that works.  (But maybe not!  Maybe with a couple well-chosen prompts, I would
   have had a working solution in 10 minutes).
3. The areas that the models missed were, as expected, the bits that require external context and experience.  Running a
   Python script cross-platform is trivial, just run the script.  Building a statically-linked Golang binary cross
   platform is a little harder, but doable, and most of the models figured this out.  Building a dynamically-linked Rust
   binary (which SimKube currently is) to run cross-platform is pretty hard.  Similarly, keeping dev build times minimal
   for Rust means understanding all the ridiculously large number of reasons why Cargo might decide to rebuild your
   entire project, and I've spent a _lot_ of time chasing these down and eliminating them.  I don't think any of the
   models got this right.
4. Claude 3.7 Sonnet is widely considered the best-in-class for coding and programming problems, and you can definitely
   see that is true in these results.  It was one of the last models I evaluated, and I was actually impressed at how
   well it was able to do, particularly after seeing the lackluster results from the other models[^15].
5. Claude and DeepSeek were by-and-large the _only_ models that looked at my example files and adapted them, which is
   what I really wanted.  They were able to make discoveries like "Oh, he's using `pre-commit` to manage his linting
   checks, we should just keep doing that", or "Oh, this is how he's currently computing code coverage, let's make sure
   the system is compatible."  All the other models more-or-less just ignored my input files and said "Ok, here's some
   random thing we invented in a vacuum that's incompatible with your system in a dozen different ways."

As I was thinking about these results, I was also comparing my interaction with the LLM to what I would expect
interacting with another developer.  See, if I were to hand my list of requirements to a senior developer, I would
expect them to come back with "A bunch of your requirements don't make sense, can you please explain them to me?" and
then I would have a conversation with them about why I have the requirements that I have, and then they would tell me
that I'm wrong and dumb but that's not their problem, and then they'd go off and implement something that mostly worked
for me.  On the flip side, if I handed this (admittedly really mediocre) design doc to a junior developer, they would
either completely misunderstand and make something totally unusable, or they might come back to me and say "I really
don't understand anything you wrote down, please help?"  In either case, I would have a conversation with them to help
them understand what they were missing.

The interaction with the LLM felt a lot more like the latter case than the former; all of the models came back with
things that were unworkable to a degree.  The difference is that none of them ask any clarifying questions; there's no
conversation to be had with an LLM.  In fact, some of the models confidently listed out all fifteen of my requirements
and wrote words claiming that they'd accomplished them, when in actuality, they were just bullshitting me.  I don't want
to deal with bullshit from a real person, though sometimes I have to!  I definitely don't want to deal with bullshit
from a machine.  It really makes me wonder if the whole LLM process would be improved somehow if the models could come
back and say "I don't understand," or "Your requirements make no damn sense," or "I don't know how to solve this
problem," and then we could have a quote-unquote "real conversation", instead of them just asserting that they've solved
my problem and me telling them "No, do better," over and over and over again.

So anyways---what does this all mean for me?  Was the experiment successful?  Am I going to start using LLMs to help me
code?  You know, I'm not really sure.  It seems like we're definitely not at the point of just shoveling boring work
into an LLM, and if I can't do that, the benefit seems to mostly be "fancy autocomplete."  And, like, that's cool and
all, but I'll let you in on a secret---I don't use _any_ autocomplete, and I never have.  I mostly find it annoying; it
breaks me out of my flow.  I find that when I'm coding, while my fingers are typing out one idea, my mind is working on
solving the next problem[^16], and so making my _fingers_ go faster via autocomplete doesn't help me.  So having
autocomplete, but better?  Meh.  Not super interested.

I expect I'll probably keep using it in the same way that I do right now, which is mostly just "I don't want to remember
how Bash scripts work, please do it for me"---which I've generally found that even the free version of ChatGPT can do a
pretty good job of.  And I'll probably keep trolling y'all by posting dumb AI-generated images at the tops of my blogs;
but isn't that why you're here?

Anyways, sorry for the long post; I hope this was at least passably interesting to you, and if it wasn't, well, next
time I'll be back on the SimKube train.  Thanks for reading!

~drmorr

[^1]: Fun fact, when I was in undergrad I did a bunch of research into the state-of-the-art (at the time) neural
    networks, and actually implemented a ["Long Short-Term Memory" (LSTM)](https://en.wikipedia.org/wiki/Long_short-term_memory)
    neural net for a class project; and LSTM is one of the predecessors of the current set of "deep learning" neural
    networks.  The other fun fact is that when I was in grad school, I considered whether I wanted to do operations
    research or natural language processing and neural networks, and ended up making the wrong choice, at least if you
    judge "right and wrong" by how much money I could make from the current extremely overblown hype wave.

[^2]: Or, if you prefer, we can use the _ever so slightly more technical but still mostly meaningless_ term, "machine
    learning".

[^3]: Although, if you're Microsoft, the definition of AGI is just ["OpenAI made us rich"](https://techcrunch.com/2024/12/26/microsoft-and-openai-have-a-financial-definition-of-agi-report/).

[^4]: One of my favorite types of arguments to read on the Internet is the "armchair lawyers arguing about IP" argument.
    So many people throwing around terms that they clearly don't understand _at all_.

[^5]: And I am only talking about IP law in the United States, which I know a little bit about, not IP law in any other
    country, which I know nothing about.

[^6]: This, by the way, is the main reason I require people to not use AI-generated tools when they contribute to
    SimKube.  Call me paranoid, but I don't want to be on the receiving end of a lawsuit when someone discovers that
    SimKube has code that's been copyrighted by someone else in it.  If the "fair use" question ever gets resolved by
    the courts in a way that I think it's "safe" to accept AI-generated contributions, I will probably change or remove
    this policy.

[^7]: I've definitely gotten some reader feedback that they don't like this on my blog (my favorite bit of feedback thus
    far being [this reddit comment](https://www.reddit.com/r/kubernetes/comments/1iy2b04/comment/mesu4e9/?context=3)).

[^8]: Well, mostly just ChatGPT.

[^9]: And don't even get me started on the "write me an email"/"summarize this thing for me" bots: my general stance
    here is, "If you can't be arsed to write it, I can't be arsed to read it."

[^10]: I'm not interested, in _this_ post, about litigating any of the design decisions that I made to get to this
    point.  There probably are better ways to tackle these problems, but I made the decisions that I made, and now I'd
    like to improve things somewhat.

[^11]: Much to my everlasting shame.  Monorepos suck.

[^12]: Just like in footnote 10, one could argue about the validity or correctness of this requirements list; maybe
    there are better ways of solving the problems that I have, but every entry on this list of requirements does come
    out of a problem that I've had, and have had to spend some non-trivial amount of time working around.

[^13]: Is this unfair?  Maybe.  But as I got the results back I began to realize other things that I was _hoping_ the
    LLMs would be able to do that they weren't able to do.

[^14]: This score was only semi-rigorous; it was partially based on looking at the results, and partially based on gut
    feeling.  I _didn't_ go through and formally verify (by trying to use the generated makefiles) each of the
    requirements, because that would have taken even more time that I really don't have right now.  But hey, I heard
    that all this AI stuff is [just based on vibes these days](https://en.wikipedia.org/wiki/Vibe_coding), anyways.

[^15]: I learned recently that (supposedly) more than 50% of the code at Anthropic (makers of Claude) is written by
    Claude.  At the time I learned this I was horrified; after this experiment, I'm still a little horrified, but, maybe
    slightly less so?

[^16]: It actually feels very similarly to me as [circular breathing](https://en.wikipedia.org/wiki/Circular_breathing)
    for wind instruments.
