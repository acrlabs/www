---
title: "Frustrations with Version Control"
authors:
  - drmorr
datetime: 2026-02-23 11:00:00
template: post.html
---

Alright, it's been a long time since I've posted a good rant on here, so buckle up buttercup.  This one's about version
control.

## VCS?  CVS?  WTF?

Ok, a quick primer if you don't do software on the regular: version control is how we keep track of dozens or hundreds
of changes being made to a codebase by dozens or hundreds of engineers.  It's also, thanks to GitHub, how most
open-source projects publish their work.  It's _also_ also, mostly accidentally, how most software is backed up.  The
whole idea is, "we're tired of mailing around `SimKube.zip.v2.final.2.final.v0.4.no_really_final_this_time`[^1]; hey,
computers are good at tracking things, what if we made the computer track our computer changes?"

The first "version control system" (aka VCS) I ever interacted with was called, confusingly, CVS[^2].  It was
(apparently) revolutionary for its time, but I only ever had bad experiences with it.  See, one of the main things that
version control is supposed to solve is "what happens if two (or more) people change the same file at the same time?"
One could argue that dealing with conflicts like this is the sole job of version control, because if there are never any
conflicts it doesn't matter.  Needless to say, CVS was not very good at dealing with conflicts.

I moved fairly quickly from CVS to Subversion (aka SVN); I still didn't really know what I was doing, and I honestly
didn't spend much time with SVN, but I do remember that it made merge conflicts ever so slightly less painful than CVS.
However, this was around the time that Git was becoming extremely popular, and once I tried Git I never looked back.
The major improvement that Git made was the idea of "branches"[^3]: you could have multiple---dozens, hundreds,
even!---of different work streams going on the same codebase all at the same time, and none of them would ever conflict
with each other, because they all lived on separate branches!  It was truly revolutionary in my experience.  Branches
were cheap, lightweight, and easy to navigate back and forth, and you (the user) got to _choose_ when you wanted to deal
with the conflicts[^4].  It was still a pain to deal with the conflicts, but at least you had some control over it.

