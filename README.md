# Matrimonio Elena & Tommaso — PWA condivisione foto

PWA in Next.js + Supabase per il matrimonio del 19 settembre 2026 (Parco di Montebello).
Gli ospiti inquadrano il QR code sui tavoli, installano la web-app e condividono foto e video.

## Pagine

| Rotta | Descrizione |
|---|---|
| `/` | Home con i nomi degli sposi, data e pulsanti principali |
| `/intolleranze` | Modulo intolleranze e preferenze alimentari, una scheda per persona (si compila anche per tutta la famiglia) |
| `/carica` | Caricamento foto/video (nome ospite + dedica facoltativa) |
| `/galleria` | Galleria a mosaico con lightbox e aggiornamento in tempo reale |
| `/qr` | QR code del sito, da stampare per i cartoncini dei tavoli |
| `/admin` | Area riservata (link discreto in fondo alla home): login con la sola email admin, gestione delle foto e risposte del modulo intolleranze con export CSV |

## Modulo intolleranze

Pensato per la fase che precede il matrimonio: l'app si manda in anticipo agli invitati
e ognuno segnala per sé e per chi viene con lui. Dettagli:

- una riga per persona nella tabella `diet_entries`; le persone inviate insieme condividono `submission_id`
- reinviando il modulo dallo stesso dispositivo la nuova risposta **sostituisce** la precedente
  (`replaces_submission_id`): gli anonimi non possono modificare né cancellare
- le risposte sono leggibili solo dall'email admin (contengono allergie e contatti);
  in `/admin` → *A tavola* ci sono il riepilogo per il catering e l'export CSV
- la scadenza mostrata agli ospiti è la costante `DEADLINE` in [lib/diet.ts](lib/diet.ts)

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

   Poi [002_admin.sql](supabase/migrations/002_admin.sql) (permessi di cancellazione admin) e
   [003_intolleranze.sql](supabase/migrations/003_intolleranze.sql) (tabella `diet_entries`:
   invio pubblico, lettura e cancellazione riservate all'admin) e
   [004_intolleranze_opzioni.sql](supabase/migrations/004_intolleranze_opzioni.sql)
   (alza il tetto di voci selezionabili per riga).
   Le migrazioni si applicano anche con
   `SUPABASE_DB_PASSWORD=… node scripts/apply-migration.mjs supabase/migrations/003_intolleranze.sql`.
4. **Icone PWA**: `npm run icons` (già generate in `public/icons/`)
5. **Sviluppo**: `npm run dev` — **Produzione**: `npm run build && npm start`

## Deploy

Pensata per Vercel: importare la cartella, impostare le due variabili d'ambiente e pubblicare.
Il QR in `/qr` usa automaticamente il dominio di produzione.

## Foto degli sposi in galleria

Chi apre il sito prima del matrimonio trova già qualcosa da guardare: le foto di Elena e Tommaso
stanno in [public/foto-sposi/](public/foto-sposi) e sono servite dal sito, non dal bucket. In
`media` hanno un `storage_path` assoluto (`/foto-sposi/…`): `publicUrl()` riconosce la barra
iniziale e lo usa così com'è invece di comporre l'URL dello storage.

Per questo la galleria si popola con delle semplici insert, senza caricare file:
[supabase/migrations/005_foto_sposi.sql](supabase/migrations/005_foto_sposi.sql) toglie i
segnaposto di sviluppo (path `demo-*`, creati da `scripts/seed-demo.mjs`) e inserisce le foto. Si
incolla nell'SQL Editor di Supabase — comodo anche dal telefono — e si può rilanciare quante volte
si vuole. **Prima** va pubblicata la versione del sito che contiene le immagini,
**poi** si lancia lo script: al contrario la galleria mostrerebbe riquadri rotti.

Ordine e didascalie si cambiano nell'elenco dentro quel file. Per togliere le foto in seguito basta
l'area `/admin`, scheda **Media**: la riga sparisce dalla galleria e il file resta nel sito.

## Grafica coordinata

Palette e tipografia riprendono gli inviti: corsivo calligrafico (Great Vibes) verde salvia,
serif (Cormorant Garamond), rose rosa cipria ad acquerello su fondo bianco caldo.
