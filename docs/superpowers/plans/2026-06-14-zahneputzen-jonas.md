# Zähneputz-Helfer für Jonas — Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eine PWA, die Jonas (6–8 J.) abends per KAI-Prinzip durch 3 Minuten Zähneputzen führt, im Asterix-/Gallier-Comicstil motiviert, eine Selbstbewertung erfasst und sonntags 19:30 per Web-Push an das elmex gelée erinnert.

**Architecture:** Statische PWA auf GitHub Pages. Reine Logik (Sequenz, Timer, Streak, Zeit/Cron) liegt in ES-Modulen unter `src/` und wird per `node --test` getestet. Darstellung (DOM, SVG, CSS) ist dünne Glue-Schicht. Der Sonntags-Push wird von einem GitHub-Actions-Cron via `web-push` (VAPID) verschickt; kein Dauerserver, keine Datenbank — das Push-Abo liegt als GitHub-Secret.

**Tech Stack:** Vanilla JS (ES Modules), HTML, CSS, SVG, Web Push API, Service Worker, Node 20 (`node --test`), `web-push` (nur in CI), GitHub Pages + GitHub Actions.

---

## Dateistruktur

```
/
├── index.html                 # PWA-Shell, Bildschirme als <section>
├── styles.css                 # Comic-Styling
├── manifest.webmanifest       # PWA-Manifest
├── service-worker.js          # Caching + Push-Empfang
├── package.json               # type:module, test-Script, web-push (devDep)
├── src/
│   ├── kai-config.js          # EINZIGE Quelle der Zeitaufteilung (40/75/65s)
│   ├── kai-sequence.js        # baut geordnete Schrittliste aus Config
│   ├── timer.js               # rein: stepAtElapsed()
│   ├── schedule.js            # rein: Berlin-Zeit / Sonntag-Erkennung
│   ├── progress.js            # Streak + Bewertung in localStorage
│   ├── push-client.js         # Push-Abo im Browser (subscribe/serialize)
│   ├── speeches.js            # Comic-Sprüche (Jonas-Bezug)
│   └── app.js                 # State-Machine + DOM-Anbindung
├── scripts/
│   ├── generate-vapid.mjs     # einmalig: VAPID-Schlüsselpaar
│   ├── push-guard.js          # rein: shouldSendNow(date)
│   └── send-elmex-push.mjs    # Cron-Sender (nutzt web-push)
├── assets/
│   ├── icon-192.png, icon-512.png, icon-maskable-512.png
│   └── (SVGs sind inline in index.html/app.js)
├── test/
│   ├── kai-sequence.test.js
│   ├── timer.test.js
│   ├── schedule.test.js
│   ├── progress.test.js
│   └── push-guard.test.js
└── .github/workflows/elmex-sunday.yml
```

---

## Phase A — Projektgerüst

### Task A1: package.json + Test-Runner

**Files:**
- Create: `package.json`

- [ ] **Step 1: package.json anlegen**

```json
{
  "name": "zahnputz-jonas",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test"
  },
  "devDependencies": {
    "web-push": "^3.6.7"
  }
}
```

- [ ] **Step 2: Test-Runner verifizieren**

Run: `cd "/Users/knoop/Entwicklung/Zähneputzen" && node --test`
Expected: läuft durch, „0 tests" (noch keine Tests). Kein Fehler.

- [ ] **Step 3: Commit**

```bash
git add package.json && git commit -m "chore: package.json mit node --test Runner"
```

---

## Phase B — Kernlogik (TDD)

### Task B1: KAI-Konfiguration (Zeitaufteilung)

**Files:**
- Create: `src/kai-config.js`

- [ ] **Step 1: Config schreiben** (einzige Quelle der Wahrheit, leicht anpassbar)

```js
// src/kai-config.js
// Reihenfolge nach KAI: Kauflächen -> Außenflächen -> Innenflächen.
// Summe der Sekunden = 180 (3 Minuten). Hier zentral anpassbar.
export const KAI_CONFIG = [
  {
    phase: 'K', label: 'Kauflächen', motion: 'hin-und-her',
    hint: 'Schrubb hin und her wie eine Säge!',
    zones: [
      { id: 'k-oben', name: 'oben', seconds: 20 },
      { id: 'k-unten', name: 'unten', seconds: 20 },
    ],
  },
  {
    phase: 'A', label: 'Außenflächen', motion: 'kreisen',
    hint: 'Zähne aufeinander, male kleine Kreise!',
    zones: [
      { id: 'a-or', name: 'oben rechts', seconds: 19 },
      { id: 'a-ol', name: 'oben links', seconds: 19 },
      { id: 'a-ur', name: 'unten rechts', seconds: 18 },
      { id: 'a-ul', name: 'unten links', seconds: 19 },
    ],
  },
  {
    phase: 'I', label: 'Innenflächen', motion: 'von Rot nach Weiß',
    hint: 'Wische vom Zahnfleisch zum Zahn!',
    zones: [
      { id: 'i-oben', name: 'oben', seconds: 33 },
      { id: 'i-unten', name: 'unten', seconds: 32 },
    ],
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/kai-config.js && git commit -m "feat: KAI-Zeitkonfiguration (40/75/65s)"
```

### Task B2: KAI-Sequenz bauen

**Files:**
- Create: `src/kai-sequence.js`
- Test: `test/kai-sequence.test.js`

- [ ] **Step 1: Failing test**

```js
// test/kai-sequence.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSequence, totalSeconds } from '../src/kai-sequence.js';

test('Summe der Schrittdauern ergibt 180 Sekunden', () => {
  assert.equal(totalSeconds(), 180);
});

test('erster Schritt ist Kauflächen, startet bei 0', () => {
  const steps = buildSequence();
  assert.equal(steps[0].phase, 'K');
  assert.equal(steps[0].start, 0);
  assert.equal(steps[0].end, 20);
});

test('Schritte sind lückenlos verkettet (end == nächster start)', () => {
  const steps = buildSequence();
  for (let i = 1; i < steps.length; i++) {
    assert.equal(steps[i].start, steps[i - 1].end);
  }
});

test('letzter Schritt endet bei 180 und ist Innenflächen', () => {
  const steps = buildSequence();
  const last = steps[steps.length - 1];
  assert.equal(last.end, 180);
  assert.equal(last.phase, 'I');
});

test('jeder Schritt trägt Bewegung und Zonen-Namen', () => {
  const steps = buildSequence();
  assert.equal(steps[0].motion, 'hin-und-her');
  assert.equal(typeof steps[0].zoneName, 'string');
});
```

- [ ] **Step 2: Run test, verify FAIL**

Run: `node --test test/kai-sequence.test.js`
Expected: FAIL — `buildSequence` ist nicht definiert.

- [ ] **Step 3: Implementierung**

