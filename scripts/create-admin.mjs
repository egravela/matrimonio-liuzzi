// Crea (una tantum) l'utenza admin in Supabase Auth.
// Uso: $env:SUPABASE_SERVICE_ROLE_KEY='...'; node scripts/create-admin.mjs
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'egravela@latraccia.it';

const supa = createClient(
  'https://rmziigjviufyrmkcnmmj.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const { data: list } = await supa.auth.admin.listUsers();
const existing = list?.users?.find((u) => u.email === ADMIN_EMAIL);
if (existing) {
  console.log('utente admin già presente:', existing.id);
} else {
  const { data, error } = await supa.auth.admin.createUser({
    email: ADMIN_EMAIL,
    email_confirm: true,
  });
  if (error) throw new Error(error.message);
  console.log('utente admin creato:', data.user.id);
}
