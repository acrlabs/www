---
title: "A new year, (two) new websites!"
authors:
  - drmorr
datetime: 2025-02-10 11:00:00
template: post.html
---

Well it's February, dunno how that happened.  My goodness, it's been a whirlwind of a year so far.  There's been a ton
of different things going on[^1], and I've been crazy busy, but I wanted to share a little bit about one[^2] of the
projects that I've been working on: the new-and-improved Applied Computing Research Labs web properties!

If you wanna skip all the bloviating and just see the results, you can go to the new [Applied Computing Research
Labs](https://appliedcomputing.io) website, along with the brand-new [SimKube](https://simkube.dev) website!  Otherwise,
read on.

## A new design

When I very first started ACRL, I threw together a website for the company in a couple of days.  I had a few operating
principles that I was going off of: I wanted something crisp, clean, simple, and with minimal-to-no JavaScript[^3].
However, over the last year and a half, that relatively simple website became less suitable.  First I needed a place to
stuff my SimKube docs, so I hacked together some pages for that.  Then I needed to be able to advertise about my
services, so I hacked together a page for that, etc.  On top of that, there were a lot of visual design elements that
even I, a non-graphics-designer-person, could tell didn't work well together, and made the site way less inviting for
visitors.

So last year, when I got Mariana to help design [Mr. Squidler](2024-10-28-meet-mr-squidler.md), I also chatted with her
about a possible website redesign, which she was super excited about!  After KubeCon, we started work, and around the
beginning of the year, she sent over the final Figma files for the design.  Which, I then had to turn into, you know, a
working website.

## The ACRL web stack

When I built the original ACRL website, I really wanted to use a static site generator which would let me turn markdown
files into a themed, functioning site.  There are a number of these out there; one of the more popular ones these days
is [Hugo](https://gohugo.io), which I know a number of techies love and have gotten great results out of.  So I started
here, but (at the time) I just couldn't make head or tails of their theming docs, and kinda gave up.  There's also
[Jekyll](https://jekyllrb.com), but ew, Ruby.  So I finally settled on [mkdocs](https://www.mkdocs.org), which is
_probably_ kindof an odd choice.  MkDocs is really targeted at creating documentation websites, not necessarily
"capitalism company web properties", but there were a few things that appealed to me about it:

1. Written in Python -- I'm pretty familiar with Python as a language at this point, and I like the language pretty
   well, so this was a good starting point.
2. Uses [Jinja](https://jinja.palletsprojects.com/en/stable/) templating -- I really like Jinja as a templating library;
   it's got a lot of nice features built-in, and it's very extensible[^4].
3. Lots of good [markdown extensions](https://python-markdown.github.io/extensions/) for customizing your website, and
   (again, because Python) super easy to write your own.

So anyways, that's what I ended up on back in the day, and I've been really happy with it ever since.  The rest of the
stack is dumb and simple: whenever I push a change to Github, it builds the site and rsync's it to my personal
webserver.  Easy peasy.

The webserver itself is using [docker compose](https://docs.docker.com/compose/) to run all of my different websites[^5]
in a semi-isolated environment, along with an [nginx](https://nginx.org/en/) reverse proxy to do TLS termination and
route traffic appropriately[^6].  This configuration took a little bit of reading through to get set up correctly, but
it all pretty much Just Works these days, so no real motivation to mess with it.

## I'm a real frontend engineer!

(Editor's note: the author is, in fact, not a real frontend engineer)

So at the beginning of this year, I started trying to translate the Figma designs from Mariana into CSS and HTML.  I
didn't expect this to be _easy_, necessarily, but I also didn't really expect it to be _hard_[^7].  I mean, all the
pixel values and colors and everything are right there in Figma, I just have to translate them over, right?

Yeah, I'm sure the real frontend engineers are laughing right now.  I will say, though---I _do_ find something
incredibly satisfying about writing well-organized CSS.  It takes a long time to get it right, but once you get it
right, it's very cool to just be able to drop a couple of classes on a new HTML object and have it automagically pick up
all the right styling.  Lots of fun.

Anyways, back when I designed the original ACRL site, I spent a while reading through [MDN](https://developer.mozilla.org/en-US/)
to learn about modern web development techniques, so I wasn't coming in _completely_ clueless, just.... mostly clueless.
I will also say---having designed several websites 10-15 years ago, modern CSS and HTML is a totally different (and, in
general, significantly better) ballgame.  I heart `display: flex` and CSS variables.

I did have one thing that made this project possibly a bit more challenging than it needed to be: now, instead of just
having _one_ website, I have _two_, and they have similar, but not completely identical theming.  So a big chunk of my
work was trying to figure out how to organize and separate out the things that were common to both sites, versus the
things that just needed to be present in one or the other[^8].

The other thing that made this project take somewhat more time than I expected is that I needed to write a lot of extra
content.  Now that I've been doing this for a while, I have a lot of projects, research, and potential service offerings
that I want to be able to show off, and I needed to actually write the content for all of that stuff.  I also needed
things like screenshots and demo videos; some of this content I was able to crib from other sources[^9], some of it
was brand new, and some of it was stuff that I've been thinking about doing for a while and just never got around to[^10].

Anyways, I'm sure that none of this is new information to anyone who's ever built a website before, but this is the
first time I've built _these particular_ websites, so wanted to share a bit about the process.

## It's done, if you don't like it, too bad

So after a solid ~6 weeks of web design work, I now have two functional websites.  There's probably some
typos, there's almost surely things that could be better about them, but I hit the "IDGAF, this needs to be shipped
yesterday" point about 3 weeks ago, so you know what?  It's done.  I've got other things I need to be working on, so I'm
moving on.  I _am_ pretty happy with the results though.

Here's some fun statistics for you, in case you're curious:

* 1076 lines of (unminified) CSS, because I couldn't figure out how to get the minification plugin to work.
* 75 lines of JavaScript.  Most of these lines are to make popup menus and things work on mobile, as well as to support
  dark and light modes[^11][^12].
* 43 lines of PHP.  This is how I get the contact form to actually, you know, send email.  Kinda wish I didn't have to
  have this, but here we are.
* 123 lines of Python.  I have a handful of small plugins that I use to help format things.
* 7440 lines of Markdown, which turns into 1127 lines of HTML (note, this includes most, but not all of my blog backlog
  as well, which you can always [read there](https://appliedcomputing.io/posts/) instead of on Substack if you prefer).

Also, you can take a look at the [website repo](https://github.com/acrlabs/www) itself if you're curious about any of
the code or build processes[^13].  But I'm done pretending to be a frontend engineer for now.  Thanks again to Mariana
for all her help on this!  Couldn't have done it without you.

Next week, I have a bunch of financial/tax stuff that I have to do, and then I'm hoping to get back to more SimKube
development!  I do have a bunch of cool content planned here, so subscribe if you want!

As always, thanks for reading.

~drmorr

[^1]: Note, I'm not even talking about national politics, FYI.

[^2]: Well, two, sorta?  One and a half.

[^3]: Ostensibly for performance reasons but mostly because I hate JavaScript.  Not actually the language, mind you, I
    think it's a perfectly fine language, I just have less than 0 idea what I'm doing in it, and the internet is filled
    with 30 years of out-of-date suggestions about how to do JavaScript correctly.  Also most of the suggestions are
    "just use React!!!!1!1!!!1", and, like, NO THANK YOU.

[^4]: I'm trying _really_ hard to be charitable and fair in this post and not throw shade on anybody else's favorite
    language or tool, but my goodness, Golang templating sucks and this was another reason I desperately wanted to not
    use Hugo.

[^5]: appliedcomputing.io, simkube.dev, and my personal websites

[^6]: No, I am _not_ using Kubernetes to run my webserver.  Though, I have briefly contemplated it.

[^7]: It's just one website, Michael, how long could it take?  Ten days?

[^8]: As an example, I read on the internet that you don't want to have your browser make lots of connection requests
    whenever possible, so in what I'm sure is the dumbest premature optimization ever because I'm not minifying
    anything, I concatenate a base stylesheet together with a website-specific stylesheet in my `mkdocs build` step.
    I'm sure this decision will be just fine and will definitely not come to haunt me in six months.

[^9]: But even the content that I could re-use I often had to crop, edit, or regenerate to fit in the space.

[^10]: For example, the SimKube [FAQ](https://next.simkube.dev/faq/) now actually has questions on it!  And some of them
    are even frequently asked!

[^11]: I was pleasantly surprised at how easy this was to implement!

[^12]: I do have to load jQuery on my [contact page](/contact.md), because that's how I got the original form to work
    and I didn't want to mess it up.  There's also some other JavaScript libraries that get loaded, e.g., to support
    YouTube embeds or the search functionality on the SimKube docs page.  But _by and large_, JavaScript is not required
    to view the site, which I'm happy about.

[^13]: The website repo used to be public, and then I made it private for some reason that I can't quite remember---I
    think maybe because I wanted to keep my posts private until they were officially published?---but anyways I just
    made it public again.  I guess if somebody is really _that desperate_ to read my unfinished blog posts ahead of time
    I won't stop you.
