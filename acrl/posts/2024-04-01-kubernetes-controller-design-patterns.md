---
title: Design Patterns for Kubernetes Controllers
authors:
  - drmorr
datetime: 2024-04-01 11:00:00
template: post.html
---

<figure markdown>
  ![A stuffed elephant with robotic hands typing on a computer](/img/posts/blogophant.jpg)
  <figcaption>Blogophant, the stuffed robotic blogging elephant that will be henceforth writing all of these posts.</figcaption>
</figure>

Happy April Fool's Day!  I guess this is the day where I'm supposed to make some ridiculous product announcement, so,
uh, today I'm very excited to reveal that, uh, all my future blog posts and research papers will, uh, be written by a
robotic stuffed, uh, elephant that I've named Blogophant.  Blogophant will soon be on sale so that you too can write
blog posts with a stuffed elephant for the low, low price of---you know what, never mind, I'm no good at this, forget
it.  Also, if you're a paid subscriber you're seeing this a few days early which I guess ruins the joke even more.

No, what I really want to talk about today is writing Kubernetes controllers.  This post is inspired by both my own work
on SimKube, as well as some conversations with colleagues, including this [thought-provoking Mastodon thread](https://recurse.social/@lindsey/112148276489719171)
from Dr. Lindsey Kuper at UC Santa Cruz.  I've written a few small-ish controllers and I can definitively say that they
are very hard to write well[^1].  This is partly due to the inherent complexities of distributed computing, and also due
to some of specific implementation choices in Kubernetes.

The way I described this in the above Mastodon thread is that a Kubernetes controller is a distributed state machine,
where the only information you have is "what state you were in a few milliseconds ago, assuming that none of the systems
communicating state to you were broken or lying."  The controller needs to use this incomplete information to try to
move towards a desired end-state, which is, naturally, non-trivial[^2].  The standard mechanism for ensuring correctness
in Kubernetes controllers is [idempotence](https://en.wikipedia.org/wiki/Idempotence), which roughly means if you do the
same thing multiple times it doesn't change the result after the first time.  By writing your controllers in an
idempotent way, you can be sure that if your state information is incorrect or out-of-date, and you try to make a change
that's already been made, nothing will break.  Surprising no one, idempotence is hard.

What I find frustrating is that there aren't any good resources out there for to write controllers well.  There's the
[kubebuilder](https://book.kubebuilder.io) book, which is a really good starting point and introduction to the concepts,
and there are dozens of Medium posts that re-iterate the points from the kubebuilder book in less-clear ways[^3], and
then there's the Istio controller, which is basically ["draw the rest of the f\*\*\*ing owl"](https://knowyourmeme.com/memes/how-to-draw-an-owl).

However, there don't seem to be any references or books on how to go from "baby's first controller" to Istio, which is a
real shame, because one of the big strengths of Kubernetes is the ability to customize its behaviour through custom
resources and controllers.  There are a lot of [posts out there lambasting people who choose to write controllers](https://hachyderm.io/@drmorr/111766706051904598),
when actually I think we should be encouraging _more_ of them.  We just need to make it suck less first[^4].

## Effective Kubernetes Controllers

Early in my career, I read [Effective C++](https://www.oreilly.com/library/view/effective-c-55/0321334876/) by Scott
Meyers; this was a really transformative book for me in terms of how I think about writing code.  It was the first time
I thought about writing code by "composing specific patterns or best practices that work well" instead of just "throwing
down a bunch of spaghetti to see what sticks".  In it I learned about, for example, [RAII](https://en.wikipedia.org/wiki/Resource_acquisition_is_initialization)
and other such design patterns for making safer C++ code.  C++ of course has changed a lot since that book was
published, so some of the specific patterns in the book are no longer considered "good", but the _idea_ of the book is
still tremendously important.  What I want to have is the book on "Effective Controllers".

I am not an expert Kubernetes controller developer, but in this post I want to share a few patterns that I've been using
in my controllers in the hope that maybe they'll be helpful for someone else.  It's entirely possible, of course, that
these are actually anti-patterns that I _shouldn't_ be using, and if you think that's the case I'd love to know that as
well.  But we have to start somewhere, right?

### Pattern 1: Check your desired state first

Most of the controllers that I've written broadly fall into the following pattern:

1. Do some setup stuff
2. Do the thing
3. Do some cleanup stuff

Something that's always bugged me from the kubebuilder book and other references I've read is that it approaches this in
a very linear fashion.  In other words, the controller code looks like the following:

```go
func reconcile() {
    // Do some setup stuff
    if !condition_A {
        do_setup_A()
    }

    if !condition_B {
        do_setup_B()
    }

    // Do the thing
    if !thing_running {
        run_thing()
    }

    // Do some cleanup stuff
    if thing_done {
        do_cleanup()
    }
}
```

This setup (with each individual if-block) is how the code ensures idempotence, i.e., if the controller crashed in
between `do_setup_A()` and `do_setup_B()`, we can "pick up where we left off".  What's always bugged me about this
pattern is that it runs through all the setup code every time `reconcile` is called, even if we're already halfway
through our task.  The way I've started writing this code is by inverting the logic: _first_ I check whether I'm in the
desired state, and only if we're _not_, do I call the setup functionality:

```go
func reconcile() {
    state := check_desired_state()

    if state == nil {
        // Do some setup stuff
        if !condition_A {
            do_setup_A()
        }

        if !condition_B {
            do_setup_B()
        }

        // Do the thing; we already checked the state and it wasn't
        // running, so don't need an additional check here
        run_thing()
    } else if state == Finished {
        // Do some cleanup stuff
        do_cleanup()
    }
}
```

This code _looks_ a little uglier[^5] but I think it communicates the intent better, which is namely: we want the thing
to be running, but if it's not, we should start it.  It has the added advantage that it reduces calls to the apiserver,
because we only check conditions A and B if the thing isn't running, instead of every single time.

Now, you could argue that this is actually a bad pattern[^6], because if something changes down the line so that
whatever setup we did in step A is undone, we don't check that and restart or recreate it.  But the thing about design
patterns is that you have to know _when_ to use them, you don't use them every time.  So if your controller needs to
continually ensure that the setup conditions are still met, then you probably shouldn't use this pattern.  At least for
the controllers I've written, however, if the setup conditions stop being met I'd rather just mark the whole thing as
"Failed" so that the user can investigate.

### Pattern #2: Take advantage of the built-in Kubernetes garbage collection

Kubernetes has some really sophisticated built-in garbage collection that allows users to set "owner references" on
their objects; when an object's owner no longer exists, then any objects that reference that owner are automatically
cleaned up by Kubernetes itself.  The kubebuilder book and plenty of other sources say you should be setting owner
references to take advantage of this automatic cleanup, but I've taken this a step further in SimKube.

I think maybe my use case is a bit different than more "typical" controllers, where "deleting your custom resource" is
equivalent to "deleting all the stuff that the custom resource controls."  But I wanted to put this pattern down anyways
in case other folks are doing the same thing.  See, with SimKube, the `Simulation` custom resource should stick
around---I want people to be able to inspect, debug, investigate, etc. the results of the simulation after it's done;
but, all of the "other stuff" that I set up needs to be torn down at the end of a simulation.  This is sorta similar to
the Kubernetes `Job` object, where the jobs stick around after they've completed so that users can see logs and so
forth.

The way I do this in SimKube is to create a _separate_, totally empty, custom resource type called a `SimulationRoot`,
off of which hangs all of the other things that I want cleaned up at the end of a simulation (this includes
certificates, prometheus, webhook configurations, services, and more).  That way, in my controller, when I'm ready to
clean things up, I _just_ delete the `SimulationRoot` object, instead of having to track and remember all of the
different resources that I created.  I view this _sortof_ like RAII for Kubernetes controllers, and it's not a pattern
I've seen anyone else mention, so I thought I'd leave it here.

### Semi-pattern #3: Don't rely on values in status fields, they can be incorrect

I'm calling this one a semi-pattern because I don't actually know how to reason about this in a general case.  The
specific thing that started me down this line of thought was the [knative bug](https://github.com/knative/serving/issues/8539)
that Prof. Lindsey and her grad student found, but I'd also been independently thinking about this for SimKube.  The
core of the bug (as best as I can tell) is that the controller for one custom resource was looking at the status field
of a different custom resource to determine readiness.  The status field for CR #2 could go from "Active" to "Inactive"
during the course of normal operation, which would make CR #1 appear unready even though it actually was ready.

The fix for this issue was to create a new status field for CR #2 called `HasBeenReady`, which only goes from `false` to
`true`, e.g., it is [monotonic](https://en.wikipedia.org/wiki/Monotonic_function) in the language of distributed
systems.  But... this feels like a really weird fix to me, and seems like it maybe has other race conditions hiding in
it somewhere?

In SimKube I've done a bunch of effort to avoid this exact sort of pattern, where I treat the `Simulation` status field
as purely informational, and not as a "state storage" mechanism[^7].  To me this makes sense, because many controllers
don't block or fail if the status field fails to update correctly.  In other words, the status field of your own custom
resource may be out of date and unreliable.

But then I started thinking: what is a status field update, except (ultimately) an entry in etcd somewhere?  And,
really, what is _any_ Kubernetes object other than an entry in etcd somewhere?  Etcd doesn't make a distinction like
"_this_ key is less reliable than _that_ key", so what basis do I have for saying that "status fields shouldn't be read
from"?  In point of fact, SimKube is still reading from status fields to determine its behaviour: it looks up the state
of the underlying simulation driver (just a regular ol' Kubernetes Job) to determine the state of the simulation.
Should I not do that?  How else would I tell that the driver is running without looking at its state?

I think the _actual_ answer here is that you need to understand the properties or behaviour of the state that you rely
on.  For example, I "know" that a Kubernetes Job, once created, runs through the following states: `Pending` ->
`Running` -> `(Completed | Failed)`.  Once the Job hits the end, it never comes back, _and_ I know that if I query the
apiserver and find a Job, that it must be somewhere in that transition pipeline.  Based on those two bits of knowledge,
I can confidently say that if my Job is in a terminal state, there will be no other updates that move it out of that
state, so I can mark the simulation as "finished".  On the other hand, if the Job _exists_ but it isn't in a terminal
state, then I can mark the simulation as "running", because the Job is either running or it will be soon.  But the
Kubernetes API client will return an error if the Job couldn't be created, so I can be guaranteed to never end up in a
state where the Job object exists in etcd but has not actually been created.

I was initially a bit skeptical about Lindsey's monotonicity line of reasoning, but as I've been writing and thinking
about this more, maybe the _actual_ design pattern we need to encourage is "don't rely on non-monotone properties[^8]".
And, maybe (?????) members of the status field of objects have a tendency to be non-monotone?  I can't quite tell if I
believe that or not.

## Wrapping up

Anyways those are my current thoughts on Kubernetes controllers.  I _may_ do a follow-on post to this sometime in the
future if I come up with other patterns that I think are worth sharing?  But I'd also like to double-stress that I have
not written controllers on the level of, say, Istio, so it's entirely possible that I'm doing it all wrong.  I would
love to hear more thoughts about my approach, if you have any.  And if anybody _has_ written (or is planning to write)
_Effective Kubernetes Controllers_, please let me know!

Thanks for reading,

~drmorr

[^1]: I don't think this is earth-shattering news to anyone, there are tons of blog posts and KubeCon talks every year
    about writing Kubernetes controllers.

[^2]: I'm using "trivial" here in the sense of the famous Richard Feynman quip: "We decided that 'trivial' means
    'proved', so we joked with the mathematicians: We have a new theorem, that mathematicians can only prove trivial
    theorems, because every theorem that's proved is trivial."

[^3]: No offense.

[^4]: One way we can make it suck less is by improving the interface Kubernetes exposes to application developers; Jon
    Howard discussed his efforts towards this in [his KubeCon talk last November](2023-12-11-kubecon-recap-part-4.md).

[^5]: Of course, when I'm writing this in Rust I can just use a `match` statement on the state and it ends up looking
    relatively clean.

[^6]: Or at the very least, a premature optimization.

[^7]: Even this statement isn't entirely accurate, I'm using an ["observed generation" field](https://stackoverflow.com/questions/47100389/what-is-the-difference-between-a-resourceversion-and-a-generation)
    in the status to help limit the number of updates that my controller wakes up for.

[^8]: I also had an insight while I was writing this that, maybe monotonicity and idempotence are in some sense
    [dual](https://en.wikipedia.org/wiki/Duality_(mathematics)) to each other?  I'm curious to know if anybody has
    formalized this notion -- e.g., if an operation depends upon a monotone property, maybe you can prove that it is
    idempotent?  I dunno, I'll need to think about this more.
