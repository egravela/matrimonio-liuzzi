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

export function publicUrl(path: string) {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
