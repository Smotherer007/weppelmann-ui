<script setup lang="ts">
// Status ist ein Summentyp: damit ist "ok" und "error" gleichzeitig unmöglich.
type Tone = "neutral" | "ok" | "warn" | "error";
withDefaults(defineProps<{ label: string; tone?: Tone }>(), { tone: "neutral" });
</script>

<template>
  <span class="wp-badge" :class="`wp-badge--${tone}`">
    <!-- In mono unterscheidet die Form, nicht die Farbe (PLAN.md §6). -->
    <span class="wp-badge__mark" aria-hidden="true" />
    {{ label }}
  </span>
</template>

<style>
.wp-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 1px 8px; border-radius: var(--wp-radius-pill);
  border: 1px solid var(--wp-color-border-subtle);
  background: var(--wp-color-bg-raised);
  color: var(--wp-color-text-muted);
  font-size: 12px; line-height: 18px; white-space: nowrap;
}
.wp-badge__mark { width: 6px; height: 6px; border-radius: var(--wp-radius-pill); background: currentColor; }
.wp-badge--ok { color: var(--wp-color-status-ok); }
.wp-badge--warn { color: var(--wp-color-status-warn); }
.wp-badge--error { color: var(--wp-color-status-error); }
.wp-badge--neutral { color: var(--wp-color-text-muted); }
/* mono: kein Farbunterschied, dafür ein anderes Zeichen */
[data-theme="mono"] .wp-badge--ok .wp-badge__mark { border-radius: 1px; }
[data-theme="mono"] .wp-badge--warn .wp-badge__mark { border-radius: 0; transform: rotate(45deg); }
[data-theme="mono"] .wp-badge--error .wp-badge__mark { border-radius: 0; }
</style>
