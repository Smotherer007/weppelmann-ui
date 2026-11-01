<script setup lang="ts">
// Atom: ein Icon. Es kennt kein Icon-Set — die Grafik kommt als Komponente herein,
// damit die Bibliothek nicht an einen Hersteller gebunden ist.
// Größe und Farbe folgen den Tokens (currentColor, also Textfarbe des Umfelds).
import type { Component } from "vue";

withDefaults(
  defineProps<{
    icon: Component;
    size?: "xs" | "sm" | "md" | "lg";
    /** Nur setzen, wenn das Icon allein steht und Bedeutung trägt. */
    label?: string;
    strokeWidth?: number;
  }>(),
  { size: "sm", strokeWidth: 1.75 },
);
</script>

<template>
  <component
    :is="icon"
    class="wp-icon"
    :class="`is-${size}`"
    :stroke-width="strokeWidth"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    focusable="false"
  />
</template>

<style>
.wp-icon { flex: none; display: inline-block; vertical-align: -0.15em; }
.wp-icon.is-xs { width: 12px; height: 12px; }
.wp-icon.is-sm { width: 14px; height: 14px; }
.wp-icon.is-md { width: 16px; height: 16px; }
.wp-icon.is-lg { width: 20px; height: 20px; }
</style>
