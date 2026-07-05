import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'egravela@latraccia.it';

// Login admin con sola email: se l'indirizzo è quello dell'admin, genera
// lato server un token di accesso monouso che il client scambia per una
// sessione. La chiave service_role resta esclusivamente sul server.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (email !== ADMIN_EMAIL.toLowerCase()) {
    // stessa risposta per email sbagliata o vuota: nessun indizio
    return NextResponse.json({ error: 'Accesso non consentito' }, { status: 403 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: 'Configurazione mancante' }, { status: 500 });
  }

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: ADMIN_EMAIL,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ token_hash: data.properties.hashed_token });
}
