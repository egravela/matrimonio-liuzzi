// Genera una card stampabile con il QR code del sito, nella stessa grafica
// coordinata degli inviti: fondo crema, corsivo Great Vibes per i nomi,
// Cormorant Garamond per didascalie, composizioni floreali ad acquerello,
// QR a pallini con finder pattern arrotondati e monogramma E&T al centro
// (error correction alta, così resta leggibile — verificare sempre con
// scripts/verify-qr.mjs dopo ogni modifica).
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

// composizione floreale ad acquerello nello stile di components/Floral.tsx:
// rosa grande a petali concentrici, rosa media, boccioli, fogliame e
// fiorellini bianchi, su macchie di colore sfocate
function floralCorner(cx, cy, scale, rotate = 0) {
  const whiteFlower = (x, y, s) => `
    <g transform="translate(${x} ${y}) scale(${s})">
      ${[0, 72, 144, 216, 288]
        .map(
          (a) =>
            `<ellipse cx="0" cy="-7" rx="4" ry="7" fill="#fbf7f2" stroke="#eadfd6" stroke-width="0.5" transform="rotate(${a})"/>`,
        )
        .join('')}
      <circle r="3" fill="#e9d3a3"/>
    </g>`;

  return `
  <g transform="translate(${cx} ${cy}) rotate(${rotate}) scale(${scale})">
    <g filter="url(#wash)" opacity="0.5">
      <ellipse cx="0" cy="0" rx="85" ry="60" fill="#f6dde1"/>
      <ellipse cx="90" cy="-25" rx="60" ry="42" fill="#eef0e5"/>
    </g>

    <g filter="url(#soft)">
      <path d="M40 10 C 75 -10, 110 -22, 150 -18" stroke="#9aa77e" stroke-width="1.6" fill="none"/>
      <path d="M80 -8 q 8 -20 0 -32 q -13 8 -11 28 z" fill="url(#leaf)" opacity="0.9"/>
      <path d="M112 -16 q 15 -16 13 -31 q -16 5 -19 28 z" fill="url(#leafGrey)" opacity="0.9"/>
      <path d="M138 -18 q 17 -9 21 -24 q -18 2 -25 21 z" fill="url(#leaf)" opacity="0.85"/>
      <path d="M-15 35 q -20 -13 -38 -11 q 7 19 32 19 z" fill="url(#leaf)" opacity="0.9"/>
      <path d="M25 -35 q -5 -24 -20 -33 q -6 18 11 35 z" fill="url(#leafGrey)" opacity="0.9"/>
    </g>

    <g filter="url(#soft)">
      <circle cx="0" cy="0" r="36" fill="url(#petal)"/>
      <path d="M0 -36 a36 36 0 0 1 31 54 a28 28 0 0 0 -31 -54z" fill="#e8b6c0" opacity="0.7"/>
      <circle cx="0" cy="0" r="24" fill="url(#petalLight)"/>
      <path d="M-20 -6 q 11 -15 31 -11 q 11 4 13 16 q -20 -13 -44 -5z" fill="#dfa4af" opacity="0.65"/>
      <circle cx="1" cy="1" r="13" fill="url(#petal)"/>
      <path d="M-7 -3 q 8 -6 16 0 q -3 8 -12 7 q -6 -3 -4 -7z" fill="#d597a4" opacity="0.8"/>
      <circle cx="2" cy="2" r="4" fill="#c98795" opacity="0.85"/>
    </g>

    <g filter="url(#soft)">
      <circle cx="72" cy="22" r="24" fill="url(#petalLight)"/>
      <circle cx="72" cy="22" r="16" fill="url(#petal)"/>
      <path d="M58 17 q 9 -11 25 -5 q -4 12 -16 12 q -8 -2 -9 -7z" fill="#dfa4af" opacity="0.7"/>
      <circle cx="73" cy="23" r="6" fill="#e2aab5"/>
      <circle cx="73" cy="23" r="2.6" fill="#c98795" opacity="0.85"/>
    </g>

    <g filter="url(#soft)">
      <ellipse cx="-48" cy="18" rx="12" ry="15" fill="url(#petal)"/>
      <path d="M-54 12 q 6 -8 13 0 q -2 11 -7 13 q -5 -5 -6 -13z" fill="#dfa4af" opacity="0.6"/>
      <ellipse cx="42" cy="-38" rx="9" ry="11" fill="url(#petalLight)"/>
      <path d="M37 -43 q 5 -5 10 0 q -2 8 -5 9 q -4 -3 -5 -9z" fill="#e3adb8" opacity="0.7"/>
    </g>

    <g filter="url(#soft)" opacity="0.95">
      ${whiteFlower(-30, -32, 1)}
      ${whiteFlower(105, 2, 0.85)}
    </g>
  </g>`;
}

