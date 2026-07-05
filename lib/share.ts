import { publicUrl, type MediaRow } from './supabase';

function fileName(item: MediaRow) {
  const ext = item.storage_path.split('.').pop() ?? 'jpg';
  return `matrimonio-elena-tommaso-${item.id.slice(0, 8)}.${ext}`;
}

export type ShareOutcome = 'shared' | 'copied' | 'canceled' | 'failed';

// Condivisione rapida: pannello nativo (con il file vero, se il dispositivo
// lo consente), altrimenti link negli appunti.
export async function shareMedia(item: MediaRow): Promise<ShareOutcome> {
  const url = publicUrl(item.storage_path);
  const title = 'Matrimonio di Elena & Tommaso';
  const text = `Una foto dal matrimonio di Elena & Tommaso (condivisa da ${item.guest_name})`;

  if (typeof navigator.share === 'function') {
    // prova a condividere il file vero: su WhatsApp & co. arriva la foto, non un link
    try {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], fileName(item), { type: blob.type });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title, text });
        return 'shared';
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'canceled';
      // fetch o share del file falliti: si passa alla condivisione del link
    }
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'canceled';
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    return legacyCopy(url) ? 'copied' : 'failed';
  }
}

// copia con textarea+execCommand: copre i browser/contesti senza Clipboard API
// (es. quando la app viene provata via IP di rete locale, non https)
function legacyCopy(text: string): boolean {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  ta.remove();
  return ok;
}

// Il parametro ?download= fa servire il file da Supabase come allegato
export function downloadUrl(item: MediaRow) {
  return `${publicUrl(item.storage_path)}?download=${fileName(item)}`;
}
