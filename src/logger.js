// ============================================================
// logger.js - Winston-based logger (Serverless compatible)
// ============================================================
require('dotenv').config();
const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

const logLevel = process.env.LOG_LEVEL || 'info';
// Never write files on serverless / Vercel
const isVercel = Boolean(process.env.VERCEL);
const logToFile = !isVercel && process.env.LOG_TO_FILE !== 'false';

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
  try {
    const logsDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

    loggerTransports.push(
      new transports.File({
        filename: path.join(logsDir, 'checkin.log'),
        format: logFormat,
        maxsize: 5 * 1024 * 1024,
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
  } catch (err) {
    console.warn('File logging disabled due to filesystem error:', err.message);
  }
}

const logger = createLogger({
  level: logLevel,
  transports: loggerTransports,
});

module.exports = logger;
