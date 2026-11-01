<script setup lang="ts">
// Living Styleguide nach Atomic Design: Atome, Moleküle, Organismen, Templates, Pages.
// Die Ebenen sind getrennt, damit sichtbar wird, woraus die Seiten gebaut sind.
import { ref, watchEffect } from "vue";
import { IconBrand } from "@weppelmann/icons";
import * as UI from "@weppelmann/components";
import TokensSection from "./sections/TokensSection.vue";
import AtomsSection from "./sections/AtomsSection.vue";
import MoleculesSection from "./sections/MoleculesSection.vue";
import OrganismsSection from "./sections/OrganismsSection.vue";
import KatalogPage from "./pages/KatalogPage.vue";
import AmbilightPage from "./pages/AmbilightPage.vue";
import EinstellungenPage from "./pages/EinstellungenPage.vue";

type Theme = "dark" | "light" | "mono";
type Platform = "linux" | "windows" | "macos";

const theme = ref<Theme>("dark");
const platform = ref<Platform>("linux");
const page = ref<"katalog" | "ambilight" | "einstellungen">("ambilight");

watchEffect(() => {
  const root = document.documentElement;
  root.dataset.theme = theme.value;
  root.dataset.platform = platform.value;
});

const levels = [
  { id: "atome", label: "Atome", note: "1" },
  { id: "molekuele", label: "Moleküle", note: "2" },
  { id: "organismen", label: "Organismen", note: "3" },
  { id: "seiten", label: "Seiten", note: "4" },
  { id: "tokens", label: "Tokens", note: "—" },
];
</script>

<template>
  <div class="wp-root app">
    <header class="topbar">
      <div class="brand">
        <UI.WpIcon :icon="IconBrand" size="lg" class="brand__mark" />
        <div>
          <p class="brand__name">Weppelmann UI</p>
          <p class="brand__sub">Atomic Design · Living Styleguide</p>
        </div>
      </div>
      <nav class="levels" aria-label="Ebenen">
        <a v-for="l in levels" :key="l.id" :href="`#${l.id}`" class="levels__link">
          <span class="levels__idx" aria-hidden="true">{{ l.note }}</span>{{ l.label }}
        </a>
      </nav>
      <div class="controls">
        <label class="control">
          <span>Theme</span>
          <select v-model="theme">
            <option value="dark">dark</option>
            <option value="light">light</option>
            <option value="mono">mono</option>
          </select>
        </label>
        <label class="control">
          <span>Plattform</span>
          <select v-model="platform">
            <option value="linux">linux</option>
            <option value="windows">windows</option>
            <option value="macos">macos</option>
          </select>
        </label>
      </div>
    </header>

    <main>
      <AtomsSection />
      <MoleculesSection />
      <OrganismsSection />

      <section id="seiten" class="block">
        <header class="block__head">
          <div>
            <p class="block__level">Ebene 5 · Pages</p>
            <h2>Seiten — so sieht es zusammengesetzt aus</h2>
            <p class="block__note">
              Template plus echte Beispieldaten. Die Seiten sind die Vorlage für die
              App-Bildschirme: oben die Anwendung, die hier gezeigt wird.
            </p>
          </div>
          <div class="page-switch" role="tablist" aria-label="Beispielseite">
            <button type="button" role="tab" :aria-selected="page === 'ambilight'" @click="page = 'ambilight'">Ambilight</button>
            <button type="button" role="tab" :aria-selected="page === 'katalog'" @click="page = 'katalog'">Addon-Katalog</button>
            <button type="button" role="tab" :aria-selected="page === 'einstellungen'" @click="page = 'einstellungen'">Einstellungen</button>
          </div>
        </header>
        <div class="frame">
          <AmbilightPage v-if="page === 'ambilight'" />
          <KatalogPage v-else-if="page === 'katalog'" />
          <EinstellungenPage v-else />
        </div>
      </section>

      <TokensSection />
    </main>

    <footer class="foot">
      <span>Theme <code>{{ theme }}</code> · Plattform <code>{{ platform }}</code></span>
      <span>Ecken sind eckig — es gibt keine Radius-Tokens.</span>
    </footer>
  </div>
