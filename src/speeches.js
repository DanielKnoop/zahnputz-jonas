// src/speeches.js
// Begrüßungen und Abschluss-Sprüche sind variabel (Zufallsauswahl).
// Die Putz-Hinweise (PHASE_INTROS) bleiben bewusst KONSTANT pro Phase,
// um während des Putzens nicht abzulenken.
export const GREETINGS = [
  'Hallo Jonas! Bereit, die Karies-Römer zu vertreiben?',
  'Beim Teutates, Jonas — Zeit für saubere Zähne!',
  'Auf in den Kampf, Jonas! Deine Zahnbürste ist dein Schwert.',
  'Hallo Jonas! Die Zahn-Römer zittern schon vor dir!',
  'Bereit für drei Minuten Heldenmut, Jonas?',
  'Das ganze Dorf schaut zu, Jonas — zeig\'s den Bakterien!',
  'Schnapp dir die Zahnbürste, tapferer Jonas!',
  'Ein echter Gallier putzt gründlich — los geht\'s, Jonas!',
  'Hallo Jonas! Mach die Bakterien-Legion platt!',
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
  'Geschafft, Jonas! Deine Zähne glänzen wie ein Helm in der Sonne!',
  'Heldenhaft geputzt, Jonas — Zeit für ein großes Festmahl!',
  'Kein Römer hatte eine Chance, Jonas. Sauber!',
  'Wildschwein-stark geputzt, Jonas!',
  'Mission erfüllt, tapferer Jonas — die Bakterien fliehen!',
  'Bravo, Jonas! Funkelnde Zähne, wie frisch poliert!',
];

export const ELMEX_REMINDERS = [
  'Beim Teutates — heute ist elmex-Tag! Nicht das Zaubertrank-Gel vergessen, Jonas!',
  'Sonntag ist Zaubertrank-Tag! Jonas, hol das elmex gelée!',
  'Extra-Kraft für deine Zähne, Jonas: Heute das elmex gelée auftragen!',
  'Heute gibt\'s den Wochen-Zaubertrank, Jonas — das elmex gelée!',
  'Einmal pro Woche Heldenkraft: Jonas, denk an das elmex gelée!',
  'Pssst, Jonas: Sonntags kommt das elmex-Gel auf die Zähne!',
  'Stark für die ganze Woche, Jonas — jetzt das elmex gelée!',
  'Der Druide rät: Sonntags das elmex gelée, Jonas!',
];

// Deterministische Auswahl per Index (für stabile Fälle / Tests).
export function pick(list, seed) {
  const n = list.length;
  return list[((seed % n) + n) % n];
}

// Zufällige Auswahl; vermeidet die direkte Wiederholung von `avoid`.
export function pickRandom(list, avoid) {
  if (list.length <= 1) return list[0];
  let choice = avoid;
  while (choice === avoid) {
    choice = list[Math.floor(Math.random() * list.length)];
  }
  return choice;
}