```js
// src/kai-sequence.js
import { KAI_CONFIG } from './kai-config.js';

export function buildSequence(config = KAI_CONFIG) {
  const steps = [];
  let start = 0;
  for (const phase of config) {
    for (const zone of phase.zones) {
      steps.push({
        phase: phase.phase,
        phaseLabel: phase.label,
        motion: phase.motion,
        hint: phase.hint,
        zoneId: zone.id,
        zoneName: zone.name,
        seconds: zone.seconds,
        start,
        end: start + zone.seconds,
      });
      start += zone.seconds;
    }
  }
  return steps;
}

export function totalSeconds(config = KAI_CONFIG) {
  return config.reduce(
    (sum, phase) => sum + phase.zones.reduce((s, z) => s + z.seconds, 0),
    0,
  );
}
```

- [ ] **Step 4: Run test, verify PASS**

Run: `node --test test/kai-sequence.test.js`
Expected: PASS (5 Tests).

- [ ] **Step 5: Commit**

```bash
git add src/kai-sequence.js test/kai-sequence.test.js
git commit -m "feat: KAI-Sequenz aus Config bauen"
```

### Task B3: Timer (rein)

**Files:**
- Create: `src/timer.js`
- Test: `test/timer.test.js`

- [ ] **Step 1: Failing test**

```js
// test/timer.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSequence } from '../src/kai-sequence.js';
import { stepAtElapsed } from '../src/timer.js';

const steps = buildSequence();

test('bei 0s im ersten Schritt', () => {
  const r = stepAtElapsed(steps, 0);
  assert.equal(r.index, 0);
  assert.equal(r.done, false);
  assert.equal(r.remainingInStep, 20);
  assert.equal(r.totalRemaining, 180);
});

test('an der Grenze (20s) springt zum nächsten Schritt', () => {
  const r = stepAtElapsed(steps, 20);
  assert.equal(r.index, 1);
});

test('in der A-Phase rechnet Restzeit korrekt', () => {
  // Bei 45s liegt der aktive Schritt in Phase A (steps[2]: 40..59).
  const r = stepAtElapsed(steps, 45);
  assert.equal(r.step.phase, 'A');
  assert.equal(r.remainingInStep, steps[2].end - 45);
});

test('bei >=180s ist done true', () => {
  const r = stepAtElapsed(steps, 180);
  assert.equal(r.done, true);
  assert.equal(r.totalRemaining, 0);
});
```

- [ ] **Step 2: Run test, verify FAIL**

Run: `node --test test/timer.test.js`
Expected: FAIL — `stepAtElapsed` nicht definiert.

- [ ] **Step 3: Implementierung**

```js
// src/timer.js
// Reine Funktion: aus Schrittliste + vergangenen Sekunden den Zustand ableiten.
export function stepAtElapsed(steps, elapsed) {
  const total = steps.length ? steps[steps.length - 1].end : 0;
  if (elapsed >= total) {
    const last = steps[steps.length - 1] ?? null;
    return { done: true, index: steps.length - 1, step: last, remainingInStep: 0, totalRemaining: 0 };
  }
  const index = steps.findIndex((s) => elapsed < s.end);
  const step = steps[index];
  return {
    done: false,
    index,
    step,
    remainingInStep: step.end - elapsed,
    totalRemaining: total - elapsed,
  };
}
```

- [ ] **Step 4: Run test, verify PASS**

Run: `node --test test/timer.test.js`
Expected: PASS (4 Tests).

- [ ] **Step 5: Commit**

```bash
git add src/timer.js test/timer.test.js
git commit -m "feat: reiner Timer stepAtElapsed"
```

### Task B4: Zeit-/Sonntagslogik (Europe/Berlin)

**Files:**
- Create: `src/schedule.js`
- Test: `test/schedule.test.js`

- [ ] **Step 1: Failing test**

```js
// test/schedule.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSundayInBerlin, berlinParts } from '../src/schedule.js';

test('Sonntag in Berlin wird erkannt', () => {
  // 2026-06-14 ist ein Sonntag
  assert.equal(isSundayInBerlin(new Date('2026-06-14T12:00:00Z')), true);
});

test('Montag ist kein Sonntag', () => {
  assert.equal(isSundayInBerlin(new Date('2026-06-15T12:00:00Z')), false);
});

test('Sommerzeit: 17:30 UTC == 19:30 Berlin am Sonntag', () => {
  const p = berlinParts(new Date('2026-06-14T17:30:00Z'));
  assert.equal(p.weekday, 'Sun');
  assert.equal(p.hour, 19);
  assert.equal(p.minute, 30);
});

test('Winterzeit: 18:30 UTC == 19:30 Berlin am Sonntag', () => {
  // 2026-12-13 ist ein Sonntag (Winterzeit, UTC+1)
  const p = berlinParts(new Date('2026-12-13T18:30:00Z'));
  assert.equal(p.weekday, 'Sun');
  assert.equal(p.hour, 19);
  assert.equal(p.minute, 30);
});
```

- [ ] **Step 2: Run test, verify FAIL**

Run: `node --test test/schedule.test.js`
Expected: FAIL — Funktionen nicht definiert.

- [ ] **Step 3: Implementierung**

```js
// src/schedule.js
// Zeitzonen-sichere Auswertung über Intl, unabhängig von der Server-Zeitzone.
export function berlinParts(date) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    weekday: parts.weekday,           // 'Sun', 'Mon', ...
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

export function isSundayInBerlin(date) {
  return berlinParts(date).weekday === 'Sun';
}
```

- [ ] **Step 4: Run test, verify PASS**

Run: `node --test test/schedule.test.js`
Expected: PASS (4 Tests).

- [ ] **Step 5: Commit**

```bash
git add src/schedule.js test/schedule.test.js
git commit -m "feat: Berlin-Zeit & Sonntagserkennung"
```

### Task B5: Fortschritt (Streak + Bewertung)

**Files:**
- Create: `src/progress.js`
- Test: `test/progress.test.js`

- [ ] **Step 1: Failing test** (Storage wird injiziert → testbar ohne Browser)

