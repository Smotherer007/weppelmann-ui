import { test } from "node:test";
import assert from "node:assert/strict";
import { HOEHE, SCHRIFT, SchriftFehler, wortmarke } from "../src/schrift.ts";

test("jede Glyphe ist rechteckig und nicht hoeher als das Raster", () => {
  for (const [zeichen, glyphe] of Object.entries(SCHRIFT)) {
    assert.ok(glyphe.length <= HOEHE, `${zeichen}: ${glyphe.length} Zeilen`);
    const breite = glyphe[0].length;
    for (const zeile of glyphe) {
      assert.equal(zeile.length, breite, `${zeichen}: Zeilen unterschiedlich breit`);
      assert.match(zeile, /^[#.]+$/, `${zeichen}: unbekanntes Zeichen in "${zeile}"`);
    }
    assert.ok(glyphe.some((z) => z.includes("#")), `${zeichen}: leere Glyphe`);
  }
});

test("setzt die Wortmarke in Laeufe", () => {
  const { flecken, breite } = wortmarke("SPRECHWERK");
  assert.ok(flecken.length > 40, `nur ${flecken.length} Rechtecke`);
  // 9 Buchstaben zu 6 Spalten, W mit 10, dazu 9 Fugen: 73
  assert.equal(breite, 73);
  // Alle Flecken liegen im Raster.
  for (const f of flecken) {
    assert.ok(f.y >= 0 && f.y < HOEHE);
    assert.ok(f.x >= 0 && f.x + f.breite <= breite);
  }
});

test("Kleinbuchstaben werden gross gesetzt", () => {
  assert.deepEqual(wortmarke("sprechwerk"), wortmarke("SPRECHWERK"));
});

test("unbekannter Buchstabe ist ein Fehler", () => {
  assert.throws(() => wortmarke("WORT"), SchriftFehler);
});

test("Leerzeichen schiebt weiter, ohne Flecken", () => {
  const { flecken, breite } = wortmarke("S S");
  // S (6) + Fuge (1) + Leerzeichen (2) + S (6)
  assert.equal(breite, 15);
  assert.ok(flecken.every((f) => f.x < 6 || f.x >= 8));
});
