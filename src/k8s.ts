import * as k8s from '@kubernetes/client-node';

const kubeConfig = new k8s.KubeConfig();
kubeConfig.loadFromDefault();

const k8sApi = kubeConfig.makeApiClient(k8s.CoreV1Api);

/**
 * Requests all node information from k8s, looks for all external
 * IP addresses, returns an array with these addresses.
 */
export async function getExternalNodeIPs(): Promise<string[]> {
  // First list all nodes in the cluster
  const nodesResult = await k8sApi.listNode('default');

  return (
    nodesResult.body.items
      // Find all external IPs
      .map(item => {
        const ip = item.status?.addresses?.find(ip => ip.type === 'ExternalIP');
        return ip != null ? ip.address : '';
      })
      // Filter out empty entries
      .filter(ip => ip !== '')
  );
}
