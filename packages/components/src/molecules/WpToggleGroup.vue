<script setup lang="ts">
// Eine Reihe zusammengehöriger Umschaltknöpfe (GTK: `gtk::ToggleButton`).
//
// Gedacht für eine Auswahl, die immer genau einen Wert hat: Sprache, Farbschema,
// Filter. Der gedrückte Knopf ist gefüllt, die anderen stehen als Rahmen daneben.
//
// Warum keine Radios: in den Apps war das immer eine Knopfreihe, und Radios
// ändern das Bild einer Einstellungsseite. Die Semantik bleibt trotzdem richtig —
// `role="radiogroup"` mit `aria-checked`, damit Screenreader „1 von 4" ansagen.
import type { Option } from "../types";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: Option[];
    /** Beschriftung der Gruppe, sichtbar oder nur für Screenreader. */
    label?: string;
    size?: "sm" | "md";
    /** Über die ganze Breite verteilen. */
    block?: boolean;
  }>(),
  { size: "md", block: false },
);
const emit = defineEmits<{ "update:modelValue": [value: string] }>();

function waehle(wert: string, gesperrt?: boolean) {
  if (gesperrt) return;
  emit("update:modelValue", wert);
}
</script>

<template>
  <div class="wp-togglegroup" :class="[`is-${props.size}`, { 'is-block': props.block }]">
    <span v-if="props.label" class="wp-togglegroup__label">{{ props.label }}</span>
    <div class="wp-togglegroup__reihe" role="radiogroup" :aria-label="props.label">
      <button
        v-for="o in props.options"
        :key="o.value"
        type="button"
        class="wp-togglegroup__knopf"
        :class="{ 'is-active': props.modelValue === o.value }"
        role="radio"
        :aria-checked="props.modelValue === o.value"
        :disabled="o.disabled"
        :title="o.hint"
        @click="waehle(o.value, o.disabled)"
      >
        {{ o.label }}
      </button>
    </div>
  </div>
</template>

<style>
.wp-togglegroup { display: flex; flex-direction: column; gap: var(--wp-space-1); }
.wp-togglegroup__label { font-size: var(--wp-font-size-xs); color: var(--wp-color-text-faint); }
.wp-togglegroup__reihe { display: inline-flex; }
.wp-togglegroup.is-block .wp-togglegroup__reihe { display: flex; width: 100%; }
.wp-togglegroup.is-block .wp-togglegroup__knopf { flex: 1; }

/* Ein durchgehender Rahmen: die Knoepfe teilen sich die Linien, sonst
   entstehen doppelte Kanten zwischen zwei Knoepfen. */
.wp-togglegroup__knopf {
  padding: 5px var(--wp-space-3);
  background: var(--wp-color-bg-raised);
  border: var(--wp-size-border) solid var(--wp-color-border-strong);
  border-left-width: 0;
  color: var(--wp-color-text-muted);
  font: inherit;
  font-size: var(--wp-font-size-sm);
  cursor: pointer;
}
.wp-togglegroup__knopf:first-child { border-left-width: var(--wp-size-border); }
.wp-togglegroup__knopf:hover:not(.is-active):not(:disabled) { color: var(--wp-color-text-default); }
.wp-togglegroup__knopf.is-active {
  background: var(--wp-color-accent-default);
  border-color: var(--wp-color-accent-default);
  color: var(--wp-color-text-on-accent);
}
/* Der aktive Knopf deckt die Linie seines linken Nachbarn zu. */
.wp-togglegroup__knopf.is-active + .wp-togglegroup__knopf { border-left-color: var(--wp-color-accent-default); }
.wp-togglegroup__knopf:focus-visible { outline: var(--wp-size-focus) solid var(--wp-color-focus-ring); outline-offset: -2px; }
.wp-togglegroup__knopf:disabled { opacity: 0.5; cursor: not-allowed; }
.wp-togglegroup.is-sm .wp-togglegroup__knopf { padding: 3px var(--wp-space-2); font-size: var(--wp-font-size-xs); }
</style>
