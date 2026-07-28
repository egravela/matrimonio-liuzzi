-- Matrimonio Elena & Tommaso — modulo intolleranze alimentari
-- Una riga per persona; chi compila per la famiglia invia più righe con lo
-- stesso submission_id. Reinviando il modulo la nuova risposta annulla la
-- precedente tramite replaces_submission_id (niente update/delete agli anonimi).

create table if not exists public.diet_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  submission_id uuid not null,
  replaces_submission_id uuid,
  sort_order int not null default 0,
  full_name text not null,
  restrictions text[] not null default '{}',
  notes text,
  contact text
);

create index if not exists diet_entries_submission_idx
  on public.diet_entries (submission_id);

alter table public.diet_entries enable row level security;

-- Gli ospiti (anonimi) possono solo inviare: le risposte non sono leggibili
-- pubblicamente, contengono dati personali (allergie, contatti).
create policy "invio pubblico intolleranze" on public.diet_entries
  for insert with check (
    char_length(full_name) between 1 and 80
    and (notes is null or char_length(notes) <= 400)
    and (contact is null or char_length(contact) <= 120)
    and coalesce(cardinality(restrictions), 0) <= 12
    and (select coalesce(bool_and(char_length(r) <= 40), true) from unnest(restrictions) as r)
    and sort_order between 0 and 30
  );

-- Lettura e cancellazione riservate agli sposi, stessa email dell'area admin.
create policy "lettura admin intolleranze" on public.diet_entries
  for select to authenticated
  using ((auth.jwt() ->> 'email') = 'egravela@latraccia.it');

create policy "cancellazione admin intolleranze" on public.diet_entries
  for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'egravela@latraccia.it');
