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
