<script setup lang="ts">
// Karte, die man waehlt oder oeffnet: Client in einer Liste, Katalogeintrag im Raster.
//
// Warum nicht WpCard: eine Auswahlkarte ist bedienbar (Tastatur, aktiv) und traegt
// nur Kopf und Nebenzeit. WpCard ist ein Behälter mit Kopf, Rumpf und Fuss.
import type { Component } from "vue";

const props = withDefaults(
  defineProps<{
    title: string;
    /** Zweite Zeile, klein. */
    meta?: string;
    /** Dritte Zeile, noch kleiner (Pfad, Hinweis). */
    note?: string;
    icon?: Component;
    active?: boolean;
    disabled?: boolean;
    /** Zeigt Rahmen und Hand, wenn ein Klick etwas oeffnet. */
    clickable?: boolean;
  }>(),
  { active: false, disabled: false, clickable: true },
);
const emit = defineEmits<{ press: []; activate: [] }>();
</script>

<template>
  <button
    type="button"
    class="wp-choice"
    :class="{ 'is-active': props.active, 'is-clickable': props.clickable }"
    :disabled="props.disabled"
    @click="emit('press')"
    @dblclick="emit('activate')"
  >
    <component :is="props.icon" v-if="props.icon" class="wp-choice__icon" />
    <span class="wp-choice__text">
      <span class="wp-choice__titel">{{ props.title }}</span>
      <span v-if="props.meta" class="wp-choice__meta">{{ props.meta }}</span>
      <span v-if="props.note" class="wp-choice__note">{{ props.note }}</span>
    </span>
    <slot name="trailing" />
  </button>
</template>

<style>
.wp-choice {
  /* min-width: 0, sonst waechst die Karte mit einem langen Hinweistext ueber
     ihre Spalte hinaus und reisst das Raster auf. */
  display: flex; align-items: flex-start; gap: var(--wp-space-2); width: 100%; min-width: 0;
  padding: var(--wp-space-2); text-align: left;
  background: var(--wp-color-bg-raised);
  border: var(--wp-size-border) solid var(--wp-color-border-subtle);
  color: inherit; font: inherit;
}
.wp-choice.is-clickable { cursor: pointer; }
.wp-choice.is-clickable:hover { border-color: var(--wp-color-border-strong); }
.wp-choice.is-active { border-color: var(--wp-color-accent-default); }
.wp-choice:focus-visible { outline: var(--wp-size-focus) solid var(--wp-color-focus-ring); outline-offset: -2px; }
.wp-choice:disabled { opacity: 0.55; cursor: not-allowed; }
.wp-choice__icon { flex: none; width: 16px; height: 16px; color: var(--wp-color-text-faint); margin-top: 1px; }
.wp-choice__text { display: flex; flex-direction: column; gap: 1px; min-width: 0; flex: 1; }
.wp-choice__titel { font-size: var(--wp-font-size-sm); color: var(--wp-color-text-default); }
.wp-choice__meta { font-size: var(--wp-font-size-xs); color: var(--wp-color-text-muted); }
.wp-choice__note {
  max-width: 100%; font-family: var(--wp-font-family-mono); font-size: var(--wp-font-size-xs);
  color: var(--wp-color-text-faint); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
/* Was rechts haengt (Badges), darf schrumpfen statt die Zeile zu sprengen. */
.wp-choice > :last-child:not(.wp-choice__text):not(.wp-choice__icon) { flex: none; max-width: 45%; }
</style>
