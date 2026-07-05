import Link from 'next/link';
import Floral from '@/components/Floral';

export default function Home() {
  return (
    <main className="page">
      <Floral className="floral top-left" />
      <Floral className="floral bottom-right" />

      <div className="content center" style={{ paddingTop: '19vh' }}>
        <p className="eyebrow">Il nostro matrimonio</p>

        <h1 className="script" style={{ fontSize: 'clamp(3.2rem, 13vw, 5rem)', marginTop: '1rem' }}>
          Elena <span style={{ fontSize: '0.6em' }}>&amp;</span> Tommaso
        </h1>

        <div className="divider">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21s-7.5-4.8-9.8-9C.7 9 2 5.6 5.2 5c2-.4 3.9.6 4.8 2.3h4c.9-1.7 2.8-2.7 4.8-2.3 3.2.6 4.5 4 3 7-2.3 4.2-9.8 9-9.8 9z" opacity="0.35" />
          </svg>
        </div>

        <p className="eyebrow">Sabato</p>
        <p style={{ fontSize: '1.7rem', letterSpacing: '0.12em', margin: '0.3rem 0 0.2rem' }}>
          19 SETTEMBRE 2026
        </p>
        <p style={{ fontStyle: 'italic', color: 'var(--ink-soft)' }}>Parco di Montebello · Quattro Castella</p>

        <a
          href="https://www.google.com/maps/dir/?api=1&destination=Parco+di+Montebello%2C+Via+Fosse+Ardeatine+1%2C+42020+Quattro+Castella+RE"
          target="_blank"
          rel="noopener noreferrer"
          className="maps-cta"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M12 21s-6.5-5.4-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.6 12 21 12 21z" strokeLinejoin="round" />
            <circle cx="12" cy="10.3" r="2.4" />
          </svg>
          Come arrivare
        </a>

        <div className="divider" />

        <p style={{ maxWidth: '38ch', margin: '0 auto 1.8rem', fontSize: '1.15rem' }}>
          Il dono più grande è condividere con voi questo giorno speciale: regalateci il vostro
          sguardo sulla festa, con le foto e i video che scatterete.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center' }}>
          <Link href="/carica" className="btn">
            Condividi foto e video
          </Link>
          <Link href="/galleria" className="btn ghost">
            Sfoglia la galleria
          </Link>
        </div>
      </div>
    </main>
  );
}
