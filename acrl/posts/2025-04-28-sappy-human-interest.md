---
title: "The Sappy Human Interest Edition"
authors:
  - drmorr
datetime: 2025-04-28 11:00:00
template: post.html
---

> Here we are all in one place <br>
> The wants and wounds of the human race <br>
> Despair and hope sit face to face <br>
> When you come in from the cold <br>
> &emsp;&emsp;~ _Betty's Diner_, Carrie Newcomer

Like I mentioned in my [previous post](2025-04-22-how-to-log-in-to-ecr.md), we were traveling for spring break last
week; we did a tour through the Utah national parks[^1].  It was a really great trip, and the scenery was just stunning,
but in this post I want to talk about _humans_.  I spend a lot of time on this blog talking about technical stuff, and
it might be easy for a random passerby to assume that's all I talk about, so I want to take a step back and remember why
I'm doing all of this stuff.  Also, there's a lot of _really bad shit_ happening in the world right now, but instead of
adding more fuel to that fire, I want to take a more hopeful view.  If you're not into that, and you're just here for
the rants and endless blathering about Kubernetes, feel free to skip this one :P

## The License Plate Game

Ok so back to spring break: we did a lot of driving on the trip, and to help pass the time, we played the license plate
game---how many different US state license plates could we find?  It was a lot of fun, and I learned a bunch of license
plate trivia along the way[^2]; we ended up finding 47 out of 50 states (missing Delaware, West Virginia, and Hawaii),
along with 5 Canadian provinces, multiple vehicles from Germany, and---winning the prize for "furthest distance
away"---one plate from Uruguay!

Aside from just being a fun way to pass the time, the license plate got me thinking: here were all of these _humans_
gathered from literally all over the world, from all kinds of backgrounds and life experiences and wants and hopes and
dreams and desires, all gathered in this one tiny corner of the universe to look at some amazing natural wonders.  It
reminded me of the song "Betty's Diner" by Carrie Newcomer, which I included a snippet of at the top of this post as
well.  All these people on planet earth, just trying to survive, live life, experience love, recover from pain and
brokenness.  All the _stuff_ that we do, however mundane or boring or pointless it might _sound_, is in pursuit of
_being human_.  Sometimes that ends up leading to really bad things happening, but sometimes it leads to beautiful
things, like getting to share space with someone from South America while staring at really stunning rocks.

## Ok but isn't this a Kubernetes blog?

If I haven't made you mash the "back button" in panic to get the sappy off yet, you might be wondering how any of this
relates to my normal blog topics.  But see, the thing is, all of the technical stuff I do is in service of _humans_.
It's sometimes easy to forget that when you're deep in the IAM mines, but the reason I build all the things I build is
to help someone else _be human_.

This was true even when I was working at Yelp and Airbnb.  There's a lot of valid criticisms you can potentially levy
against these companies, but at the end of the day, Yelp and Airbnb help people find places to eat and sleep together.
How much more human can you get than that?  Yes, they are deeply embedded in capitalist structures that distorted what
it means to "be human" in all kinds of problematic ways, but we still have to find ways to be human even in the midst of
structures that seem like they're actively working against us.

And the thing is, there are really interesting and fun technical challenges involved in helping people be human!
Drive-by commenters on Reddit like to say that "Oh, Yelp is just a list of restaurants, I could code that in a weekend,
also how dumb is that."  But it's not dumb!  Yelp literally helps people find community over food, and it's actually
pretty hard to do that[^3].

But even aside from the public "business product" of companies like Yelp and Airbnb, I think it's important to remember
that "it's humans all the way down".  That's where Kubernetes comes in.  The humans working on Kubernetes are helping
the humans building these products help the humans using the products do something with other humans in the world.
And then you have the humans working on the Linux kernel, which Kubernetes runs on top of, and the humans building
the hardware that Linux runs on, and the humans studying the physics needed to build the hardware, and the humans
_actually producing the literal food_ that all of those other humans need in order to survive and do the human
things that they are trying to do.  It is _literally_ humans all the way down.

And that's why I build SimKube.

## Ugh, really?  You couldn't go one single $^%&ing post without mentioning SimKube?

Ok that was a little big of a joke, but also it's kinda true.  There are a _lot of problems_ we are trying to solve to
be human, and one person can't solve all of them.  The only way we can get anything done is if we all come together and
chip away at different corners of the "being human" problem _together_.  The corner that I've chosen to chip away at
(and that I _like_ chipping away at) is "making it easier, cheaper, etc to run the infrastructure that hundreds of
millions of other humans rely on to do their human things".

Again, maybe that seems trite, or like I'm just shilling my own product, or trying to get new customers or clients, or
whatever, but I'm really not.  I want ACRL to be a place that puts the humans first, and there are a lot of humans on
infra teams all over the world, and 95% of those humans on infra teams are stressed the heck out because the
infrastructure that they're running to help other humans be human is broke AF.  I really actually do believe that the
work that I do at ACRL has the potential to make _all of those human lives_ better.

Maybe you disagree.  Maybe you think I'm being disingenuous, or maybe you think there is a better way that I could (or
should) be using my skills and training to help humans be human.  That's ok!  The world is simultaneously a big and
small place, but there's room for all of us.  The older I get, the more convinced I am that we're _all_[^4] trying to do
the best we can with what we have.  It sure as heck ain't _easy_ to remember that in the day-to-day, especially when
we're bombarded with really horrible news seemingly 24/7, but this post is my attempt to say "keep trying".

As an aside, this is one of the things I loved about the [Picture Me Coding](https://www.picturemecoding.com/2222783/episodes/16759135-simulating-distributed-systems-with-david-morrison)
podcast I was on a month or so ago: we spent a bunch of time talking about Taylor Swift at the beginning, and you can
say whatever you like about her music, but Taylor Swift is a person who _really understand_ what it means to be human at
a fundamental level, and she communicates that in her songs to millions and millions of people.  And I loved getting to
talk about that with the hosts of the podcast (also a couple of humans) before spending a bunch of time talking about
tech[^5].

Anyways, that's all I've got for this post.  I hope I was able to bring a bit of hope and light to you today, or if
nothing else, I hope that you are now [semantically satiated](https://en.wikipedia.org/wiki/Semantic_satiation) on the
word "human", because I know I am.

As always, thanks for reading.  ❤️❤️❤️

~drmorr

[^1]: We hit up Zion, Bryce, Capitol Reef, Canyonlands, and Arches, along with a bunch of state parks along the way.

[^2]: For example, if you see a license plate that you can't immediately recognize, just guess that it's Montana, and
    you'll have a >50% chance of being correct.  Montana has so many different license plate variations I almost think
    they just let you bring your own license plate design into the DMV and they'll print it for you.

[^3]: Yelp did not pay me to write this post.

[^4]: Even the people we violently disagree with or despise.

[^5]: I'm actually going to be on another podcast called [Kubernetes for Humans](https://www.youtube.com/watch?v=w-qzeOFytJo&list=PLKOn7Ks4S01kY5mFBpyB_2yG8k5yVLw-K)
    soon (the episode's been recorded, but it hasn't been posted).  Anyways one of the comments I made on the show is
    that I love the title of the podcast, because it puts the _humans_ at the forefront of the tech we're building.
