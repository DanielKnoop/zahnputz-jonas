// scripts/render-icons.mjs
import sharp from 'sharp';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#f4c430"/>
  <!-- Helm -->
  <path d="M120 300 a136 136 0 0 1 272 0 z" fill="#b0bec5" stroke="#2b2b2b" stroke-width="14"/>
  <rect x="110" y="300" width="292" height="34" rx="16" fill="#cfd8dc" stroke="#2b2b2b" stroke-width="14"/>
  <!-- Flügel -->
  <path d="M120 250 q-70 -10 -90 30 q60 0 92 12 z" fill="#fff" stroke="#2b2b2b" stroke-width="12"/>
  <path d="M392 250 q70 -10 90 30 q-60 0 -92 12 z" fill="#fff" stroke="#2b2b2b" stroke-width="12"/>
  <!-- Zahnbürste -->
  <rect x="236" y="150" width="40" height="230" rx="18" fill="#57c84d" stroke="#2b2b2b" stroke-width="12"/>
  <rect x="226" y="120" width="60" height="44" rx="10" fill="#fff" stroke="#2b2b2b" stroke-width="12"/>
</svg>`;
const buf = Buffer.from(svg);
await sharp(buf).resize(192, 192).png().toFile('assets/icon-192.png');
await sharp(buf).resize(512, 512).png().toFile('assets/icon-512.png');
// maskable: mehr Rand
const maskable = svg.replace('viewBox="0 0 512 512"', 'viewBox="-60 -60 632 632"');
await sharp(Buffer.from(maskable)).resize(512, 512).png().toFile('assets/icon-maskable-512.png');
console.log('Icons erzeugt.');
