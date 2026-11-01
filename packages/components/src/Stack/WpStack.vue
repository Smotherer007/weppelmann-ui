<script setup lang="ts">
// Ersetzt gtk::Box (196 Vorkommen im Bestand): Richtung ist ein Wert, kein Flag.
type Direction = "row" | "column";
withDefaults(
  defineProps<{ direction?: Direction; gap?: "none" | "xs" | "sm" | "md" | "lg"; align?: "start" | "center" | "end" | "stretch" }>(),
  { direction: "column", gap: "md", align: "stretch" },
);
</script>

<template>
  <div class="wp-stack" :class="[`is-${direction}`, `gap-${gap}`, `align-${align}`]">
    <slot />
  </div>
</template>

<style>
.wp-stack { display: flex; }
.wp-stack.is-row { flex-direction: row; }
.wp-stack.is-column { flex-direction: column; }
.wp-stack.gap-none { gap: 0; }
.wp-stack.gap-xs { gap: 4px; }
.wp-stack.gap-sm { gap: 8px; }
.wp-stack.gap-md { gap: 16px; }
.wp-stack.gap-lg { gap: 24px; }
.wp-stack.align-start { align-items: flex-start; }
.wp-stack.align-center { align-items: center; }
.wp-stack.align-end { align-items: flex-end; }
.wp-stack.align-stretch { align-items: stretch; }
</style>
