<script setup lang="ts">
// Nyan-Cat als Ladeanzeige.
//
// Quelle ist die GTK-Fassung (crates/ui-gtk/src/nyan.rs), die ihrerseits vom
// CodePen „CSS Nyan Cat" von eusonic abstammt (Skalierung 1 Bildpunkt = 1 px).
// Die Raster sind dort aus den CSS-Ebenen erzeugt, nicht abgezeichnet: jede
// Ebene (Pop-Tart, Kopf, Beine, Schwanz, Regenbogen) ist ein Farbband an fester
// Stelle. Hier stehen dieselben Raster, gezeichnet auf ein Canvas.
//
// Bewegung wie im Original: sechs Bilder je Zyklus, Regenbogen mit zwölf,
// Schritt 83 ms. Läuft nur, solange `active` gesetzt ist — danach steht das
// erste Bild.
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    /** Läuft der Vorgang, für den die Katze läuft? */
    active?: boolean;
    /** Beschriftung für Screenreader; die Zeichnung selbst ist stumm. */
    label?: string;
    /** 1 = ein Bildpunkt ist ein Gerätepunkt. */
    scale?: number;
  }>(),
  { active: false, label: "lädt", scale: 1 },
);

const STEP_MS = 83;
const W = 96;
const H = 26;

const FARBEN: Record<string, string> = {
  "#": "#000000",
  t: "#ffcc99",
  P: "#ff99ff",
  m: "#ff3399",
  g: "#999999",
  p: "#ff9999",
  w: "#ffffff",
  r: "#ff0000",
  o: "#ff9900",
  y: "#ffff00",
  G: "#33ff00",
  l: "#0099ff",
  b: "#6633ff",
};

/** Regenbogen-Kachel 16 x 19, sechs Farben zu drei Zeilen. */
const RAINBOW = [
  "rrrrrrrr........",
  "rrrrrrrrrrrrrrrr",
  "rrrrrrrrrrrrrrrr",
  "oooooooorrrrrrrr",
  "oooooooooooooooo",
  "oooooooooooooooo",
  "yyyyyyyyoooooooo",
  "yyyyyyyyyyyyyyyy",
  "yyyyyyyyyyyyyyyy",
  "GGGGGGGGyyyyyyyy",
  "GGGGGGGGGGGGGGGG",
  "GGGGGGGGGGGGGGGG",
  "llllllllGGGGGGGG",
  "llllllllllllllll",
  "llllllllllllllll",
  "bbbbbbbbllllllll",
  "bbbbbbbbbbbbbbbb",
  "bbbbbbbbbbbbbbbb",
  "........bbbbbbbb",
];

/** Pop-Tart 21 x 18. */
const POPTART = [
  "..#################..",
  "#ttttttttttttttttttt#",
  "#tttPPPPPPPPPPPPPttt#",
  "#ttPPPPPPmPPmPPPPPtt#",
  "#tPPmPPPPPPPPPPPPPPt#",
  "#tPPPPPPPPPPPPPPmPPt#",
  "#tPPPPPPPPPPPPPPPPPt#",
  "#tPPPPPPmPPPPPPPPPPt#",
  "#tPPPPPPPPPPPPPPPPPt#",
  "#tPPPmPPPPPPPPPPPPPt#",
  "#tPPPPPPPmPPPPPPPPPt#",
  "#tPmPPPPPPPPPPPPPPPt#",
  "#tPPPPPPPPPPPPPPPPPt#",
  "#tPPPPPmPPPPPPPPPPPt#",
  "#ttPmPPPPPPmPPPPPPtt#",
  "#tttPPPPPPPPPPPPPttt#",
  "#ttttttttttttttttttt#",
  "..#################..",
];

/** Kopf 16 x 13. */
const HEAD = [
  "..##........##..",
  ".#gg#......#gg#.",
  ".#ggg#....#ggg#.",
  ".#gggg####gggg#.",
  ".#gggggggggggg#.",
  "#gggggggggggggg#",
  "#gggw#gggggw#gg#",
  "#ggg##ggg#g##gg#",
  "#gppgggggggggpp#",
  "#gppg#gg#gg#gpp#",
  ".#ggg#######gg#.",
  "..#gggggggggg#..",
  "...##########...",
];

/** Beine 24 x 15: drei Streifen zu je fünf Zeilen. */
const FEET = [
  "..##g...................",
  "###ggg.............ggg#.",
  "gggg##gggg#...#ggg##ggg#",
  "ggg##.#gg#.....#gg#.#gg#",
  "####..##........###..##.",
  "..##g...................",
  "##gggg.............ggg#.",
  "gggg##ggg#....#ggg##ggg#",
  "ggg#.#gg#......#gg#.#gg#",
  "###...###.......###..###",
  "..##g...................",
  "##gggg.............ggg#.",
  "gggg##ggg#....#ggg##ggg#",
  "ggg#.#gg#......#gg#.#gg#",
  "###..###.......###...###",
];

/** Schwanz 7 x 35: fünf Bilder zu je sieben Zeilen. */
const TAIL = [
  "#####..", "##gg##.", "###gg##", "..##gg#", "...##gg", "....###", "......#", ".......",
  "..##...", "##gg#..", "##gg###", "..#gggg", "...##gg", ".....##", ".......", ".......",
  "......#", "...####", "###gggg", "##ggg##", "..####.", ".......", ".....##", "...##gg",
  "..#gggg", "##gg###", "##gg#..", "..##...", ".......", ".......", "#####..", "gggg###",
  "##gggg#", "..####g", ".....##",
];

