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
