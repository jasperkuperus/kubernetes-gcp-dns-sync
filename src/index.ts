import _ from 'lodash';
import { CronJob } from 'cron';
import config, { validateConfig } from './config';
import { getZone, deleteMatchingRecords, addExternalIpsRecords } from './dns';
import { getExternalNodeIPs } from './k8s';
import log from './logger';

// First, verify config
const options = validateConfig();
log.info('Starting with valid configuration: ', options);

// Start a cronjob
new CronJob(config.get('cron'), run).start();
log.info(`Initializing Cloud DNS Sync cronjob: '${config.get('cron')}'`);

// Keep a cache of the external IPs
let externalIps: string[] = [];

/**
 * Runs the program. Validates configuration, the retrieves all
 * external IPs from k8s. Then, removes all DNS records and recreates
 * them with the new external IPs.
 */
async function run(): Promise<void> {
  try {
    // First fetch the external IPs from the cluster
    const newExternalIps = await getExternalNodeIPs();
    log.info('Found external IPs in cluster: ', newExternalIps);

    if (newExternalIps.length === 0) {
      throw new Error('Did not find any external IPs');
    } else if (_.isEqual(externalIps.sort(), newExternalIps.sort())) {
      log.info('Skipping DNS updates, IPs stayed the same');
      return;
    }

    // Grab the zone, try to delete / recreate DNS records
    const zone = await getZone(options.zoneName);
    await deleteMatchingRecords(zone, options.records);
    await addExternalIpsRecords(zone, options.records, options.ttl, newExternalIps);

    // Overwrite the external IPs
    externalIps = newExternalIps;
  } catch (error) {
    // It failed, log the error
    log.error(error);
    process.exit(1);
  }
}
