// Das Logo: Zeichen plus Wortmarke, als eine Datei.
//
// Warum erzeugt und nicht gezeichnet: das Zeichen ist ein Raster
// (`marken/<slug>.pm`), die Wortmarke ein zweites (`src/schrift.ts`). Beides
// zusammenzusetzen ist eine Rechnung, kein Entwurf — und nur so bleiben
// Kachel, Strichstärke und Buchstabenmaß für alle Anwendungen gleich.
//
// Zwei Fassungen, weil ein Logo auf beiden Gründen stehen muss:
//   dark   Wortmarke in Knochenweiß (#E9E5DC, neutral.100) für dunkle Flächen
//   light  Wortmarke in der Flächenfarbe der Marke für helle Flächen
// Die Kachel selbst bleibt in beiden Fassungen unverändert.
import type { Marke } from "./format.ts";
import { kachelPfad, laeufe } from "./render.ts";
import { type Fleck, HOEHE, wortmarke } from "./schrift.ts";

export type LogoModus = "dark" | "light";

/** Knochenweiß aus primitives.tokens.json (neutral.100). */
const KNOCHENWEISS = "#E9E5DC";

/** Maßstab der Wortmarke: eine Rasterzelle sind zwei Einheiten des Zeichens. */
const SCHRIFT_MASS = 2;
/** Abstand zwischen Kachel und Wortmarke in Einheiten. */
const ABSTAND = 12;
/** Luft um das ganze Logo in Einheiten, damit nichts am Rand klebt. */
const RAND = 4;
/** Ausgabegröße je Einheit — nur für die Zahlen im SVG-Kopf. */
const AUSGABE = 4;

/** Farbe der Wortmarke je Grund. */
export function wortFarbe(marke: Marke, modus: LogoModus): string {
  return modus === "dark" ? KNOCHENWEISS : marke.surface;
}

/**
 * Wie breit die Wortmarke im Raster ist: gemessen am letzten gemalten Pixel,
 * nicht am Vorschub der Buchstaben. Zeichnet eine Glyphe über ihren Vorschub
 * hinaus, schneidet der viewBox sie sonst an — genau das war beim „K" zu
 * sehen, dessen Arme bis an den Rand des Kästchens reichen.
 */
export function wortBreite(flecken: readonly Fleck[], vorschub: number): number {
  const gemalt = flecken.reduce((max, f) => Math.max(max, f.x + f.breite), 0);
  return Math.max(vorschub, gemalt);
}

/** SVG des Logos: Achteck-Kachel links, Wortmarke rechts. */
export function logoQuelle(marke: Marke, modus: LogoModus, text = marke.name): string {
  const size = marke.pixels.length;
  const { flecken, breite } = wortmarke(text.toUpperCase());
  const schriftBreite = wortBreite(flecken, breite) * SCHRIFT_MASS;
  const gesamtBreite = size + ABSTAND + schriftBreite + 2 * RAND;
  const gesamtHoehe = size + 2 * RAND;
  const schriftHoehe = HOEHE * SCHRIFT_MASS;
  const oben = RAND + Math.round((size - schriftHoehe) / 2);

  const zeichen = laeufe(marke).map(
    (l) =>
      `<rect x="${RAND + l.x}" y="${RAND + l.y}" width="${l.breite}" height="1" fill="${l.farbe}"/>`,
  );
  const buchstaben = flecken.map(
    (f) =>
      `<rect x="${RAND + size + ABSTAND + f.x * SCHRIFT_MASS}" y="${oben + f.y * SCHRIFT_MASS}" `
      + `width="${f.breite * SCHRIFT_MASS}" height="${f.hoehe * SCHRIFT_MASS}" fill="${wortFarbe(marke, modus)}"/>`,
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${gesamtBreite * AUSGABE}" height="${gesamtHoehe * AUSGABE}" viewBox="0 0 ${gesamtBreite} ${gesamtHoehe}" shape-rendering="crispEdges">
  <title>${marke.name}</title>
  <!-- Erzeugt von markenwerk aus marken/${marke.slug}.pm und src/schrift.ts.
       Nicht von Hand ändern: die Quelle sind die Raster, nicht dieses Bild.
       Fassung "${modus}": Wortmarke ${wortFarbe(marke, modus)}. -->
  <path d="${kachelPfad(size)}" transform="translate(${RAND} ${RAND})" fill="${marke.surface}"/>
${zeichen.join("\n")}
${buchstaben.join("\n")}
</svg>
`;
}
