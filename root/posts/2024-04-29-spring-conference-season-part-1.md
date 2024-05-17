---
title: "Spring Conference Season, Part 1: KubeCon EU"
authors:
  - drmorr
datetime: 2024-04-29 11:00:00
template: post.html
---

Hello, all!  You might've noticed it's been pretty quiet around here recently.  The last few weeks I've been a) busy
with some client work, b) working on getting my first "real" simulations going with SimKube, and c) hitting the
conference circuit again.  So I could say I haven't had much time to write, but I think the main reason I haven't posted
anything is that I haven't felt like I had anything interesting to say, and I don't want to just throw out meaningless
fluff articles just for the sake of running a blog[^1].

However, it's spring conference season, and I want to spend a couple weeks talking about some of the most interesting
talks and/or papers I've seen at conferences recently.  This post is going to be a KubeCon EU recap; unfortunately I
wasn't able to attend KubeCon EU, and I was having major FOMO while it was going on, but the conference organizers got
the video recordings up _extremely_ rapidly after the conference[^2], so I've been spending a bit of time going through
the talks that seemed interesting.  I still have quite a few more on my list that I want to watch, but in this post I'm
going to do a whirlwind discussion of my favorites.  If I come across any others that I like, I may do a follow-up.

## KubeCon EU 2024: The AI edition

