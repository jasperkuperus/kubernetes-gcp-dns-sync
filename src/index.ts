import { getExternalNodeIPs } from './k8s';
import { getZone, deleteMatchingRecords, addExternalIpsRecords } from './dns';

// TODO: Move these to env variables
const zoneName = 'promo-app-dns';
const recordNames = 'test.promo-app.nl.,test2.promo-app.nl.';
const records = recordNames.split(',');
const ttl = 120;

(async function() {
  const externalIps = await getExternalNodeIPs();
  console.log('Found external IPs in cluster:', externalIps);

  const zone = await getZone(zoneName);
  await deleteMatchingRecords(zone, records);
  await addExternalIpsRecords(zone, records, ttl, externalIps);
})();
