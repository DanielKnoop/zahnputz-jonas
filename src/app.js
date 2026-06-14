// src/app.js
import { buildSequence } from './kai-sequence.js';
import { stepAtElapsed } from './timer.js';
import { loadState, recordBrushing, saveState, todayIso } from './progress.js';
import { isSundayInBerlin } from './schedule.js';
import { GREETINGS, PHASE_INTROS, FINISHES, ELMEX_REMINDER, pick } from './speeches.js';
import { heroSvg } from './svg/hero.js';
import { mouthSvg, ZONE_TARGETS } from './svg/mouth.js';
import { ringSvg, RING_CIRCUMFERENCE } from './svg/ring.js';
import { cauldronSvg } from './svg/cauldron.js';
import { villageSvg } from './svg/village.js';
import { registerSW, enablePush } from './push-client.js';

const $ = (id) => document.getElementById(id);
const screens = ['screen-start', 'screen-brush', 'screen-rate', 'screen-reward', 'screen-parent'];
function show(id) {
  screens.forEach((s) => $(s).classList.toggle('active', s === id));
}

let state = loadState(localStorage);
const seed = Object.keys(state.entries).length;

function renderStart() {
  $('hero-slot').innerHTML = heroSvg();
  $('greeting').textContent = pick(GREETINGS, seed);
  if (state.streak > 0) {
    $('streak-badge').hidden = false;
    $('streak-badge').textContent = `🔥 ${state.streak} Abende in Folge!`;
  }
}

$('start-btn').addEventListener('click', startBrushing);
$('parent-link').addEventListener('click', () => show('screen-parent'));
$('parent-back').addEventListener('click', () => show('screen-start'));
$('stop-btn').addEventListener('click', () => show('screen-start'));

renderStart();
show('screen-start');

// --- Putzreise ---
const sequence = buildSequence();
let rafId = null;
let startTs = null;
let lastPhase = null;

function setupBrushDom() {
  $('mouth-slot').innerHTML = mouthSvg();
  $('ring-slot').innerHTML = ringSvg();
  $('cauldron-slot').innerHTML = cauldronSvg();
  lastPhase = null;
}

function highlightZone(zoneId) {
  document.querySelectorAll('#mouth-slot [data-zone]').forEach((el) => {
    el.classList.remove('zone-active');
    el.setAttribute('fill', '#fff');
  });
  for (const target of ZONE_TARGETS[zoneId] ?? []) {
    const el = document.querySelector(`#mouth-slot [data-zone="${target}"]`);
    if (el) { el.classList.add('zone-active'); el.setAttribute('fill', '#fff7c0'); }
  }
}

function renderTick(now) {
  const elapsed = (now - startTs) / 1000;
  const r = stepAtElapsed(sequence, elapsed);
  if (r.done) { finishBrushing(); return; }

  // Phasenbanner + Spruch bei Wechsel
  if (r.step.phase !== lastPhase) {
    lastPhase = r.step.phase;
    $('phase-banner').textContent = `${r.step.phase} — ${r.step.phaseLabel}`;
    $('motion-hint').textContent = PHASE_INTROS[r.step.phase];
    highlightZone(r.step.zoneId);
    beep();
  } else {
    highlightZone(r.step.zoneId);
  }

  // Ring (Restzeit im aktuellen Schritt)
  const ringEl = document.getElementById('ring-progress');
  const labelEl = document.getElementById('ring-label');
  if (ringEl) {
    const frac = r.remainingInStep / r.step.seconds;
    ringEl.setAttribute('stroke-dashoffset', String(RING_CIRCUMFERENCE * (1 - frac)));
    labelEl.textContent = String(Math.ceil(r.remainingInStep));
  }
  // Kessel (Gesamtfortschritt)
  const fillEl = document.getElementById('potion-fill');
  if (fillEl) {
    const done = 1 - r.totalRemaining / 180;
    // Clip-Pfad des Kessels reicht von y=55 bis y=135 (80px hoch).
    const h = 80 * done;
    fillEl.setAttribute('y', String(135 - h));
    fillEl.setAttribute('height', String(h));
  }
  rafId = requestAnimationFrame(renderTick);
}

function startBrushing() {
  setupBrushDom();
  show('screen-brush');
  startTs = performance.now();
  rafId = requestAnimationFrame(renderTick);
}

function finishBrushing() {
  cancelAnimationFrame(rafId);
  show('screen-rate');
}

// kurzer Bestätigungston (WebAudio, keine Datei nötig)
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.frequency.value = 660; o.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    o.start(); o.stop(ctx.currentTime + 0.25);
  } catch { /* Audio optional */ }
}

// --- Bewertung & Belohnung ---
document.querySelectorAll('.face').forEach((btn) => {
  btn.addEventListener('click', () => {
    const rating = btn.dataset.rating;
    state = recordBrushing(state, todayIso(), rating);
    saveState(localStorage, state);
    renderReward();
    show('screen-reward');
  });
});

function renderReward() {
  $('reward-hero').innerHTML = heroSvg({ cheering: true });
  $('reward-text').textContent = `${pick(FINISHES, seed)}  🔥 ${state.streak} in Folge!`;
  $('village-slot').innerHTML = villageSvg(state.hinkelsteine);
  const banner = $('elmex-banner');
  if (isSundayInBerlin(new Date())) {
    banner.hidden = false;
    banner.textContent = ELMEX_REMINDER;
  } else {
    banner.hidden = true;
  }
}

$('done-btn').addEventListener('click', () => {
  state = loadState(localStorage);
  renderStart();
  show('screen-start');
});

// --- PWA / Push ---
registerSW().catch((e) => console.warn('SW-Registrierung fehlgeschlagen', e));

$('enable-push-btn').addEventListener('click', async () => {
  try {
    const subJson = await enablePush();
    $('push-status').textContent = '✅ Aktiviert. Abo unten als GitHub-Secret hinterlegen.';
    $('sub-json').value = subJson;
  } catch (e) {
    $('push-status').textContent = '⚠️ ' + e.message;
  }
});

$('copy-sub-btn').addEventListener('click', async () => {
  const ta = $('sub-json');
  try { await navigator.clipboard.writeText(ta.value); $('push-status').textContent = '📋 Kopiert!'; }
  catch { ta.select(); document.execCommand('copy'); }
});
