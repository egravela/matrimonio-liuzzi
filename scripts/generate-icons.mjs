// Genera le icone PWA: monogramma "E&T" su disco rosa cipria, design pulito
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const svg = (pad = 0) => `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="disc" cx="50%" cy="42%" r="65%">
      <stop offset="0%" stop-color="#fbeef0"/>
      <stop offset="100%" stop-color="#f2d7dc"/>
    </radialGradient>
  </defs>

  <rect width="512" height="512" fill="#fefdfb"/>
  <circle cx="256" cy="256" r="${206 - pad}" fill="url(#disc)"/>

  <text x="254" y="${300 - pad * 0.15}" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-style="italic"
        font-size="${168 - pad * 0.55}" fill="#7c8760"
        >E<tspan fill="#d99aa6" font-size="${104 - pad * 0.35}" dy="-6"> &amp; </tspan><tspan dy="6">T</tspan></text>

  <!-- rametto minimale sotto il monogramma -->
  <g transform="translate(256 ${350 - pad * 0.3})">
    <path d="M-58 0 H58" stroke="#98a37b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <g fill="#98a37b">
      <ellipse cx="-60" cy="-4" rx="12" ry="4.5" transform="rotate(-28 -60 -4)"/>
      <ellipse cx="60" cy="-4" rx="12" ry="4.5" transform="rotate(28 60 -4)"/>
    </g>
    <circle r="6" fill="#d99aa6"/>
  </g>
</svg>`;

await mkdir('public/icons', { recursive: true });

const jobs = [
  { file: 'public/icons/icon-192.png', size: 192, pad: 0 },
  { file: 'public/icons/icon-512.png', size: 512, pad: 0 },
  { file: 'public/icons/apple-touch-icon.png', size: 180, pad: 0 },
  // la versione maskable tiene il contenuto nel "safe zone" centrale
  { file: 'public/icons/icon-512-maskable.png', size: 512, pad: 52 },
];

for (const { file, size, pad } of jobs) {
  await sharp(Buffer.from(svg(pad))).resize(size, size).png().toFile(file);
  console.log('creata', file);
}
