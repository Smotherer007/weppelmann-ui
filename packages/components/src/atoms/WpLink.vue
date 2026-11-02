<script setup lang="ts">
// Ein Link.
//
// Die Bibliothek weiss nichts von Fenstern: sie meldet `open` mit der Adresse,
// und die App oeffnet sie — im Systembrowser (`oeffne_url`), nicht im Fenster.
// `href` steht trotzdem am Element, damit die Statuszeile beim Ueberfahren etwas
// zeigt und Kopieren funktioniert.
const props = withDefaults(
  defineProps<{
    href: string;
    /** Zeigt das Zeichen fuer „geht nach draussen". */
    external?: boolean;
    /** Text, wenn kein Slot gefuellt ist. */
    label?: string;
    /** Ueber die ganze Breite, mit Abschneiden bei zu langem Text. */
    block?: boolean;
  }>(),
  { external: false, block: false },
);
const emit = defineEmits<{ open: [href: string] }>();

function klick(ereignis: MouseEvent) {
  // Mittlere Maustaste und Mod+Klick bleiben dem Browser vorbehalten.
  if (ereignis.metaKey || ereignis.ctrlKey || ereignis.shiftKey || ereignis.button !== 0) return;
  ereignis.preventDefault();
  emit("open", props.href);
}
</script>

<template>
  <a class="wp-link" :class="{ 'is-block': props.block }" :href="props.href"
     :rel="props.external ? 'noreferrer noopener' : undefined"
     @click="klick">
    <span class="wp-link__text"><slot>{{ props.label }}</slot></span>
    <svg v-if="props.external" class="wp-link__zeichen" viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
      <path d="M4 2 H10 V8 M10 2 L3 9" fill="none" stroke="currentColor" stroke-width="1.4"
            stroke-linecap="square" stroke-linejoin="miter" />
    </svg>
  </a>
</template>

<style>
.wp-link {
  display: inline-flex; align-items: center; gap: 4px;
  color: var(--wp-color-accent-default);
  text-decoration: none; cursor: pointer;
  font-size: inherit;
}
.wp-link__text { border-bottom: 1px solid transparent; }
.wp-link:hover .wp-link__text { border-bottom-color: currentColor; }
.wp-link:focus-visible { outline: var(--wp-size-focus) solid var(--wp-color-focus-ring); outline-offset: 2px; }
.wp-link__zeichen { flex: none; opacity: 0.75; }
.wp-link.is-block { display: flex; max-width: 100%; }
.wp-link.is-block .wp-link__text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
