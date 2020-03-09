# kubernetes-gcp-dns-sync

Kubernetes Google Cloud DNS Sync. Inspired by [kubernetes-cloudflare-sync](https://github.com/calebdoxsey/kubernetes-cloudflare-sync). Keeps the external IP addresses of your kubernetes cluster in sync with Google Cloud DNS.

## Quick start

* Make sure you have a GCP account
* Enable billing for your GCP project
* Enable the [Cloud DNS API](https://console.cloud.google.com/flows/enableapi?apiid=dns.googleapis.com)
* Set up a [Service Account](https://cloud.google.com/docs/authentication/getting-started)

```sh
GOOGLE_APPLICATION_CREDENTIALS=./serviceaccount.json yarn start
```

## Kubernetes
