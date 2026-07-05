// Genera le splash screen per iOS (apple-touch-startup-image): a differenza
// di Android, che mostra sempre e solo icona + colore di sfondo (non è
// personalizzabile), iOS accetta un'immagine a schermo intero per ogni
// risoluzione di dispositivo. Qui replichiamo la grafica della home:
// fondo crema, disco con monogramma, "Elena & Tommaso" in corsivo.
import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import opentype from 'opentype.js';
import { scaledMonogram, textPaths, bbox } from './lib/monogram.mjs';
import { SPLASH_SCREENS } from './lib/splash-sizes.mjs';

const ttf = await readFile('scripts/assets/GreatVibes-Regular.ttf');
const font = opentype.parse(ttf.buffer.slice(ttf.byteOffset, ttf.byteOffset + ttf.byteLength));

const CREAM = '#fefdfb';
const SAGE = '#7c8760';
const SAGE_SOFT = '#b5bd9e';
const WHITE = '#ffffff';

function svg(w, h) {
  const short = Math.min(w, h);
  const discR = short * 0.165;
  const discCx = w / 2;
  const discCy = h * 0.44;

  const mono = scaledMonogram(font, discR * 1.32, discR * 0.86);
  const monoTx = discCx - (mono.minX + mono.maxX) / 2;
  const monoTy = discCy - (mono.minY + mono.maxY) / 2;
  const monoGlyphs = mono.paths
    .map((p) => `<path d="${p.toPathData(2)}" fill="${WHITE}" fill-rule="evenodd"/>`)
    .join('\n    ');

  const nameSize = short * 0.115;
  const namePaths = textPaths(font, 'Elena & Tommaso', nameSize, nameSize * 0.015);
  const nameBox = bbox(namePaths);
  const nameTx = discCx - (nameBox.minX + nameBox.maxX) / 2;
  const nameTy = discCy + discR + short * 0.145 - (nameBox.minY + nameBox.maxY) / 2;
  const nameGlyphs = namePaths
    .map((p) => `<path d="${p.toPathData(2)}" fill="${SAGE}" fill-rule="evenodd"/>`)
    .join('\n    ');

  const dividerY = nameTy + nameBox.maxY + short * 0.075;
  const dividerHalf = short * 0.09;

  return `
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="disc" cx="50%" cy="42%" r="85%">
      <stop offset="0%" stop-color="#b8637a"/>
      <stop offset="100%" stop-color="#96435f"/>
    </radialGradient>
  </defs>

  <rect width="${w}" height="${h}" fill="${CREAM}"/>

  <circle cx="${discCx.toFixed(1)}" cy="${discCy.toFixed(1)}" r="${discR.toFixed(1)}" fill="url(#disc)"/>
  <g transform="translate(${monoTx.toFixed(1)} ${monoTy.toFixed(1)})">
    ${monoGlyphs}
  </g>

  <g transform="translate(${nameTx.toFixed(1)} ${nameTy.toFixed(1)})">
    ${nameGlyphs}
  </g>

  <line x1="${(discCx - dividerHalf).toFixed(1)}" y1="${dividerY.toFixed(1)}"
        x2="${(discCx + dividerHalf).toFixed(1)}" y2="${dividerY.toFixed(1)}"
        stroke="${SAGE_SOFT}" stroke-width="1.4"/>
</svg>`;
}

await mkdir('public/splash', { recursive: true });

for (const { file, width, height, ratio } of SPLASH_SCREENS) {
  const w = width * ratio;
  const h = height * ratio;
  await sharp(Buffer.from(svg(w, h))).png().toFile(`public/splash/${file}`);
  console.log('creata', file, `(${w}x${h})`);
}
