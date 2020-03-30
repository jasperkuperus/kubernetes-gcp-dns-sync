import winston from 'winston';
import { LEVEL, SPLAT } from 'triple-beam';
import config from './config';

// Mapping of winston severity to Stackdriver severity
const StackdriverSeverityLookup: {
  [winstonLevel: string]: string;
} = {
  default: 'DEFAULT',
  silly: 'DEFAULT',
  verbose: 'DEBUG',
  debug: 'DEBUG',
  http: 'notice',
  info: 'info',
  warn: 'WARNING',
  error: 'ERROR',
};

// Custom format that adds the severity field for Stackdriver
const stackdriverSeverityFormat = winston.format(info => ({
  ...info,
  severity: StackdriverSeverityLookup[info[LEVEL]] || StackdriverSeverityLookup['default'],
}));

/**
 * Define a custom format for development. Production should be JSON output.
 */
const myFormat = winston.format.printf(
  line =>
    `${line.timestamp} ${line.level}: ${line.message}${
      line[SPLAT] != null ? `, ${JSON.stringify(line[SPLAT], null, 2)}` : ''
    }`,
);

const formatters = [winston.format.timestamp(), stackdriverSeverityFormat()];
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
