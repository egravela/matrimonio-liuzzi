'use client';

import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV !== 'production') {
      // in sviluppo il SW servirebbe pagine in cache mascherando le modifiche
      navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
      return;
    }

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // browser molto vecchi: la PWA funziona comunque come sito normale
    });
  }, []);

  return null;
}
