<script setup lang="ts">
// Organismus: Fläche mit Kopf, Inhalt und Fuß. Ersetzt die Panel-Bastelei
// (adw::ToolbarView, adw::WindowTitle) und die Karten in den Listenansichten.
withDefaults(defineProps<{ title?: string; subtitle?: string; raised?: boolean; flush?: boolean }>(),
  { raised: false, flush: false });
</script>

<template>
  <section class="wp-card" :class="{ 'is-raised': raised, 'is-flush': flush }">
    <header v-if="title || $slots.actions" class="wp-card__head">
      <div>
        <h2 v-if="title" class="wp-card__title">{{ title }}</h2>
        <p v-if="subtitle" class="wp-card__subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="wp-card__actions"><slot name="actions" /></div>
    </header>
    <div class="wp-card__body"><slot /></div>
    <footer v-if="$slots.footer" class="wp-card__foot"><slot name="footer" /></footer>
  </section>
</template>

<style>
.wp-card { border: var(--wp-size-border) solid var(--wp-color-border-subtle); background: var(--wp-color-bg-panel); }
.wp-card.is-raised { background: var(--wp-color-bg-raised); }
.wp-card__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--wp-space-3); padding: var(--wp-space-3); border-bottom: var(--wp-size-border) solid var(--wp-color-border-subtle); }
.wp-card__title { margin: 0; font-size: var(--wp-font-size-md); font-weight: var(--wp-font-weight-semibold); }
.wp-card__subtitle { margin: 2px 0 0; font-size: var(--wp-font-size-sm); color: var(--wp-color-text-muted); }
.wp-card__actions { display: flex; gap: var(--wp-space-2); flex: none; }
.wp-card__body { padding: var(--wp-space-3); }
.wp-card.is-flush .wp-card__body { padding: 0; }
.wp-card__foot { padding: var(--wp-space-2) var(--wp-space-3); border-top: var(--wp-size-border) solid var(--wp-color-border-subtle); background: var(--wp-color-bg-raised); }
</style>
