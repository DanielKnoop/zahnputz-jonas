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
