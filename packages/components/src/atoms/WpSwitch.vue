<script setup lang="ts">
withDefaults(defineProps<{ modelValue: boolean; label?: string; disabled?: boolean }>(),
  { disabled: false });
defineEmits<{ "update:modelValue": [value: boolean] }>();
</script>

<template>
  <label class="wp-switch" :class="{ 'is-disabled': disabled }">
    <input
      type="checkbox"
      role="switch"
      class="wp-switch__input"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span class="wp-switch__track" aria-hidden="true"><span class="wp-switch__knob" /></span>
    <span v-if="label" class="wp-switch__label">{{ label }}</span>
  </label>
</template>

<style>
.wp-switch { display: inline-flex; align-items: center; gap: var(--wp-space-2); cursor: pointer; }
.wp-switch__input { position: absolute; opacity: 0; width: 0; height: 0; }
.wp-switch__track {
  width: 34px; height: 18px; background: var(--wp-color-bg-input);
  border: var(--wp-size-border) solid var(--wp-color-border-subtle);
  display: inline-flex; align-items: center; padding: 2px;
  transition: background var(--wp-duration-fast), border-color var(--wp-duration-fast);
}
.wp-switch__knob { width: 12px; height: 12px; background: var(--wp-color-text-faint); transition: transform var(--wp-duration-fast), background var(--wp-duration-fast); }
.wp-switch__input:checked + .wp-switch__track { background: var(--wp-color-accent-default); border-color: var(--wp-color-accent-default); }
.wp-switch__input:checked + .wp-switch__track .wp-switch__knob { transform: translateX(16px); background: var(--wp-color-text-on-accent); }
.wp-switch__input:focus-visible + .wp-switch__track { outline: var(--wp-size-focus) solid var(--wp-color-focus-ring); outline-offset: 2px; }
.wp-switch__label { font-size: var(--wp-font-size-md); }
.wp-switch.is-disabled { opacity: 0.55; cursor: default; }
</style>
