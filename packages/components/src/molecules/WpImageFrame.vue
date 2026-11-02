<script setup lang="ts">
// Rahmen für ein Bild oder eine Vorschau.
//
// Einheitliches Format statt „so groß, wie das Bild halt ist": in einer Galerie
// springt sonst bei jedem Bild die ganze Seite. Das Bild wird eingepasst, nicht
// beschnitten (`contain`), damit nichts verschwindet.
//
// Zustand als Summentyp: „lädt und fehlt" ist nicht darstellbar.
import type { Component } from "vue";

type State =
  | { kind: "bild"; src: string }
  | { kind: "laedt" }
  | { kind: "fehlt"; text?: string };

const props = withDefaults(
  defineProps<{
    state: State;
    /** Seitenverhältnis der Fläche, z. B. "16 / 9". */
    ratio?: string;
    /** Maximale Höhe; begrenzt die Fläche in hohen Fenstern. */
    maxHeight?: string;
    /** Kurze Zeile unter dem Bild (Zähler, Quelle). */
    caption?: string;
    /** Beschriftung für Screenreader, wenn das Bild Bedeutung trägt. */
    alt?: string;
    /** Zeigt die Hand — nur setzen, wenn ein Klick etwas auslöst. */
    clickable?: boolean;
    icon?: Component;
  }>(),
  { ratio: "16 / 9", maxHeight: "320px", alt: "", clickable: false },
);
</script>

<template>
  <figure class="wp-bild">
    <div class="wp-bild__flaeche" :class="{ 'is-clickable': props.clickable }"
         :style="{ aspectRatio: props.ratio, maxHeight: props.maxHeight }">
      <img v-if="props.state.kind === 'bild'" class="wp-bild__img" :src="props.state.src"
           :alt="props.alt" loading="lazy" />
      <div v-else-if="props.state.kind === 'laedt'" class="wp-bild__hinweis">
        <span class="wp-bild__text">lädt …</span>
      </div>
      <div v-else class="wp-bild__hinweis">
        <component :is="props.icon" v-if="props.icon" class="wp-bild__icon" />
        <span class="wp-bild__text">{{ props.state.text ?? "kein Bild" }}</span>
      </div>
    </div>
    <figcaption v-if="props.caption" class="wp-bild__fuss">{{ props.caption }}</figcaption>
  </figure>
</template>

<style>
.wp-bild { margin: 0; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
/* Dezente Umrahmung: eine Haarlinie, kein Kasten. Die Flaeche selbst ist die
   Papiermaß-Farbe, damit ein transparentes Bild nicht im Hintergrund schwimmt. */
.wp-bild__flaeche {
  display: flex; align-items: center; justify-content: center;
  width: 100%; overflow: hidden;
  background: var(--wp-color-bg-input);
  border: var(--wp-size-border) solid var(--wp-color-border-subtle);
}
.wp-bild__flaeche.is-clickable { cursor: pointer; }
.wp-bild__flaeche.is-clickable:hover { border-color: var(--wp-color-border-strong); }
.wp-bild__img { width: 100%; height: 100%; object-fit: contain; display: block; }
.wp-bild__hinweis { display: flex; flex-direction: column; align-items: center; gap: 4px; color: var(--wp-color-text-faint); }
.wp-bild__icon { width: 20px; height: 20px; }
.wp-bild__text { font-size: var(--wp-font-size-xs); }
.wp-bild__fuss {
  font-family: var(--wp-font-family-mono); font-size: var(--wp-font-size-xs);
  color: var(--wp-color-text-faint); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
</style>