```js
// test/progress.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadState, recordBrushing, saveState } from '../src/progress.js';

function fakeStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
  };
}

test('frischer Zustand ist leer', () => {
  const s = loadState(fakeStorage());
  assert.deepEqual(s.entries, {});
  assert.equal(s.streak, 0);
  assert.equal(s.hinkelsteine, 0);
});

test('erster Eintrag setzt Streak auf 1', () => {
  let s = loadState(fakeStorage());
  s = recordBrushing(s, '2026-06-14', 'super');
  assert.equal(s.streak, 1);
  assert.equal(s.entries['2026-06-14'], 'super');
  assert.equal(s.hinkelsteine, 1);
});

test('aufeinanderfolgende Tage erhöhen Streak', () => {
  let s = loadState(fakeStorage());
  s = recordBrushing(s, '2026-06-14', 'super');
  s = recordBrushing(s, '2026-06-15', 'ok');
  assert.equal(s.streak, 2);
  assert.equal(s.hinkelsteine, 2);
});

test('Lücke setzt Streak zurück auf 1', () => {
  let s = loadState(fakeStorage());
  s = recordBrushing(s, '2026-06-14', 'super');
  s = recordBrushing(s, '2026-06-17', 'ok');
  assert.equal(s.streak, 1);
  assert.equal(s.hinkelsteine, 2);
});

test('zweite Bewertung am selben Tag ändert Streak nicht', () => {
  let s = loadState(fakeStorage());
  s = recordBrushing(s, '2026-06-14', 'ok');
  s = recordBrushing(s, '2026-06-14', 'super');
  assert.equal(s.streak, 1);
  assert.equal(s.entries['2026-06-14'], 'super');
  assert.equal(s.hinkelsteine, 1);
});

test('save/load round-trip', () => {
  const storage = fakeStorage();
  let s = loadState(storage);
  s = recordBrushing(s, '2026-06-14', 'super');
  saveState(storage, s);
  const reloaded = loadState(storage);
  assert.equal(reloaded.streak, 1);
  assert.equal(reloaded.entries['2026-06-14'], 'super');
});
```

- [ ] **Step 2: Run test, verify FAIL**

Run: `node --test test/progress.test.js`
Expected: FAIL — Funktionen nicht definiert.

- [ ] **Step 3: Implementierung**

```js
// src/progress.js
const KEY = 'jonas-zahnputz-v1';

function blank() {
  return { entries: {}, streak: 0, lastDate: null, hinkelsteine: 0 };
}

export function loadState(storage) {
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return blank();
    return { ...blank(), ...JSON.parse(raw) };
  } catch {
    return blank();
  }
}

function prevDay(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function recordBrushing(state, isoDate, rating) {
  const next = { ...state, entries: { ...state.entries, [isoDate]: rating } };
  if (state.lastDate === isoDate) {
    // gleicher Tag: nur Bewertung aktualisieren, Streak unverändert
  } else if (state.lastDate === prevDay(isoDate)) {
    next.streak = state.streak + 1;
  } else {
    next.streak = 1;
  }
  next.lastDate = isoDate;
  next.hinkelsteine = Object.keys(next.entries).length;
  return next;
}

export function saveState(storage, state) {
  storage.setItem(KEY, JSON.stringify(state));
}

export function todayIso(date = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
  });
  return fmt.format(date); // 'YYYY-MM-DD'
}
```

- [ ] **Step 4: Run test, verify PASS**

Run: `node --test test/progress.test.js`
Expected: PASS (6 Tests).

- [ ] **Step 5: Commit**

```bash
git add src/progress.js test/progress.test.js
git commit -m "feat: Streak & Bewertungsspeicher (localStorage)"
```

### Task B6: Sprüche

**Files:**
- Create: `src/speeches.js`

- [ ] **Step 1: Sprüche schreiben** (Jonas-Bezug, gallischer Ton)

```js
// src/speeches.js
export const GREETINGS = [
  'Hallo Jonas! Bereit, die Karies-Römer zu vertreiben?',
  'Beim Teutates, Jonas — Zeit für saubere Zähne!',
  'Auf in den Kampf, Jonas! Deine Zahnbürste ist dein Schwert.',
];

export const PHASE_INTROS = {
  K: 'Los geht\'s, Jonas! Erst die Kauflächen — schrubb hin und her!',
  A: 'Stark gemacht! Jetzt die Außenseiten — male kleine Kreise!',
  I: 'Fast geschafft, Jonas! Innenseiten — von Rot nach Weiß!',
};

export const FINISHES = [
  'Sieg! Das ganze Dorf ist stolz auf dich, Jonas!',
  'Beim Teutates — blitzeblanke Zähne! Stark, Jonas!',
  'Die Karies-Römer sind besiegt! Gut gemacht, Jonas!',
];

export const ELMEX_REMINDER =
  'Beim Teutates — heute ist elmex-Tag! Nicht das Zaubertrank-Gel vergessen, Jonas!';

export function pick(list, seed) {
  return list[seed % list.length];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/speeches.js && git commit -m "feat: Comic-Sprüche mit Jonas-Bezug"
```

---

## Phase C — PWA-Shell

### Task C1: index.html (Bildschirme + Inline-SVG-Platzhalter)

**Files:**
- Create: `index.html`

- [ ] **Step 1: HTML schreiben** (vier Bildschirme; SVG-Inhalte folgen in Phase D)

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <title>Jonas' Zahn-Mission</title>
  <link rel="manifest" href="manifest.webmanifest" />
  <link rel="apple-touch-icon" href="assets/icon-192.png" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <!-- BEGRÜßUNG -->
  <section id="screen-start" class="screen active">
    <div id="hero-slot" class="hero"></div>
    <h1 id="greeting">Hallo Jonas!</h1>
    <div id="streak-badge" class="streak-badge" hidden></div>
    <button id="start-btn" class="big-btn">▶ Los geht's!</button>
    <button id="parent-link" class="text-link">⚙︎ Eltern</button>
  </section>

  <!-- PUTZREISE -->
  <section id="screen-brush" class="screen">
    <div id="phase-banner" class="phase-banner"></div>
    <div id="mouth-slot" class="mouth"></div>
    <div class="timer-row">
      <div id="ring-slot" class="ring"></div>
      <div id="cauldron-slot" class="cauldron"></div>
    </div>
    <p id="motion-hint" class="motion-hint"></p>
    <button id="stop-btn" class="text-link">Abbrechen</button>
  </section>

  <!-- BEWERTUNG -->
  <section id="screen-rate" class="screen">
    <h2>Wie gut hat es geklappt, Jonas?</h2>
    <div class="rating-row">
      <button class="face" data-rating="super">😄<span>Super</span></button>
      <button class="face" data-rating="ok">🙂<span>Ganz gut</span></button>
      <button class="face" data-rating="ueben">😐<span>Muss ich üben</span></button>
    </div>
  </section>

  <!-- BELOHNUNG -->
  <section id="screen-reward" class="screen">
    <div id="reward-hero" class="hero"></div>
    <h2 id="reward-text">Sieg!</h2>
    <div id="elmex-banner" class="elmex-banner" hidden></div>
    <div id="village-slot" class="village"></div>
    <button id="done-btn" class="big-btn">Fertig 🎉</button>
  </section>

  <!-- ELTERN / SETUP -->
  <section id="screen-parent" class="screen">
    <h2>Eltern-Einrichtung</h2>
    <p>Benachrichtigung für den Sonntags-elmex-Hinweis aktivieren:</p>
    <button id="enable-push-btn" class="big-btn">🔔 Push aktivieren</button>
    <p id="push-status" class="push-status"></p>
    <label class="sub-label">Push-Abo (einmalig als GitHub-Secret hinterlegen):</label>
    <textarea id="sub-json" class="sub-json" readonly rows="6"></textarea>
    <button id="copy-sub-btn" class="text-link">📋 Kopieren</button>
    <button id="parent-back" class="text-link">← Zurück</button>
  </section>

  <script type="module" src="src/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Im Browser sichten**

