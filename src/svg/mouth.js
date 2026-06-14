// src/svg/mouth.js
// Gallier-Kopf von vorne mit natürlich geformtem, offenem Mund. Die Zähne sind
// in vier Zonen gruppiert (oben/unten × rechts/links), die Zahnbürste (#brush-pos
// /#brush-anim) wird von app.js über die aktive Zone gesetzt und animiert.
export function mouthSvg() {
  const upper = (x, zone) =>
    `<rect data-zone="${zone}" x="${x}" y="192" width="11" height="22" rx="4" fill="#fff" stroke="#2b2b2b" stroke-width="3"/>`;
  const lower = (x, zone) =>
    `<rect data-zone="${zone}" x="${x}" y="224" width="11" height="20" rx="4" fill="#fff" stroke="#2b2b2b" stroke-width="3"/>`;
  const upperRight = [117, 129, 141].map((x) => upper(x, 'oben-rechts')).join('');
  const upperLeft = [153, 165, 177].map((x) => upper(x, 'oben-links')).join('');
  const lowerRight = [117, 129, 141].map((x) => lower(x, 'unten-rechts')).join('');
  const lowerLeft = [153, 165, 177].map((x) => lower(x, 'unten-links')).join('');

  return `<svg viewBox="-18 0 336 318" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Gallier-Gesicht mit offenem Mund und Zahnbürste">
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
    <path d="M110 180 q40 24 80 0" stroke="#d7a13b" stroke-width="14" fill="none" stroke-linecap="round"/>
    <!-- Mund: Lippen + Höhle + Zunge (natürliche, ovale Form) -->
    <ellipse cx="150" cy="218" rx="64" ry="42" fill="#c0473d" stroke="#2b2b2b" stroke-width="5"/>
    <ellipse cx="150" cy="219" rx="53" ry="32" fill="#7a1f18"/>
    <ellipse cx="150" cy="240" rx="30" ry="12" fill="#d4537e"/>
    <!-- Zähne -->
    <g>${upperRight}${upperLeft}</g>
    <g>${lowerRight}${lowerLeft}</g>
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

// Mappt eine Zonen-ID aus kai-config auf die anzusprechenden Zahn-Marker.
export const ZONE_TARGETS = {
  'k-oben': ['oben-rechts', 'oben-links'],
  'k-unten': ['unten-rechts', 'unten-links'],
  'a-or': ['oben-rechts'],
  'a-ol': ['oben-links'],
  'a-ur': ['unten-rechts'],
  'a-ul': ['unten-links'],
  'i-oben': ['oben-rechts', 'oben-links'],
  'i-unten': ['unten-rechts', 'unten-links'],
};

// Wohin die Zahnbürste pro Zone fährt (x, y im SVG; rot=180 putzt von unten).
export const BRUSH_ANCHORS = {
  'k-oben': { x: 150, y: 200, rot: 0 },
  'k-unten': { x: 150, y: 226, rot: 180 },
  'a-or': { x: 130, y: 200, rot: 0 },
  'a-ol': { x: 170, y: 200, rot: 0 },
  'a-ur': { x: 130, y: 226, rot: 180 },
  'a-ul': { x: 170, y: 226, rot: 180 },
  'i-oben': { x: 150, y: 200, rot: 0 },
  'i-unten': { x: 150, y: 226, rot: 180 },
};
