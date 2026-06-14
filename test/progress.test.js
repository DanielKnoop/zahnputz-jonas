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
