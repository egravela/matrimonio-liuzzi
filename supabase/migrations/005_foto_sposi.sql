-- Matrimonio Elena & Tommaso — foto degli sposi in galleria
--
-- Dati, non schema: toglie i segnaposto di sviluppo (path "demo-*") e mette in
-- galleria le foto degli sposi. I file non stanno nel bucket ma nel sito, in
-- public/foto-sposi/, e in media hanno un path assoluto: per questo bastano
-- delle insert e lo si può incollare nell'SQL Editor di Supabase.
--
-- ATTENZIONE ALL'ORDINE: prima va pubblicata la versione del sito che contiene
-- le immagini, poi si lancia questo script. Al contrario, per qualche minuto la
-- galleria mostrerebbe riquadri rotti.
--
-- Si può rilanciare quante volte si vuole: ripulisce le proprie righe prima di
-- reinserirle.

begin;

-- 1. via i segnaposto creati da scripts/seed-demo.mjs
delete from public.media where storage_path like 'demo-%';

-- I file veri e propri restano nel bucket ma non li vede più nessuno: la
-- galleria e l'area admin leggono da public.media. Toglierli anche dallo
-- storage non si può da qui: un trigger di Supabase (storage.protect_delete)
-- vieta la cancellazione diretta da storage.objects e impone la Storage API.
-- Per ripulire anche il bucket serve la dashboard, sezione Storage.

-- 2. le foto degli sposi (rilanciabile: prima cancella, poi reinserisce)
delete from public.media where storage_path like '/foto-sposi/%';

-- La galleria ordina per created_at decrescente: fissiamo i timestamp a mano,
-- distanziati di un minuto, così l'ordine è quello dell'elenco qui sotto (la
-- prima riga è la prima foto che si vede). Restano un'ora nel passato, così le
-- foto che gli ospiti caricheranno durante la festa finiranno sopra a queste.
insert into public.media (guest_name, caption, storage_path, media_type, created_at)
select
  'Elena e Tommaso',
  f.caption,
  f.path,
  'image',
  now() - interval '1 hour' - (f.ord - 1) * interval '1 minute'
from (values
  (1,  '/foto-sposi/01-ponte-vecchio.jpg',       'Sul Ponte Vecchio'),
  (2,  '/foto-sposi/02-sotto-i-portici.jpg',     'Sotto i portici'),
  (3,  '/foto-sposi/03-la-laurea.jpg',           'Dottoressa!'),
  (4,  '/foto-sposi/04-compleanno.jpg',          'Auguri e bollicine'),
  (5,  '/foto-sposi/05-davanti-al-duomo.jpg',    'Davanti al Duomo'),
  (6,  '/foto-sposi/06-tra-i-trulli.jpg',        'Tra i trulli'),
  (7,  '/foto-sposi/07-in-braccio.jpg',          'In braccio, come sempre'),
  (8,  '/foto-sposi/08-tra-i-sassi.jpg',         'Tra i sassi'),
  (9,  '/foto-sposi/09-partita-a-scacchi.jpg',   'Una partita a scacchi'),
  (10, '/foto-sposi/10-brindisi.jpg',            'Brindisi sotto l''albero'),
  (11, '/foto-sposi/11-aria-di-vacanza.jpg',     'Aria di vacanza'),
  (12, '/foto-sposi/12-un-tuffo.jpg',            'Un tuffo insieme'),
  (13, '/foto-sposi/13-feste-in-famiglia.jpg',   'Feste in famiglia'),
  (14, '/foto-sposi/14-freddo-ma-felici.jpg',    'Freddo, ma felici'),
  (15, '/foto-sposi/15-domenica-in-balcone.jpg', 'Domenica in balcone')
) as f(ord, path, caption);

commit;

-- Controllo: dovrebbe restituire 15 righe, nessuna "demo-".
-- select storage_path, caption, created_at from public.media order by created_at desc;
