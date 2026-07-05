-- Admin: solo egravela@latraccia.it (autenticato) può cancellare i media,
-- sia le righe in tabella sia i file nello storage.

create policy "cancellazione admin" on public.media
  for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'egravela@latraccia.it');

create policy "cancellazione admin storage" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'wedding-media'
    and (auth.jwt() ->> 'email') = 'egravela@latraccia.it'
  );
