---
title: "How to log in to ECR from Kubernetes the right way"
authors:
  - drmorr
datetime: 2025-04-22 11:00:00
template: post.html
---

We just got back from a spring break trip through the Utah national parks, so I didn't have a chance to get a "full"
post written last week[^1], but I _did_ just spend about 12 hours beating my head against a stupid brick wall so I
thought I'd document it here in case anyone else has experienced the same issue.

## tldr: use the out-of-tree cloud provider tooling and don't set up your IAM policy wrong

If you're trying to set up your Kubernetes cluster to access a private ECR repository, use the [ecr-credential-provider](https://cloud-provider-aws.sigs.k8s.io/credential_provider/)
from the AWS out-of-tree cloud provider, and make sure that your IAM credentials that you pass to the credential
provider have "pull" permissions.

## Wait, what?

OK maybe the tldr was all you needed to know, but for everybody else, here's a longer version: I was attempting to
migrate off of a local-to-my-laptop Docker registry[^2] and onto a cloud-hosted registry (AWS ECR to be specific);
however, this requires a bit more complicated Kubernetes setup.  You need two things:

1. An IAM policy that has "pull" permissions so that the Kubelet can pull images from this repository.
2. Some way to log in to the repository periodically (because the docker credentials provided by AWS expire after 12
   hours).

It turns out that if you read any and every blog post on the Internet about this, they all tell you to create a CronJob
that stores the docker credentials in a Kubernetes secret, and then refreshes the value of that secret every 12
hours[^3].  This is annoying for two reasons: first, now I have _another_ pod I have to run, and secondly, secrets are
namespace-scoped, which means I have to replicate the docker credentials into _every single namespace in my cluster_.
MEGA SIGH.

After ranting to one of my friends for a while about how there really ought to exist cluster-scoped secrets so I don't
have to deal with this nonsense, I finally discovered the correct way to solve this problem using a
`KubeletCredentialProvider` plugin[^4].  The credential provider acts as a shim around the image pull request that kubelet
makes to ECR: the way it works is pretty simple, the kubelet execs the shim, passes it the image that it wants to pull
via stdin, and then the shim authenticates with ECR and returns the Docker credentials on stdout.  Kubelet then pulls
the image using those credentials.  SO MUCH BETTER.

## Configuring the ecr-credential-provider

Configuring the credential provider is straightforward: all you need to do is create a CredentialProviderConfig file
that kubelet can read.  Here's mine:

```yaml
---
apiVersion: kubelet.config.k8s.io/v1
kind: CredentialProviderConfig
providers:
  - name: ecr-credential-provider
    matchImages:
      - "{{ aws_account }}.dkr.ecr.*.amazonaws.com"
    defaultCacheDuration: "0"
    apiVersion: credentialprovider.kubelet.k8s.io/v1
    env:
      - name: AWS_ACCESS_KEY_ID
        value: "{{ ecr_login_access_key_id }}"
      - name: AWS_SECRET_ACCESS_KEY
        value: "{{ ecr_login_secret_access_key }}"
```

This is actually a Jinja template that gets filled in at cluster creation time, but you get the idea.  The key fields
are as follows:

* `name`: this is the name of the binary that kubelet will exec, and _must match exactly_.
* `matchImages`: this is a list of image patterns that kubelet will call the credential provider for; any image tag that
   doesn't match something will get skipped.  I just have one entry, which matches every region in my AWS account.  Note
   that the "glob" patterns are scoped to a single subdomain segment: in other words, `*.io` does _not_ match
   `*.k8s.io`.
* `defaultCacheDuration`: how long to cache credentials _if the provider doesn't specify a cache duration_.  In this
   case, the ECR credential provider returns a cache duration of 6 hours, so you don't need to set anything special
   here.
* `apiVersion`: this was a bit confusing to me at first, but this is the API version of the request that kubelet makes
   to the credential provider.  There is only one supported value here, which is `credentialprovider.kubelet.k8s.io/v1`.
* `env`: this is a list of additional environment variables that are passed in to the credential provider.  Here you can
   see I'm setting the IAM credentials needed to access my registry.

There's also an `args` field where you can specify additional CLI arguments to the credential provider, but that isn't
needed in this case.

Once you have this config file created, you need to tell Kubelet about it.  You do that with the following two CLI
flags:

* `--image-credential-provider-config`: this is the path to the config file you just created
* `--image-credential-provider-bin-dir`: this is the path to the _directory_ containing your credential provider binary
  (which again, must match the `name` specified in your provider config).

Obviously, this means that both the credential provider config as well as the credential provider binary itself need to
be present on every node in your cluster.

## Why isn't this working???

So I set all this up, got my config and the credential provider installed, and... kept getting 403 Forbidden errors when
I tried to actually pull images down from ECR.  At first I assumed that I'd either configured something wrong, or that
the credential provider _itself_ was buggy.  Unfortunately ruling both of these items out was more complicated than it
should have been.  I could see in the kubelet logs two entries:

```
Getting image XXXX.dkr.ecr.us-east-1.amazonaws.com/cluster-autoscaler credentials
from external exec plugin ecr-credential-provider
```

and then shortly thereafter, the 403 Forbidden error.  There were no other errors from kubelet, and neither kubelet nor
the ecr-credential-provider binary log the request and response values (even at log level 9).  So I finally[^5] wrapped
the provider in a shim that prints out the request, the response, and the environment that the credential provider was
running in.  Everything looked good there, so what was going on???

I figured it out when I took the credentials that the provider returned and used them to log into my ECR registry; the
login was successful, but I got a 403 error when I tried to pull an image.  This error, specifically:

```
Error response from daemon: pull access denied for XXXX.dkr.ecr.us-east-1.amazonaws.com/cluster-autoscaler,
repository does not exist or may require 'docker login': denied: User:
arn:aws:iam::XXXX:user/serviceaccount/ecr-login is not authorized to perform: ecr:BatchGetImage on resource:
arn:aws:ecr:us-east-1:XXXX:repository/cluster-autoscaler because no identity-based policy allows the
ecr:BatchGetImage action
```

That was when I discovered that AWS does some additional trickery on the backend to make sure that you have permissions
to pull from the specified repo.  In other words, the IAM credentials that you use can't _just_ be set to allow
`ecr:GetAuthorizationToken*`.  Anyone want to guess how I'd configured mine?

I changed things over to use the managed `AmazonEC2ContainerRegistryPullOnly` IAM policy and now things work like a
charm.

Anyways, I hope that maybe helps someone else, or at least will help Claude get its shit together when it gets trained
on the contents of this blog post.

Tune in next time for that sappy feel-good story, maybe!  Thanks for reading,

~drmorr

*[ECR]: Amazon Elastic Container Registry
*[IAM]: Amazon Identity and Access Management, aka the bane of my existence


[^1]: Although I do have a sappy human interest post I might write this week, stay tuned...

[^2]: Because it kept filling up my hard drive with images and then I'd have to periodically go through and clean
    everything out, which is _super_ annoying.

[^3]: This is the same advice that Claude gives you, which is unsurprising given that Claude has just been trained on
    every blog post on the Internet.

[^4]: The details of which are described in [KEP-2133](https://github.com/kubernetes/enhancements/pull/2151), if you
    care to go digging.

[^5]: After _significant_ grumbling.
