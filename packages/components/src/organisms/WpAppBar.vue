<script setup lang="ts">
// Organismus: Kopfzeile einer Anwendung. Marke links, Zustand daneben,
// Handlungen rechts. Kennt keine Domäne — Marke, Zustand und Handlungen
// kommen als Slot herein.
//
// Herkunft: aus der Fensterkopfzeile von WLED Ambilight, generalisiert.
import type { Component } from "vue";
import WpIcon from "../atoms/WpIcon.vue";

withDefaults(defineProps<{ title: string; subtitle?: string; icon?: Component }>(), {});
</script>

<template>
  <header class="wp-appbar">
    <div class="wp-appbar__brand">
      <WpIcon v-if="icon" :icon="icon" size="md" class="wp-appbar__mark" />
      <div>
        <p class="wp-appbar__title">{{ title }}</p>
        <p v-if="subtitle" class="wp-appbar__subtitle">{{ subtitle }}</p>
      </div>
    </div>
    <div v-if="$slots.status" class="wp-appbar__status"><slot name="status" /></div>
    <div class="wp-appbar__spacer" />
    <div class="wp-appbar__actions"><slot name="actions" /></div>
  </header>
</template>

<style>
.wp-appbar {
  display: flex; align-items: center; gap: var(--wp-space-3);
  padding: var(--wp-space-2) var(--wp-space-3);
  background: var(--wp-color-bg-panel);
  border-bottom: var(--wp-size-border) solid var(--wp-color-border-subtle);
}
.wp-appbar__brand { display: flex; align-items: center; gap: var(--wp-space-2); }
.wp-appbar__mark { color: var(--wp-color-accent-default); }
.wp-appbar__title {
  margin: 0; font-family: var(--wp-font-family-display); font-size: var(--wp-font-size-md);
  font-weight: var(--wp-font-weight-semibold); letter-spacing: -0.01em;
}
.wp-appbar__subtitle { margin: 0; font-size: var(--wp-font-size-xs); color: var(--wp-color-text-faint); }
.wp-appbar__status { display: flex; align-items: center; gap: var(--wp-space-2); }
.wp-appbar__spacer { flex: 1; }
.wp-appbar__actions { display: flex; align-items: center; gap: var(--wp-space-2); }
</style>
