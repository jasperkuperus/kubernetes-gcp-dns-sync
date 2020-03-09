import winston from 'winston';
import { SPLAT } from 'triple-beam';
import config from './config';

/**
 * Define a custom format for development. Production should be JSON output.
 */
const myFormat = winston.format.printf(
  line =>
    `${line.timestamp} ${line.level}: ${line.message}${
      line[SPLAT] != null ? `, ${JSON.stringify(line[SPLAT], null, 2)}` : ''
    }`,
);

const formatters = [winston.format.timestamp()];
if (config.get('log.json')) {
  formatters.push(winston.format.json());
} else {
  formatters.push(winston.format.colorize());
  formatters.push(myFormat);
}

// Determine all options for the logger
const options = {
  level: 'none',
  format: winston.format.combine(...formatters),
  stderrLevels: ['error'],
  transports: [new winston.transports.Console()],
  ...config.get('log'),
};

const logger = winston.createLogger(options);

// Mute transports if log level is set to none
if (options.level === 'none') {
  for (const transport of logger.transports) {
    transport.silent = true;
  }
}

export default logger;
