<script setup lang="ts">
import type { ListOption } from "../types";
// Gruppe mit Auswahl als Wert (kein Boolean je Knopf).
defineProps<{ modelValue: string; name: string; options: ListOption[]; label?: string }>();
defineEmits<{ "update:modelValue": [value: string] }>();
</script>

<template>
  <fieldset class="wp-radio">
    <legend v-if="label" class="wp-radio__legend">{{ label }}</legend>
    <label v-for="o in options" :key="o.value" class="wp-radio__item" :class="{ 'is-disabled': o.disabled }">
      <input
        type="radio"
        :name="name"
        :value="o.value"
        :checked="modelValue === o.value"
        :disabled="o.disabled"
        @change="$emit('update:modelValue', o.value)"
      />
      <span>{{ o.label }}</span>
    </label>
  </fieldset>
</template>

<style>
.wp-radio { border: 0; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
.wp-radio__legend { font-size: var(--wp-font-size-sm); color: var(--wp-color-text-muted); padding: 0 0 4px; }
.wp-radio__item { display: inline-flex; align-items: center; gap: var(--wp-space-2); font-size: var(--wp-font-size-md); cursor: pointer; }
.wp-radio__item input { margin: 0; accent-color: var(--wp-color-accent-default); }
.wp-radio__item.is-disabled { opacity: 0.55; cursor: not-allowed; }
</style>
