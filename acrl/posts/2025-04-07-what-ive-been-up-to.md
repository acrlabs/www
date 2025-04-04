---
title: "What I've been up to: April 2025 Edition"
authors:
  - drmorr
datetime: 2025-04-07 11:00:00
template: post.html
---

<figure markdown>
  ![an upside-down red robot with a grumpy expression on his face, doomscrolling on his phone, in a cartoon style. there is an explosion in the background.](/img/posts/doombot.jpg)
  <figcaption>What I definitely haven’t been doing: sitting in front of my phone getting increasingly upset at the awful
state of the world. Nope, nosirree, none of that here! My head is buried so far in the sand you’ll need a backhoe to get
it out.</figcaption>
</figure>

Well after my [last post](2025-03-17-sudo-make-me-a-makefile.md) generated so much hate, I've decided to throw in the
towel on this whole blogging thing.  Just kidding!  As far as I can tell nobody noticed.  I even submitted it to the
orange site[^1]!  I thought they loved that kind of thing over there.

Anyways, I haven't had the time to put together my next longform SimKube update, but I wanted to post _some_ kind of
update, so figured I'd just do my laundry list of "stuff that's been going on."  Some of it is actually sorta
interesting, maybe?  Anyways, here we go.

## Running a business is hard, who knew?

I've been dealing with a bunch of business-related stuff; earlier in the year I submitted paperwork to elect ACRL to be
taxed as an S-corporation instead of a sole-proprietor-ship.  The short version here is that this is slightly
tax-advantageous, but at the expense of "having to deal with a bunch more nonsense".  I didn't understand what was
happening at all for a long time, despite having it patiently explained to me by my lawyer and my accountant multiple
times, as well as reading through the IRS tax code several times on my own as well.  Anyways, last week the IRS approved
my S-corp election, which means I'm in the big leagues now!  Or... something.  All this really changes is that I'm now
giving myself a paycheck that has tax withholding taken out.

Speaking of taxes, it's tax season in the US[^2]!  I got a message from my accountant a few days ago saying,
essentially, "Your QuickBooks records are a mess and if you don't fix them we're going to have to file for an extension
on your tax return."  Now, I just want to preface this by saying that a) accounting is hard and there's a reason why
people go to school to learn how to do it, and b) I'm not a complete idiot, so I understand some of the general
princicples.  But I have _never_ seen software that is more user-hostile than QuickBooks.  I do not understand how it's
become the de-facto standard for accounting.  It is _SO BAD!!!!_  So anyways, I don't really understand how my records
got messed up, but I did learn that fixing them was a very manual, tedious process that took lots of mouse clicks and
unnecessary page reloads, and I lost about 8 hours of my life that I'm never getting back.  Thanks, QuickBooks.

## Working with clients is hard, who knew??

At the beginning of the year, I started working with my second client, which has been really exciting!  It's felt great
to start scaling up and really start to get traction with the business, and I'm getting to do a bunch more work that I
find really exciting[^3].  On the flip side, it's meant a bunch of extra logistics that I've had to sort out.

