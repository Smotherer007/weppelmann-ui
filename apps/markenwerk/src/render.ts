// Aus einem Raster werden die Dateien, die eine Anwendung braucht: SVG als
// Quelle, PNG in den Größen der Desktops, ein monochromes Tray-Bild und der
// Symbolstil für Leisten.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Marke, Raster } from "./format.ts";
import { rgba } from "./format.ts";
import { kodierePng } from "./png.ts";

/** Größen, die Linux, Windows und macOS abfragen. */
export const GROESSEN = [16, 24, 32, 48, 64, 128, 256, 512, 1024];

function hexOhneRaute(hex: string): string {
  return hex.replace("#", "");
}

/**
 * Waagerechte Läufe statt einzelner Pixel: aus 205 Rechtecken werden rund 60.
 * Das ist derselbe Anblick, aber eine kürzere Datei und weniger Arbeit beim
 * Zeichnen — bei jedem Start der Anwendung.
 */
function laeufe(marke: Marke): { x: number; y: number; breite: number; farbe: string }[] {
  const size = marke.pixels.length;
  const aus: { x: number; y: number; breite: number; farbe: string }[] = [];
  for (let y = 0; y < size; y++) {
    let x = 0;
    while (x < size) {
      const zeichen = marke.pixels[y][x];
      if (zeichen === ".") { x++; continue; }
      const farbe = zeichen === "+" ? marke.shade ?? marke.ink : marke.ink;
      let bis = x;
      while (bis < size) {
        const naechstes = marke.pixels[y][bis];
        if (naechstes === ".") break;
        const naechsteFarbe = naechstes === "+" ? marke.shade ?? marke.ink : marke.ink;
        if (naechsteFarbe !== farbe) break;
        bis++;
      }
      aus.push({ x, y, breite: bis - x, farbe });
      x = bis;
    }
  }
  return aus;
}

/** SVG mit einem Rechteck je Lauf, auf 512 skaliert. */
export function svgQuelle(marke: Marke): string {
  const size = marke.pixels.length;
  const faktor = 512 / size;
  const teile = laeufe(marke)
    .filter((l) => inKachel(l.x, l.y, size))
    .map((l) => `<rect x="${l.x * faktor}" y="${l.y * faktor}" width="${l.breite * faktor}" height="${faktor}" fill="${l.farbe}"/>`);
  const ecke = Math.max(1, Math.round(size * 0.22)) * faktor;
  const kante = 512;
  const achteck = `M ${ecke} 0 H ${kante - ecke} L ${kante} ${ecke} V ${kante - ecke} L ${kante - ecke} ${kante} H ${ecke} L 0 ${kante - ecke} V ${ecke} Z`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" shape-rendering="crispEdges">
  <title>${marke.name}</title>
  <!-- Erzeugt von markenwerk aus marken/${marke.slug}.pm. Nicht von Hand ändern:
       die Quelle ist das Raster, nicht dieses Bild. Kachelform: Achteck. -->
  <path d="${achteck}" fill="${marke.surface}"/>
${teile.join("\n")}
</svg>
`;
}

/** Symbolstil: nur die Zeichnung, in currentColor — für Leisten und Titel. */
export function svgSymbol(marke: Marke): string {
  const size = marke.pixels.length;
  const teile = laeufe(marke).map((l) => `<rect x="${l.x}" y="${l.y}" width="${l.breite}" height="1"/>`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">
  <title>${marke.name}</title>
  <g fill="currentColor">
${teile.join("\n")}
  </g>
</svg>
`;
}


/**
 * Gehört das Pixel zur Kachel? Die Kachel ist ein Achteck: an den vier Ecken
 * ist ein Dreieck abgeschnitten, 45 Grad. Das ist die Markenform — in der
 * Leiste erkennt man sie, bevor man das Motiv sieht.
 */
