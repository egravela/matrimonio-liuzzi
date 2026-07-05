'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import Floral from '@/components/Floral';
import { BUCKET, publicUrl, supabase, type MediaRow } from '@/lib/supabase';

const ADMIN_EMAIL = 'egravela@latraccia.it';

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    // onAuthStateChange emette subito INITIAL_SESSION: niente getSession(),
    // che in alcune versioni si blocca sul lock condiviso tra schede
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setAuthReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL;

  return (
    <main className="page">
      <Floral className="floral top-left" />
      <div className="content">
        <h1 className="script page-title" style={{ marginTop: '3.2rem' }}>
          Area riservata
        </h1>

        {!authReady ? null : !session ? (
          <AdminLogin />
        ) : !isAdmin ? (
          <div className="card center" style={{ marginTop: '1.4rem' }}>
            <p>Questo account non è autorizzato.</p>
            <button className="btn ghost" style={{ marginTop: '1rem' }} onClick={() => supabase.auth.signOut()}>
              Esci
            </button>
          </div>
        ) : (
          <AdminManager onLogout={() => supabase.auth.signOut()} />
        )}
      </div>
    </main>
  );
}

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Errore di accesso');

      const { error: vErr } = await supabase.auth.verifyOtp({
        type: 'email',
        token_hash: data.token_hash,
      });
      if (vErr) throw new Error(vErr.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore imprevisto');
      setBusy(false);
    }
  }

  return (
    <form className="card" style={{ marginTop: '1.4rem' }} onSubmit={login}>
      <p className="center" style={{ marginBottom: '1rem', color: 'var(--ink-soft)' }}>
        Accesso riservato agli sposi
      </p>
      <label className="field">
        <span className="eyebrow">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="la tua email"
          autoComplete="email"
          required
          disabled={busy}
        />
      </label>
      {error && <div className="notice err">{error}</div>}
      <button className="btn" style={{ width: '100%' }} disabled={busy || !email.trim()}>
        {busy ? 'Accesso…' : 'Accedi'}
      </button>
    </form>
  );
}

function AdminManager({ onLogout }: { onLogout: () => void }) {
  const [items, setItems] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setNotice(`Errore di caricamento: ${error.message}`);
    else setItems(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function removeSelected() {
    const targets = items.filter((i) => selected.has(i.id));
    if (targets.length === 0) return;
    if (!window.confirm(`Eliminare definitivamente ${targets.length} ${targets.length === 1 ? 'elemento' : 'elementi'}?`)) {
      return;
    }

    setBusy(true);
    setNotice(null);
    let removed = 0;
    const errors: string[] = [];

    for (const item of targets) {
      const { error: dbErr } = await supabase.from('media').delete().eq('id', item.id);
      if (dbErr) {
        errors.push(dbErr.message);
        continue;
      }
      const { error: stErr } = await supabase.storage.from(BUCKET).remove([item.storage_path]);
      if (stErr) errors.push(`file ${item.storage_path}: ${stErr.message}`);
      removed += 1;
      setItems((prev) => prev.filter((p) => p.id !== item.id));
    }

    setSelected(new Set());
    setBusy(false);
    setNotice(
      errors.length === 0
        ? `${removed} ${removed === 1 ? 'elemento eliminato' : 'elementi eliminati'}.`
        : `${removed} eliminati, con errori: ${errors.join('; ')}`,
    );
  }

  return (
    <>
      <div className="admin-bar">
        <span style={{ fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
          {items.length} {items.length === 1 ? 'ricordo' : 'ricordi'}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {selected.size > 0 && (
            <button className="btn ghost admin-mini" onClick={() => setSelected(new Set())} disabled={busy}>
              Annulla
            </button>
          )}
          <button
            className="btn ghost admin-mini"
            onClick={() =>
              setSelected(selected.size === items.length ? new Set() : new Set(items.map((i) => i.id)))
            }
            disabled={busy || items.length === 0}
          >
            {selected.size === items.length && items.length > 0 ? 'Deseleziona' : 'Seleziona tutto'}
          </button>
          <button className="btn ghost admin-mini" onClick={onLogout} disabled={busy}>
            Esci
          </button>
        </div>
      </div>

      {notice && <div className="notice ok">{notice}</div>}

      {loading ? (
        <p className="center" style={{ marginTop: '2rem', color: 'var(--ink-soft)' }}>
          Caricamento…
        </p>
      ) : items.length === 0 ? (
        <p className="center" style={{ marginTop: '2rem', color: 'var(--ink-soft)' }}>
          Nessun ricordo caricato.
        </p>
      ) : (
        <div className="admin-grid">
          {items.map((item) => {
            const isSel = selected.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                className={`admin-cell${isSel ? ' selected' : ''}`}
                onClick={() => toggle(item.id)}
                aria-pressed={isSel}
                disabled={busy}
              >
                {item.media_type === 'video' ? (
                  <video src={publicUrl(item.storage_path)} preload="metadata" muted playsInline />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={publicUrl(item.storage_path)} alt={item.caption ?? item.guest_name} loading="lazy" />
                )}
                <span className="admin-cell-name">{item.guest_name}</span>
                <span className="admin-check" aria-hidden="true">
                  {isSel ? '✓' : ''}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {selected.size > 0 && (
        <div className="admin-actionbar">
          <span>
            {selected.size} {selected.size === 1 ? 'selezionato' : 'selezionati'}
          </span>
          <button className="btn danger" onClick={removeSelected} disabled={busy}>
            {busy ? 'Eliminazione…' : 'Elimina'}
          </button>
        </div>
      )}
    </>
  );
}
