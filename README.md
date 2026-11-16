# HoyoLab Auto Check-in Service

Automated daily check-in for all Hoyoverse games on HoyoLab, running at **00:00 every night** (or any custom schedule). Built in Node.js — mirrors the Google Apps Script sample with full retry, logging, and notification support.

## Supported Games

| Game | Code | Default |
|---|---|---|
| ⚔️ Genshin Impact | `ENABLE_GENSHIN` | ✅ On |
| 🚂 Honkai: Star Rail | `ENABLE_STARRAIL` | ✅ On |
| 📺 Zenless Zone Zero | `ENABLE_ZZZ` | ✅ On |
| 🔥 Honkai Impact 3rd | `ENABLE_HONKAI3RD` | ❌ Off |
| ⚖️ Tears of Themis | `ENABLE_TOT` | ❌ Off |

---

## Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v16+

### 2. Install
```bash
cd hoyolab-checkin
npm install
```

### 3. Configure cookies

Copy the example env file:
```bash
copy .env.example .env
```

Then fill in your HoyoLab cookies (see below).

### 4. Test connection
```bash
npm test
```

### 5. Start the service
```bash
npm start
```

---

## Getting Your HoyoLab Cookies

> ⚠️ **Never share your cookies** — they give full access to your HoyoLab account.

1. Open [hoyolab.com](https://www.hoyolab.com) and log in
2. Press **F12** → **Application** tab → **Cookies** → `https://www.hoyolab.com`
3. Copy the following values into your `.env`:

| Cookie Name | .env Key |
|---|---|
| `ltuid_v2` | `LTUID_V2` |
| `ltoken_v2` | `LTOKEN_V2` |
| `cookie_token_v2` | `COOKIE_TOKEN_V2` |
| `account_id_v2` | `ACCOUNT_ID_V2` |

---

## Running as a Windows Background Service

### Option A: PM2 (Recommended — auto-restart + startup)

```bash
npm install -g pm2
pm2 start src/index.js --name hoyolab-checkin
pm2 save
pm2 startup   # follow the printed command to auto-start on boot
```

Useful PM2 commands:
```bash
pm2 status               # View running services
pm2 logs hoyolab-checkin # View live logs
pm2 restart hoyolab-checkin
pm2 stop hoyolab-checkin
```

### Option B: Windows Task Scheduler

1. Open **Task Scheduler** → **Create Basic Task**
2. Set trigger: **Daily** at **12:00 AM** (then set "Repeat task every 1 day")
3. Action: **Start a program**
   - Program: `node`
   - Arguments: `C:\Users\ROG\hoyolab-checkin\src\checkin.js`
   - Start in: `C:\Users\ROG\hoyolab-checkin`
4. Check "Run whether user is logged on or not"

### Option C: Run in background (simple)

```bash
# Keep running (PowerShell)
Start-Process node -ArgumentList "src/index.js" -WorkingDirectory "C:\Users\ROG\hoyolab-checkin" -WindowStyle Hidden
```

---

## Manual Check-in (run now)

```bash
npm run checkin
# or
node src/checkin.js
```

---

## Notifications

### Discord Webhook
1. In your Discord server: **Edit Channel** → **Integrations** → **Webhooks** → **New Webhook**
2. Copy the webhook URL into `.env`:
   ```
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
   ```

### Telegram Bot
1. Create a bot with [@BotFather](https://t.me/botfather) → copy the token
2. Get your chat ID from [@userinfobot](https://t.me/userinfobot)
3. Set in `.env`:
   ```
   TELEGRAM_BOT_TOKEN=123456789:ABC...
   TELEGRAM_CHAT_ID=987654321
   ```

---

## Project Structure

```
hoyolab-checkin/
├── src/
│   ├── index.js      ← Main scheduler (00:00 cron)
│   ├── checkin.js    ← Check-in runner (all games)
│   ├── api.js        ← HoyoLab API client
│   ├── games.js      ← Game configs & act_ids
│   ├── notify.js     ← Discord / Telegram alerts
│   ├── logger.js     ← Winston file + console logger
│   └── test.js       ← Connectivity tester
├── logs/             ← Auto-created log files
├── .env              ← Your secrets (never commit!)
├── .env.example      ← Template
└── package.json
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `retcode -100` | Cookies expired — re-copy from browser |
| `retcode -5003` | Already checked in today (not an error) |
| `retcode -429` | Rate limited — wait a few minutes |
| No games checking in | Check `ENABLE_GENSHIN=true` in `.env` |
| Service not starting at midnight | Use PM2 or Windows Task Scheduler |

---

## Schedule Examples

Change `CRON_SCHEDULE` in `.env`:

```
0 0 0 * * *    # Every day at 00:00:00 (default)
0 5 0 * * *    # Every day at 00:05:00 (5 min after midnight)
0 0 8 * * *    # Every day at 08:00:00
```
