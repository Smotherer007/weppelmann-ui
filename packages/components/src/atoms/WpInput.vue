<script setup lang="ts">
// Atom: ein Eingabefeld. Keine Beschriftung, kein Hinweis — das ist Aufgabe von
// WpFormField (Molekül). Attribute wie id, aria-describedby und aria-invalid
// landen durch die automatische Attributvererbung direkt am <input>.
type InputType = "text" | "search" | "password" | "number";
type State = "default" | "invalid" | "disabled";

withDefaults(defineProps<{ modelValue: string; type?: InputType; placeholder?: string; state?: State }>(),
  { type: "text", state: "default" });
defineEmits<{ "update:modelValue": [value: string] }>();
</script>

<template>
  <input
    class="wp-input"
    :class="`is-${state}`"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="state === 'disabled'"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<style>
.wp-input {
  width: 100%;
  height: var(--wp-size-control-md);
  padding: 0 var(--wp-space-2);
  border: var(--wp-size-border) solid var(--wp-color-border-subtle);
  background: var(--wp-color-bg-input);
  color: var(--wp-color-text-default);
  font: inherit;
  font-size: var(--wp-font-size-md);
}
.wp-input::placeholder { color: var(--wp-color-text-faint); }
.wp-input:focus-visible { outline: var(--wp-size-focus) solid var(--wp-color-focus-ring); outline-offset: 0; }
.wp-input.is-invalid { border-color: var(--wp-color-status-error); }
.wp-input.is-disabled { opacity: 0.55; cursor: default; }
</style>