Run: `cd "/Users/knoop/Entwicklung/Zähneputzen" && python3 -m http.server 8080`
Öffne `http://localhost:8080`. Erwartung: Start-Bildschirm sichtbar (noch ungestylt, app.js wirft Konsole-Fehler — ok bis Phase E).

- [ ] **Step 3: Commit**

```bash
git add index.html && git commit -m "feat: PWA-Shell mit vier Bildschirmen"
```

### Task C2: styles.css (Comic-Look)

**Files:**
- Create: `styles.css`

- [ ] **Step 1: CSS schreiben** (kräftige Comic-Farben, dicke Outlines, große Touch-Ziele fürs iPad)

```css
/* styles.css */
:root {
  --gold: #f4c430;
  --grass: #4a9d3f;
  --sky: #7ec8e3;
  --stone: #9aa5b1;
  --potion: #57c84d;
  --ink: #2b2b2b;
  --paper: #fdf6e3;
  --red: #e2483d;
  --radius: 22px;
  --outline: 4px solid var(--ink);
}
* { box-sizing: border-box; }
html, body {
  margin: 0; height: 100%;
  font-family: "Comic Sans MS", "Chalkboard SE", system-ui, sans-serif;
  color: var(--ink);
  background: linear-gradient(var(--sky), var(--grass));
  -webkit-user-select: none; user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.screen { display: none; flex-direction: column; align-items: center; justify-content: center;
  gap: 18px; min-height: 100vh; padding: 24px; text-align: center; }
.screen.active { display: flex; }
h1 { font-size: clamp(28px, 6vw, 48px); margin: 4px; text-shadow: 2px 2px 0 #fff; }
h2 { font-size: clamp(22px, 5vw, 36px); text-shadow: 2px 2px 0 #fff; }
.big-btn {
  font: inherit; font-size: clamp(22px, 5vw, 32px); font-weight: bold;
  background: var(--gold); color: var(--ink); border: var(--outline);
  border-radius: var(--radius); padding: 18px 36px; box-shadow: 0 6px 0 rgba(0,0,0,.35);
  cursor: pointer; min-width: 220px; min-height: 72px;
}
.big-btn:active { transform: translateY(4px); box-shadow: 0 2px 0 rgba(0,0,0,.35); }
.text-link { background: none; border: none; font: inherit; font-size: 18px;
  text-decoration: underline; color: var(--ink); cursor: pointer; padding: 8px; }
.hero, .mouth, .village { width: min(80vw, 360px); }
.streak-badge { background: var(--red); color: #fff; font-weight: bold; font-size: 22px;
  border: var(--outline); border-radius: 999px; padding: 8px 20px; }
.phase-banner { font-size: clamp(24px, 6vw, 40px); font-weight: bold; background: var(--paper);
  border: var(--outline); border-radius: var(--radius); padding: 10px 24px; }
.timer-row { display: flex; gap: 24px; align-items: center; justify-content: center; }
.ring { width: 160px; height: 160px; }
.cauldron { width: 130px; height: 130px; }
.motion-hint { font-size: clamp(18px, 4vw, 26px); background: rgba(255,255,255,.7);
  border-radius: var(--radius); padding: 8px 18px; }
.rating-row { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; }
.face { font-size: 64px; background: var(--paper); border: var(--outline);
  border-radius: var(--radius); padding: 16px; cursor: pointer; display: flex;
  flex-direction: column; align-items: center; gap: 6px; min-width: 120px; }
.face span { font-size: 18px; }
.face:active { transform: scale(0.95); }
.elmex-banner { background: var(--potion); color: #fff; font-weight: bold; font-size: 22px;
  border: var(--outline); border-radius: var(--radius); padding: 14px 22px;
  animation: pop 0.6s ease; }
@keyframes pop { 0% { transform: scale(0.5); } 70% { transform: scale(1.1); } 100% { transform: scale(1);} }
.zone-active { animation: glow 1s ease-in-out infinite alternate; }
@keyframes glow { from { filter: drop-shadow(0 0 2px var(--gold)); }
  to { filter: drop-shadow(0 0 14px var(--gold)); } }
.sub-json { width: min(90vw, 480px); font-family: monospace; font-size: 12px;
  border: var(--outline); border-radius: 12px; padding: 10px; }
.push-status { font-weight: bold; }
.sub-label { font-size: 14px; }
```

- [ ] **Step 2: Im Browser sichten** (Server aus C1 läuft): Start-Bildschirm ist jetzt comic-bunt, Button groß.

- [ ] **Step 3: Commit**

```bash
git add styles.css && git commit -m "feat: Comic-Styling"
```

### Task C3: manifest.webmanifest + Icons

**Files:**
- Create: `manifest.webmanifest`
- Create: `assets/icon-192.png`, `assets/icon-512.png`, `assets/icon-maskable-512.png`

- [ ] **Step 1: Manifest schreiben**

```json
{
  "name": "Jonas' Zahn-Mission",
  "short_name": "Zahn-Mission",
  "start_url": "./index.html",
  "scope": "./",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#7ec8e3",
  "theme_color": "#4a9d3f",
  "icons": [
    { "src": "assets/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "assets/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "assets/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

- [ ] **Step 2: Icons erzeugen** — ein gallischer Helm mit Zahnbürste auf goldenem Grund. SVG zeichnen und mit folgendem Skript zu PNGs rendern (nutzt vorhandenes Node):

```bash
cd "/Users/knoop/Entwicklung/Zähneputzen" && mkdir -p assets
# Falls 'sharp' nicht vorhanden, einmalig installieren:
npm i -D sharp
node scripts/render-icons.mjs
```

Erzeuge `scripts/render-icons.mjs`:

```js
// scripts/render-icons.mjs
import sharp from 'sharp';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#f4c430"/>
  <!-- Helm -->
  <path d="M120 300 a136 136 0 0 1 272 0 z" fill="#b0bec5" stroke="#2b2b2b" stroke-width="14"/>
  <rect x="110" y="300" width="292" height="34" rx="16" fill="#cfd8dc" stroke="#2b2b2b" stroke-width="14"/>
  <!-- Flügel -->
  <path d="M120 250 q-70 -10 -90 30 q60 0 92 12 z" fill="#fff" stroke="#2b2b2b" stroke-width="12"/>
  <path d="M392 250 q70 -10 90 30 q-60 0 -92 12 z" fill="#fff" stroke="#2b2b2b" stroke-width="12"/>
  <!-- Zahnbürste -->
  <rect x="236" y="150" width="40" height="230" rx="18" fill="#57c84d" stroke="#2b2b2b" stroke-width="12"/>
  <rect x="226" y="120" width="60" height="44" rx="10" fill="#fff" stroke="#2b2b2b" stroke-width="12"/>
