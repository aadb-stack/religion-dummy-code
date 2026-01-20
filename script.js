// =============================================
// World Population by Religion (STABLE + CORRECT)
// Firebase Anchor + Per-Religion Growth
// =============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

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
const statsRef = ref(db, "/");

const secondsPerYear = 365 * 24 * 60 * 60;
const worldGrowthRate = 0.0085;

const religionData = {
  christian:    { share: 2380000000 / 8180000000, rate:  0.009 },
  islam:        { share: 2020000000 / 8180000000, rate:  0.018 },
  hindu:        { share: 1200000000 / 8180000000, rate:  0.011 },
  buddhism:     { share:  520000000 / 8180000000, rate:  0.003 },
  sikhism:      { share:   30000000 / 8180000000, rate:  0.012 },
  judaism:      { share:   15000000 / 8180000000, rate:  0.003 },
  taoism:       { share:   12000000 / 8180000000, rate: -0.001 },
  confucianism: { share:    6000000 / 8180000000, rate: -0.003 },
  jainism:      { share:    4500000 / 8180000000, rate:  0.004 },
  shinto:       { share:    3000000 / 8180000000, rate: -0.005 },
  unaffiliated: { share: 1900000000 / 8180000000, rate:  0.007 }
};

let baseWorld = 0;
let baseTimestamp = 0;
let ready = false;
let prevWorld = null;
const baseReligions = {};

async function loadAnchor() {
  const snap = await get(statsRef);
  const data = snap.val();

  baseWorld = Number(data.baseWorld);
  baseTimestamp = Number(data.baseTimestamp);

  for (const key in religionData) {
    baseReligions[key] = Math.floor(baseWorld * religionData[key].share);
  }

  ready = true;
}

function currentWorld() {
  const elapsed = (Date.now() - baseTimestamp) / 1000;
  return Math.floor(
    baseWorld * (1 + worldGrowthRate * elapsed / secondsPerYear)
  );
}

function currentReligion(base, rate) {
  const elapsed = (Date.now() - baseTimestamp) / 1000;
  return Math.floor(
    base * (1 + rate * elapsed / secondsPerYear)
  );
}

function update() {
  if (!ready) return;

  const world = currentWorld();
  const worldEl = document.getElementById("world");

  if (worldEl) {
    worldEl.textContent = world.toLocaleString();
    worldEl.style.color =
      prevWorld !== null && world < prevWorld ? "#ff4d4d" : "#00ff88";
    prevWorld = world;
  }

  for (const key in religionData) {
    const el = document.getElementById(key);
    if (!el) continue;

    const value = currentReligion(
      baseReligions[key],
      religionData[key].rate
    );

    el.textContent = value.toLocaleString();
    el.style.color =
      religionData[key].rate >= 0 ? "#00ff88" : "#ff4d4d";
  }
}

await loadAnchor();
update();
setInterval(update, 1000);
