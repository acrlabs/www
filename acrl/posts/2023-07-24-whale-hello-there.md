---
title: Whale Hello There!
authors: 
  - drmorr
datetime: 2023-07-24 11:00:00
template: post.html
---

Hi, and welcome to the Applied Computing Research Labs (ACRL) blog! We are a small business doing open-source research
and development in distributed systems and large-scale computer infrastructure. ACRL was founded in 2023 by David R.
Morrison, an award-winning PhD researcher in computer science who also has over a decade of industry experience. In this
post, we’ll give a high-level overview of what ACRL we’re trying to do and what we stand for; in future posts in this
space, we’ll dive into more of the specifics!

## What’s this all about, anyways?

Applied Computing Research Labs was founded with two goals in mind: 1) do practical, industry-leading research to solve
some of the most challenging problems that companies face in deploying and maintaining their infrastructure, and 2) to
do so in a transparent, “open-source” manner. We believe that information, knowledge, and research belong to everyone –
so, when we write code, it appears on our GitHub organization. When we publish papers, we make them open-access. When we
do work, we write about it on our blog (you’re reading it!) and talk about it at conferences.

Actually, we have a third goal as well: to demonstrate that it is possible and achievable to be successful doing this
type of open-source research as an independent organization. Most of the top research in the field takes place at
leading academic institutions, or at companies like Google, Meta, or Microsoft, which are large enough to fund and
support “pure” research efforts. However, there is a growing group of individuals and independent organizations showing
a third way for researchers and practitioners to engage with their passion. Our goal at ACRL is to join this growing
community, and to become one of the most prestigious independent research institutions in the world.

## That’s very lofty and idealistic. What is it you actually do?

Our main focus right now is around scheduling and efficiency in large-scale distributed systems, particularly (for now)
in Kubernetes. In our experience, this is one of the most challenging areas for organizations to invest in, not only in
industry, but also in academia. Companies usually just want their infrastructure to run and be stable. They don’t often
have the wherewithal to invest in longer-term research about their infrastructure, particularly for riskier projects. On
the flip side, academic institutions don’t have access to the same kinds of resources that tech companies do, so
performing any type of research in large-scale computing can be prohibitively expensive.

However, this type of large-scale computing research has the potential to be extremely lucrative for companies; cloud
computing costs are often a company’s biggest expenditure after its workforce, so if we are able to improve efficiency
by even 1%, that can represent millions of dollars in recouped costs for a business. Moreover, the types of problems
that present themselves in this space represents one of the most exciting fields of research in computer science right
now—so at ACRL, we have a unique opportunity right now to bridge the gap between industry and academia. However, there’s
a lot of work to be done before we can get there. Below we’ll outline a few of the projects we’re pursuing in this
space.

### Step 1: Build better tools for simulation and analysis

Organizations want to be data-driven. Often “being data-driven” is an explicit part of a team’s mission statement.
However, when you’re dealing with large-scale systems, being data-driven is quite hard. There are lots of emergent
behaviours that only appear when you run a system at scale, and which are very hard to reason about. Sometimes these
emergent behaviours are due to bugs in the system, and sometimes they are just natural (but unexpected) results of
interactions between the different components. Whatever the cause, they can end up costing a company huge amounts of
money, or worse, result in significant downtime.

The answer to these problems is simulation. If you can make a change to your scheduler code, test it at scale on
real-world data inexpensively, and collect the data for analysis before deploying the change, you can potentially save
money and prevent downtime. The problem is that simulation is hard. Orchestration software for distributed systems (like
Kubernetes) moves at a break-neck pace, and there are not enough publicly-available benchmarks to ensure that changes to
scheduling parameters behave as expected. Moreover, most of the tools for data collection and analysis are focused on
real-time metrics and observability—an important space, to be sure, but a different problem than post-facto reproducible
analysis of a simulation experiment.

Therefore, at ACRL, we are building an open-source simulator for scheduing and autoscaling of large Kubernetes clusters,
along with easy-to-use public benchmarks, and tools for creating your own benchmarks as well as easily analyzing the
results of these simulations. We’ll have more to say about this in a future post.

### Step 2: Reduce the layers of abstraction

Modern systems such as Kubernetes have many abstraction layers and control loops that attempt to reconcile the current
state of the world with some desired future state. These small, independent control loops allow the system to scale, and
are each independently easy to reason about. However, the interactions between these control loops are non-trivial to
understand, and may result in local maxima that are difficult to escape from. So what if we got rid of some of the
layers?

