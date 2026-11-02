<script setup lang="ts">
// Navigationsliste einer Seitenleiste (Rail).
//
// Eine Zeile: Zeichen, Name, Zahl. Die aktive Zeile ist an der Kante markiert,
// nicht durch Fettschrift — sonst springt die Spalte beim Wechsel in der Breite.
// Die Liste fasst ihre Eintraege selbst, damit ein Screenreader „Navigation,
// 5 Eintraege" ansagt.
import type { Component } from "vue";

export interface NavEntry {
  id: string;
  label: string;
  icon?: Component;
  /** Zahl rechts: Bestand, Anzahl. */
  count?: number | string;
  disabled?: boolean;
}

defineProps<{
  entries: NavEntry[];
  modelValue: string;
  /** Ueberschrift ueber der Liste, z. B. „ANSICHT". */
  title?: string;
  /** Nur Zeichen, kein Text (kompakte Leiste). */
  compact?: boolean;
  label?: string;
}>();
const emit = defineEmits<{ "update:modelValue": [id: string] }>();
</script>

<template>
  <nav class="wp-nav" :class="{ 'is-compact': compact }" :aria-label="label ?? title">
    <p v-if="title && !compact" class="wp-nav__titel">{{ title }}</p>
    <ul class="wp-nav__liste">
      <li v-for="e in entries" :key="e.id">
        <button
          type="button"
          class="wp-nav__eintrag"
          :class="{ 'is-active': modelValue === e.id }"
          :disabled="e.disabled"
          :aria-current="modelValue === e.id ? 'page' : undefined"
          :title="compact ? e.label : undefined"
          @click="emit('update:modelValue', e.id)"
        >
          <component :is="e.icon" v-if="e.icon" class="wp-nav__icon" />
          <span v-if="!compact" class="wp-nav__label">{{ e.label }}</span>
          <span v-if="!compact && e.count !== undefined && e.count !== ''" class="wp-nav__zahl">{{ e.count }}</span>
        </button>
      </li>
    </ul>
  </nav>
</template>

<style>
.wp-nav { display: flex; flex-direction: column; gap: 2px; }
.wp-nav__titel {
  margin: var(--wp-space-2) 0 2px; padding: 0 var(--wp-space-2);
  font-size: var(--wp-font-size-xs); letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--wp-color-text-faint);
}
.wp-nav__liste { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 1px; }
.wp-nav__eintrag {
  display: flex; align-items: center; gap: var(--wp-space-2); width: 100%;
  padding: 5px var(--wp-space-2);
  background: none; border: 0; border-left: 2px solid transparent;
  color: var(--wp-color-text-muted); font: inherit; font-size: var(--wp-font-size-sm);
  text-align: left; cursor: pointer;
}
.wp-nav__eintrag:hover:not(:disabled) { background: var(--wp-color-bg-hover); color: var(--wp-color-text-default); }
.wp-nav__eintrag.is-active {
  background: var(--wp-color-bg-raised); border-left-color: var(--wp-color-accent-default);
  color: var(--wp-color-text-default);
}
.wp-nav__eintrag:focus-visible { outline: var(--wp-size-focus) solid var(--wp-color-focus-ring); outline-offset: -2px; }
.wp-nav__eintrag:disabled { opacity: 0.45; cursor: not-allowed; }
.wp-nav__icon { flex: none; width: 14px; height: 14px; }
.wp-nav__label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wp-nav__zahl { font-family: var(--wp-font-family-mono); font-size: var(--wp-font-size-xs); color: var(--wp-color-text-faint); }
.wp-nav.is-compact .wp-nav__eintrag { justify-content: center; padding: 7px 0; }
</style>
