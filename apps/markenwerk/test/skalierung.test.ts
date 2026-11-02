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

function farben(pixel: Uint8Array): Set<string> {
  const s = new Set<string>();
  for (let i = 0; i < pixel.length; i += 4) {
    s.add(`${pixel[i]},${pixel[i + 1]},${pixel[i + 2]},${pixel[i + 3]}`);
  }
  return s;
}

test("Verkleinern mischt keine Farben", () => {
  // 8 nach 4: gemittelt entstünden Zwischentöne, per Mehrheit nur zwei Farben.
  for (const ziel of [4, 5, 6]) {
    const bild = skaliere(MARKE, ziel, true);
    const menge = farben(bild);
    assert.equal(menge.size, 2, `${ziel}px hat ${menge.size} Farben: ${[...menge].join(" ")}`);
    assert.ok(menge.has(rgba("#4F7A2E").join(",")), "Fläche fehlt");
    assert.ok(menge.has(rgba("#E9E5DC").join(",")), "Tinte fehlt");
  }
});

test("Vergroessern bleibt bei den Markenfarben", () => {
  const bild = skaliere(MARKE, 32, true);
  assert.equal(farben(bild).size, 2);
});

test("Tray hat keine Fläche", () => {
  const bild = skaliere(MARKE, 8, false);
  const menge = [...farben(bild)];
  // Nur Tinte (deckend) und Durchsichtiges
  assert.ok(menge.every((f) => f === "233,229,220,255" || f.endsWith(",0")), menge.join(" "));
});