</svg>`;
const buf = Buffer.from(svg);
await sharp(buf).resize(192, 192).png().toFile('assets/icon-192.png');
await sharp(buf).resize(512, 512).png().toFile('assets/icon-512.png');
// maskable: mehr Rand
const maskable = svg.replace('viewBox="0 0 512 512"', 'viewBox="-60 -60 632 632"');
await sharp(Buffer.from(maskable)).resize(512, 512).png().toFile('assets/icon-maskable-512.png');
console.log('Icons erzeugt.');
```

- [ ] **Step 3: Verifizieren** — `ls -la assets/` zeigt drei PNGs > 0 Bytes.

- [ ] **Step 4: Commit**

```bash
git add manifest.webmanifest assets/ scripts/render-icons.mjs package.json package-lock.json
git commit -m "feat: PWA-Manifest und Icons"
```

---

## Phase D — SVG-Grafiken & Animation

> Diese Tasks erzeugen die Original-Gallier-Grafiken als JS-Module, die HTML-Strings zurückgeben. Keine geschützten Asterix-Figuren. Jede Funktion liefert einen `<svg>`-String, den app.js in die `*-slot`-Container schreibt.

### Task D1: Held-Figur (Gallier „Jonas")

**Files:**
- Create: `src/svg/hero.js`

- [ ] **Step 1: Held-SVG schreiben** — kleiner Gallier: Flügelhelm, Schnurrbart, Zahnbürste; eine Variante mit Jubel-Pose.

```js
// src/svg/hero.js
export function heroSvg({ cheering = false } = {}) {
  const arm = cheering
    ? '<path d="M150 150 q40 -50 70 -20" stroke="#2b2b2b" stroke-width="10" fill="none" stroke-linecap="round"/>'
    : '<path d="M150 150 q30 10 30 50" stroke="#2b2b2b" stroke-width="10" fill="none" stroke-linecap="round"/>';
  return `<svg viewBox="0 0 240 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Gallier Jonas">
    <!-- Beine -->
    <rect x="96" y="210" width="18" height="50" rx="8" fill="#8d6e63"/>
    <rect x="126" y="210" width="18" height="50" rx="8" fill="#8d6e63"/>
    <!-- Körper -->
    <rect x="80" y="140" width="80" height="80" rx="22" fill="#4a9d3f" stroke="#2b2b2b" stroke-width="8"/>
    <!-- Kopf -->
    <circle cx="120" cy="100" r="46" fill="#ffe0b2" stroke="#2b2b2b" stroke-width="8"/>
    <!-- Schnurrbart -->
    <path d="M96 112 q24 18 48 0" stroke="#d7a13b" stroke-width="12" fill="none" stroke-linecap="round"/>
    <!-- Augen -->
    <circle cx="106" cy="92" r="5" fill="#2b2b2b"/>
    <circle cx="134" cy="92" r="5" fill="#2b2b2b"/>
    <!-- Helm -->
    <path d="M74 86 a46 46 0 0 1 92 0 z" fill="#b0bec5" stroke="#2b2b2b" stroke-width="8"/>
    <path d="M74 70 q-40 -6 -52 18 q34 0 52 8 z" fill="#fff" stroke="#2b2b2b" stroke-width="6"/>
    <path d="M166 70 q40 -6 52 18 q-34 0 -52 8 z" fill="#fff" stroke="#2b2b2b" stroke-width="6"/>
    <!-- Arm + Zahnbürste -->
    ${arm}
    <rect x="176" y="92" width="14" height="70" rx="6" fill="#57c84d" stroke="#2b2b2b" stroke-width="5" transform="rotate(20 183 127)"/>
  </svg>`;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/svg/hero.js && git commit -m "feat: Gallier-Held SVG"
```

### Task D2: Mund-Diagramm mit hervorhebbaren Zonen

**Files:**
- Create: `src/svg/mouth.js`

- [ ] **Step 1: Mund-SVG schreiben** — Zonen-IDs passend zu `kai-config.js` (`k-oben`, `a-or`, … sowie kombinierte Marker). Jede Fläche ist ein `<path>`/`<rect>` mit der Zonen-ID als `data-zone`. Es werden Marker pro Quadrant + ober/unten gezeichnet, sodass `app.js` die jeweils aktive Zone hervorheben kann.

```js
// src/svg/mouth.js
// Stilisierter offener Mund von vorne: Ober-/Unterkiefer, je 2 Quadranten.
export function mouthSvg() {
  return `<svg viewBox="0 0 300 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mund mit Zähnen">
    <ellipse cx="150" cy="130" rx="140" ry="120" fill="#e2483d"/>
    <ellipse cx="150" cy="150" rx="80" ry="60" fill="#7a1f18"/>
    <!-- Oberkiefer-Zahnreihe -->
    <g id="zone-oben">
      <rect data-zone="oben-rechts" x="40"  y="30" width="100" height="46" rx="14" fill="#fff" stroke="#2b2b2b" stroke-width="4"/>
      <rect data-zone="oben-links"  x="160" y="30" width="100" height="46" rx="14" fill="#fff" stroke="#2b2b2b" stroke-width="4"/>
    </g>
    <!-- Unterkiefer-Zahnreihe -->
    <g id="zone-unten">
      <rect data-zone="unten-rechts" x="40"  y="184" width="100" height="46" rx="14" fill="#fff" stroke="#2b2b2b" stroke-width="4"/>
      <rect data-zone="unten-links"  x="160" y="184" width="100" height="46" rx="14" fill="#fff" stroke="#2b2b2b" stroke-width="4"/>
    </g>
    <!-- Bewegungspfeil (von app.js ein/ausgeblendet & positioniert) -->
    <g id="motion-arrow" style="display:none">
      <path d="M120 130 h60" stroke="#f4c430" stroke-width="8" marker-end="url(#ah)"/>
    </g>
    <defs>
      <marker id="ah" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto">
        <path d="M0 0 L10 5 L0 10 z" fill="#f4c430"/>
      </marker>
    </defs>
  </svg>`;
}

// Mappt eine Zonen-ID aus kai-config auf die anzusprechenden Rechteck-Marker.
export const ZONE_TARGETS = {
  'k-oben': ['oben-rechts', 'oben-links'],
  'k-unten': ['unten-rechts', 'unten-links'],
  'a-or': ['oben-rechts'],
  'a-ol': ['oben-links'],
  'a-ur': ['unten-rechts'],
  'a-ul': ['unten-links'],
  'i-oben': ['oben-rechts', 'oben-links'],
  'i-unten': ['unten-rechts', 'unten-links'],
};
```

- [ ] **Step 2: Commit**

