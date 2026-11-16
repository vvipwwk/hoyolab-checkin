# ============================================================
# HoyoLab Check-in — Cloud Deployment Guide
# ============================================================

## Option 1: GitHub Actions (Recommended — Free, like Apps Script)

### Why GitHub Actions?
| Feature | Google Apps Script | GitHub Actions |
|---|---|---|
| Cost | Free | Free (2000 min/month private, unlimited public) |
| Schedule | Time-based trigger | Cron schedule |
| Secrets | Script Properties | GitHub Secrets |
| Logs | Executions tab | Actions Run logs |
| Manual trigger | Run now button | workflow_dispatch |
| No server needed | ✅ | ✅ |

---

### Setup Steps

#### 1. Create a GitHub repository

Go to [github.com/new](https://github.com/new) and create a **private** repo (keeps your workflow private).

#### 2. Push the project

```bash
cd C:\Users\ROG\hoyolab-checkin
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/hoyolab-checkin.git
git push -u origin main
```

#### 3. Add GitHub Secrets (your cookies)

Go to your repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these **Secrets** (sensitive values):

| Secret Name | Value |
|---|---|
| `LTUID_V2` | Your `ltuid_v2` cookie |
| `LTOKEN_V2` | Your `ltoken_v2` cookie |
| `COOKIE_TOKEN_V2` | Your `cookie_token_v2` cookie |
| `ACCOUNT_ID_V2` | Your `account_id_v2` cookie |
| `DISCORD_WEBHOOK_URL` | (optional) Discord webhook |
| `TELEGRAM_BOT_TOKEN` | (optional) Telegram bot token |
| `TELEGRAM_CHAT_ID` | (optional) Telegram chat ID |

Add these **Variables** (non-sensitive settings) under **Variables** tab:

| Variable Name | Value |
|---|---|
| `ENABLE_GENSHIN` | `true` |
| `ENABLE_STARRAIL` | `true` |
| `ENABLE_ZZZ` | `true` |
| `ENABLE_HONKAI3RD` | `false` |
| `ENABLE_TOT` | `false` |
| `TIMEZONE` | `Asia/Kuala_Lumpur` |

#### 4. Test manually

Go to repo → **Actions** tab → **HoyoLab Daily Check-in** → **Run workflow** → set `dry_run = true` → **Run workflow**

This tests your cookies without actually checking in.

Then run again with `dry_run = false` to do a real check-in.

#### 5. The workflow auto-runs every night at 00:00 MYT

No further action needed — GitHub runs it for you.

---

## Option 2: Railway (Persistent Node.js service, $5/month hobby)

Railway runs your `npm start` (the cron scheduler in `src/index.js`) as a persistent process — identical to running it on your own server, but fully managed.

### Steps

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. In the project folder:
   ```bash
   cd C:\Users\ROG\hoyolab-checkin
   railway init
   railway up
   ```
4. Set environment variables in the Railway dashboard under **Variables**:
   - All the same keys as the `.env` file
5. Railway keeps it running 24/7 — the built-in cron fires at midnight

---

## Option 3: Render.com (Free cron job tier)

Render has a **Cron Job** service type (free tier available).

1. Push project to GitHub (same as step 1-2 above)
2. Go to [render.com](https://render.com) → **New** → **Cron Job**
3. Connect your GitHub repo
4. Set:
   - **Build command**: `npm install`
   - **Command**: `node src/checkin.js`
   - **Schedule**: `0 16 * * *` (00:00 MYT)
5. Add environment variables in the Render dashboard

---

## Comparison Table

| Platform | Cost | Type | Setup | Like Apps Script? |
|---|---|---|---|---|
| **GitHub Actions** | ✅ Free | Scheduled runner | Easy | ✅ Most similar |
| **Render Cron Job** | ✅ Free tier | Cron job | Easy | ✅ Similar |
| **Railway** | ~\$5/mo | Persistent service | Medium | ⚠️ Always-on |
| **Fly.io** | ✅ Free tier | Persistent service | Medium | ⚠️ Always-on |
| **Google Cloud Run** | ✅ Free tier | HTTP + Cloud Scheduler | Complex | 🔧 Advanced |
