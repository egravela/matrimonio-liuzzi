// Alleggerimento delle foto prima dell'upload.
//
// Una foto da telefono pesa 3-5 MB: in sala, con la rete divisa fra duecento
// invitati, caricarne dieci diventa un'attesa che fa desistere. E chi poi apre
// la galleria se le riscarica tutte a piena risoluzione. Ridotta a 2000 px di
// lato lungo la stessa foto sta in poche centinaia di kB, e sullo schermo di un
// telefono non si vede differenza.
//
// Regola di fondo: la compressione non deve MAI impedire un caricamento. Se
// qualcosa va storto — formato che il browser non sa decodificare, memoria,
// canvas vuota — si torna al file originale e si carica quello.

/** Lato lungo massimo dell'immagine salvata. */
const MAX_EDGE = 2000;

/** Qualità JPEG: sotto 0.8 iniziano a vedersi gli artefatti sui volti. */
const QUALITY = 0.82;

/** Sotto questa soglia il file è già leggero: si lascia com'è. */
const SKIP_UNDER_BYTES = 800 * 1024;

/** Conviene solo se il risultato è più leggero almeno di un decimo. */
const MIN_GAIN = 0.9;

function isCompressible(file: File) {
  if (!file.type.startsWith('image/')) return false;
  // le GIF animate diventerebbero un fotogramma solo
  if (file.type === 'image/gif') return false;
  return file.size > SKIP_UNDER_BYTES;
}

function jpegName(name: string) {
  const base = name.replace(/\.[^./\\]+$/, '') || 'foto';
  return `${base}.jpg`;
}

/**
 * Restituisce una versione alleggerita dell'immagine, oppure il file di
 * partenza quando non c'è niente da guadagnare o qualcosa non funziona.
 */
export async function shrinkImage(file: File): Promise<File> {
  if (!isCompressible(file)) return file;
  if (typeof createImageBitmap !== 'function') return file;

  let bitmap: ImageBitmap | null = null;
  try {
    // `from-image` applica l'orientamento EXIF: senza, le foto scattate in
    // verticale finirebbero coricate.
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });

    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    // fondo bianco: un PNG con trasparenza, su JPEG, diventerebbe nero
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', QUALITY),
    );
    // libera subito la canvas: su iOS la memoria grafica è poca
    canvas.width = 0;
    canvas.height = 0;
    if (!blob || blob.size >= file.size * MIN_GAIN) return file;

    return new File([blob], jpegName(file.name), {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  } finally {
    bitmap?.close();
  }
}
