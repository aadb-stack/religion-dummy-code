// =============================================
// World Population by Religion (FINAL WORKING)
// Firebase Anchor + Green/Red
// =============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

// ---------- FIREBASE ----------
const firebaseConfig = {
  apiKey: "AIzaSyC60KbVWhfeMRUyYPQHn_4z3tL_KPuaCAs",
  authDomain: "world-religion-database.firebaseapp.com",
  databaseURL: "https://world-religion-database-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "world-religion-database",
  storageBucket: "world-religion-database.firebasestorage.app",
  messagingSenderId: "226381276599",
  appId: "1:226381276599:web:5c15d6b6f32e232125b432"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const anchorRef = ref(db, "/");

// ---------- CONSTANTS ----------
const secondsPerYear = 365 * 24 * 60 * 60;
const worldGrowthRate = 0.0085;

// Initial shares (Pew ~2023)
let shares = {
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

// Pew-based annual drift
const shareDriftPerYear = {
  christian: -0.0010,
  islam: 0.0016,
  hindu: 0.0003,
  buddhism: -0.0020,
  sikhism: 0.0001,
  judaism: 0.0,
  taoism: -0.0015,
  confucianism: -0.0015,
  jainism: 0.0,
  shinto: -0.0030,
  unaffiliated: 0.0012
};

// ---------- STATE ----------
let baseWorld = 0;
let baseTime = 0;
let ready = false;
let prevValues = {};

// ---------- LOAD ANCHOR ----------
async function loadAnchor() {
  const snap = await get(anchorRef);
  const data = snap.val();

  baseWorld = data.baseWorld;
  baseTime = data.baseTimestamp;
  ready = true;
}

// ---------- CALC ----------
function computeWorld() {
  const elapsed = (Date.now() - baseTime) / 1000;
  return baseWorld * (1 + worldGrowthRate * elapsed / secondsPerYear);
}

function updateShares(elapsedYears) {
  let total = 0;

  for (const key in shares) {
    shares[key] += shareDriftPerYear[key] * elapsedYears;
    shares[key] = Math.max(shares[key], 0); // no negative shares
    total += shares[key];
  }

  // Normalize
  for (const key in shares) {
    shares[key] /= total;
  }
}

// ---------- UPDATE ----------
function update() {
  if (!ready) return;

  const elapsedYears = (Date.now() - baseTime) / (1000 * secondsPerYear);
  updateShares(elapsedYears);

  const world = Math.floor(computeWorld());
  const worldEl = document.getElementById("world");
  worldEl.textContent = world.toLocaleString();

  for (const key in shares) {
    const value = Math.floor(world * shares[key]);
    const el = document.getElementById(key);
    if (!el) continue;

    el.textContent = value.toLocaleString();

    if (prevValues[key] !== undefined) {
      el.style.color =
        value > prevValues[key] ? "#00ff88" :
        value < prevValues[key] ? "#ff4d4d" :
        "white";
    }

    prevValues[key] = value;
  }
}

// ---------- START ----------
loadAnchor().then(() => {
  update();
  setInterval(update, 1000);
});
