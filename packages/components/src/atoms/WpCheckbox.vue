<script setup lang="ts">
// Kästchen zum Ankreuzen.
//
// Das Feld ist gezeichnet, nicht nativ: `accent-color` färbt in Chromium das
// Kästchen, in WebKitGTK (der App) bleibt es weiß — dann sieht dieselbe
// Komponente im Styleguide anders aus als im Fenster. Der echte Input bleibt
// erhalten (unsichtbar), damit Tastatur, Screenreader und Formulare weiter
// funktionieren.
//
// Zustand statt Flag: "indeterminate" ist ein eigener Wert, kein zweites Boolean.
type State = "unchecked" | "checked" | "indeterminate" | "disabled";
const props = withDefaults(defineProps<{ modelValue: boolean; label: string; state?: State }>(), {
  state: undefined,
});
defineEmits<{ "update:modelValue": [value: boolean] }>();

const checked = () => props.modelValue;
</script>

<template>
  <label class="wp-check" :class="{ 'is-disabled': state === 'disabled' }">
    <input
      type="checkbox"
      class="wp-check__input"
      :checked="checked()"
      :disabled="state === 'disabled'"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span class="wp-check__box" :class="{ 'is-on': checked() || state === 'indeterminate' }" aria-hidden="true">
      <svg v-if="checked()" class="wp-check__haken" viewBox="0 0 12 12" width="10" height="10">
        <path d="M2 6.2 L4.6 8.8 L10 3.4" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="butt" stroke-linejoin="miter" />
      </svg>
      <span v-else-if="state === 'indeterminate'" class="wp-check__strich" />
    </span>
    <span class="wp-check__label">{{ label }}</span>
  </label>
</template>

<style>
.wp-check {
  display: inline-flex; align-items: center; gap: var(--wp-space-2);
  cursor: pointer; position: relative;
}
/* Der echte Input bleibt da, ist aber unsichtbar — nicht `display:none`, sonst
   waere er nicht mehr fokussierbar. */
.wp-check__input {
  position: absolute; width: 1px; height: 1px; margin: 0; padding: 0;
  opacity: 0; pointer-events: none;
}
.wp-check__box {
  width: 16px; height: 16px; flex: none;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--wp-color-bg-input);
  border: var(--wp-size-border) solid var(--wp-color-border-strong);
  color: var(--wp-color-text-on-accent);
}
.wp-check__box.is-on {
  background: var(--wp-color-accent-default);
  border-color: var(--wp-color-accent-default);
}
.wp-check__haken { color: var(--wp-color-text-on-accent); }
.wp-check__strich { width: 8px; height: 2px; background: var(--wp-color-text-on-accent); }
.wp-check__label { font-size: var(--wp-font-size-md); }
.wp-check__input:focus-visible + .wp-check__box {
  outline: var(--wp-size-focus) solid var(--wp-color-focus-ring);
  outline-offset: 2px;
}
.wp-check:hover .wp-check__box { border-color: var(--wp-color-accent-default); }
.wp-check.is-disabled { opacity: 0.55; cursor: not-allowed; }
</style>
