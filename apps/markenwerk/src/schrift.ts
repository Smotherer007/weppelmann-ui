// Wortmarke aus Pixellettern.
//
// Warum eine eigene Schrift und nicht <text font-family="...">: ein SVG, das
// eine Systemschrift erwartet, sieht auf jedem Rechner anders aus — und die
// Marke soll überall gleich aussehen. Acht Buchstaben als Raster sind billiger
// als eine Schriftdatei und passen zur Regel „Icons entstehen aus Text".
//
// Raster: 7 Spalten breit, 10 Zeilen hoch, Strich 2 px (zwei Zellen). Nur das W
// braucht 12 Spalten: es besteht aus vier Schrägen, und drei Stämme mit Fugen
// passen nicht in 7. Bei Maßstab 2 sind das 14 × 20 Einheiten im 32er-Raster
// des Zeichens.
//
// Warum 10 statt 8 Zeilen: bei 8 war der Strich ein Viertel der Höhe und die
// Buchstaben standen wie Kästchen da. Die Vorlage (sprechwerk/docs/marke/
// entwurf.png) hat ein Verhältnis Strich:Höhe von etwa 1:5 — das sind bei
// 2 px Strich 10 Zeilen. Breite:Höhe ist dort etwa 0,74, hier 7:10 = 0,7;
// die Binnenweite ist dort 0,3 der Höhe, hier 3:10 = 0,3.
//
// Die Ecken sind gefast (eine Zelle weggeschnitten), weil die Vorlage keine
// Runden kennt, eine harte Rechteckecke aber nach Fenster aussieht. Beim „K"
// laufen beide Arme in der Mitte gegen den Stamm — kein abgesetzter Strich
// rechts, sonst liest es als „H" mit Punkt.

export type Glyphe = readonly string[];

/** Buchstaben der Wortmarke „SPRECHWERK" — was fehlt, ist ein Fehler. */
export const SCHRIFT: Record<string, Glyphe> = {
  C: [
    ".######",
    "#######",
    "##.....",
    "##.....",
    "##.....",
    "##.....",
    "##.....",
    "##.....",
    "#######",
    ".######",
  ],
  E: [
    "#######",
    "#######",
    "##.....",
    "##.....",
    "#####..",
    "#####..",
    "##.....",
    "##.....",
    "#######",
    "#######",
  ],
  H: [
    "##...##",
    "##...##",
    "##...##",
    "##...##",
    "#######",
    "#######",
    "##...##",
    "##...##",
    "##...##",
    "##...##",
  ],
  K: [
    "##...##",
    "##...##",
    "##..##.",
    "##..##.",
    "#####..",
    "#####..",
    "##..##.",
    "##..##.",
    "##...##",
    "##...##",
  ],
  P: [
    "######.",
    "#######",
    "##...##",
    "##...##",
    "#######",
    "######.",
    "##.....",
    "##.....",
    "##.....",
    "##.....",
  ],
  R: [
    "######.",
    "#######",
    "##...##",
    "##...##",
    "#######",
    "######.",
    "##.##..",
    "##..##.",
    "##...##",
    "##...##",
  ],
  S: [
    ".######",
    "#######",
    "##.....",
    "##.....",
    "#######",
    "#######",
    ".....##",
    ".....##",
    "#######",
    ".######",
  ],
  W: [
    "##...##...##",
    "##...##...##",
    "##..####..##",
    "##..####..##",
    "##.##..##.##",
    "##.##..##.##",
    ".###....###.",
    ".###....###.",
    ".##......##.",
    ".##......##.",
  ],
};

export class SchriftFehler extends Error {}

/** Höhe in Rasterzeilen, Breite je Buchstabe steht in der Glyphe selbst. */
export const HOEHE = 10;

/** Ein gesetzter Pixel der Wortmarke: Lage und Größe in Rasterzellen. */
export interface Fleck {
  x: number;
  y: number;
  breite: number;
  hoehe: number;
}

/**
 * Setzt einen Text in Pixellettern: je Zeile werden waagerechte Läufe
 * zusammengefasst, damit aus vielen Rechtecken wenige werden.
 *
 * `luecke` ist der Abstand zwischen zwei Buchstaben in Rasterzellen.
 */
export function wortmarke(text: string, luecke = 1): { flecken: Fleck[]; breite: number } {
  const flecken: Fleck[] = [];
  let x0 = 0;
  for (const zeichen of text.toUpperCase()) {
    if (zeichen === " ") {
      x0 += Math.max(2, luecke + 1);
      continue;
    }
    const glyphe = SCHRIFT[zeichen];
    if (!glyphe) {
      throw new SchriftFehler(
        `kein Buchstabe für "${zeichen}" — vorhanden: ${Object.keys(SCHRIFT).sort().join(" ")}`,
      );
    }
    glyphe.forEach((zeile, y) => {
      let x = 0;
      while (x < zeile.length) {
        if (zeile[x] !== "#") {
          x++;
          continue;
        }
        let bis = x;
        while (bis < zeile.length && zeile[bis] === "#") bis++;
        flecken.push({ x: x0 + x, y, breite: bis - x, hoehe: 1 });
        x = bis;
      }
    });
    x0 += glyphe[0].length + luecke;
  }
  // Die letzte Lücke gehört nicht zur Breite.
  return { flecken, breite: Math.max(0, x0 - luecke) };
}
