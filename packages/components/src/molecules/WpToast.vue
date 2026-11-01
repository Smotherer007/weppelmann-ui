<script setup lang="ts">
// Molekül: kurze Rückmeldung. Die Farbe trägt die Bedeutung nicht allein —
// jede Stufe hat ein eigenes Icon, damit mono und Farbsehschwäche funktionieren.
import type { Component } from "vue";
import { IconClose, IconInfo, IconStatusError, IconStatusOk, IconWarning } from "@weppelmann/icons";
import WpIcon from "../atoms/WpIcon.vue";

type Tone = "info" | "ok" | "warn" | "error";
withDefaults(defineProps<{ tone?: Tone; title: string; description?: string; dismissible?: boolean }>(),
  { tone: "info", dismissible: true });
defineEmits<{ close: [] }>();

const icons: Record<Tone, Component> = {
  info: IconInfo,
  ok: IconStatusOk,
  warn: IconWarning,
  error: IconStatusError,
};
</script>

<template>
  <div class="wp-toast" :class="`tone-${tone}`" role="status">
    <WpIcon :icon="icons[tone]" size="md" class="wp-toast__mark" />
    <div class="wp-toast__body">
      <p class="wp-toast__title">{{ title }}</p>
      <p v-if="description" class="wp-toast__desc">{{ description }}</p>
    </div>
    <slot />
    <button v-if="dismissible" type="button" class="wp-toast__close" aria-label="Schließen" @click="$emit('close')">
      <WpIcon :icon="IconClose" size="sm" />
    </button>
  </div>
</template>

<style>
.wp-toast {
  display: flex; align-items: flex-start; gap: var(--wp-space-2);
  padding: var(--wp-space-2) var(--wp-space-3);
  background: var(--wp-color-bg-raised);
  border: var(--wp-size-border) solid var(--wp-color-border-subtle);
  border-left: 3px solid var(--wp-color-text-faint);
  font-size: var(--wp-font-size-md);
}
.wp-toast.tone-ok { border-left-color: var(--wp-color-status-ok); }
.wp-toast.tone-warn { border-left-color: var(--wp-color-status-warn); }
.wp-toast.tone-error { border-left-color: var(--wp-color-status-error); }
.wp-toast__mark { color: var(--wp-color-text-muted); margin-top: 1px; }
.wp-toast.tone-ok .wp-toast__mark { color: var(--wp-color-status-ok); }
.wp-toast.tone-warn .wp-toast__mark { color: var(--wp-color-status-warn); }
.wp-toast.tone-error .wp-toast__mark { color: var(--wp-color-status-error); }
.wp-toast__body { flex: 1; }
.wp-toast__title { margin: 0; font-weight: var(--wp-font-weight-medium); }
.wp-toast__desc { margin: 2px 0 0; color: var(--wp-color-text-muted); font-size: var(--wp-font-size-sm); }
.wp-toast__close { background: none; border: 0; color: var(--wp-color-text-faint); cursor: pointer; padding: 2px; display: inline-flex; }
.wp-toast__close:hover { color: var(--wp-color-text-default); }
</style>
