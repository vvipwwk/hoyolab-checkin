// ============================================================
// test.js - Connectivity & cookie validation test
// ============================================================
require('dotenv').config();
const { buildCookieString, getCheckInStatus } = require('./api');
const { GAMES } = require('./games');
const logger = require('./logger');

async function runTest() {
  logger.info('🔍 HoyoLab Check-in — Configuration Test');
  logger.info('='.repeat(50));

  // 1. Cookie check
  const cookie = buildCookieString();
  if (!cookie || cookie.includes('your_')) {
    logger.error('❌ Cookies not configured! Please edit .env and set LTUID_V2 and LTOKEN_V2.');
    process.exit(1);
  }
  logger.info(`✅ Cookies found (${cookie.split(';').length} values)`);

  // 2. Enabled games
  const enabled = Object.values(GAMES).filter((g) => g.enabled);
  logger.info(`📋 Enabled games: ${enabled.map((g) => g.name).join(', ') || 'None!'}`);

  if (enabled.length === 0) {
    logger.warn('⚠️  No games enabled. Set ENABLE_GENSHIN=true etc. in .env');
    process.exit(0);
  }

  // 3. Try fetching status for each game
  logger.info('\n🌐 Testing API connectivity...');
  let allOk = true;

  for (const game of enabled) {
    try {
      const status = await getCheckInStatus(game);
      logger.info(
        `  ${game.icon} ${game.name}: ✅ Connected — Day ${status.totalDays}, ` +
        `Checked in today: ${status.checkedIn}`
      );
    } catch (err) {
      logger.error(`  ${game.icon} ${game.name}: ❌ Failed — ${err.message}`);
      allOk = false;
    }
  }

  logger.info('='.repeat(50));
  if (allOk) {
    logger.info('✅ All tests passed! You can now run: npm start');
  } else {
    logger.error('❌ Some tests failed. Check your cookies and network connection.');
    process.exit(1);
  }
}

runTest();
