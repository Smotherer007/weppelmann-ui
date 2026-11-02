<script setup lang="ts">
// Einfachauswahl. Ersetzt gtk::DropDown (23 Vorkommen im Bestand).
//
// Bedienung nach WAI-ARIA "combobox with listbox popup": der Fokus bleibt auf dem
// Auslöser, die aktive Zeile wird über aria-activedescendant gemeldet. Damit
// funktionieren Screenreader und Tastatur ohne Fokusfalle.
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { firstEnabled, lastEnabled, nextEnabled, typeahead } from "../composables/list";
import type { ListOption } from "../types";
import { IconCheck, IconChevronDown } from "@weppelmann/icons";
import WpIcon from "../atoms/WpIcon.vue";
import { useId } from "../composables/useId";

type State = "default" | "invalid" | "disabled";

const props = withDefaults(
  defineProps<{
    modelValue: string | null;
    options: ListOption[];
    label?: string;
    placeholder?: string;
    state?: State;
  }>(),
  { placeholder: "Auswählen …", state: "default" },
);
const emit = defineEmits<{ "update:modelValue": [value: string | null] }>();

const root = ref<HTMLElement | null>(null);
const open = ref(false);
const active = ref(-1);
const id = useId("wp-select");
const listId = `${id}-list`;
const optionId = (i: number) => `${id}-opt-${i}`;

const selectedIndex = computed(() => props.options.findIndex((o) => o.value === props.modelValue));
const selectedLabel = computed(() =>
  selectedIndex.value >= 0 ? props.options[selectedIndex.value].label : "",
);

function openList() {
  if (props.state === "disabled") return;
  open.value = true;
  active.value = selectedIndex.value >= 0 ? selectedIndex.value : firstEnabled(props.options);
}
function close() {
  open.value = false;
  active.value = -1;
}
function choose(i: number) {
  const option = props.options[i];
  if (!option || option.disabled) return;
  emit("update:modelValue", option.value);
  close();
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
      choose(active.value);
      return;
    case "Escape":
      if (open.value) { event.preventDefault(); close(); }
      return;
    case "Tab":
      close();
      return;
    default:
      if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
        if (!open.value) openList();
        const hit = typeahead(props.options, event.key, Math.max(active.value, 0));
        if (hit >= 0) active.value = hit;
      }
  }
}
function onOutside(event: MouseEvent) {
  if (root.value && !root.value.contains(event.target as Node)) close();
}
onMounted(() => document.addEventListener("mousedown", onOutside));
onBeforeUnmount(() => document.removeEventListener("mousedown", onOutside));
</script>

<template>
  <div ref="root" class="wp-select" :class="`is-${state}`">
    <span v-if="label" :id="`${id}-label`" class="wp-select__label">{{ label }}</span>
    <button
      type="button"
      class="wp-select__trigger"
      role="combobox"
      :aria-expanded="open"
      :aria-controls="listId"
      :aria-labelledby="label ? `${id}-label` : undefined"
      :aria-activedescendant="open && active >= 0 ? optionId(active) : undefined"
      :aria-invalid="state === 'invalid' || undefined"
      :disabled="state === 'disabled'"
      @click="open ? close() : openList()"
      @keydown="onKey"
    >
      <span :class="selectedLabel ? 'wp-select__value' : 'wp-select__placeholder'">
        {{ selectedLabel || placeholder }}
      </span>
      <WpIcon :icon="IconChevronDown" size="sm" class="wp-select__marker" />
    </button>
    <ul v-if="open" :id="listId" class="wp-select__list" role="listbox" :aria-labelledby="label ? `${id}-label` : undefined">
      <li
        v-for="(option, i) in options"
        :id="optionId(i)"
        :key="option.value"
        class="wp-select__option"
        :class="{ 'is-active': i === active, 'is-selected': i === selectedIndex, 'is-disabled': option.disabled }"
        role="option"
        :aria-selected="i === selectedIndex"
        :aria-disabled="option.disabled || undefined"
        @mousedown.prevent="choose(i)"
        @mouseenter="!option.disabled && (active = i)"
      >
        <WpIcon v-if="i === selectedIndex" :icon="IconCheck" size="sm" class="wp-select__check" />
        <span class="wp-select__text">{{ option.label }}</span>
        <span v-if="option.hint" class="wp-select__hint">{{ option.hint }}</span>
      </li>
      <li v-if="options.length === 0" class="wp-select__empty">Keine Einträge</li>
    </ul>
  </div>
</template>

<style>
.wp-select { position: relative; display: flex; flex-direction: column; gap: 4px; }
.wp-select__label { font-size: var(--wp-font-size-sm); color: var(--wp-color-text-muted); }
.wp-select__trigger {
  display: flex; align-items: center; justify-content: space-between; gap: var(--wp-space-2);
  width: 100%; height: var(--wp-size-control-md); padding: 0 var(--wp-space-2);
  border: var(--wp-size-border) solid var(--wp-color-border-subtle);
  background: var(--wp-color-bg-input); color: var(--wp-color-text-default);
  font: inherit; font-size: var(--wp-font-size-md); cursor: pointer; text-align: left;
}
.wp-select__trigger:focus-visible { outline: var(--wp-size-focus) solid var(--wp-color-focus-ring); outline-offset: 0; }
.wp-select.is-invalid .wp-select__trigger { border-color: var(--wp-color-status-error); }
.wp-select.is-disabled { opacity: 0.55; }
.wp-select.is-disabled .wp-select__trigger { cursor: not-allowed; }
.wp-select__placeholder { color: var(--wp-color-text-faint); }
.wp-select__marker { color: var(--wp-color-text-faint); flex: none; }
.wp-select__list {
  position: absolute; top: 100%; left: 0; right: 0; z-index: 20;
  margin: 2px 0 0; padding: 0; list-style: none; max-height: 260px; overflow-y: auto;
  background: var(--wp-color-bg-panel);
  border: var(--wp-size-border) solid var(--wp-color-border-strong);
}
.wp-select__option {
  display: flex; justify-content: space-between; gap: var(--wp-space-2);
  padding: 6px var(--wp-space-2); font-size: var(--wp-font-size-md); cursor: pointer;
}
.wp-select__option.is-active { background: var(--wp-color-bg-hover); }
.wp-select__option.is-selected { background: var(--wp-color-bg-selected); }
.wp-select__check { color: var(--wp-color-accent-default); flex: none; }
.wp-select__text { flex: 1; }
.wp-select__option.is-disabled { opacity: 0.45; cursor: not-allowed; }
.wp-select__hint { color: var(--wp-color-text-faint); font-size: var(--wp-font-size-xs); }
.wp-select__empty { padding: 6px var(--wp-space-2); color: var(--wp-color-text-faint); font-size: var(--wp-font-size-sm); }
</style>
