// Popola la galleria con immagini demo (path "demo-*") per vedere il mosaico.
// Rimozione: node scripts/cleanup-demo.mjs
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const supabase = createClient(
  'https://rmziigjviufyrmkcnmmj.supabase.co',
  'sb_publishable_Eaww-sFQ8yOYu39-A_Mzxg_ePuwF5ac',
);

// finte foto "bokeh acquerello" nella palette del matrimonio
function svgPhoto({ w, h, base, accents, label }) {
  const circles = accents
    .map((c, i) => {
      const cx = (w / (accents.length + 1)) * (i + 1);
      const cy = h * (0.25 + 0.5 * ((i * 37) % 100) / 100);
      const r = Math.min(w, h) * (0.18 + 0.12 * ((i * 53) % 100) / 100);
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" opacity="0.55" filter="url(#b)"/>`;
    })
    .join('');
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${base[0]}"/><stop offset="100%" stop-color="${base[1]}"/>
      </linearGradient>
      <filter id="b"><feGaussianBlur stdDeviation="${Math.min(w, h) / 22}"/></filter>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    ${circles}
    <text x="50%" y="52%" text-anchor="middle" font-family="Georgia, serif" font-style="italic"
          font-size="${Math.min(w, h) / 12}" fill="rgba(255,255,255,0.85)">${label}</text>
  </svg>`;
}

const palette = {
  blush: ['#f7e3e6', '#eec3ca'],
  rose: ['#eec3ca', '#dfa4af'],
  sage: ['#b5bd9e', '#98a37b'],
  cream: ['#fdf6ec', '#e9d3a3'],
  grey: ['#ccd2c0', '#aab49a'],
};
const accents = ['#dfa4af', '#98a37b', '#e9d3a3', '#f7e3e6', '#c98795', '#7c8760'];

const demo = [
  { name: 'Zia Carla', caption: 'Che giornata meravigliosa!', base: palette.blush, ar: [800, 1100] },
  { name: 'Marco e Giulia', caption: 'Evviva gli sposi 🥂', base: palette.sage, ar: [1200, 800] },
  { name: 'Nonna Pina', caption: null, base: palette.cream, ar: [800, 800] },
  { name: 'Luca', caption: 'Il primo ballo ❤', base: palette.rose, ar: [800, 1300] },
  { name: 'Famiglia Rossi', caption: 'Auguri di cuore', base: palette.grey, ar: [1200, 900] },
  { name: 'Sara', caption: 'Bellissimi!', base: palette.blush, ar: [900, 900] },
  { name: 'Gli amici del calcetto', caption: 'Tommy sei un grande', base: palette.sage, ar: [1100, 800] },
  { name: 'Francesca', caption: 'Il taglio della torta 🍰', base: palette.cream, ar: [800, 1200] },
  { name: 'Zio Peppe', caption: null, base: palette.rose, ar: [1200, 800] },
  { name: 'Elisa e Andrea', caption: 'W gli sposi!', base: palette.grey, ar: [800, 1000] },
  { name: 'Colleghe di Elena', caption: 'Sei stupenda Ele', base: palette.blush, ar: [900, 1300] },
  { name: 'Matteo', caption: 'Che festa ragazzi', base: palette.sage, ar: [800, 800] },
  { name: 'Cugini di Bari', caption: 'Non vedevamo l’ora!', base: palette.cream, ar: [1200, 850] },
  { name: 'Chiara', caption: 'Lancio del bouquet 💐', base: palette.rose, ar: [800, 1150] },
];

let n = 0;
for (const d of demo) {
  n += 1;
  const [w, h] = d.ar;
  const svg = svgPhoto({
    w,
    h,
    base: d.base,
    accents: accents.slice(n % 3, (n % 3) + 3),
    label: `foto di ${d.name}`,
  });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  const path = `demo-${String(n).padStart(2, '0')}-${Math.random().toString(36).slice(2, 7)}.png`;

  const up = await supabase.storage.from('wedding-media').upload(path, png, { contentType: 'image/png' });
  if (up.error) throw new Error(`${path}: ${up.error.message}`);

  const ins = await supabase.from('media').insert({
    guest_name: d.name,
    caption: d.caption,
    storage_path: path,
    media_type: 'image',
  });
  if (ins.error) throw new Error(`${path} insert: ${ins.error.message}`);
  console.log('caricata', path, '-', d.name);
}
console.log(`FATTO: ${n} immagini demo`);
