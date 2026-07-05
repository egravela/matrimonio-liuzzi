import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Elena & Tommaso — Matrimonio',
    short_name: 'Elena & Tommaso',
    description:
      'Condividi le tue foto e i tuoi video del matrimonio di Elena e Tommaso, 19 settembre 2026.',
    start_url: '/',
    display: 'standalone',
    // stesso tono dell'icona: su Android l'avvio mostra sempre icona +
    // background_color a schermo intero (non è personalizzabile oltre
    // questo) - facendoli combaciare, il "quadrato" dell'icona si fonde nello
    // sfondo invece di apparire come un riquadro isolato
    background_color: '#a7536c',
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
