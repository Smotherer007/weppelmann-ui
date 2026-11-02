import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMarke } from "../src/format.ts";
import { GROESSEN, inKachel, kontaktbogen, svgQuelle, svgSymbol } from "../src/render.ts";

const MARKE = parseMarke(`name = Test
surface = #112233
ink = #FFFFFF
---
.###.
.#.#.
.###.
.....
.....`, "test");

test("SVG hat Flaeche als Achteck und die Zeichnung", () => {
  const svg = svgQuelle(MARKE);
  // Die Kachel ist ein Pfad (Achteck), kein Vollrechteck.
  assert.match(svg, /<path d="M [\d.]+ 0 H /);
  assert.match(svg, /fill="#112233"/);
  assert.match(svg, /fill="#FFFFFF"/);
  assert.match(svg, /crispEdges/);
});

test("Ecken sind abgeschnitten", () => {
  // 32er Raster, Ecke = 22 % = 7: (0,0) liegt ausserhalb, (16,0) innerhalb.
  assert.equal(inKachel(0, 0, 32), false);
  assert.equal(inKachel(0, 31, 32), false);
  assert.equal(inKachel(31, 0, 32), false);
  assert.equal(inKachel(31, 31, 32), false);
  assert.equal(inKachel(16, 0, 32), true);
  assert.equal(inKachel(0, 16, 32), true);
  assert.equal(inKachel(16, 16, 32), true);
  // "voll" schaltet die Form ab.
  assert.equal(inKachel(0, 0, 32, "voll"), true);
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
