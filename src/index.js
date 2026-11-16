// ============================================================
// index.js - Main entry point with cron scheduler
// ============================================================
require('dotenv').config();
const cron = require('node-cron');
const logger = require('./logger');
const { runAllCheckIns } = require('./checkin');

// ---- Configuration ----
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '0 0 0 * * *'; // Every day at 00:00:00
const TIMEZONE = process.env.TIMEZONE || 'Asia/Kuala_Lumpur';

// ---- Validate cron expression ----
if (!cron.validate(CRON_SCHEDULE)) {
  logger.error(`Invalid cron expression: "${CRON_SCHEDULE}"`);
  logger.error('Example valid expressions:');
  logger.error('  "0 0 0 * * *"  — Every day at midnight');
  logger.error('  "0 30 0 * * *" — Every day at 00:30');
  process.exit(1);
}

logger.info('='.repeat(60));
logger.info('🚀 HoyoLab Auto Check-in Service Starting');
logger.info(`📅 Schedule: ${CRON_SCHEDULE} (${TIMEZONE})`);
logger.info(`⏰ Current time: ${new Date().toLocaleString('en-MY', { timeZone: TIMEZONE })}`);

// Calculate next run time for display
function getNextRunTime() {
  // Simple display — node-cron doesn't expose next time directly
  const now = new Date();
  const next = new Date(now);
  next.setDate(now.getDate() + (now.getHours() >= 0 ? 1 : 0));
  next.setHours(0, 0, 0, 0);
  return next.toLocaleString('en-MY', { timeZone: TIMEZONE });
}

logger.info(`⏳ Next scheduled run: ~${getNextRunTime()}`);
logger.info('='.repeat(60));

// ---- Schedule the check-in task ----
const task = cron.schedule(
  CRON_SCHEDULE,
  async () => {
    logger.info('⏰ Cron triggered — Running scheduled check-in...');
    try {
      await runAllCheckIns();
    } catch (err) {
      logger.error(`Scheduled check-in encountered an unhandled error: ${err.message}`);
      logger.error(err.stack);
    }
  },
  {
    scheduled: true,
    timezone: TIMEZONE,
  }
);

logger.info('✅ Scheduler is active. Waiting for midnight...');
logger.info('   (Run "node src/checkin.js" to trigger a manual check-in now)');

// ---- Graceful shutdown ----
function shutdown(signal) {
  logger.info(`\n🛑 Received ${signal}. Stopping scheduler...`);
  task.stop();
  logger.info('Scheduler stopped. Goodbye!');
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Keep the process alive
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught exception: ${err.message}`);
  logger.error(err.stack);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
});
