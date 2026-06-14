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
