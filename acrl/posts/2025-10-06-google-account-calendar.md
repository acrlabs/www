---
title: "If you have a Google account your calendar isn't private"
authors:
  - drmorr
datetime: 2025-10-06 11:00:00
template: post.html
---

I'm taking a break from [SimKube](https://simkube.dev) to talk about my other favorite subject, scheduling.  No, not
Kubernetes scheduling.  Less exciting than that[^1].  I mean, like, literal real just scheduling events on calendars
with other humans.  And actually this post isn't even _really_ about that, but instead it's about the dumb rabbit hole I
went down today[^2].  You're welcome.

## Part I: ProtonMail

So, as part of my attempts to avoid Google products as much as possible, Applied Computing uses [ProtonMail](https://proton.me)
for its email provider; I've also used ProtonMail for my personal mail for a long time, and I've been pretty happy with
the product, so it made sense to set it up for ACRL as well.  And it's worked great as an email provider: but what I
find somewhat lacking is the calendar software.

The core problem is that it is exceedingly difficult to share your Proton calendar(s) with other people so that they can
see your availability.  The only way you can share a calendar with a non-Proton user is via a read-only [ICS](https://en.wikipedia.org/wiki/ICalendar)
link.  The problem is that usually these days you _really_ want your calendar to be (partially) externally-writeable,
either via scheduling software like [Calendly](https://calendly.com) (to let other people book time on your calendar
without having to play the "Oh I'm free these times when are you free?" game) or with other calendars (because, say,
maybe you are working with a few different clients who each have calendars and you need to sync events between all
your clients as well as your non-work calendars so that everybody doesn't all schedule everything all over each
other all willy-nilly---but I don't know anybody in that position).

(It's me.  I'm in that position.  I actually wrote a [simple Google Apps script](https://github.com/drmorr0/gcal-sync)
that allows me to sync events across all my different calendars, because I couldn't keep up with manually syncing
everything.  It gets around the ProtonMail read-only limitation by just creating duplicate events and inviting the
ProtonMail account user to those events.  It's not ideal, but it works.)

But anyways, that's not the point of this story.

## Part II: Google

As much as I would like to be completely de-Googled, it's actually kindof tough to run a business and not have a Google
account, because _most_ of the world runs on Google Docs and Google Slides.  So a while back, I created a Google account
associated with my ACRL email address, which I mostly just use when I need to collaborate with someone else or share a
document with them.  It's fine, it's not my preference, but I got other things to worry about, whatever, life goes on.

However, today I was redoing my business cards because I need to print a bunch more for KubeCon and the last batch that
I made was missing a few important things[^3].  And what I really would like to put on the business cards is a QR code
with a link to Calendly (or something like it) so that people at the top of my sales funnel can just click two buttons
and immediately get some time booked with me, instead of having to take the trouble to write an email, because nobody
uses email anymore, or at least that's what all the kids these days tell me.

So I was revisiting the "nothing is compatible with ProtonMail" rabbit hole when I happened to click through to the
Google account that was associated with my ProtonMail email address and discovered that... all of my ProtonMail calendar
events were _also_ on my Google calendar (reminder: the one I never use).

## Part III: WTF?

Again, maybe it's obvious to you reading this, but it sure wasn't obvious to me in the moment.  How were all of my
calendar events getting synced with Google?  I double-checked at least three times, and I wasn't actually sharing my
magic ProtonMail ICS link with the Google account.  Moreover, all of the semi-private information (event titles,
attendees, etc) were appearing in the Google account, and I _definitely_ wasn't syncing those.  What was going on???

After staring at it for a little while, I realized something important: not _all_ of the events were getting synced with
my Google account.  In particular, if _I_ created an event, it wasn't on my Google calendar, but if somebody else had
created the event and invited me to it, then it would appear on my Google calendar.

How was this happening?  I don't have a Gmail address associated with ACRL (a Google account is not the same thing as a
Gmail address).  Did I at one point set up sharing somehow and then forgot, and then maybe a setting changed or got
removed and now I can't undo it?  What was going on?  The most frustrating, confusing, and annoying thing about this is
that I couldn't just _delete_ my Google calendar, because that would delete all the events on the calendar, and then
send cancellation messages to all the other attendees.  I definitely don't want that to happen!  But this is even more
confusing now, because it means that the events aren't just getting _synced_ to my Google calendar, but Google also
somehow thinks it's the _owner_ of the events.

I went through a lot of crazy (in hindsight) hypotheses: did I have some weird DNS record[^4] set up that was also
sending calendar events to Google?  Did I have an email forwarding rule set up from ProtonMail to Google[^5]?  I went so
far as to create a _brand new_ Google account that was associated with an unused ACRL email address, and then I created
an event from my personal email and invited that user.  Annnnndddd... the event didn't show up!

Ok, now I was really confused, before it finally hit me: Google was man-in-the-middling me!  See, it's not _every_ event
that someone else created that showed up on the Google account calendar, it's just events that are created by _someone
else using a Google account_.  If both users are on Google, it just assumes that you're using their product and will
auto-create the events on your Google calendar, even though the calendar invite email gets sent somewhere else entirely.
This is also why all of the calendar event details appear on the Google calendar, and why Google will notify users if
you try to delete the events off of your Google calendar.

It's obvious in hindsight, but it was a real head-scratcher for me for a bit this afternoon.  And it was a good reminder
that if one party in any sort of online interaction is using Google, then _all_ parties are using Google, whether they
want to be or not[^6].  And not that it really matters, but I can also tell which of my contacts are using Google
products or not by checking to see whether their calendar events show up on my Google account.

Anyways, now that that mystery is solved, I can get back to the problem of "figuring out how to make Calendly work with
ProtonMail"[^7][^8] so that I can print my dang business cards.  Isn't this fun???

Tune in next time for another rant about my problem of the week!  Until then, thanks for reading!

~drmorr

[^1]: No, not Mesos scheduling either.  RIP.

[^2]: It's entirely probable that the thrilling conclusion to this blog post is obvious to you from the very beginning,
    particularly because I gave it away in the title of the post, but it took me many minutes of my life to understand
    what was going on so now you get to spend many minutes of your life reading about it.  Or you could just click the
    "close tab" button and move on, but where's the fun in that?

[^3]: Pro tip: if you are running a business and your business has a website and you would like people you hand your
    business card to to visit that website, it might be useful to include the URL of the website on the business card.
    Just saying.

[^4]: [It's not DNS, there's no way it's DNS, etc.](https://imgur.com/eAwdKEC)

[^5]: These hypotheses really make no sense if you think about it, because I don't even have Gmail set up!

[^6]: Really it's the same with email: if you send an email to somebody with a Gmail account, Google is going to read
    the contents of that email and use it for advertising or training or whatever other privacy-invading things they do
    with it, even if the sender isn't using a Google product to send the email.  It was just extra weird to me because I
    wasn't expecting to see my calendar events pop up someplace that I hadn't specifically invited or granted permission
    to.

[^7]: In what is an extremely ironic twist, the only solution I've come up with that seems realistic at all is to sync
    my ProtonMail calendar to my Google account calendar, and then connect Calendly to the Google account.  Life sure
    has a sense of humor.

[^8]: There is an [open feature request](https://protonmail.uservoice.com/forums/284483-proton-mail-calendar/suggestions/41340193-show-and-book-available-appointments-like-calendl?page=1&per_page=20)
    on the Proton user forums asking for the ability to connect to something like Calendly, or for Proton to develop
    their own solution, but it has hundreds of comments and votes over the years and seems to have been completely
    ignored by the Proton dev team, so I'm not holding my breath.
