import { validateConfig } from './config';
import { getZone, deleteMatchingRecords, addExternalIpsRecords } from './dns';
import { getExternalNodeIPs } from './k8s';

(async function() {
  const options = validateConfig();
  console.log('Starting with valid configuration:', options);

  // First fetch the external IPs from the cluster
  const externalIps = await getExternalNodeIPs();
  console.log('Found external IPs in cluster:', externalIps);

  const zone = await getZone(options.zoneName);
  await deleteMatchingRecords(zone, options.records);
  await addExternalIpsRecords(zone, options.records, options.ttl, externalIps);
})();
