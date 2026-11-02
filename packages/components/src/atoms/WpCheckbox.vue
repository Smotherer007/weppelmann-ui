<script setup lang="ts">
// Zustand statt Flag: "indeterminate" ist ein eigener Wert, kein zweites Boolean.
type State = "unchecked" | "checked" | "indeterminate" | "disabled";
const props = withDefaults(defineProps<{ modelValue: boolean; label: string; state?: State }>(),
  { state: undefined });
defineEmits<{ "update:modelValue": [value: boolean] }>();

const checked = () => props.modelValue;
</script>

<template>
  <label class="wp-check" :class="{ 'is-disabled': state === 'disabled' }">
    <input
      type="checkbox"
      class="wp-check__box"
      :checked="checked()"
      :disabled="state === 'disabled'"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span class="wp-check__label">{{ label }}</span>
  </label>
</template>

<style>
.wp-check { display: inline-flex; align-items: center; gap: var(--wp-space-2); cursor: pointer; }
.wp-check__box {
  width: 16px; height: 16px; margin: 0;
  accent-color: var(--wp-color-accent-default);
  border-radius: 0;
}
.wp-check__label { font-size: var(--wp-font-size-md); }
.wp-check.is-disabled { opacity: 0.55; cursor: not-allowed; }
</style>
