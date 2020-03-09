import convict from 'convict';

const config = convict({
  zoneName: {
    doc: 'The name of the Google Cloud DNS Zone',
    default: '',
    env: 'ZONE_NAME',
  },
  recordNames: {
    doc: 'Comma separated list of record names, dont forget the trailing dot',
    default: '',
    env: 'RECORD_NAMES',
  },
  ttl: {
    doc: 'The TTL to add to the A records',
    default: 120,
    env: 'TTL',
  },
});

// Validate our input
config.validate({ allowed: 'strict' });

/**
 * Validates the configuration with which we're running this app.
 */
export function validateConfig() {
  const options = {
    records: config
      .get('recordNames')
      .split(',')
      .map(record => record.trim())
      .filter(record => record !== ''),
    zoneName: config.get('zoneName').trim(),
    ttl: config.get('ttl'),
  };

  if (options.records.length === 0) {
    throw new Error('Please pass record names using env variable RECORD_NAMES');
  }

  if (options.zoneName == null || options.zoneName.trim() === '') {
    throw new Error('Please pass Cloud DNS zone name using env variable ZONE_NAME');
  }

  if (options.ttl == null || Number.isNaN(options.ttl)) {
    throw new Error('Please pass an integer value for ttl using env variable TTL');
  }

  return options;
}
