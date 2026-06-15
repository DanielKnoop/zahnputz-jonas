// test/kai-sequence.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSequence, totalSeconds } from '../src/kai-sequence.js';

test('Summe der Schrittdauern liegt nahe bei 3 Minuten', () => {
  const total = totalSeconds();
  assert.equal(total, 175);
  assert.ok(total >= 150 && total <= 200);
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

test('letzter Schritt endet bei der Gesamtdauer und ist Innenflächen', () => {
  const steps = buildSequence();
  const last = steps[steps.length - 1];
  assert.equal(last.end, totalSeconds());
  assert.equal(last.phase, 'I');
});

test('jeder Schritt trägt Bewegung und Zonen-Namen', () => {
  const steps = buildSequence();
  assert.equal(steps[0].motion, 'hin-und-her');
  assert.equal(typeof steps[0].zoneName, 'string');
});
