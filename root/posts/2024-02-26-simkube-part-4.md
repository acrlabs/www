---
title: "Introducing prom2parquet: it's time to do a SCIENCE"
authors:
  - drmorr
datetime: 2024-02-26 11:00:00
template: post.html
---

<figure markdown>
  ![a scientist getting sucked into a glowing wormhole-like artifice, that is populated with a bunch of detritus and a
  few rabbits.  The rabbit in front looks terrified.](/img/posts/rabbit.jpg)
  <figcaption>"a scientist falling down a never-ending rabbit hole", generated by the Bing Image Creator</figcaption>
</figure>

OK, some of you probably noticed I missed last week's post, and you're right.  I did.  The only thing I can say is, "I'm
sorry, I was 2 miles down a never-ending rabbit hole."  But luckily for you, that rabbit hole gave me the material I
needed to write a post this week!  So I'm calling it even.

In some ways, this post could be considered SimKube Part 4.  If you'll recall from [my](https://blog.appliedcomputing.io/p/simkube-part-1-why-do-we-need-a-simulator)
[previous](https://blog.appliedcomputing.io/p/simkube-part-2-virtual-kubelet-and) [entries](https://blog.appliedcomputing.io/p/simkube-part-3-tracing-a-cluster)
in the series, the fourth post was supposed to be about analyzing the results of a simulation in an air-quotes
"scientific" manner.  The reason I haven't ever written that post is because I've never had a good answer for how to do
that.  However, I'm at the point now where I need to start being able to do that type of analysis, so in this post I'm
going to try to walk through some of the design constraints and describe (one piece of) a (potential) solution to the
problem[^1].

Also, if you don't wanna read to the end and just want to see the cool thing I built, [prom2parquet](https://github.com/acrlabs/prom2parquet)
is on GitHub.

## Can't you just use Prometheus? What's the problem?

If you have done anything at all with infrastructure, you might be wondering what the problem is.  After all, there are
literally dozens (or maybe hundreds) of [observability](https://en.wikipedia.org/wiki/Observability_(software))
solutions out there.  Why not just use one of those?  In fact, "observability" is very closely related to the problem
I'm trying to solve, but it's subtly different in just enough ways to make things challenging.  So let's review a few
terms so that we're all on the same page.

### Observability

As defined in the Wikipedia page I linked above,

> **observability** is the ability to collect data about programs' execution, modules' internal states, and the
> communication among components.

In every organization I've been a part of or talked to, observability tooling is specifically used so that engineers can
a) _identify_ when something has gone wrong, and b) _understand_ what broke.  In other words, we set up some metrics,
add some checks for outliers, and then page you in the middle of the night when they happen.  If the system is in
working order, we basically don't care, because we've got more important stuff to do, yo.

Complicating everything is the fact that in modern distributed systems, there are _literally_ hundreds of thousands of
metrics that get emitted by the involved components[^2].  Setting aside the fact that it's impossible for any one human
to know what all of the emitted metrics are, it's also impossible to store all of them at any level of detail for any
extended length of time.  So modern observability solutions typically put a huge amount of effort into filtering and
pre-aggregating the metric data points (in other words, throwing data away).  This is "fine" for observability purposes,
as long as we make sure that the outliers don't get thrown away so that we can wake somebody up when they happen.

However, when we're trying to do a 🧪SCIENCE🧪, throwing away data is definitely not fine.  So let's talk about that
next.

### Data analysis

At a very high level, the goals of scientific data analysis of distributed systems are the same as for monitoring.  We
want to collect some metrics and use them to make some pretty graphs.  But when you get into the details, three stark
differences appear:

1. Precision: because monitoring and alerting cares about outliers, we can get away with throwing away "steady-state"
   data as long as outliers are surfaced "reasonably close" to when they occur.  However, for scientific analysis, we
   often care about the _precise_ times that events occur in the steady state.
2. Archival: for the purposes of independent validation of results, it's important that data are stored approximately
   forever.  This is in contract to observability solutions which throw data away the older it gets.
3. Query patterns: most monitoring solutions are trying to identify correlations between _different metrics_ at the
   _same point in time_.  In other words, they want to know "if metric A has an outlying data point at time X, what
   other metrics have outliers at time X?"  Answers to this question help engineers to identify a) root causes for
   broken systems, and b) downstream impacts of broken systems.  The query languages for monitoring systems therefore
   provide a lot of functionality for joining different metrics at the same point in time.
   <br>
   On the other hand, when we're doing data analysis, we almost always want to compare _the same metric_ at different
   points in time.  That is, we want to know "how does metric A change between experiment 1 and experiment 2, which were
   run at times X and Y?"  And most monitoring tools out there provide extremely poor (if _any_) tools for answering
   this question.

However, going back to the high level, data analysis tools still need _access_ to all the same raw underlying metrics
that observability tools do, and the question I've been struggling with is, "How can I solve for a data analysis use case
without completely re-inventing all of the metrics collection tooling that already exists?"  So let's talk for a bit
about metrics collection.

## Kubernetes Metrics Collection

