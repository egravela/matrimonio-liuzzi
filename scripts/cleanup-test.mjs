// Rimuove SOLO i dati di prova caricati con guest_name = 'Test Claude'
// (righe media via SQL, file storage via Storage API con policy temporanea).
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const client = new pg.Client({
  host: 'aws-0-eu-west-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.rmziigjviufyrmkcnmmj',
  password: process.env.SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const rows = await client.query(
  `delete from public.media where guest_name = 'Test Claude' returning storage_path`,
);
const names = rows.rows.map((r) => r.storage_path);
console.log('righe media eliminate:', rows.rowCount, names);

if (names.length > 0) {
  // i nomi sono generati dalla app (timestamp-random.ext): nessun rischio di injection,
  // ma li validiamo comunque prima di interpolarli nella policy
  const safe = names.filter((n) => /^[\w.-]+$/.test(n));
  const list = safe.map((n) => `'${n}'`).join(',');
  await client.query(`create policy "cleanup temporanea test" on storage.objects
    for delete using (bucket_id = 'wedding-media' and name in (${list}))`);
  try {
    const supabase = createClient(
      'https://rmziigjviufyrmkcnmmj.supabase.co',
      'sb_publishable_Eaww-sFQ8yOYu39-A_Mzxg_ePuwF5ac',
    );
    const { data, error } = await supabase.storage.from('wedding-media').remove(safe);
    if (error) throw new Error(error.message);
    console.log('file storage eliminati:', data.map((d) => d.name));
  } finally {
    await client.query(`drop policy "cleanup temporanea test" on storage.objects`);
    console.log('policy temporanea rimossa');
  }
}

await client.end();
