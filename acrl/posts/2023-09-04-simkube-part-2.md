---
title: "SimKube: Part 2 - Virtual Kubelet and the Brain"
authors:
  - drmorr
datetime: 2023-09-04 11:00:00
template: post.html
---

> **Author's Note**: This post is now somewhat out of date, since we are no longer using Virtual Kubelet inside SimKube,
> but instead using [Kubernetes WithOut Kubelet (KWOK)](https://kwok.sigs.k8s.io).  KWOK turns out to be somewhat more
> efficient than VK at large scale, and is a bit more full-featured for our purposes.  I'm leaving this post up for
> posterity, but may write a follow-up in the future describing how we work with KWOK.

This is the second part of a (at least) four-part series on simulation in Kubernetes. Here's the outline of the rest of
the series, I will update this with links to future posts as I write them:

* [Part 1](2023-08-28-simkube-part-1.md) (last week) - Why do we need a simulator?
* Part 2 (this week) - Building a simulated cluster with Virtual Kubelet
* [Part 3](2023-09-18-simkube-part-3.md) (in two weeks) - Recording traces and replaying them
* [Part 4](2024-02-26-simkube-part-4.md) (i dunno when) - Analyzing the data

## Introducing Virtual Kubelet

In my last post, I outlined the problem space and hopefully explained why having a working, scalable simulator for
Kubernetes will be useful. In this post, I'm going to dive into the implementation. All the source code that I'm talking
about here is available on our [GitHub repo](https://github.com/acrlabs/simkube) if you want something to reference as
we go along. And, full disclosure, this post involves a lot of staring at `kubectl` output, so I won't be offended if
you give it a pass :)

The core component that we're relying on for our simulator is the [Virtual Kubelet](https://virtual-kubelet.io/). This
was a project that was originally started by folks at Microsoft to allow the management of different Azure resources
through the Kubernetes API, and has now been extended to provide access to a bunch of different "external" resources via
the Kubernetes API.  The way it works is by running a pod on your Kubernetes cluster that exposes a fully-conformant
kubelet[^1] API. So, to the Kubernetes API server, it just sees another node that's been added to the cluster, but from
_our_ perspective, that "node" can be anything we want—an interface to AWS Fargate or Azure Batch, a Hashicorp Nomad
cluster, or, say, a mocked-out interface that doesn't actually _do_ anything[^2].

Here's the [interface](https://github.com/virtual-kubelet/virtual-kubelet/blob/72045b221b0e439ae5a409b527cd41e7bd430a0d/node/podcontroller.go#L47)
that a virtual kubelet implementation has to satisfy (for conciseness I'm omitting the `context` argument to each
function):

```go
type PodLifecycleHandler interface {
    CreatePod(pod *corev1.Pod) error
    UpdatePod(pod *corev1.Pod) error
    DeletePod(pod *corev1.Pod) error
    GetPod(namespace, name string) (*corev1.Pod, error)
    GetPodStatus(namespace, name string) (*corev1.PodStatus, error)
    GetPods() ([]*corev1.Pod, error)
}
```

This is a pretty straightforward set of [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete)
operations: the first three handle your "write" operations, and the last three let you read data about pods running on
the fake node. Since we're not actually going to _run_ anything, the implementation for our virtual nodes is going to be
straightforward:

```go
type podLifecycleHandler struct {
	nodeName string
	pods     map[string]*corev1.Pod
}
```

All we have to do is maintain a map from pod name to pod objects that are "running" on the node. `CreatePod` inserts the
pod object into this map[^3], and `DeletePod` removes it from the map. `UpdatePod` currently does nothing, though I may
extend it in the future. The various `Get...` operations just query the map and return the matching results.

The other half of the puzzle we need to solve is how to configure the node object that we are presenting. Virtual
Kubelet exposes a `NodeController` object which creates the node object inside `etcd` and handles all of the node
updates.  So all we have to do is tell the controller what our fake node "looks" like:

```go
nodeCtrl, err := node.NewNodeController(
	node.NaiveNodeProvider{},
	n,                        // <------ this is the node!
	self.k8sClient.CoreV1().Nodes(),
	node.WithNodeEnableLeaseV1(leaseClient, 0),
)
```

Here, `n` is a `*corev1.Node`, which is what will be returned when you run `kubectl describe node`. The cool part here
is that SimKube takes as input a Kubernetes node object in YAML format, and uses that as to construct the node in
`etcd`! So as a simulation runner, you can configure the nodes in your simulated cluster to match exactly what you have
running in production: all you have to do is `kubectl describe` a node in production, and then pipe that in to the
virtual kubelet pod! I think this is nifty.

So let's take a look at how all the pieces fit together. Here is the SimKube virtual kubelet pod in my cluster (I'm
cutting out all the irrelevant parts for brevity):