Basically all Kubernetes components expose metrics in a [standard](https://prometheus.io/docs/instrumenting/exposition_formats/)
text-based "exposition format".  Regardless of what monitoring tool you're using, it's almost guaranteed that it will be
able to understand this format.  We've also [decided](https://thenewstack.io/exploring-prometheus-use-cases-brian-brazil/)
as an industry that "pull-based" metrics are better than "push-based" metrics[^3].  I really don't have the time or
desire to rehash those decisions, and I'd really like to take advantage of existing tooling for scraping these metrics.

Because I want anybody to be able to use and reproduce experiments, I also don't want to use any proprietary tooling,
and I don't want to require a bunch of custom tooling to be installed on a user's cluster.  Fortunately,
[Prometheus](https://prometheus.io) exists and the [Prometheus Operator](https://prometheus-operator.dev) makes it easy
to install and configure; specifically, we can configure Prometheus to collect whatever metrics we want at as
fine-grained precision as we desire, as long as we have the storage space.  So that's our first problem solved.

Next let's talk about data archival.  Prometheus uses a custom datastore called the [Prometheus Time-Series DataBase
(TSDB)](https://prometheus.io/docs/prometheus/latest/storage/).  This storage format is highly optimized for time-series
data written to files on disk, so in _principal_, you could just copy the blocks of the TSDB that you care about into S3
or wherever you want for long-term storage.  However, more-or-less the only thing that understands the Prometheus TSDB
is Prometheus itself, which means that when you're ready to do data analysis, you have to spin up a new copy of
Prometheus, point it to the archived data, and make queries against it.  This is certainly doable, but it's clunky AF.

While we're on the subject of queries, let's talk about query patterns.  In general, [PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/)
is optimized for point-in-time joins, not points-across-time joins, so if you want to do (for example) comparisons
between different simulations, you have to query your running Prometheus instance to get the data you care about and
then load it into some different format (maybe a [Pandas DataFrame](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.html))
that supports a different type of query pattern.  None of this is very attractive from a user experience perspective,
and let's be honest: doing data analysis is already a tremendously frustrating exercise in tedious data manipulation, so
we should endeavour to not make it any harder than it already is.

But, maybe we can kill two birds with one stone here!  What if we could solve the "archival" problem and the "querying"
problem at the same time?

## Enter prom2parquet

What we need to do is transform our Prometheus data into a format that is a) space-efficient, and b) easily-understood.
My first inclination here was just to write everything to CSV files and compress them, which is "reasonably"
space-efficient, but after doing a lot of reading and thinking about the problem, I finally settled on [Parquet
files](https://en.wikipedia.org/wiki/Apache_Parquet), which is a open-source, columnar, binary data format.  Columnar
data formats have a lot of advantages over row-based data formats, particularly in terms of space efficiency; it's also
a well-supported format for a lot of different tools.  You can read data into a Jupyter notebook via Pandas or Julia, or
if you've got too much data to read at once, you can use something like [Apache Spark](https://spark.apache.org), which
speaks Parquet natively.  This seems great!  The only question is, how can we get data out from Prometheus and into
Parquet?

My first inclination was to write some code into SimKube to do this for me, where the person running a simulation would
specify what metrics they cared about, and then SimKube would run some PromQL queries to get the data out of Prometheus
and write it in some Parquet files.  But after going a little ways down this route, I realized it was going to require a
_lot_ of extra code in SimKube just for metrics collection, which seemed non-ideal.  Moreover, having this type of
component seemed like it could be useful for more than _just_ simulation purposes, so I started thinking about a
separate tool that users could install into their clusters to convert Prometheus data into Parquet files.

The final piece clicked when I realized that Prometheus supports data exfiltration via a large number of [remote
targets](https://prometheus.io/docs/operating/integrations/#remote-endpoints-and-storage).  Parquet isn't currently one
of the supported formats, but honestly, how hard could it be to write a new remote endpoint?  This sounds like one of
those "famous last words" statements, but it honestly wasn't too bad---it only required about a week of rabbit-holing
before getting something that works.  And so, [prom2parquet](https://github.com/acrlabs/prom2parquet) was born!  It's
still a pretty early-stages tool, so I fully expect, for example, the schema for the data files to change, and I'm sure
it doesn't scale well in production, but we can solve those problems later.  The point is, it exists[^4]!

So anyways, that's what I've been working on the last week or so.  I _think/hope_ that prom2parquet might be a useful
tool for lots of folks in the industry, whether you're trying to do simulation or really any other type of data
analysis, so I would love any feedback, questions, or comments that you have about the tool.  And if you _do_ try to use
it, I'd love to hear how it goes!

As always, thanks for reading.

~drmorr

[^1]: I feel like I should add some more caveats to that statement.  Maybe go read it again and throw in a few "maybes"
    and "no warranties implied".

[^2]: On my extremely vanilla [kind](https://kind.sigs.k8s.io) cluster running on my laptop, the Kubernetes apiserver
    _alone_ emits _THIRTY THOUSAND_ different metrics.  Kube-scheduler and kube-controller-manager emit similar numbers
    of metrics, and then you have kubelet, kube-state-metrics, node-exporter, cadvisor, etc. etc. etc.

[^3]: If you disagree and want to start a flame war in my comments section, please like and subscribe first!

[^4]: Also I wrote it in Go, not in Rust, mostly so I can stop everyone from accusing me of being a Rust fanboy.