'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Molecule from '@/components/Molecule';
import { useAnteprima, useTavoliReveal } from '@/components/useTavoliReveal';
import { REVEAL_AT, REVEAL_LABEL, type Tavolo } from '@/lib/tavoli';
import TavoliList from './TavoliList';

// Decide che cosa mostrare su /tavoli: il conto alla rovescia finché la
// sorpresa è chiusa, l'elenco delle molecole da venerdì sera in poi.
export default function TavoliGate({ tavoli }: { tavoli: Tavolo[] }) {
  const anteprima = useAnteprima();
  const reveal = useTavoliReveal(anteprima);

  // Primo render: non sappiamo ancora l'ora del dispositivo, meglio il vuoto
  // di un lampo di contenuto sbagliato.
  if (reveal === 'attesa') return null;

  if (reveal === 'chiuso') return <Countdown />;

  return (
    <>
      {anteprima && (
        <p className="notice ok" style={{ marginTop: '1.2rem' }}>
          Anteprima per gli sposi: gli ospiti vedranno questa pagina da {REVEAL_LABEL}.
        </p>
      )}

      <p className="center tavoli-intro">
        Niente numeri: ogni tavolo porta il nome di una molecola, scelta pensando a chi ci siederà.
        Sul segnaposto trovate la vostra: cercatela qui sotto e scoprite perché l&apos;abbiamo
        dedicata proprio a voi.
      </p>

      <TavoliList tavoli={tavoli} />

      <p
        className="center"
        style={{ marginTop: '2rem', fontSize: '0.92rem', color: 'var(--ink-soft)' }}
      >
        {tavoli.length} tavoli, {tavoli.length} molecole, una sola grande famiglia.
      </p>
    </>
  );
}

type Left = { giorni: number; ore: number; minuti: number };

function timeLeft(): Left | null {
  const ms = REVEAL_AT.getTime() - Date.now();
  if (ms <= 0) return null;
  const minuti = Math.floor(ms / 60000);
  return { giorni: Math.floor(minuti / 1440), ore: Math.floor((minuti % 1440) / 60), minuti: minuti % 60 };
}

function plural(n: number, uno: string, molti: string) {
  return `${n} ${n === 1 ? uno : molti}`;
}

function Countdown() {
  const [left, setLeft] = useState<Left | null>(timeLeft);

  useEffect(() => {
    const id = setInterval(() => setLeft(timeLeft()), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="card tavoli-attesa">
      <Molecule shape="elica" seed="attesa" className="tavoli-attesa-glyph" />

      <p className="script tavoli-attesa-title">Ancora un po&apos; di pazienza</p>

      <p>
        I tavoli sono una sorpresa: sveliamo le molecole {REVEAL_LABEL}, alla vigilia della festa.
      </p>

      {left && (
        <p className="tavoli-attesa-count">
          {left.giorni > 0 && <>{plural(left.giorni, 'giorno', 'giorni')}, </>}
          {plural(left.ore, 'ora', 'ore')} e {plural(left.minuti, 'minuto', 'minuti')}
        </p>
      )}

      <Link href="/galleria" className="btn ghost" style={{ marginTop: '0.4rem' }}>
        Intanto sfoglia l&apos;album
      </Link>
    </div>
  );
}
