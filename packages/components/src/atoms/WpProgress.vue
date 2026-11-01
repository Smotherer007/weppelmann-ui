<script setup lang="ts">
// value === null bedeutet "unbestimmt": kein Fortschritt bekannt, nur Aktivität.
// Das ist ein Wert, kein zweites Flag.
import { computed } from "vue";
const props = withDefaults(defineProps<{ value: number | null; max?: number; label?: string }>(),
  { max: 100, label: "Fortschritt" });
const percent = computed(() => (props.value === null ? null : Math.min(100, Math.round((props.value / props.max) * 100))));
</script>

<template>
  <div class="wp-progress" :class="{ 'is-indeterminate': percent === null }" role="progressbar"
       :aria-label="label" :aria-valuenow="percent ?? undefined" aria-valuemin="0" :aria-valuemax="100">
    <span class="wp-progress__bar" :style="percent === null ? undefined : { width: `${percent}%` }" />
  </div>
</template>

<style>
.wp-progress { width: 100%; height: 6px; background: var(--wp-color-bg-input); overflow: hidden; }
.wp-progress__bar { display: block; height: 100%; background: var(--wp-color-accent-default); transition: width var(--wp-duration-normal); }
.wp-progress.is-indeterminate .wp-progress__bar { width: 35%; animation: wp-slide 1.1s ease-in-out infinite; }
@keyframes wp-slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
@media (prefers-reduced-motion: reduce) { .wp-progress.is-indeterminate .wp-progress__bar { animation-duration: 3s; } }
</style>
