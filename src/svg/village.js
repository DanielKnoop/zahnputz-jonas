// src/svg/village.js
function hinkelstein(x) {
  return `<ellipse cx="${x}" cy="60" rx="16" ry="26" fill="#9aa5b1" stroke="#2b2b2b" stroke-width="4"/>`;
}
export function villageSvg(count) {
  const shown = Math.min(count, 12);
  const stones = Array.from({ length: shown }, (_, i) => hinkelstein(30 + i * 30)).join('');
  return `<svg viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${count} Hinkelsteine gesammelt">
    <rect x="0" y="84" width="400" height="16" fill="#4a9d3f"/>
    ${stones}
  </svg>`;
}
