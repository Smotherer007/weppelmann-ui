<script setup lang="ts">
// Mehrfachauswahl: gleiche Tastatur wie WpSelect, aber die Liste bleibt offen und
// jeder Eintrag hat einen Haken. Ergebnis ist eine Menge von Werten, kein Text.
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { firstEnabled, lastEnabled, nextEnabled } from "../composables/list";
import type { ListOption } from "../types";
import { IconCheck, IconChevronDown } from "@weppelmann/icons";
import WpIcon from "../atoms/WpIcon.vue";
import { useId } from "../composables/useId";

type State = "default" | "invalid" | "disabled";

const props = withDefaults(
  defineProps<{
    modelValue: string[];
    options: ListOption[];
    label?: string;
    placeholder?: string;
    state?: State;
  }>(),
  { placeholder: "Auswählen …", state: "default" },
);
const emit = defineEmits<{ "update:modelValue": [value: string[]] }>();

const root = ref<HTMLElement | null>(null);
const open = ref(false);
const active = ref(-1);
const id = useId("wp-multi");
const listId = `${id}-list`;
const optionId = (i: number) => `${id}-opt-${i}`;

const chosen = computed(() => new Set(props.modelValue));
const summary = computed(() => {
  const n = props.modelValue.length;
  if (n === 0) return "";
  if (n === 1) return props.options.find((o) => o.value === props.modelValue[0])?.label ?? "1 ausgewählt";
  return `${n} ausgewählt`;
});

function openList() {
  if (props.state === "disabled") return;
  open.value = true;
  active.value = firstEnabled(props.options);
}
function close() {
  open.value = false;
  active.value = -1;
}
function toggle(i: number) {
  const option = props.options[i];
  if (!option || option.disabled) return;
  const next = new Set(props.modelValue);
  if (next.has(option.value)) next.delete(option.value);
  else next.add(option.value);
  // Reihenfolge bleibt die der Optionen, nicht die des Klickens.
  emit("update:modelValue", props.options.filter((o) => next.has(o.value)).map((o) => o.value));
}
function onKey(event: KeyboardEvent) {
  if (props.state === "disabled") return;
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      if (!open.value) return openList();
      active.value = nextEnabled(props.options, active.value, 1);
      return;
    case "ArrowUp":
      event.preventDefault();
      if (!open.value) return openList();
      active.value = nextEnabled(props.options, active.value, -1);
      return;
    case "Home":
      if (open.value) { event.preventDefault(); active.value = firstEnabled(props.options); }
      return;
    case "End":
      if (open.value) { event.preventDefault(); active.value = lastEnabled(props.options); }
      return;
    case "Enter":
    case " ":
      event.preventDefault();
      if (!open.value) return openList();
      toggle(active.value);
      return;
    case "Escape":
      if (open.value) { event.preventDefault(); close(); }
      return;
    case "Tab":
      close();
      return;
  }
}
function onOutside(event: MouseEvent) {
  if (root.value && !root.value.contains(event.target as Node)) close();
}
onMounted(() => document.addEventListener("mousedown", onOutside));
onBeforeUnmount(() => document.removeEventListener("mousedown", onOutside));
</script>

<template>
  <div ref="root" class="wp-multi" :class="`is-${state}`">
    <span v-if="label" :id="`${id}-label`" class="wp-multi__label">{{ label }}</span>
    <button
      type="button"
      class="wp-multi__trigger"
      role="combobox"
      :aria-expanded="open"
      :aria-controls="listId"
      :aria-labelledby="label ? `${id}-label` : undefined"
      :aria-activedescendant="open && active >= 0 ? optionId(active) : undefined"
      :disabled="state === 'disabled'"
      @click="open ? close() : openList()"
      @keydown="onKey"
    >
      <span :class="summary ? 'wp-multi__value' : 'wp-multi__placeholder'">{{ summary || placeholder }}</span>
      <WpIcon :icon="IconChevronDown" size="sm" class="wp-multi__marker" />
    </button>
    <ul v-if="open" :id="listId" class="wp-multi__list" role="listbox" aria-multiselectable="true">
      <li
        v-for="(option, i) in options"
        :id="optionId(i)"
        :key="option.value"
        class="wp-multi__option"
        :class="{ 'is-active': i === active, 'is-disabled': option.disabled }"
        role="option"
        :aria-selected="chosen.has(option.value)"
        :aria-disabled="option.disabled || undefined"
        @mousedown.prevent="toggle(i)"
        @mouseenter="!option.disabled && (active = i)"
      >
        <span class="wp-multi__box" :class="{ 'is-on': chosen.has(option.value) }" aria-hidden="true">
          <WpIcon v-if="chosen.has(option.value)" :icon="IconCheck" size="xs" />
        </span>
        <span class="wp-multi__text">{{ option.label }}</span>
        <span v-if="option.hint" class="wp-multi__hint">{{ option.hint }}</span>
      </li>
    </ul>
  </div>
</template>

<style>
.wp-multi { position: relative; display: flex; flex-direction: column; gap: 4px; }
.wp-multi__label { font-size: var(--wp-font-size-sm); color: var(--wp-color-text-muted); }
.wp-multi__trigger {
  display: flex; align-items: center; justify-content: space-between; gap: var(--wp-space-2);
  width: 100%; min-height: var(--wp-size-control-md); padding: 0 var(--wp-space-2);
  border: var(--wp-size-border) solid var(--wp-color-border-subtle);
  background: var(--wp-color-bg-input); color: var(--wp-color-text-default);
  font: inherit; font-size: var(--wp-font-size-md); cursor: pointer; text-align: left;
}
.wp-multi__trigger:focus-visible { outline: var(--wp-size-focus) solid var(--wp-color-focus-ring); outline-offset: 0; }
.wp-multi.is-invalid .wp-multi__trigger { border-color: var(--wp-color-status-error); }
.wp-multi.is-disabled { opacity: 0.55; }
.wp-multi__placeholder { color: var(--wp-color-text-faint); }
.wp-multi__marker { color: var(--wp-color-text-faint); flex: none; }
.wp-multi__list {
  position: absolute; top: 100%; left: 0; right: 0; z-index: 20;
  margin: 2px 0 0; padding: 0; list-style: none; max-height: 280px; overflow-y: auto;
  background: var(--wp-color-bg-panel); border: var(--wp-size-border) solid var(--wp-color-border-strong);
}
.wp-multi__option { display: flex; align-items: center; gap: var(--wp-space-2); padding: 6px var(--wp-space-2); font-size: var(--wp-font-size-md); cursor: pointer; }
.wp-multi__option.is-active { background: var(--wp-color-bg-hover); }
.wp-multi__option.is-disabled { opacity: 0.45; cursor: default; }
.wp-multi__box { width: 16px; height: 16px; flex: none; display: inline-flex; align-items: center; justify-content: center;
               border: var(--wp-size-border) solid var(--wp-color-border-strong); background: var(--wp-color-bg-input); }
.wp-multi__box.is-on { background: var(--wp-color-accent-default); border-color: var(--wp-color-accent-default); color: var(--wp-color-text-on-accent); }
.wp-multi__text { flex: 1; }
.wp-multi__hint { color: var(--wp-color-text-faint); font-size: var(--wp-font-size-xs); }
</style>
