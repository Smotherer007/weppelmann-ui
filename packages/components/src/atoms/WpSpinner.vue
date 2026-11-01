<script setup lang="ts">
withDefaults(defineProps<{ size?: "sm" | "md"; label?: string }>(), { size: "sm", label: "Lädt" });
</script>

<template>
  <span class="wp-spinner" :class="`is-${size}`" role="status" :aria-label="label">
    <span class="wp-spinner__ring" aria-hidden="true" />
  </span>
</template>

<style>
.wp-spinner { display: inline-flex; align-items: center; justify-content: center; }
.wp-spinner__ring {
  border: 2px solid var(--wp-color-text-faint); border-right-color: transparent;
  animation: wp-spin 700ms linear infinite;
}
.wp-spinner.is-sm .wp-spinner__ring { width: 12px; height: 12px; }
.wp-spinner.is-md .wp-spinner__ring { width: 20px; height: 20px; border-width: 3px; }
@keyframes wp-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .wp-spinner__ring { animation-duration: 2s; } }
</style>
