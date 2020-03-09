import { DNS, Record, Zone } from '@google-cloud/dns';
import log from './logger';

// Create Cloud DNS client
const dns = new DNS();

/**
 * Given a Cloud DNS zone name, this method returns the zone.
 */
export async function getZone(name: string): Promise<Zone> {
  // Fetch all zones, find our zone
  const [zones] = await dns.getZones();
  const zone = zones.find(zone => zone.name === name);

  if (zone == null) {
    throw new Error(`Could not find DNS zone '${name}'`);
  }

  return zone;
}

/**
 * Given a set of DNS record names, this method deletes all the
 * matching A records for that name. Please make sure you don't
 * forget the trailing dot, e.g.: `api.example.com.`.
 */
export async function deleteMatchingRecords(zone: Zone, names: string[]): Promise<void> {
  // Fetch all current records
  const [currentRecords] = await zone.getRecords();

  // Delete each matching record
  let deletedCount = 0;
  for (const record of currentRecords) {
    if (record.type === 'A' && names.includes(record.metadata.name)) {
      log.info(`Deleting A record '${record.metadata.name}'...`, record.metadata);
      await record.delete();
      deletedCount += 1;
    }
  }

  log.info(`Deleted ${deletedCount} DNS records`);
}

/**
 * Adds DNS records for each record name in `names`, using the
 * given `ttl` and `externalIps` in the given `zone`.
 */
export async function addExternalIpsRecords(
  zone: Zone,
  names: string[],
  ttl: number,
  externalIps: string[],
): Promise<void> {
  // Loop through each record, because we want to log each record
  // creation. Otherwise we could have used `zone.addRecords(names.map(...))`
  let createdCount = 0;
  for (const recordName of names) {
    log.info(`Adding A record for '${recordName}'`, {
      recordName,
      ttl,
      externalIps,
    });

    await zone.addRecords(
      new Record(zone, 'A', {
        name: recordName,
        data: externalIps,
        ttl,
      }),
    );
    createdCount += 1;
  }

  log.info(`Created ${createdCount} DNS records`);
}