```
> kubectl get pods
NAMESPACE   NAME           READY   STATUS      RESTARTS   AGE
simkube     sk-vnode-q     1/1     Running     0          13h
...
> kubectl describe pod sk-vnode-q
Namespace:        simkube
Node:             test-worker/172.18.0.4
Labels:           app=sk-vnode
                  pod-template-hash=7bc95f4479
Annotations:      <none>
Containers:
  sk-vnode:
    Command:
      /sk-vnode
    Args:
      --node-skeleton
      /config/node.yml
    State:          Running
      Started:      Wed, 30 Aug 2023 21:05:52 -0700
    Ready:          True
    Mounts:
      /config from node-skeleton (rw)
Volumes:
  node-skeleton:
    Type:      ConfigMap (a volume populated by a ConfigMap)
    Name:      sk-vnode-configmap
    Optional:  false
```

Nothing too surprising here, we have a pod scheduled on the `test-worker` node, running the `/sk-vnode` command, and
taking some configuration from a node skeleton file. Let's see that file real quick:

```
> kubectl exec sk-vnode-q -- cat /config/node.yml
---
apiVersion: v1
kind: Node
status:
  allocatable:
    cpu: "1"
    memory: "1Gi"
  capacity:
    cpu: "1"
    memory: "1Gi"
```

So we're creating a node that has a single CPU and 1Gi of memory. Now let's see what nodes we actually have in the
cluster:

```
> kubectl get nodes
NAME                STATUS   ROLES           AGE   VERSION
sk-vnode-q          Ready    agent,virtual   13h   v1.27.1
test-control-plane  Ready    control-plane   2d    v1.27.1
test-worker         Ready    <none>          2d    v1.27.1
```

Well this is interesting! I've got three nodes in my cluster, a control plane node, a worker node, and a node that has
the same name as the pod up above! It's marked as having a "virtual" role. What does it look like?

```
> kubectl describe node sk-vode-q
Name:               sk-vnode-q
Roles:              agent,virtual
Labels:             beta.kubernetes.io/arch=amd64
                    beta.kubernetes.io/os=linux
                    kubernetes.io/arch=amd64
                    kubernetes.io/hostname=sk-vnode-q
                    kubernetes.io/os=linux
                    node-role.kubernetes.io/agent=
                    node-role.kubernetes.io/virtual=
                    node.kubernetes.io/instance-type=m6i.large
                    simkube.io/node-group=sk-vnode
                    simkube.io/node-group-namespace=simkube
                    topology.kubernetes.io/region=us-east-1
                    topology.kubernetes.io/zone=us-east-1a
                    type=virtual
CreationTimestamp:  Wed, 30 Aug 2023 21:05:52 -0700
Taints:             simkube.io/virtual-node=true:NoExecute
Unschedulable:      false
Capacity:
  cpu:                1
  ephemeral-storage:  1Ti
  memory:             1Gi
  pods:               110
Allocatable:
  cpu:                1
  ephemeral-storage:  1Ti
  memory:             1Gi
  pods:               110
System Info:
  Machine ID:
  System UUID:
  Boot ID:
  Kernel Version:
  OS Image:
  Operating System:
  Architecture:
  Container Runtime Version:
  Kubelet Version:            v1.27.1
  Kube-Proxy Version:
ProviderID:                   simkube://sk-vnode-q
Non-terminated Pods:          (2 in total)
  Namespace    Name               CPU Requests  CPU Limits  Memory Requests  Memory Limits  Age
  ---------    ----               ------------  ----------  --------------------  -------------  ---
  kube-system  kube-proxy-k5ws6   0 (0%)        0 (0%)      0 (0%)           0 (0%)         13h
  simkube      test-deploy-a      1 (100%)      0 (0%)      0 (0%)           0 (0%)         13h
Allocated resources:
  (Total limits may be over 100 percent, i.e., overcommitted.)
  Resource           Requests  Limits
  --------           --------  ------
  cpu                1 (100%)  0 (0%)
  memory             0 (0%)    0 (0%)
  ephemeral-storage  0 (0%)    0 (0%)
Events:              <none>
```

