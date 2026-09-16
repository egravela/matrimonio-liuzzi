import type { Metadata } from 'next';
import Floral from '@/components/Floral';
import { TAVOLI } from '@/lib/tavoli';
import TavoliList from './TavoliList';

export const metadata: Metadata = {
  title: 'I tavoli — Elena & Tommaso',
  description:
    'Ogni tavolo del ricevimento porta il nome di una molecola: scopri la tua e perché l’abbiamo scelta.',
};

// Lo spazio dei tavoli: la lista è statica (viene da lib/tavoli.ts), il
// componente client gestisce solo apertura delle schede e ancora nell'URL.
export default function TavoliPage() {
  return (
    <main className="page">
      <Floral className="floral top-left" />
      <Floral className="floral bottom-right" />

      <div className="content">
        <h1 className="script page-title" style={{ marginTop: '3.2rem' }}>
          I nostri tavoli
        </h1>
        <p className="eyebrow center" style={{ marginTop: '0.2rem' }}>
          Una molecola per ogni tavolo
        </p>

        <p className="center tavoli-intro">
          Niente numeri: ogni tavolo porta il nome di una molecola, scelta pensando a chi ci
          siederà. Sul segnaposto trovate la vostra: cercatela qui sotto e scoprite perché
          l&apos;abbiamo dedicata proprio a voi.
        </p>

        <TavoliList tavoli={TAVOLI} />

        <p className="center" style={{ marginTop: '2rem', fontSize: '0.92rem', color: 'var(--ink-soft)' }}>
          {TAVOLI.length} tavoli, {TAVOLI.length} molecole, una sola grande famiglia.
        </p>
      </div>
    </main>
  );
}
