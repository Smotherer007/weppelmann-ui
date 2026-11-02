import { test } from "node:test";
import assert from "node:assert/strict";
import { FormatFehler, farbeFuer, parseMarke, rasterisiere, rasterisiereZeichnung } from "../src/format.ts";

const GUELTIG = `name = Test
surface = #112233
ink = #FFFFFF
---
..##.
.#.#.
..##.
.....
.....`;

test("liest Kopf und Raster", () => {
  const marke = parseMarke(GUELTIG, "test");
  assert.equal(marke.name, "Test");
  assert.equal(marke.surface, "#112233");
  assert.equal(marke.ink, "#FFFFFF");
  assert.equal(marke.pixels.length, 5);
  assert.equal(marke.pixels[0], "..##.");
});

test("Trennlinie fehlt", () => {
  assert.throws(() => parseMarke("name = X\nsurface = #000000\nink = #FFFFFF\n..", "x"), FormatFehler);
});

test("nicht quadratisch", () => {
  const text = "name = X\nsurface = #000000\nink = #FFFFFF\n---\n..#\n.#";
  assert.throws(() => parseMarke(text, "x"), /quadratisch/);
});

test("unbekanntes Zeichen", () => {
  const text = "name = X\nsurface = #000000\nink = #FFFFFF\n---\n..X\n...\n...";
  assert.throws(() => parseMarke(text, "x"), /unbekanntes Zeichen/);
});

test("Farbe fehlt", () => {
  const text = "name = X\nsurface = #000000\n---\n.\n";
  assert.throws(() => parseMarke(text, "x"), /ink/);
});

test("Fläche und Zeichnung getrennt", () => {
  const marke = parseMarke(GUELTIG, "test");
  assert.equal(farbeFuer(marke, "#"), "#FFFFFF");
  assert.equal(farbeFuer(marke, "."), null);
  const voll = rasterisiere(marke);
  assert.equal(voll.size, 5);
  // Fläche an (0,0): 0x11, 0x22, 0x33, deckend
  assert.deepEqual([...voll.rgba.slice(0, 4)], [0x11, 0x22, 0x33, 255]);
  const zeichnung = rasterisiereZeichnung(marke);
  // Fläche ist im Tray durchsichtig
  assert.equal(zeichnung.rgba[3], 0);
});
