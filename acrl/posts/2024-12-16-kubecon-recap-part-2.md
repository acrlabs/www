---
title: "KubeCon Recap, Part 2: On Capitalism"
authors:
  - drmorr
datetime: 2024-12-16 11:00:00
template: post.html
---

I'm a bit behind in my KubeCon recaps; I've been neck-deep in grant writing again[^1].  So I haven't actually even
gotten to watch most of the talks that I wanted to yet---however, there are two that I've seen so far[^2] that I've
really enjoyed; and as the title of this post indicates, I'm going to make the whole thing extra cheery for the holiday
season by tying everything back to capitalism.

## Bring the Joy Back to Deployments!

<iframe width="560" height="315" src="https://www.youtube.com/embed/t3dTw6t9xXk?si=Rzhi8mE5A__cNccJ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

The first video I wanted to share is a talk by my good friend Elizabeth Ponce, a former Airbnb colleague, and one of her
friends, Murriel McCabe from Google[^3].  The content of the talk itself is an entry-level introduction to deploying
your stuff to prod, and what tools are out there to help.  They talk about things like Helm[^4] and Argo and Jenkins, and
just try to provide an overview of the "deployments" landscape.

But that's not why I'm writing about it here.  The thing I loved so much about this talk is the pure joy that Elizabeth
and Murriel have up on stage; they're just so happy to be talking about computers, and they want you to be happy about
computers too!

I think it's so easy to forget this joy, because we all[^5] work in soul-sucking corporate environments and all we see
day in and day out is how computers aren't fun anymore.  But computers are _supposed_ to be fun!  Writing programs is
like magic, and you're all &$^%ing wizards!  You get to make literal impossibilities a reality, and make people happier,
or improve their lives a little bit, or make some art, or whatever it is you want!

But the resounding narrative these days[^6] is that capitalism came along and ruined computers, and while that feels
like a bit of an extreme stance to me, it does seem like there's a grain of truth in there somewhere.  Which actually
takes me to the next talk that I wanted to highlight:

## Reimagining OSS Licensing and Commercialization with Fair Source

<iframe width="560" height="315" src="https://www.youtube.com/embed/rmhYHzJpkuo?si=hLRKP_2ebGUoQocK" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Ok look, wow, I went from "computers are fun" to "software licenses" and I'm imagining you're getting some whiplash
right now, but hang in there for a sec.  This talk, by Adam Jacob from System Initiative[^7], wasn't _teeeechnically_ at
KubeCon proper but at one of the co-located events that happened before hand, which I skipped almost all of because they
sounded boring.  But now I'm sorta wishing I hadn't, lol.

ANYWAYS.  Adam starts off this talk by noting that not only are we all wizards and programming computers is like
magic[^8], but software is the first resource _ever in the history of humanity_ that is infinite.  He compared this to a
loaf of bread.  If I bake some bread and then give away a bunch of slices of bread to other people, then I have no bread
left and I am sad because carbs are the best food group.  But if I make some software, and I give it away, _I still have
all the software_.  Software isn't (or doesn't _have_ to be) zero-sum.

Adam shows how this premise forms the "philosophical" premise of the Free Software movement, and then draws a line from
that through open source and finally "fair source"[^9].  Fair source is, to some extent, re-introducing scarcity into an
infinite resource.

I'll be honest---at this point, I was expected (and Adam even hints at) a full-on ideological screed about how "Fair
source bad, Free software good", but this isn't what we get.  Instead, we get a much more nuanced view, which is that
"we live in a capitalism, and sometimes to survive in a capitalism, you have to do a capitalism".

To tie this all back to my work at ACRL: I think I started off the business with the idea that "if I made good stuff and
gave it away for free, people would give me money for it," and I've now spent the last year and a half grappling with
the naivety of that mindset.  Even in the grant proposals I wrote last year, I talked about how my products would be
open source, and the biggest bit of feedback I got from the grant reviewers was "giving things away is not a business
plan."

I think this has really hit home for me in the last 6 months or so; I'm now in a state where I'm trying to figure out
how to make a viable business model out of ACRL and actually have paying customers, without betraying my goals of
openness, transparency, and trying to chart a different path through the tech industry.  I have some ideas here, some of
which are making their way into my current grant proposal, but I think for right now we'll just have to see how they
play out.

Hope you all are having a great holiday season!  As always, thanks for reading,

~drmorr

[^1]: For some reason, all the grant proposals are due around the holidays.  It's like Santa came along and was like,
    "You know what's even worse than a bag of coal?  A grant proposal due two days after Christmas!".

[^2]: When I was first writing this, I typoed "far" as "fart" and while I _could_ have just silently backspaced over it
    and let it slide, I didn't, because I'm 12 and I felt the need to share with you all.

[^3]: Fun fact, they actually met at KubeCon 2023 and were like "Let's do a talk!" and threw this out into the
    conference proposal void on a whim, and what a delight that it was accepted!

[^4]: Gross.

[^5]: I mean, well, most of us, I guess.

[^6]: At least on Mastodon, which I admit, might be a biased sample.

[^7]: Who, btw, also created [Chef](https://www.chef.io), a thing you may have heard of.

[^8]: OK he didn't actually say this part, but I had to make the segue work _somehow_.

[^9]: If you're not familiar, "fair source" is a more recent trend where businesses allow you to look at their source
    code, but you're not actually allowed to do much of anything with it; specifically, you're not allowed to re-package
    it and sell it for money.  This is very similar to how patents work, for example.
