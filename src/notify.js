// ============================================================
// notify.js - Discord & Telegram notification helpers
// ============================================================
require('dotenv').config();
const axios = require('axios');
const logger = require('./logger');

/**
 * Send a Discord webhook notification.
 * @param {object[]} results - Array of check-in results per game
 */
async function sendDiscordNotification(results) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const now = new Date().toLocaleString('en-MY', { timeZone: process.env.TIMEZONE || 'Asia/Kuala_Lumpur' });

  const fields = results.map((r) => ({
    name: `${r.game.icon} ${r.game.name}`,
    value: r.error
      ? `❌ Error: ${r.error}`
      : r.alreadyCheckedIn
      ? `✅ Already checked in (Day ${r.totalDays})`
      : `✅ Checked in! Reward: **${r.reward?.name || 'Unknown'} ×${r.reward?.cnt || '?'}** (Day ${r.totalDays})`,
    inline: false,
  }));

  const allOk = results.every((r) => !r.error);
  const payload = {
    embeds: [
      {
        title: '🎮 HoyoLab Daily Check-In Report',
        description: `Automated check-in completed at ${now}`,
        color: allOk ? 0x57f287 : 0xed4245, // green or red
        fields,
        footer: { text: 'HoyoLab Auto Check-in Bot' },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    await axios.post(webhookUrl, payload, { timeout: 10000 });
    logger.info('Discord notification sent successfully');
  } catch (err) {
    logger.warn(`Discord notification failed: ${err.message}`);
  }
}

/**
 * Send a Telegram bot message notification.
 * @param {object[]} results - Array of check-in results per game
 */
async function sendTelegramNotification(results) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return;

  const now = new Date().toLocaleString('en-MY', { timeZone: process.env.TIMEZONE || 'Asia/Kuala_Lumpur' });

  const lines = results.map((r) =>
    r.error
      ? `${r.game.icon} ${r.game.name}: ❌ ${r.error}`
      : r.alreadyCheckedIn
      ? `${r.game.icon} ${r.game.name}: ✅ Already checked in (Day ${r.totalDays})`
      : `${r.game.icon} ${r.game.name}: ✅ Day ${r.totalDays} — ${r.reward?.name || '?'} ×${r.reward?.cnt || '?'}`
  );

  const text =
    `🎮 *HoyoLab Daily Check-In* — ${now}\n\n` + lines.join('\n') + '\n\n_Automated by HoyoLab Check-in Bot_';

  try {
    await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      { chat_id: chatId, text, parse_mode: 'Markdown' },
      { timeout: 10000 }
    );
    logger.info('Telegram notification sent successfully');
  } catch (err) {
    logger.warn(`Telegram notification failed: ${err.message}`);
  }
}

module.exports = { sendDiscordNotification, sendTelegramNotification };
