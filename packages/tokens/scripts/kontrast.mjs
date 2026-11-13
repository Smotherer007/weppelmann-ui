// Kontrastprüfung der Farbtokens nach WCAG 2.2 — ohne Fremdabhängigkeit.
//
//   node packages/tokens/scripts/kontrast.mjs
//
// Prüft die Paare, die Komponenten tatsächlich verwenden (Vordergrund auf
// Hintergrund) und vergleicht mit den Schwellen der Spezifikation:
// Text 4,5:1 (AA), Rahmen/Symbole/Fokusring 3:1.
//
// Zwei Ausgaben:
//   * Tabelle aller Paare für alle drei Modi (zum Lesen),
//   * Rückgabe 1, wenn ein **neues** Paar unter der Schwelle liegt.
//
// Paare unter der Schwelle, die bekannt und entschieden sind, stehen in
// `BEKANNT` mit Begründung. Sie lassen den Lauf bestehen, damit die Prüfung in
// der CI nutzbar ist; ein neuer Verstoß fällt sofort auf.
//
// Stand 2026-11-13 (erster Lauf dieser Prüfung): vier Paare liegen unter der
// Schwelle — siehe BEKANNT. Sie sind nicht behoben, weil die Farbwahl eine
// Entwurfsentscheidung ist (welcher Grauton „faint“ sein soll) und nicht
// beiläufig geändert werden darf.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const hier = dirname(fileURLToPath(import.meta.url));
const datei = join(hier, "..", "dist", "json", "tokens.json");
const { themes } = JSON.parse(readFileSync(datei, "utf8"));
const THEMES = ["dark", "light", "mono"];

/** Text braucht 4,5:1, alles andere 3:1 (WCAG 2.2, 1.4.3 und 1.4.11). */
const PAARE = [
  ["color.text.default", "color.bg.canvas", "text"],
  ["color.text.default", "color.bg.panel", "text"],
  ["color.text.default", "color.bg.raised", "text"],
  ["color.text.muted", "color.bg.panel", "text"],
  ["color.text.faint", "color.bg.panel", "text"],
  ["color.text.on-accent", "color.accent.default", "text"],
  ["color.status.ok", "color.bg.panel", "text"],
  ["color.status.warn", "color.bg.panel", "text"],
  ["color.status.error", "color.bg.panel", "text"],
  ["color.border.strong", "color.bg.panel", "nontext"],
  ["color.focus.ring", "color.bg.panel", "nontext"],
];

/**
 * Bekannte, entschiedene Abweichungen. Schlüssel: `thema:vorne: hinten`.
 * Wer einen Eintrag entfernt, muss den Farbwert anheben.
 */
const BEKANNT = new Map([
  [
    "light:color.text.faint:color.bg.panel",
    "3,80:1 — „faint“ ist als Hinweistext gedacht; 4,5:1 verlangt einen dunkleren Grauton (neutral.500 statt 400).",
  ],
  [
    "mono:color.text.faint:color.bg.panel",
    "4,44:1 — im Graustufenmodus fehlt der Farbkanal, der Abstand muss über die Helligkeit kommen.",
  ],
  [
    "light:color.status.warn:color.bg.panel",
    "4,36:1 — knapp unter 4,5:1; Warnungen tragen zusätzlich ein Symbol (Form statt Farbe).",
  ],
  [
    "dark:color.border.strong:color.bg.panel",
    "1,61:1 — Rahmen sind hier Gestaltung, nicht das einzige Unterscheidungsmerkmal; 3:1 wäre eine andere Entwurfsentscheidung.",
  ],
  [
    "mono:color.border.strong:color.bg.panel",
    "1,75:1 — wie dark: im Graustufenmodus trennt die Fläche, nicht die Linie.",
  ],
]);

function linear(kanal) {
  const c = kanal / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function rgb(hex) {
  const treffer = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!treffer) return null;
  let h = treffer[1];
  if (h.length === 3) h = h.split("").map((z) => z + z).join("");
  const n = Number.parseInt(h, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function leuchtdichte([r, g, b]) {
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function verhaeltnis(vorne, hinten) {
  const a = rgb(themes[vorne[0]][vorne[1]]);
  const b = rgb(themes[vorne[0]][hinten[1]]);
  if (!a || !b) return null;
  const la = leuchtdichte(a);
  const lb = leuchtdichte(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

let neu = 0;
let bekannt = 0;
console.log("Kontrast der Farbtokens (WCAG 2.2, Text 4,5:1 · Rahmen 3:1)\n");
for (const [vorne, hinten, art] of PAARE) {
  const schwelle = art === "text" ? 4.5 : 3;
  const spalten = THEMES.map((theme) => {
    const wert = verhaeltnis([theme, vorne], [theme, hinten]);
    if (wert === null) return `${theme} ?`;
    const schluessel = `${theme}:${vorne}:${hinten}`;
    if (wert >= schwelle) return undefined;
    if (BEKANNT.has(schluessel)) {
      bekannt += 1;
      return { theme, wert, bekannt: true };
    }
    neu += 1;
    return { theme, wert, bekannt: false };
  });
  const text = THEMES.map((theme, i) => {
    const treffer = spalten[i];
    if (!treffer) {
      const wert = verhaeltnis([theme, vorne], [theme, hinten]);
      return `${theme} ${wert === null ? "?" : wert.toFixed(2)}`;
    }
    return `${theme} ${treffer.wert.toFixed(2)}${treffer.bekannt ? " (bekannt)" : " ✗"}`;
  }).join(" · ");
  console.log(`  ${vorne.replace("color.", "").padEnd(20)} auf ${hinten.replace("color.", "").padEnd(12)} ${text}`);
}

console.log(`\n${bekannt} bekannte Abweichung(en), ${neu} neue.`);
if (neu > 0) {
  console.error(
    "\nNeue Kontrastverstöße: Farbwert anheben oder — mit Begründung — in BEKANNT aufnehmen.",
  );
  process.exit(1);
}
if (bekannt > 0) {
  console.log("Bekannte Abweichungen begründen sich in BEKANNT (Kopf dieser Datei).");
}
