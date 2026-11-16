// ============================================================
// checkin.js - Core check-in runner (can be called standalone)
// ============================================================
require('dotenv').config();
const logger = require('./logger');
const { GAMES } = require('./games');
const { getCheckInStatus, performCheckIn, getTodayReward, buildCookieString } = require('./api');
const { sendDiscordNotification, sendTelegramNotification } = require('./notify');

/**
 * Validate that cookies are configured.
 */
function validateConfig() {
  const cookie = buildCookieString();
  if (!cookie || cookie.includes('your_')) {
    throw new Error(
      'HoyoLab cookies are not configured. Please edit your .env file and fill in LTUID_V2 and LTOKEN_V2.'
    );
  }
}

/**
 * Run check-in for a single game with retry logic.
 * @param {object} game - Game config
 * @param {number} retries - Number of retries on transient failure
 */
async function runGameCheckIn(game, retries = 2) {
  logger.info(`${game.icon} [${game.short}] Starting check-in for ${game.name}...`);

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      // Check current status first
      let status;
      try {
        status = await getCheckInStatus(game);
        logger.info(`${game.icon} [${game.short}] Status — Day: ${status.totalDays}, Already checked in: ${status.checkedIn}`);
      } catch (statusErr) {
        logger.warn(`${game.icon} [${game.short}] Could not fetch status (non-fatal): ${statusErr.message}`);
        status = null;
      }

      // Skip if already checked in today (confirmed by status check)
      if (status?.checkedIn) {
        logger.info(`${game.icon} [${game.short}] Already checked in today. Skipping.`);
        return {
          game,
          success: true,
          alreadyCheckedIn: true,
          totalDays: status.totalDays,
          reward: null,
          error: null,
        };
      }

      // Perform check-in
      const result = await performCheckIn(game);

      if (result.alreadyCheckedIn) {
        logger.info(`${game.icon} [${game.short}] Already checked in (server response).`);
        return {
          game,
          success: true,
          alreadyCheckedIn: true,
          totalDays: status?.totalDays || '?',
          reward: null,
          error: null,
        };
      }

      // Fetch updated status to get day count
      let newStatus = null;
      try {
        newStatus = await getCheckInStatus(game);
      } catch (_) {}

      const totalDays = newStatus?.totalDays || (status ? status.totalDays + 1 : '?');

      // Fetch today's reward info (day index is 0-based)
      const reward = await getTodayReward(game, typeof totalDays === 'number' ? totalDays - 1 : 0);

      if (reward) {
        logger.info(`${game.icon} [${game.short}] ✅ Checked in! Day ${totalDays} — Reward: ${reward.name} ×${reward.cnt}`);
      } else {
        logger.info(`${game.icon} [${game.short}] ✅ Checked in! Day ${totalDays}`);
      }

      return {
        game,
        success: true,
        alreadyCheckedIn: false,
        totalDays,
        reward,
        error: null,
      };
    } catch (err) {
      const isLastAttempt = attempt === retries + 1;

      if (isLastAttempt) {
        logger.error(`${game.icon} [${game.short}] ❌ Check-in failed after ${retries + 1} attempt(s): ${err.message}`);
        return {
          game,
          success: false,
          alreadyCheckedIn: false,
          totalDays: null,
          reward: null,
          error: err.message,
        };
      }

      logger.warn(`${game.icon} [${game.short}] Attempt ${attempt} failed: ${err.message}. Retrying in 5s...`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

/**
 * Run check-ins for all enabled games sequentially.
 */
async function runAllCheckIns() {
  logger.info('='.repeat(60));
  logger.info('🎮 HoyoLab Auto Check-in — Starting');
  logger.info(`🕐 Time: ${new Date().toLocaleString('en-MY', { timeZone: process.env.TIMEZONE || 'Asia/Kuala_Lumpur' })}`);
  logger.info('='.repeat(60));

  // Validate cookies before attempting anything
  try {
    validateConfig();
  } catch (err) {
    logger.error(err.message);
    return [];
  }

  const enabledGames = Object.values(GAMES).filter((g) => g.enabled);

  if (enabledGames.length === 0) {
    logger.warn('No games are enabled. Set ENABLE_GENSHIN=true (or other games) in your .env file.');
    return [];
  }

  logger.info(`📋 Enabled games: ${enabledGames.map((g) => g.short).join(', ')}`);

  const results = [];

  for (const game of enabledGames) {
    // Add a small delay between games to avoid rate limiting
    if (results.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    const result = await runGameCheckIn(game);
    results.push(result);
  }

  // Summary
  logger.info('='.repeat(60));
  logger.info('📊 Check-in Summary:');
  for (const r of results) {
    if (r.error) {
      logger.error(`  ${r.game.icon} ${r.game.short}: FAILED — ${r.error}`);
    } else if (r.alreadyCheckedIn) {
      logger.info(`  ${r.game.icon} ${r.game.short}: Already checked in (Day ${r.totalDays})`);
    } else {
      logger.info(`  ${r.game.icon} ${r.game.short}: ✅ Success — Day ${r.totalDays}`);
    }
  }
  logger.info('='.repeat(60));

  // Send notifications
  await sendDiscordNotification(results);
  await sendTelegramNotification(results);

  return results;
}

// Allow running this file directly: node src/checkin.js
if (require.main === module) {
  runAllCheckIns()
    .then(() => {
      logger.info('Manual check-in run complete.');
      process.exit(0);
    })
    .catch((err) => {
      logger.error(`Unhandled error: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { runAllCheckIns };
