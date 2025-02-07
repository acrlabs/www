---
title: Writing a Kubernetes Scheduler in Rust
authors:
  - drmorr
datetime: 2023-07-31 11:00:00
template: post.html
---

Alrighty, in our last blog post we gave a quick intro to Applied Computing and what we're doing here. In this post,
we're going to dive right in to a (hopefully) fun technical topic: how to write a Kubernetes scheduler in Rust.

## What, you didn't want to start with something easier?

Nah. Where'd be the fun in that?

## Seriously though. That sounds hard. Why?

You're right, it is hard. But my general approach to problems is to start by solving the hard problem, and then worry
about the easy problems later. After all, if you start by solving the easy problems, you often find that you've backed
yourself into a corner and made the hard problem _even harder_. But, "why?" is a fair question to ask here. Kubernetes
already has a scheduler, and it works pretty well in most cases. On top of that, 95% of the Kubernetes ecosystem is
written in Golang, and all the libraries, tools, and support for Kubernetes assume that you're working in Go. So why are
we writing a new scheduler in a non-standard language?

Well, let's back up a second. We're not going to write a full-featured Kubernetes scheduler out of the gate (not yet, at
least!) The main goals of this particular project are to a) understand a bit more about what goes on "behind the scenes"
in Kubernetes scheduling, and b) evaluate whether Rust is a feasible language for Kubernetes development. So our target
in this project is to build the dumbest possible Kubernetes scheduler just to see if we can get something to work.

By the way, I'm going to assume some degree of familiarity with both Kubernetes and Rust in this post, which may limit
my audience somewhat, though I'll try to explain some concepts as they come up.

## The Prelude
As a prelude[^1] to this post, let's take a look at our goals in a bit more detail:

1. **Understanding what goes on "behind the scenes" in Kubernetes scheduling**. Most Kubernetes developers "know" how
    scheduling works, at least at a high level: a new pod comes in, the Kubernetes scheduler picks it up and tries to
    find a node that satisfies all the pod's scheduling constraints, and then it "binds" the pod to the node if it
    matches the constraints, or it marks the pod as "unschedulable" if no such node exists. But there's actually a bit
    more to it than that, so we'll explore some of the details in this project.