```bash
git add src/svg/mouth.js && git commit -m "feat: Mund-Diagramm mit Zonen-Mapping"
```

### Task D3: Countdown-Ring & Zaubertrank-Kessel

**Files:**
- Create: `src/svg/ring.js`
- Create: `src/svg/cauldron.js`

- [ ] **Step 1: Ring-SVG** (per `stroke-dashoffset` animierbar)

```js
// src/svg/ring.js
export function ringSvg() {
  const C = 2 * Math.PI * 60;
  return `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
    <circle cx="80" cy="80" r="60" fill="none" stroke="#ffffff66" stroke-width="16"/>
    <circle id="ring-progress" cx="80" cy="80" r="60" fill="none" stroke="#f4c430"
      stroke-width="16" stroke-linecap="round" transform="rotate(-90 80 80)"
      stroke-dasharray="${C}" stroke-dashoffset="0"/>
    <text id="ring-label" x="80" y="92" text-anchor="middle" font-size="40" font-weight="bold" fill="#2b2b2b">20</text>
  </svg>`;
}
export const RING_CIRCUMFERENCE = 2 * Math.PI * 60;
```

- [ ] **Step 2: Kessel-SVG** (Füllstand per Clip-Höhe)

```js
// src/svg/cauldron.js
export function cauldronSvg() {
  return `<svg viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Zaubertrank-Kessel">
    <defs><clipPath id="pot-clip"><path d="M25 55 h80 v40 a40 40 0 0 1 -80 0 z"/></clipPath></defs>
    <rect id="potion-fill" x="25" y="130" width="80" height="0" fill="#57c84d" clip-path="url(#pot-clip)"/>
    <path d="M25 55 h80 v40 a40 40 0 0 1 -80 0 z" fill="none" stroke="#2b2b2b" stroke-width="8"/>
    <rect x="15" y="45" width="100" height="16" rx="8" fill="#2b2b2b"/>
  </svg>`;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/svg/ring.js src/svg/cauldron.js
git commit -m "feat: Countdown-Ring und Zaubertrank-Kessel SVG"
```

### Task D4: Dorf / Hinkelstein-Sammlung

**Files:**
- Create: `src/svg/village.js`

- [ ] **Step 1: Dorf-SVG** — zeichnet `n` Hinkelsteine (max sichtbar 12) als Belohnungssammlung.

```js
// src/svg/village.js
function hinkelstein(x) {
  return `<ellipse cx="${x}" cy="60" rx="16" ry="26" fill="#9aa5b1" stroke="#2b2b2b" stroke-width="4"/>`;
}
export function villageSvg(count) {
  const shown = Math.min(count, 12);
  const stones = Array.from({ length: shown }, (_, i) => hinkelstein(30 + i * 30)).join('');
  return `<svg viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${count} Hinkelsteine gesammelt">
    <rect x="0" y="84" width="400" height="16" fill="#4a9d3f"/>
    ${stones}
  </svg>`;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/svg/village.js && git commit -m "feat: Hinkelstein-Dorf SVG"
```

---

## Phase E — App-Anbindung (State-Machine + DOM)

### Task E1: app.js — Bildschirmsteuerung & Begrüßung

**Files:**
- Create: `src/app.js`

- [ ] **Step 1: Grundgerüst + Begrüßung schreiben**

```js
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
```

- [ ] **Step 2: Im Browser prüfen** (Server läuft): Held + Begrüßung erscheinen, „Eltern" wechselt Bildschirm. `startBrushing` noch undefiniert → in E2.

- [ ] **Step 3: Commit**

```bash
git add src/app.js && git commit -m "feat: app.js Begrüßung & Navigation"
```

### Task E2: app.js — Putzreise mit Timer-Animation

**Files:**
- Modify: `src/app.js`

- [ ] **Step 1: Putz-Logik ergänzen** (an `app.js` anhängen, vor `renderStart()`-Aufruf platzieren bzw. als Funktionen ergänzen)

```js
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
```

- [ ] **Step 2: Im Browser prüfen** — „Los geht's" startet; Ring zählt runter, Phasenbanner wechselt K→A→I, aktive Zähne leuchten, Kessel füllt sich, nach 3 Min Wechsel zur Bewertung. (Zum Testen Zeiten in `kai-config.js` temporär verkleinern, danach zurücksetzen.)

- [ ] **Step 3: Commit**

```bash
git add src/app.js && git commit -m "feat: Putzreise mit Timer-, Zonen-, Ring- und Kessel-Animation"
```

### Task E3: app.js — Bewertung & Belohnung (inkl. Sonntags-Banner)

**Files:**
- Modify: `src/app.js`

- [ ] **Step 1: Bewertungs- und Belohnungslogik ergänzen**

```js
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
```

- [ ] **Step 2: Im Browser prüfen** — Nach dem Putzen Gesichter-Auswahl; Belohnung zeigt jubelnden Held, Streak, Hinkelstein wächst; an Sonntagen erscheint das elmex-Banner.

- [ ] **Step 3: Commit**

```bash
git add src/app.js && git commit -m "feat: Bewertung, Belohnung & Sonntags-elmex-Banner"
```

---

## Phase F — Service Worker & Push (Client)

### Task F1: Service Worker (Cache + Push-Empfang)

**Files:**
- Create: `service-worker.js`

- [ ] **Step 1: Service Worker schreiben**

```js
// service-worker.js
const CACHE = 'zahn-jonas-v1';
const ASSETS = [
  './', './index.html', './styles.css', './manifest.webmanifest',
  './src/app.js', './src/kai-config.js', './src/kai-sequence.js', './src/timer.js',
  './src/progress.js', './src/schedule.js', './src/speeches.js', './src/push-client.js',
  './src/svg/hero.js', './src/svg/mouth.js', './src/svg/ring.js',
  './src/svg/cauldron.js', './src/svg/village.js',
  './assets/icon-192.png', './assets/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});

// Push-Empfang: elmex-Erinnerung
self.addEventListener('push', (e) => {
  let data = { title: 'elmex-Tag!', body: 'Heute ist elmex-Tag, Jonas!' };
  try { if (e.data) data = e.data.json(); } catch { /* default */ }
  e.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: './assets/icon-192.png',
    badge: './assets/icon-192.png',
    vibrate: [200, 100, 200],
  }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.openWindow('./index.html'));
});
```

- [ ] **Step 2: Commit**

```bash
git add service-worker.js && git commit -m "feat: Service Worker mit Cache und Push-Empfang"
```

### Task F2: Push-Client + VAPID-Schlüssel erzeugen

**Files:**
- Create: `scripts/generate-vapid.mjs`
- Create: `src/push-client.js`

- [ ] **Step 1: VAPID-Generator schreiben**

```js
// scripts/generate-vapid.mjs
import webpush from 'web-push';
const keys = webpush.generateVAPIDKeys();
console.log('VAPID_PUBLIC_KEY=' + keys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);
```

