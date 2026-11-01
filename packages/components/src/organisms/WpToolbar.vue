<script setup lang="ts">
// Organismus: Kopfzeile einer Ansicht. Suche/Fokus links, Handlungen rechts.
// Ersetzt adw::HeaderBar-Bastelei; die Höhe ist ein Token, nicht ein Zahlenwert.
withDefaults(defineProps<{ title: string; subtitle?: string; sticky?: boolean }>(), { sticky: false });
</script>

<template>
  <div class="wp-toolbar" :class="{ 'is-sticky': sticky }">
    <div class="wp-toolbar__lead">
      <h1 class="wp-toolbar__title">{{ title }}</h1>
      <p v-if="subtitle" class="wp-toolbar__subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.search" class="wp-toolbar__search"><slot name="search" /></div>
    <div class="wp-toolbar__actions"><slot name="actions" /></div>
  </div>
</template>

<style>
.wp-toolbar {
  display: flex; align-items: center; gap: var(--wp-space-3); flex-wrap: wrap;
  padding: var(--wp-space-2) 0; min-height: var(--wp-size-control-lg);
}
.wp-toolbar.is-sticky { position: sticky; top: 0; z-index: 10; background: var(--wp-color-bg-canvas); }
.wp-toolbar__lead { flex: 1 1 220px; min-width: 0; }
.wp-toolbar__title { margin: 0; font-size: var(--wp-font-size-lg); font-weight: var(--wp-font-weight-semibold); }
.wp-toolbar__subtitle { margin: 2px 0 0; font-size: var(--wp-font-size-sm); color: var(--wp-color-text-muted); }
.wp-toolbar__search { flex: 0 1 320px; }
.wp-toolbar__actions { display: flex; gap: var(--wp-space-2); flex: none; }
</style>
