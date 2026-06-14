// src/svg/hero.js
export function heroSvg({ cheering = false } = {}) {
  const arm = cheering
    ? '<path d="M150 150 q40 -50 70 -20" stroke="#2b2b2b" stroke-width="10" fill="none" stroke-linecap="round"/>'
    : '<path d="M150 150 q30 10 30 50" stroke="#2b2b2b" stroke-width="10" fill="none" stroke-linecap="round"/>';
  return `<svg viewBox="0 0 240 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Gallier Jonas">
    <!-- Beine -->
    <rect x="96" y="210" width="18" height="50" rx="8" fill="#8d6e63"/>
    <rect x="126" y="210" width="18" height="50" rx="8" fill="#8d6e63"/>
    <!-- Körper -->
    <rect x="80" y="140" width="80" height="80" rx="22" fill="#4a9d3f" stroke="#2b2b2b" stroke-width="8"/>
    <!-- Kopf -->
    <circle cx="120" cy="100" r="46" fill="#ffe0b2" stroke="#2b2b2b" stroke-width="8"/>
    <!-- Schnurrbart -->
    <path d="M96 112 q24 18 48 0" stroke="#d7a13b" stroke-width="12" fill="none" stroke-linecap="round"/>
    <!-- Augen -->
    <circle cx="106" cy="92" r="5" fill="#2b2b2b"/>
    <circle cx="134" cy="92" r="5" fill="#2b2b2b"/>
    <!-- Helm -->
    <path d="M74 86 a46 46 0 0 1 92 0 z" fill="#b0bec5" stroke="#2b2b2b" stroke-width="8"/>
    <path d="M74 70 q-40 -6 -52 18 q34 0 52 8 z" fill="#fff" stroke="#2b2b2b" stroke-width="6"/>
    <path d="M166 70 q40 -6 52 18 q-34 0 -52 8 z" fill="#fff" stroke="#2b2b2b" stroke-width="6"/>
    <!-- Arm + Zahnbürste -->
    ${arm}
    <rect x="176" y="92" width="14" height="70" rx="6" fill="#57c84d" stroke="#2b2b2b" stroke-width="5" transform="rotate(20 183 127)"/>
  </svg>`;
}