2. **Evaluate whether Rust is a feasible language for Kubernetes development**. We're going to be using the [kube
   crate](https://github.com/kube-rs/kube) as a part of the kube-rs project, which also relies on the [k8s-openapi
   crate](https://github.com/Arnavion/k8s-openapi) to actually bring in all the Kubernetes object types. The k8s-openapi
   crate is by-and-large auto-generated from the Kubernetes API spec, and the kube crate adds a bunch of nice-to-haves
   on top of that, but are they actually suitable for developing something as low-level as a scheduler? We'll find out
   more in this post.

Lastly, before we get into the weeds, note that we're going to be doing some comparisons to [client-go](https://pkg.go.dev/k8s.io/client-go)
and the [controller-runtime](https://pkg.go.dev/sigs.k8s.io/controller-runtime) libraries. These provide, as you might
expect, the standard way to interact with the Kubernetes API and write a custom controller in the Go ecosystem. Both the
kube crate and k8s-openapi crate try to emulate the experience of using the Go libraries as much as possible, but there
are a few differences, which we'll call out as we come across them.

## Enough talk. Can we see some code, please?

You bet! Let's take a look at the skeleton for our scheduler. The kube crate provides an API that is similar to the
controller-runtime API for building custom controllers, so can we use that for our scheduler? At first glance it sounds
a little weird, because controller-runtime is really targeted at writing "[operators](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/)"
that manage Kubernetes "[custom resources](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/)".
But there's nothing that says we can't have a controller that's managing core Kubernetes resources like Pods, we just
need to make sure we're not fighting with any of the built-in control loops that are trying to manage those same
resources. In this case, luckily, there is a [field in the PodSpec](https://kubernetes.io/docs/tasks/extend-kubernetes/configure-multiple-schedulers/#specify-schedulers-for-pods)
that will prevent kube-scheduler from trying to schedule our pods.

So here's the main loop of our skeleton controller:

```rust
#[tokio::main]
async fn main() -> Result<(), ()> {
    let client = Client::try_default().await.unwrap();
    let pods: Api<corev1::Pod> = Api::all(client.clone());
    let watch_pending_pods =
        watcher::Config::default().fields("status.phase=Pending");
    let ctrl = Controller::new(pods, watch_pending_pods)
        .run(reconcile, error_policy, Arc::new(Context { ... }))
        .for_each(|_| future::ready(()));
    tokio::select!(
        _ = ctrl => info!("controller exited")
    );
    return Ok(());
}
```

Just like in Go, we're going to be using [shared concurrency](https://en.wikipedia.org/wiki/Concurrent_computing) for
our scheduler, though concurrency in Rust is a bit different than in Golang. The kube crate uses [tokio](https://tokio.rs/)
as its concurrent execution runtime, which is a well-supported library in the Rust ecosystem, so that's what we'll be
using here as well. In the first line, we create the core Kubernetes client object using the `try_default` method. One
nice feature here is that `try_default` will try all the different ways of constructing a client, either from within the
cluster or using a local kubeconfig file; in contrast, client-go expects you to tell it whether it's running inside or
outside the local cluster. You can argue about which pattern is better, but the nice thing about the Rust implementation
is I can test out my scheduling code without having to figure out how to get it inside a pod in the cluster.

Next up, we create an API client for watching Pending pods, and then run a reconcile loop to do something with them.
Unlike controller-runtime and client-go, we have to create different API clients for each type of object we want to
query, and pass in a clone of the base Kubernetes client. The base client is actually a reference-counted pointer, so
calling clone() on it isn't horrendously expensive. But still having all these different API structs floating around
could conceivably get a bit annoying[^2].

Lastly, we configure the core watcher for our controller; we tell it to just watch for pending pods, and have it call an
(asynchronous) function called `reconcile` when a new pending pod arrives. Let's take a look at that next:

```rust
async fn reconcile(
    pod: Arc<corev1::Pod>, ctx: Arc<Context>
) -> Result<Action, AnErrorType> {
    if is_pod_bound(&pod) {
        return Ok(Action::await_change());
    }

    // 1. select a node for the pod
    // 2. bind the pod to the node

    return Ok(Action::await_change());
}
```

Ok, first thing to note is the `Context` argument. That's a user-provided struct that gets passed into the reconcile
function, so you can pass extra data or whatever around. That's handy, though we won't use it (much) here. The reconcile
function also returns an `Action`, which tells the controller when to next trigger the reconciler. There's two different
`Action` types, `await_change` and `requeue`, which map directly into the controller-runtime paradigm.

The only other thing of interest in the above snippet is the `is_pod_bound` block; this is a helper function that I
wrote to check if the Pod has already been bound to a node (we'll talk about _how_ we check this a bit later). For right
now, the important thing to note is that we have to check it---controllers are supposed to be idempotent, meaning that
if the reconcile loop gets called with the same pod twice in a row, the second call shouldn't try to do something
different than the first one. In this case, we just sidestep the issue by doing nothing.

## Step 1: Lessons in node selection

Ok, now we've got the scaffolding in place, let's try to actually schedule some stuff. Since our goal is not to write a
real scheduler, we're just going to do the dumbest possible thing and pick a node at random. The way to do this is by
setting up an [informer](https://aly.arriqaaq.com/kubernetes-informers/) on the nodes, which under the hood will
maintain a client-side node cache without having to query the Kubernetes API server all the time. This is fairly
standard stuff, so I'm not going to post the code here. Instead, let's look at the node selection logic itself:

```rust
async fn select_node_for_pod(
    pod: &corev1::Pod, ctx: &Context
) -> Option<corev1::Node> {
    let mut node: Option<corev1::Node> = None;
    let mut maybe_candidate: Option<corev1::Node> = None;
    {
        if let Some(candidate) = ctx.node_store.state()
                .choose(&mut rand::thread_rng()) {
            maybe_candidate = Some((**candidate).clone());
        }
    }

    if let Some(candidate) = maybe_candidate {
        node = Some(candidate.clone());
        break;
    }

    return node;
}
```

Pretty straightforward. A couple things in here tripped me up, though. First is that `rand::thread_rng()` does _not_
play nicely with Rust's async implementation, so you need to make sure it falls out of scope before you do any async
operations. That's why it's in its own block. (Note that I'm not actually _doing_ anything async here, but in the full
scheduling code I do).

Secondly, you'll note the kindof obnoxious cloning of `Some(candidate)`. Actually as I was writing this post I realized
that `Option<T>` in Rust does implement `Clone` in the sensible way, so you can simplify the second block in this code a
little bit to something like the following:

```rust
if maybe_candidate.is_some() {
    node = maybe_candidate.clone();
    break;
}
```

But, the first block of code, where we pull a random node out of the node store, gives us an `Arc<Option<Node>>`, and if
you need to pull that `Node` out of its `Arc`, and then stick it back in an Option, there's not a great way to do that
(that I'm aware of, at least).

And anyways, the broader point I'm trying to make here is that _almost every_ field in Kubernetes object specifications
is optional, which means that _almost every_ field in Rust is an `Option<T>`, which means you're going to be writing a
lot of this type of code. Now I guess this is marginally better than Go, which just blithely sets everything to `nil`
and doesn't force you to do error checking, and you have to remember to do it all by hand, but... I don't love the
interface here.

## Step 2: And in the darkness, bind them

Ok, so, we've selected a node, now---how do we bind the pod to it? If you poke around in the API documentation for
client-go, there is a Bind API in the PodsInterface (specifically, in the [PodExpansion interface](https://pkg.go.dev/k8s.io/client-go@v0.27.4/kubernetes/typed/core/v1#PodExpansion),
which says in the docs: "The PodExpansion interface allows manually adding extra methods to the PodInterface.")
Unfortunately, the k8s-openapi crate doesn't have this manual extension to the interface, so we're going to have to do a
bit more work.

Let's look at the client-go source and see what the Bind call actually _does_---well, after a bit of digging, we discover
that it's creating a [v1/Binding](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.27/#binding-v1-core)
Kubernetes object. And, fun fact, if you look up the [code definition](https://github.com/kubernetes/kubernetes/blob/98358b8ce11b0c1878ae7aa1482668cb7a0b0e23/pkg/apis/core/types.go#L5009)
of this object, it says:

> Binding ties one object to another; for example, a pod is bound to a node by a scheduler. Deprecated in 1.7, please
> use the bindings subresource of pods instead.

Hmmmmm, interesting, I didn't realize that pods _had_ a binding subresource? Ok, let's try to query one of those and see
what it looks like. I'm running a pod called nginx in my cluster, let's see what it says:

```
> kubectl get pod nginx –subresource=binding
error: invalid subresource value: "binding". Must be one of [status scale]
```

Welp. That didn't work. Looks like `kubectl` has the subresources it can query hard-coded in. What if we just try to get
the raw object?

```
> kubectl get --raw /api/v1/namespaces/default/pods/nginx/binding
Error from server (MethodNotAllowed): the server does not allow this method on the requested resource
```

Oh. Well then. That's annoying. Can you POST a binding? I _could_ waste a bunch of time trying to figure out the right
curl command and certificates and nonsense, or I could just write some code. Let's do the latter. Turns out the
k8s-openapi crate does include a `create_pod` method for Bindings, which creates the Binding object as a subresource:

```rust
let binding = corev1::Binding {
    metadata: pod.metadata.clone(),
    target: chosen_node_ref,
};
match corev1::Binding::create_pod(
    pod_name.as_str(),
    pod_namespace.as_str(),
    &binding,
    CreateOptional::default(),
) {
    Ok((req, _)) => {
        // Actually send the request
    },
    Err(e) => {
        error!("failed to create binding object: {}", e);
    },
}
```

The `create_pod` method _just_ creates the request object, it doesn't send it anywhere. It takes a little bit of doing
to _actually_ send the request over the wire, and I've omitted that code here, because it's not very interesting. But,
lets run it and see if it works...?

Well, hold up, this begs the question of "how do we know if it actually works?" Which takes us back to the
implementation of `is_pod_bound`:

```rust
pub fn is_pod_bound(pod: &corev1::Pod) -> bool {
    if let Some(spec) = &pod.spec {
        if spec.node_name.is_some() {
            return true;
        }
    }
    return false;
}
```

Once again we have to do some `Option<T>` shenanigans because the `PodSpec` field is _technically_ optional, even though
you'd never create a real pod without a `PodSpec,` but---if you read the [documentation](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.27/#podspec-v1-core)
for the `PodSpec,` it claims that setting the `nodeName` field in the `PodSpec` skips a bunch of scheduling shenanigans,
and just directly runs the pod on the node[^3].

So---let's run this and watch it break horribl---

```
> kubectl apply -f pod.yml
> kubectl get pods
NAMESPACE  NAME   READY  STATUS   RESTARTS  AGE
default    nginx  1/1    Running  0         4s
```

Oh. Ok. That... worked? Huh. I was not expecting that.

So anyways, it appears as if, when you create a pod binding subresource, something in the Kubernetes source code sets
the `nodeName` field in the PodSpec, and then something else sends the pod straight to the kubelet on the node to start
running it[^4].

## Step 3: The kubelet strikes back

This section will be pretty short, and probably something most Kubernetes folks already know, but recall that the
_kubelet_, not anything else---not the scheduler, not controller-manager, not a human---gets to decide if a pod can run
on a node or not. If the kubelet decides (for _whatever_ reason) that the pod can't run on the node it's been bound to,
it marks the pod as Failed. This is, maybe, a bit problematic, say in the event that your scheduler picks a node that
doesn't meet the pod's scheduling constraints. It means that the scheduler will never try to reschedule the pod
elsewhere, and a human is gonna have to come in and clean things up[^5].

In the code we walked through above, we don't check _any_ scheduling constraints; in the full scheduler code on GitHub,
the scheduler checks two constraints: resource requests (just CPU and memory), and node selectors. So if those are the
only scheduling constraints that your pod uses, well, congrats, it'll run! Otherwise... you're probably going to be out of
luck. So maybe don't use this for your production systems.

But, if you _do_ use it in production, please tell me what happens.

## So, what did we learn?

Ok, let's go back to our two goals and see what we learned. Firstly, we've done a bunch of code spelunking and
experimentation to learn how Kubernetes scheduling _actually_ works, and secondly, we built a (very minimal) Kubernetes
scheduler in Rust! There are a few quirks and hiccups along the way, but overall I was really pleasantly surprised with
how complete the Kubernetes development story is in Rust. Definitely want to shout out to [@clux](https://hachyderm.io/@clux),
the maintainer of the kube-rs project (who, by the way, noticed my scheduler and [was excited](https://hachyderm.io/@clux/110731398508176068)
about it!)

So, will I be writing a full-fledged Kubernetes scheduler in Rust? Well, you're gonna have to come back for a future
post on that one, this one's already way too long as it is.

Thanks for reading,

~drmorr

[^1]: Hehehhehe, that's a joke which is funny because a lot of Rust libraries have a "prelude" import that sets up or
    configures the library for use, you know what, just [read the docs](https://doc.rust-lang.org/std/prelude/index.html).

[^2]: _Technically_ client-go does the same thing, it just bottles up all the different API clients into a `Clientset`
    and uses Go's nested interface desugaring to make calling the individual clients easy.

[^3]: Note that---I _believe_---the documentation is actually lying here. If you set the `nodeName` field in the
    podspec, the scheduler doesn't do anything. The kubelet is actually the one watching for the `nodeName` field, and
    it will directly run anything that has this set. See my code spelunking below.

[^4]: And hey, we can verify that with a little bit of code spelunking.  [Here](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/framework/plugins/defaultbinder/default_binder.go#L51-L51)
    is where kube-scheduler binds a pod to a node; [here](https://github.com/kubernetes/client-go/blob/master/kubernetes/typed/core/v1/pod_expansion.go#L50)
    is where client-go makes the API call, and you can see it's creating a binding subresource.  [Here](https://github.com/kubernetes/kubernetes/blob/98358b8ce11b0c1878ae7aa1482668cb7a0b0e23/pkg/registry/core/pod/storage/storage.go#L169)
    is where Kubernetes responds to the API call and persists the pod object to etcd, and you can [see](https://github.com/kubernetes/kubernetes/blob/98358b8ce11b0c1878ae7aa1482668cb7a0b0e23/pkg/registry/core/pod/storage/storage.go#L166C14-L166C44)
    it's acting as a subresource. You can also see the `LegacyBindingREST` object, which does not act as a subresource.
    Lastly, [here](https://github.com/kubernetes/kubernetes/blob/98358b8ce11b0c1878ae7aa1482668cb7a0b0e23/pkg/registry/core/pod/storage/storage.go#L237)
    is where it sets the `nodeName` in the podspec. And just for funsies, [here](https://github.com/kubernetes/kubernetes/blob/98358b8ce11b0c1878ae7aa1482668cb7a0b0e23/pkg/kubelet/config/apiserver.go#L64-L64)
    is where kubelet watches for pods with a matching `nodeName` and sends them on to the kubelet main loop to be run.

[^5]: Oops.
