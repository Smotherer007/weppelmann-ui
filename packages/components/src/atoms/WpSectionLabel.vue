<script setup lang="ts">
// Kleine Ueberschrift ueber einem Abschnitt: Großbuchstaben, gesperrt, blass.
//
// Sie traegt keine Ebene in der Dokumentstruktur (dafuer gibt es h1–h3) — sie
// ist eine Marke im Text, deshalb ein `p` mit `role="heading"` und aria-level.
withDefaults(defineProps<{ label: string; level?: number }>(), { level: 3 });
</script>

<template>
  <p class="wp-section" role="heading" :aria-level="level" :label="label">{{ label }}</p>
</template>

<style>
.wp-section {
  margin: var(--wp-space-3) 0 var(--wp-space-1); padding: 0;
  font-size: var(--wp-font-size-xs); letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--wp-color-text-faint);
}
.wp-section:first-child { margin-top: 0; }
</style>
