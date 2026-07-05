-- Matrimonio Elena & Tommaso — schema iniziale
-- Tabella dei media condivisi dagli ospiti

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  guest_name text not null default 'Ospite',
  caption text,
  storage_path text not null,
  media_type text not null check (media_type in ('image', 'video'))
);

alter table public.media enable row level security;

-- Gli ospiti (anonimi) possono vedere e aggiungere ricordi,
-- ma non modificarli né cancellarli.
create policy "lettura pubblica" on public.media
  for select using (true);

create policy "inserimento pubblico" on public.media
  for insert with check (
    char_length(guest_name) between 1 and 60
    and (caption is null or char_length(caption) <= 280)
    and media_type in ('image', 'video')
  );

-- Realtime per la galleria
alter publication supabase_realtime add table public.media;

-- Bucket storage pubblico per foto e video
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wedding-media',
  'wedding-media',
  true,
  209715200, -- 200 MB per file
  array['image/*', 'video/*']
)
on conflict (id) do nothing;

-- Policy storage: upload anonimo nel bucket, lettura pubblica
create policy "upload ospiti wedding-media" on storage.objects
  for insert with check (bucket_id = 'wedding-media');

create policy "lettura pubblica wedding-media" on storage.objects
  for select using (bucket_id = 'wedding-media');
