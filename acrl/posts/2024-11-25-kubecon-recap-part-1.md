---
title: "KubeCon Recap, Part 1: The View from the Vendor Floor"
authors:
  - drmorr
datetime: 2024-11-25 11:00:00
template: post.html
---

So, in case you missed it, KubeCon happened.  Between holidays and my intermittent posting schedule, I'm probably going
to spend the rest of the year covering the event.  Since next week is Thanksgiving in the US, I definitely won't be
posting then, so I wanted to get at least one post in before some of the buzz from the conference dies down.

Unlike last year, where I spent most of my post-conference blogging covering the various talks and such that I liked
from the conference, this year I'm going to start off with some more business-y aspects of the conference.  That's
because, unlike any previous conference I've been to possibly ever[^1], I spent 80% of my time on the vendor floor.  It
was definitely overwhelming, but I had a lot of good conversations and leads to follow up on, which feels exciting.  So
I'm going to start my blog coverage talking about the vendors.

## The prep phase: making stickers

As you may or may not have noticed, I've been in a big marketing and sales push recently, both on the blog and outside.
I knew that I was going to be spending a lot of time talking to vendors, but I also knew that a lot of other people were
also going to be talking to the vendors, so I wanted to make sure that I had the appropriate marketing to "stand out
from the crowd".  It helps that (as best as I can tell), I'm one of the only people in the industry trying to do
Kubernetes simulation.  I think it also helps that SimKube is a pretty memorable name---short, sweet, and to-the-point.
So I just wanted to capitalize on those factors.

I've been following along with [Michael Drogalis](https://michaeldrogalis.substack.com) and learning from some of his
experiences, and one of the things he mentioned is getting shirts printed with a QR code on the back that led to his
product.  I thought this was a great idea, and since SimKube now has a very cute and memorable [mascot](./2024-10-28-meet-mr-squidler.md)[^2],
I figured putting that on a t-shirt and wearing it around the conference could lead to some good conversations.  So I
printed off a few t-shirts for me and some friends, and we all wore them around.  The one change I made from Michael's
experience was, instead of putting a QR code on the back, I included a conversation starter: my goal was, I really
wanted to get people to talk to me rather than just going to a website.

Unfortunately, as best as I can tell, the t-shirts did approximately nothing for me.  I never had anyone comment on them
or ask me any questions based on the prompt, and the friends that I had wearing shirts also reported similar results.
So I was a bit disappointed by that.  But I don't consider it a complete loss: I still have the t-shirts and I can use
them for similar events in the future, where maybe they'll have different results.

The other thing that occurred to me _wayyyyy_ too late in the process is that I should have stickers and business cards
that I can hand out to people.  Fortunately, I was able to find a place in town who could get me stuff printed in time
for the conference, so I threw together some quick designs in Photoshop and got them made.

I made two big mistakes here, though: first is that the stickers didn't include the name of my product anywhere (I made
stickers of Mr. Squidler and of the SK logo, but neither one said SimKube).  So once I got to the conference I didn't
feel like I could just hand them out or leave them lying around, because nobody would know what they were.  So, fine, I
handed a few out to my friends and kept the others for later[^3].  The other mistake was on the business cards, I
included a link to the [SimKube website](https://simkube.dev), and a custom email address people could use to contact
me, but I didn't actually put my _name_ on the card.  This was sortof deliberate, because I wanted people to focus on
the product rather than who I was, but after the third or fourth person asked me why my name wasn't on the cards, I
began to realize this was a mistake.

All in all, though, for a few hundred dollars of marketing budget, I feel like it worked out OK.  It brought at least
_some_ value, and I learned some stuff for next time.  And then, of course, I spent the evening before I was supposed to
fly out rather sick, and I almost didn't make it to the conference at all.

## Who sells to the salesmen?

The first two days in Salt Lake were my "talks and networking" time; I gave a talk at [Cloud Native
Rejekts](https://cloud-native.rejekts.io/) and met some cool folks there.  I also spent time volunteering at the
Contributor Summit.  I'll talk about those events in a future blog post; today is all about the vendor floor!

My goal going into the conference was to talk to every vendor who was there.  I quickly realized that a) this was
unrealistic of me, and b) a waste of my time.  There's a ton of vendors doing, idk, eBPF things or security things or
CI/CD things, who just wouldn't even know what to do with SimKube.  That doesn't mean I couldn't have talked to them, of
course, but there were also just _soooo_ many vendors overall that I needed to prioritize.  After the first day, I had
more-or-less talked to a third of the companies that I thought looked interesting, and that was a small fraction of the
total vendors on the floor!

