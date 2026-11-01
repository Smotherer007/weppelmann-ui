<script setup lang="ts">
// Living Styleguide: zeigt Tokens und Komponenten in allen drei Themes.
// Er liest dieselben Quellen wie die Apps (packages/tokens/dist), damit der
// Katalog nicht von der Bibliothek abweichen kann.
import { computed, ref, watchEffect } from "vue";
import tokens from "@weppelmann/tokens";
import { WpButton, WpBadge, WpStack } from "@weppelmann/components";

type Theme = "dark" | "light" | "mono";
type Platform = "linux" | "windows" | "macos";

const theme = ref<Theme>("dark");
const platform = ref<Platform>("linux");

// Theme und Plattform sind Daten, die am Wurzelelement ankommen — genau der Weg,
// den die Apps später auch gehen (AGENTS.md §2.10).
watchEffect(() => {
  const root = document.documentElement;
  root.dataset.theme = theme.value;
  root.dataset.platform = platform.value;
});

const tokenThemes = (tokens as any).themes as Record<Theme, Record<string, string>>;

const colorGroups = computed(() => {
  const current = tokenThemes[theme.value];
  const groups: Record<string, { name: string; value: string }[]> = {};
  for (const [path, value] of Object.entries(current)) {
    if (!path.startsWith("color.")) continue;
    const [, group, name] = path.split(".");
    (groups[group] ??= []).push({ name, value });
  }
  return groups;
});

const variants = ["primary", "secondary", "ghost", "danger"] as const;
const states = ["default", "busy", "disabled"] as const;
const tones = ["neutral", "ok", "warn", "error"] as const;
</script>

<template>
  <div class="wp-root shell">
    <header class="head">
      <div>
        <h1>Weppelmann UI</h1>
        <p class="sub">Living Styleguide — Tokens und Komponenten, die die Apps teilen.</p>
      </div>
      <div class="switches">
        <label>
          Theme
          <select v-model="theme">
            <option value="dark">dark</option>
            <option value="light">light</option>
            <option value="mono">mono</option>
          </select>
        </label>
        <label>
          Plattform
          <select v-model="platform">
            <option value="linux">linux</option>
            <option value="windows">windows</option>
            <option value="macos">macos</option>
          </select>
        </label>
      </div>
    </header>

    <section>
      <h2>Farben — semantisch, Modus „{{ theme }}“</h2>
      <div v-for="(items, group) in colorGroups" :key="group" class="group">
        <h3>{{ group }}</h3>
        <div class="swatches">
          <div v-for="item in items" :key="item.name" class="swatch">
            <span class="chip" :style="{ background: item.value }" />
            <span class="name">--wp-color-{{ group }}-{{ item.name }}</span>
            <span class="value">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h2>Schaltflächen — Variante × Zustand</h2>
      <table class="matrix">
        <thead>
          <tr><th>Variante</th><th v-for="s in states" :key="s">{{ s }}</th></tr>
        </thead>
        <tbody>
          <tr v-for="v in variants" :key="v">
            <th>{{ v }}</th>
            <td v-for="s in states" :key="s">
              <WpButton :label="v" :variant="v" :state="s" />
            </td>
          </tr>
        </tbody>
      </table>
      <p class="note">
        Zustand ist ein Summentyp: <code>busy</code> und <code>disabled</code> sind keine
        Flags, sondern Werte. Kombinationen wie „busy und disabled“ gibt es nicht.
      </p>
    </section>

    <section>
      <h2>Marken</h2>
      <WpStack direction="row" gap="sm">
        <WpBadge v-for="t in tones" :key="t" :tone="t" :label="t" />
      </WpStack>
      <p class="note">In <code>mono</code> unterscheidet die Form, nicht die Farbe.</p>
    </section>

    <section>
      <h2>Tonhöhen (Auszug)</h2>
      <WpStack gap="xs">
        <WpButton label="Primär" variant="primary" size="lg" />
        <WpButton label="Sekundär" variant="secondary" />
        <WpButton label="Leise" variant="ghost" size="sm" />
        <WpButton label="Löschen" variant="danger" />
      </WpStack>
    </section>

    <footer class="foot">
      Tokens: {{ Object.keys(tokenThemes[theme]).length }} semantische Werte ·
      Theme <code>{{ theme }}</code> · Plattform <code>{{ platform }}</code>
    </footer>
  </div>
</template>

<style>
.shell { max-width: 1100px; margin: 0 auto; padding: 32px 24px 64px; }
.head { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; flex-wrap: wrap; }
h1 { font-size: 28px; font-weight: 600; margin: 0 0 4px; }
h2 { font-size: 16px; font-weight: 600; margin: 40px 0 12px; }
h3 { font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em;
     color: var(--wp-color-text-muted); margin: 16px 0 8px; }
.sub, .note { color: var(--wp-color-text-muted); font-size: 13px; margin: 0; }
code { font-family: ui-monospace, Menlo, monospace; font-size: 12px;
       background: var(--wp-color-bg-raised); padding: 1px 5px; border-radius: 4px; }
.switches { display: flex; gap: 16px; }
.switches label { display: flex; flex-direction: column; gap: 4px; font-size: 12px;
                  color: var(--wp-color-text-muted); }
.switches select { background: var(--wp-color-bg-input); color: var(--wp-color-text-default);
                   border: 1px solid var(--wp-color-border-subtle); border-radius: 8px;
                   padding: 6px 10px; font: inherit; }
.swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 4px; }
.swatch { display: grid; grid-template-columns: 28px 1fr auto; align-items: center; gap: 8px;
          padding: 4px 8px; border-radius: 6px; }
.chip { width: 28px; height: 20px; border-radius: 4px; border: 1px solid var(--wp-color-border-subtle); }
.name { font-family: ui-monospace, Menlo, monospace; font-size: 11px; color: var(--wp-color-text-muted); }
.value { font-family: ui-monospace, Menlo, monospace; font-size: 11px; color: var(--wp-color-text-faint); }
.matrix { border-collapse: collapse; }
.matrix th { text-align: left; font-size: 12px; color: var(--wp-color-text-muted);
             padding: 6px 16px 6px 0; font-weight: 500; }
.matrix td { padding: 4px 16px 4px 0; }
.foot { margin-top: 48px; padding-top: 16px; border-top: 1px solid var(--wp-color-border-subtle);
        color: var(--wp-color-text-faint); font-size: 12px; }
</style>
