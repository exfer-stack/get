# Exfer — Downloads & guides

The one-stop landing page for everything Exfer: **wallets** (desktop &
mobile), the **node** and **indexer** to self-host, and the **developer
tools**. Published as a GitHub Pages site.

> 🌐 **Live site:** https://exfer-stack.github.io/get/ *(enabled when this repo
> goes public)*

## What's here

- `index.html` + `assets/` — a static, dependency-light landing page
  (black/cyan brand, Geist). Bilingual **English / 简体中文** via
  `lang/*.json` and an in-page switcher.
- `releases.json` — the data the page reads (versions + per-OS asset URLs).
  **Auto-generated** by the workflow below; don't hand-edit.
- `.github/workflows/refresh-releases.yml` + `scripts/refresh-releases.mjs` —
  refreshes `releases.json` from each component repo's latest release (daily,
  on manual dispatch, and when a component repo pings via `repo_dispatch`).

## How "latest" stays current

Component installers' filenames embed their version (e.g.
`Exfer.Wallet_0.13.0_aarch64.dmg`), so a static `/releases/latest/download/…`
link can't work. Instead the refresh workflow queries each repo's latest
release via the GitHub API and writes the real `browser_download_url`s into
`releases.json`, which the page renders. Add a repo or asset by editing
`scripts/refresh-releases.mjs`.

## Mobile builds

`exfer-walletd-mobile` is a private repo, so its release assets aren't publicly
downloadable. Its release workflow **mirrors** the `.apk`/`.aab` into *this*
repo's Releases (tag `mobile-vX.Y.Z`); the page links there.

## Develop locally

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## Translations

Copy `lang/en.json` to `lang/<code>.json`, translate the values, and add the
code to `LANGS` in `assets/app.js` plus a button in `index.html`'s
`#lang-switch`.
