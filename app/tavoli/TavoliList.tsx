'use client';

import { useEffect, useRef, useState } from 'react';
import Molecule from '@/components/Molecule';
import type { Tavolo } from '@/lib/tavoli';

// Schede espandibili, una per tavolo. Il tavolo aperto finisce nell'ancora
// dell'URL (`/tavoli#ossitocina`): così un link o un QR possono portare
// dritti alla molecola giusta, e aprendo la pagina da quell'indirizzo la
// scheda è già aperta e a schermo.
export default function TavoliList({ tavoli }: { tavoli: Tavolo[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const cards = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    function applyHash() {
      const slug = decodeURIComponent(window.location.hash.slice(1));
      if (!slug || !tavoli.some((t) => t.slug === slug)) return;
      setOpen(slug);
      // dopo il primo paint, quando la scheda espansa ha la sua altezza
      requestAnimationFrame(() => {
        cards.current.get(slug)?.scrollIntoView({ block: 'center' });
      });
    }
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, [tavoli]);

  function show(slug: string, scroll: boolean) {
    setOpen(slug);
    history.replaceState(null, '', `#${slug}`);
    if (scroll) {
      // aspetta l'espansione prima di centrare la scheda
      setTimeout(() => {
        cards.current.get(slug)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 60);
    }
  }

  function toggle(slug: string) {
    if (open === slug) {
      setOpen(null);
      history.replaceState(null, '', window.location.pathname);
    } else {
      show(slug, false);
    }
  }

  return (
    <>
      <div className="tavoli-finder">
        <span className="eyebrow">Trova il tuo tavolo</span>
        <div className="chip-scroll" role="list">
          {tavoli.map((t) => (
            <button
              key={t.slug}
              type="button"
              role="listitem"
              className={`chip${open === t.slug ? ' on' : ''}`}
              onClick={() => show(t.slug, true)}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="tavoli-grid">
        {tavoli.map((t, i) => {
          const isOpen = open === t.slug;
          return (
            <article
              key={t.slug}
              id={t.slug}
              ref={(el) => {
                if (el) cards.current.set(t.slug, el);
                else cards.current.delete(t.slug);
              }}
              className={`card tavolo${isOpen ? ' open' : ''}`}
              style={{ animationDelay: `${Math.min(i * 45, 500)}ms` }}
            >
              <button
                type="button"
                className="tavolo-head"
                aria-expanded={isOpen}
                aria-controls={`${t.slug}-body`}
                onClick={() => toggle(t.slug)}
              >
                <Molecule shape={t.shape} seed={t.slug} className="tavolo-glyph" />
                <span className="tavolo-title">
                  <span className="tavolo-name">{t.name}</span>
                  <span className="tavolo-kind">
                    {t.kind}
                    {t.formula && <em> · {t.formula}</em>}
                  </span>
                </span>
                <svg
                  className="tavolo-chevron"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="tavolo-body" id={`${t.slug}-body`} aria-hidden={!isOpen}>
                <div>
                  <p className="tavolo-science">{t.science}</p>
                  <p className="tavolo-dedication">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 21s-7.5-4.8-9.8-9C.7 9 2 5.6 5.2 5c2-.4 3.9.6 4.8 2.3h4c.9-1.7 2.8-2.7 4.8-2.3 3.2.6 4.5 4 3 7-2.3 4.2-9.8 9-9.8 9z" />
                    </svg>
                    {t.dedication}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
