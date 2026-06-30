---
title: "The Autoscaling Grand Prix"
authors:
  - ian
datetime: 2026-08-21 11:00:00
template: post.html
---

Ask five Kubernetes engineers how to autoscale your workload and you'll get a dozen answers.

One will tell you that HPA is good enough, another will tell you that KEDA is better. Finally, you will hear, with a
chorus of sighs, "it depends". Now you're googling "HPA vs KEDA", you read a white paper that says focus on CPU
utilization, and another that says you need to scale on queue depth; you leave with more questions than answers.

Autoscaling is hard.

Just a few months ago drmorr came up to Portland, Oregon in the middle of a heatwave. We ate pie, talked SimKube and
reminiced about KubeCon 2025 ATL where we carried a "kube" around the vendor floor and offered a prize for anyone who
could fit inside. It turns out scaling people is about as easy scaling workloads. But we had so much fun we wanted to do
something big for KubeCon SLC 2026. Something both fun and useful. What if we could help people select an autoscaler.

So we've designed a new competition, selected a grid of scaling strategies, and a the set circuits for them to compete
on. We're calling it the Grand Prix of Autoscaling. So choose your favorite team and get ready to see them compete for
the biggest trophy in autoscaling.

## The Competition

The Autoscaling Grand Prix isn't just about crowning the best autoscaler. It's about comparing common Pod scaling
strategies under identical conditions. Each scaling strategy will run the same workloads, process the same recorded
events, and be evaluated using the same metrics.

For this inaugural season we're focusing on Pod autoscaling -- deciding how many replicas to run. Node autoscaling is an
equally interesting championship, but that's a race for another day.

## The Grid

It is with great pleasure that today I announce the grid for the first ever Autoscaling Grand Prix. Our scaling
strategies are:

1. Team HPA - The classic
2. Team KEDA - Powered by events
3. Team Thoras.ai - Smart predictive scaling
4. Team Over-provisioned - Sponsored by AWS
5. Team cron - We know what to do

The grid is set. Our scaling strategies run the gamut from advanced predictive autoscalers like Thoras.ai, to event
driven scalers KEDA, and even a cron job (really?). But you might be asking what scenarios will our competitors face
this season, what workloads will they be scaling?

## The Circuits

In an effort to evaluate each scaling strategy the circuits for the 2026 season of the Autoscaling Grand Prix are
designed to cover common scenarios and expose interesting scaling tradeoffs. The Grand Prix is composed of five
circuits. Each circuit is a single scaling scenario. Each scaling strategy is replayed the scenario in a simulation
environment powered by SimKube. The five circuits for the 2026 season are:

### HTTP Circuit

The HTTP Circuit is the classic sprint. Bursty traffic, latency-sensitive users, and little time to recover from a bad
decision. Scale too slowly and requests back up. Scale too aggressively and you're paying for idle Pods. Every
autoscaler claims to excel in these conditions, now we'll find out.

### Queue Circuit

Queue based workloads play by different rules. Instead of reacting to CPU utilization, the goal is keeping up with a
growing backlog without wasting resources when the queue is empty. This is where event-driven scaling strategies get to
prove their worth. But will they have competition?

### Microservices Circuit

Modern clusters often consist of dozens or hundreds of independently scaling services. One overloaded deployment can
send a tsunami through the application. The Microservices Circuit rewards autoscalers that remain responsive without
creating unnecessary churn across the clustera; a delicate balance of speed and skill.

### Legacy Circuit

Not every application is cloud native. Plenty of organizations are still running large monolithic applications that
consume significant CPU and memory and don't appreciate rapid scaling decisions. The Legacy Circuit explores how modern
autoscaling strategies behave when the workloads are old enough to remember the Clinton administration.

### Database Circuit

Stateful workloads introduce constraints stateless services don't have. New replicas take longer to become useful,
initialization matters, and aggressive scaling can be counterproductive. The Database Circuit is less about speed and
more about making the right decision. When mistakes get made on this circuit people start updating resumes.

## Fair Competition

As organizers of the Grand Prix ACRL is committed to fair competition and transparency. Each circuit will consist of a
single scaling scenario. All scenarios are pre-determined and event recorded. The same event data will be replayed with
each autoscaler installed in a SimKube cluster. All autoscalers will have the same data made available to them. All
results will be made publicly available in an ACRL GitHub repo. The prizes are the biggest prizes available in
technology: bragging rights.

## The Championship

Each circuit will have a race winner and runner-up and all scaling strategies will be awarded points based on finishing
grid position. The autoscaler that accrues the most points across the five circuits in the season will be crowned the
Autoscaling Grand Prix Grand Champion.

## Next Time

Next week we will reveal the first of five metrics we will be using to evaluate the scaling strategies, with a new
metric every week culminating with a launch of our Grand Prix results at KubeCon SLC. We have no idea if a dominant
Grand Champion will emerge. Does over-provisioning just beat everything? Can a cron job really compete? Stay tuned to
the ACRL blog to find out.

If you are attending KubeCon SLC and want to meet up send us a note. We can't wait to see you.

Cheers,

Ian
