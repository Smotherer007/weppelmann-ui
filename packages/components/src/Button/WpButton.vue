<script setup lang="ts">
// Zustand ist ein Summentyp, kein Fächer aus Booleans:
// "busy" und "disabled" sind Zustände, keine Flags (AGENTS.md §2.2).
type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";
type State = "default" | "busy" | "disabled";

const props = withDefaults(
  defineProps<{
    label: string;
    variant?: Variant;
    size?: Size;
    state?: State;
  }>(),
  { variant: "secondary", size: "md", state: "default" },
);

const emit = defineEmits<{ press: [] }>();

function onClick() {
  // Der einzige Entscheidungspunkt dieser Komponente: darf gedrückt werden?
  if (props.state !== "default") return;
  emit("press");
}
</script>

<template>
  <button
    class="wp-button"
    :class="[`wp-button--${variant}`, `wp-button--${size}`, `is-${state}`]"
    :disabled="state === 'disabled' || state === 'busy'"
    :aria-busy="state === 'busy' || undefined"
    type="button"
    @click="onClick"
  >
    <span v-if="state === 'busy'" class="wp-button__spinner" aria-hidden="true" />
    <span class="wp-button__label">{{ label }}</span>
  </button>
</template>

<style>
/* Alle Werte kommen aus den Tokens; keine Hex-Werte, keine px-Magie. */
.wp-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: var(--wp-radius-md);
  border: 1px solid var(--wp-color-border-subtle);
  background: var(--wp-color-bg-raised);
  color: var(--wp-color-text-default);
  font: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--wp-duration-fast), border-color var(--wp-duration-fast);
}
.wp-button--sm { height: 28px; padding: 0 10px; font-size: 12px; }
.wp-button--md { height: 32px; padding: 0 14px; font-size: 14px; }
.wp-button--lg { height: 40px; padding: 0 18px; font-size: 15px; }

.wp-button--primary {
  background: var(--wp-color-accent-default);
  border-color: var(--wp-color-accent-default);
  color: var(--wp-color-text-on-accent);
}
.wp-button--secondary { background: var(--wp-color-bg-raised); }
.wp-button--ghost { background: transparent; border-color: transparent; }
.wp-button--danger {
  background: transparent;
  border-color: var(--wp-color-status-error);
  color: var(--wp-color-status-error);
}

.wp-button:hover:not(.is-disabled):not(.is-busy) { background: var(--wp-color-bg-hover); }
.wp-button--primary:hover:not(.is-disabled):not(.is-busy) { background: var(--wp-color-accent-hover); }
.wp-button:active:not(.is-disabled):not(.is-busy) { background: var(--wp-color-bg-selected); }
.wp-button.is-disabled, .wp-button.is-busy { opacity: 0.55; cursor: default; }

.wp-button__spinner {
  width: 12px; height: 12px; border-radius: var(--wp-radius-pill);
  border: 2px solid currentColor; border-right-color: transparent;
  animation: wp-spin 700ms linear infinite;
}
@keyframes wp-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .wp-button__spinner { animation-duration: 2s; }
}
</style>
