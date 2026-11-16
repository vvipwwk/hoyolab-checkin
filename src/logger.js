// ============================================================
// logger.js - Winston-based logger
// ============================================================
require('dotenv').config();
const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const logLevel = process.env.LOG_LEVEL || 'info';
const logToFile = process.env.LOG_TO_FILE !== 'false';

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  })
);

const loggerTransports = [
  new transports.Console({
    format: format.combine(format.colorize(), logFormat),
  }),
];

if (logToFile) {
  loggerTransports.push(
    new transports.File({
      filename: path.join(logsDir, 'checkin.log'),
      format: logFormat,
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 7,
      tailable: true,
    }),
    new transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 2 * 1024 * 1024,
      maxFiles: 3,
      tailable: true,
    })
  );
}

const logger = createLogger({
  level: logLevel,
  transports: loggerTransports,
});

module.exports = logger;
