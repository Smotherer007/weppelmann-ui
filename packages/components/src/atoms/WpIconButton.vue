<script setup lang="ts">
// Knopf, der nur ein Zeichen traegt.
//
// Ein eigener Baustein und kein WpButton ohne Text: quadratisch, feste Breite,
// Zeichen zentriert. `label` ist Pflicht — ein Knopf ohne Text braucht einen
// Namen, sonst ist er fuer Screenreader leer.
import type { Component } from "vue";

const props = withDefaults(
  defineProps<{
    icon: Component;
    /** Name fuer Screenreader und Tooltip. Pflicht. */
    label: string;
    size?: "sm" | "md" | "lg";
    variant?: "secondary" | "ghost";
    /** Zeichen erscheint gefuellt (aktiv, eingeschaltet). */
    active?: boolean;
    disabled?: boolean;
  }>(),
  { size: "md", variant: "secondary", active: false, disabled: false },
);
const emit = defineEmits<{ press: [] }>();
</script>

<template>
  <button
    type="button"
    class="wp-iconbutton"
    :class="[`is-${props.size}`, `is-${props.variant}`, { 'is-active': props.active }]"
    :aria-label="props.label"
    :title="props.label"
    :aria-pressed="props.active ? 'true' : undefined"
    :disabled="props.disabled"
    @click="emit('press')"
  >
    <component :is="props.icon" class="wp-iconbutton__icon" />
  </button>
</template>

<style>
.wp-iconbutton {
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--wp-color-bg-raised); color: var(--wp-color-text-muted);
  border: var(--wp-size-border) solid var(--wp-color-border-subtle);
  cursor: pointer; padding: 0;
}
.wp-iconbutton.is-sm { width: 24px; height: 24px; }
.wp-iconbutton.is-md { width: 28px; height: 28px; }
.wp-iconbutton.is-lg { width: 32px; height: 32px; }
.wp-iconbutton.is-ghost { background: transparent; border-color: transparent; }
.wp-iconbutton:hover:not(:disabled) { color: var(--wp-color-text-default); border-color: var(--wp-color-border-strong); }
.wp-iconbutton.is-ghost:hover:not(:disabled) { background: var(--wp-color-bg-hover); border-color: transparent; }
.wp-iconbutton.is-active { color: var(--wp-color-text-default); border-color: var(--wp-color-accent-default); background: var(--wp-color-bg-selected); }
.wp-iconbutton:focus-visible { outline: var(--wp-size-focus) solid var(--wp-color-focus-ring); outline-offset: 1px; }
.wp-iconbutton:disabled { opacity: 0.5; cursor: not-allowed; }
.wp-iconbutton__icon { width: 14px; height: 14px; }
.wp-iconbutton.is-lg .wp-iconbutton__icon { width: 16px; height: 16px; }
</style>
