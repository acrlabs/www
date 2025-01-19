---
title: '"Disagree and Commit" considered harmful'
authors:
  - drmorr
datetime: 2024-07-29 11:00:00
template: post.html
---

<figure markdown>
  ![A pink square with rounded corners](/img/posts/pink.jpg)
  <figcaption>
    I couldn't come up with a good image to accompany this post so instead I just used a pink square.  If you don't like
    this decision, I'm going to have to ask you to disagree and commit.
  </figcaption>
</figure>

[Last week](./2024-07-22-move-fast-break-things-harmful.md) I wrote a post (attempting to) deconstruct the well-known
tech maxim to "move fast and break things".  It definitely generated some good conversation!  I want to follow up on a
few discussion points that came out of the post.  I had several readers reference ["Slow is smooth and smooth is fast"](https://www.navyseal.com/slow-is-smooth-smooth-is-fast/),
which I hadn't heard before but is apparently a US Navy Seals slogan.  I was also reminded of a similar slogan from [The
Lady Astronaut series](https://www.amazon.com/gp/product/B0756JH5R1?ref_=dbs_p_pwh_rwt_cpsb_cl_0&storeType=ebooks) by
Mary Robinette Kowal[^1], where the main characters' motto is "slow is fast".  [@jawnsy](https://hachyderm.io/@jawnsy@mastodon.social)
on Mastodon followed up with the [following quote](https://mastodon.social/@jawnsy/112842616977740383) which I thought
was very insightful:

> I think Silicon Valley often prefers the sugar high of early progress, but it doesn't take much experience to realize
> that it's often a false economy. It can work well for early-stage companies where the priority is finding
> product-market fit, but once there's traction, company needs change a lot

[@mweagle](https://hachyderm.io/@mweagle) (also on Mastodon) pointed out that the "broken windows" analogy (at least as
it pertains to urban planning and crime) is a myth: a [study from Northeastern University](https://news.northeastern.edu/2019/05/15/northeastern-university-researchers-find-little-evidence-for-broken-windows-theory-say-neighborhood-disorder-doesnt-cause-crime/)
debunks this claim.  Another colleague pointed out that the "broken windows" theory has led to a number of [racist and
horrible policing actions](https://www.nyclu.org/report/shattered-continuing-damaging-and-disparate-legacy-broken-windows-policing-new-york)
in New York City and elsewhere.  It definitely wasn't my intention in that post to rehash traumatic and racist policies
for any of my readers, so apologies if that happened.  I've updated that post with this information as well.

The most common complaint/objection to last week's article, however, was about "disagree and commit" -- I kinda just
dropped it into the article as an aside, said it was a bad idea that many people think is good, and then moved on
without really discussing it.  I think this mention probably should have gone in a footnote, but it didn't, so we're
going to do the next best thing and break it down in this blog post.

## Thanks, Bezos (redux)

So just as a reminder: the "disagree and commit" concept (D&C for short), while not created by Jeff Bezos, was
popularized by him in a Amazon shareholder letter back in 2016.  The broader context of the letter was discussing how to
make good decisions quickly, and one of the strategies he describes is D&C.  The intended way this works is that for
decisions that are "relatively" low impact and/or easy to course-correct, if there is disagreement between parties on
how to proceed, one party should say "In the interest of making faster decisions, I disagree with your desired approach
but I will commit to it anyways."  This unblocks forward progress and allows the team to collect more data that either
supports or disproves the decision that was made.

On paper, this is a great idea, and is actually a reasonable strategy for conflict resolution.  It's a form of
compromise: one party (or sometimes multiple parties) say "I don't like the chosen approach but I'm going to set aside
my desires or opinions in favor of what's best for the team or organization."  A related maxim is that you should have
["strong opinions, weakly held"](https://medium.com/@ameet/strong-opinions-weakly-held-a-framework-for-thinking-6530d417e364)[^2].
Again, the idea is, "you should care about things, but don't care so much that it gets in the way of organizational
forward progress".

Again, this sounds like a great idea, but my thesis is that it doesn't actually work that well in practice.  Let's look
at why not.

## Two words: power dynamics

There're a bunch of reasonable critiques you can make about D&C, but in my opinion, the most fundamental is the role of
power and decision-making.  My claim is that "disagree and commit" _only_ works well in the absence of a power
differential between the parties.  If there _is_ a power dynamic at play, D&C almost always turns into "disagree and
commit, _OR_ something really bad is going to happen to you."[^3]  Consider, for example, the somewhat ironic "request"
by current Amazon CEO Andy Jassy to ["disagree and commit" on Amazon's return-to-office policy](https://www.theverge.com/2023/8/28/23849754/amazon-ceo-andy-jassy-remote-employees-return-to-office).
The subtext[^4] there was "disagree and commit to returning to the office, or you'll be fired".

Not every request to "disagree and commit" is going to have as blatant of a consequence attached.  But in a culture
where D&C is normalized, in any sort of conflict it's common for someone involved to eventually say "We need to make a
decision on this, will you disagree with me and commit to my approach?"  If the person saying this is in a position of
power (examples: maybe they're your boss, maybe they're a more senior engineer, maybe they're a white male and you are
not), the subtext will _always_ be "do it my way or else".  Always.  EVEN IF they don't mean it that way, that is how
the person in less power will interpret it.

But let's say that never happens.  Suppose you're a new engineer at TechBroCo and the director of your organization
tells you on your first day "We have a 'disagree and commit' culture here," but it never comes up again.  How will that
shape your perception of the organization?  Will you _ever_ feel comfortable standing your ground on an issue if you
think it's important enough?  I mean, maybe, but my guess is that if you feel comfortable standing your ground it's
because you've been afforded a lot of privilege.

But it gets worse.  Let's say that the power dynamics are inverted.  Let's say that the people who are in positions of
authority _always_ defer to the people with less authority.  The boss lets the engineer do what they want instead of
putting their foot down.  Even in this scenario, there's an implied threat with D&C: "I'll disagree and commit to your
approach... _but you better not fuck it up_."  Again, the person in power may be the nicest, most well-intentioned
person on the planet, and this will still be the message that the person with less power hears[^5].

The moral of the story here is that power dynamics make everything worse, and there's always a power dynamic.

## The power of communication

I've maybe developed a reputation on this blog for complaining about things without offering solutions, but I think in
this case I actually have a decent (but not perfect) solution: more transparency and better communication, particularly
by those in power.  Instead of saying "Will you disagree and commit to my approach?" your boss could instead have a
frank conversation with you: "I am making this decision.  These are the reasons why I am making this decision.  I know
you disagree with this approach, and I have listened closely to your concerns and objections, but this is the direction
we are going."  Or, alternately, "I am making the decision to let you try your approach.  I have listened to your
arguments and concerns, but I also need you to understand that these may be the consequences if your approach doesn't
pan out."

These are _much_ harder and more stressful conversations to have than throwing around catchy slogans like "disagree and
commit".  But it _is_ possible to have these hard conversations in a way that communicates support and empathy, and,
frankly, they're more honest.  If you, as a person with more power, are able to consistently show the people around you
that you a) listen to them, b) care about them, and c) are doing the best you can for them, you're going to have (in the
long run) a much happier and more productive team.

But that's a hell of a lot harder than asking people to disagree and commit.

## Postscript: social capital

The post is getting long but I have one last topic I want to cover before wrapping up.  The previous section was
targeted at people in positions of authority, but I also want to share a concept that is applicable to everyone,
regardless of your current power dynamics.  This concept is called "social capital"[^6].  The idea behind social capital
is that everyone has a certain amount of power or sway that they can spend in conflict scenarios.  But when you run out
of social capital, then you become ostracized, shunned, or have other negative consequences.

To make this a little more concrete: if you are on an engineering team, and you object to _every single change or
proposal_ that comes across your desk, eventually people are just going to stop asking for your opinion.  It's the "I
already know Jimmy[^7] is going to object to this idea so why bother asking him?" phenomenon.

The reason I like this framework is that it inherently captures the power dynamics at play: everyone has a different
amount of social capital they can spend in a particular relationship.  If you're the boss, you have a _lot_ of social
capital with your reports just by the nature of your position, but not very much with the CEO of your company: if the
CEO knows your name, it's probably not a good thing.  If you're a white male on the team, you inherently
have more social capital than the Black woman.  But here's the thing: regardless of your position, _eventually_ your
social capital will run out.  You'll become the squeaky wheel that everyone ignores.  Someone will complain about you to
your boss.  People will start going behind your back to get stuff done.

But here's the other thing about the social capital framework, is that you can build more of it!  You can build social
capital by compromising, by listening to those around you, by going along with their proposals even if you don't
personally like them.  In short, by becoming someone who is easy to work with and someone who cares about their
colleagues.

From this perspective, if you are aware of the social capital you have, you can start making informed decisions: "I feel
really strongly about _this_ decision, so I'm going to spend some of my social capital to argue hard against it.  This
_other_ decision doesn't actually matter that much, and I think I'm on thin ice with that person anyways, so I'm not
going to push against it that much because I'd like to keep the relationship working."[^8]

So there you have it: my thoughts on "disagree and commit".  Next time, we're going to totally switch gears and talk
about graph theory!

Thanks for reading,

~drmorr

[^1]: This is a must-read, by the way, very well-crafted story and good writing.

[^2]: As in last week's post, I have no idea what the origins of this saying are, and it's almost impossible to find
    because internet search has gotten so terrible.  That Medium article claims, at least, that the idea was originally
    invented by Stanford University professor [Paul Saffo](https://saffo.com/about-paul-saffo/).

[^3]: I believe this is true even if the person in the position with more power has 100% the best intentions: there are
    so many stories of bad behaviour in tech that the person with less power will feel pressure to go along with the
    person in power even if there is legitimately no risk of retaliation in this specific circumstance.

[^4]: Actually it wasn't even subtext... Jassy basically said the quiet part out loud here.

[^5]: I once had an engineering leader tell me that I needed to "get over" this sort of knee-jerk panic response, which
    let me tell you, did not help me "get over" anything at all.

[^6]: I'm not 100% sure I'm using the right term here; the [Wikipedia article](https://en.wikipedia.org/wiki/Social_capital)
    on social capital frames the concept by looking at network effects in a group or society, whereas I use the term
    from an individual perspective.  Whatever, I'm not a sociologist, just go with it.

[^7]: No Jimmy’s were harmed in the creation of this blog post; all similarities to any Jimmy in real life, whether real
    or imaginary, are purely unintentional.

[^8]: If you've been paying attention, your response might be "Isn't this just D&C and/or 'strong opinions, weakly held'
    in disguise?"  But, no, I don't think it is.  It's not just some pithy slogan that buries all the relational aspects
    of the situation; instead, it's a recognition that _most_ of your job is relationship management, and it frames your
    engagement with the people involved as a core part of the process.
