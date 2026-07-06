// Verifica che la card QR generata sia davvero decodificabile, anche a
// risoluzioni ridotte (simula la scansione da telefono a distanza).
// Da rilanciare dopo ogni modifica a generate-qr-card.mjs.
import sharp from 'sharp';
import jsQR from 'jsqr';

const FILE = 'public/downloads/qr-tavoli.png';
const EXPECTED = 'https://matrimonio-liuzzi.vercel.app/';

let ok = true;
for (const size of [1240, 800, 500, 350]) {
  const { data, info } = await sharp(FILE)
    .resize(size)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const clamped = new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength);
  const code = jsQR(clamped, info.width, info.height);
  const pass = code?.data === EXPECTED;
  ok &&= pass;
  console.log(`${size}px -> ${pass ? 'OK' : `FALLITO (${code ? code.data : 'non decodificato'})`}`);
}

if (!ok) {
  console.error('VERIFICA FALLITA: il QR non è leggibile in tutte le condizioni');
  process.exit(1);
}
console.log('QR verificato: decodifica corretta a tutte le risoluzioni');
