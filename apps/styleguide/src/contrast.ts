// Kontrast nach WCAG 2.2: relative Leuchtdichte und Verhältnis.
//
// Der Styleguide hat die Farbpaare bisher nur gezeigt, nicht geprüft — „sieht
// gut aus" ist keine Aussage. Hier steht die Rechnung der Spezifikation:
// L = 0.2126·R + 0.7152·G + 0.0722·B auf linearisierten Kanälen, Verhältnis
// (heller + 0.05) / (dunkler + 0.05). Schwellen: 4,5 für Text (AA), 7 für
// Text (AAA), 3 für Nicht-Text (Rahmen, Symbole, Fokusring).

/** Ein Farbwert als RGB in 0..255. */
export type Rgb = { r: number; g: number; b: number };

/** Liest `#rgb`, `#rrggbb` und `#rrggbbaa`; `null` bei allem anderen. */
export function parseHex(value: string): Rgb | null {
  const treffer = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(value.trim());
  if (!treffer) return null;
  let hex = treffer[1];
  if (hex.length === 3) hex = hex.split("").map((z) => z + z).join("");
  const n = Number.parseInt(hex.slice(0, 6), 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

/** Linearisierter Kanal nach WCAG (sRGB → lineares Licht). */
function linear(kanal: number): number {
  const c = kanal / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Relative Leuchtdichte 0..1. */
export function luminance({ r, g, b }: Rgb): number {
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** Kontrastverhältnis 1..21 zwischen zwei Farben. */
export function ratio(vorne: Rgb, hinten: Rgb): number {
  const a = luminance(vorne);
  const b = luminance(hinten);
  const hell = Math.max(a, b);
  const dunkel = Math.min(a, b);
  return (hell + 0.05) / (dunkel + 0.05);
}

/** Stufe als kurzes Etikett für die Anzeige. */
export function stufe(verhaeltnis: number, schwelle: "text" | "nontext" = "text"): string {
  const aa = schwelle === "text" ? 4.5 : 3;
  const aaa = schwelle === "text" ? 7 : 4.5;
  if (verhaeltnis >= aaa) return "AAA";
  if (verhaeltnis >= aa) return "AA";
  return "—";
}
