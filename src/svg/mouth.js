// src/svg/mouth.js
// Stilisierter offener Mund von vorne: Ober-/Unterkiefer, je 2 Quadranten.
export function mouthSvg() {
  return `<svg viewBox="0 0 300 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mund mit Zähnen">
    <ellipse cx="150" cy="130" rx="140" ry="120" fill="#e2483d"/>
    <ellipse cx="150" cy="150" rx="80" ry="60" fill="#7a1f18"/>
    <!-- Oberkiefer-Zahnreihe -->
    <g id="zone-oben">
      <rect data-zone="oben-rechts" x="40"  y="30" width="100" height="46" rx="14" fill="#fff" stroke="#2b2b2b" stroke-width="4"/>
      <rect data-zone="oben-links"  x="160" y="30" width="100" height="46" rx="14" fill="#fff" stroke="#2b2b2b" stroke-width="4"/>
    </g>
    <!-- Unterkiefer-Zahnreihe -->
    <g id="zone-unten">
      <rect data-zone="unten-rechts" x="40"  y="184" width="100" height="46" rx="14" fill="#fff" stroke="#2b2b2b" stroke-width="4"/>
      <rect data-zone="unten-links"  x="160" y="184" width="100" height="46" rx="14" fill="#fff" stroke="#2b2b2b" stroke-width="4"/>
    </g>
    <!-- Bewegungspfeil (von app.js ein/ausgeblendet & positioniert) -->
    <g id="motion-arrow" style="display:none">
      <path d="M120 130 h60" stroke="#f4c430" stroke-width="8" marker-end="url(#ah)"/>
    </g>
    <defs>
      <marker id="ah" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto">
        <path d="M0 0 L10 5 L0 10 z" fill="#f4c430"/>
      </marker>
    </defs>
  </svg>`;
}

// Mappt eine Zonen-ID aus kai-config auf die anzusprechenden Rechteck-Marker.
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
