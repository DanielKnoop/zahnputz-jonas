// src/kai-config.js
// Reihenfolge nach KAI: Kauflächen -> Außenflächen -> Innenflächen.
// Summe der Sekunden ~ 3 Minuten (aktuell 175s). Hier zentral anpassbar.
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
      { id: 'a-links', name: 'links', seconds: 25 },
      { id: 'a-rechts', name: 'rechts', seconds: 25 },
      { id: 'a-vorne', name: 'vorne', seconds: 25 },
    ],
  },
  {
    phase: 'I', label: 'Innenflächen', motion: 'von Rot nach Weiß',
    hint: 'Wische vom Zahnfleisch zum Zahn!',
    zones: [
      { id: 'i-oben', name: 'oben', seconds: 30 },
      { id: 'i-unten', name: 'unten', seconds: 30 },
    ],
  },
];
