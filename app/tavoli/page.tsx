import type { Metadata } from 'next';
import Floral from '@/components/Floral';
import { TAVOLI } from '@/lib/tavoli';
import TavoliGate from './TavoliGate';

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

        <TavoliGate tavoli={TAVOLI} />
      </div>
    </main>
  );
}
