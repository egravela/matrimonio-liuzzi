import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Elena & Tommaso — Matrimonio',
    short_name: 'Elena & Tommaso',
    description:
      'Condividi le tue foto e i tuoi video del matrimonio di Elena e Tommaso, 19 settembre 2026.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fefdfb',
    theme_color: '#98a37b',
    orientation: 'portrait',
    lang: 'it',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