// cuoricino con linee laterali, come il divisore della home
function heartDivider(cx, y, w) {
  return `
  <g transform="translate(${cx} ${y})">
    <line x1="${-w / 2}" y1="0" x2="-22" y2="0" stroke="${LINE}" stroke-width="1.5"/>
    <line x1="22" y1="0" x2="${w / 2}" y2="0" stroke="${LINE}" stroke-width="1.5"/>
    <path transform="translate(-9 -8) scale(0.75)" fill="${SAGE_SOFT}" opacity="0.75"
      d="M12 21s-7.5-4.8-9.8-9C.7 9 2 5.6 5.2 5c2-.4 3.9.6 4.8 2.3h4c.9-1.7 2.8-2.7 4.8-2.3 3.2.6 4.5 4 3 7-2.3 4.2-9.8 9-9.8 9z"/>
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
  const m = qrBoxSize / (size + quietModules * 2);
  const qrPixelSize = m * (size + quietModules * 2);
  const qrX = (w - qrPixelSize) / 2;
  const qrY = h * 0.5 - qrPixelSize / 2;

  // buco centrale riservato al monogramma, entro il margine di recupero
  // dell'error correction "H" (~30%)
  const logoModules = Math.floor(size * 0.22);
  const holeStart = Math.floor((size - logoModules) / 2);
  const holeEnd = holeStart + logoModules;

  const inFinder = (row, col) =>
    (row < 7 && col < 7) || (row < 7 && col >= size - 7) || (row >= size - 7 && col < 7);

  // moduli dati come pallini morbidi
  let modulesMarkup = '';
  const dotR = m * 0.44;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (data[row * size + col] !== 1) continue;
      if (inFinder(row, col)) continue;
      if (row >= holeStart && row < holeEnd && col >= holeStart && col < holeEnd) continue;
      const cx = qrX + (quietModules + col + 0.5) * m;
      const cy = qrY + (quietModules + row + 0.5) * m;
      modulesMarkup += `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${dotR.toFixed(2)}" fill="${INK}"/>\n    `;
    }
  }

  // finder pattern disegnati come anelli arrotondati nel rosa dell'icona
  const finder = (row0, col0) => {
    const x = qrX + (quietModules + col0) * m;
    const y = qrY + (quietModules + row0) * m;
    return `
  <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(7 * m).toFixed(1)}" height="${(7 * m).toFixed(1)}" rx="${(2.3 * m).toFixed(1)}" fill="${ROSE_2}"/>
  <rect x="${(x + m).toFixed(1)}" y="${(y + m).toFixed(1)}" width="${(5 * m).toFixed(1)}" height="${(5 * m).toFixed(1)}" rx="${(1.7 * m).toFixed(1)}" fill="${WHITE}"/>
  <rect x="${(x + 2 * m).toFixed(1)}" y="${(y + 2 * m).toFixed(1)}" width="${(3 * m).toFixed(1)}" height="${(3 * m).toFixed(1)}" rx="${(1.1 * m).toFixed(1)}" fill="${ROSE_2}"/>`;
  };

  // monogramma al centro del QR, su disco rosa con corona crema (clear zone)
  const holeCx = qrX + (quietModules + size / 2) * m;
  const holeCy = qrY + (quietModules + size / 2) * m;
  const holeR = (logoModules / 2) * m;
  const mono = scaledMonogram(scriptFont, holeR * 1.5, holeR * 1.0);
  const monoTx = holeCx - (mono.minX + mono.maxX) / 2;
  const monoTy = holeCy - (mono.minY + mono.maxY) / 2;
  const monoGlyphs = mono.paths
    .map((p) => `<path d="${p.toPathData(2)}" fill="${WHITE}" fill-rule="evenodd"/>`)
    .join('\n      ');

  // testi
  const nameSize = w * 0.135;
  const name = centeredGlyphs(scriptFont, 'Elena & Tommaso', nameSize, nameSize * 0.015, w / 2, h * 0.112, SAGE);

  const dateSize = w * 0.031;
  const date = centeredGlyphs(serifFont, '19 SETTEMBRE 2026', dateSize, dateSize * 0.42, w / 2, h * 0.208, SAGE);

  const eyebrowSize = w * 0.03;
  const eyebrow = centeredGlyphs(
    serifFont,
    'INQUADRA IL CODICE',
    eyebrowSize,
    eyebrowSize * 0.42,
    w / 2,
    qrY - h * 0.042,
    INK_SOFT,
  );

  const captionSize = w * 0.035;
  const caption = centeredGlyphs(
    serifFont,
    'e condividi i tuoi scatti con noi',
    captionSize,
    0,
    w / 2,
    qrY + qrPixelSize + h * 0.052,
    INK_SOFT,
  );

  const urlSize = w * 0.024;
  const urlText = centeredGlyphs(
    serifFont,
    'MATRIMONIO-LIUZZI.VERCEL.APP',
    urlSize,
    urlSize * 0.38,
    w / 2,
    qrY + qrPixelSize + h * 0.092,
    SAGE_SOFT,
  );

  const closingSize = w * 0.082;
  const closing = centeredGlyphs(scriptFont, 'Grazie di cuore', closingSize, 0, w / 2, h * 0.9, SAGE);

  return `
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="disc" cx="50%" cy="42%" r="85%">
      <stop offset="0%" stop-color="${ROSE_1}"/>
      <stop offset="100%" stop-color="${ROSE_2}"/>
    </radialGradient>
    <radialGradient id="petal" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#fbeef0"/>
      <stop offset="55%" stop-color="#f3d3d9"/>
      <stop offset="100%" stop-color="#e3adb8"/>
    </radialGradient>
    <radialGradient id="petalLight" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#fdf6f5"/>
      <stop offset="70%" stop-color="#f6dde1"/>
      <stop offset="100%" stop-color="#ecc3cb"/>
    </radialGradient>
    <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#b8c1a3"/>
      <stop offset="100%" stop-color="#93a07a"/>
    </linearGradient>
    <linearGradient id="leafGrey" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ccd2c0"/>
      <stop offset="100%" stop-color="#aab49a"/>
    </linearGradient>
    <filter id="wash" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="7"/>
    </filter>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="1.1"/>
    </filter>
    <filter id="panelShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#57544f" flood-opacity="0.13"/>
    </filter>
  </defs>

  <rect width="${w}" height="${h}" fill="${CREAM}"/>

  ${floralCorner(w * 0.085, h * 0.052, w / 640, -10)}
  ${floralCorner(w * 0.915, h * 0.955, w / 700, 168)}

  ${name.markup}

  ${heartDivider(w / 2, h * 0.163, w * 0.3)}

  ${date.markup}

  ${eyebrow.markup}

  <rect x="${(qrX - qrPixelSize * 0.055).toFixed(1)}" y="${(qrY - qrPixelSize * 0.055).toFixed(1)}"
        width="${(qrPixelSize * 1.11).toFixed(1)}" height="${(qrPixelSize * 1.11).toFixed(1)}"
        rx="${(qrPixelSize * 0.055).toFixed(1)}" fill="${WHITE}" filter="url(#panelShadow)"/>

  ${modulesMarkup}
  ${finder(0, 0)}
  ${finder(0, size - 7)}
  ${finder(size - 7, 0)}

  <circle cx="${holeCx.toFixed(1)}" cy="${holeCy.toFixed(1)}" r="${(holeR * 1.12).toFixed(1)}" fill="${WHITE}"/>
  <circle cx="${holeCx.toFixed(1)}" cy="${holeCy.toFixed(1)}" r="${holeR.toFixed(1)}" fill="url(#disc)"/>
  <g transform="translate(${monoTx.toFixed(1)} ${monoTy.toFixed(1)})">
      ${monoGlyphs}
  </g>

  ${caption.markup}
  ${urlText.markup}

  ${heartDivider(w / 2, h * 0.845, w * 0.24)}
  ${closing.markup}
</svg>`;
}

await mkdir('public/downloads', { recursive: true });

// A6 a ~300dpi (105x148mm), buona qualita per la stampa dei cartoncini
const W = 1240;
const H = 1748;

await sharp(Buffer.from(buildCard(W, H))).png().toFile('public/downloads/qr-tavoli.png');
console.log(`creata public/downloads/qr-tavoli.png (${W}x${H})`);