- [ ] **Step 2: Schlüssel erzeugen und öffentlichen Key notieren**

```bash
cd "/Users/knoop/Entwicklung/Zähneputzen" && npm i -D web-push && node scripts/generate-vapid.mjs
```
Expected: zwei Zeilen `VAPID_PUBLIC_KEY=...` / `VAPID_PRIVATE_KEY=...`. **Öffentlichen Key** kopieren (für Step 3), **privaten Key** für Phase H als Secret aufheben. (Nicht committen!)

- [ ] **Step 3: push-client.js schreiben** — `<PUBLIC_KEY_HIER>` durch den erzeugten öffentlichen Key ersetzen.

```js
// src/push-client.js
const VAPID_PUBLIC_KEY = '<PUBLIC_KEY_HIER>';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export async function registerSW() {
  if (!('serviceWorker' in navigator)) return null;
  return navigator.serviceWorker.register('./service-worker.js');
}

export async function enablePush() {
  const reg = await navigator.serviceWorker.ready;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Benachrichtigung nicht erlaubt');
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });
  return JSON.stringify(sub);
}
```

- [ ] **Step 4: Commit** (nur push-client.js mit öffentlichem Key; Generator separat)

```bash
git add scripts/generate-vapid.mjs src/push-client.js
git commit -m "feat: VAPID-Generator und Push-Client mit öffentlichem Schlüssel"
```

### Task F3: app.js — SW registrieren + Eltern-Setup verdrahten

**Files:**
- Modify: `src/app.js`

- [ ] **Step 1: Imports erweitern** — am Kopf von `src/app.js` ergänzen:

```js
import { registerSW, enablePush } from './push-client.js';
```

- [ ] **Step 2: SW-Registrierung + Eltern-Buttons ergänzen** (ans Ende von `app.js`)

```js
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
```

