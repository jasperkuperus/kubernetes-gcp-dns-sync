# kubernetes-gcp-dns-sync

Kubernetes Google Cloud DNS Sync. Inspired by [kubernetes-cloudflare-sync](https://github.com/calebdoxsey/kubernetes-cloudflare-sync). Keeps the external IP addresses of your kubernetes cluster in sync with Google Cloud DNS.

## Quick start

* Make sure you have a GCP account
* Enable billing for your GCP project
* Enable the [Cloud DNS API](https://console.cloud.google.com/flows/enableapi?apiid=dns.googleapis.com)
* Set up a [Service Account](https://cloud.google.com/docs/authentication/getting-started)

Run `yarn start` providing the required environment variables:

```sh
GOOGLE_APPLICATION_CREDENTIALS=./serviceaccount.json ZONE_NAME=my-dns-name RECORD_NAMES=a.example.com.,b.example.com. yarn start
```

## Kubernetes

## Configuration

Configuration is done through environment variables. You can use the following:

| Variable | Default | Doc |
| --- | --- | --- |
| ZONE_NAME | `''` | The name of your Google Cloud DNS zone |
| RECORD_NAMES | `''` | A comma separated list of records you want to keep in sync. Don't forget the trailing dot! E.g.: `a.example.com.,b.example.com` |
| TTL | `120` | The TTL to add to the DNS record |
