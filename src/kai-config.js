// src/kai-config.js
// Reihenfolge nach KAI: Kauflächen -> Außenflächen -> Innenflächen.
// Summe der Sekunden = 180 (3 Minuten). Hier zentral anpassbar.
export const KAI_CONFIG = [
  {
    phase: 'K', label: 'Kauflächen', motion: 'hin-und-her',
    hint: 'Schrubb hin und her wie eine Säge!',
    zones: [
      { id: 'k-unten', name: 'unten', seconds: 20 },
      { id: 'k-oben', name: 'oben', seconds: 20 },
    ],
  },
  {
    phase: 'A', label: 'Außenflächen', motion: 'kreisen',
    hint: 'Zähne aufeinander, male kleine Kreise!',
    zones: [
      { id: 'a-or', name: 'oben rechts', seconds: 19 },
      { id: 'a-ol', name: 'oben links', seconds: 19 },
      { id: 'a-ur', name: 'unten rechts', seconds: 18 },
      { id: 'a-ul', name: 'unten links', seconds: 19 },
    ],
  },
  {
    phase: 'I', label: 'Innenflächen', motion: 'von Rot nach Weiß',
    hint: 'Wische vom Zahnfleisch zum Zahn!',
    zones: [
      { id: 'i-oben', name: 'oben', seconds: 33 },
      { id: 'i-unten', name: 'unten', seconds: 32 },
    ],
  },
];
