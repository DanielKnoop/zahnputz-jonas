// test/speeches.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pick, GREETINGS } from '../src/speeches.js';

test('pick wählt per Index aus der Liste', () => {
  assert.equal(pick(GREETINGS, 0), GREETINGS[0]);
  assert.equal(pick(GREETINGS, 1), GREETINGS[1]);
});

test('pick wraparound bei seed >= Länge', () => {
  assert.equal(pick(GREETINGS, GREETINGS.length), GREETINGS[0]);
  assert.equal(pick(GREETINGS, GREETINGS.length + 1), GREETINGS[1]);
});

test('pick liefert auch bei negativem seed ein gültiges Element', () => {
  assert.equal(pick(GREETINGS, -1), GREETINGS[GREETINGS.length - 1]);
});