export function inKachel(x: number, y: number, size: number, form: "voll" | "achteck" = "achteck"): boolean {
  if (form === "voll") return true;
  const ecke = Math.max(1, Math.round(size * 0.22));
  const vonLinks = x;
  const vonRechts = size - 1 - x;
  const vonOben = y;
  const vonUnten = size - 1 - y;
  // In jeder Ecke: ist der Abstand zur Ecke kleiner als zur Fase?
  return !(
    (vonLinks < ecke && vonOben < ecke && vonLinks + vonOben < ecke) ||
    (vonRechts < ecke && vonOben < ecke && vonRechts + vonOben < ecke) ||
    (vonLinks < ecke && vonUnten < ecke && vonLinks + vonUnten < ecke) ||
    (vonRechts < ecke && vonUnten < ecke && vonRechts + vonUnten < ecke)
  );
}

/**
 * Vergrößern: jeder Quellpixel wird zum Block. Keine Glättung — ein Pixelbild
 * kennt keine Zwischentöne.
 */
function vergroessere(marke: Marke, ziel: number, mitFlaeche: boolean): Uint8Array {
  const size = marke.pixels.length;
  const aus = new Uint8Array(ziel * ziel * 4);
  const flaeche = rgba(marke.surface);
  const tinte = rgba(marke.ink);
  const schatten = marke.shade ? rgba(marke.shade) : tinte;

  for (let y = 0; y < ziel; y++) {
    for (let x = 0; x < ziel; x++) {
      const qx = Math.floor((x * size) / ziel);
      const qy = Math.floor((y * size) / ziel);
      const zeichen = marke.pixels[qy][qx];
      const o = (y * ziel + x) * 4;
      if (zeichen === ".") {
        if (mitFlaeche && inKachel(qx, qy, size)) { aus[o] = flaeche[0]; aus[o + 1] = flaeche[1]; aus[o + 2] = flaeche[2]; aus[o + 3] = 255; }
      } else {
        const [r, g, b] = zeichen === "+" ? schatten : tinte;
        aus[o] = r; aus[o + 1] = g; aus[o + 2] = b; aus[o + 3] = 255;
      }
    }
  }
  return aus;
}

/**
 * Verkleinern mit Mehrheitsentscheid.
 *
 * Für jedes Zielpixel wird gezählt, wie viele Quellpixel gesetzt sind; die
 * Mehrheit gewinnt. Gemittelt wird **nicht**: ein Mittelwert aus Fläche und Tinte
 * ergibt Zwischentöne, die es in einem Pixelbild nicht gibt — bei 16 px sieht das
 * aus wie Schmutz. So bleiben höchstens die Farben der Marke im Bild.
 */
function verkleinere(marke: Marke, ziel: number, mitFlaeche: boolean): Uint8Array {
  const size = marke.pixels.length;
  const aus = new Uint8Array(ziel * ziel * 4);
  const flaeche = rgba(marke.surface);
  const tinte = rgba(marke.ink);
  const schatten = marke.shade ? rgba(marke.shade) : tinte;

  // Der Quellbereich je Zielpixel wird über floor/ceil bestimmt, damit auch
  // 32 nach 24 funktioniert (nicht ganzzahliges Verhältnis).
  const bereich = (i: number) => {
    const von = Math.floor((i * size) / ziel);
    const bis = Math.max(von + 1, Math.ceil(((i + 1) * size) / ziel));
    return [von, Math.min(bis, size)] as const;
  };

  for (let y = 0; y < ziel; y++) {
    for (let x = 0; x < ziel; x++) {
      const [x0, x1] = bereich(x);
      const [y0, y1] = bereich(y);
      let gesetzt = 0;
      let schattenAnteil = 0;
      let gesamt = 0;
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const zeichen = marke.pixels[sy][sx];
          if (zeichen !== ".") gesetzt++;
          if (zeichen === "+") schattenAnteil++;
          gesamt++;
        }
      }
      const o = (y * ziel + x) * 4;
      const istGesetzt = gesetzt * 2 > gesamt;
      if (!istGesetzt) {
        if (mitFlaeche && inKachel(x, y, ziel)) { aus[o] = flaeche[0]; aus[o + 1] = flaeche[1]; aus[o + 2] = flaeche[2]; aus[o + 3] = 255; }
        continue;
      }
      const [r, g, b] = schattenAnteil * 2 > gesetzt ? schatten : tinte;
      aus[o] = r; aus[o + 1] = g; aus[o + 2] = b; aus[o + 3] = 255;
    }
  }
  return aus;
}

