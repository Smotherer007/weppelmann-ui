<script setup lang="ts">
// Organismus: seitliche Spalte mit Kopf, Liste und Fuß. Die Liste kommt als
// Slot, der Kopf trägt Titel, Zähler und Handlungen.
//
// Herkunft: aus der Gerätespalte von WLED Ambilight, generalisiert.
withDefaults(defineProps<{ title: string; count?: number; width?: string }>(), { width: "284px" });
</script>

<template>
  <aside class="wp-side" :style="{ width }">
    <div class="wp-side__head">
      <span class="wp-side__title">{{ title }}</span>
      <span v-if="count !== undefined" class="wp-side__count">{{ count }}</span>
      <span class="wp-side__spacer" />
      <slot name="actions" />
    </div>
    <div class="wp-side__body"><slot /></div>
    <div v-if="$slots.footer" class="wp-side__foot"><slot name="footer" /></div>
  </aside>
</template>

<style>
.wp-side {
  flex: none; display: flex; flex-direction: column; min-height: 0;
  background: var(--wp-color-bg-panel);
  border-right: var(--wp-size-border) solid var(--wp-color-border-subtle);
}
.wp-side__head { display: flex; align-items: center; gap: var(--wp-space-2); padding: var(--wp-space-2) var(--wp-space-3); }
.wp-side__title { font-family: var(--wp-font-family-display); font-size: var(--wp-font-size-sm); font-weight: var(--wp-font-weight-semibold); }
.wp-side__count { font-family: var(--wp-font-family-mono); font-size: var(--wp-font-size-xs); color: var(--wp-color-text-faint); }
.wp-side__spacer { flex: 1; }
.wp-side__body { flex: 1; overflow-y: auto; padding: 0 var(--wp-space-2) var(--wp-space-2); display: flex; flex-direction: column; gap: var(--wp-space-2); }
.wp-side__foot { padding: var(--wp-space-2) var(--wp-space-3) var(--wp-space-3); border-top: var(--wp-size-border) solid var(--wp-color-border-subtle); }
</style>
