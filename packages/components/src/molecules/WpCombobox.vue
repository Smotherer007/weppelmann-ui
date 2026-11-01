<script setup lang="ts">
// Suche mit Vorschlagsliste. Für den Addon-Katalog: tippen filtert, Auswahl setzt einen Wert.
// aria-autocomplete="list": Screenreader lesen die Trefferzahl beim Tippen.
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { firstEnabled, nextEnabled } from "../composables/list";
import type { ListOption } from "../types";
import { useId } from "../composables/useId";

const props = withDefaults(
  defineProps<{
    modelValue: string | null;
    options: ListOption[];
    label?: string;
    placeholder?: string;
    emptyText?: string;
    disabled?: boolean;
  }>(),
  { placeholder: "Suchen …", emptyText: "Keine Treffer" },
);
const emit = defineEmits<{ "update:modelValue": [value: string | null] }>();

const root = ref<HTMLElement | null>(null);
const input = ref<HTMLInputElement | null>(null);
const query = ref("");
const open = ref(false);
const active = ref(-1);
const id = useId("wp-combo");
const listId = `${id}-list`;
const optionId = (i: number) => `${id}-opt-${i}`;

const selectedLabel = computed(() => props.options.find((o) => o.value === props.modelValue)?.label ?? "");
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return props.options;
  return props.options.filter((o) => o.label.toLowerCase().includes(q));
});
const counter = computed(() => `${filtered.value.length} von ${props.options.length} Treffern`);

watch(query, () => { active.value = firstEnabled(filtered.value); open.value = true; });
watch(
  () => props.modelValue,
  () => { if (!open.value) query.value = ""; },
);

function openList() {
  open.value = true;
  active.value = firstEnabled(filtered.value);
}
function close() {
  open.value = false;
  active.value = -1;
  query.value = "";
}
function choose(i: number) {
  const option = filtered.value[i];
  if (!option || option.disabled) return;
  emit("update:modelValue", option.value);
  close();
  input.value?.blur();
}
function onKey(event: KeyboardEvent) {
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      if (!open.value) return openList();
      active.value = nextEnabled(filtered.value, active.value, 1);
      return;
    case "ArrowUp":
      event.preventDefault();
      if (!open.value) return openList();
      active.value = nextEnabled(filtered.value, active.value, -1);
      return;
    case "Enter":
      event.preventDefault();
      if (open.value) choose(active.value);
      return;
    case "Escape":
      if (open.value) { event.preventDefault(); close(); }
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
  <div ref="root" class="wp-combo">
    <label v-if="label" :for="id" class="wp-combo__label">{{ label }}</label>
    <div class="wp-combo__box">
      <input
        :id="id"
        ref="input"
        class="wp-combo__input"
        type="text"
        role="combobox"
        autocomplete="off"
        aria-autocomplete="list"
        :aria-expanded="open"
        :aria-controls="listId"
        :aria-activedescendant="open && active >= 0 ? optionId(active) : undefined"
        :placeholder="selectedLabel || placeholder"
        :value="query"
        :disabled="disabled"
        @focus="openList"
        @input="query = ($event.target as HTMLInputElement).value"
        @keydown="onKey"
      />
      <span class="wp-combo__count" aria-hidden="true">{{ query ? counter : "" }}</span>
    </div>
    <ul v-if="open" :id="listId" class="wp-combo__list" role="listbox">
      <li
        v-for="(option, i) in filtered"
        :id="optionId(i)"
        :key="option.value"
        class="wp-combo__option"
        :class="{ 'is-active': i === active, 'is-selected': option.value === modelValue, 'is-disabled': option.disabled }"
        role="option"
        :aria-selected="option.value === modelValue"
        @mousedown.prevent="choose(i)"
        @mouseenter="!option.disabled && (active = i)"
      >
        <span>{{ option.label }}</span>
        <span v-if="option.hint" class="wp-combo__hint">{{ option.hint }}</span>
      </li>
      <li v-if="filtered.length === 0" class="wp-combo__empty">{{ emptyText }}</li>
    </ul>
  </div>
</template>

<style>
.wp-combo { position: relative; display: flex; flex-direction: column; gap: 4px; }
.wp-combo__label { font-size: var(--wp-font-size-sm); color: var(--wp-color-text-muted); }
.wp-combo__box { position: relative; }
.wp-combo__input {
  width: 100%; height: var(--wp-size-control-md); padding: 0 72px 0 var(--wp-space-2);
  border: var(--wp-size-border) solid var(--wp-color-border-subtle);
  background: var(--wp-color-bg-input); color: var(--wp-color-text-default);
  font: inherit; font-size: var(--wp-font-size-md);
}
.wp-combo__input:focus-visible { outline: var(--wp-size-focus) solid var(--wp-color-focus-ring); outline-offset: 0; }
.wp-combo__count { position: absolute; right: var(--wp-space-2); top: 50%; transform: translateY(-50%); font-size: var(--wp-font-size-xs); color: var(--wp-color-text-faint); pointer-events: none; }
.wp-combo__list {
  position: absolute; top: 100%; left: 0; right: 0; z-index: 20; margin: 2px 0 0; padding: 0;
  list-style: none; max-height: 280px; overflow-y: auto;
  background: var(--wp-color-bg-panel); border: var(--wp-size-border) solid var(--wp-color-border-strong);
}
.wp-combo__option { display: flex; justify-content: space-between; gap: var(--wp-space-2); padding: 6px var(--wp-space-2); font-size: var(--wp-font-size-md); cursor: pointer; }
.wp-combo__option.is-active { background: var(--wp-color-bg-hover); }
.wp-combo__option.is-selected { background: var(--wp-color-bg-selected); }
.wp-combo__option.is-disabled { opacity: 0.45; cursor: default; }
.wp-combo__hint { color: var(--wp-color-text-faint); font-size: var(--wp-font-size-xs); }
.wp-combo__empty { padding: 6px var(--wp-space-2); color: var(--wp-color-text-faint); font-size: var(--wp-font-size-sm); }
</style>
