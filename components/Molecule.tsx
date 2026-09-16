import type { MoleculeShape } from '@/lib/tavoli';

// Disegno "da quaderno di chimica" ma in acquerello: atomi rosa cipria e
// verde salvia legati da tratti sottili. La forma dipende dal tipo di
// molecola (anello aromatico, catena peptidica, doppia elica) e i dettagli
// cambiano da tavolo a tavolo grazie a un generatore pseudo-casuale con
// seme fisso: lo stesso tavolo ha sempre lo stesso disegno.

const ATOM_COLORS = ['#dfa4af', '#98a37b', '#eec3ca', '#b5bd9e', '#c98795'];
const BOND = '#9aa77e';

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

type Atom = { x: number; y: number; r: number; color: string };
type Bond = { a: Atom; b: Atom; double?: boolean };

function ring(rand: () => number): { atoms: Atom[]; bonds: Bond[] } {
  const n = 5 + Math.floor(rand() * 2); // 5 o 6 atomi nell'anello
  const cx = 60;
  const cy = 62;
  const radius = 26 + rand() * 4;
  const atoms: Atom[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2 + (rand() - 0.5) * 0.2;
    const rr = radius + (rand() - 0.5) * 5;
    atoms.push({
      x: cx + Math.cos(a) * rr,
      y: cy + Math.sin(a) * rr,
      r: 4.5 + rand() * 2.5,
      color: ATOM_COLORS[Math.floor(rand() * ATOM_COLORS.length)],
    });
  }
  const bonds: Bond[] = atoms.map((a, i) => ({
    a,
    b: atoms[(i + 1) % n],
    double: i % 2 === 0 && rand() < 0.75,
  }));
  // sostituenti fuori dall'anello, come gruppi laterali
  const extras = 2 + Math.floor(rand() * 2);
  for (let k = 0; k < extras; k++) {
    const base = atoms[Math.floor(rand() * n)];
    const ang = Math.atan2(base.y - cy, base.x - cx) + (rand() - 0.5) * 0.6;
    const len = 17 + rand() * 6;
    const side: Atom = {
      x: base.x + Math.cos(ang) * len,
      y: base.y + Math.sin(ang) * len,
      r: 3.2 + rand() * 2,
      color: ATOM_COLORS[Math.floor(rand() * ATOM_COLORS.length)],
    };
    atoms.push(side);
    bonds.push({ a: base, b: side });
  }
  return { atoms, bonds };
}

function chain(rand: () => number): { atoms: Atom[]; bonds: Bond[] } {
  const n = 6 + Math.floor(rand() * 2);
  const atoms: Atom[] = [];
  const bonds: Bond[] = [];
  const stepX = 84 / (n - 1);
  for (let i = 0; i < n; i++) {
    const atom: Atom = {
      x: 18 + i * stepX + (rand() - 0.5) * 4,
      y: 62 + (i % 2 === 0 ? -11 : 11) + (rand() - 0.5) * 6,
      r: 4.5 + rand() * 2.5,
      color: ATOM_COLORS[Math.floor(rand() * ATOM_COLORS.length)],
    };
    atoms.push(atom);
    if (i > 0) bonds.push({ a: atoms[i - 1], b: atom, double: rand() < 0.25 });
  }
  // catene laterali, come i residui di un peptide
  const extras = 2 + Math.floor(rand() * 2);
  for (let k = 0; k < extras; k++) {
    const base = atoms[Math.floor(rand() * n)];
    const up = base.y < 62 ? -1 : 1;
    const side: Atom = {
      x: base.x + (rand() - 0.5) * 8,
      y: base.y + up * (16 + rand() * 6),
      r: 3.2 + rand() * 2,
      color: ATOM_COLORS[Math.floor(rand() * ATOM_COLORS.length)],
    };
    atoms.push(side);
    bonds.push({ a: base, b: side });
  }
  return { atoms, bonds };
}

