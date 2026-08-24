import { createClient } from '@supabase/supabase-js';

export const BUCKET = 'wedding-media';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export type MediaRow = {
  id: string;
  created_at: string;
  guest_name: string;
  caption: string | null;
  storage_path: string;
  media_type: 'image' | 'video';
};

/**
 * Le foto degli sposi non stanno nel bucket: sono file del sito (public/foto-sposi/)
 * e in `media` hanno un path assoluto. Si riconoscono dalla barra iniziale.
 */
export function isLocalAsset(path: string) {
  return path.startsWith('/');
}

export function publicUrl(path: string) {
  if (isLocalAsset(path)) return path;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