</template>

<style>
.app { max-width: 1180px; margin: 0 auto; padding: var(--wp-space-5) var(--wp-space-5) var(--wp-space-8); }
.topbar {
  display: flex; align-items: flex-start; gap: var(--wp-space-4); flex-wrap: wrap;
  row-gap: var(--wp-space-2);
  padding: var(--wp-space-2) 0 var(--wp-space-3);
  border-bottom: var(--wp-size-border) solid var(--wp-color-border-subtle);
  position: sticky; top: 0; z-index: 50; background: var(--wp-color-bg-canvas);
}
.brand { display: flex; align-items: flex-start; gap: var(--wp-space-2); flex: none; }
.brand__mark { color: var(--wp-color-accent-default); }
.brand__name { margin: 0; font-size: var(--wp-font-size-md); font-weight: var(--wp-font-weight-semibold); }
.brand__sub { margin: 0; font-size: var(--wp-font-size-xs); color: var(--wp-color-text-faint); letter-spacing: 0.04em; }
.levels { display: flex; gap: var(--wp-space-1); flex: 1 1 380px; flex-wrap: wrap; align-items: flex-start; }
.levels__link {
  display: inline-flex; align-items: center; gap: 5px; line-height: 1.2;
  padding: 4px var(--wp-space-2); text-decoration: none; white-space: nowrap;
  color: var(--wp-color-text-muted); font-size: var(--wp-font-size-sm);
  border: var(--wp-size-border) solid transparent;
}
.levels__link:hover { color: var(--wp-color-text-default); border-color: var(--wp-color-border-subtle); background: var(--wp-color-bg-hover); }
.levels__idx { font-family: var(--wp-font-family-mono); font-size: 10px; color: var(--wp-color-accent-default); }
.controls { display: flex; gap: var(--wp-space-3); }
.control { display: flex; flex-direction: column; gap: 2px; font-size: var(--wp-font-size-xs); color: var(--wp-color-text-faint); }
.control select {
  background: var(--wp-color-bg-input); color: var(--wp-color-text-default);
  border: var(--wp-size-border) solid var(--wp-color-border-subtle);
  padding: 5px var(--wp-space-2); font: inherit; font-size: var(--wp-font-size-sm);
}
.block { padding-top: var(--wp-space-6); scroll-margin-top: 72px; }
.block + .block { margin-top: var(--wp-space-8); padding-top: var(--wp-space-6); border-top: var(--wp-size-border) solid var(--wp-color-border-subtle); }
.block__head { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--wp-space-4); flex-wrap: wrap; margin-bottom: var(--wp-space-3); }
.block__level { margin: 0 0 2px; font-family: var(--wp-font-family-mono); font-size: var(--wp-font-size-xs); color: var(--wp-color-accent-default); letter-spacing: 0.06em; text-transform: uppercase; }
.block__note { margin: 4px 0 0; font-size: var(--wp-font-size-sm); color: var(--wp-color-text-muted); max-width: 68ch; }
.block h2 { margin: 0; font-size: var(--wp-font-size-xl); font-weight: var(--wp-font-weight-semibold); }
.page-switch { display: flex; gap: 2px; }
.page-switch button {
  background: var(--wp-color-bg-raised); border: var(--wp-size-border) solid var(--wp-color-border-subtle);
  color: var(--wp-color-text-muted); font: inherit; font-size: var(--wp-font-size-sm);
  padding: 6px var(--wp-space-3); cursor: pointer;
}
.page-switch button[aria-selected="true"] { color: var(--wp-color-text-default); border-color: var(--wp-color-accent-default); }
.frame { border: var(--wp-size-border) solid var(--wp-color-border-strong); background: var(--wp-color-bg-canvas); min-height: 420px; }
.foot { display: flex; justify-content: space-between; gap: var(--wp-space-3); margin-top: var(--wp-space-7); padding-top: var(--wp-space-3); border-top: var(--wp-size-border) solid var(--wp-color-border-subtle); font-size: var(--wp-font-size-xs); color: var(--wp-color-text-faint); }
.foot code { font-family: var(--wp-font-family-mono); }
</style>
