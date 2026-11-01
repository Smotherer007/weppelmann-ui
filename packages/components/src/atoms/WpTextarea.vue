<script setup lang="ts">
// Atom: mehrzeiliges Eingabefeld.
type State = "default" | "invalid" | "disabled";
withDefaults(defineProps<{ modelValue: string; rows?: number; state?: State; placeholder?: string }>(),
  { rows: 4, state: "default" });
defineEmits<{ "update:modelValue": [value: string] }>();
</script>

<template>
  <textarea
    class="wp-textarea"
    :class="`is-${state}`"
    :rows="rows"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="state === 'disabled'"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>

<style>
.wp-textarea {
  width: 100%; padding: var(--wp-space-2);
  border: var(--wp-size-border) solid var(--wp-color-border-subtle);
  background: var(--wp-color-bg-input); color: var(--wp-color-text-default);
  font: inherit; font-size: var(--wp-font-size-md); line-height: var(--wp-font-line-normal);
  resize: vertical;
}
.wp-textarea:focus-visible { outline: var(--wp-size-focus) solid var(--wp-color-focus-ring); outline-offset: 0; }
.wp-textarea.is-invalid { border-color: var(--wp-color-status-error); }
.wp-textarea.is-disabled { opacity: 0.55; }
</style>
