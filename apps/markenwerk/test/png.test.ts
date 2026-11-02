import { test } from "node:test";
import assert from "node:assert/strict";
import { kodierePng } from "../src/png.ts";

test("schreibt ein gültiges PNG", () => {
  const size = 4;
  const pixel = new Uint8Array(size * size * 4).fill(255);
  const png = kodierePng(size, pixel);

  // Signatur
  assert.deepEqual([...png.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  // IHDR: Breite, Höhe, Bittiefe, Farbtyp
  assert.equal(png.readUInt32BE(16), size);
  assert.equal(png.readUInt32BE(20), size);
  assert.equal(png[24], 8);
  assert.equal(png[25], 6);
  // Ende
  assert.equal(png.subarray(png.length - 8, png.length - 4).toString("ascii"), "IEND");
});

test("falsche Puffergröße wird abgelehnt", () => {
  assert.throws(() => kodierePng(4, new Uint8Array(10)), /Byte/);
});
