import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMarke, rgba } from "../src/format.ts";
import { skaliere } from "../src/render.ts";

const MARKE = parseMarke(`name = Test
surface = #4F7A2E
ink = #E9E5DC
---
..##..##
..##..##
........
##..##..
##..##..
........
........
........`, "test");

/** Nur deckende Farben — die abgeschnittenen Ecken sind durchsichtig und zählen nicht. */
function deckendeFarben(pixel: Uint8Array): Set<string> {
  const s = new Set<string>();
  for (let i = 0; i < pixel.length; i += 4) {
    if (pixel[i + 3] === 0) continue;
    s.add(`${pixel[i]},${pixel[i + 1]},${pixel[i + 2]}`);
  }
  return s;
}

test("Verkleinern mischt keine Farben", () => {
  for (const ziel of [4, 5, 6]) {
    const menge = deckendeFarben(skaliere(MARKE, ziel, true));
    assert.equal(menge.size, 2, `${ziel}px hat ${menge.size} Farben: ${[...menge].join(" ")}`);
    assert.ok(menge.has(rgba("#4F7A2E").slice(0, 3).join(",")), "Fläche fehlt");
    assert.ok(menge.has(rgba("#E9E5DC").slice(0, 3).join(",")), "Tinte fehlt");
  }
});

test("Vergroessern bleibt bei den Markenfarben", () => {
  assert.equal(deckendeFarben(skaliere(MARKE, 32, true)).size, 2);
});

test("Tray hat keine Flaeche", () => {
  const pixel = skaliere(MARKE, 8, false);
  for (let i = 0; i < pixel.length; i += 4) {
    if (pixel[i + 3] === 0) continue;
    assert.deepEqual([pixel[i], pixel[i + 1], pixel[i + 2], pixel[i + 3]], [233, 229, 220, 255]);
  }
});

test("Ecken der Kachel sind durchsichtig", () => {
  const ziel = 32;
  const pixel = skaliere(MARKE, ziel, true);
  const alpha = (x: number, y: number) => pixel[(y * ziel + x) * 4 + 3];
  assert.equal(alpha(0, 0), 0, "Ecke oben links muss durchsichtig sein");
  assert.equal(alpha(ziel - 1, ziel - 1), 0);
  assert.equal(alpha(16, 16), 255, "Mitte muss deckend sein");
});
