// Aus einem Raster werden die Dateien, die eine Anwendung braucht: SVG als
// Quelle, PNG in den Größen der Desktops, ein monochromes Tray-Bild und der
// Symbolstil für Leisten.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Marke, Raster } from "./format.ts";
import { rasterisiere, rasterisiereZeichnung } from "./format.ts";
import { kodierePng } from "./png.ts";

/** Größen, die Linux, Windows und macOS abfragen. */
export const GROESSEN = [16, 24, 32, 48, 64, 128, 256, 512, 1024];

function hexOhneRaute(hex: string): string {
  return hex.replace("#", "");
}

/** SVG mit einem Rechteck je Pixel, auf 512 skaliert. */
export function svgQuelle(marke: Marke): string {
  const size = marke.pixels.length;
  const faktor = 512 / size;
  const teile: string[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const c = marke.pixels[y][x];
      if (c === ".") continue;
      const farbe = c === "+" ? marke.shade ?? marke.ink : marke.ink;
      teile.push(`<rect x="${x * faktor}" y="${y * faktor}" width="${faktor}" height="${faktor}" fill="${farbe}"/>`);
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" shape-rendering="crispEdges">
  <title>${marke.name}</title>
  <!-- Erzeugt von markenwerk aus marken/${marke.slug}.pm. Nicht von Hand ändern:
       die Quelle ist das Raster, nicht dieses Bild. -->
  <rect width="512" height="512" fill="${marke.surface}"/>
${teile.join("\n")}
</svg>
`;
}

/** Symbolstil: nur die Zeichnung, in currentColor — für Leisten und Titel. */
export function svgSymbol(marke: Marke): string {
  const size = marke.pixels.length;
  const teile: string[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (marke.pixels[y][x] === ".") continue;
      teile.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">
  <title>${marke.name}</title>
  <g fill="currentColor">
${teile.join("\n")}
  </g>
</svg>
`;
}

/** Nächstes Vielfaches: Pixel verdoppeln, ohne zu glätten. */
function vergroessere(raster: Raster, ziel: number): Uint8Array {
  const out = new Uint8Array(ziel * ziel * 4);
  for (let y = 0; y < ziel; y++) {
    for (let x = 0; x < ziel; x++) {
      const qx = Math.floor((x * raster.size) / ziel);
      const qy = Math.floor((y * raster.size) / ziel);
      const i = (qy * raster.size + qx) * 4;
      const o = (y * ziel + x) * 4;
      out[o] = raster.rgba[i]; out[o + 1] = raster.rgba[i + 1];
      out[o + 2] = raster.rgba[i + 2]; out[o + 3] = raster.rgba[i + 3];
    }
  }
  return out;
}

/**
 * Verkleinern mit Mehrheitsentscheid: ein Zielpixel wird gesetzt, wenn die
 * Mehrheit seiner Quellpixel gesetzt ist. Einfaches Weglassen würde bei 16 px
 * ganze Striche verschlucken.
 */
function verkleinere(raster: Raster, ziel: number): Uint8Array {
  const out = new Uint8Array(ziel * ziel * 4);
  const kante = raster.size / ziel;
  for (let y = 0; y < ziel; y++) {
    for (let x = 0; x < ziel; x++) {
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let dy = 0; dy < kante; dy++) {
        for (let dx = 0; dx < kante; dx++) {
          const sx = Math.floor(x * kante + dx), sy = Math.floor(y * kante + dy);
          const i = (sy * raster.size + sx) * 4;
          r += raster.rgba[i]; g += raster.rgba[i + 1]; b += raster.rgba[i + 2]; a += raster.rgba[i + 3];
          n++;
        }
      }
      const o = (y * ziel + x) * 4;
      out[o] = Math.round(r / n); out[o + 1] = Math.round(g / n);
      out[o + 2] = Math.round(b / n); out[o + 3] = Math.round(a / n);
    }
  }
  return out;
}

function skaliere(raster: Raster, ziel: number): Uint8Array {
  return ziel >= raster.size ? vergroessere(raster, ziel) : verkleinere(raster, ziel);
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

  const voll = rasterisiere(marke);
  for (const groesse of GROESSEN) {
    const pfad = join(ziel, `icon-${groesse}.png`);
    writeFileSync(pfad, kodierePng(groesse, skaliere(voll, groesse)));
    geschrieben.push(pfad);
  }

  // Tray: nur die Zeichnung, weiß, Rest durchsichtig. Leisten färben selbst.
  const zeichnung = rasterisiereZeichnung(marke);
  for (const groesse of [32, 64]) {
    const pfad = join(ziel, `tray-${groesse}.png`);
    writeFileSync(pfad, kodierePng(groesse, skaliere(zeichnung, groesse)));
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
