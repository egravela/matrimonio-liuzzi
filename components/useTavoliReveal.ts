'use client';

import { useEffect, useState } from 'react';
import { REVEAL_AT } from '@/lib/tavoli';

/** Tre stati: non lo sappiamo ancora, i tavoli sono chiusi, i tavoli sono aperti. */
export type Reveal = 'attesa' | 'chiuso' | 'aperto';

const DAY = 24 * 60 * 60 * 1000;

/**
 * Le pagine sono generate in fase di build, quindi l'orario lo può sapere solo
 * il browser: il primo render dice «attesa» (uguale per server e client, niente
 * disallineamento) e subito dopo l'effetto decide. Se l'apertura è vicina
 * programmiamo il passaggio, così chi tiene l'app aperta vede comparire i
 * tavoli senza ricaricare.
 *
 * Con `anteprima` la barriera si salta: serve agli sposi per controllare la
 * pagina prima della festa.
 */
export function useTavoliReveal(anteprima = false): Reveal {
  const [reveal, setReveal] = useState<Reveal>('attesa');

  useEffect(() => {
    if (anteprima) {
      setReveal('aperto');
      return;
    }

    const remaining = REVEAL_AT.getTime() - Date.now();
    if (remaining <= 0) {
      setReveal('aperto');
      return;
    }

    setReveal('chiuso');
    if (remaining > DAY) return;

    const id = setTimeout(() => setReveal('aperto'), remaining + 500);
    return () => clearTimeout(id);
  }, [anteprima]);

  return reveal;
}

/** `?anteprima` nell'indirizzo: letto dopo il mount, senza useSearchParams. */
export function useAnteprima() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(new URLSearchParams(window.location.search).has('anteprima'));
  }, []);

  return on;
}
