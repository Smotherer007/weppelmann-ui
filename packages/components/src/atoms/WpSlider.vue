<script setup lang="ts">
// Atom: Schieberegler. Ersetzt gtk::Scale und die egui-Slider.
// Der Wert ist eine Zahl; die Beschriftung ist optional und gehört nicht zur Semantik.
withDefaults(defineProps<{ modelValue: number; min?: number; max?: number; step?: number; label?: string; suffix?: string }>(),
  { min: 0, max: 100, step: 1 });
defineEmits<{ "update:modelValue": [value: number] }>();
</script>

<template>
  <label class="wp-slider">
    <span v-if="label" class="wp-slider__head">
      <span>{{ label }}</span>
      <span class="wp-slider__value">{{ modelValue }}{{ suffix }}</span>
    </span>
    <input
      type="range"
      class="wp-slider__input"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      @input="$emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
    />
  </label>
</template>

<style>
.wp-slider { display: flex; flex-direction: column; gap: 4px; }
.wp-slider__head { display: flex; justify-content: space-between; font-size: var(--wp-font-size-sm); color: var(--wp-color-text-muted); }
.wp-slider__value { font-family: var(--wp-font-family-mono); font-variant-numeric: tabular-nums; color: var(--wp-color-text-default); }
.wp-slider__input { width: 100%; accent-color: var(--wp-color-accent-default); }
.wp-slider__input:focus-visible { outline: var(--wp-size-focus) solid var(--wp-color-focus-ring); outline-offset: 4px; }
</style>