Then GitHub came along, and became synonymous with Git, and that's basically been the state of the world for the last
two decades.  Nevertheless, it hasn't been all roses and daisies over here in Git-land: Git is a _distributed_ version
control system, which introduces certain complexities, because (who know) distributed systems are hard[^5].  Also,
especially in the early days, the Git user experience was... challenging.  If you didn't really understand the internals
of the system, it was very easy to get your codebase into a bad state that was very difficult to recover from.  There
were limited affordances for new users to learn the system, and there's honestly been endless ink spilled on that topic
which I don't need to revisit here.  Suffice to say, there's been a [lot of
effort](https://jvns.ca/blog/2026/01/08/a-data-model-for-git/) in recent years put into making Git more approachable for
newcomers, which is honestly great to see.  And thanks to GitHub, basically everyone in software now interacts with Git
on a daily basis, and it's difficult to see that changing anytime soon.

## So we're done then, right?  Version control is solved.  Blog post over.

Wellllllll..... not quite.

See, Git itself is very unopinionated about how you use it.  There's lots of ways to accomplish the same thing task, and
teams adopting Git were left on their own to figure out what workflow worked best for them.  Specifically: when you
write code you usually want someone else to review that code before it "goes live" or "gets deployed" or "put in front
of users".  Ostensibly, at least, having a second pair of eyes on your code is a good way to catch bugs[^6].  When you
have dozens or hundreds of branches floating around (because they're free), figuring out how to review the changes on a
specific branch is a little challenging.  But then GitHub came along and said "The One True Way to interact with your
code is through forks, merges, and pull requests!".  And ever since then, the "pull request" model is the only thing
that most software engineers have ever encountered.

Now, pull requests in-and-of-themselves aren't awful.  Basically it shows a diff of changes between your branch and
whatever is "in production", and then you can leave comments on the changes and have a discussion about them.  The
problem is... How to put this nicely... the GitHub UI sucks.  Badly.  It always has, and it's only ever getting
worse[^7].  So while PRs themselves are fine, the experience of working with them on GitHub is unpleasant.  The main
issue is: someone requests that you change all your variable names arbitrarily, so then you sigh and go make the change
because you're effing tired of fighting about trivial nonsense all day every day.  Then you make a new commit and give
it a description like "addressing review comments".  Meanwhile, during the time you've been having this back-and-forth,
10 other people have made changes which means you need to merge their changes back into your branch before you can get
it reviewed again and then once you're ready for someone else to look at your code again, nobody can tell if you
actually addressed any of the comments on the PR or not, and also your commit history is filled with things like "fixed
things" and "merged so-and-so's changes back in" and "fixed more things" and "wrote a test" and etc.

The thing that is frustrating to me is that it doesn't have to be this way!  All we need is a way to a) make targeted
changes to a commit without having to create a new commit, and b) a way to see what changes were made since the last
time we reviewed the code.  But, because of the way that GitHub PRs work, (a) is incompatible with (b).  And because
GitHub is ubiquitous, it's very difficult to do anything about it.

## Enter jj stage right

It might surprise you to learn that a number of large, prominent companies have looked at this model and said "this
sucks, we're going to do it differently."  Google, Facebook, and a number of other companies have stopped using the PR
model, and instead use a concept of ["stacked diffs"](https://newsletter.pragmaticengineer.com/p/stacked-diffs).  The
short version is instead of reviewing an entire branch at a time, you can instead review each commit in isolation.  When
you're working on a new code feature, you create a "stack" of changes, and each change gets reviewed independently.
But---and here's the crucial part---while your heartless engineers are ripping apart your current changes, you can keep
developing new code on top of your previous changes.  And then, when you go back to address their totally unreasonable
comments, you just "drop down" to a lower level of the stack, address their changes, and then the rest of your change
stack automagically adjusts itself to incorporate those changes.

It's hard to overstate how much of a game changer this model is.  People who've worked with stacked diffs will do almost
anything to keep working with them in the future.  Just like Git made branches cheap and easy, tools that support a
stacked diff workflow make "editing code anywhere in your history anytime" cheap and easy.  The problem is, it is
extremely difficult to make this model work with GitHub.

Not for lack of trying, though: a number of tools have emerged over the years that try to blend the "stacked diffs"
mindset with Git/GitHub.  [Sapling](https://sapling-scm.com) was (one of) the first Git-compatible VCS that tried this
approach; a more modern attempt is [Graphite](https://graphite.com), which basically writes their own entire UI on top
of the GitHub UI.  I've tried both (along with several others) and bounced off of them pretty quickly; they're just
clunky and don't _actually_ make the experience of managing code any nicer.

BUT.  In recent years, a new project called [Jujutsu](https://www.jj-vcs.dev/latest/) (aka JJ) has come out of Google
which is changing all of that.  It is a completely new model for doing version control that is, nonetheless, totally
Git-compatible, and it's really gaining a lot of traction[^8].  JJ does two things extremely well: first, it completely
rethinks the Git UI/UX to streamline common operations.  Things that take two, three, or more commands in Git are a
single, well-documented command in JJ---specifically, it makes it extremely simple to navigate to any point in your
change history, make changes, and then navigate somewhere else, and have everything else auto-update.  Secondly, JJ
makes a "conflict" a first-class concept in the system: when you make (or merge in) changes that conflict, JJ
understands that what the conflict is and asks you to resolve it.  However, you can defer "resolving the
conflict" as long as you want; this is in contrast to Git, where if there is a conflict in your code, you must
immediately drop everything and resolve the conflict right then and there before you can do anything else.  Honestly,
given that the sole goal of a VCS is to help manage conflicts, it's a bit mind-blowing to me that it's taken us this
long to start treating "conflicts" as first-class citizens.

## So that's it, right?  You're using JJ for everything now, and I can finally stop reading this dumb post?

Well, again, no.

I've tried to completely switch over to JJ three separate times now, and I keep running into issues which make me switch
back to Git.  This isn't a knock against the JJ team, because it's a young, very ambitious project, and they're very
aware of all these issues, so I have a lot of optimism that these things will get fixed at some point in the future.
But for right now, I'm unable to make the switch, which is doubly-frustrating, because now any time I'm doing something
extra complicated with Git, I'm like "but this would be _so easy_ with Jujutsu!"

For posterity, here are the three big blockers I keep encountering:

1. Pre-commit hooks: I use [pre-commit](https://pre-commit.com) _extensively_ to do code linting, formatting, and other
   static analysis checks.  I also run the same pre-commit checks during CI to prevent "bad code" from accidentally
   getting merged.  Unfortunately pre-commit hooks don't make a lot of sense in JJ world; there are some efforts to
   support "pre-push" hooks instead of "pre-commit" hooks, but none of those have actually landed yet, and every time I
   push my code up to GitHub and then realize that I forgot to run my checks locally first and they're all failing, I
   get real sad.
2. Branch management: while JJ itself doesn't care about branches (called "bookmarks" in JJ-land), GitHub still cares
   about branches _A LOT_.  But because JJ doesn't care about branches, the tooling to keep branches in sync with GitHub
   is lacking.  The [tug alias](https://shaddy.dev/notes/jj-tug/) that some users have come up with does help _some_,
   but it doesn't always work, and keeping your bookmarks correctly pointed at the right code is a lot of manual
   juggling that I find to be really disruptive.  Again, I think the JJ team is aware of this and is working on it, but
   it's not there yet.
3. Merging code: This is related to the previous point, and is the reason I bounced off JJ most recently.  I normally
   use a "rebase" workflow on GitHub, to avoid a bunch of pointless and unhelpful "merge commits".  But when you rebase
   and merge an external system like GitHub, JJ is not currently able to track the ways in which your code has changed,
   and you end up with a whole bunch of dangling references/branches that (again) you have to clean up manually[^9],
   which again is a bunch of frustrating busywork.

There are some other issues that I have with JJ, mostly around the learning curve for its revset language and other
configuration aliases/options[^10].  But honestly, a steep learning curve doesn't bother me that much, I can get over
that.  It's the more fundamental "workflow issues" that are the bigger problem right now.

All that said, I'm _very_ excited for the future of Jujutsu and I will probably continue watching its changelog and
trying it out every few months until some of these issues get resolved.  It really does feel like the first genuine,
foundational improvement in how we do version control in twenty years.

As always, thanks for reading!

~drmorr

[^1]: Yes, I've done this before.  It's as miserable and awful as it sounds.  And yes, even in the year of our lord 2026
    there are still people who do this.

[^2]: Confusingly, this stands for "Concurrent Versions System", not "Control Version System" or "Consumer Value
    Stores".

[^3]: Yes, I know SVN has branches, but they are clunky and hard to use.

[^4]: Fun random aside: when I was in grad school, I would keep all my research papers in Git repositories.  The
    "master" branch would hold the pre-print version of the paper, and then when I submitted to a journal, I would
    create a separate branch specific to that journal.  That way I could keep all the "journal-specific" formatting
    requirements isolated from the "content".  Any time we got comments back on the paper, I would apply changes to the
    "source of truth", aka the "master" branch, and then merge the changes into the journal-specific branch.  It wasn't
    a _perfect_ system, but it worked pretty well, and was a heck of a lot easier to manage than having forty different
    versions of the same document for each journal we submitted to.

[^5]: TIL

[^6]: "Ostensibly" is doing a lot of heavy lifting in that sentence.  In practice, it turns out that "finding bugs by
    reading someone else's crappy code" is really hard to do, so most code review sessions devolve into "your lines are
    82 characters long, please keep them under 76 characters to enhance legibility" or "I hate your variable names,
    please change them all post haste".  Needless to say, these critiques rarely find any bugs.

[^7]: I know this is going to offend many people, but it's just because you've been Stockholm-syndromed into liking it.
    Seriously: why are there three separate tab bars?  Why is information duplicated five times in different places?
    Why is it so damn difficult to compare two different commits?  For that matter, why is "looking at the commit
    history" the least obvious link on the entire website?

[^8]: At least in the weird niche corners of the internet that I occupy.

[^9]: I found several blog posts/issues (for example, [this one](https://github.com/jj-vcs/jj/discussions/7848)) that
    seem to indicate this is sortof a solved problem, but it definitely wasn't working for me last week.

[^10]: There's a whole cottage industry of "look at my extremely complicated JJ config"-style blog posts that have
    cropped up in the last year or so.