The tricky bit here is knowing which layers to get rid of. Our hypothesis is that a natural first layer to remove is
that between the scheduler and the autoscaler(s). In Kubernetes, for example, these span four (4!) different components:
kube-scheduler, cluster autoscaler, the horizontal pod autoscaler, and the vertical pod autoscaler. That’s a lot of
potential for unexpected, emergent behaviour. Moreover, there’s even a hint that these layers are unnecessary, since
cluster autoscaler actually imports a significant fraction of the kube-scheduler code as a library.

We can hear the objections now. “You’re building yet another Kubernetes scheduler? Aren’t there enough of those already?
Doesn’t the default scheduler work well-enough for most people?” Our answer at ACRL is “Yes… but also, no.” The
Kubernetes scheduler does actually work pretty well, but we’ve also seen enough companies struggle with scheduling to
think that we can do better. But again, more on this in a future post.

### Step 3: Rethink Kubernetes from the ground up

Kubernetes is the outcome of the absolute best of our industry’s collective engineering design and abilities, and it’s
taken the industry by storm. No longer is large-scale distributed computing just the domain of FAANG companies, but
small startups, governments, and completely unrelated industries are deploying their technology stack on top of
Kubernetes. The benefits that it provides are, frankly, astonishing. But, can we do better?

The problem is that Kubernetes has required everybody to become an infrastructure engineer, to some degree. An entire
cottage industry has sprung up to make it easier to manage your distributed service-oriented architecture, and engineers
joke that they no longer write code, they just write YAML. What if we could automate all that away? What if we could
make it so that developers just had to care about writing code, and didn’t have to worry about the infrastructure that
code ran on? There’s a long road to get here, however, and a lot of hard problems to solve between now and then. So
we’ll, once again, save more discussion on this topic for a future post.

## And you’re going to get paid for all of this?

We hope so! The typical path for companies working in this space is to “do a startup” – look for investors, get some
seed funding, try to scale, get big fast. But ACRL isn’t a typical company, and we’re not going the startup route. We
think that the problems we want to solve are better supported through different funding models.

So, how are we going to get paid? Well, since our main “output” is research and development, our main source of funding
is going to be through research grants. There are a number of grants coming up in the next few months sponsored by the
federal government that we’re going to be applying for, and there are a number of private foundations that will also
sometimes provide funding for open-source developers. So, in the happiest path, one or more of those grant opportunities
will come through and give us the necessary capital to keep going.

Secondly, we’re going to be looking at providing services to small-to-medium size companies regarding their Kubernetes
and distributed computing infrastructure. We’ve spent a bunch of time doing this kind of work at “real” companies (Yelp
and Airbnb), and we bring a lot of industry experience and expertise to the table that we think smaller companies can
also benefit from. So, if you represent one of these entities that needs some assistance, we’d love to help! Fill out
our contact form to get in touch.

Our third funding source is this blog. We’ve included a paid subscription option, and if you believe in supporting
open-source development or independent academic research, subscribing is one way you can demonstrate that support! If
you subscribe, you don’t get anything special; we don’t believe in paywalls here. All the content on here will be
publicly available, and all the work we do will be released with an appropriate open-source license. The posts published
on this blog will be released to paid subscribers on Fridays, and will be made available to everyone the following
Monday. We’re doing this to be very clear—by subscribing, you’re supporting our work, not getting access to anything.
And, if you don’t want to (or can’t) subscribe right now, no worries! We understand :)

## So what’s next?

Well, for one thing, we’ll keep publishing here and elsewhere. Our goal is to release one post a week, covering a
variety of topics: work we’re doing, updates on the “business” side of things, news of interest in the industry, witty
and incisive commentary on the state of the world—basically whatever we feel like. We’ll also be making an appearance at
various conferences—we’ve already booked tickets for KubeCon NA 2023 (see you in Chicago!)

We’ll also be continuing to set up the business. There’s still a bunch of logistics that we need to take care of, and
I’ll probably write a post about “What’s it like to start a small business” in a few weeks.

Lastly, we’re going to be laying the groundwork for some of our foundational projects. We’ve already got some code up on
our GitHub page which hopefully is already useful to some folks, and we’ll continue to put code up there and include
some more documentation as well.

Anyhow, that’s all for now! If you have any questions or comments, let us know below, we’d love to hear from you! And we
can’t wait to see where this new, exciting journey takes us.

Thanks for reading,

~drmorr
