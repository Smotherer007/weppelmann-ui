<script setup lang="ts">
// Tokens: die einzige Farb- und Maßquelle. Der Styleguide liest die gebaute
// JSON, damit er nicht von der Bibliothek abweichen kann.
//
// Bis 2026-11-13 zeigte diese Seite **nur Farben** (`themes`), obwohl sie sich
// „Farb- und Maßquelle" nannte: Abstände, Radien, Schrift und Dauern waren
// unsichtbar, Kontrast wurde nirgends geprüft. Jetzt stehen hier alle drei
// Ebenen — Farben je Modus, Maße (modusunabhängig) und die Kontrastprüfung
// nach WCAG 2.2.
import { computed, ref } from "vue";
import tokens from "@weppelmann/tokens";
import { parseHex, ratio, stufe } from "../contrast";

type Theme = "dark" | "light" | "mono";

type TokenDatei = {
  base: Record<string, string>;
  themes: Record<Theme, Record<string, string>>;
};

const datei = tokens as unknown as TokenDatei;
const themes = datei.themes;
const base = datei.base ?? {};
const themeNames: Theme[] = ["dark", "light", "mono"];

const current = ref<Theme>("dark");
const colors = computed(() =>
  Object.entries(themes[current.value]).filter(([k]) => k.startsWith("color.")),
);

/** Name der CSS-Variable zu einem Tokenpfad (`color.bg.canvas` → `--wp-color-bg-canvas`). */
function cssName(pfad: string): string {
  return `--wp-${pfad.replace(/\./g, "-")}`;
}

/** Die Maße nach Gruppen, in der Reihenfolge der Spezifikation. */
const massGruppen = computed(() => {
  const gruppen = new Map<string, [string, string][]>();
  for (const [pfad, wert] of Object.entries(base)) {
    const name = pfad.split(".")[0];
    // `font.family` ist lang und gehört sichtbar in die Schriftprobe, nicht in
    // eine Wertspalte; die Gruppe bleibt trotzdem vollständig.
    if (!gruppen.has(name)) gruppen.set(name, []);
    gruppen.get(name)!.push([pfad, wert]);
  }
  const reihenfolge = ["space", "radius", "size", "font", "duration"];
  return [...gruppen.entries()]
    .sort((a, b) => reihenfolge.indexOf(a[0]) - reihenfolge.indexOf(b[0]))
    .map(([name, werte]) => [name, werte.sort((a, b) => a[0].localeCompare(b[0]))] as const);
});

/**
 * Die Paare, die im Betrieb tatsächlich aufeinandertreffen — nicht alle
 * Kombinationen, sondern die, die eine Komponente verwendet. `nontext` heißt:
 * 3:1 genügt (Rahmen, Symbole, Fokusring), sonst 4,5:1 für Text.
 */
const paare: { vorne: string; hinten: string; art: "text" | "nontext"; wo: string }[] = [
  { vorne: "color.text.default", hinten: "color.bg.canvas", art: "text", wo: "Fließtext" },
  { vorne: "color.text.default", hinten: "color.bg.panel", art: "text", wo: "Text in Flächen" },
  { vorne: "color.text.default", hinten: "color.bg.raised", art: "text", wo: "Dialog, Menü" },
  { vorne: "color.text.muted", hinten: "color.bg.panel", art: "text", wo: "Nebentext" },
  { vorne: "color.text.faint", hinten: "color.bg.panel", art: "text", wo: "Hinweise" },
  { vorne: "color.text.on-accent", hinten: "color.accent.default", art: "text", wo: "Text auf Akzent" },
  { vorne: "color.status.ok", hinten: "color.bg.panel", art: "text", wo: "Status ok" },
  { vorne: "color.status.warn", hinten: "color.bg.panel", art: "text", wo: "Status warn" },
  { vorne: "color.status.error", hinten: "color.bg.panel", art: "text", wo: "Status error" },
  { vorne: "color.border.strong", hinten: "color.bg.panel", art: "nontext", wo: "Rahmen" },
  { vorne: "color.focus.ring", hinten: "color.bg.panel", art: "nontext", wo: "Fokusring" },
];