First, let's talk about the overall theme of the conference: it was hands-down the Artificial Intelligence edition of
KubeCon.  I remember [being surprised](https://blog.appliedcomputing.io/p/kubecon-recap-summary-edition) that KubeCon NA
last fall didn't have more AI talks, but I guess they were just delayed by a few months.  As I skimmed through the
[schedule](https://kccnceu2024.sched.com/) for the EU conference, it seems like 90% of the talks were somehow about AI
or machine learning[^3].

I'm not going to cover any of the AI talks here.  For one thing, it's not my core research or engineering interest
(though I _do_ think there are a bunch of hard unsolved problems around _scheduling_ for AI workloads), and for another
thing I would describe my attitude towards the current AI hype train as "cautiously skeptical".  [This
article](https://www.citationneeded.news/ai-isnt-useless/) by Molly White pretty accurately sums up my feelings towards
the matter: AI (and here I mean specifically LLMs) isn't useless, but... it's also not really _useful_ either.

So anyways all of that is a long-winded way of saying "meh" to AI talks at KubeCon.  There's an audience for them, sure,
but it's not me.

## KubeCon: The Autoscaling and Scheduling Talks

So with that out of the way, what talks _did_ I like?  Well, as always, there are a ton of interesting talks around
resource management and autoscaling.  It's somewhat telling to me that we're still struggling with these issues as an
industry, a decade later.  People semi-regularly tell me "oh, autoscaling is easy, I don't understand why it takes so
much engineering effort" but the truth is that autoscaling _isn't_ easy---like, at all.  There are so many edge cases
and weird behavioural interactions at play that really aren't obvious until you're woken up at 2am because all your
services are at min capacity and falling over.  So let's look at some of the autoscaling-related talks this year:

### Is there room for improving Kubernetes' HPA?

I think this was my favorite talk of the conference ([video link](https://www.youtube.com/watch?v=ZG8WIiCl5m4)).  This
work was a collaboration between some academics in Barcelona and Cisco[^4], and it asked the question "How can we
respond to spikes in traffic more effectively?"  Ok, so, some background first -- the Kubernetes [Horizontal Pod
Autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) is a control loop that watches
for changes to user-configured metrics[^5], and tries to scale the number of running pods up or down to bring that
metric in line with a user-configured target value.

There are a _lot_ of subtleties in how the HPA operates which can lead to some severe outages if you don't understand
them[^6], but in this talk, the presenters ask the question, "Suppose your HPA is configured perfectly---can we do
better?"

The answer is, in an exception to Betteridge's Law, "yes!".   See, the HPA operates on a per-deployment basis.  It has
no concept of anything else that's happening in the cluster.  So, imagine that you a somewhat typical call-graph:
service A accepts incoming traffic, it calls out to service B, which calls to service C, which makes a query to
datastore D.  Now suppose that there is a substantial spike in traffic; there's going to be a period of time when
pods in service A are overloaded and return errors; eventually the HPA will notice and scale service A up.  But, service
B hasn't yet seen the effects of the spike in traffic, so once service A recovers, then service B falls over.  There is
still a spike in errors to the user.  Eventually the HPA scales service B up, and now we repeat the process for service
C.  Hopefully our datastore is more resilient, so that by the time service C has scaled up, we're able to handle all
user requests without error.

The solution here is hopefully obvious: as soon as service A sees the spike in traffic, we should immediately scale up
all three services in the call graph: A, B, and C.  Then, the downstream services are prepared and able to handle the
spike in traffic as soon as the gateway service is, and (while we still have a slight period where service A is
overloaded) the length of time we're serving errors to users is hopefully significantly reduced.

But, while the solution may be obvious, that doesn't mean it's easy to do.  The presenters of this talk framed this as a
"we need to be able to understand and reason about the service call graph" problem, but I prefer to think of this as a
"there are too many layers" problem, to which the solution is ["what if we got rid of some of the
layers?"](https://blog.appliedcomputing.io/p/thoughts-on-scheduling-and-autoscaling)[^7].  Anyways, I won't spoil the
punchline but the end result is that "yes, this works, why aren't we doing it everywhere"[^8].

Anyways, it was a really great talk, I definitely recommend watching it, and I would love to see some of their work make
it into mainline Kubernetes.

### KEDA talks

There were two talks highlighting the Kubernetes Event Driven Autoscaler (KEDA), which is another solution for doing
pod-level autoscaling based on external event sources.  We've known for a while that you "shouldn't" scale your services
on CPU utilization, and instead should use a more relevant metric, such as request load[^9].  KEDA is the Kubernetes
solution for doing this---it lets you hook the HPA up to external sources, such as a Kafka queue or some other upstream
"work producer", and autoscale your service based on that.

The first talk at KubeCon, called ["How to Save Millions Over Years Using KEDA?"](https://youtu.be/PN-KT8ClISA), used
KEDA to scale down Jupyter notebooks after some period of inactivity.  Jupyter is sortof notorious for being a)
expensive (especially if you're doing any GPU work), and b) very easy to forget to turn off because it's buried in a tab
somewhere amidst your 496,103 other tabs.  So in this talk, the presenters piped data about the inactivity period for
the Jupyter kernels into Prometheus, and then used KEDA to scale down Jupyter kernels that had been inactive for a
period of time[^10].  Crucially, they use KEDA for this because it is able to scale deployments to 0, something that the
base HPA isn't able to do.

The other talk here (which I actually haven't watched yet), called ["Scaling New Heights with KEDA: Performance,
Extensions, and Beyond](https://www.youtube.com/watch?v=_5_njiPr5vg) was from the maintainers of KEDA, where they talk
about a bunch of new features that have been added to the tool recently---that's definitely worth a watch if you're
using KEDA and/or are considering using it in the future.

### Advanced Resource Management for Running AL/ML Workloads with Kueue

OK, I sortof lied at the top when I said I wasn't going to talk about the AI talks---but I gave myself an out, because
[this talk](https://www.youtube.com/watch?v=6k_8Go3u8Qk) isn't technically about AI, it's about _scheduling_ AI, which
is a totally different thing.  Anyways, the presenters for this talk described a new system for doing job scheduling
that is starting to pick up some steam in the community; [Kueue](https://kueue.sigs.k8s.io) is owned by the Scheduling
SIG and is the sortof "official" way to do job scheduling in Kubernetes.

In contrast to the other two projects I'm aware of in this space ([Volcano](https://volcano.sh/en/) and
[Yunikorn](https://yunikorn.apache.org/docs/)), Kueue doesn't create a new/alternative Kubernetes scheduler.
Instead, it introduces a wrapper around the existing Kubernetes Job object to try to shoehorn in features like [gang
scheduling](https://en.wikipedia.org/wiki/Gang_scheduling).  My rough takeaway from this talk is that, instead of
_getting rid_ of layers, Kueue is trying to solve problems by _adding_ layers.  I think we're already starting to see
some cracks in this approach; for example, both Kueue and Kubernetes have a concept of resource quotas, but they are not
compatible, and Kueue is having to work with the Kubernetes Cluster Autoscaler to [support proactive scaling instead of
reactive scaling](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/proposals/provisioning-request.md),
which is, frankly, a _huge_ change in the operational model of Cluster Autoscaler.

So anyways, I think the talk is worth watching to learn more about the product, and if you're trying to do any sort of
AI/ML scheduling, Kueue is probably worth trying out to see if it meets your needs, but color me skeptical on this one.

## Wrapping up

Huh.  I had more to say about those talks than I thought I did.  Weird.

There are some other talks from KubeCon EU that I watched or that are still on my list; if I feel like I have enough
content for a follow-up discussing those, I may do that next week.  Otherwise, I'm going to probably spend several weeks
covering some of the new papers from [NSDI](https://www.usenix.org/conference/nsdi24) this year, which I had the great
privilege to attend[^11].  There was a lot of really cool research presented, which I'm excited to dig into a bit more
in the future!

Also, I will just mention that [registration](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/register/)
for KubeCon NA is currently open; it’s in Salt Lake City this year, which I’m pretty stoked about.  And if you’re
interested in giving a talk, the [CFP](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/cfp/)
is open until June 9th!

As always, thanks for reading.

~drmorr

[^1]: By the way, some blogs will start off a new post after a period of silence with an apology, like, "so sorry I
    haven't posted anything, I'll do better now, I promise" and then proceed to not post anything for several months.
    I'm including this information not so much by way of apology, but as a way of being transparent---this is what I'm
    up to, this is why I haven't posted anything for a few weeks.  While I do aim to publish stuff approximately once a
    week, it's not a "core business metric" (I refuse to say [OKR](https://blog.appliedcomputing.io/p/okrs-are-bullshit))
    that I'm tracking.  Anyways, all of this is maybe just a long-winded way of saying "sorry not sorry" and maybe I
    should just stop feeling guilty or whatever.

[^2]: They were up within 2 days of the conference ending, so serious kudos to whoever made that happen!  👏

[^3]: I use AI and ML somewhat interchangeably, which I know makes some people grumpy, but, I don't see much point in
    fighting that fight.  I think the linguistic descriptivists have already lost here.  Also, these days, people use AI
    to mean LLMs, which bothers me slightly more; there's a lot of AI technology that doesn't rely on
    [stochastic parrots](https://en.wikipedia.org/wiki/Stochastic_parrot).

[^4]: Which is separately exciting to me because I love seeing these kinds of collaborations and want to be involved in
    them in the future.

[^5]: For example, average CPU utilization across all the pods in a deployment.

[^6]: By the way, have I mentioned that you can [hire me](https://appliedcomputing.io/contact.html) if you want help
    configuring your autoscaling behaviour?

[^7]: Drink!  It's been _far_ too long since I've asked that question on this blog.  As a reminder, or for my new
    readers, this question was initially posed by [one of my colleagues at VelocityConf in 2019](https://www.oreilly.com/library/view/oreilly-velocity-conference/9781492050582/video325510.html),
    and it's been a recurring theme on this blog for the last year.

[^8]: Maybe I will spoil the punchline after all.

[^9]: There was an extremely detailed article 7 or 8 years ago by.... someone semi-influential that talks about this,
    but I have never been able to find it again after I read it.  If anyone knows the article I'm talking about, I'd
    love to have a link.

[^10]: Of course scaling down the kernels is mildly disruptive to users because they will have to restart them once they
    start doing work again, but it's better---or at least, cheaper---than the alternative.

[^11]: It was my first time at a real "academic" conference in at least a decade, so that was pretty fun!
