# Matrimonio Elena & Tommaso — PWA condivisione foto

PWA in Next.js + Supabase per il matrimonio del 19 settembre 2026 (Parco di Montebello).
Gli ospiti inquadrano il QR code sui tavoli, installano la web-app e condividono foto e video.

## Pagine

| Rotta | Descrizione |
|---|---|
| `/` | Home con i nomi degli sposi, data e pulsanti principali |
| `/carica` | Caricamento foto/video (nome ospite + dedica facoltativa) |
| `/galleria` | Galleria a mosaico con lightbox e aggiornamento in tempo reale |
| `/qr` | QR code del sito, da stampare per i cartoncini dei tavoli |
| `/admin` | Area riservata (link discreto in fondo alla home): login con la sola email admin, gestione ed eliminazione delle foto |

## Setup

1. **Dipendenze**: `npm install`
2. **Chiave Supabase**: in `.env.local` inserire la chiave *anon/publishable* del progetto
   `rmziigjviufyrmkcnmmj` (Dashboard → Project Settings → API Keys):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://rmziigjviufyrmkcnmmj.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
   ```

3. **Database**: applicare la migrazione [supabase/migrations/001_init.sql](supabase/migrations/001_init.sql)
   (via MCP, SQL Editor della dashboard, oppure `supabase db push`). Crea:
   - tabella `public.media` con RLS (lettura e inserimento pubblici, niente modifica/cancellazione)
   - bucket storage pubblico `wedding-media` (limite 200 MB/file, solo immagini e video)
   - pubblicazione realtime sulla tabella `media`
4. **Icone PWA**: `npm run icons` (già generate in `public/icons/`)
5. **Sviluppo**: `npm run dev` — **Produzione**: `npm run build && npm start`

## Deploy

Pensata per Vercel: importare la cartella, impostare le due variabili d'ambiente e pubblicare.
Il QR in `/qr` usa automaticamente il dominio di produzione.

## Grafica coordinata

Palette e tipografia riprendono gli inviti: corsivo calligrafico (Great Vibes) verde salvia,
serif (Cormorant Garamond), rose rosa cipria ad acquerello su fondo bianco caldo.
