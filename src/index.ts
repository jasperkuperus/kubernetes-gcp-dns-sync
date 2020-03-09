import { validateConfig } from './config';
import { getZone, deleteMatchingRecords, addExternalIpsRecords } from './dns';
import { getExternalNodeIPs } from './k8s';
import log from './logger';

(async function() {
  const options = validateConfig();
  log.info('Starting with valid configuration: ', options);

  // First fetch the external IPs from the cluster
  const externalIps = await getExternalNodeIPs();
  log.info('Found external IPs in cluster: ', externalIps);

  const zone = await getZone(options.zoneName);
  await deleteMatchingRecords(zone, options.records);
  await addExternalIpsRecords(zone, options.records, options.ttl, externalIps);
})().catch(error => {
  // It failed, log the error
  log.error(error);
  process.exit(1);
});
