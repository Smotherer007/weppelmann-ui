// PNG schreiben, ohne Abhängigkeit. Ein Bild mit 8 Bit je Kanal und RGBA ist ein
// kurzer Datenstrom: Signatur, IHDR, IDAT (zlib), IEND. Mehr braucht ein
// App-Icon nicht — und eine Bibliothek dafür wäre eine Abhängigkeit zu viel.
import { deflateSync } from "node:zlib";

const SIGNATUR = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const CRC_TABELLE = (() => {
  const tabelle = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    tabelle[n] = c >>> 0;
  }
  return tabelle;
})();

function crc32(daten: Buffer): number {
  let c = 0xffffffff;
  for (const byte of daten) c = CRC_TABELLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(typ: string, daten: Buffer): Buffer {
  const laenge = Buffer.alloc(4);
  laenge.writeUInt32BE(daten.length, 0);
  const kopf = Buffer.concat([Buffer.from(typ, "ascii"), daten]);
  const pruefsumme = Buffer.alloc(4);
  pruefsumme.writeUInt32BE(crc32(kopf), 0);
  return Buffer.concat([laenge, kopf, pruefsumme]);
}

/** Kodiert RGBA-Pixel als PNG. `pixel` hat 4 Byte je Punkt, zeilenweise. */
export function kodierePng(size: number, pixel: Uint8Array): Buffer {
  if (pixel.length !== size * size * 4) {
    throw new Error(`PNG: ${pixel.length} Byte für ${size}×${size}, erwartet ${size * size * 4}`);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // Bittiefe
  ihdr[9] = 6; // Farbtyp: RGBA
  ihdr[10] = 0; // Deflate
  ihdr[11] = 0; // Standardfilter
  ihdr[12] = 0; // nicht verzahnt

  // Jede Zeile bekommt ein Filterbyte (0 = keine Vorhersage). Ohne das ist der
  // Datenstrom kein gültiges PNG.
  const roh = Buffer.alloc((size * 4 + 1) * size);
  const quelle = Buffer.from(pixel);
  for (let y = 0; y < size; y++) {
    const ziel = y * (size * 4 + 1);
    roh[ziel] = 0;
    quelle.copy(roh, ziel + 1, y * size * 4, (y + 1) * size * 4);
  }

  return Buffer.concat([
    SIGNATUR,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(roh, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