The hardest part, actually, was managing calendars.  I have four (well, really six) calendars that need to be
synchronized and managed: 3 calendars for personal/my family, 1 for ACRL, and 1 each for both of my clients.
Unfortunately my clients can't _see_ any of my other calendars, which meant that for the first few weeks, I was getting
events scheduled on top of each other all over the place, because nobody knew when I was available.  The process of
manually copying over events from each calendar to every other calendar quickly became untenable and error-prone; also,
the ACRL calendar is on [Proton](https://proton.me/calendar), which doesn't expose any sort of API for managing
events externally.  However, both of my client calendars are on Google, so after several scheduling snafus, I finally
hacked together [a Google Apps script](https://github.com/drmorr0/gcal-sync) that lets me keep all my calendars in sync
more-or-less automatically.  It isn't perfect, but it's good enough for now.

The other challenge I've run into with my client work[^4] is the ergonomics and logistics of the physical hardware.  I
have four different computers (personal, ACRL, client #1, client #2) on my desk right now, with three different
operating systems, and I would really _like_ to be able to use the same keyboard/mouse/displays/webcam/etc for all four
(and moreover, my work involves a lot of context switching, so it's not like I can just configure one system for the
day; I'm constantly switching back and forth between systems).  I tried a number of different options (including a
hardware KVM switch) before finally settling on a good solution: I'm using remote desktop on my LAN so that I can have
all four systems up at the same time.  It took a lot of trial and error to find the right configuration, but it's
finally all working smoothly.  I just had to buy a new keyboard first[^5][^6].

## Getting new clients is hard, who new??

In addition to all of the above stuff, I've been attempting to keep my "sales pipeline" going; I put a lot of work into
getting that flywheel going last year, and I don't want to have to repeat that effort, so I'm attempting to make sure
that I'm still reaching out to new people and setting up meetings and so forth.  One of the bloggers I follow (along
with several of my mentors who have experience in this area) have repeatedly made the point that the fastest way to sink
my business is to neglect my sales pipeline.  This is probably the part of the business that I had the least experience
with, at least before I started, and I was kindof dreading having to do it.  But honestly?  It's kinda fun!  I like
getting to meet new folks and say "Hey, I built something that can make your life a lot easier, wouldn't you like to
give me money for it?"  I get a lot of rejections, but that's fine and expected.  And I definitely would like to have
someone else doing this for me in the future, but for now?  It's ok.

I've been thinking a lot about my different "lead generating channels" here: I do a lot[^7] of marketing in various
sources, and it's been interesting to see what things have turned into concrete leads.  Here are my channels:

### Social Media

* Mastodon is my "primary" social platform, and while I get a lot of engagement and have a decent following on there,
  I don't think I've ever had a single serious lead from Mastodon[^8].  That's OK, though, I like the community and it
  gets me visibility.
* I also post on BlueSky; it's similar, but not identical to the content I post on Mastodon, but interestingly I get
  almost no engagement on BlueSky.  That said, I've put less time into developing my following there, but even so I'm
  surprised at how little people interact with me---especially since most of the cloud-native folks migrated over there
  late last year!
* My LinkedIn posts are a subset of both Mastodon and BlueSky, slightly tailored and reworked for a "business" audience.
  I paid for LinkedIn Premium for a couple months last year and did a bunch of cold-messaging; I get decent engagement
  on LI, but nothing that has really turned into a solid lead.  I suspect at some point I'll try this again.
* This blog: I do of course get a small amount of revenue from this blog[^9], and it gets me (I think) a lot of
  visibility, but so far I don't think it's _generated_ any solid leads.  I've found it far more useful as a follow-up
  with folks: "Hey, we had a great conversation, lemme send you a link to my blog so you can learn more."

### In-person networking

* Going to conferences: This has been by far my most productive lead generation channel.  I was at SCaLE a few weeks
  ago, and despite it being a smaller, not-exclusively-Kubernetes-focused conference, had multiple conversations and
  follow-ups with folks from it.  I routinely have around a dozen follow-ups from KubeCon every year, and some of those
  have turned into really serious leads.  I try to attend two conferences a year[^10], and it's been worth every penny
  of attendance.  Plus I really really like going to conferences!  They're super fun.
* Personal connections: I've built up a fairly expansive network over the last decade or so, and I'm now reaping some of
  the benefits of that.  I've gotten several serious leads and connections through people that I've worked with in the
  past (including both of my current clients!), so in some ways I view all of my _other_ distribution channels as
  investing in the "personal connections" channel of my future.

Anyways that was a brief digression, but all of that's to say, sales and marketing is hard, yo.

## SimKube is hard, who knew??

As if all of the above wasn't enough, I'm still attempting to push forward on SimKube in whatever spare time I have.
There's definitely a lot I want to be able to do with the software that I can't do right now.  I've been focusing on
three key areas:

* Data Generation: this is the project that my clinic team at Harvey Mudd College is working on.  It's a really
  important component of the simulation work, and I'm really excited to see the results here!  I'll probably have a full
  blog post up about this once the clinic is over.
* Trace Sanitization and Visualization: I want to make it easier for people to run simulations and understand what their
  simulation is "supposed" to do, and/or prevent a bunch of common mistakes folks have been running into with SimKube.
  I've been working on building out a full TUI for SimKube to visualize and modify the input data for your simulations,
  and my long-term vision here is that this is the primary way that users will interact with SimKube.  Again, I've been
  planning a full blog post about this feature at some point.
* Simulation of Prometheus data: a bunch of Kubernetes components (HPA, VPA, etc.) rely on metrics data to make their
  decisions, which currently isn't simulatable in SimKube.  I think this is a huge missing feature, and one I definitely
  want to add; this is also the least-developed of the three areas that I'm working on.  I have ideas about how I'm
  going to implement the feature, but have written no code and am not even 100% sure my ideas will work.

I've also been finding and fixing a few bugs and feature regressions; so while development has been slow, I _am_ making
progress!

## Work-life balance is hard, who knew??

So anyways, that's what I've been up to.  There's a lot there!  I've definitely been spending more nights and weekends
working during this phase, and also trying to maintain a healthy balance of family/non-work time.  There's a lot of
challenging parts to this, but I'm also having a ton of fun!  My journey at ACRL has been really fulfilling so far, and
I'm still just laying the foundation for years to come!  Thanks to all of you for coming along with me.

See you next time,

~drmorr

*[SCaLE]: The Southern California Linux Expo
*[TUI]: Terminal User Interface
*[NSDI]: Networked Systems Design and Infrastructure
*[SRECon]: Site Reliability Engineer Conference

[^1]: If you don't know what the orange site is, a) you're lucky, b) it's hackernews, you will never find a more
    wretched hive of scum and villainy on the internet.

[^2]: I've historically been very pro-taxes, because taxes are how the government provides good things for its citizens,
    but I haven't been seeing very many good things coming out of this particular governmental incarnation and for maybe
    the first time in my life kinda wish I weren't paying so much in taxes.

[^3]: I'll hopefully have a post to share about some of this work a bit later on, but for now I'm gonna play it close to
    the vest :)

[^4]: Aside from, you know, actually doing the work.

[^5]: _HAD_ to.  There was no way around it, it was an unavoidable expense.

[^6]: Actually in seriousness, the keyboard is fairly critical, due to the differences in keyboard layouts between
    Windows/Linux and MacOS.  I was constantly forgetting which machine I was on and triggering the wrong hotkeys; and a
    lot (all?) of the remote desktop software out there inject keyboard events at a low-enough layer that key remappers
    don't work.  So this keyboard is programmable at the _keyboard firmware_ level, which lets me guarantee that I'm
    emitting the right keypresses regardless of what system I'm on; it also has a switch that lets me toggle between
    MacOS and Windows/Linux layouts with a single switch.

[^7]: Well, _some_.  A lot is probably a stretch.

[^8]: You could be the first!!!!

[^9]: In the process of fixing my accounting woes, I was going through all my subscribers, and once again want to say a
    huge "Thank You!" to everyone who is supporting me on this platform.  It means a lot!!!

[^10]: KubeCon in the fall, and a different/unrelated conference in the spring; this year was SCaLE, last year I went to
    NSDI, and I'm thinking next year I might do SRECon.
