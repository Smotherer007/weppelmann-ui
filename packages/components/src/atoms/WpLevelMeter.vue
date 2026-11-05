<script setup lang="ts">
// Pegelanzeige für Sprache. Zeigt zwei Dinge zugleich: den aktuellen Pegel und
// die Schwelle, ab der gesendet wird. Ohne die Schwelle wäre der Balken nur
// hübsch — man will sehen, ob man „drüber" ist.
type Tone = "neutral" | "ok" | "warn";

const props = withDefaults(
  defineProps<{
    /** Aktueller Pegel 0–100 (vom Gerät gemeldet). */
    level: number;
    /** Schwelle 0–100; wird als Marke eingezeichnet. */
    threshold?: number;
    /** Beschriftung für Screenreader. */
    label?: string;
    tone?: Tone;
    /** Balken ohne Rahmen und Hintergrund (für die Seitenleiste). */
    bare?: boolean;
  }>(),
  { threshold: 0, label: "Pegel", tone: "ok", bare: false },
);

const stand = () => Math.max(0, Math.min(100, props.level));
const grenze = () => Math.max(0, Math.min(100, props.threshold));
/** Über der Schwelle? Bei Schwelle 0 gilt: immer stumm (siehe Sprechsteuerung). */
const drueber = () => props.threshold > 0 && stand() >= grenze();
</script>

<template>
  <div
    class="wp-level"
    :class="[`wp-level--${tone}`, { 'is-bare': bare, 'is-hot': drueber() }]"
    role="meter"
    :aria-label="label"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="stand()"
  >
    <span class="wp-level__fill" :style="{ width: `${stand()}%` }" />
    <span
      v-if="threshold > 0"
      class="wp-level__threshold"
      :style="{ left: `${grenze()}%` }"
      aria-hidden="true"
    />
  </div>
</template>

<style>
.wp-level {
  position: relative;
  height: 6px;
  border-radius: var(--wp-radius-pill);
  background: var(--wp-color-bg-input);
  border: 1px solid var(--wp-color-border-subtle);
  overflow: hidden;
}
.wp-level.is-bare { border: 0; background: var(--wp-color-bg-raised); }
.wp-level__fill {
  display: block; height: 100%;
  border-radius: var(--wp-radius-pill);
  background: var(--wp-color-text-faint);
  transition: width var(--wp-duration-fast) linear;
}
.wp-level--ok.is-hot .wp-level__fill { background: var(--wp-color-status-ok); }
.wp-level--warn .wp-level__fill { background: var(--wp-color-status-warn); }
.wp-level--neutral .wp-level__fill { background: var(--wp-color-text-muted); }
.wp-level__threshold {
  position: absolute; top: 0; bottom: 0; width: 1px;
  background: var(--wp-color-text-muted);
  opacity: 0.8;
}
/* mono: kein Farbunterschied, dafür volle Deckkraft über der Schwelle */
[data-theme="mono"] .wp-level--ok.is-hot .wp-level__fill { background: var(--wp-color-text-default); }
</style>
