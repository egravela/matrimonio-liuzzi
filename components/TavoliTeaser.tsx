'use client';

import Link from 'next/link';
import Molecule from '@/components/Molecule';
import { useTavoliReveal } from '@/components/useTavoliReveal';

// Richiamo ai tavoli nella home: compare solo a sorpresa svelata. Porta con sé
// il divisore che lo precede, altrimenti quando è nascosto ne resterebbero due
// appaiati.
export default function TavoliTeaser() {
  const reveal = useTavoliReveal();
  if (reveal !== 'aperto') return null;

  return (
    <>
      <div className="divider" />

      <Link href="/tavoli" className="tavoli-teaser">
        <Molecule shape="anello" seed="home" className="tavoli-teaser-glyph" />
        <span>
          <span className="eyebrow">Il giorno della festa</span>
          <span className="script tavoli-teaser-title">Una molecola per ogni tavolo</span>
          <span className="tavoli-teaser-text">
            Niente numeri sui tavoli: ogni tavolo ha il nome di una molecola scelta per chi ci
            siede. Scoprite la vostra.
          </span>
        </span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </>
  );
}
