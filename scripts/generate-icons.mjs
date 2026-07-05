// Genera le icone PWA: monogramma "E&T" in Great Vibes (lo stesso corsivo
// calligrafico degli inviti) bianco su fondo rosa acceso, per un contrasto
// netto. Il testo viene convertito in tracciati vettoriali con opentype.js,
// così sharp non dipende dai font installati nel sistema.
import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import opentype from 'opentype.js';
import { scaledMonogram } from './lib/monogram.mjs';

const ttf = await readFile('scripts/assets/GreatVibes-Regular.ttf');
const font = opentype.parse(ttf.buffer.slice(ttf.byteOffset, ttf.byteOffset + ttf.byteLength));

const WHITE = '#ffffff';

function monogram(pad = 0) {
  const targetW = 380 - pad * 1.5;
  const targetH = 300 - pad * 1.1;
  const { paths, minX, maxX, minY, maxY } = scaledMonogram(font, targetW, targetH);

  // centra orizzontalmente e verticalmente nell'icona
  const tx = 256 - (minX + maxX) / 2;
  const ty = 256 - pad * 0.25 - (minY + maxY) / 2;

  const glyphs = paths
    .map((p) => `<path d="${p.toPathData(2)}" fill="${WHITE}" fill-rule="evenodd"/>`)
    .join('\n    ');

  return { glyphs, tx, ty };
}

const svg = (pad = 0) => {
  const m = monogram(pad);
  return `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="disc" cx="50%" cy="42%" r="85%">
      <stop offset="0%" stop-color="#b8637a"/>
      <stop offset="100%" stop-color="#96435f"/>
    </radialGradient>
  </defs>

  <rect width="512" height="512" fill="url(#disc)"/>

  <g transform="translate(${m.tx.toFixed(1)} ${m.ty.toFixed(1)})">
    ${m.glyphs}
  </g>
</svg>`;
};

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
