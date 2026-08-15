-- Le voci selezionabili nel modulo sono passate da 12 a 14 (seggiolone e
-- gravidanza): il limite di 12 elementi nell'array rifiutava chi le spuntava
-- quasi tutte. Alziamo il tetto lasciando invariati gli altri controlli.

drop policy if exists "invio pubblico intolleranze" on public.diet_entries;

create policy "invio pubblico intolleranze" on public.diet_entries
  for insert with check (
    char_length(full_name) between 1 and 80
    and (notes is null or char_length(notes) <= 400)
    and (contact is null or char_length(contact) <= 120)
    and coalesce(cardinality(restrictions), 0) <= 16
    and (select coalesce(bool_and(char_length(r) <= 40), true) from unnest(restrictions) as r)
    and sort_order between 0 and 30
  );
