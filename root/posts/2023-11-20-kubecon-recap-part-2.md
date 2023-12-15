---
title: "KubeCon Recap, Part 2: Two Kubernetes Tales"
authors: 
  - drmorr
datetime: 2023-11-20 11:00:00
template: post.html
---

For those of you in the United States, happy Thanksgiving week!  I have a post for you today, but I won't have a post
next week.  We'll be resuming our regularly-scheduled posts on December 4 (or December 1 if you're a paid subscriber,
wink wink).

In this post I'm going to tell two different Kubernetes tales, one based off a talk at KubeCon (technically, the
pre-conference Contributer Summit), and one based off a recent debugging experience with a friend.  Fair warning: I have
a _lot_ of complaints and a _lot_ of footnotes in this post and no solutions whatsoever, but hey--what's a blog for if
you can't complain once in a while?  So let's jump in.

## Kubernetes Tale #1: Everything is Awful

The talk I'm going to cover today was entitled [Everything is Awful: Kubernetes Devil's
Advocate](https://kcsna2023.sched.com/event/1SpAy/everything-is-awful-kubernetes-devils-advocate), by Flynn at
[Bouyant](https://ccoss.org/speakers/flynn/) ([video link](https://www.youtube.com/watch?v=Xsyn5AWxjJs).  It was an
exceptional talk and I definitely recommend watching the recording.  The high-level premise of the talk is that
Kubernetes is complicated and the API is awful[^2].  Flynn took a very basic example of "I want to deploy a pod running
a 'Hello, world' webserver" and walked through the steps needed to make that happen.  To anybody who's worked with
Kubernetes, this is easy: just stick the pod spec in a deployment, apply it, boom!  You're done.

But think about how much knowledge is wrapped up in that set of steps:

1. You have to know that "running bare pods" is not a best practice.
2. You have to understand enough Kubernetes lingo to know that you want a Deployment.
3. Deployments have a bunch of extraneous stuff in their spec that you have to understand just to get it running.
4. Assuming you want to actually communicate with your nginx pod, you have to know that you want a Service[^3].
5. Oops, did you configure the ports correctly on your Deployment?
6. How much YAML do you feel like writing today?  None?  Have you heard of our lord and savior Helm?
7. Oh, you're getting a 503?  lol, noob.

And that's barely scratching the surface of the knowledge that you, an application owner, have to have in order to
deploy your application in a Kubernetes cluster.  In his talk, Flynn made the point that in today's world, we don't
expect the _infrastructure engineer_ to know or understand anything about the business needs or problems that the
_application owner_ is trying to solve, but we expect the _application owner_ to understand all this extra crap about
the infrastructure that they're running on[^4].

This state of affairs is particularly ironic, because literally the only reason we run all this complicated
infrastructure is to support the needs of our application developers.  If they didn't have an application to run, we'd
just shut it all down: nobody[^5] is out there running Kubernetes for fun.

In short, despite literally only existing to support the application owner, the Kubernetes API was designed for the
infrastructure engineer.  The logical end-game of this current situation is that every company in existence has built
their own abstraction layer on top of the Kubernetes API to make it easier for the application developer to do their
job, namely, _develop the application_.  At Yelp, this abstraction layer was called
[PaaSTA](https://github.com/Yelp/paasta/).  At Airbnb, it was called OneTouch.  Other companies have their own versions,
and they're all different.  And don't even get me started about the dozens of public companies that are trying to sell
even more abstraction layers on top of Kubernetes.

Unfortunately, as Flynn pointed out, the world we find ourselves in is not _just_ bad for the application owners.
Kubernetes is "supposed" to be this equalizing technology.  It's open-source and companies big and small across every
conceivable industry are transitioning onto the platform, which means that as infra engineers, our skills _should_ be
transferable.  But because the API is so bad and every company has their own bespoke abstraction layer, we've become
experts not in Kubernetes, but in the abstraction layer of our current company, which is decidedly _not_
transferable[^6].

So how do we get out of this current state of affairs?  Flynn's summary in the talk was that we have to think about the
different roles we want to support: cloud provider, infra engineer, end user/app developer, and (possibly) policy admin.
All of the other roles exist to support the end user, but we have underinvested in the tooling and the support that the
end user needs to do their job well.  We need to be doing better at helping them understand _how_ to use Kubernetes,
what to use it _for_, and maybe most importantly, when _not_ to use it.

I found myself vigorously nodding along during most of the talk, and I think most infrastructure engineers resonate with
a lot of the points that are made here.  I think we all sortof intrinsically know that things are Not Great™️ for the
end user, but I got to experience that first-hand earlier this week.  Which brings me to my second Kubernetes story for
this post:

## Kubernetes Tale #2: The Brave Little Ingress Controller

A friend of mine who is relatively new to the infra space is trying to set up Kubernetes on their Raspberry Pi as a way
to learn more about the stack.  This is a pretty common exercise for folks and there are dozens (or maybe hundreds) of
tutorials out there on how to accomplish this.  My friend's goal was literally exactly what I outlined in the first
Kubernetes tale: deploying a simple webserver that displayed a "Hello, world!" page.  They had found a few different
tutorials to follow in addition to the main Kubernetes documentation, and had made quite a bit of progress on their own:
they had a Kubernetes control plane up and running, nodes were joining the cluster, the webserver deployment pod was up
and running, everything was healthy.  And yet, when they went to the IP address for their Raspberry Pi and tried to load
the page, they got a 404.  This is when they called me for help.

Now, I want to clarify something up front.  My friend is a very talented engineer.  They know how to computer.  They
just haven't done Kubernetes before.  On the other hand, I've spent the last 8 years in this space, and have a pretty
good idea of how to debug and troubleshoot this stuff.  I'm not a better or smarter engineer than my friend, I just have
a different set of experiences that I'm able to draw upon.  This isn't a "lol git gud, noob" post, and nothing I say
below should be interpreted as such.

So anyways, what did I do?  Here were my debugging steps:

1. Look at all the pods on the cluster.  Oh, ok, there's an ingress pod running.  I don't know anything about Kubernetes
   ingress, I've never worked with it before, but I'm pretty sure that has something to do with routing external
   requests into the cluster.  Let's look at the logs from that pod.
2. Squint at the logs very hard.  Oh this line buried deep in the middle has an error, something about an ingress class
   that doesn't exist.  I dunno what that means, skim the Kubernetes docs, oh I guess Ingress objects are implemented
   via custom controllers and the ingress class is a different resource.  Let's look at the ingress classes installed on
   this cluster: yup, one doesn't exist with that name, but I do see one called `nginx`, what if we just used that one?
3. Update the Ingress YAML to use the right ingress class, re-apply it.
4. Huh, nothing happened.  Oh, I guess the Ingress controller doesn't auto-recreate the ingress pod when you update the
   ingress class?  That seems not very user-friendly.  Fine.  Delete the ingress pod, watch it get recreated, look at
   the logs.  No error!  Huzzah!
5. Try to hit the webserver again: 503 error.
   [Progress](https://www.reddit.com/r/ProgrammerHumor/comments/tgogft/sometimes_progress_looks_like_failure/)!
6. Look at the ingress pod logs again, there's a new log line that says that the service doesn't have any backing pods.
   Go look at the service spec, oh, the service label selector has a typo in it.  Fix that, redeploy.  Reload the page.
7. It works!  Problem solved.

This entire process took me about 45 minutes to solve from end-to-end, despite not knowing anything about ingress
controllers before we started.  It was interspersed with lots of "wait, what namespace is that in?" and "how do I type
this kubectl command?" and so forth[^7].  I can _easily_ imagine this entire process would take my friend days or weeks
to troubleshoot on their own, and the end result very possibly could have been that they just threw their hands up in
frustration and gave up.

Again, and I can't stress this enough, _this isn't because my friend is dumb!_  This is because experts in the system
have a _huge_ advantage over newcomers because they already know where to look for information.  Kubernetes beginners
have to learn a crash course in distributed systems, a set of really arcane lingo, a complex and frequently unhelpful
CLI utility, a bunch of junk about DNS and Docker and Networking and nginx, and basic debugging skills.

I hope I've made my point clear that there is _nothing_ in this ecosystem that is beginner-friendly, but I want to
spend the remainder of this post harping on that last topic, which I find to be particularly galling:  basic debugging
skills, aka [observability](https://en.wikipedia.org/wiki/Observability_(software)).  There's a whole technical
definition of what "observability" means, and there are a bunch of pillars, and Google wrote a book about it, but forget
all that.  For the purposes of this post, observability means "what the hell went wrong and how do I figure it out?"
And the state of observability in Kubernetes is shockingly, appallingly bad.  So let's talk about that.

## Bonus Kubernetes Tale: Can I have an Observability, please?

Let's start with metrics.  At most companies, metrics are the "first line of defense" for their infrastructure.  We can
tell when something went wrong because some metric somewhere deviated from the norm and then we paged somebody in the
middle of the night to figure out that it was just a false alarm.  Metrics in Kubernetes are (typically) collected using
[Prometheus](https://prometheus.io) and displayed or analyzed with [Grafana](https://grafana.com).  To be honest, once
these two tools are set up, they are actually pretty good!  Yes, learning PromQL is hard, but you can get quite a lot of
info out of your cluster with it.  But a) I'm not going to tell my friend, "Oh in order to debug your issue, you need to
go install this complete other stack of software and learn yet another set of arcane and unfamiliar syntax", and b)
metrics are great for telling you _when_ something's wrong, but they're terrible at telling you _what_ is wrong.  I
don't think there's any way we could have identified the Ingress Class misconfiguration issue by looking at a Grafana
dashboard.

So let's go back to debugging first principles.  What do you do when something is wrong with your code and you can't
figure out what?  You add a print statement!  Well we have a tool for that in Kubernetes, too.  It's called "reading
logs"[^8].  The trouble is: there are dozens, hundreds, or even thousands of components that are spitting out logs.
Which one(s) have the logs you need?  Probably they're split across 3-10 different pods.  Then you have to hope that the
person who wrote the code running in the pod that you care about included the logging information that you need,  and
you have to hope that you set the logging verbosity high enough[^9], _and_ you have to be able to filter it out from all
the other extraneous crap that's getting spewed out[^10], _AND_ you then have to be able to correlate those logs with
the same log lines from the other 9 pods in the system who might not even be recording the same timestamps so remind me
again whether these logs from this pod are in UTC time or local time?

The solution most companies use is to dump all the logs into some sort of logging aggregator (if you say ElasticSearch I
will punch you.  ElasticSearch is good at a lot of things but log aggregation ain't it).  But the amount of storage
needed to store all the logs for any significant period of time is not cheap, and the compute power needed to process
all the logs is even more expensive.  The gold standard here is Splunk[^11], but there's a reason it has a reputation in
the industry for being prohibitively expensive.  Unfortunately, I haven't seen another tool that even comes close to
matching them in terms of capabilities[^12].

But anyways, let's go back to my friend: they obviously don't have any log aggregation set up, and they're not going to
for a while, so we're stuck with `kubectl logs` and `grep`, along with a healthy dose of "crossing our fingers and
hoping".  How is this considered acceptable?  How does _anybody_ learn how to do anything in this ecosystem???

## Summing up: I guess Everything _really is_ Terrible

So where do we go from here?  I think, as an industry, we need to take a _massive_ step back and provide developers with
tooling to make it easier to get their jobs done.  We are collapsing under the mountain of YAML and `kubectl` commands 
that we've built up, and we just keep piling more on top[^13].  Now don't get me wrong: all of the features that we've
built into Kubernetes are important and necessary and useful.  But they're not all important and necessary and useful to
_everybody_ in _every setting_, and understanding which ones are important in which settings is _very very hard to do_.

Here are a couple of concrete, actionable ideas off the top of my head for how we can do better:

1. Rust[^14] has a steep learning curve, but one of the things the compiler does is provide extremely helpful error
   messages.  If you do something wrong, the compiler will flag a) exactly where the error is, b) a suggested fix, and
   c) a link to more information.  Imagine if we had a "Kubernetes compiler" that could take your massive pile of YAML
   and say "Hey, it looks like you're deploying a webapp, these settings you configured don't seem to be correct, here's
   a proposed fix, and also here's a link to the docs if you want more information?"  This would be an enormous
   improvement over the existing tooling[^15].
2. I didn't even touch on another traditional software troubleshooting technique, which is "attach a debugger and step
   through the code".  It is _possible_, albeit difficult, to attach a debugger to things running in Kubernetes
   clusters, and it typically requires cluster admin and understanding Linux security controls, or maybe something about
   ephemeral containers.  But even then, no debugger in existence can attach to _all of the (relevant) pods in the
   system_ and then _step through the interactions between the pods_.  But what if you could?  Having a tool like that
   would be mind-boggling.

These are just a couple ideas I came up with in the last 30 minutes.  I'm not saying they're the best ideas, and they
might not even be _good_ ideas but actually I think they're not terrible ideas either.  It would be totally possible
to build something like them given enough time and resources.  But if we want them to be useful across the industry,
they have to be a _core part_ of the Kubernetes ecosystem, not gated off behind some SaaS product, because there are
already too many of those and companies don't want to pay for another one.

If only there was some company out there doing open-source research and development in the distributed
systems/Kubernetes space who would be perfectly positioned to build some of these tools... 🤔  Nah, that probably
doesn't exist.

Thanks for reading,

~drmorr

[^1]: Actually I'm not 100% certain the contributor summit talks are recorded, but I assume (????) they are.  I guess if
    they're not, too bad so sad.

[^2]: I mean, duh?  I don't think anybody who's worked with Kuberenetes would argue with that statement.

[^3]: Aside: of all the names of primitives offered by Kubernetes, I hate the "Service" name the most.  In casual
    conversation, literally everybody uses "service" to refer to the application that is running, but in Kubernetes
    lingo, "service" means "the DNS configuration to route traffice to the application that is running". 🤦

[^4]: Accurate.  In my ~8 years of industry experience I can count the number of times I had to care about the specifics
    of an application running in a pod on one hand.

[^5]: I mean, I'm running Kubernetes for fun, but I'm a special kind of masochist.

[^6]: Even at a company like Yelp, with an obstensibly open-source abstraction layer like PaaSTA, there are so many
    Yelp-specific assumptions built into the tool that it would be nearly impossible for another company to just "pick
    it up and use it".

[^7]: I pointed my friend towards [kubectx](https://github.com/ahmetb/kubectx) and
    [kube-ps1](https://github.com/jonmosco/kube-ps1), which provide functionality that is, in my opinion, table stakes 
    for the Kubernetes user interface.  Why these aren't built directly into `kubectl` is beyond me.

[^8]: I was having a conversation with a (different) friend a while back who made the observation that the difference
    between a senior engineer and a junior engineer is that the senior engineer knows how to read logs.  This same
    friend also commented that they were thankful for all the time they spent deciphering gcc compiler errors because it
    made them better at reading logs.

[^9]: If you need logs from the Kubernetes control plane you better hope you're running with `--v=4` or you're screwed.

[^10]: If you need logs from the Kubernetes control plane you better hope you're not running with `--v=4` or you're
    screwed.

[^11]: I am not getting paid or endorsed by Splunk to write this post.  But actually--hey, if you work for Splunk, do
    you want to pay me some money?  :D

[^12]: Oh by the way, did I mention Kubernetes Events?  Events are like a separate log stream that are aggregated by
    Kubernetes itself, which means that they're significantly harder to get into whatever log aggregation tool you're
    using and you don't really know whether the information that you care about is going to be logged in the pod or via
    an Event, or both, or neither.

[^13]: Fun aside: as I was reading through the Ingress API docs to help my friend, I discovered this fun note at the
    top: "Ingress is frozen. New features are being added to the Gateway API."  So, I guess that the dozens or hundreds
    of tutorials that reference the Ingress API are now going to be obsolete, and we're going to have dozens or hundreds
    of _new_ tutorials that reference the Gateway API, but nobody is ever going to go back and clean up the tutorials
    that reference the Ingress API, so the next time someone like my friend comes along to set up Kubernetes on their
    Raspberry Pi they're almost assuredly going to end up with _both_ an Ingress controller and Gateway, uh, thingy on
    their cluster, and the two will probably conflict in extremely subtle ways that will be--you guessed it--impossible
    to debug.

[^14]: I swear I'm not getting paid by the Rust Foundation to shill Rust in every post either, but hey--I wouldn't say
    no if they wanted to???

[^15]: The latest software dev trend is "shifting left", which basically means that we need to push more errors and bad
    outcomes to earlier in the development process, where they're easier to catch and less costly to correct.  Basically
    what I'm saying here is that Kubernetes needs to do some shifting left.
