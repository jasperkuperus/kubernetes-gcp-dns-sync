import * as k8s from '@kubernetes/client-node';

const kubeConfig = new k8s.KubeConfig();
kubeConfig.loadFromDefault();

const k8sApi = kubeConfig.makeApiClient(k8s.CoreV1Api);

/**
 * Returns a boolean that represents whether this node matches
 * the requested labels.
 */
function doesMatchLabels(node: k8s.V1Node, requestedLabels: string[]): boolean {
  // If there are no requested labels, accept all nodes
  if (requestedLabels.length === 0) {
    return true;
  }

  // Don't pick if there are no labels on the node
  const labels = node.metadata?.labels;
  if (labels == null) {
    return false;
  }

  // Make sure all requested labels are there
  return requestedLabels.every(requestedLabel => labels[requestedLabel] != null && labels[requestedLabel] === 'true');
}

/**
 * Requests all node information from k8s, looks for all external
 * IP addresses, returns an array with these addresses.
 */
export async function getExternalNodeIPs(requestedLabels: string[]): Promise<string[]> {
  // First list all nodes in the cluster
  const nodesResult = await k8sApi.listNode('default');

  return (
    nodesResult.body.items
      // Check if labels are correct
      .filter(item => doesMatchLabels(item, requestedLabels))
      // Find all external IPs
      .map(item => {
        const ip = item.status?.addresses?.find(ip => ip.type === 'ExternalIP');
        return ip != null ? ip.address : '';
      })
      // Filter out empty entries
      .filter(ip => ip !== '')
  );
}
