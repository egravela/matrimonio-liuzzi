// Genera una card stampabile con il QR code del sito, nella stessa grafica
// coordinata degli inviti: fondo crema, corsivo Great Vibes per i nomi,
// Cormorant Garamond per didascalie ed eyebrow, disco rosa con monogramma
// al centro del QR (error correction alta, cosi resta leggibile).
import sharp from 'sharp';
import QRCode from 'qrcode';
import { mkdir, readFile } from 'node:fs/promises';
import opentype from 'opentype.js';
import { scaledMonogram, textPaths, bbox } from './lib/monogram.mjs';

const URL = 'https://matrimonio-liuzzi.vercel.app/';

const scriptTtf = await readFile('scripts/assets/GreatVibes-Regular.ttf');
const scriptFont = opentype.parse(
  scriptTtf.buffer.slice(scriptTtf.byteOffset, scriptTtf.byteOffset + scriptTtf.byteLength),
);
const serifTtf = await readFile('scripts/assets/CormorantGaramond.ttf');
const serifFont = opentype.parse(
  serifTtf.buffer.slice(serifTtf.byteOffset, serifTtf.byteOffset + serifTtf.byteLength),
);

const CREAM = '#fefdfb';
const INK = '#57544f';
const INK_SOFT = '#8a867f';
const SAGE = '#7c8760';
const SAGE_SOFT = '#b5bd9e';
const ROSE_1 = '#b8637a';
const ROSE_2 = '#96435f';
const LINE = '#e9e5dd';
const WHITE = '#ffffff';

function centeredGlyphs(font, text, fontSize, tracking, cx, y, fill) {
  const paths = textPaths(font, text, fontSize, tracking);
  const box = bbox(paths);
  const tx = cx - (box.minX + box.maxX) / 2;
  const glyphs = paths
    .map((p) => `<path d="${p.toPathData(2)}" fill="${fill}" fill-rule="evenodd"/>`)
    .join('\n      ');
  return { markup: `<g transform="translate(${tx.toFixed(1)} ${y.toFixed(1)})">\n      ${glyphs}\n    </g>`, box };
}

// piccola composizione floreale ad acquerello, in stile con il resto del sito
function floral(cx, cy, scale, rotate = 0) {
  return `
  <g transform="translate(${cx} ${cy}) rotate(${rotate}) scale(${scale})" opacity="0.95">
    <ellipse cx="-10" cy="6" rx="46" ry="32" fill="${ROSE_1}" opacity="0.35"/>
    <circle cx="18" cy="-4" r="22" fill="${ROSE_1}"/>
    <circle cx="18" cy="-4" r="13" fill="#f3d3d9"/>
    <circle cx="19" cy="-3" r="5.5" fill="${ROSE_2}" opacity="0.85"/>
    <circle cx="-20" cy="14" r="13" fill="#eec3ca"/>
    <circle cx="-20" cy="14" r="7" fill="#f6dde1"/>
    <path d="M-2 8 q14 -20 34 -10" stroke="${SAGE}" stroke-width="2.4" fill="none" opacity="0.8"/>
    <path d="M6 4 q6 -16 -4 -26 q-10 6 -6 22z" fill="${SAGE}" opacity="0.85"/>
    <path d="M-30 4 q-14 -8 -28 -4 q6 14 26 12z" fill="${SAGE_SOFT}" opacity="0.85"/>
  </g>`;
}

function qrModules(text) {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'H' });
  return { data: qr.modules.data, size: qr.modules.size };
}