const leinwand = ref<HTMLCanvasElement | null>(null);
let zeitgeber: number | undefined;
let tick = 0;

function pixel(ctx: CanvasRenderingContext2D, zeichen: string, x: number, y: number) {
  const farbe = FARBEN[zeichen];
  if (!farbe) return;
  ctx.fillStyle = farbe;
  ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
}

function blit(ctx: CanvasRenderingContext2D, kunst: string[], x: number, y: number) {
  kunst.forEach((zeile, reihe) => {
    [...zeile].forEach((zeichen, spalte) => pixel(ctx, zeichen, x + spalte, y + reihe));
  });
}

/** Fenster auf ein längeres Sprite (Beine, Schwanz). */
function blitFenster(art: string[], x: number, y: number, erster: number, zeilen: number) {
  const ctx = leinwand.value?.getContext("2d");
  if (!ctx) return;
  for (let versatz = 0; versatz < zeilen; versatz += 1) {
    const zeile = art[erster + versatz];
    if (!zeile) break;
    [...zeile].forEach((zeichen, spalte) => pixel(ctx, zeichen, x + spalte, y + versatz));
  }
}

function zeichne(bild: number) {
  const ctx = leinwand.value?.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, W, H);
  ctx.imageSmoothingEnabled = false;

  const rahmen = bild % 6;
  const regenbogen = bild % 12;

  // 28 statt 26: der Kopf zittert in manchen Bildern einen Punkt nach rechts.
  const katzeW = 28;
  const katzeH = 20;
  const katzeX = Math.round(W - katzeW);
  const katzeY = Math.round((H - katzeH) / 2);

  // catCycle: zwei Bilder oben, vier einen Punkt tiefer.
  const katzeVersatz = rahmen < 2 ? 0 : 1;

  // Regenbogen: Kachel 16 x 19, alle zwei Bilder um 9 Punkte versetzt.
  const verschub = Math.floor(regenbogen / 2) % 2 === 0 ? 0 : -9;
  const regenbogenOben = katzeY + 0.5 + katzeVersatz;
  for (let x = verschub; x < katzeX + 8; x += 16) {
    RAINBOW.forEach((zeile, reihe) => {
      [...zeile].forEach((zeichen, spalte) => {
        const px = x + spalte;
        if (px < 0 || px > katzeX + 8) return;
        pixel(ctx, zeichen, px, regenbogenOben + reihe);
      });
    });
  }

  blit(ctx, POPTART, katzeX, katzeY + katzeVersatz);

  // headCycle: Bilder 2 bis 4 einen Punkt nach rechts, Bild 6 einen nach oben.
  const [kopfX, kopfY] =
    rahmen >= 1 && rahmen <= 3 ? [1, 0] : rahmen === 5 ? [0, -1] : [0, 0];
  blit(ctx, HEAD, katzeX + 10 + kopfX, katzeY + 5 + katzeVersatz + kopfY);

  // feetSpriteCycle und feetCycle.
  const fussZeile = rahmen === 0 ? 0 : rahmen <= 4 ? 5 : 10;
  const fussX = rahmen === 1 ? 1 : rahmen === 2 ? 2 : rahmen === 3 ? 1 : rahmen === 4 || rahmen === 5 ? -1 : 0;
  blitFenster(FEET, katzeX - 2 + fussX, katzeY + 15 + katzeVersatz, fussZeile, 5);

  // tailSpriteCycle und tailCycle.
  const schwanzZeile = rahmen === 1 ? 7 : rahmen === 2 ? 14 : rahmen === 3 ? 21 : rahmen === 4 ? 28 : 0;
  const schwanzY = rahmen === 2 ? 1 : rahmen === 3 ? 2 : rahmen === 4 || rahmen === 5 ? -1 : 0;
  blitFenster(TAIL, katzeX - 7, katzeY + 7 + katzeVersatz + schwanzY, schwanzZeile, 7);
}

function starte() {
  stoppe();
  zeitgeber = window.setInterval(() => {
    tick += 1;
    zeichne(tick);
  }, STEP_MS);
}

function stoppe() {
  if (zeitgeber !== undefined) {
    window.clearInterval(zeitgeber);
    zeitgeber = undefined;
  }
  tick = 0;
  zeichne(0);
}

watch(
  () => props.active,
  (laeuft) => (laeuft ? starte() : stoppe()),
);

onMounted(() => (props.active ? starte() : zeichne(0)));
onBeforeUnmount(stoppe);
</script>

<template>
  <canvas
    ref="leinwand"
    class="wp-nyan"
    :class="{ 'is-active': props.active }"
    :width="W * props.scale"
    :height="H * props.scale"
    :style="{ width: `${W * props.scale}px`, height: `${H * props.scale}px` }"
    role="img"
    :aria-label="props.label"
  />
</template>

<style>
/* Kein Rahmen, kein Hintergrund: die Katze sitzt in der Fusszeile. */
.wp-nyan { display: block; image-rendering: pixelated; flex: none; }
/* Wer Bewegung reduziert haben will, bekommt das stehende Bild. */
@media (prefers-reduced-motion: reduce) {
  .wp-nyan { animation: none; }
}
</style>
