---
title: NSDI Recap, Part I - Spot Instances and SkyPilot
authors:
  - drmorr
datetime: 2024-05-20 11:00:00
template: post.html
---

<figure markdown>
  ![My name is Inigo Montoya.  You killed my spot instance.  Prepare to die.](/img/posts/inigomontoya.jpg)
  <figcaption> Is this joke still relevant to anyone, or did I just out myself as an old fart?  </figcaption>
</figure>

Ok, I've been promising this for a while, it's time to dig into a few of my favorite talks and papers from [NSDI '24](https://www.usenix.org/conference/nsdi24).
This was my first "academic" conference in a long time, and it was really fun to see a slightly different style of
conference and audience.  It was also much smaller than many of the conferences I go to; I think there were only a
couple hundred people there, compared to KubeCon, which had [13k attendees](https://www.cncf.io/reports/kubecon-cloudnativecon-north-america-2023/)
last year[^1].  I was also really amused by the "vendor hall" at NSDI, which consisted of three companies (Meta,
Microsoft, and.... Google, maybe?) sitting outside in a hallway next to some folding tables.

But anyways, enough about the vibes, man, let's hear about the actual content!  NSDI is a networking conference[^2], so
the majority of the talks were focused on networking topics.  I am not a networking person, so I would say that the
subject matter was a little bit outside of my wheelhouse, but nevertheless there was still a lot of really interesting
content, and I definitely saw some really great talks!  In this post and over the next couple weeks I'll deep dive into
a few of these, starting with...

## Can't be late: optimizing spot instance savings under deadlines

**Authors**: Zhanghao Wu, Wei-Lin Chiang, Ziming Mao, and Zongheng Yang, University of California, Berkeley; Eric
Friedman and Scott Shenker, University of California, Berkeley, and ICSI; Ion Stoica, University of California,
Berkeley

[**Link to the paper**](https://www.usenix.org/system/files/nsdi24-wu-zhanghao.pdf)

I was immediately intrigued by this talk, since my first "real" job at Yelp was dealing with spot instance management ,
and I've spent a bunch of time since then trying to build systems to reason about spot instances.  The [gRPC
expander](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/proposals/expander-plugin-grpc.md) my
colleague Evan at Airbnb built was also designed to help us autoscale and manage spot instances.  So I was very curious
to know how the folks at Berkeley were thinking about this problem.

First, some background---if you're not familiar with spot instances, these are basically "compute offered by cloud
providers at a steep discount to please get someone to use them"; it's bad for the cloud provider to just have hardware
sitting around unused, because it still costs money to maintain and run, and spot instances are the solution.  The catch
is that these compute resources can be reclaimed at a moment's notice[^4] by the cloud provider if someone else is
willing to pay more for them.

There's been a number of talks and blog posts in the industry about how people are saving megabux on their cloud compute
bill using spot instances, and there are some reasonably well-known "best practices" for how to manage the constraints
that spot instances introduce into your infrastructure.  There have also been "some" indications that [spot instances
are no longer an effective way to save costs](https://pauley.me/post/2023/spot-price-trends/) in this the Year of our
Lord 2023 and beyond[^5].  My personal hypothesis has always been that it is probably more advantageous for the cloud
providers to "just stop racking hardware unless customers commit to paying for it", so this post checks out from that
perspective (and I've heard from a few folks around the industry that spot prices are just generally higher and harder
to get across the board).

But OK, all of that is background info.  In this paper, the authors were trying to integrate spot instances into their
application called [SkyPilot](https://skypilot.readthedocs.io/en/latest/docs/index.html), which is an application for
running jobs "in the sky" instead of "in the cloud".  More concretely, SkyPilot is trying to solve the "multi-cloud"
problem, where you have compute available from multiple different cloud providers, and you'd like to run your workloads
on the "best" one.  And, specifically in this talk, they're trying to run workloads on the "best" spot instances across
multiple cloud providers.

The main assumption that they make in this paper is that it's "easy" to snapshot your running task so that it can be
moved to a different machine.  Under this assumption, there are two scenarios they consider:

In the first scenario, there is no "changeover cost": in other words, when a spot instance disruption occurs, it is free
(both from a resource utilization and a time perspective) to restart the task on another node.  In this case  there is a
provably optimal policy: run your tasks on spot instances until they aren't available anymore, and then move them to
on-demand instances.  Then, if spot instances ever become available again in the future, move them back!

This scenario is clearly not representative of reality, but it _is_ easy to reason about.  Unfortunately, the second,
and more-realistic, scenarios is less easy to reason about.  In a setting where there is a changeover cost, they
identified three rules that an optimal policy should follow:

1. **The thrifty rule**: jobs shouldn't continue to be scheduled if they have no more work to do
2. **The safety net rule**: if a job is currently requesting to run on spot, but there's a chance it won't finish in time,
   you should move it to an on-demand node.
3. **The exploitation rule**: once a job starts using spot, it should keep using spot until it can't.

The name of the game at this point is "try to develop a policy that satisfies all these rules as best as possible".  The
most basic policy they consider is a greedy policy that uses spot until it's not available: once the spot market runs
out, the job is paused and they wait to see if more spot instances become available.  Only if there is a risk that the
job's remaining computation time plus the changeover cost exceeds the job's deadline do they switch over to on-demand,
and stay there until the end.

This greedy policy works "pretty well", but they run into problems if more spot instances become available towards the
end of the period, and the job could switch back to spot and still finish in time.  To address this, they instead
propose a "time-sliced" greedy algorithm, where they repeat the above analysis during each sequential time-period.
I'm going to skip most of the details and tell you to read the paper, but they do some analysis comparing this
time-sliced greedy approach to the theoretical optimal solution and are able to show that their algorithm performs
well[^6].

Of course, this is still a theoretical model, and there are lots of considerations that still need to be taken into
account to run this in a real spot market: the most obvious one is that AWS (and the other cloud providers, as far as I
know) doesn't tell you the state of the spot markets.  You kinda have to infer it based on "when you can get hardware or
not"---in other words, you just have to request the hardware and see if it shows up[^7].  There's also, as I alluded to
in a previous footnote, a _lot_ of complexity in how you get billed for spot instances, depending on what other types of
compute you're paying for.  In some cases, spot instances can end up making you _pay more money_ even though they're
_cheaper_!  And, if you're trying to reason about spot availability across multiple clouds, all these problems are
multiplied by the number of cloud providers you care about.  But it sounds like they're trying in SkyPilot!  I hope that
it works out well.

Anyways, that's all I have on this paper; tune in next time for more riveting NSDI content! :D

Thanks for reading,

~drmorr


[^1]: Honestly, this number surprises me.  It felt much bigger than that, I assumed the attendance numbers were still in
    the 20k range.  Also looking at the chart in the CNCF blog post, it makes me even sadder that they've decided to
    cancel the virtual attendance option going forward.  Nearly 30% of the attendees in Chicago were virtual, and it
    feels like a real shame to cut out 30% of your potential audience and reach.  But, it's not my call to make, so 🤷

[^2]: Gasp!  Who knew???  It's not like it's in the name, or anything.

[^3]: You can go see baby drmorr [talk about this at re:Invent](https://www.youtube.com/watch?v=9hVYUr1RmHU&t=1s) if you
    want!

[^4]: This is obviously very disruptive to customer workflows, particularly if you're trying to do something that
    requires saved state.  The way AWS handles this is to give users a two-minute warning to stop whatever they're doing
    and prepare to die.  It _used_ to be the case that the AWS spot market was actually an auction market, where people
    could bid on spot instances and whoever bid the most could use them, but people discovered a lot of ways to game the
    system, so now AWS manages both the supply and demand curves and just picks a price for spot instances based on some
    black-box algorithm.  Confusingly, they've never updated the API, so you can still set a "bid price" for your spot
    instances if you want to.  They've also introduced a whole range of other somewhat-confusing spot options, so you
    can now get compute hardware that's guaranteed to stick around for at least _N_ hours before they yank it away, but
    you have to pay a little bit more for it.  And then there's all kinds of other confusing interactions between spot
    pricing and reserved instances and capacity reservations and.... Anyways the point is, leave it to AWS to make the
    whole thing more complicated than it needs to be.

[^5]: Yes, I know it's already 2024, but the blog post was written in 2023.  Leave me alone.

[^6]: There are a _lot_ of wishy-washy load-bearing words in that statement, so I'm going to re-iterate that if you want
    to know the details, just read the paper.

[^7]: At least for AWS this isn't 100% accurate anymore; AWS will provide you with "rebalance recommendations", which
    let you know if you're currently running in a spot market that's likely to see preemption in the near future, and I
    believe there's another API that you can query that will tell you which spot markets have the most availability
    right now, but there's still a lot of guessing involved.
