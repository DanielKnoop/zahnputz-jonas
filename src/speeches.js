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
  const n = list.length;
  return list[((seed % n) + n) % n];
}
