// =============================================
// World Population by Religion (STABLE VERSION)
// No Firebase. No async. No zeros.
// =============================================

// ---- CONSTANTS ----
const secondsPerYear = 365 * 24 * 60 * 60;

// Anchor (world population at a fixed known time)
const BASE_WORLD = 8180000000;
const BASE_TIMESTAMP = Date.UTC(2025, 0, 1); // Jan 1, 2025 UTC

const GROWTH_RATE = 0.0085;

const religionShares = {
  christian: 2380000000 / 8180000000,
  islam: 2020000000 / 8180000000,
  hindu: 1200000000 / 8180000000,
  buddhism: 520000000 / 8180000000,
  sikhism: 30000000 / 8180000000,
  judaism: 15000000 / 8180000000,
  taoism: 12000000 / 8180000000,
  confucianism: 6000000 / 8180000000,
  jainism: 4500000 / 8180000000,
  shinto: 3000000 / 8180000000,
  unaffiliated: 1900000000 / 8180000000
};

// ---- UI STATE ----
let prevWorld = null;

// ---- WORLD CALC ----
function computeWorldNow() {
  const now = Date.now();
  const elapsedSeconds = (now - BASE_TIMESTAMP) / 1000;

  return Math.floor(
    BASE_WORLD * (1 + GROWTH_RATE * elapsedSeconds / secondsPerYear)
  );
}

// ---- UPDATE ----
function updateCounters() {
  const worldNow = computeWorldNow();

  const worldEl = document.getElementById("world");
  if (worldEl) {
    worldEl.textContent = worldNow.toLocaleString();

    if (prevWorld !== null) {
      worldEl.style.color =
        worldNow > prevWorld ? "#00ff88" :
        worldNow < prevWorld ? "#ff4d4d" :
        "white";
    }

    prevWorld = worldNow;
  }

  for (const key in religionShares) {
    const el = document.getElementById(key);
    if (!el) continue;

    const value = Math.floor(worldNow * religionShares[key]);
    el.textContent = value.toLocaleString();
    el.style.color = "#00ff88";
  }
}

// ---- RUN ----
updateCounters();
setInterval(updateCounters, 1000);

