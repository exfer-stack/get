"use strict";

const LANGS = ["en", "zh-CN"];
const LS_LANG = "exfer-get-lang";

let dict = {};

function t(key) {
  return dict[key] != null ? dict[key] : key;
}

function applyI18n() {
  document.documentElement.lang = currentLang();
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const k = el.getAttribute("data-i18n");
    if (dict[k] != null) el.textContent = dict[k];
  });
  document.querySelectorAll("#lang-switch button").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.lang === currentLang()));
  });
}

function currentLang() {
  const saved = localStorage.getItem(LS_LANG);
  if (saved && LANGS.includes(saved)) return saved;
  return (navigator.language || "en").toLowerCase().startsWith("zh") ? "zh-CN" : "en";
}

async function loadLang(code) {
  const res = await fetch(`lang/${code}.json`, { cache: "no-cache" });
  dict = await res.json();
}

function setLang(code) {
  localStorage.setItem(LS_LANG, code);
  loadLang(code).then(() => {
    applyI18n();
    renderAll(); // re-render dynamic buttons with the new language
  });
}

/* ── OS detection (desktop only) ─────────────────────────── */
function detectOS() {
  const ua = navigator.userAgent || "";
  if (/Android/i.test(ua)) return null; // mobile
  if (/iPhone|iPad|iPod/i.test(ua)) return null; // mobile
  if (/Mac/i.test(ua)) return "macos";
  if (/Win/i.test(ua)) return "windows";
  if (/Linux/i.test(ua)) return "linux";
  return null;
}

function btn(label, href, cls) {
  const a = document.createElement("a");
  a.className = "btn " + (cls || "");
  a.href = href;
  a.target = "_blank";
  a.rel = "noopener";
  a.textContent = label;
  return a;
}

/* ── rendering ───────────────────────────────────────────── */
let data = null;

function renderVersions() {
  document.querySelectorAll("[data-ver]").forEach((el) => {
    const c = data.components[el.dataset.ver];
    el.textContent = c && c.version ? "v" + c.version : "";
  });
}

function renderDesktop() {
  const box = document.getElementById("desktop-actions");
  box.innerHTML = "";
  const d = data.components.desktop;
  if (!d || !d.assets) return;
  const a = d.assets;
  const osMap = {
    macos: { asset: a.macos, label: t("os.macos") },
    windows: { asset: a.windows, label: t("os.windows") },
    linux: { asset: a.linux_deb, label: t("os.linux") },
  };
  const os = detectOS();
  if (os && osMap[os] && osMap[os].asset) {
    box.appendChild(
      btn(`${t("btn.downloadFor")} ${osMap[os].label}`, osMap[os].asset.url, "")
    );
  }
  // All platforms as secondary links.
  const links = document.createElement("div");
  links.className = "alt-links";
  const entries = [
    [t("os.macos"), a.macos],
    [t("os.windows"), a.windows],
    [t("dl.linuxDeb"), a.linux_deb],
    [t("dl.linuxAppimage"), a.linux_appimage],
    [t("dl.linuxRpm"), a.linux_rpm],
  ];
  for (const [name, asset] of entries) {
    if (!asset) continue;
    const link = document.createElement("a");
    link.href = asset.url;
    link.textContent = name;
    link.target = "_blank";
    link.rel = "noopener";
    links.appendChild(link);
  }
  box.appendChild(links);
}

function renderMobile() {
  const box = document.getElementById("mobile-actions");
  box.innerHTML = "";
  const m = data.components.mobile;
  if (m && m.assets && m.assets.android) {
    const b = btn(t("btn.androidApk"), m.assets.android.url, "");
    box.appendChild(b);
  }
  const badges = document.createElement("div");
  badges.className = "store-badges";
  const play = document.createElement(m.stores && m.stores.play ? "a" : "span");
  play.className = "store-badge" + (m.stores && m.stores.play ? "" : " soon");
  if (m.stores && m.stores.play) { play.href = m.stores.play; play.target = "_blank"; play.rel = "noopener"; }
  else play.dataset.soon = t("label.soon");
  play.append("Google Play");
  const ios = document.createElement(m.stores && m.stores.appstore ? "a" : "span");
  ios.className = "store-badge" + (m.stores && m.stores.appstore ? "" : " soon");
  if (m.stores && m.stores.appstore) { ios.href = m.stores.appstore; ios.target = "_blank"; ios.rel = "noopener"; }
  else ios.dataset.soon = t("label.soon");
  ios.append("App Store");
  badges.appendChild(play);
  badges.appendChild(ios);
  box.appendChild(badges);
  const note = document.createElement("div");
  note.className = "alt-links";
  const span = document.createElement("a");
  span.href = "https://github.com/exfer-stack/get/releases";
  span.target = "_blank"; span.rel = "noopener";
  span.textContent = t("mobile.allReleases");
  note.appendChild(span);
  box.appendChild(note);
}

function renderSource(key, boxId) {
  const box = document.getElementById(boxId);
  box.innerHTML = "";
  const c = data.components[key];
  if (!c) return;
  box.appendChild(btn(t("btn.viewGithub"), `https://github.com/${c.repo}`, "btn-secondary"));
  box.appendChild(btn(t("btn.guide"), `https://github.com/${c.repo}#readme`, "btn-ghost"));
}

function renderAll() {
  if (!data) return;
  renderVersions();
  renderDesktop();
  renderMobile();
  renderSource("node", "node-actions");
  renderSource("indexer", "indexer-actions");
  renderSource("walletd", "walletd-actions");
  renderSource("py", "py-actions");
  const stamp = document.getElementById("updated-stamp");
  if (data.updated) {
    const d = new Date(data.updated);
    if (!isNaN(d)) stamp.textContent = `${t("footer.updated")} ${d.toISOString().slice(0, 10)}`;
  }
}

/* ── boot ────────────────────────────────────────────────── */
document.getElementById("lang-switch").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-lang]");
  if (b) setLang(b.dataset.lang);
});

(async function init() {
  await loadLang(currentLang());
  applyI18n();
  try {
    const res = await fetch("releases.json", { cache: "no-cache" });
    data = await res.json();
  } catch (e) {
    data = null;
  }
  renderAll();
})();
