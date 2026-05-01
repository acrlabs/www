---
title: "Introducing SKEL: The SimKube Expression Language"
authors:
  - drmorr
datetime: 2026-04-27 11:00:00
template: post.html
---

<figure markdown>
  ![An outline of a purple octopus with a poorly-drawn skull and femur bones for each of the tentacles.](/img/posts/skel.png)
  <figcaption>This is what the inside of an octopus looks like, right???</figcaption>
</figure>

We [just released SimKube 2.5.0](https://hachyderm.io/@drmorr/116409995083998309), which as I said on Mastodon, feels
like a big milestone for mainly "I like round numbers" reasons; but I think this is actually a pretty major release, as
it's the first SimKube release to include support for a bespoke DSL that I'm calling SKEL, or the SimKube Expression
Language.  SKEL opens up a lot of _really interesting_ possibilities for SimKube, so I wanted to spend some time in
this post talking about it!

## Why do we need SKEL?

As one of my friends likes to say, WPAYS?  This is an extremely dumb acronym that stands for "What Problem Are You
Solving?", which is, nevertheless, an important question to ask in many situations.  In this case, the Problem I'm
Solving™️ is that SimKube trace files (which, as you may recall from previous hot garbage like [Anatomy of a
Trace](./2025-06-09-anatomy-of-a-trace.md), form the heart of the record-and-replay functionality in SimKube) are really
hard to work with.

The main issue at play is that trace files are saved in the [msgpack](https://msgpack.io) format, which is a binary file
format that is similar, but not completely identical to, JSON.  The decision to use msgpack was made extremely early on
in the life of SimKube; I was looking for a file format that would be relatively compact but also easy to work with[^1],
and the tagline on the msgpack website is "It's like JSON, but fast and small," and that sounded great to me.  And, to
be fair, it is both of those!  The size difference between a SimKube trace file and the equivalent JSON text file is
about 70%[^2]!  The main problem is that, unlike JSON and [`jq`](https://jqlang.org), there are no really ubiquitous
tools for manipulating msgpack files.  The best thing I've found is
[msgpack-tools](https://github.com/ludocode/msgpack-tools), which lets you convert between msgpack and JSON; and, up
until recently, that has been how I've worked with my trace files: convert the trace to JSON, make some changes, and
convert back to msgpack.

This approach is fine, except that a) it's not very user-friendly, and b) the msgpack schema and the JSON schema are
very similar, but they are _not_ identical.  One of the big differences is that msgpack allows integer-valued map keys
and JSON does not.  And, in an unfortunate-but-somewhat-painful-to-fix design decision, SimKube trace files use integer
map keys to track pod lifecycle events: that is, information like "this pod ran for this many seconds before terminating
with this error code".  Because pod names are _not_ a stable identifier, we use a hash of the pod spec to identify these
lifecycle events, and that hash appears as a map key in the trace.

This is a problem for msgpack-tools: it can write out a JSON-like text file that includes these integer map keys, but it
is completely unable to convert _back_ to the msgpack format _from_ this JSON-like text file because it first tries to
parse the text file as JSON.  This means that my "write to pseudo-JSON, make some changes, write back to msgpack"
workflow is now entirely broken.

## If it's so hard, how does anybody else ever work with msgpack???

The main way that msgpack appears to be used in other applications is a serialization format for over-the-wire
communication: meaning that you've got two programs on either end of a network connection that need to talk to each
other.  So, while msgpack doesn't have a lot of CLI tools to support its use, it _does_ have libraries to support
serializing and deserializing msgpack for basically every programming language on the planet.  So one option that I
considered for solving the "trace modification problem" is "just make people write code".  We could provide a "SimKube
trace modification library" that handles some standard sorts of operations, but otherwise allows users to write code to
change the trace how they see fit using a msgpack library of their choice.  This has the advantage of being _extremely_
flexible, because users can do whatever they want to the trace, but also a bit of a usability nightmare: users now have
to understand the internal trace file format, and if that format ever _changes_, it's gonna break a ton of scripts[^3].

So instead, I opted for a narrower approach that still gives users flexibility, but doesn't require them to understand
the full internal workings of the trace file, and gives me the ability to change things about the trace file format in
the future without breaking things for existing users: a domain-specific language.  This approach, while requiring a bit
more up-front work on my side, also means that I don't have to provide "simkube libraries" for every programming
language under the sun; I can continue to use Rust for everything, and users just have to learn an entirely new language
all on their own!  That seems like a fair tradeoff, right?  Right???

## Designing SKEL

I've not written a full-fledged DSL before, so this was also just an exciting opportunity for me to dip my toes in a new
area of computer science.  Before I started this whole project, I was dimly aware that there were things like "abstract
syntax trees" and "lexers" and "parsers" and a whole bunch of other nonsense.  But before diving into any of those
details, I decided to just settle on a syntax for SKEL.  I wanted the language to be relatively simple and intuitive,
but I also knew that I had a wide variety of operations that it needed to be able to support.  So the first thing I did
was brainstorm syntax possibilities in a Notion document.  I tried to make sure that the syntax could handle all of the
transformations that I knew I needed, as well as being relatively extensible for the future.

To keep the language simple and tractable to implement, I set a few requirements for myself:

1. Statements should be executed independently of each other; the only coupling between statements is how the impacts
   the underlying trace file[^4]
2. There is no flow control (no loops, no conditionals, no gotos): every SKEL file is executed one line at a time in
   order
3. Since we're focused on modifying trace files, each statement needs two parts: a _selector_, which specifies what bits
   of the trace file to operate on, and an _action_, which says what to do with those bits.

I went through a few different options, including more of a SQL-like syntax, but I finally settled on a functional
approach based on the third criteria above.  Every statement in SKEL has the following syntax[^5]:

```text
function(selector, action);
```

A SKEL file then just looks like a sequence of these statements.  The supported functions are pretty self-explanatory;
right now we just support two, `remove` and `modify`; the `remove` function un-sets a field in the matching objects, and
the `modify` function changes the value of a field in the matching objects.  All of the magic is what happens _inside_
these function calls.

### SKEL selectors

If you recall from earlier posts on this blog, a SimKube trace is just a timeline of events: each event has a timestamp
and a list of Kubernetes resources to apply or delete.  So naturally, there are two types of selectors that SKEL
supports: timestamp selectors and resource selectors.  Timestamp selectors use the magic variable `@t`, and you can
write any sort of relative or absolute query using this variable; `@t > 5m` means "all the events after the 5-minute
mark in the trace file", for example.

Resource selectors are a bit more complicated, but just slightly; a SKEL resource selector uses jq-style "dot-notation"
to dig into the internals of a Kubernetes resource: `metadata.labels."simkube.dev/whatever" == "foo"`[^6] selects all of
the resources in the trace that have a `simkube.dev/whatever=foo` label assigned to them.  And of course, you can
combine these two selectors: `@t > 5m && metadata.labels."simkube.dev/whatever" == "foo"` means "select all resources in
the trace that were changed after 5 minutes, and have the appropriate label applied to them".

The epiphany that I had while designing the syntax was that SKEL selectors define a _set_ of events; the right way to
think about writing SKEL commands is to decide what set of events you are trying to target, and then narrow in on that
set using the `&&` operator.  But, sometimes, in order to narrow in on the set of events, you need to be able to
reference _other_ fields in the resource.  For example, you might want to target all resources that have a node selector
matching the value of a particular label on that resource.  This is where SKEL variables come into play!

```text
$x := metadata.labels."simkube.dev/whatever" | exists($x)
    && spec.template.spec.nodeSelector.myNodeSelector == $x
```

Here, we are defining a variable `$x`[^7] that _points to_ the value of the `simkube.dev/whatever` label; every
statement in a SKEL selector must be a boolean, so in this case we just assert that this label is actually set on the
object, and discard it otherwise.  Then, the second statement narrows the scope to only target resources whose
`myNodeSelector` matches the value of the `simkube.dev/whatever` label applied to that resource.  This is very cool, in
my opinion!

There's one last feature that SKEL selectors support, which are wildcards.  Some Kubernetes fields (like the
`containers` field in the `PodSpec`) are arrays; we can target individual elements of those arrays using standard
bracket notation (e.g., `spec.template.spec.containers[2]`), but in some cases we may want to target every element of an
array; we can do that using the `*` wildcard.  For example, `spec.template.spec.containers[*].image == "ubuntu:latest"`
targets _every_ container using the `ubuntu:latest` Docker image.

You can also mix-and-match variables and wildcards:

```text
$x := spec.template.spec.containers[*] | $x.image == "ubuntu:latest"
```

defines `$x` as the set of full container specifications whose image field is `ubuntu:latest`.  Super cool!  I love how
a (relatively) small set of selection operations has given rise to a very rich ecosystem of capabilities.

### SKEL actions

This section is comparatively shorter than the selectors section; that's because, once you've defined a set of events
and resources to take action on, actually _performing_ those actions is pretty straightforward.  For example,

```text
remove(metadata.labels."simkube.dev/whatever" == "foo", spec.template.spec.nodeSelector);
```

just removes the `nodeSelector` field from every resource with the `simkube.dev/whatever=foo` label applied to it.
Similarly, the `modify` command would allow you to _change_ the value of the nodeSelector instead of removing it.
Of course, variables and wildcards also work inside the "action" side of the command, which lets you build up extremely
targeted operations to your trace file as well.

## Implementing SKEL

I'll try to keep this section brief, but for all you programming language theory nerds out there[^8] I'll talk a bit
about the implementation details of SKEL.  The core library that I'm using is called [pest](https://pest.rs), which
continues in the grand tradition of "cool Rust projects with really questionable names"[^9].  Pest implements a [Parsing
Expression Grammar](https://en.wikipedia.org/wiki/Parsing_expression_grammar) library in Rust. To use it, you define the
DSL grammar in a .pest file, and Pest will automagically convert the grammar into a set of Rust enums representing all
of the grammar’s rules.  So, for example, one of the PEG rules in my pest file looks like the following[^10]:

```text
conditional_test = { resource_path ~ comparator ~ (val | resource_path) }
```

This defines a grammar rule called `conditional_test` (accessed in the Rust code as `Rule::conditional_test`), and a
`conditional_test` consists of a `resource_path` followed by a `comparator`, and either an atomic value (like a string
or an integer) or another `resource_path`[^11].

One of the interesting things about Pest is that the library itself asserts which rules are valid in which positions, so
it is idiomatic in Pest code to sprinkle `.unwrap()`s and `unreachable!()`s everywhere based on where you are in the
parsed expression.  This takes a bit of getting used to.

Now if you know anything about designing programming languages, you're probably expecting that the next words out of my
mouth are going to be "abstract syntax tree".  But, you'd be wrong.  An abstract syntax tree is a data structure that,
more-or-less[^12], lets you unambiguously specify order of operations: in other words, all those pesky rules you learned
in grade school about whether you add things before you multiply things.  However, for SKEL, this turns out to be
entirely unnecessary: there is one unambiguous way to parse a SKEL file, and that's from left-to-right.  I no longer
have an abstract syntax tree, I have more of an... abstract syntax path.  This turns out to be very handy.  It means
that all of the logic for SKEL is contained in about 2000 lines of code, much of which is pretty straightforward
"convert this Rule into this data structure".

Anyways, once I've loaded everything into my ASP, I can just traverse through all the statements in the file and apply
them to the input trace one-by-one.  The mechanics of this are pretty straightforward, the most complicated bits were
just about keeping track of the variable state so that I can correctly know which variables are defined at which point
in time, and to what values they point.

There was one open question about the order in which statements should be applied: should I apply each statement to the
_entire_ trace file before moving on to the next one?  Or should I loop through the trace file once, and apply every
statement in order to each event?  In the interest of "keeping statements and effects local", I elected for the former;
in other words, once an event in the trace has been processed by all SKEL statements, it will never be touched again.
It "feels like" this will be easier to reason about in the long run, but I don't actually know for sure.

## Deleting code feels good man

I'll just wrap this post up by saying that SKEL is actually the second attempt I've made to solve this problem; about a
year ago, I wrote a bunch of code to "validate" a trace file, and confirm that it won't cause any common problems in a
simulation (example of a common problem: a Pod needs a Secret injected as an environment variable, but the Secret isn't
defined in the simulation environment, which probably you do not actually want, and the value of the Secret doesn't
actually matter anyways because there's no code running in the Pod to use the Secret).  One of the features in this
validator allowed users to auto-apply fixes to the generated trace; unfortunately, for every class of problems, there
are many different types of fixes that you could apply.  In the Secret example above, for instance, you could _either_
remove the secret from the pod specification, _or_ you could create the secret with a placeholder value at the beginning
of the simulation.  And who knows?  Maybe _neither_ of these solutions is what you actually want to do.

The logic to keep track of these potential fixes, and which once were applicable at which times to what events, was some
of the ugliest, most complicated code in the entire codebase.  I had visions of expanding the feature, and eventually
making it so that you could even have user-editable "fixes", but the code was so gross already that I just kindof
abandoned it.  It worked!  But it wasn't pretty and I didn't want to add anything else to it.

However, with the advent of SKEL, I was finally able to just rip all that out and simplify a lot of things: now, instead
of auto-fixing issues, the SimKube validation code just prints out a sample SKEL file that will address the issues that
were detected in the trace; users can look at that and decide whether those are the correct fixes, or if they'd like
something different.  Then they can modify it how they'd like before applying the transformations and running a
simulation.  Even with all the complexity of the DSL and everything, this is a much better approach!  And I'm very happy
about it.

Everything we've talked about is now available in [SimKube 2.5.0](https://github.com/acrlabs/simkube/tree/v2.5.0) and
there's a bunch more details in [the documentation](https://simkube.dev/simkube/docs/skel/intro/) as well, but this has
been a really fun new addition to SimKube, and I think it's going to open up a lot of possibilities in the future!

I hope you enjoyed reading this as much as I enjoyed building it, and as always---thanks for reading.

~drmorr

*[DSL]: Domain Specific Language

[^1]: I was also looking for something that wasn't [protobuf](https://protobuf.dev), cuz I hate dealing with that
    format.

[^2]: You can get it down even smaller, to about 99% compression if you run the msgpack trace file through gzip
    compression; if you were to just gzip the equivalent JSON file, you "only" get about 94% compression.

[^3]: You know, because by that point I'll be wildly successful and will have [dozens](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNW14ZmpnZmh3OHc1ZzltdGk5MGMxeWtvdnhhYXlqNGhlOGpka20xNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kSlJtVrqxDYKk/giphy.gif)
    of people using SimKube!

[^4]: This decision "might" be a bad one; the implication is that the order of your statements matters.  If you modify
    all the pods to remove the `simkube.dev/whatever` label, and then later select pods based on the
    `simkube.dev/whatever` label, it will select nothing.  On the other hand, if you reverse the order of the
    statements, the selection set will be non-empty.

[^5]: Yes, all statements end with a semi-colon.  Don't at me, bro.

[^6]: Since most Kubernetes labels, annotations, and a few other fields use domain names (e.g. `simkube.dev`) for
    namespacing, there has to be a way for SKEL to differentiate between the usage of periods, hence the double-quotes
    around the label key.

[^7]: Perl called, they want their dollar signs back.

[^8]: I know some of you follow this blog, don't even try to hide it.

[^9]: Other projects in this category include: clap, anyhow, rustls (seriously, how do you even pronounce that???), and,
    of course, SimKube.

[^10]: Brand new sentence.

[^11]: If you're curious, you can see the [full grammar file](https://github.com/acrlabs/simkube/blob/main/sk-cli/src/skel/skel.pest)
    on GitHub.

[^12]: I am not a programming languages person, but I am 100% convinced that all of you who are PL people are already
    getting out your wallets to become paid subscribers so you can tell me how wrong I am in the comments.