function Helix({ rand }: { rand: () => number }) {
  const phase = rand() * Math.PI;
  const rungs = 6 + Math.floor(rand() * 2);
  const top = 16;
  const bottom = 104;
  const amp = 22 + rand() * 4;
  const points = (offset: number) =>
    Array.from({ length: 25 }, (_, i) => {
      const t = i / 24;
      const y = top + (bottom - top) * t;
      const x = 60 + Math.sin(t * Math.PI * 2 + phase + offset) * amp;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

  const rungsEls = Array.from({ length: rungs }, (_, i) => {
    const t = (i + 0.5) / rungs;
    const y = top + (bottom - top) * t;
    const x1 = 60 + Math.sin(t * Math.PI * 2 + phase) * amp;
    const x2 = 60 + Math.sin(t * Math.PI * 2 + phase + Math.PI) * amp;
    const c1 = ATOM_COLORS[Math.floor(rand() * ATOM_COLORS.length)];
    const c2 = ATOM_COLORS[Math.floor(rand() * ATOM_COLORS.length)];
    return (
      <g key={i}>
        <line x1={x1} y1={y} x2={x2} y2={y} stroke={BOND} strokeWidth="1.3" opacity="0.7" />
        <circle cx={x1} cy={y} r={3.6 + rand() * 1.6} fill={c1} stroke="#fff" strokeWidth="1.2" />
        <circle cx={x2} cy={y} r={3.6 + rand() * 1.6} fill={c2} stroke="#fff" strokeWidth="1.2" />
      </g>
    );
  });

  return (
    <>
      <polyline points={points(0)} fill="none" stroke={BOND} strokeWidth="1.8" strokeLinecap="round" />
      <polyline
        points={points(Math.PI)}
        fill="none"
        stroke={BOND}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.55"
      />
      {rungsEls}
    </>
  );
}

function Graph({ atoms, bonds }: { atoms: Atom[]; bonds: Bond[] }) {
  return (
    <>
      {bonds.map((b, i) => {
        if (!b.double) {
          return (
            <line key={i} x1={b.a.x} y1={b.a.y} x2={b.b.x} y2={b.b.y} stroke={BOND} strokeWidth="1.7" strokeLinecap="round" />
          );
        }
        // doppio legame: due tratti paralleli
        const dx = b.b.x - b.a.x;
        const dy = b.b.y - b.a.y;
        const len = Math.hypot(dx, dy) || 1;
        const ox = (-dy / len) * 2.2;
        const oy = (dx / len) * 2.2;
        return (
          <g key={i} stroke={BOND} strokeWidth="1.5" strokeLinecap="round">
            <line x1={b.a.x + ox} y1={b.a.y + oy} x2={b.b.x + ox} y2={b.b.y + oy} />
            <line x1={b.a.x - ox} y1={b.a.y - oy} x2={b.b.x - ox} y2={b.b.y - oy} />
          </g>
        );
      })}
      {atoms.map((a, i) => (
        <circle key={i} cx={a.x} cy={a.y} r={a.r} fill={a.color} stroke="#fff" strokeWidth="1.4" />
      ))}
    </>
  );
}

export default function Molecule({
  shape,
  seed,
  className,
}: {
  shape: MoleculeShape;
  seed: string;
  className?: string;
}) {
  const rand = rng(hash(seed));
  const washId = `wash-${seed}`;
  // le macchie di acquerello sul fondo cambiano da un tavolo all'altro
  const blots = Array.from({ length: 2 }, () => ({
    cx: 35 + rand() * 50,
    cy: 35 + rand() * 50,
    rx: 26 + rand() * 14,
    ry: 20 + rand() * 12,
    fill: rand() < 0.5 ? '#f6dde1' : '#eef0e5',
  }));

  return (
    <svg className={className} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id={washId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <g filter={`url(#${washId})`} opacity="0.75">
        {blots.map((b, i) => (
          <ellipse key={i} {...b} />
        ))}
      </g>
      {shape === 'elica' ? (
        <Helix rand={rand} />
      ) : (
        <Graph {...(shape === 'anello' ? ring(rand) : chain(rand))} />
      )}
    </svg>
  );
}
