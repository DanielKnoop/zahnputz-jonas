// test/speeches.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pick, pickRandom, GREETINGS, FINISHES } from '../src/speeches.js';

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

test('pickRandom liefert immer ein Element aus der Liste', () => {
  for (let i = 0; i < 50; i++) {
    assert.ok(GREETINGS.includes(pickRandom(GREETINGS)));
    assert.ok(FINISHES.includes(pickRandom(FINISHES)));
  }
});

test('pickRandom wiederholt das vermiedene Element nicht direkt', () => {
  let prev = GREETINGS[0];
  for (let i = 0; i < 50; i++) {
    const next = pickRandom(GREETINGS, prev);
    assert.notEqual(next, prev);
    prev = next;
  }
});

test('pickRandom mit einelementiger Liste gibt dieses Element zurück', () => {
  assert.equal(pickRandom(['nur eins'], 'nur eins'), 'nur eins');
});
