---
title: "KubeCon Recap, Part 3: How you too can have your live demo fail on stage"
authors: 
  - drmorr
datetime: 2023-12-04 11:00:00
template: post.html
---

Welcome back, happy December!  We're rapidly heading into the end of the year; I'm going to be very busy over the next
several weeks trying to get a grant proposal finalized.  I'll probably have some more to say about this in a future
post.  In this post, I'm going to continue my KubeCon NA 2023 recap with a discussion of my own talk[^1].  I'm not
going to cover the content of the talk, if you want to see that, you can just go [watch it](https://www.youtube.com/watch?v=epII6_JwQSA),
along with the accompanying [recorded demo](https://www.youtube.com/watch?v=Q1XpH1H4It8)[^2].  Instead I want to talk
about the process of actually _giving_ the talk and maybe provide some help or encouragement to anyone else out there
struggling with a presentation that they want to (or have already) given.

Before we dive in, though, I want to acknowledge something and make an offer.  I'm sticking this here instead of at the
end in the hopes that you don't skim over it.  First, the acknowledgement: communication is _hard_.  Even just writing
something like this blog is not easy.  I have had a _lot_ of training in both writing and public speaking, and I think,
if I can say this without bragging, that I'm pretty good at both of them.  But it's still, even after all my training, a
_very difficult process_.

So, next, the offer.  If you have some bit of communication you want help with: a blog post, a journal article, a
conference talk or proposal, a PhD dissertation, _whatever_, on _whatever topic you want_---[get in touch with
me](https://appliedcomputing.io/contact) and I will offer you a review and editing session _for free_.  I really believe
that we need more people out there writing, speaking, sharing about what they're doing, and I will happily donate my
time to help you if you're struggling[^3].

Ok, with that out of the way, let's talk about _my_ presentation.  Specifically, let's talk about what went wrong with
it[^4].

## The Live Demo Curse

If you've been around the conference circuit for any length of time, you know that live demos have a reputation.  There
are just _so many_ things that can go wrong in a high-stress situation.  Consider that you (or your teammates) have
probably been rushing to get the demo even working at all, because stuff always takes longer than you expect.  Demos
are, by definition, _demonstrations_, which means they're likely not ready for production and have some rough edges.  If
your demo depends on a working Internet in any way shape or form, you're in for extra fun, because conference WiFi is
notoriously spotty.  And even assuming everything else goes perfectly, you're in a new environment, possibly on low
sleep, definitely with extra adrenaline, doing a thing that most humans find at least a little scary!  No wonder live
demos fail all the time[^5]!  I know some companies or teams have a "no live demos" policy because of the risk that live
demos carry.

So if live demos are so risky, why do people---or, actually, let's make this more personal---why did _I_ decide to do a
live demo on stage at KubeCon?  Wouldn't it be better to just record something ahead of time and hit play?  Everyone
will have a different answer to this question, but for me, at least, watching a video of someone typing commands into a
terminal just doesn't have the same punch, the same impact.  I'm not even going to consider the possibility of doctoring
videos, let's assume that we're all honest here, but it just doesn't feel _alive_.  For me---if I'm going to listen to
someone talk live, I don't want them to hit play on a YouTube video that I could have watched at home.  I'm there to see
the person, to interact with them, to see them interact with the cool stuff they're showing off!  So there wasn't any
question in my mind: I built [SimKube](https://github.com/acrlabs/simkube) and I wanted to show it live.

However, I knew there were risks involved, so I did everything I could leading up to the conference to mitigate those
risks.  I had three separate Git repos I was working with: one was the SimKube repo, one contained all my conference
artifacts, and one contained the setup for my demo environment.  I also had a rigorous checklist that involved
completely destroying my demo environment and rebuilding it from scratch before the presentation, and I put a fair bit
of time into automating as much of that as possible so there was less chance of me forgetting to do a step.  I _also_
made sure that nothing in my demo depended on an internet connection[^6], because I knew that that would likely throw
all kinds of confounding factors into my presentation.  And then I just drilled it, over, and over, and over again.  I
possibly practiced this talk more times than any talk I've given since my thesis defense.  I made sure I knew every step
and that every step worked.

And---as you've seen if you watched the video---when the critical moment arrived, it still failed.  So let's look into
why.

## A Post-Incident Review

There's a fairly standard practice in engineering: when things break, you conduct a post-incident review, sometimes
called a postmortem.  There are hundreds of thousands of words spilled on this topic which you can find yourself on the
Internet, but one of the key points from any discussion of incidents is that there is rarely, if ever, one single "root
cause" of the failure.  A second tenet of postmortem review is that you should keep asking "why?" until you're blue in
the face.  So let's do that here.

On the surface, the reason that my demo failed is because I forgot to run a command at the start of the talk.  I had two
steps I needed to do to "start" the demo, and I did the first one, but forgot to do the second.  So then, when the time
came to actually see the demo results, there was nothing to see.  Ok, but why did I forget to run the command?

Well, remember how I said that I'd isolated everything from the Internet?  It turns out that I did that successfully,
but in all of my practice runs, I _never actually disconnected my laptop from the Internet_.  So in the first command I
ran, it spit out an error saying "Hey, I can't connect to the Internet"---which was fine, it didn't _need_ to.  But I
was confused and flustered because I'd never seen the error during my practices.  So I spent 30 seconds trying to parse
the error message, and in that 30 seconds I lost the second command.

Ok, but _why_ was I confused and flustered?  I just gave you the primary reason, but there's another reason that nobody
in the audience would know about.  When I had gotten into the conference room for my talk, I hooked my laptop up to the
projector, all ready for my talk, and---nothing.  The projector didn't recognize my laptop.  Ok, I thought, maybe I'll
try a different port.  No dice.  At this point I was really starting to panic.  I'd gotten there a good thirty minutes
early to try to set things up, because I know that this process isn't always smooth, and after trying a bunch of things,
I was maybe ten minutes out from my presentation with nothing showing up on the screen[^7].  I had a lot of panicked
curse words flying through my head, and then I finally had the brilliant idea of rebooting my laptop, which worked[^8].
Whew!  What a relief!  Everything was going to be fine!  Except that by that point, my adrenaline levels were through
the roof, and my talk was starting soon, so I didn't have a chance to really go through any of my pre-talk calming
routines.  So even going into the talk, I was already primed to make mistakes during the demo[^9].

There's a bunch of other "why" questions we can ask.  Here's a few, I'm sure you can come up with more: Why didn't I
ever test my demo with my laptop disconnected from the Internet?  Why did my demo start require two steps instead of
one---i.e., why didn't I automate more?  Why didn't I _know_ during the presentation that the demo wasn't running?  I'm
not going to bore you with answers to these questions, but suffice to say that you can keep asking "why?" for quite a
long time before running out interesting things to say.

Anyways, now we've done our analysis of what went wrong, now let's list out some things we could do next time to prevent
this from happening.  A lot of times we call these "corrective actions" in a postmortem review:

1. I could modify the startup script so that it requires one action to kick off the demo
2. I could have some easily-visible indication on the presenter screen or otherwise about whether the demo is running
3. I could test things with no Internet connection during a practice run
4. I could test things on a different laptop so we have a suitable backup in case the main laptop didn't work
5. I could have a pre-recorded backup demo that we could play in the event that the live demo failed for some reason

I'm sure you could think of other corrective actions you could take in a similar such scenario.  The important thing to
recognize is that you're not done, you actually need to evaluate your list of corrective actions and _do_ some of
them[^10].

## The Emotional Fallout

So we talked in-depth about what went wrong during my talk, and we brainstormed some ideas how to mitigate against these
issues in the future.  But now I want to move away from the somewhat impersonal "what went wrong?" analysis and talk
about the fallout and the emotional impact[^11].

Once I discovered that my demo wasn't going to work, I think things were approximately "fine".  I know better than to
try to debug on-stage, nobody wants to see that.  And I had enough extra content for my talk that I had cut in the
interest of time that it was pretty easy for me to pivot and talk about some other stuff.  And then I was able to merge
back into the original presentation, close it out smoothly, and field a bunch of questions.  I got a lot of interest and
positive feedback after the talk was over.  So all-in-all, I think my talk was pretty darned good[^12]!  But
emotionally, I was _gutted_.

If you consider the amount of energy I'd put into this thing, along with 25 minutes of sheer panic before the talk,
along with a (completely outlandish) feeling that the success or failure of Applied Computing hinged on how well I did
in this talk, you might begin to understand the emotional state I was in.  And I just want to tell you all that _this is
a normal and OK response!_  It is _one hundred percent OK_ to feel terrible after a talk, even if it went perfectly!
Emotions are complicated.  Don't beat yourself up for having them.

But that's where I was.  So what did I do with those emotions?  Well, the first thing I did was go and find a quiet spot
to collapse and just close my eyes.  I practiced some breathing exercises.  I avoided everyone because the last thing I
wanted was to run into someone from my talk who might comment on it.  And then, after some time, I found a friend and we
went for a walk and they gave me a pep talk.  By the time we got back, I was feeling, well, if not great, at least like
I could finish out the day without feeling like a complete failure.  And I made two resolutions:

Firstly, if anyone ever asked me how my talk went, I was going to tell them that it went well.  I wasn't going to fixate
on the demo failing, in fact I wasn't even going to mention it unless the other person brought it up first.  You
wouldn't believe how hard this kind of thing is: we as humans fixate on our own flaws and failings so much more than
anyone else does that it requires a huge amount of self-control to not make ourselves feel even worse by telling
everyone else how much of a failure we are, especially when they wouldn't have known otherwise[^13].  But I did it.  I
told people my talk went well and people seemed excited about it, both of which were objectively true statements.

Secondly, I resolved that when I got back to my hotel room that night, I was going to make a recording of my demo and
put it up on YouTube and then tell people about it.  Because I still really wanted people to _see_ the demo, even if it
didn't happen in the way that I wanted it to.  And you could argue that maybe I should've had that recording done before
my talk, but the fact that I made it _at all_ meant that I had something I could share with people _immediately_ who
didn't attend the talk.  And honestly?  That turned out to be a great outcome!  I was able to get even more people
interested than just the ones who went to my talk, and that never would have happened if my demo had gone as planned.

## Time to move on

So that's the story of how my live demo failed at KubeCon.  Just to be really clear, I don't want anyone walking away
from this thinking I'm bragging about my public speaking skills or whatever.  My purpose here is to say "This stuff
happens to everyone!  Even You!  And it's OK."  Things happen, things go wrong, and you know what?  We move on.  We
learn, and we try to better next time.  Don't dwell in the past, learn for the future.

Thanks for reading,

~drmorr

[^1]: By the way, all the KubeCon talks are now posted [on YouTube](https://www.youtube.com/playlist?list=PLj6h78yzYM2MYc0X1465RzF_7Cqf7bnqL),
    so you can watch my talk or any of the other talks from the lineup that you're interested in!  I think I'll post a
    "recommended talks" watchlist on here in a few days.

[^2]: Foreshadowing, anybody?

[^3]: Not-legal disclaimers: 1) I do not do editing or review professionally, and there are people who _do_---so if your
    thing is _REALLY_ important, I will still review it but you may also want to hire a professional editor or reviewer.
    2) Because this is not my day job, my turnaround time is going to be slower; I will _try_ to get it back to you
    within a couple weeks, depending on the length of the content, but I can't promise anything.  If you have a deadline
    and you want me to read it, get it to me early!  3) I know a lot of things about computers.  I know some things
    about other fields of science.  I know some other things about the humanities.  And I have a bunch of other random
    bits of miscellaneous knowledge.  But the further your topic is from my subject matter expertise, the less in-depth
    of a review I'm going to be able to give you.  I will still read it, though, so don't let that stop you from asking
    for help!

[^4]: I think it's really important for us to share not only our success stories, but also our failure stories.  If
    you're looking for another really inspiring failure story, [this post](https://www.chrislewicki.com/articles/failurestory)
    about how someone nearly destroyed a $500 million dollar Mars rover two weeks before launch-time is worth a read.

[^5]: Live demos fail even when you're a very famous, practiced public speaker and have an entire team of people behind
    you making sure the demo works.  Steve Jobs had a number of [somewhat famous](https://www.macworld.com/article/228313/a-look-back-at-steve-jobs-most-colorful-keynote-moments.html)
    live demo failures as well!

[^6]: Ahem, more foreshadowing.

[^7]: Now, I _could_ have given the presentation with no slides whatsoever.  I've done that in the past when my slides
    have failed.  But, even aside from my demo, there were a number of diagrams and other interactive elements in the
    talk that _really_ wouldn't translate well in a slide-less presentation.  I also considered using someone else's
    laptop, but for similar reasons, that would have been sub-optimal.

[^8]: I know I said above that I know a lot about computers so it's with some shame that I confess that I didn't
    immediately try this step.

[^9]: We could take this process of "asking why?" one step further and ask why my laptop was having trouble connecting
    to the projector, and the answer there is probably due to the fact that I run a slightly arcane Linux configuration
    that works really well 98% of the time, but has a few, uh, rough edges.  And then you could ask why I run my laptop
    in this configuration, but that gets into subjects of masochism that I don't feel comfortable discussing on this
    blog.

[^10]: You'd be shocked---or maybe you wouldn't be---at how many incident re-occur because nobody ever bothered to
    prioritize the corrective action that would have prevented recurrence.

[^11]: By the way, this isn't something that really gets covered in most technical postmortem reviews, and I kinda think
    it _should_ be, because incidents _suck_.  Especially if you're the person who "caused" the incident, the emotional
    toll is _brutal_.  We should probably acknowledge that more.

[^12]: I can't tell you for sure because I haven't watched it, and to be quite honest, I'm probably not gonna.  I _hate_
    watching myself give presentations, even ones that go flawlessly.

[^13]: Please note that I'm _not_ advocating for covering up or hiding mistakes here.  Own your mistakes.  Apologize for
    them if you need to.  Fix them.  Just... don't _dwell_ on them.
