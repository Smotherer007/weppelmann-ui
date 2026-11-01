<script setup lang="ts">
// Organismus: modaler Dialog. Ersetzt adw::AlertDialog.
//
// Fokusfalle: Beim Öffnen wandert der Fokus in den Dialog, Tab bleibt darin,
// Escape schließt, und der Fokus kehrt zum Auslöser zurück. Ohne das ist ein
// Dialog für Tastatur und Screenreader eine Sackgasse.
import { nextTick, onBeforeUnmount, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: "info" | "warn" | "error";
  }>(),
  { tone: "info" },
);
const emit = defineEmits<{ "update:open": [value: boolean]; confirm: [] }>();

const panel = ref<HTMLElement | null>(null);
let returnFocus: HTMLElement | null = null;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function close() { emit("update:open", false); }
function confirm() { emit("confirm"); emit("update:open", false); }

function onKey(event: KeyboardEvent) {
  if (event.key === "Escape") { event.preventDefault(); close(); return; }
  if (event.key !== "Tab" || !panel.value) return;
  const items = Array.from(panel.value.querySelectorAll<HTMLElement>(FOCUSABLE));
  if (items.length === 0) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      returnFocus = document.activeElement as HTMLElement | null;
      await nextTick();
      const target = panel.value?.querySelector<HTMLElement>(FOCUSABLE) ?? panel.value;
      target?.focus();
    } else {
      returnFocus?.focus();
      returnFocus = null;
    }
  },
);
onBeforeUnmount(() => returnFocus?.focus());
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="wp-dialog__overlay" @mousedown.self="close">
      <div
        ref="panel"
        class="wp-dialog"
        :class="`tone-${tone}`"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        tabindex="-1"
        @keydown="onKey"
      >
        <h2 class="wp-dialog__title">{{ title }}</h2>
        <p v-if="description" class="wp-dialog__desc">{{ description }}</p>
        <div v-if="$slots.default" class="wp-dialog__body"><slot /></div>
        <div class="wp-dialog__actions">
          <slot name="actions">
            <button type="button" class="wp-dialog__btn" @click="close">{{ cancelLabel ?? "Abbrechen" }}</button>
            <button type="button" class="wp-dialog__btn is-primary" @click="confirm">
              {{ confirmLabel ?? "Bestätigen" }}
            </button>
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
.wp-dialog__overlay {
  position: fixed; inset: 0; z-index: 100;
  display: flex; align-items: center; justify-content: center;
  padding: var(--wp-space-5);
  background: color-mix(in srgb, #000000 62%, transparent);
}
.wp-dialog {
  width: min(520px, 100%);
  background: var(--wp-color-bg-panel);
  border: var(--wp-size-border) solid var(--wp-color-border-strong);
  border-top: 3px solid var(--wp-color-accent-default);
  padding: var(--wp-space-4);
  outline: none;
}
.wp-dialog.tone-warn { border-top-color: var(--wp-color-status-warn); }
.wp-dialog.tone-error { border-top-color: var(--wp-color-status-error); }
.wp-dialog__title { margin: 0 0 var(--wp-space-1); font-size: var(--wp-font-size-lg); font-weight: var(--wp-font-weight-semibold); }
.wp-dialog__desc { margin: 0; color: var(--wp-color-text-muted); font-size: var(--wp-font-size-md); line-height: var(--wp-font-line-normal); }
.wp-dialog__body { margin-top: var(--wp-space-3); }
.wp-dialog__actions { display: flex; justify-content: flex-end; gap: var(--wp-space-2); margin-top: var(--wp-space-4); }
.wp-dialog__btn {
  height: var(--wp-size-control-md); padding: 0 var(--wp-space-3);
  border: var(--wp-size-border) solid var(--wp-color-border-subtle);
  background: var(--wp-color-bg-raised); color: var(--wp-color-text-default);
  font: inherit; font-size: var(--wp-font-size-md); cursor: pointer;
}
.wp-dialog__btn.is-primary { background: var(--wp-color-accent-default); border-color: var(--wp-color-accent-default); color: var(--wp-color-text-on-accent); }
.wp-dialog__btn:focus-visible { outline: var(--wp-size-focus) solid var(--wp-color-focus-ring); outline-offset: 1px; }
</style>
