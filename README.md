# Brass Ledger — Remote Wipe Control

A self-contained webpage — installable as a real home-screen app icon — that
lets a shop owner remotely arm a device wipe on a Brass Ledger POS
installation, from any phone. One tap to open, a typed confirmation step
before anything actually happens.

**This is a standalone project, independent of the Brass Ledger desktop app.**
It is not installed alongside the POS software — it's a webpage you host once,
install to your phone's home screen as an app icon, and use only in an
emergency (lost/stolen device, etc.).

---

## What this is (and isn't)

- ✅ No build step, no framework, no backend server — just static files
- ✅ Installable as a standalone app icon (PWA) — opens full-screen, no
  browser address bar, its own icon, feels like tapping a real app
- ✅ Stays signed in across app opens (not just per-browser-session), so
  re-authenticating with Google isn't required every single time
- ✅ Opens instantly even with no signal at that exact moment (the shell is
  cached) — only the actual wipe-arming step needs live connectivity
- ✅ Talks directly to Google Drive using your own Google account
- ❌ Not part of the Brass Ledger installer — never bundled with the desktop app
- ❌ Not published on the App Store / Play Store — installed directly from
  the browser via "Add to Home Screen," no app-store account needed

---

## How it works

1. The Brass Ledger desktop app maintains a small file called `remote-wipe.json`
   inside its Google Drive backup folder. It ships defaulted to `{ "wipe": false }`.
2. The desktop app checks this file every 5 minutes while running.
3. This webpage — opened from a phone, tablet, or any browser — signs into the
   **same Google account** and can flip that file to `{ "wipe": true }`.
4. On its next check-in, the desktop app:
   - Uploads a full backup of its database to Google Drive (safety net)
   - Permanently deletes its local database and local backup folder
   - Resets the flag back to `false` so it can't fire again accidentally

The entire wipe happens **unattended on the device** — no PIN prompt, no local
confirmation dialog. All the safety and confirmation happens here, on this page,
before the flag is ever set.

---

---

## ⚠️ Before you push this to GitHub

**GitHub Pages requires a public repo** unless you're on GitHub Pro/Team/Enterprise. If you deploy via GitHub Pages on a free account, `index.html` — including whatever Client ID you paste into it — will be **publicly visible** to anyone who finds the repo.

This is lower-risk than it sounds, but worth understanding exactly why before you push:

- A Google OAuth **Client ID** is not a secret by design — it's meant to be embedded in public client-side apps (this is literally Google's documented pattern for browser-based OAuth). It cannot be used alone to access anyone's data.
- The real gatekeeper is the **Authorized JavaScript origins / redirect URIs** allow-list you set in Google Cloud Console (Step 1 below) — only requests originating from *that exact URL* are accepted by Google, so a Client ID pasted into public HTML is not usable from anywhere else.
- You do **not** paste a Client *Secret* into this file — implicit OAuth flow (which this page uses) never needs one. If you ever see a field asking for a secret here, that's a sign something's wrong.

**If you'd rather keep the repo private:**
- Use **Netlify Drop** or **Vercel** instead of GitHub Pages — both support deploying from a private repo (or even a single dragged file, no repo at all) on their free tiers.
- Or upgrade to GitHub Pro to enable Pages on a private repo.

---

## One-time setup (about 5 minutes)

### Step 1 — Create a Google OAuth Web Client

This page needs its own OAuth client (different from the one the desktop app
uses, because phone browsers and desktop apps authenticate differently).

