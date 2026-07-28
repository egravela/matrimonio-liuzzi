'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { RESTRICTIONS, labelFor, type DietEntry } from '@/lib/diet';
import { supabase } from '@/lib/supabase';

type Submission = {
  id: string;
  createdAt: string;
  contact: string | null;
  people: DietEntry[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export default function DietManager() {
  const [rows, setRows] = useState<DietEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('diet_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .order('sort_order', { ascending: true });
    if (err) setError(`Errore di caricamento: ${err.message}`);
    else {
      setError(null);
      setRows((data ?? []) as DietEntry[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Chi reinvia il modulo crea una nuova risposta che annulla la precedente:
  // qui restano visibili solo le versioni più recenti.
  const submissions = useMemo<Submission[]>(() => {
    const superseded = new Set(
      rows.map((r) => r.replaces_submission_id).filter((id): id is string => Boolean(id)),
    );
    const grouped = new Map<string, Submission>();
    for (const row of rows) {
      if (superseded.has(row.submission_id)) continue;
      const current = grouped.get(row.submission_id);
      if (current) current.people.push(row);
      else {
        grouped.set(row.submission_id, {
          id: row.submission_id,
          createdAt: row.created_at,
          contact: row.contact,
          people: [row],
        });
      }
    }
    for (const s of grouped.values()) s.people.sort((a, b) => a.sort_order - b.sort_order);
    return [...grouped.values()];
  }, [rows]);

  const people = useMemo(() => submissions.flatMap((s) => s.people), [submissions]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of people) {
      for (const r of p.restrictions) map.set(r, (map.get(r) ?? 0) + 1);
      if (p.restrictions.length === 0 && p.notes) map.set('altro', (map.get('altro') ?? 0) + 1);
    }
    return RESTRICTIONS.map((r) => ({ ...r, count: map.get(r.key) ?? 0 })).filter(
      (r) => r.count > 0,
    );
  }, [people]);

  async function removeSubmission(id: string) {
    const target = submissions.find((s) => s.id === id);
    if (!target) return;
    const who = target.people.map((p) => p.full_name).join(', ');
    if (!window.confirm(`Eliminare la risposta di ${who}?`)) return;

    // elimina anche le versioni precedenti della stessa risposta,
    // altrimenti tornerebbero a galla come risposta valida
    const replaces = new Map(rows.map((r) => [r.submission_id, r.replaces_submission_id]));
    const chain: string[] = [];
    let cursor: string | null | undefined = id;
    while (cursor && !chain.includes(cursor)) {
      chain.push(cursor);
      cursor = replaces.get(cursor) ?? null;
    }

    setBusy(true);
    setNotice(null);
    const { error: delErr } = await supabase.from('diet_entries').delete().in('submission_id', chain);
    if (delErr) setError(`Errore durante l'eliminazione: ${delErr.message}`);
    else {
      setRows((prev) => prev.filter((r) => !chain.includes(r.submission_id)));
      setNotice('Risposta eliminata.');
    }
    setBusy(false);
  }

  function exportCsv() {
    const header = ['Nome', 'Intolleranze', 'Dettagli', 'Contatto', 'Inviato il'];
    const lines = people.map((p) =>
      [
        p.full_name,
        p.restrictions.map(labelFor).join(' · '),
        p.notes ?? '',
        p.contact ?? '',
        formatDate(p.created_at),
      ]
        .map(csvCell)
        .join(';'),
    );
    // BOM + punto e virgola: Excel italiano apre il file già incolonnato
    const csv = '﻿' + [header.map(csvCell).join(';'), ...lines].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'intolleranze-elena-tommaso.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <p className="center" style={{ marginTop: '2rem', color: 'var(--ink-soft)' }}>
        Caricamento…
      </p>
    );
  }

  return (
    <>
      <div className="admin-bar">
        <span style={{ fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
          {people.length} {people.length === 1 ? 'persona' : 'persone'} · {submissions.length}{' '}
          {submissions.length === 1 ? 'risposta' : 'risposte'}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn ghost admin-mini" onClick={load} disabled={busy}>
            Aggiorna
          </button>
          <button
            className="btn ghost admin-mini"
            onClick={exportCsv}
            disabled={busy || people.length === 0}
          >
            Esporta CSV
          </button>
        </div>
      </div>

      {error && <div className="notice err">{error}</div>}
      {notice && <div className="notice ok">{notice}</div>}

      {counts.length > 0 && (
        <div className="card" style={{ marginBottom: '1.1rem' }}>
          <span className="eyebrow">Riepilogo per il catering</span>
          <div className="chips readonly" style={{ marginTop: '0.6rem' }}>
            {counts.map((c) => (
              <span key={c.key} className="chip on">
                {c.label} · <strong>{c.count}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {submissions.length === 0 ? (
        <p className="center" style={{ marginTop: '2rem', color: 'var(--ink-soft)' }}>
          Nessuna risposta ricevuta.
        </p>
      ) : (
        submissions.map((s) => (
          <div className="card diet-card" key={s.id}>
            <div className="person-head">
              <span className="eyebrow">{formatDate(s.createdAt)}</span>
              <button
                type="button"
                className="link-btn danger-link"
                onClick={() => removeSubmission(s.id)}
                disabled={busy}
              >
                Elimina
              </button>
            </div>

            {s.people.map((p) => (
              <div key={p.id} className="recap-person">
                <strong>{p.full_name}</strong>
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

            {s.contact && (
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginTop: '0.7rem' }}>
                Contatto: {s.contact}
              </p>
            )}
          </div>
        ))
      )}
    </>
  );
}
