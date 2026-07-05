// Genera le icone PWA (monogramma "E & T" su fondo crema con cornice floreale)
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const svg = (size, pad = 0) => `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#fefdfb"/>
  <circle cx="256" cy="256" r="${210 - pad}" fill="none" stroke="#98a37b" stroke-width="6"/>
  <circle cx="256" cy="256" r="${192 - pad}" fill="none" stroke="#eec3ca" stroke-width="2.5"/>
  <text x="256" y="300" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-style="italic"
        font-size="${170 - pad}" fill="#7c8760">E<tspan fill="#dfa4af" font-size="${110 - pad}">&amp;</tspan>T</text>
  <g fill="#eec3ca">
    <circle cx="256" cy="${90 + pad}" r="14"/>
    <circle cx="233" cy="${98 + pad}" r="9"/>
    <circle cx="279" cy="${98 + pad}" r="9"/>
  </g>
  <g fill="#98a37b" opacity="0.9">
    <ellipse cx="215" cy="${100 + pad}" rx="12" ry="5" transform="rotate(-30 215 ${100 + pad})"/>
    <ellipse cx="297" cy="${100 + pad}" rx="12" ry="5" transform="rotate(30 297 ${100 + pad})"/>
  </g>
</svg>`;

await mkdir('public/icons', { recursive: true });

const jobs = [
  { file: 'public/icons/icon-192.png', size: 192, pad: 0 },
  { file: 'public/icons/icon-512.png', size: 512, pad: 0 },
  { file: 'public/icons/apple-touch-icon.png', size: 180, pad: 0 },
  // la versione maskable tiene il contenuto nel "safe zone" centrale
  { file: 'public/icons/icon-512-maskable.png', size: 512, pad: 40 },
];

for (const { file, size, pad } of jobs) {
  await sharp(Buffer.from(svg(512, pad))).resize(size, size).png().toFile(file);
  console.log('creata', file);
}
