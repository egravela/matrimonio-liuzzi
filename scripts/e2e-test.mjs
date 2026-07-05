// Test end-to-end con la chiave publishable (stessi permessi di un ospite):
// upload nel bucket + insert nella tabella + lettura, come fa la app.
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const supabase = createClient(
  'https://rmziigjviufyrmkcnmmj.supabase.co',
  'sb_publishable_Eaww-sFQ8yOYu39-A_Mzxg_ePuwF5ac',
);

// immagine di prova: quadrato rosa cipria
const png = await sharp({
  create: { width: 320, height: 240, channels: 3, background: '#eec3ca' },
})
  .png()
  .toBuffer();

const path = `test-${Math.random().toString(36).slice(2, 8)}.png`;

const up = await supabase.storage.from('wedding-media').upload(path, png, {
  contentType: 'image/png',
});
if (up.error) throw new Error('storage upload: ' + up.error.message);
console.log('upload OK:', path);

const ins = await supabase.from('media').insert({
  guest_name: 'Test Claude',
  caption: 'Foto di prova — da eliminare',
  storage_path: path,
  media_type: 'image',
});
if (ins.error) throw new Error('insert: ' + ins.error.message);
console.log('insert OK');

const sel = await supabase.from('media').select('*');
if (sel.error) throw new Error('select: ' + sel.error.message);
console.log('select OK, righe:', sel.data.length);

const url = supabase.storage.from('wedding-media').getPublicUrl(path).data.publicUrl;
const res = await fetch(url);
console.log('public URL:', res.status, url);

// verifica che l'ospite NON possa cancellare (policy assente di proposito)
const del = await supabase.from('media').delete().eq('storage_path', path).select();
console.log('delete da anonimo (deve restituire 0 righe):', del.data?.length ?? del.error?.message);
