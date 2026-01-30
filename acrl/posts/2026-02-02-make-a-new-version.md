---
title: "Making new versions is free, actually."
authors:
  - drmorr
datetime: 2026-02-02 11:00:00
template: post.html
---

<figure markdown>
  ![A screenshot of a reddit post saying "This is hot garbage.  It's not too late to delete this."](/img/posts/hotgarbage.png)
  <figcaption>This is the nicest thing anyone has ever said about my blog!</figcaption>
</figure>

Ok, before I start off I need to acknowledge the reddit user who complained that [my post last week](2026-01-26-what-to-expect.md)
 was "hot garbage." Thank you for your kind words!  I have never aspired to produce anything else, but I do want to
point out that everything I write here is 100% hand-crafted, human-written hot garbage.  I put up AI artwork sometimes
but the words are all real human words.  Just in case there was any confusion about that.

Anyways, in this week's episode of hot garbage, I want to talk about software versions, but maybe not in the way you
might be expecting.  There's a well-known class of "Software Blog Post" arguing about versioning schemes: "[SemVer](https://semver.org)
sucks!  Use [CalVer](https://calver.org)!"  "No, CalVer is terrible, just use WTFVer!"  And etc, ad nauseam, vim vs
emacs style.  That's not what this post is about.  Instead I want to talk about the psychological effects of software
versioning[^1][^2].

## Releasing new versions is scary...

There's a running joke/meme in the Rust community that none of the crates or libraries in the Rust ecosystem will ever
reach "version 1", and will be in a weird "alpha" state in perpetuity.  It's kind of funny that many foundational
libraries are on version 0.1884.23, but I think (based on my own observations) that's actually a symptom of a deeper
psychological issue: namely, "releasing a new software version is scary."

I tend to believe that as a general rule, scientists and engineers want to produce _good_ things that are high quality
and that will make people's lives better.  And we've created this weird association between "putting a version tag on
something" with "this thing is _ready to go_".  And I can kinda understand how we got here: back when new software was
released on a physical disk that you had to go into a store and purchase[^3], there was a lot of pressure to make sure
that the bits contained on that physical disk were perfect, because if they weren't it was extremely difficult to fix
them after the fact[^4].  And even now, when we put a new version on something, we're kindof implicitly saying "This set of
bits is ready for consumption, all those new features I was working on are complete and ready for someone to use."

And that's kinda scary!  You're putting yourself out there in a way that feels a bit uncomfortable.  What if it's
broken and busted, or there's some bug or corner case that you didn't think about, or, or, or...?

## ...but it doesn't have to be.

But here's the thing: whatever versioning scheme you're using, the numbers are free.  It's not like we're going to run
out of numbers.  If you find a bug or an issue with version X.Y.Z, you can just fix it and then release version X.Y.Z+1.
We no longer have a software distribution problem like we used to[^5].  It doesn't _have_ to be scary to release a new
version.

I've been thinking about this a with one of the internal tools I'm developing for use with our clients; there's been an
aggressive set of feature development and bugfixes, and this has resulted in an aggressive set of new versions so that
my clients can get access to those new features/fixes.  I've often released several new versions in a single day, which
feels... a little excessive.  But at the same time, like, who cares?  Number goes up.  Install the new version.  Life
goes on.

I also ran into this with [SimKube](https://simkube.dev) yesterday: I released a new patch version of SimKube, version
2.4.3.  It was a small [bugfix](https://github.com/acrlabs/simkube/commit/78127ed39109332971653023ab850b0ccf0b3444) to
ensure that simulated DaemonSets get scheduled on the right subset of nodes.  I wrote some tests, they all passed, I
released the new version, I installed it... and it was broken.  UGH.  I went through this whole narrative in my mind:
"What kind of hack job am I?  I can't even release a new software version correctly.  I know, nobody else is using this,
I can just cover up how incompetent I am, I'll just yank the version, force-push a new change that fixes the bug, and
re-release 2.4.3.  Nobody will know!"

But then I paused.  Actually, really, who cares?  Nobody is staring at my release notes going "Wwwwoowowowoww drmorr
really screwed that one up!"  Nobody cares.  I [fixed](https://github.com/acrlabs/simkube/commit/bc202fb5b77f06d623f5a11f0dd0ae5108dab6a2)
 the bug, I fixed the test that should have caught the bug but didn't because I wrote it wrong, and I released SimKube
2.4.4 an hour later.  Problem solved, life moves on.

Anyways, the whole point of this post is that we should normalize this: version numbers are free, and we're not going to
run out.  Don't feel bad if your last version has a bug.  All software has bugs.  Fix the bug, make a new version, and
move on with your life.

## Long list of caveats

Because I _just know_ that someone is lurking in the background trying to decide whether to sign up for a paid
subscription so that they can call this post hot garbage in the comments, I do want to acknowledge that, while version
numbers are free, sometimes "releasing things" _isn't_.  There are a whole bunch of settings where it's still somewhat
challenging to get your new version into the hands of your users: mobile development (or really anything that has an
"app store" or "marketplace") typically has a long lead time for releasing new things, because it has to go through some
kind of third-party audit, whether that's just "automated tests" or "human review".  And even after you've released
something, many people can't or won't upgrade to the new version, so you're kindof stuck maintaining the old thing for a
long time anyways.  See also: air-gapped systems, embedded firmware, stuff that is literally going to the moon, etc.

The point of this post is not to say we should just throw shitty code out there willy-nilly because you can fix it
later[^6].  The point is to say, "do the best work you can, and when you think it's ready, don't have so much anxiety
about releasing it."  I'd way rather have people using my slightly-buggy code, and have to release a new version to make
it slightly less buggy, than to have nobody ever use it because I'm too scared to make the new version.

So anyways, to sum up: version numbers are free, we should do more of them.  As always, thanks for reading, and tune in
next week for more hot garbage from ACRL, Inc!

~drmorr

[^1]: Psychology is another subject I am 100% equipped and trained to produce endless hot garbage about.

[^2]: P.S. The Wikipedia entry on [software versioning](https://en.wikipedia.org/wiki/Software_versioning) is a
    fascinating read if you care about this stuff.

[^3]: We definitely never acquired software any other way back then, nosiree.

[^4]: It’s a little-known fact that back in the 90s, most tech support people were given a pair of tweezers and a tiny
    magnifying glass so that they could pick up the physical bits on a floppy disk and move them into the correct place.
    This was obviously a time-consuming and expensive process, so some engineers would instead try to speed up the
    process by smashing the bits into place with a tiny hammer.  This is where the term "[bit-banging](https://en.wikipedia.org/wiki/Bit_banging)"
    comes from.

[^5]: Long list of caveats applies, see the section titled "Long list of Caveats"

[^6]: This sentence is about AI.
