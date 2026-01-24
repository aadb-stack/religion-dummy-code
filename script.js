// =============================================
// World Population by Religion – FINAL WORKING
// =============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
let GLOBAL_BASE_TIMESTAMP = 0;

// ---------------------------------------------
// Firebase Config
// ---------------------------------------------
const firebaseConfig = {
  databaseURL: "https://world-religion-database-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const rootRef = ref(db, "/");
const previousDisplay = {};
const baseReligions = {};


// ---------------------------------------------
// Constants
// ---------------------------------------------
const secondsPerYear = 365 * 24 * 60 * 60;
const WORLD_GROWTH_RATE = 0.0085;
const CLEAN_WORLD = 8271000000;

const religionShares = {
  christian: 2400000000 / CLEAN_WORLD,   // 2.40 B
  islam: 2040000000 / CLEAN_WORLD,       // 2.04 B
  hindu: 1210000000 / CLEAN_WORLD,       // 1.21 B
  buddhism: 520000000 / CLEAN_WORLD,     // keep as is
  sikhism: 30000000 / CLEAN_WORLD,
  judaism: 15000000 / CLEAN_WORLD,
  taoism: 12000000 / CLEAN_WORLD,
  confucianism: 6000000 / CLEAN_WORLD,
  jainism: 4500000 / CLEAN_WORLD,
  shinto: 3000000 / CLEAN_WORLD,
  unaffiliated: 1900000000 / CLEAN_WORLD
};
// ---------------------------------------------
// Religion-specific net population growth rates (approx. per year)
// Based on Pew Research Center global change 2010–2020 data,
// annualized and adjusted using UN World Population Prospects 2024
// to reflect early-2020s demographic trends.
// These are NET rates: (births - deaths + switching).
// ---------------------------------------------
const religionGrowthRates = {
  christian: 0.0038,       // ~0.38% per year (slow, mixed regional trends)
  islam: 0.0180,           // ~1.8% per year (fastest growth, high fertility + young age)
  hindu: 0.0070,           // ~0.7% per year (slowing after fertility decline in India)
  buddhism: -0.0012,       // ~-0.12% per year (aging + very low fertility in East Asia)
  sikhism: 0.0045,         // ~0.45% per year (moderate natural increase)
  judaism: 0.0010,         // ~0.10% per year (small global base, mixed fertility)
  taoism: -0.0020,         // ~-0.20% per year (decline driven by China demographics)
  confucianism: -0.0020,   // ~-0.20% per year (decline driven by China demographics)
  jainism: 0.0015,         // ~0.15% per year (small, slow positive growth)
  shinto: -0.0050,         // ~-0.50% per year (strong decline, Japan aging crisis)
  unaffiliated: 0.0100     // ~1.0% per year (switching-driven, low fertility)
};



// ---------------------------------------------
// Load Firebase Anchor
// ---------------------------------------------
async function loadBase() {
  const snapshot = await get(rootRef);

  if (!snapshot.exists()) {
    console.error("No Firebase data found");
    return;
  }

  const { baseWorld, baseTimestamp } = snapshot.val();
  GLOBAL_BASE_TIMESTAMP = baseTimestamp;

  for (const key in religionShares) {
    baseReligions[key] = baseWorld * religionShares[key];
  }

  startCounters(baseWorld, baseTimestamp);
} // 👈 THIS was missing



// ---------------------------------------------
// Counter Logic
// ---------------------------------------------
function startCounters(baseWorld, baseTimestamp) {
  setInterval(() => {
    const elapsedYears =
      (Date.now() - baseTimestamp) / (1000 * secondsPerYear);

    const world =
      baseWorld *
      Math.exp(WORLD_GROWTH_RATE * elapsedYears);

    renderWorld(world);
    renderReligions(elapsedYears);
  }, 1000);
} // ✅ startCounters closed

// ---------------------------------------------
// Render
// ---------------------------------------------
function renderWorld(val) {
  const el = document.getElementById("world");
  if (!el) return;

  const display = Math.floor(val);
  const prev = previousDisplay.world ?? display;

  el.textContent = display.toLocaleString();

  el.style.color =
    display > prev ? "#00ff88" :
    display < prev ? "#ff4d4d" :
    "white";

  previousDisplay.world = display;
}

function renderReligions(elapsedYears) {
  if (!GLOBAL_BASE_TIMESTAMP || !baseReligions.christian) return;

  for (const key in religionShares) {
    const el = document.getElementById(key);
    if (!el) continue;

    const raw =
      baseReligions[key] *
      Math.exp(religionGrowthRates[key] * elapsedYears);

    const display = Math.floor(raw);
    const prev = previousDisplay[key] ?? display;

    el.textContent = display.toLocaleString();

    el.style.color =
      display > prev ? "#00ff88" :
      display < prev ? "#ff4d4d" :
      "white";

    previousDisplay[key] = display;
  }
}


// ---------------------------------------------
// Run
// ---------------------------------------------
loadBase();
