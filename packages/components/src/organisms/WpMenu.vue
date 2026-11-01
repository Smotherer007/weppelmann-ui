<script setup lang="ts">
// Organismus: Menü hinter einem Auslöser. Ersetzt gtk::MenuButton + Popover.
// Auf macOS erscheint später dieselbe Liste in der Menüleiste; die Komponente
// entscheidet nichts über die Plattform, sie stellt dar, was übergeben wird.
import { onBeforeUnmount, onMounted, ref } from "vue";
import type { MenuItem } from "../types";

const props = defineProps<{ items: MenuItem[]; label: string }>();
const emit = defineEmits<{ select: [id: string] }>();

const root = ref<HTMLElement | null>(null);
const open = ref(false);
const active = ref(-1);

function toggle() { open.value ? close() : openMenu(); }
function openMenu() {
  open.value = true;
  active.value = props.items.findIndex((i) => !i.disabled);
}
function close() { open.value = false; active.value = -1; }
function choose(id: string) {
  const item = props.items.find((i) => i.id === id);
  if (!item || item.disabled) return;
  emit("select", id);
  close();
}
function onKey(event: KeyboardEvent) {
  if (!open.value) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") { event.preventDefault(); openMenu(); }
    return;
  }
  const step = (d: 1 | -1) => {
    const n = props.items.length;
    for (let k = 1; k <= n; k++) {
      const i = (active.value + d * k + n * n) % n;
      if (!props.items[i].disabled) { active.value = i; return; }
    }
  };
  if (event.key === "ArrowDown") { event.preventDefault(); step(1); }
  else if (event.key === "ArrowUp") { event.preventDefault(); step(-1); }
  else if (event.key === "Escape") { event.preventDefault(); close(); }
  else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    const item = props.items[active.value];
    if (item) choose(item.id);
  } else if (event.key === "Tab") close();
}
function onOutside(event: MouseEvent) {
  if (root.value && !root.value.contains(event.target as Node)) close();
}
onMounted(() => document.addEventListener("mousedown", onOutside));
onBeforeUnmount(() => document.removeEventListener("mousedown", onOutside));
</script>

<template>
  <div ref="root" class="wp-menu">
    <button
      type="button"
      class="wp-menu__trigger"
      :aria-label="label"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click="toggle"
      @keydown="onKey"
    >
      <slot />
    </button>
    <ul v-if="open" class="wp-menu__list" role="menu" :aria-label="label">
      <template v-for="(item, i) in items" :key="item.id">
        <li v-if="item.separatorBefore" class="wp-menu__sep" role="separator" />
        <li
          class="wp-menu__item"
          :class="{ 'is-active': i === active, 'is-disabled': item.disabled, 'is-danger': item.danger }"
          role="menuitem"
          :aria-disabled="item.disabled || undefined"
          :tabindex="i === active ? 0 : -1"
          @mousedown.prevent="choose(item.id)"
          @mouseenter="!item.disabled && (active = i)"
        >
          <span>{{ item.label }}</span>
          <span v-if="item.hint" class="wp-menu__hint">{{ item.hint }}</span>
        </li>
      </template>
    </ul>
  </div>
</template>

<style>
.wp-menu { position: relative; display: inline-block; }
.wp-menu__trigger { background: none; border: 0; padding: 0; font: inherit; color: inherit; cursor: pointer; display: inline-flex; }
.wp-menu__trigger:focus-visible { outline: var(--wp-size-focus) solid var(--wp-color-focus-ring); outline-offset: 2px; }
.wp-menu__list {
  position: absolute; right: 0; top: calc(100% + 4px); z-index: 40; min-width: 200px;
  margin: 0; padding: 4px 0; list-style: none;
  background: var(--wp-color-bg-panel); border: var(--wp-size-border) solid var(--wp-color-border-strong);
}
.wp-menu__item { display: flex; justify-content: space-between; gap: var(--wp-space-3); padding: 6px var(--wp-space-3); font-size: var(--wp-font-size-md); cursor: pointer; }
.wp-menu__item.is-active { background: var(--wp-color-bg-hover); }
.wp-menu__item.is-disabled { opacity: 0.45; cursor: default; }
.wp-menu__item.is-danger { color: var(--wp-color-status-error); }
.wp-menu__hint { color: var(--wp-color-text-faint); font-size: var(--wp-font-size-xs); }
.wp-menu__sep { height: var(--wp-size-border); background: var(--wp-color-border-subtle); margin: 4px 0; }
</style>
