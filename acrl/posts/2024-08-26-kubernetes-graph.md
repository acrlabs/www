---
title: Exploring the Kubernetes Graph
authors:
  - drmorr
datetime: 2024-08-26 11:00:00
template: post.html
---

<figure markdown>
  ![]()
  <figcaption>
  </figcaption>
</figure>

OK, I've been promising a post about graph theory for a little while, and a whole bunch of my paying subscribers just
re-upped their subscriptions, so maybe I should actually follow through on one of my promises or... something.

I'm particularly excited about this post because the topic is the foundation for a [clinic
project](https://www.hmc.edu/clinic/) that ACRL is sponsoring this year at my alma mater, Harvey Mudd College!  I'm
convinced this is going to be a really great opportunity for ACRL: I get to demonstrate my ability to work with academic
institutions, I get to help mentor a bunch of undergrads, _and_ the work that we're doing as a part of the clinic has
the potential to be really beneficial for [SimKube](https://github.com/acrlabs/simkube).  It's a win all around!

## The problem: data generation

Ok, so.  I've built this thing, you might have heard of it, it's called SimKube[^1].  It's designed to help you simulate
changes to your Kubernetes cluster cheaply and efficiently, and I think it's really cool[^2].  The problem is, how do
you get data to simulate?  It's very daunting to just start with a blank slate, and be like "we can simulate the
world!"  How do you know what's valuable to simulate or not?

One answer, which SimKube currently supports, is "simulate your existing cluster".  In other words, you can run the
`sk-tracer` component on your production cluster, and at any point use that to capture a _trace_ (that is, a timeline of
"important" events or changes in the cluster) which you can then replay as many times as you want in your simulated
environment.  Having these traces is valuable for a couple of reasons: firstly, you can use them for _post facto_
analysis of incidents.  If something breaks in your cluster, the idea is that you capture a trace of the incident time
period, and then use that in simulation both to root cause the outage as well as verify your proposed remediation.
Secondly, you can capture traces of your cluster during "normal" operation, and use these to do regression testing or
feature testing: in other words, whenever you make changes to your infrastructure platform, run them through a
simulation to ensure that nothing breaks.

Both of these capabilities are _really_ powerful, but I want to go further with SimKube.  I don't want to just be able
to simulate things that have happened in the past, I want to be able to simulate and hypothesize about things that
_might_ happen in the future.  And in order to do that, we need a way to generate fake data.  The problem is, you can't
just generate any old fake data.  You need fake data that represents reality in some meaningful capacity, but generating
this data is non-trivial[^3].

There's lots of research in this space, both in general and with respect to orchestration platforms like Kubernetes
specifically.  The most naïve thing you can do (which understandably doesn't work very well) is just to throw a random
number generator at the problem.  The second most naïve thing you can do is throw a [Poisson distribution](https://en.wikipedia.org/wiki/Poisson_distribution)
at the problem[^4].  Unfortunately, [some research](https://www.pdl.cmu.edu/PDL-FTP/CloudComputing/CMU-PDL-17-104.pdf)
indicates that this is not how distributed systems like Kubernetes work---namely, events in a Kubernetes cluster tend to
form clusters, with a bunch of changes happening all at the same time, followed by relative periods of inactivity.

Even beyond the question of "when do events occur", there's the even harder question of "what do events look like?",
which is the problem I'm hoping to solve through this clinic project.  Again, just throwing a random number generator at
the problem is unlikely to work well: it's extremely unlikely, for example, that a Kubernetes deployment will start with
1 pod, then scale to 10,324 pods, then scale back down to 437 pods, then scale up to 2033 pods, and etc.  In other
words, the relation between events is not independent, and it's possible that the events don't even follow identical
distributions[^5]!  We are going to need to put more structure on this problem.

## Adding some structure with a graph

I was discussing this problem a few months ago with a group of people, and one of them mentioned [graph coloring](https://en.wikipedia.org/wiki/Graph_coloring),
and I had a light-bulb moment: you can (hypothetically) model the entire Kubernetes state space as a giant graph.  Each
node in the graph consists of a giant pile of YAML[^6], and edges between the nodes represent transitions or changes to
the giant piles of YAML.  This graph is _technically_ finite[^7], in that there can't be an infinite number of computers
in the world to run an infinite number of pods, but the graph is very, very large.  But!  It's a graph, nevertheless,
and we know how to do things on graphs.

For example, apropos of nothing at all: you can model a simulation trace as a [walk](https://en.wikipedia.org/wiki/Path_(graph_theory))
through this graph.  Throw some probabilities on the edges and you've got yourself a [Markov chain](https://en.wikipedia.org/wiki/Markov_chain).

So there's a few big questions here: to start off with, what does the structure of the Kubernetes graph even _look
like_?  It's kindof unclear, to be honest.  There are obviously edges that can't happen: for example, you can't change
the `spec.selector` field of an existing Deployment---it is [immutable](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#label-selector-updates).
So, you can't have an edge in the graph where a Deployment's selector changes; instead, you'd have to have a path where
the old Deployment is removed, and the new Deployment is created.  Here's another question that's unclear to me: is the
Kubernetes graph bi-directional?  In other words, are there any non-reversible operations in Kubernetes?  I sortof
suspect that there are, but it's not immediately clear to me what those operations might be---I'd have to sit down and
read the Kubernetes API very closely, and probably run some experiments.

But OK, cool, now we've got a graph!  Well, actually, no we don't, we still have to answer a bunch of questions about
the underlying infrastructure.  For example: a state transition (or even an individual node) may or may not be valid
depending on the underlying Kubernetes configuration.  Have you enabled some alpha feature on the Kubernetes apiserver?
Then you'll have different valid graph nodes than an equivalent Kubernetes installation without that feature enabled.
Should the graph include not just a giant pile of YAML but also the underlying Kubernetes configuration?  Or should we
create different graphs for each possible configuration?

What about cloud providers?  It is technically possible to scale a Deployment from 1 replica to 1 billion replicas, but
good luck finding a cloud provider that can provide you a billion machines to run those billion replicas.  Do we need to
take cloud provider availability into account when defining our graph?  What about temporal concerns?  You could
probably scale that Deployment from 1 replica to 5000 replicas, and your cloud provider could _probably_ get you 5,000
machines---_eventually_.  Does that mean that the 1->5000 edge is a valid or invalid edge?  Who knows!  You could
probably make a convincing argument either way.

But OK.  Let's assume we've made a bunch of assumptions, and now we have a graph.  What can we do with it?  Can we use
it to help use generate traces?  You could start looking at random walks on the graph, assuming you can come up with a
good way to set transition probabilities.  You could start looking at shortest/longest paths: for example, we start in
state A, we want to end in state B, can we generate a set of paths that get us from one state to the next?  Maybe
there's some kind of [min-cost/max-flow](https://en.wikipedia.org/wiki/Max-flow_min-cut_theorem) approach we can take.
Maybe there is something we can do with graph coloring!

If it feels like I'm just throwing out a bunch of math-y buzzwords with no real substance behind them, it's because I
kindof am[^8].  I don't know (and haven't spent enough time thinking about) any of these ideas to know if there's anything
valid to them; that's part of what I'm hoping my clinic team can do for me.  It might turn out that there's nothing
here, but what I _do_ know is that this is a different way of looking at the problem, and I'm always a big fan of
looking at things differently.

## The closure

Ha ha that was a funny pun in that heading, everyone appreciate my wit and humour.

Anyways, as is typical for this blog, I wrote a couple thousand words asking a bunch of questions and providing no real
answers to any of them.  Unlike some of my other posts, however, I've got a team of people who are going to try to
answer some of them over the next nine months or so!  Maybe by this time next year, I'll have made my first ever "I
asked a bunch of questions and then I answered them" post!  You'll just have to keep reading to find out.  And whatever
happens, I'm glad you're along for the ride.

Thanks for reading,

~drmorr

[^1]: By the way, I have an _in-depth_ article coming up very soon comparing Kubernetes Cluster Autoscaler and Karpenter
    using SimKube.  It's going to be great!  Keep your eyes open.

[^2]: By the way, I have an _in-depth_ article coming up very soon discussing why simulation is so important for
    infrastructure engineers.  It's going to be great!  Keep your eyes open.

[^3]: I'm using the phrase _non-trivial_ in the mathematical sense of the term, that is, "it's a hard problem that I
    don't know how to solve."  This is in contrast to the term _trivial_, which approximately means "it's a hard problem
    that I solved after several months of work, but I don't feel like showing my work."

[^4]: In a lot of scheduling and queuing theory, a generally "safe" assumption is that new events arrive according to a
    Poisson distribution---that is, the time interval between new events has a constant average rate, which is
    independent of the arrival times of previous or future events.  You can think of the Poisson distribution as the
    equivalent of the normal distribution for scheduling problems.

[^5]: For the statistics-minded among you, you might recognize this as the [IID](https://en.wikipedia.org/wiki/Independent_and_identically_distributed_random_variables)
    condition, which is a common assumption when doing probabilistic modeling, because when things aren't IID they're
    _much_ harder to reason about.

[^6]: [Artist's rendition of a giant pile of YAML](https://em-content.zobj.net/source/apple/391/pile-of-poo_1f4a9.png)

[^7]: [You are technically finite.  The best kind of finite.](https://i.kym-cdn.com/photos/images/original/000/909/991/48c.jpg)

[^8]: I know, I know, you're all [completely shocked](https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmtpeWY1dDJrNDR1NHhkaWJ6bzR3YnA0MW00MXVmdnMzbXlyYnh0ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3kzJvEciJa94SMW3hN/giphy.gif)
    that I'm posting a bunch of unfounded speculation on my blog.  I'm very sorry, I'll try to do better next time.
