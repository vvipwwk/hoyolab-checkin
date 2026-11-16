# 🎮 HoyoLab Auto Check-in — Cloud Web Edition

Automatically claims daily rewards for **Genshin Impact**, **Honkai: Star Rail**, and **Zenless Zone Zero** every night at **00:00 midnight (Malaysia / Singapore / UTC+8)**.

No programming knowledge or command line needed!

---

## 🚀 Quick Setup (3 Easy Steps)

### Step 1: Deploy to Vercel (100% Free)
1. Push this repository to your GitHub account (or fork it).
2. Go to [Vercel](https://vercel.com) and click **"Add New..." → "Project"**.
3. Import your `hoyolab-checkin` repository and click **Deploy**.

---

### Step 2: Grab your HoyoLab Cookies
1. Open your computer browser (Chrome, Edge, or Brave).
2. Go to [hoyolab.com](https://www.hoyolab.com) and log into your Hoyoverse account.
3. Press **F12** on your keyboard (or right-click → **Inspect**).
4. Click on the **Application** tab at the top.
5. In the left panel, click **Cookies** → `https://www.hoyolab.com`.
6. Copy the values of these 4 items:
   - `ltuid_v2` (Your account number)
   - `ltoken_v2` (Your login token)
   - `cookie_token_v2`
   - `account_id_v2`

---

### Step 3: Add Cookies to Vercel
1. In your [Vercel Project Dashboard](https://vercel.com/dashboard), click **Settings** → **Environment Variables**.
2. Add these variables:

| Key | Value | Description |
|---|---|---|
| `LTUID_V2` | *(paste your ltuid_v2)* | Your HoyoLab ID |
| `LTOKEN_V2` | *(paste your ltoken_v2)* | Your session key |
| `COOKIE_TOKEN_V2` | *(paste your cookie_token_v2)* | Verification token |
| `ACCOUNT_ID_V2` | *(paste your account_id_v2)* | Account ID |
| `ENABLE_GENSHIN` | `true` | Genshin Impact Check-in |
| `ENABLE_STARRAIL` | `true` | Honkai: Star Rail Check-in |
| `ENABLE_ZZZ` | `true` | Zenless Zone Zero Check-in |

3. Click **Deployments** tab in Vercel → Click the 3 dots on your deployment → **Redeploy**.

---

## 📱 Web Dashboard
Once deployed, opening your Vercel website URL (e.g. `https://your-project.vercel.app`) opens a dashboard where you can:
- ✅ View check-in connection status.
- 📋 Copy variable names with one click.
- 🎮 Click **"Run Check-in Right Now"** to test everything and claim today's rewards immediately!
- ⏰ Runs automatically every day at 00:00 without needing your computer on.
