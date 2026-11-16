const { GAMES } = require('../src/games');
const { buildCookieString } = require('../src/api');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const cookie = buildCookieString();
  const configured = Boolean(cookie && !cookie.includes('your_') && cookie.length > 20);

  const enabledGames = {};
  for (const [key, g] of Object.entries(GAMES)) {
    enabledGames[key] = {
      name: g.name,
      short: g.short,
      enabled: g.enabled,
      icon: g.icon
    };
  }

  return res.status(200).json({
    configured,
    timezone: process.env.TIMEZONE || 'Asia/Kuala_Lumpur',
    games: enabledGames,
    hasDiscord: Boolean(process.env.DISCORD_WEBHOOK_URL),
    hasTelegram: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    timestamp: new Date().toISOString()
  });
};
