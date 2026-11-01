<script setup lang="ts">
// Atom: Text mit Rolle. "mono" ist für Zahlen gedacht (tabellarische Ziffern),
// damit Spalten nicht springen.
type Variant = "body" | "caption" | "label" | "heading" | "mono";
type Tone = "default" | "muted" | "faint" | "ok" | "warn" | "error";
withDefaults(defineProps<{ variant?: Variant; tone?: Tone; as?: string }>(),
  { variant: "body", tone: "default", as: "span" });
</script>

<template>
  <component :is="as" class="wp-text" :class="[`wp-text--${variant}`, `tone-${tone}`]"><slot /></component>
</template>

<style>
.wp-text { color: var(--wp-color-text-default); }
.wp-text--body { font-size: var(--wp-font-size-md); }
.wp-text--caption { font-size: var(--wp-font-size-xs); }
.wp-text--label { font-size: var(--wp-font-size-sm); }
.wp-text--heading { font-size: var(--wp-font-size-xl); font-weight: var(--wp-font-weight-semibold); line-height: var(--wp-font-line-tight); }
.wp-text--mono { font-family: var(--wp-font-family-mono); font-size: var(--wp-font-size-sm); font-variant-numeric: tabular-nums; }
.wp-text.tone-muted { color: var(--wp-color-text-muted); }
.wp-text.tone-faint { color: var(--wp-color-text-faint); }
.wp-text.tone-ok { color: var(--wp-color-status-ok); }
.wp-text.tone-warn { color: var(--wp-color-status-warn); }
.wp-text.tone-error { color: var(--wp-color-status-error); }
</style>
