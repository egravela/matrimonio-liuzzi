// Applica supabase/migrations/001_init.sql al progetto rmziigjviufyrmkcnmmj.
// Prova la connessione diretta (IPv6) e in fallback i pooler regionali (IPv4).
import { readFileSync } from 'node:fs';
import pg from 'pg';

const PROJECT = 'rmziigjviufyrmkcnmmj';
const PASSWORD = process.env.SUPABASE_DB_PASSWORD;
if (!PASSWORD) {
  console.error('SUPABASE_DB_PASSWORD non impostata');
  process.exit(1);
}

const sqlPath = process.argv[2];
const sql = readFileSync(sqlPath, 'utf8');

const candidates = [
  { host: `db.${PROJECT}.supabase.co`, port: 5432, user: 'postgres' },
  ...['eu-west-1', 'eu-central-1', 'eu-west-2', 'eu-west-3', 'eu-central-2', 'eu-north-1'].flatMap(
    (r) => [
      { host: `aws-0-${r}.pooler.supabase.com`, port: 5432, user: `postgres.${PROJECT}` },
      { host: `aws-1-${r}.pooler.supabase.com`, port: 5432, user: `postgres.${PROJECT}` },
    ],
  ),
];

let client = null;
for (const c of candidates) {
  const attempt = new pg.Client({
    host: c.host,
    port: c.port,
    user: c.user,
    password: PASSWORD,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });
  try {
    await attempt.connect();
    console.log('connesso via', c.host);
    client = attempt;
    break;
  } catch (e) {
    console.log('fallito', c.host, '-', e.code ?? e.message);
    try { await attempt.end(); } catch {}
  }
}

if (!client) {
  console.error('Nessun host raggiungibile');
  process.exit(2);
}

try {
  await client.query(sql);
  console.log('MIGRAZIONE APPLICATA');
  const check = await client.query(
    `select
       (select count(*) from information_schema.tables where table_schema='public' and table_name='media') as media_table,
       (select count(*) from storage.buckets where id='wedding-media') as bucket,
       (select count(*) from pg_policies where tablename in ('media','objects')) as policies`,
  );
  console.log(JSON.stringify(check.rows[0]));
} finally {
  await client.end();
}
