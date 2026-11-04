<script setup lang="ts">
// Molekül: Reiterleiste. Tastatur nach WAI-ARIA (Pfeile, Home, End).
// Das Panel liefert die Seite über den Slot — die Reiterleiste kennt keine Inhalte.
import type { Tab } from "../types";

const props = defineProps<{
  modelValue: string;
  tabs: Tab[];
  label?: string;
  /**
   * Nur die Reiter, kein Inhaltsbereich. Für Navigation in der Kopfzeile:
   * dort steht die Leiste, der Inhalt kommt weiter unten in der Ansicht.
   */
  bare?: boolean;
  /**
   * `underline` = Reiter mit Unterstrich (Inhaltsbereiche).
   * `segments` = gefüllte Segmente über die volle Höhe (Navigation in einer
   * Kopfzeile). Kein Unterstrich, sondern Fläche und Akzentfarbe.
   */
  variant?: "underline" | "segments";
}>();
const emit = defineEmits<{ "update:modelValue": [id: string] }>();

const base = `wp-tabs-${Math.random().toString(36).slice(2, 8)}`;

function step(from: string, direction: 1 | -1, tabs: Tab[]) {
  const usable = tabs.filter((t) => !t.disabled);
  if (usable.length === 0) return;
  const index = usable.findIndex((t) => t.id === from);
  const next = usable[(index + direction + usable.length) % usable.length];
  if (next) emit("update:modelValue", next.id);
}

function edge(which: "first" | "last", tabs: Tab[]) {
  const usable = tabs.filter((t) => !t.disabled);
  const next = which === "first" ? usable[0] : usable[usable.length - 1];
  if (next) emit("update:modelValue", next.id);
}

function onKey(event: KeyboardEvent) {
  const handlers: Record<string, () => void> = {
    ArrowRight: () => step(props.modelValue, 1, props.tabs),
    ArrowLeft: () => step(props.modelValue, -1, props.tabs),
    Home: () => edge("first", props.tabs),
    End: () => edge("last", props.tabs),
  };
  const handler = handlers[event.key];
  if (handler) {
    event.preventDefault();
    handler();
  }
}
</script>

<template>
  <div class="wp-tabs" :class="`is-${variant ?? 'underline'}`">
    <div class="wp-tabs__list" role="tablist" :aria-label="label">
      <button
        v-for="tab in tabs"
        :id="`${base}-tab-${tab.id}`"
        :key="tab.id"
        type="button"
        role="tab"
        class="wp-tabs__tab"
        :class="{ 'is-active': tab.id === modelValue }"
        :aria-selected="tab.id === modelValue"
        :aria-controls="`${base}-panel`"
        :tabindex="tab.id === modelValue ? 0 : -1"
        :disabled="tab.disabled"
        @click="emit('update:modelValue', tab.id)"
        @keydown="onKey"
      >
        {{ tab.label }}
        <span v-if="tab.badge" class="wp-tabs__badge">{{ tab.badge }}</span>
      </button>
    </div>
    <div
      v-if="!bare"
      :id="`${base}-panel`"
      class="wp-tabs__panel"
      role="tabpanel"
      :aria-labelledby="`${base}-tab-${modelValue}`"
    >
      <slot />
    </div>
  </div>
</template>

<style>
.wp-tabs { display: flex; flex-direction: column; }
.wp-tabs__list { display: flex; gap: 2px; border-bottom: var(--wp-size-border) solid var(--wp-color-border-subtle); }
.wp-tabs__tab {
  background: none; border: 0; border-bottom: 2px solid transparent;
  padding: 8px var(--wp-space-3); font: inherit; font-size: var(--wp-font-size-md);
  color: var(--wp-color-text-muted); cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px;
}
.wp-tabs__tab:hover:not(:disabled) { color: var(--wp-color-text-default); background: var(--wp-color-bg-hover); }
.wp-tabs__tab.is-active { color: var(--wp-color-text-default); border-bottom-color: var(--wp-color-accent-default); }
.wp-tabs__tab:focus-visible { outline: var(--wp-size-focus) solid var(--wp-color-focus-ring); outline-offset: -2px; }
.wp-tabs__tab:disabled { opacity: 0.45; cursor: default; }
.wp-tabs__badge {
  padding: 0 5px; background: var(--wp-color-bg-selected); color: var(--wp-color-text-muted);
  font-size: var(--wp-font-size-xs); font-variant-numeric: tabular-nums;
}
.wp-tabs__panel { padding: var(--wp-space-4) 0; }

/* Segmente: volle Höhe, Fläche statt Linie. Für Kopfzeilen. */
.wp-tabs.is-segments { height: 100%; }
.wp-tabs.is-segments .wp-tabs__list { height: 100%; gap: var(--wp-space-1); border-bottom: 0; align-items: stretch; }
.wp-tabs.is-segments .wp-tabs__tab {
  border-bottom: 0; border-radius: 0; height: 100%;
  padding: 0 var(--wp-space-4);
  font-size: var(--wp-font-size-md);
  color: var(--wp-color-text-muted);
}
.wp-tabs.is-segments .wp-tabs__tab:hover:not(:disabled) {
  background: var(--wp-color-bg-hover); color: var(--wp-color-text-default);
}
.wp-tabs.is-segments .wp-tabs__tab.is-active {
  background: var(--wp-color-bg-raised);
  color: var(--wp-color-text-default);
  font-weight: var(--wp-font-weight-semibold);
  /* Akzent als Kante links — dieselbe Sprache wie die aktive Zeile in Listen. */
  box-shadow: inset 2px 0 0 0 var(--wp-color-accent-default);
}
</style>
