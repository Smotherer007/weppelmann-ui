import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMarke } from "../src/format.ts";
import { logoQuelle, wortFarbe } from "../src/logo.ts";

const MARKE = parseMarke(`name = Scheck
surface = #112233
ink = #FFFFFF
shade = #FF8800
---
.###.
.#.#.
.###.
.....
.....`, "test");

test("Logo ist ein Bild, kein Text", () => {
  const svg = logoQuelle(MARKE, "dark");
  // Keine Systemschrift: die Buchstaben sind Rechtecke.
  assert.doesNotMatch(svg, /<text/);
  assert.match(svg, /shape-rendering="crispEdges"/);
});

test("Logo zeigt Kachel, Zeichnung und Schatten", () => {
  const svg = logoQuelle(MARKE, "dark");
  assert.match(svg, /<path d="M [\d.]+ 0 H /);
  assert.match(svg, /fill="#112233"/);
  assert.match(svg, /fill="#FFFFFF"/);
});

test("Wortmarke traegt den Namen", () => {
  const svg = logoQuelle(MARKE, "dark");
  assert.match(svg, /<title>Scheck<\/title>/);
  // Buchstaben in der Wortfarbe, mehr als die paar Rechtecke des Zeichens.
  const buchstaben = svg.match(new RegExp(`fill="${wortFarbe(MARKE, "dark")}"`, "g")) ?? [];
  assert.ok(buchstaben.length > 20, `nur ${buchstaben.length} Buchstaben-Rechtecke`);
});

test("hell und dunkel unterscheiden sich nur in der Wortfarbe", () => {
  const dunkel = logoQuelle(MARKE, "light");
  const hell = logoQuelle(MARKE, "dark");
  assert.equal(wortFarbe(MARKE, "dark"), "#E9E5DC");
  assert.equal(wortFarbe(MARKE, "light"), "#112233");
  assert.match(dunkel, /fill="#112233"/);
  assert.match(hell, /fill="#E9E5DC"/);
});

test("unbekannter Buchstabe im Namen ist ein Fehler", () => {
  const marke = { ...MARKE, name: "Xyz" };
  assert.throws(() => logoQuelle(marke, "dark"), /kein Buchstabe/);
});
