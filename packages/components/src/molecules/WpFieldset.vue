<script setup lang="ts">
// Gruppe gleichartiger Kästchen unter einer kleinen Ueberschrift.
//
// Der Rahmen ist der eines Fieldsets (`fieldset`/`legend`), nicht der eines
// Kastens: die Gruppe gehoert zusammen, ohne ein eigenes Fenster zu sein.
defineProps<{ title: string; hint?: string }>();
</script>

<template>
  <fieldset class="wp-fieldset">
    <legend class="wp-fieldset__titel">{{ title }}</legend>
    <p v-if="hint" class="wp-fieldset__hint">{{ hint }}</p>
    <div class="wp-fieldset__inhalt"><slot /></div>
  </fieldset>
</template>

<style>
.wp-fieldset { border: 0; margin: 0; padding: 0; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.wp-fieldset__titel {
  padding: 0; font-size: var(--wp-font-size-xs); letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--wp-color-text-faint);
}
.wp-fieldset__hint { margin: 0; font-size: var(--wp-font-size-xs); color: var(--wp-color-text-faint); }
.wp-fieldset__inhalt { display: flex; flex-wrap: wrap; gap: 2px var(--wp-space-3); padding-top: 2px; }
</style>
