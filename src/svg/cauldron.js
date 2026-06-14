// src/svg/cauldron.js
export function cauldronSvg() {
  return `<svg viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Zaubertrank-Kessel">
    <defs><clipPath id="pot-clip"><path d="M25 55 h80 v40 a40 40 0 0 1 -80 0 z"/></clipPath></defs>
    <rect id="potion-fill" x="25" y="130" width="80" height="0" fill="#57c84d" clip-path="url(#pot-clip)"/>
    <path d="M25 55 h80 v40 a40 40 0 0 1 -80 0 z" fill="none" stroke="#2b2b2b" stroke-width="8"/>
    <rect x="15" y="45" width="100" height="16" rx="8" fill="#2b2b2b"/>
  </svg>`;
}
