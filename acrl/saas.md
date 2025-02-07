# ACRL's "Scale-as-a-Service" program

_Stop guessing at your Kubernetes scale---simulate it!_

## The problem: we're all guessing about scale

Do you know how many nodes and pods your Kubernetes cluster can run?  If your cluster utilization doubled tomorrow, do
you know where your bottlenecks would be?  What if it 10x'ed?  Have you ever been asked to run preparatory drills to
prepare for a big product launch, major holiday, or other anomalous event, only to discover that you didn't have the
data and didn't know how to get it?  What if you didn't have to guess about your scaling limits?

## The solution: ACRL's "Scale-as-a-Service” Program

Over the last year, Applied Computing Research Labs (ACRL) has developed a novel tool for infrastructure data analytics
called [SimKube](https://github.com/acrlabs/simkube).  This tool creates an exact simulated replica of your production
Kubernetes environment, which can then be used to  run hundreds of experiments on your infra.  This helps you to
identify scaling limits and bottlenecks in your Kubernetes architecture before they're reached in production.  In ACRL's
SaaS program, we embed an engineer into your infrastructure org to run these experiments and identify short-, medium-,
and long-term changes you can make to your Kubernetes clusters to reduce costs, prepare for scale, and improve
resilience.

## Scale-as-a-Service: how does it work?

The SaaS Program is an approximately 8-week program where an ACRL engineer embeds into your infrastructure org
full-time.  The process is split into several phases, described below.

Understanding scale and resiliency starts and ends with the understanding the people involved.  For the first week of
the program, we conduct extensive interviews with the stakeholders in your organization: the engineers, leadership, and
users of your Kubernetes platform.  We identify existing pain points, possible scale bottlenecks, cost savings
opportunities, or other related concerns.  These are documented in a written report, which includes a plan of attack for
the rest of the program.

In weeks two and three, we start running experiments.  We set up a test harness so that anyone in your organization can
run simulations quickly and repeatably using real production data for  your clusters.  Then we start look for
small-but-impactful changes you can make to your Kubernetes cluster configuration to improve reliability and save money.
Some examples include:

* Are there predictable patterns in your cluster utilization that can be used for preemptive scaling?
* How quickly should your cluster autoscaler scale down unneeded nodes?
* Are there changes to the kube-scheduler priorities that can improve your resource utilization?
* Are your pod disruption budget settings too restrictive (or, alternately, not restrictive enough)?

Once we have identified one or two small changes, we implement them for you so that a) you can start seeing benefits
immediately, and b) so that we can validate that our simulation environment is accurately modeling your production
environment.  Often we find that even with relatively small and easy-to-implement changes, you can recoup the entire
cost of the program!

In weeks four through six, we run more simulations, this time looking for bigger improvements.  We take your existing
production data and scale it up 2x, 10x, or 100x, and see where bottlenecks appear.  Then we identify and implement
solutions to eliminate these bottlenecks.  Examples include:

* Verifying that your Kubernetes control plane can handle the increased load
* Writing a custom kube-scheduler plugin to improve scheduling speed or bin-packing performance
* Customizing your cluster autoscaler's scale-up behaviour through a custom expander
* Changing your mix of cloud provider instance types to be more cost effective

In week seven, we look for "big” changes you can make: what these changes look like vary significantly from company to
company, and are typically outside the scope of ACRL's program, but can result in sizeable reliability gains or cost
savings.  Some examples include: shuffling "batch” workload timings to take advantage of lower-utilization periods, or
exploring alternative schedulers (like Yunikorn or Volcano) or autoscalers (like KEDA).  Using our simulations, we
provide an estimated level of effort and ROI for these initiatives.

In the final week of the program, we write up everything we've done in a comprehensive report.  We also recognize that
these types of analyses can't be done in a vacuum; as your business needs change and shift, often you need to repeat
this work, so we leave our test harness in place and train your engineers to use it after we're gone.  Lastly, we
provide free quarterly consultations with your engineering team for up to one year after the conclusion of the program,
in case you have questions or need help.

## Want more info?

[Contact us](contact.md) today!
