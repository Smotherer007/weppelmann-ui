<script setup lang="ts">
// Organismus: Farbstreifen aus einer Liste von Farbwerten. Zeigt, was
// tatsächlich ausgegeben wird — nicht, was berechnet wurde.
//
// Herkunft: aus der LED-Leiste von WLED Ambilight, generalisiert.
const props = withDefaults(
  defineProps<{ colors?: [number, number, number][]; height?: string; label?: string }>(),
  { colors: () => [], height: "14px" },
);
</script>

<template>
  <div class="wp-colorstrip" :class="{ 'is-empty': props.colors.length === 0 }"
       :style="{ height }" role="img" :aria-label="label ?? `${props.colors.length} Werte`">
    <span v-for="(c, i) in props.colors" :key="i" class="wp-colorstrip__value"
          :style="{ background: `rgb(${c[0]} ${c[1]} ${c[2]})` }" />
    <span v-if="props.colors.length === 0" class="wp-colorstrip__empty">keine Daten</span>
  </div>
</template>

<style>
.wp-colorstrip {
  display: flex; overflow: hidden;
  border: var(--wp-size-border) solid var(--wp-color-border-subtle);
  background: var(--wp-color-bg-input);
}
.wp-colorstrip.is-empty { align-items: center; justify-content: center; }
.wp-colorstrip__value { flex: 1 1 0; min-width: 1px; }
.wp-colorstrip__empty { font-size: var(--wp-font-size-xs); color: var(--wp-color-text-faint); }
</style>
