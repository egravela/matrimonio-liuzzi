// Composizione condivisa del monogramma "E&T" in Great Vibes, usata sia
// dall'icona che dalle splash screen.

// opentype.js a certe dimensioni frazionarie produce coordinate NaN
// (bug noto con alcuni glifi): se succede, ritocca la dimensione di un pelo
export function safeGlyphPath(glyph, x, y, size) {
  for (let i = 0; i < 8; i++) {
    const path = glyph.getPath(x, y, size + i * 0.037);
    if (!/NaN|Infinity|undefined/i.test(path.toPathData(2))) return path;
  }
  throw new Error(`coordinate NaN persistenti nel glifo alla dimensione ${size}`);
}

export function bbox(paths) {
  const boxes = paths.map((p) => p.getBoundingBox());
  return {
    minX: Math.min(...boxes.map((b) => b.x1)),
    maxX: Math.max(...boxes.map((b) => b.x2)),
    minY: Math.min(...boxes.map((b) => b.y1)),
    maxY: Math.max(...boxes.map((b) => b.y2)),
  };
}

// Compone "E & T" glifo per glifo (charToGlyph, senza il motore GSUB di
// opentype.js che non supporta alcune feature di Great Vibes).
// Le maiuscole di Great Vibes hanno svolazzi molto ampi che si sovrappongono:
// spaziatura extra e "&" ridotta come negli inviti.
export function monogramPaths(font, fontSize) {
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

// scala il monogramma per riempire un riquadro targetW x targetH
export function scaledMonogram(font, targetW, targetH) {
  const ref = bbox(monogramPaths(font, 100));
  const fontSize = 100 * Math.min(targetW / (ref.maxX - ref.minX), targetH / (ref.maxY - ref.minY));
  const paths = monogramPaths(font, fontSize);
  return { paths, ...bbox(paths) };
}

// Testo libero (per "Elena & Tommaso" nelle splash screen): stessa
// protezione anti-NaN, spaziatura naturale del font più un tocco di tracking.
export function textPaths(font, text, fontSize, tracking = 0) {
  const out = [];
  let x = 0;
  for (const ch of text) {
    if (ch === ' ') {
      x += fontSize * 0.28;
      continue;
    }
    const glyph = font.charToGlyph(ch);
    out.push(safeGlyphPath(glyph, x, 0, fontSize));
    x += (glyph.advanceWidth / font.unitsPerEm) * fontSize + tracking;
  }
  return out;
}
