<script setup lang="ts">
// Organismus: rechte Spalte mit Reitern. Die Reiterleiste kommt aus WpTabs,
// der Inhalt als Slot. Der Inspektor entscheidet nichts über den Inhalt.
//
// Herkunft: aus dem Inspektor von WLED Ambilight, generalisiert.
import type { Tab } from "../types";
import WpTabs from "../molecules/WpTabs.vue";

withDefaults(defineProps<{ tabs: Tab[]; modelValue: string; width?: string; label?: string }>(), {
  width: "320px",
});
defineEmits<{ "update:modelValue": [id: string] }>();
</script>

<template>
  <aside class="wp-inspector" :style="{ width }">
    <WpTabs :model-value="modelValue" :tabs="tabs" :label="label" class="wp-inspector__tabs"
            @update:model-value="$emit('update:modelValue', $event)">
      <template #default><span /></template>
    </WpTabs>
    <div class="wp-inspector__body"><slot /></div>
  </aside>
</template>

<style>
.wp-inspector {
  flex: none; display: flex; flex-direction: column; min-height: 0;
  background: var(--wp-color-bg-panel);
  border-left: var(--wp-size-border) solid var(--wp-color-border-subtle);
}
.wp-inspector__tabs { padding: 0 var(--wp-space-2); }
.wp-inspector__tabs .wp-tabs__list { border-bottom: 0; }
.wp-inspector__tabs .wp-tabs__panel { display: none; }
.wp-inspector__body { flex: 1; overflow-y: auto; padding: var(--wp-space-3); display: flex; flex-direction: column; gap: var(--wp-space-2); }
</style>
