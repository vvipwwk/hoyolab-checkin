// ============================================================
// api.js - HoyoLab API client
// ============================================================
require('dotenv').config();
const axios = require('axios');
const logger = require('./logger');

// Build cookie string from env variables
function buildCookieString() {
  const parts = [];
  if (process.env.LTUID_V2)        parts.push(`ltuid_v2=${process.env.LTUID_V2}`);
  if (process.env.LTOKEN_V2)       parts.push(`ltoken_v2=${process.env.LTOKEN_V2}`);
  if (process.env.COOKIE_TOKEN_V2) parts.push(`cookie_token_v2=${process.env.COOKIE_TOKEN_V2}`);
  if (process.env.ACCOUNT_ID_V2)   parts.push(`account_id_v2=${process.env.ACCOUNT_ID_V2}`);
  // Legacy fallback
  if (process.env.LTUID)           parts.push(`ltuid=${process.env.LTUID}`);
  if (process.env.LTOKEN)          parts.push(`ltoken=${process.env.LTOKEN}`);
  return parts.join('; ');
}

// Common request headers matching a real browser session
function buildHeaders(referer, extraHeaders = {}) {
  return {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
    'Content-Type': 'application/json;charset=UTF-8',
    'Cookie': buildCookieString(),
    'DNT': '1',
    'Origin': 'https://act.hoyolab.com',
    'Referer': referer,
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'x-rpc-app_version': '2.34.1',
    'x-rpc-client_type': '4',
    'x-rpc-platform': '4',
    ...extraHeaders
  };
}

// Return codes from HoyoLab
const RETCODES = {
  SUCCESS: 0,
  ALREADY_CHECKED_IN: -5003,
  INVALID_COOKIE: -100,
  VISIT_TOO_FREQUENTLY: -429,
};

/**
 * Check current check-in status for a game.
 * @param {object} game - Game config from games.js
 * @returns {object} { checkedIn: bool, totalDays: number, today: string }
 */
async function getCheckInStatus(game) {
  const url = `${game.infoUrl}?lang=en-us&act_id=${game.act_id}`;
  const response = await axios.get(url, {
    headers: buildHeaders(game.referer, game.extraHeaders),
    timeout: 15000,
  });

  const { retcode, message, data } = response.data;
  if (retcode !== RETCODES.SUCCESS) {
    throw new Error(`Status check failed (retcode ${retcode}): ${message}`);
  }

  return {
    checkedIn: data.is_sign,
    totalDays: data.total_sign_day,
    today: data.today,
  };
}

/**
 * Perform the daily check-in POST for a game.
 * @param {object} game - Game config from games.js
 * @returns {object} { success: bool, alreadyCheckedIn: bool, message: string }
 */
async function performCheckIn(game) {
  const url = `${game.signUrl}?lang=en-us&act_id=${game.act_id}`;
  const body = { act_id: game.act_id };

  const response = await axios.post(url, body, {
    headers: buildHeaders(game.referer, game.extraHeaders),
    timeout: 15000,
  });

  const { retcode, message } = response.data;

  if (retcode === RETCODES.SUCCESS) {
    return { success: true, alreadyCheckedIn: false, message };
  }
  if (retcode === RETCODES.ALREADY_CHECKED_IN) {
    return { success: true, alreadyCheckedIn: true, message: 'Already checked in today' };
  }
  if (retcode === RETCODES.INVALID_COOKIE) {
    throw new Error(`Invalid cookie / session expired (retcode ${retcode}). Please refresh your cookies.`);
  }

  throw new Error(`Check-in failed (retcode ${retcode}): ${message}`);
}

/**
 * Fetch today's reward for the game (optional display info).
 * @param {object} game - Game config from games.js
 * @param {number} dayIndex - 0-based day index (totalDays - 1 after check-in)
 * @returns {object|null} reward info or null on error
 */
async function getTodayReward(game, dayIndex) {
  try {
    const url = `${game.rewardUrl}?lang=en-us&act_id=${game.act_id}`;
    const response = await axios.get(url, {
      headers: buildHeaders(game.referer, game.extraHeaders),
      timeout: 10000,
    });

    const { retcode, data } = response.data;
    if (retcode !== RETCODES.SUCCESS || !data?.awards) return null;

    const award = data.awards[dayIndex];
    return award || null;
  } catch {
    return null;
  }
}

module.exports = { getCheckInStatus, performCheckIn, getTodayReward, buildCookieString };
