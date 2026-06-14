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