1. Go to **console.cloud.google.com**
2. Select the **same Google Cloud project** you used to set up Drive Sync in
   the Brass Ledger desktop app (Settings → Drive Sync tells you which project,
   or create a new one — either works, as long as this page and the desktop
   app's Drive Sync sign in with the **same Google account**)
3. Go to **APIs & Services → Credentials**
4. Click **+ Create Credentials → OAuth client ID**
5. Application type: **Web application**
6. Name it e.g. "Brass Ledger — Remote Wipe Control"
7. Under **Authorized JavaScript origins**, add the URL you'll host this page at
   (you'll get this URL in Step 2 below — come back and add it here after)
8. Under **Authorized redirect URIs**, add the exact same URL
9. Click **Create** — copy the **Client ID** (format: `123-abc.apps.googleusercontent.com`)

### Step 2 — Host the page

Pick one — all are free and take under a minute:

**Option A — Netlify Drop (fastest, no account needed for a quick test)**
1. Go to **app.netlify.com/drop**
2. Drag `index.html` onto the page
3. You'll get an instant URL like `https://random-name-123.netlify.app`
4. Go back to Step 1.7–1.8 and add this exact URL

**Option B — GitHub Pages (more permanent, needs a GitHub account)**
1. Create a new GitHub repository (can be private)
2. Upload `index.html` to it
3. Go to repo **Settings → Pages** → set source to your main branch
4. GitHub gives you a URL like `https://yourusername.github.io/repo-name/`
5. Add that URL to Step 1.7–1.8

**Option C — Any static host you already use**
Just upload the single file — Vercel, Cloudflare Pages, S3 + CloudFront, your
own server, all work identically since it's one static HTML file.

### Step 3 — Paste your Client ID into the file

1. Open `index.html` in any text editor
2. Find this line near the top of the `<script>` section:
   ```js
   const CLIENT_ID = 'PASTE_YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com';
   ```
3. Replace the placeholder with your real Client ID from Step 1
4. Re-upload the file to your host from Step 2 (drag again on Netlify, or
   commit + push on GitHub Pages)

### Step 4 — Install it as an app icon on your phone

This page is now a proper installable web app (PWA) — it has its own icon,
opens full-screen with no browser address bar, and stays signed in between
opens. "Add to Home Screen" gives you a real app shortcut, not just a
bookmark.

**On Android (Chrome):**
1. Open the hosted URL
2. Sign in with Google once to confirm it works
3. Tap the **⋮** menu → **Add to Home screen** (or Chrome may show an
   "Install app" banner automatically — tap that instead if it appears)
4. Confirm — the icon appears on your home screen like any other app

**On iPhone (Safari — this must be Safari, not Chrome, for this to work on iOS):**
1. Open the hosted URL in Safari
2. Sign in with Google once to confirm it works
3. Tap the **Share** icon (square with an arrow) → **Add to Home Screen**
4. Confirm — the icon appears on your home screen

Either way, tapping the icon now opens straight into the control screen —
already signed in (as long as your last sign-in hasn't expired), no browser
chrome, ready to arm in one tap plus the typed confirmation.

---

## Using it in an emergency

1. Tap the home-screen icon
2. Sign in with Google if not already signed in
3. The page shows the device's current flag status (safe / armed / last wipe time)
4. Tap **ARM DEVICE WIPE**
5. Type `WIPE` in the confirmation field — the confirm button only enables once typed correctly
6. Tap **CONFIRM — SET WIPE FLAG**
7. The device will detect this and wipe within 5 minutes, the next time it's
   online and running

---

## Safety notes — read before using

- **Requires the target device to be online.** If the laptop is off or offline,
  the wipe simply waits until it reconnects and checks the flag again.
- **A full backup is always uploaded to Drive first**, automatically, before
  anything local is deleted. Nothing is permanently lost — you can restore
  onto a new device from that backup.
- **The flag resets to `false` automatically** after the wipe completes, so
  reopening this page afterward will show "safe" again.
- **Anyone signed into this page can arm a wipe.** Treat the bookmark/URL like
  you'd treat your Drive password:
  - Don't share the link
  - Sign out ("Reset connection" link at the bottom) if using a shared device
  - The page uses `sessionStorage` for the login token, so closing the browser
    tab requires signing in again — this is intentional, to limit how long an
    authorized session lingers on a phone that could be lost or borrowed
- **There's no "undo" button on this page currently.** If armed by mistake,
  you'd need to manually open `remote-wipe.json` in Google Drive and edit
  `"wipe": true` back to `"wipe": false` within the 5-minute window before the
  device checks in. (A disarm button can be added on request.)

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| "This page is not configured yet" banner | You haven't pasted your Client ID into the file (Step 3) |
| Sign-in redirects but nothing happens | The redirect URI in Google Cloud Console doesn't exactly match your hosted URL — check for a trailing slash mismatch |
| "Could not reach Drive" error | Check the phone's internet connection; if the OAuth client hasn't been used in 6+ months Google may require re-consent |
| Device never wipes after arming | Confirm the Brass Ledger desktop app is running, online, and its Drive Sync is signed into the **same** Google account as this page |
| Want to cancel an armed wipe before the device checks in | Open Google Drive directly, find `remote-wipe.json` inside the app's Drive folder, edit it, set `"wipe"` back to `false`, save |

---

## Files in this project

| File | Purpose |
|---|---|
| `index.html` | The entire control page — edit the `CLIENT_ID` line and host it |
| `manifest.json` | Web app manifest — makes "Add to Home Screen" install a real app icon instead of a bookmark |
| `sw.js` | Service worker — caches the page shell so it opens instantly, even offline (the actual wipe action still needs real connectivity) |
| `icon-192.png`, `icon-512.png` | Standard app icons |
| `icon-maskable-192.png`, `icon-maskable-512.png` | Android "maskable" icon variants — safe to crop into a circle/squircle by the OS without cutting off the design |
| `README.md` | This file |

All six files must be uploaded together and kept in the same folder — the
manifest and service worker both reference the others by relative path.
