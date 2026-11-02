import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMarke } from "../src/format.ts";
import { GROESSEN, kontaktbogen, svgQuelle, svgSymbol } from "../src/render.ts";

const MARKE = parseMarke(`name = Test
surface = #112233
ink = #FFFFFF
---
.###.
.#.#.
.###.
.....
.....`, "test");

test("SVG hat Fläche und Rechtecke", () => {
  const svg = svgQuelle(MARKE);
  assert.match(svg, /<rect width="512" height="512" fill="#112233"\/>/);
  assert.match(svg, /fill="#FFFFFF"/);
  assert.match(svg, /crispEdges/);
});

test("Symbolstil nutzt currentColor und keine Fläche", () => {
  const svg = svgSymbol(MARKE);
  assert.match(svg, /currentColor/);
  assert.doesNotMatch(svg, /112233/);
});

test("Größen decken die Desktops ab", () => {
  for (const pflicht of [16, 32, 48, 64, 128, 256, 512, 1024]) {
    assert.ok(GROESSEN.includes(pflicht), `${pflicht} fehlt`);
  }
});

test("Kontaktbogen nennt alle Marken", () => {
  const svg = kontaktbogen([MARKE]);
  assert.match(svg, /Test/);
  assert.match(svg, /128/);
});
