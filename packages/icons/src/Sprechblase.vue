<script setup lang="ts">
// Sprechblase — hier gezeichnet, nicht aus Lucide übernommen.
//
// Warum eigenes Icon: Lucide hat Sprechblasen (`message-square`,
// `message-circle`), aber beide sind entweder eckig oder rund ohne Schwanz
// unten rechts. Dieses Symbol hält sich an dieselbe Sprache wie der übrige
// Satz: 24er-Raster, **Strich** statt Fläche, runde Ecken und Enden,
// `currentColor`, Strichstärke kommt von außen (`WpIcon`).
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <!-- Korpus mit abgerundeten Ecken; unten rechts setzt der Schwanz an. -->
    <path d="M6 4 H18 A3 3 0 0 1 21 7 V15 A3 3 0 0 1 18 18 H17 V21.5 L13.5 18 H6 A3 3 0 0 1 3 15 V7 A3 3 0 0 1 6 4 Z" />
  </svg>
</template>
