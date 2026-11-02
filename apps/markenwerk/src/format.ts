// Das Marken-Format (.pm): Kopfzeilen mit Schlüssel = Wert, danach das Raster.
//
// Warum Text und nicht SVG: ein Zeichen, das man in einem Editor sehen und
// zeilenweise ändern kann, wird auch gepflegt. Und ein Generator kann daraus
// jede Größe ableiten — SVG, PNG, Tray, Symbolstil — ohne dass jemand vier
// Dateien von Hand nachzieht.

export interface Marke {
  /** Dateiname ohne Endung, dient als Ordnername. */
  slug: string;
  /** Anzeigename. */
  name: string;
  /** Fläche der Kachel. */
  surface: string;
  /** Farbe der Zeichnung. */
  ink: string;
  /** Optional: Schattenfarbe, für Zeichen mit zwei Tönen. */
  shade?: string;
  /** Raster: je Zeile ein String, je Zeichen ein Pixel. */
  pixels: string[];
}

const LEER = ".";
const TINTE = "#";
const SCHATTEN = "+";

export class FormatFehler extends Error {}

/** Prüft eine Hex-Farbe in der Form #RRGGBB oder RRGGBB. */
export function istFarbe(wert: string): boolean {
  return /^#?[0-9a-fA-F]{6}$/.test(wert);
}

export function normalisiereFarbe(wert: string): string {
  return wert.startsWith("#") ? wert : `#${wert}`;
}

/**
 * Liest eine .pm-Datei.
 *
 * Aufbau:
 *   name = Hexwerk
 *   surface = #4F7A2E
 *   ink = #E9E5DC
 *   ---
 *   ....##....
 *
 * Das Raster muss quadratisch sein und darf höchstens 64 Zeilen haben. Mehr ist
 * kein App-Icon mehr, sondern ein Poster.
 */
export function parseMarke(text: string, slug: string): Marke {
  const zeilen = text.replace(/\r\n/g, "\n").split("\n");
  const trenner = zeilen.findIndex((z) => z.trim() === "---");
  if (trenner === -1) {
    throw new FormatFehler(`${slug}: Trennlinie "---" zwischen Kopf und Raster fehlt`);
  }

  const kopf: Record<string, string> = {};
  for (const zeile of zeilen.slice(0, trenner)) {
    // Kommentar ist ";" — nicht "#", weil "#" auch der Anfang jeder Farbangabe
    // ist. Zeilen, die mit "#" beginnen, gelten ebenfalls als Kommentar.
    const ohneKommentar = zeile.replace(/;.*$/, "").trim();
    if (!ohneKommentar || ohneKommentar.startsWith("#")) continue;
    const [schluessel, ...rest] = ohneKommentar.split("=");
    if (rest.length === 0) throw new FormatFehler(`${slug}: Kopfzeile ohne "=": ${zeile}`);
    kopf[schluessel.trim().toLowerCase()] = rest.join("=").trim();
  }

  const raster = zeilen
    .slice(trenner + 1)
    .map((z) => z.replace(/\s+$/, ""))
    .filter((z) => z.length > 0);

  if (raster.length === 0) throw new FormatFehler(`${slug}: kein Raster`);
  if (raster.length > 64) throw new FormatFehler(`${slug}: ${raster.length} Zeilen, höchstens 64`);

  const breite = raster[0].length;
  if (breite !== raster.length) {
    throw new FormatFehler(`${slug}: ${breite} Spalten, aber ${raster.length} Zeilen — das Raster muss quadratisch sein`);
  }

  const erlaubt = new Set([LEER, TINTE, SCHATTEN]);
  raster.forEach((zeile, i) => {
    if (zeile.length !== breite) {
      throw new FormatFehler(`${slug}: Zeile ${i + 1} hat ${zeile.length} statt ${breite} Zeichen`);
    }
    for (const [j, c] of [...zeile].entries()) {
      if (!erlaubt.has(c)) {
        throw new FormatFehler(`${slug}: Zeile ${i + 1}, Spalte ${j + 1}: unbekanntes Zeichen "${c}" (erlaubt: . # +)`);
      }
    }
  });

  for (const pflicht of ["name", "surface", "ink"]) {
    if (!kopf[pflicht]) throw new FormatFehler(`${slug}: "${pflicht}" fehlt im Kopf`);
  }
  for (const feld of ["surface", "ink", "shade"]) {
    if (kopf[feld] && !istFarbe(kopf[feld])) throw new FormatFehler(`${slug}: "${feld}" ist keine Farbe: ${kopf[feld]}`);
  }

  return {
    slug,
    name: kopf.name,
    surface: normalisiereFarbe(kopf.surface),
    ink: normalisiereFarbe(kopf.ink),
    shade: kopf.shade ? normalisiereFarbe(kopf.shade) : undefined,
    pixels: raster,
  };
}

/** Farbwert je Zeichen eines Rasters. `null` heißt: Fläche. */
export function farbeFuer(marke: Marke, zeichen: string): string | null {
  if (zeichen === TINTE) return marke.ink;
  if (zeichen === SCHATTEN) return marke.shade ?? marke.ink;
  return null;
}

/** Ein Raster als reine Pixel, mit tatsächlicher Zeichenfläche. */
export interface Raster {
  size: number;
  /** RGBA je Pixel, zeilenweise, 4 Byte pro Pixel. */
  rgba: Uint8Array;
}

/** Wandelt Zeichenfarbe in RGBA-Bytes. */
export function rgba(hex: string, alpha = 255): [number, number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), alpha];
}

/** Fläche plus Zeichnung als Pixelraster. */
export function rasterisiere(marke: Marke): Raster {
  const size = marke.pixels.length;
  const flaeche = rgba(marke.surface);
  const out = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const c = farbeFuer(marke, marke.pixels[y][x]);
      const [r, g, b, a] = c ? rgba(c) : flaeche;
      const i = (y * size + x) * 4;
      out[i] = r; out[i + 1] = g; out[i + 2] = b; out[i + 3] = a;
    }
  }
  return { size, rgba: out };
}

/** Nur die Zeichnung, Fläche transparent — Grundlage für Tray und Symbolstil. */
export function rasterisiereZeichnung(marke: Marke, farbe = "#FFFFFF"): Raster {
  const size = marke.pixels.length;
  const [r, g, b] = rgba(farbe);
  const out = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (farbeFuer(marke, marke.pixels[y][x])) {
        const i = (y * size + x) * 4;
        out[i] = r; out[i + 1] = g; out[i + 2] = b; out[i + 3] = 255;
      }
    }
  }
  return { size, rgba: out };
}
