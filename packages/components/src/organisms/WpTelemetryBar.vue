<script setup lang="ts">
// Organismus: untere Leiste mit Titel, Messwerten und Zeilen. Die Zeilen kommen
// als Slot — die Leiste kennt keine Geräte, Kanäle oder Sensoren.
//
// Herkunft: aus der Ausgabeleiste von WLED Ambilight, generalisiert.
withDefaults(defineProps<{ title: string; stats?: string }>(), {});
</script>

<template>
  <footer class="wp-telemetry">
    <div class="wp-telemetry__head">
      <span class="wp-telemetry__title">{{ title }}</span>
      <span class="wp-telemetry__spacer" />
      <span v-if="stats" class="wp-telemetry__stats">{{ stats }}</span>
    </div>
    <div class="wp-telemetry__rows"><slot /></div>
  </footer>
</template>

<style>
.wp-telemetry {
  flex: none; display: flex; flex-direction: column; gap: var(--wp-space-1);
  padding: var(--wp-space-2) var(--wp-space-3) var(--wp-space-3);
  background: var(--wp-color-bg-panel);
  border-top: var(--wp-size-border) solid var(--wp-color-border-subtle);
}
.wp-telemetry__head { display: flex; align-items: baseline; gap: var(--wp-space-2); }
.wp-telemetry__title { font-family: var(--wp-font-family-display); font-size: var(--wp-font-size-sm); font-weight: var(--wp-font-weight-semibold); }
.wp-telemetry__spacer { flex: 1; }
.wp-telemetry__stats { font-family: var(--wp-font-family-mono); font-size: var(--wp-font-size-xs); color: var(--wp-color-text-faint); }
.wp-telemetry__rows { display: flex; flex-direction: column; gap: 3px; }
</style>
