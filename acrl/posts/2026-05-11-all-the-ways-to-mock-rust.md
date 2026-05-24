---
title: "All the ways to mock your Rust code"
authors:
  - drmorr
datetime: 2026-05-11 11:00:00
template: post.html
---

Ok, so, suppose you've written a Kubernetes controller, you did it in Rust[^1], and then you realized that "Hey, when
this thing breaks it's hard to understand what's going on"[^2].  So, you decide to emit some Kubernetes events that give
a little more context as to what your controller is doing and what steps it's taken.  You run all your tests[^3] and
expect them to all pass[^4], because you didn't change any functionality, you're just emitting some events, this is
basically just like adding some log lines, right?  And all the tests fail.  Because you're not just adding log lines,
you're making a network request to the Kubernetes apiserver, and in your unit tests there's no apiserver listening.
What do?????

OK so this post is not actually hypothetical, as you maybe figured out by now.  This is exactly what I tried to do with
[SimKube](https://simkube.dev) recently and I spent WAY TOO LONG trying to figure out the ABSOLUTE BEST way to do this
and still make all my tests pass.  This post also touches on a particular pet peeve of mine around programming
practices, which is namely: "DON'T MAKE ME MAKE MY PRODUCTION CODE WORSE JUST TO MAKE IT EASIER TO TEST, COMMA
JERK"[^5].  So I figured _somebody_ ought to benefit from all the time I wasted on this, so here it is: all the ways
to mock a network call in Rust.

## The setup

The [kube-rs](https://kube.rs/) Rust library provides a built-in interface for writing controllers; the main thing you
have to provide is a `reconcile` function which gets called whenever the controller needs to "do something".  The
signature for `reconcile` looks like this:

```rust
pub async fn reconcile<T: kube::Resource>(object: Arc<T>, global_ctx: Arc<GlobalContext>) -> Result<Action, Error>
```

The first argument is the Kubernetes object that changed, and the second argument is a user-defined "context" that
includes additional "stuff" that the reconciler needs to be able to operate successfully.  For this post we're concerned
with that context argument, which looks like this:

```rust
struct GlobalContext {
    client: kube::Client,
    recorder: SkEventRecorder,
}
```

The first field is the client we use to talk to the Kubernetes API server (we don't want to recreate that on every
reconcile for performance reasons).  The second field is our event recorder, and you don't want to recreate that on
every reconcile because it loses its memory of "what events I've already sent", so instead of nice aggregated events
("this event happened 57 times in the last 4 seconds"), you get 57 separate events in 4 seconds.

The event recorder struct is just a wrapper around `kube::runtime::events::Recorder` from the `kube-rs` library, which
includes a few helper functions for generating and sending the events.  This is a simplified version of the real thing:

```rust
use kube::runtime::events;

struct SkEventRecorder {
    recorder: events::Recorder,
}

impl SkEventRecorder {
    pub fn new() -> SkEventRecorder { /* initialize a new recorder */ }

    pub async fn send_event_A(&self) -> Result<(), Error> {
        let event_a = events::Event::new( /* make an event */ );
        Ok(self.recorder.publish(event_a).await?)
    }
    pub async fn send_event_B(&self) -> Result<(), Error> {
        let event_b = events::Event::new( /* make an event */ );
        Ok(self.recorder.publish(event_a).await?)
    }
}
```

And there you can see the network calls we're making: every `publish` sends the event off to the apiserver and waits for
a response.  How do we make this code testable?  Let me count the ways.

## Method 1: Boxed Trait

This first approach is the most common, and it uses [interfaces](https://en.wikipedia.org/wiki/Interface_(object-oriented_programming))
and [dependency injection](https://en.wikipedia.org/wiki/Dependency_injection) to provide a real event recorder in your
production code and a fake event recorder for your tests.  We're going to change our code to look like this:

```rust
#[async_trait]
pub trait EventRecordable {
    pub async fn send_event_A(&self) -> Result<(), Error>;
    pub async fn send_event_B(&self) -> Result<(), Error>;
}

struct SkEventRecorder {
    recorder: events::Recorder,
}

impl SkEventRecorder {
    pub fn new() -> SkEventRecorder { /* initialize a new recorder */ }
}

impl EventRecordable for SkEventRecorder {
    pub async fn send_event_A(&self) -> Result<(), Error> {
        let event_a = events::Event::new( /* make an event */ );
        Ok(self.recorder.publish(event_a).await?)
    }
    pub async fn send_event_B(&self) -> Result<(), Error> {
        let event_b = events::Event::new( /* make an event */ );
        Ok(self.recorder.publish(event_a).await?)
    }
}

struct GlobalContext {
    client: kube::Client,
    recorder: Arc<impl EventRecordable>,
}

```

This pattern is familiar to you if you've ever written any Go code; literally everything in Go implements an
interface simply because it's the _only way_ to make anything testable.  Given the above, you can then create a
`MockSkEventRecorder` object in your testing code that implements the `EventRecordable` trait[^6], and pass that in to
the `GlobalContext` object in your tests.

There is actually a slight simplification we can make to this code; the _only_ thing that needs to be mocked is the
recorder itself, we can use the same `send_event_X` methods for both implementations:

```rust
#[async_trait]
trait EventRecordable {
    async fn send_event(&self, event: &events::Event) -> Result<(), Error>;
}

struct EventRecorder {
    recorder: events::Recorder,
}

impl EventRecordable for EventRecorder {
    async fn send_event(&self, event: &events::Event) -> Result<(), Error> {
        Ok(self.recorder.publish(event_a).await?)
    }
}

struct SkEventRecorder {
    recorder: Arc<impl EventRecordable>,
}

impl SkEventRecorder {
    pub fn new() -> SkEventRecorder { /* initialize a new recorder */ }

    #[cfg(test)]
    pub fn new_with_mock() -> SkEventRecorder { /* initialize a new recorder with a mock sender */ }

    pub async fn send_event_A(&self) -> Result<(), Error> {
        let event_a = events::Event::new( /* make an event */ );
        Ok(self.recorder.send_event(event_a).await?)
    }
    pub async fn send_event_B(&self) -> Result<(), Error> {
        let event_b = events::Event::new( /* make an event */ );
        Ok(self.recorder.send_event(event_a).await?)
    }
}

struct GlobalContext {
    client: kube::Client,
    recorder: SkEventRecorder,
}
```

This second variant is _slightly_ nicer in that it reduces the number of abstractions that a dev reading the reconcile
function has to look at, but it's functionally equivalent to the first version.  This pattern is _deeply_ frustrating to
me for three reasons:

1. You have to use the `async_trait` crate, because you can't have `async` traits in standard Rust.  It's fine, the
   crate is fine, it works well, it's literally just an extra import and a proc macro annotation, but it annoys me that
   I have to use it.
2. I've now added a bunch of extra boilerplate in my code that isn't really necessary.  There's _no reason_ to use
   dependency injection here aside from making it easier to test.  Someone else who comes along to read the code has an
   additional layer of abstraction that they have to parse through to understand what's going on, and I'd like to have
   fewer abstraction layers, not more.
3. Most damning, this code now has a performance impact on what's running in production!  We have two pointer
   indirections where before we had zero: the Rust compiler doesn't know how big an `impl EventRecordable` is, so you
   _must_ create it on the heap, and because this is highly asynchronous code, you have to use an `Arc` instead of a
   `Box`, so now we have a pointer lookup _and_ a reference counter to care about.  Not only that, we're now using
   [dynamic dispatch](https://en.wikipedia.org/wiki/Dynamic_dispatch) (essentially a vtable, aka another pointer lookup)
   to figure out where the function definitions are for the event recorder.

Now maybe if you're writing Go code which already does a bunch of vaguely non-performant things, you don't care, but
this is Rust, dammit!  You're supposed to prematurely hyper-optimize everything!  Isn't there a better way?

## Method 2: Generics

We can address concern number 3 by converting from dynamic dispatch to [static dispatch](https://en.wikipedia.org/wiki/Static_dispatch),
which gets rid of the performance impact.  The way you do that in Rust is with generic type parameters, and it looks
like this:

```rust
#[async_trait]
pub trait EventRecordable {
    async fn send_event(&self, event: &events::Event) -> Result<(), Error>;
}

struct EventRecorder {
    recorder: events::Recorder,
}

impl EventRecordable for EventRecorder {
    async fn send_event(&self, event: &events::Event) -> Result<(), Error> {
        Ok(self.recorder.publish(event_a).await?)
    }
}

struct SkEventRecorder<T: EventRecordable> {
    recorder: T,
}

impl<T: EventRecordable> SkEventRecorder<T> {
    pub fn new() -> SkEventRecorder { /* initialize a new recorder */ }

    pub async fn send_event_A(&self) -> Result<(), Error> {
        let event_a = events::Event::new( /* make an event */ );
        Ok(self.recorder.send_event(event_a).await?)
    }
    pub async fn send_event_B(&self) -> Result<(), Error> {
        let event_b = events::Event::new( /* make an event */ );
        Ok(self.recorder.send_event(event_a).await?)
    }
}

struct GlobalContext<T: EventRecordable> {
    client: kube::Client,
    recorder: SkEventRecorder<T>,
}
```

This code has transformed a runtime cost into a compile-time cost, which is great!  The Rust compiler will
"monomorphize"[^7] this into the right thing when we build our binary or run the tests; no heap allocation, no vtable
lookup.  This is great!  The only problem?  This is ugly as $#&%.  That stupid template parameter has wormed its way all
the way up into my top-level `GlobalContext` struct!  Now someone who comes along to read this code has a _lot_ of stuff
they have to parse through to figure out what's going on.  This is unacceptable!  What else is there?

## Method 3: Compile-time feature flags (take 1)

You know what, this whole trait thing is pretty terrible, what if we just... didn't do that?

```rust
struct SkEventRecorder {
    recorder: events::Recorder,
}


impl SkEventRecorder {
    pub fn new() -> SkEventRecorder { /* initialize a new recorder */ }
}

#[cfg(not(test))]
impl SkEventRecorder {
    pub async fn send_event_A(&self) -> Result<(), Error> {
        let event_a = events::Event::new( /* make an event */ );
        Ok(self.recorder.publish(event_a).await?)
    }
    pub async fn send_event_B(&self) -> Result<(), Error> {
        let event_b = events::Event::new( /* make an event */ );
        Ok(self.recorder.publish(event_a).await?)
    }
}

#[cfg(test)]
impl SkEventRecorder {
    pub async fn send_event_A(&self) -> Result<(), Error> { Ok(()) }
    pub async fn send_event_B(&self) -> Result<(), Error> { Ok(()) }
}

struct GlobalContext {
    client: kube::Client,
    recorder: SkEventRecorder,
}
```

This is kinda cute.  We're using Rust compile-time directives to say "If you're running this under test, just always
return immediately, but if you're a real binary send an event"[^8].  There are two problems here: one is that if, at
some point in the future I decide I need more fine-grained tests for the event recorder, I can't without jumping through
a whole bunch'o hoops.  The second is that in the real code, the event recorder and the context are in different crates,
and the `test` configuration parameter doesn't get passed through to crate dependencies---which makes sense, but means I
now have to introduce a new feature into my code and juggle that in various `Cargo.toml`s.  Gross.

## Method 4: Compile-time feature flags (take 2)

We can actually combine the two approaches above, and get some godawful frankentrait code:

```rust
#[async_trait]
pub trait EventRecordable {
    async fn send_event(&self, event: &events::Event) -> Result<(), Error>;
}

struct EventRecorder {
    recorder: events::Recorder,
}

impl EventRecordable for EventRecorder {
    async fn send_event(&self, event: &events::Event) -> Result<(), Error> {
        Ok(self.recorder.publish(event_a).await?)
    }
}

struct SkEventRecorder {
    #[cfg(not(test))]
    recorder: EventRecorder,

    #[cfg(test)]
    recorder: MockEventRecorder
}

impl SkEventRecorder {
    pub fn new() -> SkEventRecorder { /* initialize a new recorder */ }

    pub async fn send_event_A(&self) -> Result<(), Error> {
        let event_a = events::Event::new( /* make an event */ );
        Ok(self.recorder.send_event(event_a).await?)
    }
    pub async fn send_event_B(&self) -> Result<(), Error> {
        let event_b = events::Event::new( /* make an event */ );
        Ok(self.recorder.send_event(event_a).await?)
    }
}

struct GlobalContext {
    client: kube::Client,
    recorder: SkEventRecorder,
}
```

This has all the drawbacks of approach 3, with the added benefit that it looks really really dumb.

## Method 5: The actor framework

Ok, so this is all dumb and frustrating, let's take a step back and figure out what we're actually trying to do
here[^9].  We want to: a) send events, b) over a network, c) and test it.  Maybe the problem is that we haven't made
our code convoluted _enough_!

I'm not going to write it all out here, but the other "standard" approach to solving this problem is using something
called the [actor model](https://en.wikipedia.org/wiki/Actor_model).  The basic idea is that the bits of code in your
program are "actors" and the only way that actors can communicate with each other is by sending messages, typically over
some type of queue.  So, in this model, we would re-write our reconcile function to just submit events to a queue, and
then we would have some other bit of code on the other end that is asynchronously listening to that queue, and
forwarding those events along to the Kubernetes apiserver over the network connection, which you can imagine is just
another type of queue[^10].

And actually, the actor pattern is a pretty good one!  It has a lot of use cases, especially for more complicated
interactions, but remember: we're just trying to write some fancy log lines here!  Come on, what are we even doing, I'm
not spinning up a whole queue and separate async reconcile loop to handle the log lines from my primary reconcile loop.
This is insanity!

## Method 6: Fake the apiserver

Ok, the core problem that we're running into here is that _all_ of these approaches require changing your production
code from something simple and straightforward ("do a thing, record that you did the thing, do the next thing") into an
unholy abomination just to make it easier to test.  What if we just... didn't do any of that?  Instead, we could leave
our code the same and just spin up a fake Kubernetes apiserver in our test harness to listen and respond to events.
Then we can test real interactions with a real apiserver, with only the very tiny problem that we've now had to create
an entire Kubernetes apiserver so that our unit tests pass, _and_ we've introduced a network call into our tests, and
networks are famously incredibly robust and never drop packets and absolutely will not create flaky tests all
willy-nilly, nosiree.

## Method 7: There is no method 7

So that's it!  That's all the ways I know of to mock out your Rust code for the purposes of testing.  None of them are
satisfying.  All of them feel gross in various ways.  And yet, I don't think there's a better way to do it?  The problem
with statically-typed, compiled languages like Rust (and to a lesser extent, Go), is that you have to tell the compiler
that you have a Real Type that is going to do Real Type Things at compile time, and the unfortunately reality is that
makes testing harder[^11].

What approach did I end up taking?  Well, after venting about all this for a while to Claude, the robot finally told
me: "What are you doing, you dumbass[^12]?  The cost of a network request is orders of magnitude higher than the cost of
a couple of pointer lookups.  Just stick it in an `Arc` and call it a day."

So that's [what I did](https://github.com/acrlabs/simkube/pull/237).  I'm kindof lowkey upset that the stochastic labubu
was right about this, but, well, I guess we can't win them all.

Anyways, thanks for reading!  Tune in next time for more SimKube stuff.

~drmorr

[^1]: Naturally.

[^2]: Purely hypothetically speaking, of course.  I would never write a broken Kubernetes controller.

[^3]: Because you do have tests, right?  No madlad would write a Kubernetes controller without tests.

[^4]: This is how you _know_ this scenario is completely unrealistic, nobody ever expects all their tests to pass.

[^5]: See also: the Python debugger.  Boy howdy does it really grind my gears every time I have to add an `import pdb;
    pdb.set_trace()` line to my Python code.  Just let me start the debugger from the command line FFS!

[^6]: Or you can use the [mockall](https://docs.rs/mockall/latest/mockall/) crate which does this for you automagically.

[^7]: This has a precise definition but for all intents and purposes it means "vomit out a bunch of generated code for
    each type `T` that gets passed in".

[^8]: The aforementioned [mockall](https://docs.rs/mockall/latest/mockall/) crate actually will do this for you as well,
    and also give you a mock struct that lets you perform some assertions on it, but it's... not super ergonomic to use.

[^9]: "What Problem Are You Solving?, or, as my friend likes to remind me with a really silly acronym, "WPAYS?"

[^10]: A real "Yo dawg, I heard you like queues" moment here.

[^11]: When I was venting to my WPAYS friend about this, he replied, extremely condescendingly, "Tell me you do a ton of
    dynamic programming without telling me what language you use", and OK fair, this problem is much easier to solve in
    Python.  I can own that.

[^12]: Verbatim quote.