Again, I snipped a bunch of stuff out for brevity, but you can see that this "more or less" looks like a normal node.
It's got all the standard labels applied, along with a label and a taint that mark this node as "virtual", and you can
see that just like we specified in our config, it's advertising 1 CPU and 1Gi of RAM. It fills in some other stuff by
default (for example, it picks up the kubelet version from the actual Kubernetes version of the cluster, and it's
advertising as an `m6i.large` instance type), but these can be overridden via the node skeleton file. You can also see
that the `CreationTimestamp` for the node matches the `Started` time of the pod above. Nifty!

And, what's this? If we look at the running/non-terminated pods, we see two have been scheduled on this node, and are
"running". The first is a kube-proxy Daemonset, and the second is something called `test-deploy-a.` Let's take a look at
that:

```
> kubectl describe pod test-deploy-a
Name:             test-deploy-a
Namespace:        simkube
Priority:         0
Service Account:  default
Node:             sk-vnode-q/
Labels:           app=test
                  pod-template-hash=5d44b6c577
Annotations:      <none>
Status:           Running
Containers:
  nginx:
    Image:          nginx:latest
    State:          Running
      Started:      Wed, 30 Aug 2023 21:06:44 -0700
    Ready:          True
    Requests:
      cpu:  1
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-b6z2n (ro)
Conditions:
  Type              Status
  PodScheduled      True
  Initialized       True
  ContainersReady   True
  Ready             True
Volumes:
  kube-api-access-b6z2n:
    Type:                    Projected (a volume that contains injected data from multiple sources)
    TokenExpirationSeconds:  3607
    ConfigMapName:           kube-root-ca.crt
    ConfigMapOptional:       <nil>
    DownwardAPI:             true
Node-Selectors:              type=virtual
Tolerations:                 node.kubernetes.io/not-ready:NoExecute op=Exists for 300s
                             node.kubernetes.io/unreachable:NoExecute op=Exists for 300s
                             simkube.io/virtual-node=true:NoExecute
Events:                      <none>
```

As you can see, this is a pretty standard pod: it's running nginx, it's marked that it's running, all the conditions
have been set correctly, it has a volume mount, it's using up a CPU... basically everything that you would expect to work
on a pod just works out of the box. You can also see that this pod has a node selector and a toleration so that it must
be scheduled onto our virtual node. Very cool!

## But wait, it gets better.

Now that we've got the basic building block in place, we can start to do even more cool things. Our virtual kubelet pod
is running inside a Deployment, and deployments can scale up and down, which means we can introduce autoscaling into our
simulation! It turns out that this is also easy to do. The [Kubernetes Cluster Autoscaler](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler)
can interface with a couple dozen different cloud providers, but it _also_ has a [pluggable interface](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler/cloudprovider/externalgrpc)
that lets users define their _own_ cloud providers!  So we're going to create a cloud provider that's backed by our
virtual kubelet deployment.

