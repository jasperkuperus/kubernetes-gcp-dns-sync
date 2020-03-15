# kubernetes-gcp-dns-sync

Kubernetes Google Cloud DNS Sync. Inspired by [kubernetes-cloudflare-sync](https://github.com/calebdoxsey/kubernetes-cloudflare-sync). Keeps the external IP addresses of your kubernetes cluster in sync with Google Cloud DNS.

**WARNING**: Use this at your own risk. Due to faulty usage, you could mess up your DNS records. Always make a backup of your DNS records before deploying this.

Docker hub: [jasperkuperus/kubernetes-gcp-dns-sync](https://hub.docker.com/r/jasperkuperus/kubernetes-gcp-dns-sync)

## Quick start

Before you start, make sure you have completed the following steps:

* Make sure you have a GCP account
* Enable billing for your GCP project
* Enable the [Cloud DNS API](https://console.cloud.google.com/flows/enableapi?apiid=dns.googleapis.com)
* Set up a [Service Account](https://cloud.google.com/docs/authentication/getting-started)

To run it quickly locally, install it and run while providing the required environment variables:

```sh
yarn install
GOOGLE_APPLICATION_CREDENTIALS=./serviceaccount.json \
  ZONE_NAME=my-dns-name \
  RECORD_NAMES=a.example.com.,b.example.com. \
  yarn start
```

## Kubernetes

You need the following to run this in Kubernetes:

* A `ServiceAccount` to allow us to list nodes of the cluster (shown below)
* A secret containing a servive account to Google Cloud DNS
* A deployment of the [jasperkuperus/kubernetes-gcp-dns-sync](https://hub.docker.com/r/jasperkuperus/kubernetes-gcp-dns-sync) image (shown below)

First the service account:

```yaml
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: dns-sync-service-account
---
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: dns-sync-service-account
rules:
  - apiGroups: [""]
    resources: ["nodes"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: dns-sync-service-account
subjects:
  - kind: ServiceAccount
    name: dns-sync-service-account
    namespace: default
roleRef:
  kind: ClusterRole
  name: dns-sync-service-account
  apiGroup: rbac.authorization.k8s.io
```

Then the [jasperkuperus/kubernetes-gcp-dns-sync](https://hub.docker.com/r/jasperkuperus/kubernetes-gcp-dns-sync) deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kubernetes-gcp-dns-sync
  labels:
    app: kubernetes-gcp-dns-sync
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kubernetes-gcp-dns-sync
  template:
    metadata:
      labels:
        app: kubernetes-gcp-dns-sync
    spec:
      serviceAccountName: dns-sync-service-account
      volumes:
        - name: name-of-your-dns-service-account-mount # Change
          secret:
            secretName: name-of-your-cloud-dns-service-account-secret # Change
      containers:
        - name: kubernetes-gcp-dns-sync
          image: jasperkuperus/kubernetes-gcp-dns-sync:latest
          env:
            - name: LOG_JSON
              value: "true"
            - name: ZONE_NAME
              value: my-zone-name # Change
            - name: RECORD_NAMES
              value: "a.example.com.,b.example.com." # Change
            - name: GOOGLE_APPLICATION_CREDENTIALS
              value: /secrets/clouddns/credentials.json # Potentially change
          volumeMounts:
            - name: name-of-your-dns-service-account-mount # Change
              mountPath: /secrets/clouddns
              readOnly: true
```

## Configuration

Configuration is done through environment variables. You can use the following:

| Variable | Default | Doc |
| --- | --- | --- |
| ZONE_NAME | `''` | The name of your Google Cloud DNS zone |
| RECORD_NAMES | `''` | A comma separated list of records you want to keep in sync. Don't forget the trailing dot! E.g.: `a.example.com.,b.example.com` |
| TTL | `120` | The TTL to add to the DNS record |
| LOG_LEVEL | `info` | By default logs everything from `info` and above. Allowed values: `['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'none']` |
| LOG_JSON | `false` | Should the logging be in JSON format? |
| CRON | `0 * * * * *` | The cronjob pattern for when to run this script, default every minute |
