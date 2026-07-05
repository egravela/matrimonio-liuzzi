// Genera le icone PWA: monogramma "E&T" in Great Vibes (lo stesso corsivo
// calligrafico degli inviti) su fondo rosa cipria. Il testo viene convertito
// in tracciati vettoriali con opentype.js, così sharp non dipende dai font
// installati nel sistema.
import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import opentype from 'opentype.js';

const ttf = await readFile('scripts/assets/GreatVibes-Regular.ttf');
const font = opentype.parse(ttf.buffer.slice(ttf.byteOffset, ttf.byteOffset + ttf.byteLength));

const SAGE = '#7c8760';
const ROSE = '#d99aa6';

// Compone "E & T" glifo per glifo (charToGlyph, senza il motore GSUB di
// opentype.js che non supporta alcune feature di Great Vibes).
// Le maiuscole di Great Vibes hanno svolazzi molto ampi che si sovrappongono:
// spaziatura extra e "&" ridotta come negli inviti.
function textPaths(fontSize) {
  const parts = [
    { ch: 'E', size: fontSize },
    { ch: '&', size: fontSize * 0.6, dy: -fontSize * 0.04 },
    { ch: 'T', size: fontSize },
  ];
  const out = [];
  let x = 0;
  for (const part of parts) {
    const glyph = font.charToGlyph(part.ch);
    out.push(safeGlyphPath(glyph, x, part.dy ?? 0, part.size));
    x += (glyph.advanceWidth / font.unitsPerEm) * part.size + fontSize * 0.12;
  }
  return out;
}

// opentype.js a certe dimensioni frazionarie produce coordinate NaN
// (bug noto con alcuni glifi): se succede, ritocca la dimensione di un pelo
function safeGlyphPath(glyph, x, y, size) {
  for (let i = 0; i < 8; i++) {
    const path = glyph.getPath(x, y, size + i * 0.037);
    if (!/NaN|Infinity|undefined/i.test(path.toPathData(2))) return path;
  }
  throw new Error(`coordinate NaN persistenti nel glifo alla dimensione ${size}`);
}

function bbox(paths) {
  const boxes = paths.map((p) => p.getBoundingBox());
  return {
    minX: Math.min(...boxes.map((b) => b.x1)),
    maxX: Math.max(...boxes.map((b) => b.x2)),
    minY: Math.min(...boxes.map((b) => b.y1)),
    maxY: Math.max(...boxes.map((b) => b.y2)),
  };
}

function monogram(pad = 0) {
  // misura a dimensione di riferimento e scala per riempire l'icona
  const ref = bbox(textPaths(100));
  const targetW = 380 - pad * 1.5;
  const targetH = 250 - pad * 0.9;
  const fontSize =
    100 * Math.min(targetW / (ref.maxX - ref.minX), targetH / (ref.maxY - ref.minY));

  const paths = textPaths(fontSize);
  const { minX, maxX, minY, maxY } = bbox(paths);

  // centra orizzontalmente; verticalmente leggermente alto per lasciare
  // respiro al rametto sotto
  const tx = 256 - (minX + maxX) / 2;
  const ty = 242 - pad * 0.25 - (minY + maxY) / 2;

  const fills = [SAGE, ROSE, SAGE]; // E, &, T
  const glyphs = paths
    .map((p, i) => `<path d="${p.toPathData(2)}" fill="${fills[i] ?? SAGE}" fill-rule="evenodd"/>`)
    .join('\n    ');

  return { glyphs, tx, ty, bottom: ty + maxY };
}

const svg = (pad = 0) => {
  const m = monogram(pad);
  const sprigY = Math.min(m.bottom + 46 - pad * 0.2, 448 - pad);
  return `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="disc" cx="50%" cy="42%" r="85%">
      <stop offset="0%" stop-color="#fbeef0"/>
      <stop offset="100%" stop-color="#f0d2d8"/>
    </radialGradient>
  </defs>

  <rect width="512" height="512" fill="url(#disc)"/>

  <g transform="translate(${m.tx.toFixed(1)} ${m.ty.toFixed(1)})">
    ${m.glyphs}
  </g>

  <!-- rametto minimale sotto il monogramma -->
  <g transform="translate(256 ${sprigY.toFixed(1)})">
    <path d="M-58 0 H58" stroke="#98a37b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <g fill="#98a37b">
      <ellipse cx="-60" cy="-4" rx="12" ry="4.5" transform="rotate(-28 -60 -4)"/>
      <ellipse cx="60" cy="-4" rx="12" ry="4.5" transform="rotate(28 60 -4)"/>
    </g>
    <circle r="6" fill="#d99aa6"/>
  </g>
</svg>`;
};

await mkdir('public/icons', { recursive: true });

if (process.env.ICON_DEBUG) {
  const { writeFileSync } = await import('node:fs');
  writeFileSync('scripts/assets/real-icon.svg', svg(0));
  console.log('debug: scritto scripts/assets/real-icon.svg');
}

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