The [interface](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/externalgrpc/protos/externalgrpc.proto#L29)
we have to satisfy here is a bit more involved, but it's not _too_ bad. I'm again going to omit function args, return
values, and a few methods for brevity:

```protobuf
service CloudProvider {
  rpc NodeGroups()
  rpc NodeGroupForNode()
  rpc NodeGroupNodes()
  rpc Refresh()

  rpc NodeGroupTargetSize()
  rpc NodeGroupIncreaseSize()
  rpc NodeGroupDeleteNodes()
  rpc NodeGroupDecreaseTargetSize()
}
```

As a quick refresher, Cluster Autoscaler operates on a set of NodeGroups, such that all nodes within a single NodeGroup
must have identical characteristics. The core autoscaling loop looks for a set of "feasible" NodeGroups that could
accommodate an unschedulable pod, and then through an interface called an Expander, picks one of those NodeGroups to
scale up.

Thus, the above CloudProvider interface allows us to accomplish all of those tasks for an arbitrary cloud provider via
[gRPC](https://en.wikipedia.org/wiki/GRPC) calls to an external service: in this case, a _virtual_ cloud provider. The
implementation for these methods is straightforward, so I'm not going to go through them here. It uses label selectors
to identify the node groups (aka Deployments) and nodes within those node groups (aka Pods) that are available for
scaling, and then it updates the number of replicas in the deployment to scale up or down.

The only tricky bit here is on scale-down: when Cluster Autoscaler wants to remove nodes from a cluster, it looks for
empty nodes or nodes whose workloads can be scheduled elsewhere in the cluster, and terminates those nodes first (it
would obviously not be great if the autoscaler just started deleting random nodes!) But in a Kubernetes deployment, the
decision on which pods to terminate on scale-down is essentially random.

But! In Kubernetes 1.22 a new feature called [Pod Deletion Cost](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/#pod-deletion-cost)
was moved into beta. This feature allows you to set a "cost" on pods within a ReplicaSet, and pods with lower cost will
be deleted first by the ReplicaSet controller. So all our virtual cloud provider has to do on scale-down is set this
deletion cost annotation, and everything else just works.  Let's take a look at how this works!

```
> kubectl get pods
NAMESPACE     NAME                 READY   STATUS      RESTARTS   AGE
simkube       sk-vnode-q           1/1     Running     0          13h
simkube       test-deploy-a        1/1     Running     0          13h
> kubectl -n kube-system get pods | grep cluster-autoscaler
kube-system   cluster-autoscaler   1/1     Running   0          45h
```

Ok, now you can see that cluster-autoscaler is running in my cluster, along with our previous virtual node and the test
deployment[^4]. Let's go ahead and scale that test deployment up:

```
> kubectl scale deployment test-deploy --replicas 5
deployment.apps/test-deploy scaled
> kubectl get pods
NAMESPACE     NAME                 READY   STATUS      RESTARTS   AGE
simkube       sk-vnode-q           1/1     Running     0          13h
simkube       test-deploy-a        1/1     Running     0          13h
simkube       test-deploy-b        0/1     Pending     0          4s
simkube       test-deploy-c        0/1     Pending     0          4s
simkube       test-deploy-d        0/1     Pending     0          4s
simkube       test-deploy-e        0/1     Pending     0          4s
```

As expect, the new pods in the deployment are unschedulable — each of them requests 1 CPU, they can only be scheduled on
virtual nodes, and our virtual nodes are only exposing 1 allocatable CPU each. We can confirm this by looking at the
scheduling events:

```
> kubectl describe pod test-deploy-e
...
Events:
  Type     Reason            Age     From               Message
  ----     ------            ----    ----               -------
  Warning  FailedScheduling  6m13s   default-scheduler  0/3 nodes are available: 1 Insufficient cpu, 1 node(s) didn't match Pod's node affinity/selector, 1 node(s) had untolerated taint {node-role.kubernetes.io/control-plane: }.
```

Now let's deploy our virtual cloud provider, and see what happens:

```
> kubectl apply -f sk-cloudprov.yml
deployment.apps/sk-cloudprov created
> kubectl get pods
NAMESPACE     NAME                 READY   STATUS      RESTARTS   AGE
simkube       sk-cloudprov         1/1     Running     0          6s
simkube       sk-vnode-q           1/1     Running     0          13h
simkube       test-deploy-a        1/1     Running     0          13h
simkube       test-deploy-b        0/1     Pending     0          8m45s
simkube       test-deploy-c        0/1     Pending     0          8m45s
simkube       test-deploy-d        0/1     Pending     0          8m45s
simkube       test-deploy-e        0/1     Pending     0          8m45s
```

And then, a few seconds later...

```
> kubectl get pods
NAMESPACE     NAME                 READY   STATUS      RESTARTS   AGE
simkube       sk-cloudprov         1/1     Running     0          6s
simkube       sk-vnode-q           1/1     Running     0          13h
simkube       sk-vnode-w           1/1     Running     0          49s
simkube       sk-vnode-e           1/1     Running     0          49s
simkube       sk-vnode-r           1/1     Running     0          49s
simkube       sk-vnode-t           1/1     Running     0          49s
simkube       test-deploy-a        1/1     Running     0          13h
simkube       test-deploy-b        1/1     Running     0          10m
simkube       test-deploy-c        1/1     Running     0          10m
simkube       test-deploy-d        1/1     Running     0          10m
simkube       test-deploy-e        1/1     Running     0          10m
> kubectl get nodes
NAME                STATUS   ROLES           AGE   VERSION
sk-vnode-q          Ready    agent,virtual   13h   v1.27.1
sk-vnode-w          Ready    agent,virtual   53s   v1.27.1
sk-vnode-e          Ready    agent,virtual   53s   v1.27.1
sk-vnode-r          Ready    agent,virtual   53s   v1.27.1
sk-vnode-t          Ready    agent,virtual   53s   v1.27.1
test-control-plane  Ready    control-plane   2d    v1.27.1
test-worker         Ready    <none>          2d    v1.27.1
```

_Awwwww yea._

## Wrapping Up

I know this post was more technical and included a lot of staring at kubectl output, but I am pretty excited about this
progress! If you want to play with it yourself, you can duplicate all the same steps using the code on our [GitHub repo](https://github.com/acrlabs/simkube/tree/main).
Also of note: I'm going to be at [KubeCon NA](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/)
in Chicago in November this year, and I'm giving a talk where I'll be going over some of this same content, and
(hopefully) presenting a live demo! So look me up if you're going to be there too.  Next time, we'll take a look at how
we can use this simulated cluster to replay "live" traces of a production environment.

As always, thanks for reading.

~drmorr

[^1]: Recall that kubelet is the process that runs on every host in your cluster and is responsible for starting a pod
    running on the host, as well as performing the last set of admission controls to make sure that the pod is allowed
    to run on the host. It's the equivalent to the borglet from Google's internal distributed system,
    [Borg](https://dl.acm.org/doi/abs/10.1145/2741948.2741964).

[^2]: This is the same idea as the hollow node from the [kubemark](https://github.com/kubernetes/kubernetes/blob/release-1.3/docs/devel/kubemark-guide.md)
    test suite, but as (hopefully) we'll see soon, we're going to extend our virtual kubelet "nodes" to provide a lot
    more functionality than kubemark hollow nodes.

[^3]: We have to do a little bit of extra work here to ensure that the pod and container statuses are set correctly, but
    it's not hard to do.

[^4]: Astute readers will have noticed in my last `kubectl get pods` code block that I sneakily elided the test
    deployment from the output so as to set up the dramatic reveal later on. >:)