I spent a bit of time the first day perfecting my script: I would walk up to a vendor, ask a bunch of general questions
about their product, and then figure out (in my head) where I thought SimKube would be most useful for them.  Then I
would ask a couple of really specific targeted questions, like "How do you solve X problem right now?" or "Have you
ever considered doing Y?"  I tried to tailor the questions to be a bit more technical, so that the sales rep would have
to pull in a more technical person (at the smaller companies, this often ended up being the founder or CTO).  I could
tell that they didn't quite understand where the conversation was going, because these weren't the "normal" questions
that people asked.  And then once I had gotten them talking about the problems they'd identified in their own
platform, I'd whip out "Have you ever considered trying to solve this problem with simulation?" and I'd hand them a
business card[^4].  This conversation model worked around 90% of the time[^5], and it got a lot of folks _really_ excited.
So I felt good about that---and, despite not including my name, the SimKube business cards that I printed ended up being
the best marketing investment I made.  I printed 50 and gave almost all of them away.  I also made sure that I took
pictures of badges of everyone I had conversations with, and connected with all of them on LinkedIn after the fact[^6].

By the end of the conference, I think I had talked to around 95% of the people that I identified as "priority 1", and my
goodness it was exhausting.  But I ended up with a strong set of really solid leads that I'm now attempting to follow up
on.

So did it work?  Who knows!  I'll tell you when I land a client.  But I'm cautiously optimistic that at least one of
these leads is going to turn into something.

## But what about the talks?

It was a bit sad to not get to go see more talks, because those are my favorite parts of the conference experience.
Aside from my own, I went to two talks at KubeCon proper:

* [Choose Your Own Adventure: The Observability Odyssey](https://kccncna2024.sched.com/event/1i7lV/choose-your-own-adventure-the-observability-odyssey-whitney-lee-cncf-ambassador-viktor-farcic-upbound)
  by Whitney Lee and Viktor Farcic: this was a live continuation of a long-running choose-your-own-adventure podcast
  series about Hero, the poor pod who just wants to get to production.  It was truly a delightful presentation, and I
  really recommend watching the whole series.  This talk was unique in that the two co-presenters more-or-less didn't
  coordinate ahead of time.  They didn't know what the other person was going to be doing or saying at any point,
  and---this was definitely a bold choice, and I think maybe only possible by these two people!  Whitney and Viktor have
  such a delightful chemistry on-stage, and it was a real joy to get to watch them as they deployed a bunch of popular
  observability tools for Hero.
* [WASM + KWOK Wizardry: Writing and Testing Scheduler Plugins at Scale](https://kccncna2024.sched.com/event/1i7p8/wasm-kwok-wizardry-writing-and-testing-scheduler-plugins-at-scale-dejan-pejchev-jonathan-giannuzzi-g-research)
  by Dejan Pejchev and Jonathan Giannuzzi from G-Research: this talk was an obvious one to go to for me, because they're
  talking about scheduling and using KWOK, which of course SimKube uses internally as well.  It was also a pretty good
  talk, although a lot more niche.  I did learn from this talk that you can now write `kube-scheduler` plugins using
  WASM, which is a pretty exciting development!  No more re-compiling the scheduler from source just to get your own
  special plugin behaviour implemented.  They also demoed the [kube-scheduler-simulator](https://github.com/kubernetes-sigs/kube-scheduler-simulator),
  which is specifically designed to help you understand what the scheduler is doing and why.  It's a little different
  from SimKube (in fact, I would argue that it's not really a simulator at all) in that it's just providing some
  additional annotations and observability into the scheduler's actions, whereas SimKube has a more expansive (but also
  harder to reason about) purview.

My own two talks (which I linked to last week) went well, too, and I got a lot of good feedback and engagement from them
as well.  So all in all, I'd say it was a successful conference!  And, a week later, I'm maybe 95% recovered and willing
to leave my house again :joy:

I hope those of you celebrating Thanksgiving next week all get some rest and relaxation time, and I'll be back here in a
couple weeks with more KubeCon coverage!

Thanks for reading,

~drmorr

[^1]: The two exceptions being [SuperComputing 2008](https://sc08.supercomputing.org) and the American Chemical Society
    conference in Fall 2008, both of which I worked a vendor booth at, and were frankly miserable experiences.

[^2]: Mr. Squidler says hi!

[^3]: If you want any stickers, let me know!

[^4]: The moment when the vendors suddenly realized they were being sold to instead of doing the selling
    never failed to fill me with an incredible amount of glee and satisfaction.

[^5]: A few times I identified partway through the conversation that they wouldn't actually be that interested in
    SimKube, and at that point just pretended that I was a mildly-interested passerby, disengage, and move on.

[^6]: I also let everyone who asked scan my badge, which means I'm now dealing with the deluge of spammy marketing
    emails from most of the vendors at KubeCon.