function buildCard(w, h) {
  const { data, size } = qrModules(URL);

  const qrBoxSize = Math.min(w, h) * 0.56;
  const quietModules = 4;
  const moduleSize = qrBoxSize / (size + quietModules * 2);
  const qrPixelSize = moduleSize * (size + quietModules * 2);
  const qrX = (w - qrPixelSize) / 2;
  const qrY = h * 0.5 - qrPixelSize / 2;

  // buco centrale riservato al monogramma (in moduli), tenuto entro il
  // margine sicuro per l'error correction "H" (~30% di recupero)
  const logoModules = Math.floor(size * 0.22);
  const holeStart = Math.floor((size - logoModules) / 2);
  const holeEnd = holeStart + logoModules;

  let modulesMarkup = '';
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (data[row * size + col] !== 1) continue;
      if (row >= holeStart && row < holeEnd && col >= holeStart && col < holeEnd) continue;
      const x = qrX + (quietModules + col) * moduleSize;
      const y = qrY + (quietModules + row) * moduleSize;
      modulesMarkup += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${(moduleSize * 1.02).toFixed(2)}" height="${(moduleSize * 1.02).toFixed(2)}" fill="${INK}"/>\n    `;
    }
  }

  // monogramma al centro del QR, su disco rosa con bordo crema (clear zone)
  const holeCx = qrX + (quietModules + size / 2) * moduleSize;
  const holeCy = qrY + (quietModules + size / 2) * moduleSize;
  const holeR = (logoModules / 2) * moduleSize;
  const mono = scaledMonogram(scriptFont, holeR * 1.5, holeR * 1.0);
  const monoTx = holeCx - (mono.minX + mono.maxX) / 2;
  const monoTy = holeCy - (mono.minY + mono.maxY) / 2;
  const monoGlyphs = mono.paths
    .map((p) => `<path d="${p.toPathData(2)}" fill="${WHITE}" fill-rule="evenodd"/>`)
    .join('\n      ');

  // testi
  const nameSize = w * 0.135;
  const name = centeredGlyphs(scriptFont, 'Elena & Tommaso', nameSize, nameSize * 0.015, w / 2, h * 0.115, SAGE);

  const dateSize = w * 0.033;
  const date = centeredGlyphs(
    serifFont,
    '1 9   S E T T E M B R E   2 0 2 6',
    dateSize,
    0,
    w / 2,
    h * 0.205,
    SAGE,
  );

  const eyebrowSize = w * 0.032;
  const eyebrow = centeredGlyphs(
    serifFont,
    'I N Q U A D R A   I L   C O D I C E',
    eyebrowSize,
    0,
    w / 2,
    qrY - h * 0.048,
    INK_SOFT,
  );

  const captionSize = w * 0.034;
  const caption = centeredGlyphs(
    serifFont,
    'e condividi i tuoi scatti con noi',
    captionSize,
    0,
    w / 2,
    qrY + qrPixelSize + h * 0.058,
    INK_SOFT,
  );

  const urlSize = w * 0.028;
  const urlText = centeredGlyphs(
    serifFont,
    'M A T R I M O N I O - L I U Z Z I . V E R C E L . A P P',
    urlSize,
    0,
    w / 2,
    qrY + qrPixelSize + h * 0.098,
    SAGE_SOFT,
  );

  const dividerY = h * 0.16;

  const closingSize = w * 0.078;
  const closing = centeredGlyphs(scriptFont, 'Grazie di cuore', closingSize, 0, w / 2, h * 0.895, SAGE);
  const bottomDividerY = h * 0.845;

  return `
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="disc" cx="50%" cy="42%" r="85%">
      <stop offset="0%" stop-color="${ROSE_1}"/>
      <stop offset="100%" stop-color="${ROSE_2}"/>
    </radialGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="1.2"/>
    </filter>
  </defs>

  <rect width="${w}" height="${h}" fill="${CREAM}"/>

  <g filter="url(#soft)">
    ${floral(w * 0.1, h * 0.06, w / 900, -8)}
    ${floral(w * 0.92, h * 0.97, w / 780, 172)}
  </g>

  ${name.markup}

  <line x1="${w * 0.32}" y1="${dividerY}" x2="${w * 0.68}" y2="${dividerY}" stroke="${LINE}" stroke-width="1.5"/>

  ${date.markup}

  ${eyebrow.markup}

  <rect x="${(qrX - qrPixelSize * 0.06).toFixed(1)}" y="${(qrY - qrPixelSize * 0.06).toFixed(1)}"
        width="${(qrPixelSize * 1.12).toFixed(1)}" height="${(qrPixelSize * 1.12).toFixed(1)}"
        rx="${(qrPixelSize * 0.05).toFixed(1)}" fill="${WHITE}"/>

  ${modulesMarkup}

  <circle cx="${holeCx.toFixed(1)}" cy="${holeCy.toFixed(1)}" r="${(holeR * 1.12).toFixed(1)}" fill="${CREAM}"/>
  <circle cx="${holeCx.toFixed(1)}" cy="${holeCy.toFixed(1)}" r="${holeR.toFixed(1)}" fill="url(#disc)"/>
  <g transform="translate(${monoTx.toFixed(1)} ${monoTy.toFixed(1)})">
      ${monoGlyphs}
  </g>

  ${caption.markup}
  ${urlText.markup}

  <line x1="${w * 0.38}" y1="${bottomDividerY}" x2="${w * 0.62}" y2="${bottomDividerY}" stroke="${LINE}" stroke-width="1.5"/>
  ${closing.markup}
</svg>`;
}

await mkdir('public/downloads', { recursive: true });

// A6 a ~300dpi (105x148mm), buona qualita per la stampa dei cartoncini
const W = 1240;
const H = 1748;

await sharp(Buffer.from(buildCard(W, H))).png().toFile('public/downloads/qr-tavoli.png');
console.log(`creata public/downloads/qr-tavoli.png (${W}x${H})`);
