<script setup lang="ts">
// Fusszeile des Fensters: Marke links, dann was laeuft, rechts Zahlen.
//
// Eine Zeile, damit sie bei jeder Fensterbreite gleich hoch bleibt. Alles, was
// nicht hineinpasst, wird abgeschnitten statt umzubrechen.
defineProps<{ brand?: string; state?: string; counts?: string }>();
</script>

<template>
  <footer class="wp-statusbar">
    <span v-if="brand" class="wp-statusbar__marke">{{ brand }}</span>
    <slot name="lead" />
    <span v-if="state" class="wp-statusbar__zustand">{{ state }}</span>
    <span class="wp-statusbar__raum" />
    <slot name="trail" />
    <span v-if="counts" class="wp-statusbar__zahl">{{ counts }}</span>
  </footer>
</template>

<style>
.wp-statusbar {
  flex: none; display: flex; align-items: center; gap: var(--wp-space-2);
  min-height: 26px; padding: 0 var(--wp-space-3);
  background: var(--wp-color-bg-panel);
  border-top: var(--wp-size-border) solid var(--wp-color-border-subtle);
  font-size: var(--wp-font-size-xs); color: var(--wp-color-text-faint);
  white-space: nowrap; overflow: hidden;
}
.wp-statusbar__marke { letter-spacing: 0.08em; color: var(--wp-color-text-muted); }
.wp-statusbar__zustand { color: var(--wp-color-text-muted); overflow: hidden; text-overflow: ellipsis; }
.wp-statusbar__raum { flex: 1; }
.wp-statusbar__zahl { font-family: var(--wp-font-family-mono); }
</style>
