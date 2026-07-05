'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import Floral from '@/components/Floral';

// Pagina di servizio per gli sposi: genera il QR code del sito
// da stampare sui cartoncini dei tavoli.
export default function QrPage() {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    const url = window.location.origin;
    setOrigin(url);
    QRCode.toDataURL(url, {
      width: 640,
      margin: 2,
      color: { dark: '#57544f', light: '#ffffff' },
    }).then(setDataUrl);
  }, []);

  return (
    <main className="page center">
      <Floral className="floral top-left" />

      <div className="content" style={{ paddingTop: '3.2rem' }}>
        <h1 className="script page-title">Condividi i tuoi scatti</h1>
        <p style={{ margin: '0.8rem 0 1.4rem', color: 'var(--ink-soft)' }}>
          Inquadra il codice e regala agli sposi i tuoi ricordi della festa
        </p>

        {dataUrl && (
          <div className="card" style={{ display: 'inline-block', padding: '1.2rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dataUrl} alt={`QR code per ${origin}`} style={{ width: 260, maxWidth: '70vw' }} />
            <p className="eyebrow" style={{ marginTop: '0.8rem' }}>
              {origin.replace(/^https?:\/\//, '')}
            </p>
          </div>
        )}

        <p style={{ marginTop: '1.6rem', fontSize: '0.95rem', color: 'var(--ink-soft)' }}>
          Suggerimento per gli sposi: stampate questa pagina o salvate il QR
          <br />
          per i cartoncini dei tavoli.
        </p>
      </div>
    </main>
  );
}
