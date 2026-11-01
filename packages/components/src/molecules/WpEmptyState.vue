<script setup lang="ts">
// Molekül: der leere Fall als eigene Gestalt — nicht als leere Tabelle.
import type { Component } from "vue";
import { IconAlert, IconFolder, IconSearch } from "@weppelmann/icons";
import WpIcon from "../atoms/WpIcon.vue";

type Kind = "leer" | "fehler" | "keine-treffer";
withDefaults(defineProps<{ kind?: Kind; title: string; description?: string }>(), { kind: "leer" });
const icons: Record<Kind, Component> = { leer: IconFolder, fehler: IconAlert, "keine-treffer": IconSearch };
</script>

<template>
  <div class="wp-empty" :class="`is-${kind}`">
    <WpIcon :icon="icons[kind]" size="lg" class="wp-empty__mark" :stroke-width="1.5" />
    <p class="wp-empty__title">{{ title }}</p>
    <p v-if="description" class="wp-empty__desc">{{ description }}</p>
    <div v-if="$slots.action" class="wp-empty__action"><slot name="action" /></div>
  </div>
</template>

<style>
.wp-empty { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: var(--wp-space-7) var(--wp-space-4); text-align: center; }
.wp-empty__mark { color: var(--wp-color-text-faint); }
.wp-empty.is-fehler .wp-empty__mark { color: var(--wp-color-status-error); }
.wp-empty__title { margin: 0; font-size: var(--wp-font-size-md); font-weight: var(--wp-font-weight-medium); }
.wp-empty__desc { margin: 0; font-size: var(--wp-font-size-sm); color: var(--wp-color-text-muted); max-width: 46ch; }
.wp-empty__action { margin-top: var(--wp-space-2); }
</style>
