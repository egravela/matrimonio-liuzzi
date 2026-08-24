'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Floral from '@/components/Floral';
import { DEADLINE, DIET_TAGS, NEED_TAGS, NONE, isNeedTag, labelFor } from '@/lib/diet';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'diet_submission';
const MAX_PEOPLE = 12;

type Person = { key: string; name: string; restrictions: string[]; notes: string };

type Saved = {
  submissionId: string;
  savedAt: string;
  contact: string;
  people: { name: string; restrictions: string[]; notes: string }[];
};

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'err'; message: string };

let counter = 0;
function emptyPerson(name = ''): Person {
  counter += 1;
  return { key: `p${counter}`, name, restrictions: [], notes: '' };
}

function readSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Saved;
    return Array.isArray(parsed?.people) && parsed.people.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export default function IntolleranzePage() {
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [editing, setEditing] = useState(false);

  const [people, setPeople] = useState<Person[]>([emptyPerson()]);
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    const prev = readSaved();
    if (prev) {
      setSaved(prev);
      setPeople(prev.people.map((p) => ({ ...emptyPerson(), ...p })));
      setContact(prev.contact ?? '');
    } else {
      const guest = localStorage.getItem('guest_name');
      if (guest) setPeople([emptyPerson(guest)]);
    }
    setReady(true);
  }, []);

  function patch(key: string, change: Partial<Person>) {
    setPeople((prev) => prev.map((p) => (p.key === key ? { ...p, ...change } : p)));
  }

  function toggleTag(key: string, tag: string) {
    setPeople((prev) =>
      prev.map((p) => {
        if (p.key !== key) return p;
        // «Nessuna intolleranza» azzera solo la dieta: seggiolone e gravidanza
        // non sono intolleranze e restano selezionati.
        const needs = p.restrictions.filter(isNeedTag);
        if (tag === NONE) {
          return {
            ...p,
            restrictions: p.restrictions.includes(NONE) ? needs : [NONE, ...needs],
          };
        }
        const without = isNeedTag(tag)
          ? p.restrictions
          : p.restrictions.filter((r) => r !== NONE);
        return {
          ...p,
          restrictions: without.includes(tag)
            ? without.filter((r) => r !== tag)
            : [...without, tag],
        };
      }),
    );
  }

  const filled = people.map((p) => ({
    ...p,
    hasName: p.name.trim().length > 0,
    hasAnswer: p.restrictions.some((r) => !isNeedTag(r)) || p.notes.trim().length > 0,
  }));
  const valid = filled.every((p) => p.hasName && p.hasAnswer);

  async function send() {
    setShowErrors(true);
    if (!valid) return;

    setStatus({ kind: 'sending' });
    const submissionId = crypto.randomUUID();
    const cleanContact = contact.trim() || null;

    const rows = people.map((p, i) => ({
      submission_id: submissionId,
      replaces_submission_id: saved?.submissionId ?? null,
      sort_order: i,
      full_name: p.name.trim().slice(0, 80),
      restrictions: p.restrictions,
      notes: p.notes.trim().slice(0, 400) || null,
      contact: cleanContact,
    }));

    const { error } = await supabase.from('diet_entries').insert(rows);
    if (error) {
      setStatus({ kind: 'err', message: error.message });
      return;
    }

    const record: Saved = {
      submissionId,
      savedAt: new Date().toISOString(),
      contact: contact.trim(),
      people: rows.map((r) => ({
        name: r.full_name,
        restrictions: r.restrictions,
        notes: r.notes ?? '',
      })),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
      if (!localStorage.getItem('guest_name')) {
        localStorage.setItem('guest_name', rows[0].full_name);
      }
    } catch {
      // spazio esaurito o modalità privata: la risposta è comunque partita
    }

    setSaved(record);
    setEditing(false);
    setShowErrors(false);
    setStatus({ kind: 'idle' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (!ready) return <main className="page" />;

  const sending = status.kind === 'sending';

  return (
    <main className="page">
      <Floral className="floral top-left" />

      <div className="content">
        <h1 className="script page-title" style={{ marginTop: '3.2rem' }}>
          Il vostro posto a tavola
        </h1>

        {saved && !editing ? (
          <Recap saved={saved} onEdit={() => setEditing(true)} />
        ) : (
          <>
            <p className="center" style={{ margin: '0.6rem 0 1.6rem', color: 'var(--ink-soft)' }}>
              Segnalateci intolleranze, allergie e menù speciali: vogliamo che stiate bene a tavola.
              <br />
              <em>Vi chiediamo di rispondere entro il {DEADLINE}.</em>
            </p>

            {filled.map((p, i) => (
              <div className="card person-card" key={p.key}>
                <div className="person-head">
                  <span className="eyebrow">
                    {i === 0 ? 'La tua risposta' : `Persona ${i + 1}`}
                  </span>
                  {people.length > 1 && (
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => setPeople((prev) => prev.filter((x) => x.key !== p.key))}
                      disabled={sending}
                    >
                      Rimuovi
                    </button>
                  )}
                </div>

                <label className="field">
                  <span className="eyebrow">Nome e cognome</span>
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => patch(p.key, { name: e.target.value })}
                    placeholder="es. Carla Bianchi"
                    maxLength={80}
                    autoComplete={i === 0 ? 'name' : 'off'}
                    disabled={sending}
                  />
                </label>

                <span className="eyebrow">Intolleranze e preferenze</span>
                <div className="chips">
                  {DIET_TAGS.map((r) => (
                    <button
                      type="button"
                      key={r.key}
                      className={`chip${p.restrictions.includes(r.key) ? ' on' : ''}`}
                      aria-pressed={p.restrictions.includes(r.key)}
                      onClick={() => toggleTag(p.key, r.key)}
                      disabled={sending}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                <span className="eyebrow chips-group">Serve qualcosa al tavolo?</span>
                <div className="chips">
                  {NEED_TAGS.map((r) => (
                    <button
                      type="button"
                      key={r.key}
                      className={`chip${p.restrictions.includes(r.key) ? ' on' : ''}`}
                      aria-pressed={p.restrictions.includes(r.key)}
                      onClick={() => toggleTag(p.key, r.key)}
                      disabled={sending}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                <label className="field" style={{ marginTop: '1rem' }}>
                  <span className="eyebrow">Dettagli (facoltativo)</span>
                  <textarea
                    value={p.notes}
                    onChange={(e) => patch(p.key, { notes: e.target.value })}
                    placeholder="es. allergia alle arachidi, anche in tracce"
                    rows={2}
                    maxLength={400}
                    disabled={sending}
                  />
                </label>

                {showErrors && !p.hasName && (
                  <p className="field-error">Manca il nome.</p>
                )}
                {showErrors && p.hasName && !p.hasAnswer && (
                  <p className="field-error">
                    Scegli almeno una voce — se va bene tutto, tocca «Nessuna intolleranza».
                  </p>
                )}
              </div>
            ))}

            {people.length < MAX_PEOPLE && (
              <button
                type="button"
                className="btn ghost add-person"
                onClick={() => setPeople((prev) => [...prev, emptyPerson()])}
                disabled={sending}
              >
                + Aggiungi una persona
              </button>
            )}

            <div className="card" style={{ marginTop: '1.1rem' }}>
              <label className="field" style={{ marginBottom: 0 }}>
                <span className="eyebrow">Email o telefono (facoltativo)</span>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="se dovessimo chiedervi un dettaglio"
                  maxLength={120}
                  disabled={sending}
                />
              </label>
            </div>

            {status.kind === 'err' && (
              <div className="notice err">
                Non siamo riusciti a inviare: {status.message}. Riprova tra un momento.
              </div>
            )}

            <button
              className="btn"
              style={{ width: '100%', marginTop: '1.2rem' }}
              onClick={send}
              disabled={sending}
            >
              {sending ? (
                <>
                  <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M12 3a9 9 0 1 0 9 9" strokeLinecap="round" />
                  </svg>
                  Invio…
                </>
              ) : saved ? (
                'Aggiorna le risposte'
              ) : (
                'Invia'
              )}
            </button>

            {saved && (
              <button
                type="button"
                className="link-btn center-block"
                onClick={() => {
                  setEditing(false);
                  setShowErrors(false);
                  setPeople(saved.people.map((p) => ({ ...emptyPerson(), ...p })));
                  setContact(saved.contact ?? '');
                }}
                disabled={sending}
              >
                Annulla le modifiche
              </button>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function Recap({ saved, onEdit }: { saved: Saved; onEdit: () => void }) {
  const when = new Date(saved.savedAt).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <div className="notice ok" style={{ marginTop: '1.2rem' }}>
        Grazie! Abbiamo ricevuto le vostre indicazioni il {when}.
      </div>

      <div className="card">
        {saved.people.map((p, i) => (
          <div key={i} className="recap-person">
            <strong>{p.name}</strong>
            <div className="chips readonly">
              {p.restrictions.length === 0 ? (
                <span className="chip on">Nessuna intolleranza</span>
              ) : (
                p.restrictions.map((r) => (
                  <span key={r} className="chip on">
                    {labelFor(r)}
                  </span>
                ))
              )}
            </div>
            {p.notes && <p className="recap-notes">{p.notes}</p>}
          </div>
        ))}

        {saved.contact && (
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', marginTop: '0.8rem' }}>
            Contatto lasciato: {saved.contact}
          </p>
        )}

        <button type="button" className="btn ghost" style={{ width: '100%', marginTop: '1.2rem' }} onClick={onEdit}>
          Modifica
        </button>
      </div>

      <p className="center" style={{ marginTop: '1.6rem', color: 'var(--ink-soft)' }}>
        Ci vediamo il 19 settembre. Nel frattempo, se volete,{' '}
        <Link href="/galleria" style={{ textDecoration: 'underline' }}>
          date un&apos;occhiata all&apos;album
        </Link>
        .
      </p>
    </>
  );
}
