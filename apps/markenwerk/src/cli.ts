#!/usr/bin/env node
// Kommandozeile für die Marken.
//
//   markenwerk check            prüft alle Raster
//   markenwerk render [slug]    schreibt SVG/PNG/Tray/Symbol in dist/<slug>/
//   markenwerk sheet            Kontaktbogen aller Marken nach dist/kontaktbogen.svg
//
// Die Marken liegen als Text in marken/*.pm. Das Raster ist die Wahrheit, alles
// andere wird daraus erzeugt.
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FormatFehler, parseMarke, type Marke } from "./format.ts";
import { GROESSEN, kontaktbogen, schreibeMarke } from "./render.ts";

// .../apps/markenwerk/src/ → .../apps/markenwerk/
const HIER = fileURLToPath(new URL(".", import.meta.url));
const WURZEL = join(HIER, "..");

const MARKEN = join(WURZEL, "marken");
const DIST = join(WURZEL, "dist");

function ladeMarken(): Marke[] {
  const dateien = readdirSync(MARKEN).filter((f) => f.endsWith(".pm")).sort();
  if (dateien.length === 0) throw new Error(`keine Marken in ${MARKEN}`);
  return dateien.map((datei) => {
    const slug = basename(datei, ".pm");
    return parseMarke(readFileSync(join(MARKEN, datei), "utf8"), slug);
  });
}

function main(argv: string[]): number {
  const befehl = argv[0];

  if (befehl === "check") {
    const marken = ladeMarken();
    for (const marke of marken) {
      console.log(`ok  ${marke.slug.padEnd(16)} ${marke.pixels.length}×${marke.pixels.length}  ${marke.name}`);
    }
    console.log(`${marken.length} Marken, Raster gültig`);
    return 0;
  }

  if (befehl === "render") {
    const nur = argv[1];
    const marken = ladeMarken().filter((m) => !nur || m.slug === nur);
    if (marken.length === 0) {
      console.error(`keine Marke "${nur}"`);
      return 1;
    }
    for (const marke of marken) {
      const dateien = schreibeMarke(marke, join(DIST, marke.slug));
      console.log(`${marke.slug}: ${dateien.length} Dateien (SVG, ${GROESSEN.length} PNG, 2 Tray, Symbol)`);
    }
    return 0;
  }

  if (befehl === "sheet") {
    mkdirSync(DIST, { recursive: true });
    const pfad = join(DIST, "kontaktbogen.svg");
    writeFileSync(pfad, kontaktbogen(ladeMarken()));
    console.log(pfad);
    return 0;
  }

  console.error("Aufruf: markenwerk <check|render [slug]|sheet>");
  return 2;
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (fehler) {
  if (fehler instanceof FormatFehler) {
    console.error(`Formatfehler: ${fehler.message}`);
    process.exitCode = 1;
  } else {
    throw fehler;
  }
}
