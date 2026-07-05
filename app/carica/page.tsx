'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Floral from '@/components/Floral';
import { BUCKET, supabase } from '@/lib/supabase';

const MAX_FILE_MB = 200;
const PARALLEL_UPLOADS = 3;

type Picked = { file: File; url: string; key: string };

type Status =
  | { kind: 'idle' }
  | { kind: 'uploading'; done: number; total: number }
  | { kind: 'ok'; count: number }
  | { kind: 'err'; message: string };

function extension(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  return file.type.split('/')[1] ?? 'bin';
}

export default function CaricaPage() {
  const [guestName, setGuestName] = useState('');
  const [caption, setCaption] = useState('');
  const [picked, setPicked] = useState<Picked[]>([]);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('guest_name');
    if (saved) setGuestName(saved);
  }, []);

  // libera gli object URL delle anteprime quando la pagina viene chiusa
  useEffect(() => {
    return () => picked.forEach((p) => URL.revokeObjectURL(p.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onPick(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list).filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/'),
    );
    const tooBig = incoming.find((f) => f.size > MAX_FILE_MB * 1024 * 1024);
    if (tooBig) {
      setStatus({
        kind: 'err',
        message: `"${tooBig.name}" supera il limite di ${MAX_FILE_MB} MB per file.`,
      });
      return;
    }

    // si accumulano con le selezioni precedenti, senza duplicati
    setPicked((prev) => {
      const seen = new Set(prev.map((p) => p.key));
      const fresh = incoming
        .map((file) => ({
          file,
          url: URL.createObjectURL(file),
          key: `${file.name}-${file.size}-${file.lastModified}`,
        }))
        .filter((p) => {
          if (seen.has(p.key)) {
            URL.revokeObjectURL(p.url);
            return false;
          }
          return true;
        });
      return [...prev, ...fresh];
    });
    setStatus({ kind: 'idle' });
    if (inputRef.current) inputRef.current.value = '';
  }

  function removeOne(key: string) {
    setPicked((prev) => {
      const target = prev.find((p) => p.key === key);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.key !== key);
    });
  }

  async function upload() {
    const name = guestName.trim();
    if (picked.length === 0 || !name) return;
    localStorage.setItem('guest_name', name);

    const total = picked.length;
    let done = 0;
    const failed: string[] = [];
    setStatus({ kind: 'uploading', done: 0, total });

    const queue = [...picked];
    const uploaded = new Set<string>();

    async function worker() {
      for (let item = queue.shift(); item; item = queue.shift()) {
        const { file, key } = item;
        try {
          const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension(file)}`;

          const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
            contentType: file.type,
            cacheControl: '31536000',
          });
          if (upErr) throw new Error(upErr.message);

          const { error: dbErr } = await supabase.from('media').insert({
            guest_name: name,
            caption: caption.trim() || null,
            storage_path: path,
            media_type: file.type.startsWith('video/') ? 'video' : 'image',
          });
          if (dbErr) throw new Error(dbErr.message);

          uploaded.add(key);
        } catch (e) {
          failed.push(`${file.name}: ${e instanceof Error ? e.message : 'errore imprevisto'}`);
        } finally {
          done += 1;
          setStatus({ kind: 'uploading', done, total });
        }
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(PARALLEL_UPLOADS, total) }, () => worker()),
    );

    // rimuove dalla selezione solo i file caricati; i falliti restano per riprovare
    setPicked((prev) => {
      prev.filter((p) => uploaded.has(p.key)).forEach((p) => URL.revokeObjectURL(p.url));
      return prev.filter((p) => !uploaded.has(p.key));
    });

    if (failed.length === 0) {
      setCaption('');
      setStatus({ kind: 'ok', count: uploaded.size });
    } else {
      setStatus({
        kind: 'err',
        message:
          `${uploaded.size} su ${total} caricati. Non riusciti: ${failed.join('; ')}. ` +
          'I file rimasti sono ancora selezionati: premi Carica per riprovare.',
      });
    }
  }

  const uploading = status.kind === 'uploading';

  return (
    <main className="page">
      <Floral className="floral top-left" />

      <div className="content">
        <h1 className="script page-title" style={{ marginTop: '3.2rem' }}>
          Condividi un ricordo
        </h1>
        <p className="center" style={{ margin: '0.6rem 0 1.6rem', color: 'var(--ink-soft)' }}>
          Le tue foto e i tuoi video entreranno nell&apos;album degli sposi
        </p>

        <div className="card">
          <label className="field">
            <span className="eyebrow">Il tuo nome (obbligatorio)</span>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="es. Zia Carla"
              maxLength={60}
              required
              disabled={uploading}
            />
          </label>

          <label className="field">
            <span className="eyebrow">Dedica o didascalia (facoltativa)</span>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Un pensiero per Elena e Tommaso…"
              rows={2}
              maxLength={280}
              disabled={uploading}
            />
          </label>

          <div
            className="dropzone"
            role="button"
            tabIndex={0}
            onClick={() => !uploading && inputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && !uploading && inputRef.current?.click()}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="3.5" y="6" width="17" height="13" rx="2.5" />
              <circle cx="12" cy="12.5" r="3.2" />
              <path d="M8 6l1.2-2h5.6L16 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {picked.length === 0 ? (
              <>
                <strong>Scegli una o più foto e video</strong>
                <span style={{ fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
                  tieni premuto per selezionarne tanti insieme · max {MAX_FILE_MB} MB a file
                </span>
              </>
            ) : (
              <>
                <strong>
                  {picked.length} {picked.length === 1 ? 'file selezionato' : 'file selezionati'}
                </strong>
                <span style={{ fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
                  tocca per aggiungerne altri
                </span>
              </>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            hidden
            onChange={(e) => onPick(e.target.files)}
          />

          {picked.length > 0 && (
            <div className="thumbs">
              {picked.map((p) => (
                <div key={p.key} className="thumb">
                  {p.file.type.startsWith('video/') ? (
                    <video src={p.url} muted preload="metadata" playsInline />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.url} alt={p.file.name} />
                  )}
                  {!uploading && (
                    <button
                      type="button"
                      aria-label={`Rimuovi ${p.file.name}`}
                      onClick={() => removeOne(p.key)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {status.kind === 'uploading' && (
            <div style={{ margin: '1rem 0' }}>
              <div className="progress">
                <div style={{ width: `${(status.done / status.total) * 100}%` }} />
              </div>
              <p className="center" style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                Caricati {status.done} di {status.total}…
              </p>
            </div>
          )}

          {status.kind === 'ok' && (
            <div className="notice ok">
              Grazie di cuore! {status.count === 1 ? 'Il tuo ricordo è stato caricato' : `${status.count} ricordi caricati`}.{' '}
              <Link href="/galleria" style={{ textDecoration: 'underline' }}>
                Guarda la galleria
              </Link>
            </div>
          )}

          {status.kind === 'err' && <div className="notice err">{status.message}</div>}

          {picked.length > 0 && !guestName.trim() && (
            <p className="center" style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', marginTop: '0.8rem' }}>
              Scrivi il tuo nome per poter caricare: gli sposi vogliono sapere chi ringraziare!
            </p>
          )}

          <button
            className="btn"
            style={{ width: '100%', marginTop: '0.6rem' }}
            onClick={upload}
            disabled={picked.length === 0 || !guestName.trim() || uploading}
          >
            {uploading ? (
              <>
                <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M12 3a9 9 0 1 0 9 9" strokeLinecap="round" />
                </svg>
                Caricamento…
              </>
            ) : picked.length > 1 ? (
              `Carica ${picked.length} file`
            ) : (
              'Carica'
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
