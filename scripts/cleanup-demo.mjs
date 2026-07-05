// Rimuove le immagini demo (path "demo-*") create da seed-demo.mjs.
// Uso: $env:SUPABASE_DB_PASSWORD='...'; node scripts/cleanup-demo.mjs
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
  `delete from public.media where storage_path like 'demo-%' returning storage_path`,
);
console.log('righe media eliminate:', rows.rowCount);

const list = await client.query(
  `select name from storage.objects where bucket_id = 'wedding-media' and name like 'demo-%'`,
);
const names = list.rows.map((r) => r.name);

if (names.length > 0) {
  await client.query(`create policy "cleanup temporanea demo" on storage.objects
    for delete using (bucket_id = 'wedding-media' and name like 'demo-%')`);
  try {
    const supabase = createClient(
      'https://rmziigjviufyrmkcnmmj.supabase.co',
      'sb_publishable_Eaww-sFQ8yOYu39-A_Mzxg_ePuwF5ac',
    );
    const { data, error } = await supabase.storage.from('wedding-media').remove(names);
    if (error) throw new Error(error.message);
    console.log('file storage eliminati:', data.length);
  } finally {
    await client.query(`drop policy "cleanup temporanea demo" on storage.objects`);
  }
}

await client.end();
console.log('FATTO');
