<script setup lang="ts">
// Rundes Namenszeichen mit Zustand: spricht gerade, ist stumm, ist abwesend.
// Ein Bild braucht es dafür nicht — die Initialen genügen und sind billiger als
// Fotos (keine Uploads, keine Moderation, kein Datenschutzthema).
import { computed } from "vue";

type Size = "sm" | "md" | "lg";
type Tone = "neutral" | "accent";

const props = withDefaults(
  defineProps<{
    /** Anzeigename; die Initialen werden daraus gebildet. */
    name: string;
    size?: Size;
    /** Spricht gerade — der Ring pulsiert. */
    speaking?: boolean;
    /** Stummgeschaltet (Mikrofon zu) — wird durchgestrichen dargestellt. */
    muted?: boolean;
    /** Abwesend — halb durchsichtig. */
    away?: boolean;
    tone?: Tone;
  }>(),
  { size: "md", speaking: false, muted: false, away: false, tone: "neutral" },
);

/** Höchstens zwei Initialen, aus den ersten beiden Wörtern. */
const initialen = computed(() => {
  const woerter = props.name.trim().split(/\s+/).filter(Boolean);
  if (woerter.length === 0) return "?";
  if (woerter.length === 1) return woerter[0].slice(0, 2).toUpperCase();
  return (woerter[0][0] + woerter[1][0]).toUpperCase();
});

const beschriftung = computed(() => {
  const zustaende = [props.name];
  if (props.speaking) zustaende.push("spricht");
  if (props.muted) zustaende.push("stumm");
  if (props.away) zustaende.push("abwesend");
  return zustaende.join(", ");
});
</script>

<template>
  <span
    class="wp-avatar"
    :class="[
      `wp-avatar--${size}`,
      `wp-avatar--${tone}`,
      { 'is-speaking': speaking, 'is-muted': muted, 'is-away': away },
    ]"
    role="img"
    :aria-label="beschriftung"
    :title="beschriftung"
  >
    <span class="wp-avatar__text" aria-hidden="true">{{ initialen }}</span>
    <span v-if="muted" class="wp-avatar__mute" aria-hidden="true" />
  </span>
</template>

<style>
.wp-avatar {
  position: relative;
  display: inline-flex; align-items: center; justify-content: center;
  flex: none;
  border-radius: var(--wp-radius-pill);
  background: var(--wp-color-bg-raised);
  color: var(--wp-color-text-muted);
  border: var(--wp-size-border) solid var(--wp-color-border-subtle);
  font-family: var(--wp-font-family-mono);
  letter-spacing: 0.02em;
  user-select: none;
}
.wp-avatar--sm { width: 24px; height: 24px; font-size: var(--wp-font-size-xs); }
.wp-avatar--md { width: 32px; height: 32px; font-size: var(--wp-font-size-sm); }
.wp-avatar--lg { width: 40px; height: 40px; font-size: var(--wp-font-size-md); }

.wp-avatar--accent { color: var(--wp-color-text-on-accent); background: var(--wp-color-accent-default); border-color: transparent; }
.wp-avatar.is-away { opacity: 0.55; }

/* Sprechen: ein Ring, der pulsiert — die Bewegung ist die Information,
   Farbe allein wäre in „mono" nicht zu sehen. */
.wp-avatar.is-speaking {
  border-color: var(--wp-color-status-ok);
  box-shadow: 0 0 0 2px var(--wp-color-status-ok);
  animation: wp-avatar-puls var(--wp-duration-normal) ease-in-out infinite alternate;
}
@keyframes wp-avatar-puls {
  from { box-shadow: 0 0 0 1px var(--wp-color-status-ok); }
  to { box-shadow: 0 0 0 4px var(--wp-color-status-ok); }
}
@media (prefers-reduced-motion: reduce) {
  .wp-avatar.is-speaking { animation: none; box-shadow: 0 0 0 2px var(--wp-color-status-ok); }
}

/* Stumm: ein Strich von links unten nach rechts oben, wie am Mikrofonknopf. */
.wp-avatar.is-muted .wp-avatar__text { opacity: 0.5; }
.wp-avatar__mute {
  position: absolute; inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    to top right,
    transparent calc(50% - 1px),
    var(--wp-color-status-error) calc(50% - 1px),
    var(--wp-color-status-error) calc(50% + 1px),
    transparent calc(50% + 1px)
  );
}
</style>
