# 💰 Money Flow — Personal Finance Tracker

A mobile-first personal finance PWA with AI assistant.

## 🚀 Deploy to GitHub Pages (5 minutes)

### Step 1 — Create GitHub Repo
1. Go to [github.com](https://github.com) → Sign up (free)
2. Click **+** → **New repository**
3. Name it: `moneyflow`
4. Set to **Public** → Click **Create repository**

### Step 2 — Upload Files
Upload ALL files in this folder:
- `index.html`
- `manifest.json`
- `icon-192.png`
- `icon-512.png`
- `README.md`

Click **Add file** → **Upload files** → drag all files → **Commit changes**

### Step 3 — Enable GitHub Pages
1. Go to your repo **Settings** tab
2. Scroll to **Pages** section
3. Under **Source** → select **Deploy from a branch**
4. Branch: **main** → Folder: **/ (root)** → **Save**
5. Wait ~60 seconds → your URL appears:
   `https://YOUR-USERNAME.github.io/moneyflow`

### Step 4 — Install on Your Phone
Open the URL in your phone browser, then:

**iPhone (Safari):**
Tap the Share icon → **"Add to Home Screen"** → Add

**Android (Chrome):**
Tap ⋮ menu → **"Add to Home Screen"** → Install

✅ Done! Money Flow now appears as an app icon on your phone.

---

## 🤖 Enable AI Assistant
The AI chat requires an Anthropic API key.

1. Get a free key at [console.anthropic.com](https://console.anthropic.com)
2. Open `index.html` in a text editor
3. Find: `headers: { "Content-Type":"application/json" }`
4. Add: `"x-api-key": "sk-ant-YOUR-KEY-HERE",`
5. Also add: `"anthropic-dangerous-direct-browser-calls": "true",`
6. Re-upload `index.html` to GitHub

---

## 📱 Features
- Dashboard with balance, charts & recent transactions
- Multi-currency support (10 currencies with FX conversion)
- Add/edit/delete income, expenses & savings
- Receipt scanner simulation
- Analytics with trend charts & category breakdown
- AI financial assistant (Claude-powered)
- Category manager
- CSV export
- PWA — installable on iPhone & Android
