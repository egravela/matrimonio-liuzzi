// Dimensioni fisiche (px = punti CSS x pixel ratio) dei dispositivi Apple
// più diffusi, in portrait. Nessuna dipendenza: importato sia dal generatore
// delle immagini (scripts/generate-splash.mjs) sia da app/layout.tsx per
// costruire le media query di apple-touch-startup-image.
export const SPLASH_SCREENS = [
  { file: 'apple-splash-640-1136.png', width: 320, height: 568, ratio: 2 },
  { file: 'apple-splash-750-1334.png', width: 375, height: 667, ratio: 2 },
  { file: 'apple-splash-1242-2208.png', width: 414, height: 736, ratio: 3 },
  { file: 'apple-splash-1125-2436.png', width: 375, height: 812, ratio: 3 },
  { file: 'apple-splash-828-1792.png', width: 414, height: 896, ratio: 2 },
  { file: 'apple-splash-1242-2688.png', width: 414, height: 896, ratio: 3 },
  { file: 'apple-splash-1170-2532.png', width: 390, height: 844, ratio: 3 },
  { file: 'apple-splash-1179-2556.png', width: 393, height: 852, ratio: 3 },
  { file: 'apple-splash-1290-2796.png', width: 430, height: 932, ratio: 3 },
  { file: 'apple-splash-1536-2048.png', width: 768, height: 1024, ratio: 2 },
  { file: 'apple-splash-1620-2160.png', width: 810, height: 1080, ratio: 2 },
  { file: 'apple-splash-1640-2360.png', width: 820, height: 1180, ratio: 2 },
  { file: 'apple-splash-2048-2732.png', width: 1024, height: 1366, ratio: 2 },
];
