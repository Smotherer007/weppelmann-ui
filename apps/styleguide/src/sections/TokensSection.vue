<script setup lang="ts">
// Tokens: die einzige Farb- und Maßquelle. Der Styleguide liest die gebaute
// JSON, damit er nicht von der Bibliothek abweichen kann.
import { computed, ref } from "vue";
import tokens from "@weppelmann/tokens";

type Theme = "dark" | "light" | "mono";
const themes = (tokens as unknown as { themes: Record<Theme, Record<string, string>> }).themes;
const current = ref<Theme>("dark");
const themeNames: Theme[] = ["dark", "light", "mono"];
const colors = computed(() => Object.entries(themes[current.value]).filter(([k]) => k.startsWith("color.")));
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
    <div class="swatches">
      <div v-for="[path, value] in colors" :key="path" class="swatch">
        <span class="chip" :style="{ background: value }" />
        <span class="name">--wp-{{ path.replace(/\./g, '-').replace('color-', 'color-') }}</span>
        <span class="value">{{ value }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 2px; }
.swatch { display: grid; grid-template-columns: 28px 1fr auto; align-items: center; gap: var(--wp-space-2); padding: 3px var(--wp-space-2); }
.chip { width: 28px; height: 20px; border: var(--wp-size-border) solid var(--wp-color-border-subtle); }
.name, .value { font-family: var(--wp-font-family-mono); font-size: 11px; }
.name { color: var(--wp-color-text-muted); }
.value { color: var(--wp-color-text-faint); }
.page-switch { display: flex; gap: 2px; }
.page-switch button { background: var(--wp-color-bg-raised); border: var(--wp-size-border) solid var(--wp-color-border-subtle); color: var(--wp-color-text-muted); font: inherit; font-size: var(--wp-font-size-sm); padding: 6px var(--wp-space-3); cursor: pointer; }
.page-switch button[aria-selected="true"] { color: var(--wp-color-text-default); border-color: var(--wp-color-accent-default); }
</style>
