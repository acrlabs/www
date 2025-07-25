---
title: "Contraction Hierarchies: HMC Clinic Project Recap"
authors:
  - drmorr
datetime: 2025-07-28 11:00:00
template: post.html
---

<figure markdown>
  ![The ACRL logo with the A and L in white and the C and R in Harvey Mudd gold](/img/posts/acrl-hmc.jpg)
</figure>

Whale hello there!  It's been quite a while since I've posted; the summer months have been busy for me, both with
vacations and travel, as well as wrapping up some work projects, so I've been quite limited on writing time.  The next
several weeks are opening up for me, though, so I'm planning to be back on track (and maybe write a couple extra posts)
in August and September.

All that's to say, I've been sitting on this post for a while, and I'm really excited about it!  Today I'm going to
recap my experience working with a bunch of undergrads on SimKube through the [Harvey Mudd College Clinic Program](https://www.hmc.edu/clinic/).
If you're not familiar, all HMC students are required to participate in a capstone project in their senior year, and
clinic is one option for fulfilling this requirement[^1].  The general structure for clinic is "4 to 6 students,
together with a faculty advisor, work with a company for the year on a relatively-well-scoped project that is beneficial
to the company in some way".  I was very fortunate last year to have a third party cover the clinic fees for me, which
meant that I got access to some extremely smart and motivated students to do SimKube work for me for the year!

I had a really great experience with the team, and in this post, I'm going to describe the project, the solution that
the students came up with, and do a quick retrospective on "what went well and "what I can do better next time." So
let's dive in!

## The problem: SimKube data generation

One of the big challenges with [SimKube](https://simkube.dev) (and simulation in general) is that you need _something_
to simulate.  In other words, it's not enough to just have a simulation environment, you have to have input data that
tells the simulator how to behave.  For SimKube, right now, the only way[^2] you can get that data is by collecting a
trace from some "real" Kubernetes environment.  This is definitely useful in a lot of settings, but there are two
problems: one is that it's really hard to study "what-if" type scenarios (e.g., "What if our traffic increases by 10x
tomorrow?").  The other is that companies are (understandably) very reticent to share any of data about their production
environments[^3], which makes it challenging to do wide-scale studies on Kubernetes.  So we'd really like some way to
generate synthetic Kubernetes trace data that is in some way "realistic" or "representative of reality".

Back in August of last year, I'd had the insight that we can [represent the Kubernetes state space as a
graph](2024-08-26-kubernetes-graph.md); on one hand, this is kindof a trivial observation, and it was not really clear
to me at the time whether this was a useful way to think about things.  On the other hand, there are a _lot_ of things
you can do once you model a problem as a graph, and (as far as I'm aware) nobody's tried to do any of them with
Kubernetes.  So the specific problem I tasked my clinic team with was, "Can we use a graph theoretic model of the
Kubernetes state space to aid in data generation for SimKube?"

The answer, I think, is a resounding "yes!"  While there's still a lot of work to be done here, last year's team laid a
really solid foundation using an approach called contraction hierarchies, and they built a proof-of-concept called
`sk-gen` using contraction hierarchies to generate synthetic SimKube traces.

## The never-ending question: What does realistic mean?

Before I talk about contraction hierarchies themselves, we need to understand what problem they're solving.  The single
hardest part of the entire project, and a question that came up over and over in our weekly meetings, was "What does
'realistic' mean for Kubernetes?"  The Kubernetes state space is _massive_, and even after we'd scoped the problem down
to a somewhat-manageable set of actions, the size of the problem is overwhelming.  It's not sufficient to just throw a
random number generator at it and call it a day; it's not even clear what distribution events in the state space have,
but it's probably not normal.  And as I mentioned earlier, most companies or organizations aren't really willing to
share (even obfuscated) data on their production Kubernetes clusters, so we couldn't get much data to analyze.

There are a few exceptions to that statement: some of the big cloud providers (Google, Azure, and Alibaba, specifically)
_have_ been sharing data around their cluster operations for many years.  However: none of that data is in a standard or
easily-consumable format; the data is not even necessarily for Kubernetes specifically[^4]; and, as identified by a
paper called [Bigger, Longer, Fewer: What do cluster jobs look like outside of Google?](https://www.pdl.cmu.edu/PDL-FTP/CloudComputing/CMU-PDL-17-104.pdf),
the data shared by these companies is almost certainly not representative of the usage patterns at a smaller
organization.

So what can we do?  We want to generate data, but we don't have any sample data and we don't know how to get any.  The
answer that the clinic team came up with is, "let's just assume that we have some data, and let's try to generate more
traces that 'look like' that data".

I think this is a brilliant approach: there are a lot of similarities between different companies and how they operate
their infrastructure, but I think it's highly unlikely that there is some Platonic "Single Representative Kubernetes
Trace File ™️".  Every organization is going to have slightly different traffic patterns, platforms, risk tolerances, and
goals, that are going to subtly influence how their infrastructure runs.  This shift in thinking lets us redefine the
problem from "generate synthetic Kubernetes trace data for _everybody_" to "generate synthetic Kubernetes trace data
that is specific to _your organization's needs_".

Again, I can't emphasize enough how brilliant this is: not only does it nicely sidestep the problem of "we don't have
any data", but it makes for a really compelling sales story for ACRL and/or SimKube: when we come into your
organization, we 1) collect a small set of sample trace data from your existing clusters and infrastructure, and then 2)
use our magic secret sauce to bootstrap that into an enormous amount of data that is nevertheless representative of your
existing traffic patterns and infrastructure. You can then use that synthetic data to reason about cost, reliability, or
even train AI models to troubleshoot or operate your Kubernetes clusters[^5].

## Contraction hierarchies: the magic secret sauce

Now that we've redefined the problem from "generate synthetic trace data" to "use a small kernel of existing trace
data to bootstrap a large amount of synthetic data", we can talk about contraction hierarchies.  The key observation
that the team had was that, while the Kubernetes state space is truly massive, "most of the time"[^6] there are a
comparatively small number of "common"[^7] states that are inhabited by a trace.  In other words, if you look at something
like _replica count_ for a [Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/), cluster
operators might constrain the deployment to stay between 5 and 100 replicas, but each value between 5 and 100 is not
equally likely to appear in a trace.  The min and max constraint values may be significantly more likely to appear, or
it's also possible that the deployment organically stays in some small window (say, 50-60 replicas) near the middle of
the range.

Thus, the solution approach that the team identified is as follows: given a small number of "input traces", we can do
some data analysis on the states of those traces to identify a small set of "common" or "more important" nodes, and then
we can use those nodes to create a sparse representation of the Kubernetes state graph.  Once we have that sparse
representation, we can do random walks on the graph to generate synthetic traces that bias towards common states
observed in the infrastructure.

The only question that remains is, "how do we do that sparsification step?"  And the answer is "[contraction
hierarchies](https://en.wikipedia.org/wiki/Contraction_hierarchies)".  Contraction hierarchies are a tool that you
probably interact with every single day, even if you don't realize it: they are the foundation of navigation in your GPS
maps application of choice.  The idea is that, given some large graph, we rank the nodes in the graph based on some
notion of importance.  Then we take an arbitrary threshold, and contract away the nodes that fall below that threshold
in an edge-weight-preserving manner.

The intuition here is: if you're driving from Los Angeles to New York City, you don't care about every single freeway
exit and all the tiny side roads between here and there, you (mostly) only care about the details at the start and end
of your journey.  So we [contract](https://en.wikipedia.org/wiki/Edge_contraction) all of the in-between nodes away, and
just pretend like there's one really long freeway that goes all the way across the country.  Then we can compute the
shortest path in that contracted graph, and it's way less computationally expensive than computing the shortest path in
the "complete road network of the entire continental United States."

A similar intuition applies for Kubernetes: if you're trying to figure out how to get from one state in the Kubernetes
graph to another, you don't _really_ care about all the intermediate candidate states that would never appear in
reality; so we contract those away to get a smaller graph.  The nice thing about contraction hierarchies is that you can
preserve edge weights with them; in a road network, the edge weights are something like "distance" or "time"; in this
setting, the edge weights are probabilities---once you have your contracted graph, you can use the edge weights to
construct your random walks, and thus your trace data.

## I have no idea what you just said

Oof, that last section was a lot, huh?  No worries; if you want to see more details, you can read the full clinic report
[here](/reports/ACRL_Final_Clinic_Report.pdf).  In this last section, I'm going to do a brief retrospective on what went
well with the project, and what I'd do differently next time.

One of the chief concerns that my informal board of directors raised when I was considering participating in clinic was
that it would be a distraction and take time away from my core business, which (especially last year) was not nearly as
well established as it is now[^8].  I'm happy to say that I don't think this was the case; the project mostly took up an
hour or two of my time per week, and it resulted in a [NIST SBIR](https://www.nist.gov/tpo/small-business-innovation-research-program-sbir)
 grant proposal, which would not have been written without the work the clinic team did.  Even though the grant proposal
didn't get funded, I view this as a positive return on investment for my time and energy, and I will definitely be
submitting a proposal again next year.

Aside from that, I think participating in clinic had two other benefits: first, I really care about mentoring more
junior folks and helping them get their feet under them in this industry, and as far as I can tell based on the feedback
that I received, this was a resounding success.  I had a great team, and they did great work, and I think they're going
to do even more great work in the future.  Secondly, participating in clinic helps establish ACRL's "academic street
cred", so to speak---I've always wanted this business to act as a bridge between academia and industry, and now I've
shown that I can work and be successful both with academic partners as well as for-profit companies in industry.

I think the hardest part of the project was how open-ended it was; this was, in large part, intentional on my part.  I
didn't _know_ where it was going to end up when we started out---I'd never even heard of contraction hierarchies
before!---and so it was hard to always provide concrete direction to the team.  While I think the experience of "we have
no idea what we're doing" is a really valuable one to have, and is a huge part of, you know, actually doing research, I
think I could have done more to provide more "ancillary" structure.  So that's something I'm thinking about how to
improve in the future.

The other challenging part of the project was just bootstrapping the team with enough knowledge to be able to
meaningfully contribute: there are no undergraduate classes on Kubernetes at Mudd; there are no undergraduate classes in
Rust or Go; there aren't even classes that use or interact with Docker in any structured way! So (what I view as) simple
tasks, like "write a Dockerfile for this application" took up a significant amount of the team's time. I don't think
there's any way around this: this stuff is hard, yo, and sometimes you just have to put in the time to build up
familiarity.

So anyways, that was my experience as a first-time HMC clinic liaison!  If you want to learn more, you can [read the
report](/reports/ACRL_Final_Clinic_Report.pdf) or [look at the `sk-gen` source code](https://github.com/acrlabs/sk-gen).  I
really loved getting to work with the team and also support my alma mater, and I'm already in conversations for another
project next year!  But that will have to be another blog post, this one's already too long.

As always, thanks for reading.

~drmorr

[^1]: The other option, which I did while I was there, is a thesis project.  Typically "clinic" is more targeted towards
    folks wanting to go into industry, and "thesis" is more targeted for folks wanting to do research/go to grad school,
    but that's not always the case.  There are clinic projects that are more open-ended and research focused (like the
    one you're going to read about here), and vice versa.

[^2]: I mean, OK, technically you _could_ construct some trace file by hand, but the process is tedious and
    labor-intensive; see [Anatomy of a Trace File](2025-06-09-anatomy-of-a-trace.md) to understand why.

[^3]: There are some things we can do with SimKube to obfuscate data to minimize the risk here, but it's still an uphill
    conversation with a bunch of lawyers.

[^4]: Google, of course, is running [Borg](https://en.wikipedia.org/wiki/Borg_(cluster_manager)) internally, which is
    similar to, but not identical to Kubernetes.

[^5]: I hope it goes without saying that nobody should be letting an AI agent with write access anywhere near their
    production Kubernetes clusters in 2025 unless you enjoy the feelings of sheer terror that come with [having
    everything deleted including your backups](https://gizmodo.com/replits-ai-agent-wipes-companys-codebase-during-vibecoding-session-2000633176).

[^6]: The air quotes are doing a lot of heavy lifting here.

[^7]: Ditto.

[^8]: And even now, I don't have, like 300 years of runway or whatever.