/** Eine Zeile der Kontrastprüfung, je Modus gerechnet. */
const kontrast = computed(() =>
  paare.map((paar) => {
    const ergebnis = themeNames.map((theme) => {
      const vorne = parseHex(themes[theme][paar.vorne] ?? "");
      const hinten = parseHex(themes[theme][paar.hinten] ?? "");
      if (!vorne || !hinten) return { theme, wert: null as number | null, stufe: "?" };
      const wert = ratio(vorne, hinten);
      return { theme, wert, stufe: stufe(wert, paar.art) };
    });
    return { ...paar, werte: ergebnis };
  }),
);

const durchgefallen = computed(() =>
  kontrast.value.filter((z) => z.werte.some((w) => w.stufe === "—")).length,
);

function zahl(wert: number | null): string {
  return wert === null ? "–" : `${wert.toFixed(2)}:1`;
}
</script>

<template>
  <section id="tokens" class="block">
    <header class="block__head">
      <div>
        <p class="block__level">Fundament · Tokens</p>
        <h2>Tokens</h2>
        <p class="block__note">
          DTCG-JSON, drei Modi. Komponenten greifen nur auf die semantische Ebene zu.
          Wer einen Hex-Wert schreibt, hat diese Seite nicht gelesen.
        </p>
      </div>
      <div class="page-switch">
        <button v-for="t in themeNames" :key="t" type="button"
                :aria-selected="current === t" @click="current = t">{{ t }}</button>
      </div>
    </header>

    <h3 class="gruppe">Farben je Modus ({{ colors.length }})</h3>
    <div class="swatches">
      <div v-for="[path, value] in colors" :key="path" class="swatch">
        <span class="chip" :style="{ background: value }" />
        <span class="name">{{ cssName(path) }}</span>
        <span class="value">{{ value }}</span>
      </div>
    </div>

    <h3 class="gruppe">Maße, Schrift und Dauer (modusunabhängig)</h3>
    <div class="masse">
      <div v-for="[gruppe, werte] in massGruppen" :key="gruppe" class="masse__block">
        <p class="masse__kopf">{{ gruppe }} <span class="masse__zahl">{{ werte.length }}</span></p>
        <div v-for="[pfad, wert] in werte" :key="pfad" class="masse__zeile">
          <span class="masse__name">{{ cssName(pfad) }}</span>
          <!-- Vorschau: Abstand als Balken, Radius als Ecke, Größe als Kasten,
               Schrift als Probe, Dauer als laufender Punkt. -->
          <span class="masse__bild">
            <template v-if="gruppe === 'space'">
              <span class="balken" :style="{ width: wert }" />
            </template>
            <template v-else-if="gruppe === 'radius'">
              <span class="ecke" :style="{ borderRadius: wert }" />
            </template>
            <template v-else-if="gruppe === 'size' && pfad !== 'size.border' && pfad !== 'size.focus'">
              <span class="kasten" :style="{ height: wert }" />
            </template>
            <template v-else-if="gruppe === 'font' && pfad.startsWith('font.size')">
              <span :style="{ fontSize: wert }">Ag</span>
            </template>
            <template v-else-if="gruppe === 'duration'">
              <span class="punkt" :style="{ animationDuration: wert }" />
            </template>
          </span>
          <span class="masse__wert">{{ wert }}</span>
        </div>
      </div>
    </div>

    <h3 class="gruppe">
      Kontrast nach WCAG 2.2
      <span class="masse__zahl" :class="{ schlecht: durchgefallen > 0 }">
        {{ durchgefallen === 0 ? "alle Paare bestehen" : `${durchgefallen} Paar(e) unter der Schwelle` }}
      </span>
    </h3>
    <p class="block__note">
      Gerechnet mit der Formel der Spezifikation (relative Leuchtdichte, Verhältnis
      hell/dunkel). Text braucht 4,5:1 (AA) bzw. 7:1 (AAA), Rahmen und Symbole 3:1.
      Die Paare sind die, die Komponenten tatsächlich verwenden.
    </p>
    <table class="kontrast">
      <thead>
        <tr>
          <th scope="col">Paar</th>
          <th v-for="t in themeNames" :key="t" scope="col">{{ t }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="zeile in kontrast" :key="zeile.vorne + zeile.hinten">
          <th scope="row">
            <span class="kontrast__wo">{{ zeile.wo }}</span>
            <span class="kontrast__paar">
              {{ cssName(zeile.vorne) }} auf {{ cssName(zeile.hinten) }}
              <em v-if="zeile.art === 'nontext'">(3:1)</em>
            </span>
          </th>
          <td v-for="w in zeile.werte" :key="w.theme"
              :class="{ schlecht: w.stufe === '—' }">
            {{ zahl(w.wert) }} <span class="stufe">{{ w.stufe }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.gruppe {
  margin: var(--wp-space-5) 0 var(--wp-space-2);
  font-size: var(--wp-font-size-md);
  font-weight: var(--wp-font-weight-semibold);
  color: var(--wp-color-text-default);
  display: flex;
  gap: var(--wp-space-3);
  align-items: baseline;
}
.swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 2px; }
.swatch { display: grid; grid-template-columns: 28px 1fr auto; align-items: center; gap: var(--wp-space-2); padding: 3px var(--wp-space-2); }
.chip { width: 28px; height: 20px; border: var(--wp-size-border) solid var(--wp-color-border-subtle); }
.name, .value { font-family: var(--wp-font-family-mono); font-size: 11px; }
.name { color: var(--wp-color-text-muted); }

.masse { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: var(--wp-space-4); }
.masse__block { min-width: 0; }
.masse__kopf {
  margin: 0 0 var(--wp-space-1);
  font-family: var(--wp-font-family-mono);
  font-size: 11px;
  color: var(--wp-color-text-default);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.masse__zahl { color: var(--wp-color-text-faint); font-size: 11px; text-transform: none; letter-spacing: 0; }
.masse__zeile {
  display: grid;
  grid-template-columns: 1fr 96px auto;
  align-items: center;
  gap: var(--wp-space-2);
  padding: 2px 0;
}
.masse__name { font-family: var(--wp-font-family-mono); font-size: 11px; color: var(--wp-color-text-muted); }
.masse__bild { display: flex; align-items: center; height: 18px; overflow: hidden; }
.masse__wert { font-family: var(--wp-font-family-mono); font-size: 11px; color: var(--wp-color-text-faint); text-align: right; }
.balken { display: block; height: 8px; background: var(--wp-color-accent-default); }
.ecke { display: block; width: 18px; height: 18px; background: var(--wp-color-accent-default); }
.kasten { display: block; width: 40px; background: var(--wp-color-bg-raised); border: var(--wp-size-border) solid var(--wp-color-border-strong); }
.punkt {
  display: block;
  width: 8px;
  height: 8px;
  background: var(--wp-color-accent-default);
  animation-name: masse-lauf;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}
@keyframes masse-lauf { from { margin-left: 0; } to { margin-left: 76px; } }

.kontrast { width: 100%; border-collapse: collapse; font-size: 11px; }
.kontrast th, .kontrast td {
  text-align: left;
  padding: 3px var(--wp-space-2);
  border-bottom: var(--wp-size-border) solid var(--wp-color-border-subtle);
  vertical-align: top;
}
.kontrast thead th {
  font-family: var(--wp-font-family-mono);
  font-size: 11px;
  color: var(--wp-color-text-default);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.kontrast__wo { display: block; font-size: var(--wp-font-size-sm); color: var(--wp-color-text-default); }
.kontrast__paar { display: block; font-family: var(--wp-font-family-mono); font-size: 11px; color: var(--wp-color-text-faint); }
.kontrast td { font-family: var(--wp-font-family-mono); white-space: nowrap; }
.stufe { color: var(--wp-color-status-ok); margin-left: var(--wp-space-1); }
.schlecht, .schlecht .stufe { color: var(--wp-color-status-error); }
.schlecht { font-weight: var(--wp-font-weight-semibold); }
</style>