/** Für Tests und Werkzeuge: ein Raster auf eine Zielgröße bringen. */
export function skaliere(marke: Marke, ziel: number, mitFlaeche: boolean): Uint8Array {
  return ziel >= marke.pixels.length ? vergroessere(marke, ziel, mitFlaeche) : verkleinere(marke, ziel, mitFlaeche);
}

/** Schreibt alle Dateien einer Marke in ein Verzeichnis. */
export function schreibeMarke(marke: Marke, ziel: string): string[] {
  mkdirSync(ziel, { recursive: true });
  const geschrieben: string[] = [];

  const svg = join(ziel, "icon.svg");
  writeFileSync(svg, svgQuelle(marke));
  geschrieben.push(svg);

  const symbol = join(ziel, "symbolic.svg");
  writeFileSync(symbol, svgSymbol(marke));
  geschrieben.push(symbol);

  for (const groesse of GROESSEN) {
    const pfad = join(ziel, `icon-${groesse}.png`);
    writeFileSync(pfad, kodierePng(groesse, skaliere(marke, groesse, true)));
    geschrieben.push(pfad);
  }

  // Tray: nur die Zeichnung, weiß, Rest durchsichtig. Leisten färben selbst.
  for (const groesse of [32, 64]) {
    const pfad = join(ziel, `tray-${groesse}.png`);
    writeFileSync(pfad, kodierePng(groesse, skaliere(marke, groesse, false)));
    geschrieben.push(pfad);
  }

  return geschrieben;
}

/** Kontaktbogen: alle Marken in mehreren Größen auf einer Fläche. */
export function kontaktbogen(marken: Marke[], groessen = [16, 32, 64, 128]): string {
  // Zellenhoehe richtet sich nach der groessten Groesse plus Beschriftung,
  // sonst ueberlappt das naechste Zeichen.
  const groesste = Math.max(...groessen);
  const spalte = groesste + 60;
  const zeile = groesste + 70;
  const breite = 170 + groessen.length * spalte;
  const hoehe = marken.length * zeile + 30;
  const teile: string[] = [];

  marken.forEach((marke, i) => {
    const y = 30 + i * zeile;
    teile.push(`<text x="10" y="${y + 60}" fill="#E9E5DC" font-family="monospace" font-size="14">${marke.name}</text>`);
    groessen.forEach((groesse, j) => {
      const x = 170 + j * spalte + (spalte - groesse) / 2;
      const size = marke.pixels.length;
      const teileRects: string[] = [];
      for (let py = 0; py < size; py++) {
        for (let px = 0; px < size; px++) {
          if (marke.pixels[py][px] === ".") continue;
          const farbe = marke.pixels[py][px] === "+" ? marke.shade ?? marke.ink : marke.ink;
          teileRects.push(`<rect x="${px}" y="${py}" width="1" height="1" fill="${farbe}"/>`);
        }
      }
      teile.push(`<g transform="translate(${x} ${y}) scale(${groesse / size})">`);
      teile.push(`<rect width="${size}" height="${size}" fill="${marke.surface}"/>`);
      teile.push(...teileRects);
      teile.push(`</g>`);
      teile.push(`<text x="${x}" y="${y + groesse + 18}" fill="#78838F" font-family="monospace" font-size="11">${groesse}</text>`);
    });
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${breite}" height="${hoehe}" viewBox="0 0 ${breite} ${hoehe}" shape-rendering="crispEdges">
  <rect width="${breite}" height="${hoehe}" fill="#0E1319"/>
${teile.join("\n")}
</svg>
`;
}
