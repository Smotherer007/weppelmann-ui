<script setup lang="ts">
// Organismus: Menü hinter einem Auslöser. Ersetzt gtk::MenuButton + Popover.
// Auf macOS erscheint später dieselbe Liste in der Menüleiste; die Komponente
// entscheidet nichts über die Plattform, sie stellt dar, was übergeben wird.
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { MenuItem } from "../types";

const props = withDefaults(
  defineProps<{
  items: MenuItem[];
  label: string;
  /**
   * Gesteuertes Öffnen (`v-model:open`). Nötig für Kontextmenüs: dort öffnet
   * nicht der Knopf, sondern ein Rechtsklick auf die Zeile. Ohne diese Angabe
   * öffnet und schließt die Komponente selbst.
   */
  open?: boolean | null;
  /** Ausrichtung der Liste; `left` für Menüs am linken Fensterrand. */
  align?: "left" | "right";
  }>(),
  // `open: null` = nicht gesteuert. Wichtig: ein reines Boolean-Prop ohne
  // Angabe gießt Vue zu `false` — dann wäre das Menü immer zu und der eigene
  // Zustand käme nie zum Zug.
  { open: null, align: "right" },
);
const emit = defineEmits<{ select: [id: string]; "update:open": [boolean] }>();

const root = ref<HTMLElement | null>(null);
/** Die Liste selbst — sie liegt per Teleport außerhalb des Baums. */
const liste = ref<HTMLElement | null>(null);
const eigen = ref(false);
const active = ref(-1);
/**
 * Bildschirmposition der Liste. Sie wird **fest** positioniert: in einer
 * scrollenden Seitenleiste würde eine absolut positionierte Liste am Rand
 * abgeschnitten (live gesehen: halbe Menüpunkte).
 */
const stelle = ref({ left: 0, top: 0 });
const BREITE = 220;

function messen() {
  const r = root.value?.getBoundingClientRect();
  if (!r) return;
  const links = props.align === "left" ? r.left : r.right - BREITE;
  stelle.value = {
    left: Math.max(8, Math.min(links, window.innerWidth - BREITE - 8)),
    top: Math.min(r.bottom + 4, window.innerHeight - 8),
  };
}

/** Offen? Entweder gesteuert von außen oder selbst entschieden. */
const offen = computed(() => (props.open === null ? eigen.value : props.open));

watch(offen, (istOffen) => {
  if (istOffen) messen();
});

function setzeOffen(wert: boolean) {
  eigen.value = wert;
  emit("update:open", wert);
}

/**
 * Zeitpunkt des Öffnens. Ein Kontextmenü erscheint **unter dem Mauszeiger** —
 * die Geste, die es geöffnet hat (Rechtsklick), darf nicht gleich einen Eintrag
 * auslösen. Deshalb wird in den ersten 250 ms nach dem Öffnen nichts gewählt.
 */
let geoeffnetAm = 0;

function toggle() { offen.value ? close() : openMenu(); }
function openMenu() {
  setzeOffen(true);
  geoeffnetAm = Date.now();
  active.value = props.items.findIndex((i) => !i.disabled);
}
function close() { setzeOffen(false); active.value = -1; }
function choose(id: string) {
  if (Date.now() - geoeffnetAm < 250) return;
  const item = props.items.find((i) => i.id === id);
  if (!item || item.disabled) return;
  emit("select", id);
  close();
}
function onKey(event: KeyboardEvent) {
  if (!offen.value) {
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
  // Nur die **linke** Maustaste schließt. Ein Rechtsklick öffnet ein
  // Kontextmenü — würde er auch schließen, wäre das Menü sofort wieder zu
  // (Ablauf: mousedown → contextmenu).
  if (event.button !== 0) return;
  const ziel = event.target as Node;
  const drinnen =
    (root.value && root.value.contains(ziel)) || (liste.value && liste.value.contains(ziel));
  if (!drinnen) close();
}
// Bei gesteuertem Öffnen (Kontextmenü) schließt auch ein Klick außerhalb.
onMounted(() => document.addEventListener("mousedown", onOutside));
onBeforeUnmount(() => document.removeEventListener("mousedown", onOutside));
</script>

<template>
  <div ref="root" class="wp-menu">
    <!-- Der Auslöser ist **kein** <button>: im Slot steckt oft ein
         IconButton, und verschachtelte Buttons sind ungültiges HTML — der
         Browser wirft den äußeren auseinander, der Klick erreicht ihn nie. -->
    <span
      class="wp-menu__trigger"
      role="button"
      tabindex="0"
      :aria-label="label"
      aria-haspopup="menu"
      :aria-expanded="offen"
      @click="toggle"
      @keydown="onKey"
    >
      <slot />
    </span>
    <!-- `Teleport`: Die Liste liegt am Ende von <body>. Sonst schneiden
         scrollende oder überlappende Vorfahren sie ab (live gesehen: halbe
         Menüpunkte, von der Seitenleiste beschnitten). -->
    <Teleport to="body">
      <ul
      v-if="offen"
      ref="liste"
      class="wp-menu__list"
      :class="`is-${align ?? 'right'}`"
      :style="{ left: `${stelle.left}px`, top: `${stelle.top}px` }"
      role="menu"
      :aria-label="label"
      >
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
    </Teleport>
  </div>
</template>

<style>
.wp-menu { position: relative; display: inline-block; }
.wp-menu__trigger { background: none; border: 0; padding: 0; font: inherit; color: inherit; cursor: pointer; display: inline-flex; align-items: center; border-radius: var(--wp-radius-sm); }
.wp-menu__trigger:focus-visible { outline: var(--wp-size-focus) solid var(--wp-color-focus-ring); outline-offset: 2px; }
.wp-menu__list {
  position: fixed; z-index: 60; min-width: 220px;
  margin: 0; padding: 4px 0; list-style: none;
  background: var(--wp-color-bg-panel); border: var(--wp-size-border) solid var(--wp-color-border-strong);
  /* Kein Schatten: Trennung durch Rahmen, nicht durch Weichzeichnen. */
}

.wp-menu__item { display: flex; justify-content: space-between; gap: var(--wp-space-3); padding: 6px var(--wp-space-3); font-size: var(--wp-font-size-md); cursor: pointer; }
.wp-menu__item.is-active { background: var(--wp-color-bg-hover); }
.wp-menu__item.is-disabled { opacity: 0.45; cursor: default; }
.wp-menu__item.is-danger { color: var(--wp-color-status-error); }
.wp-menu__hint { color: var(--wp-color-text-faint); font-size: var(--wp-font-size-xs); }
.wp-menu__sep { height: var(--wp-size-border); background: var(--wp-color-border-subtle); margin: 4px 0; }
</style>
