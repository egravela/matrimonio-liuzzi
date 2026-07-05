'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Floral from '@/components/Floral';
import { publicUrl, supabase, type MediaRow } from '@/lib/supabase';
import { downloadUrl, shareMedia } from '@/lib/share';

const PAGE_SIZE = 40;

const shareIcon = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 14V4m0 0L8.5 7.5M12 4l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 12v6.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V12" strokeLinecap="round" />
  </svg>
);

function GalleryItem({
  item,
  index,
  onClick,
  onShare,
}: {
  item: MediaRow;
  index: number;
  onClick: () => void;
  onShare: () => void;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <figure
      className="masonry-item"
      onClick={onClick}
      style={{ cursor: 'pointer', animationDelay: `${Math.min(index * 55, 550)}ms` }}
    >
      <div className={`media-frame${loaded ? ' loaded' : ''}`}>
        {item.media_type === 'video' ? (
          <video
            src={publicUrl(item.storage_path)}
            preload="metadata"
            muted
            playsInline
            onLoadedData={() => setLoaded(true)}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={publicUrl(item.storage_path)}
            alt={item.caption ?? 'Foto del matrimonio'}
            loading="lazy"
            onLoad={() => setLoaded(true)}
          />
        )}
        <button
          type="button"
          className="share-btn"
          aria-label="Condividi questa foto"
          onClick={(e) => {
            e.stopPropagation();
            onShare();
          }}
        >
          {shareIcon}
        </button>
      </div>
      <figcaption className="media-caption">
        <strong>{item.guest_name}</strong>
        {item.caption}
      </figcaption>
    </figure>
  );
}

export default function GalleriaPage() {
  const [items, setItems] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MediaRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

  async function handleShare(item: MediaRow) {
    const outcome = await shareMedia(item);
    if (outcome === 'copied') showToast('Link della foto copiato negli appunti');
    if (outcome === 'failed') showToast('Condivisione non riuscita, riprova');
  }

  const load = useCallback(async (offset: number) => {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      setError(error.message);
    } else if (data) {
      setItems((prev) => (offset === 0 ? data : [...prev, ...data]));
      setHasMore(data.length === PAGE_SIZE);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load(0);

    // aggiornamento in tempo reale quando altri ospiti caricano
    const channel = supabase
      .channel('media-inserts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'media' },
        (payload) => {
          const row = payload.new as MediaRow;
          setItems((prev) => (prev.some((p) => p.id === row.id) ? prev : [row, ...prev]));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  return (
    <main className="page" style={{ maxWidth: 860 }}>
      <Floral className="floral top-left" />

      <div className="content">
        <h1 className="script page-title" style={{ marginTop: '3.2rem' }}>
          La nostra galleria
        </h1>
        <p className="center" style={{ margin: '0.6rem 0 1.6rem', color: 'var(--ink-soft)' }}>
          I ricordi condivisi da tutti voi
        </p>

        {error && <div className="notice err">Impossibile caricare la galleria: {error}</div>}

        {loading && (
          <p className="center" style={{ marginTop: '3rem', color: 'var(--ink-soft)' }}>
            Un attimo, stiamo raccogliendo i ricordi…
          </p>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="center" style={{ marginTop: '2.5rem' }}>
            <p style={{ marginBottom: '1.2rem' }}>
              La galleria è ancora vuota: sii tu il primo a condividere un ricordo!
            </p>
            <Link href="/carica" className="btn">
              Carica una foto
            </Link>
          </div>
        )}

        <div className="masonry">
          {items.map((item, i) => (
            <GalleryItem
              key={item.id}
              item={item}
              index={i}
              onClick={() => setSelected(item)}
              onShare={() => handleShare(item)}
            />
          ))}
        </div>

        {hasMore && !loading && (
          <div className="center" style={{ marginTop: '1.4rem' }}>
            <button className="btn ghost" onClick={() => load(items.length)}>
              Mostra altri
            </button>
          </div>
        )}
      </div>

      {selected && (
        <div className="lightbox" onClick={() => setSelected(null)}>
          <button className="close" aria-label="Chiudi">
            ×
          </button>
          {selected.media_type === 'video' ? (
            <video
              src={publicUrl(selected.storage_path)}
              controls
              autoPlay
              playsInline
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={publicUrl(selected.storage_path)}
              alt={selected.caption ?? 'Foto del matrimonio'}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <p className="who">
            {selected.guest_name}
            {selected.caption ? ` — ${selected.caption}` : ''}
          </p>
          <div className="lightbox-actions" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="btn" onClick={() => handleShare(selected)}>
              {shareIcon}
              Condividi
            </button>
            <a className="btn ghost light" href={downloadUrl(selected)} download>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 4v10m0 0 3.5-3.5M12 14 8.5 10.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 16v2.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V16" strokeLinecap="round" />
              </svg>
              Scarica
            </a>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
