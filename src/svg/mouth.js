// src/svg/mouth.js
// Gallier-Kopf von vorne mit natürlich geformtem, offenem Mund. Jeder Zahn ist
// nach Reihe (data-row: oben/unten) und Spalte (data-col: links/vorne/rechts)
// ausgezeichnet. WICHTIG: aus Sicht des Betrachters/Bildschirms — "links" ist
// die linke Bildschirmseite. Die Zahnbürste (#brush-pos/#brush-anim) wird von
// app.js über die aktive Zone gesetzt und animiert.
const COLS = [
  { x: 113, col: 'links' },
  { x: 124, col: 'links' },
  { x: 139, col: 'vorne' },
  { x: 150, col: 'vorne' },
  { x: 165, col: 'rechts' },
  { x: 176, col: 'rechts' },
];

export function mouthSvg() {
  const tooth = (x, y, h, row, col) =>
    `<rect data-row="${row}" data-col="${col}" x="${x}" y="${y}" width="11" height="${h}" rx="4" fill="#fff" stroke="#2b2b2b" stroke-width="3"/>`;
  const upper = COLS.map((c) => tooth(c.x, 193, 23, 'oben', c.col)).join('');
  const lower = COLS.map((c) => tooth(c.x, 226, 21, 'unten', c.col)).join('');

  return `<svg viewBox="-18 0 336 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Gallier-Gesicht mit offenem Mund und Zahnbürste">
    <!-- Kopf -->
    <ellipse cx="150" cy="170" rx="100" ry="106" fill="#ffe0b2" stroke="#2b2b2b" stroke-width="6"/>
    <!-- Helm mit Flügeln -->
    <path d="M64 116 a86 86 0 0 1 172 0 z" fill="#b0bec5" stroke="#2b2b2b" stroke-width="6"/>
    <path d="M64 96 q-56 -8 -72 22 q46 0 72 10 z" fill="#fff" stroke="#2b2b2b" stroke-width="5"/>
    <path d="M236 96 q56 -8 72 22 q-46 0 -72 10 z" fill="#fff" stroke="#2b2b2b" stroke-width="5"/>
    <!-- Augen -->
    <circle cx="120" cy="152" r="7" fill="#2b2b2b"/>
    <circle cx="180" cy="152" r="7" fill="#2b2b2b"/>
    <!-- Schnurrbart -->
    <path d="M108 181 q42 24 84 0" stroke="#d7a13b" stroke-width="14" fill="none" stroke-linecap="round"/>
    <!-- Mund: Lippen + Höhle + Zunge (natürliche, ovale Form) -->
    <ellipse cx="150" cy="219" rx="68" ry="44" fill="#c0473d" stroke="#2b2b2b" stroke-width="5"/>
    <ellipse cx="150" cy="219" rx="57" ry="34" fill="#7a1f18"/>
    <ellipse cx="150" cy="242" rx="32" ry="12" fill="#d4537e"/>
    <!-- Zähne -->
    <g>${upper}</g>
    <g>${lower}</g>
    <!-- Zahnbürste (Position + Bewegung von app.js gesteuert) -->
    <g id="brush-pos" transform="translate(150 200)">
      <g id="brush-anim">
        <rect x="-9" y="-66" width="18" height="50" rx="7" fill="#57c84d" stroke="#2b2b2b" stroke-width="4"/>
        <rect x="-18" y="-20" width="36" height="20" rx="6" fill="#fff" stroke="#2b2b2b" stroke-width="4"/>
        <line x1="-12" y1="0" x2="-12" y2="9" stroke="#2b2b2b" stroke-width="3"/>
        <line x1="-4" y1="0" x2="-4" y2="9" stroke="#2b2b2b" stroke-width="3"/>
        <line x1="4" y1="0" x2="4" y2="9" stroke="#2b2b2b" stroke-width="3"/>
        <line x1="12" y1="0" x2="12" y2="9" stroke="#2b2b2b" stroke-width="3"/>
      </g>
    </g>
  </svg>`;
}

// Mappt eine Zonen-ID aus kai-config auf einen CSS-Selektor (innerhalb #mouth-slot).
// Kauflächen/Innenflächen: nach Reihe; Außenflächen: nach Spalte (volle Höhe).
export const ZONE_SELECTORS = {
  'k-oben': '[data-row="oben"]',
  'k-unten': '[data-row="unten"]',
  'a-links': '[data-col="links"]',
  'a-rechts': '[data-col="rechts"]',
  'a-vorne': '[data-col="vorne"]',
  'i-oben': '[data-row="oben"]',
  'i-unten': '[data-row="unten"]',
};

// Wohin die Zahnbürste pro Zone fährt (x, y im SVG; rot=180 putzt von unten).
// Außenflächen: mittig auf voller Höhe (y=212), deutlich nach links/rechts versetzt.
export const BRUSH_ANCHORS = {
  'k-oben': { x: 150, y: 200, rot: 0 },
  'k-unten': { x: 150, y: 226, rot: 180 },
  'a-links': { x: 119, y: 212, rot: 0 },
  'a-rechts': { x: 181, y: 212, rot: 0 },
  'a-vorne': { x: 150, y: 212, rot: 0 },
  'i-oben': { x: 150, y: 200, rot: 0 },
  'i-unten': { x: 150, y: 226, rot: 180 },
};
