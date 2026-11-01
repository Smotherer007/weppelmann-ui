<script setup lang="ts">
withDefaults(defineProps<{ direction?: "horizontal" | "vertical"; spaced?: boolean }>(),
  { direction: "horizontal", spaced: false });
</script>

<template>
  <hr class="wp-divider" :class="[`is-${direction}`, { 'is-spaced': spaced }]" />
</template>

<style>
.wp-divider { border: 0; margin: 0; background: var(--wp-color-border-subtle); }
.wp-divider.is-horizontal { width: 100%; height: var(--wp-size-border); }
.wp-divider.is-vertical { width: var(--wp-size-border); height: 100%; min-height: 16px; }
.wp-divider.is-spaced.is-horizontal { margin: var(--wp-space-3) 0; }
.wp-divider.is-spaced.is-vertical { margin: 0 var(--wp-space-3); }
</style>
