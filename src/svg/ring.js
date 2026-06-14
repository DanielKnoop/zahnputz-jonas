// src/svg/ring.js
export function ringSvg() {
  const C = 2 * Math.PI * 60;
  return `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
    <circle cx="80" cy="80" r="60" fill="none" stroke="#ffffff66" stroke-width="16"/>
    <circle id="ring-progress" cx="80" cy="80" r="60" fill="none" stroke="#f4c430"
      stroke-width="16" stroke-linecap="round" transform="rotate(-90 80 80)"
      stroke-dasharray="${C}" stroke-dashoffset="0"/>
    <text id="ring-label" x="80" y="92" text-anchor="middle" font-size="40" font-weight="bold" fill="#2b2b2b">20</text>
  </svg>`;
}
export const RING_CIRCUMFERENCE = 2 * Math.PI * 60;