- [ ] **Step 3: Im Browser prüfen** (über HTTPS oder localhost) — Eltern-Bildschirm: „Push aktivieren" fragt Erlaubnis, zeigt Abo-JSON; „Kopieren" funktioniert. (Auf iOS erst nach „Zum Home-Bildschirm".)

- [ ] **Step 4: Commit**

```bash
git add src/app.js && git commit -m "feat: SW-Registrierung und Eltern-Push-Setup"
```

---

## Phase G — Cron-Sender (GitHub Actions)

### Task G1: Push-Guard (rein, TDD)

**Files:**
- Create: `scripts/push-guard.js`
- Test: `test/push-guard.test.js`

- [ ] **Step 1: Failing test**

```js
// test/push-guard.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldSendNow } from '../scripts/push-guard.js';

test('Sommer: Sonntag 17:30 UTC (=19:30 Berlin) -> senden', () => {
  assert.equal(shouldSendNow(new Date('2026-06-14T17:30:00Z')), true);
});
test('Sommer: Sonntag 18:30 UTC (=20:30 Berlin) -> nicht senden', () => {
  assert.equal(shouldSendNow(new Date('2026-06-14T18:30:00Z')), false);
});
test('Winter: Sonntag 18:30 UTC (=19:30 Berlin) -> senden', () => {
  assert.equal(shouldSendNow(new Date('2026-12-13T18:30:00Z')), true);
});
test('Winter: Sonntag 17:30 UTC (=18:30 Berlin) -> nicht senden', () => {
  assert.equal(shouldSendNow(new Date('2026-12-13T17:30:00Z')), false);
});
test('Montag -> nicht senden', () => {
  assert.equal(shouldSendNow(new Date('2026-06-15T17:30:00Z')), false);
});
```

- [ ] **Step 2: Run test, verify FAIL**

Run: `node --test test/push-guard.test.js`
Expected: FAIL — `shouldSendNow` nicht definiert.

- [ ] **Step 3: Implementierung** (nur senden, wenn es in Berlin Sonntag ~19:30 ist)

```js
// scripts/push-guard.js
import { berlinParts } from '../src/schedule.js';

// Cron läuft sonntags 17:30 UND 18:30 UTC. Nur der Lauf, der in Berlin
// 19:xx (25–40 min) trifft, sendet — damit über Sommer-/Winterzeit hinweg
// genau einmal um 19:30 Berliner Zeit gesendet wird.
export function shouldSendNow(date) {
  const { weekday, hour, minute } = berlinParts(date);
  return weekday === 'Sun' && hour === 19 && minute >= 25 && minute <= 40;
}
```

- [ ] **Step 4: Run test, verify PASS**

Run: `node --test test/push-guard.test.js`
Expected: PASS (5 Tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/push-guard.js test/push-guard.test.js
git commit -m "feat: Push-Guard für genau einen Sonntags-Push 19:30 Berlin"
```

### Task G2: Sender-Skript

**Files:**
- Create: `scripts/send-elmex-push.mjs`

- [ ] **Step 1: Sender schreiben** (liest Secrets aus Umgebungsvariablen)

```js
// scripts/send-elmex-push.mjs
import webpush from 'web-push';
import { shouldSendNow } from './push-guard.js';

const force = process.argv.includes('--force');
if (!force && !shouldSendNow(new Date())) {
  console.log('Nicht der Sendezeitpunkt (Berlin != So 19:30). Überspringe.');
  process.exit(0);
}

const pub = process.env.VAPID_PUBLIC_KEY;
const priv = process.env.VAPID_PRIVATE_KEY;
const sub = process.env.PUSH_SUBSCRIPTION;
if (!pub || !priv || !sub) {
  console.error('Fehlende Secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, PUSH_SUBSCRIPTION.');
  process.exit(1);
}

webpush.setVapidDetails('mailto:daniel.knoop@mum.de', pub, priv);

const payload = JSON.stringify({
  title: 'Beim Teutates — elmex-Tag!',
  body: 'Heute ist Sonntag, Jonas: elmex gelée nicht vergessen! 🛡️',
});

try {
  await webpush.sendNotification(JSON.parse(sub), payload);
  console.log('elmex-Push gesendet.');
} catch (e) {
  console.error('Senden fehlgeschlagen:', e.statusCode, e.body || e.message);
  process.exit(1);
}
```

- [ ] **Step 2: Lokaler Trockentest** (ohne Secrets → sauberer Abbruch)

Run: `node scripts/send-elmex-push.mjs --force`
Expected: „Fehlende Secrets: …" und Exit-Code 1 (Logik erreichbar, kein Crash).

- [ ] **Step 3: Commit**

```bash
git add scripts/send-elmex-push.mjs && git commit -m "feat: elmex-Push-Sender"
```

### Task G3: GitHub-Actions-Workflow

**Files:**
- Create: `.github/workflows/elmex-sunday.yml`

- [ ] **Step 1: Workflow schreiben**

```yaml
name: elmex-Sonntags-Push
on:
  schedule:
    - cron: '30 17 * * 0'   # 17:30 UTC sonntags (Sommerzeit -> 19:30 Berlin)
    - cron: '30 18 * * 0'   # 18:30 UTC sonntags (Winterzeit -> 19:30 Berlin)
  workflow_dispatch:        # manueller Testlauf
jobs:
  push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci || npm install
      - name: elmex-Push senden
        env:
          VAPID_PUBLIC_KEY: ${{ secrets.VAPID_PUBLIC_KEY }}
          VAPID_PRIVATE_KEY: ${{ secrets.VAPID_PRIVATE_KEY }}
          PUSH_SUBSCRIPTION: ${{ secrets.PUSH_SUBSCRIPTION }}
        run: node scripts/send-elmex-push.mjs ${{ github.event_name == 'workflow_dispatch' && '--force' || '' }}
```

- [ ] **Step 2: Gesamte Testsuite laufen lassen**

Run: `cd "/Users/knoop/Entwicklung/Zähneputzen" && node --test`
Expected: alle Tests PASS (kai-sequence, timer, schedule, progress, push-guard).

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/elmex-sunday.yml
git commit -m "feat: GitHub-Actions-Cron für Sonntags-elmex-Push"
```

---

## Phase H — Deployment & iPad-Onboarding

### Task H1: gh installieren, Repo anlegen, Pages aktivieren

**Files:** keine (Infrastruktur)

- [ ] **Step 1: gh installieren & anmelden** (durch den Nutzer, einmalig)

```bash
brew install gh
gh auth login    # GitHub.com, HTTPS, im Browser bestätigen
```
Expected: `gh auth status` zeigt eingeloggt.

- [ ] **Step 2: Repo anlegen und pushen**

```bash
cd "/Users/knoop/Entwicklung/Zähneputzen"
gh repo create zahnputz-jonas --private --source=. --remote=origin --push
```
Expected: Repo erstellt, `main` gepusht.

- [ ] **Step 3: GitHub Pages aktivieren** (Quelle: Branch `main`, Ordner `/`)

```bash
gh api -X POST repos/:owner/zahnputz-jonas/pages \
  -f 'source[branch]=main' -f 'source[path]=/' 2>/dev/null || \
gh api -X PUT repos/:owner/zahnputz-jonas/pages \
  -f 'source[branch]=main' -f 'source[path]=/'
gh api repos/:owner/zahnputz-jonas/pages --jq .html_url
```
Expected: liefert die Pages-URL (z. B. `https://<user>.github.io/zahnputz-jonas/`). Erste Bereitstellung kann 1–2 Min dauern.

### Task H2: VAPID-Secrets setzen

**Files:** keine

- [ ] **Step 1: VAPID-Schlüssel als Secrets hinterlegen** (Werte aus Task F2 Step 2)

```bash
cd "/Users/knoop/Entwicklung/Zähneputzen"
gh secret set VAPID_PUBLIC_KEY  --body "<VAPID_PUBLIC_KEY aus F2>"
gh secret set VAPID_PRIVATE_KEY --body "<VAPID_PRIVATE_KEY aus F2>"
```
Expected: „✓ Set secret …" je Schlüssel.

- [ ] **Step 2: Verifizieren**

```bash
gh secret list
```
Expected: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` gelistet (PUSH_SUBSCRIPTION folgt in H3).

### Task H3: iPad-Onboarding + Push-Abo als Secret

**Files:** keine (Anleitung für den Nutzer am Gerät)

- [ ] **Step 1: PWA auf dem iPad installieren**
  1. Safari öffnen → Pages-URL aus Task H1 aufrufen.
  2. Teilen-Symbol → **„Zum Home-Bildschirm"** → hinzufügen.
  3. App vom Home-Bildschirm starten (wichtig: nur installiert funktioniert iOS-Push).

- [ ] **Step 2: Push aktivieren und Abo kopieren**
  1. In der App unten **„⚙︎ Eltern"** → **„🔔 Push aktivieren"** → Erlaubnis bestätigen.
  2. **„📋 Kopieren"** tippen — das Abo-JSON ist nun in der Zwischenablage (z. B. per AirDrop/Notiz an den Mac übertragen).

- [ ] **Step 3: Abo als Secret hinterlegen** (am Mac)

```bash
cd "/Users/knoop/Entwicklung/Zähneputzen"
gh secret set PUSH_SUBSCRIPTION --body '<komplettes Abo-JSON vom iPad>'
gh secret list
```
Expected: `PUSH_SUBSCRIPTION` jetzt ebenfalls gelistet.

- [ ] **Step 4: Push-Testlauf auslösen**

```bash
gh workflow run "elmex-Sonntags-Push"
gh run watch
```
Expected: Workflow grün, Log „elmex-Push gesendet."; **Benachrichtigung erscheint auf dem iPad**. (Falls nicht: Abo erneut erzeugen — iOS-Abos können ablaufen.)

- [ ] **Step 5: Abschluss-Commit (README mit Betriebshinweisen)**

Create: `README.md`

```markdown
# Jonas' Zahn-Mission 🛡️🦷

PWA, die Jonas abends per KAI-Prinzip durch 3 Minuten Zähneputzen führt und
sonntags 19:30 (Berliner Zeit) per Push an das elmex gelée erinnert.

## Betrieb
- Hosting: GitHub Pages (Branch `main`, Ordner `/`).
- Sonntags-Push: GitHub Actions (`.github/workflows/elmex-sunday.yml`),
  Cron 17:30 + 18:30 UTC, Guard sendet genau um 19:30 Berliner Zeit.
- Secrets: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `PUSH_SUBSCRIPTION`.
- Push-Abo erneuern: in der App unter „Eltern" neu aktivieren, kopieren,
  `gh secret set PUSH_SUBSCRIPTION --body '<JSON>'`.

## Tests
`node --test` — deckt KAI-Sequenz, Timer, Zeit-/Sonntagslogik, Streak und
Push-Guard ab.

## Zeitaufteilung anpassen
Alle Putzzeiten stehen zentral in `src/kai-config.js`.
```

```bash
git add README.md && git commit -m "docs: README mit Betriebshinweisen" && git push
```

---

## Hinweise zur Umsetzung

- **Logik zuerst (Phase B, G1) per TDD**, dann Darstellung. Die SVG-Tasks sind
  bewusst als fertige, lauffähige Strings angelegt — beim Umsetzen darf das
  Aussehen verfeinert werden, solange die Zonen-IDs/Element-IDs stabil bleiben
  (`data-zone`, `ring-progress`, `ring-label`, `potion-fill`).
- **Zum Testen der Putzreise** die Sekunden in `kai-config.js` temporär stark
  verkleinern und vor dem Commit zurücksetzen.
- **iOS-Eigenheiten:** Push nur nach „Zum Home-Bildschirm"; Web-Push-Abos
  können ablaufen → bei ausbleibender Benachrichtigung Abo neu setzen (README).
