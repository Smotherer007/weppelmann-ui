#!/usr/bin/env node
// Compiler für Design-Tokens (W3C DTCG 2025.10) -> CSS-Variablen und JSON.
//
// Eingabe: src/primitives.tokens.json (Rohwerte) und src/theme-<modus>.tokens.json
// (semantische Ebene, $value ist ein Alias auf ein Primitiv).
// Ausgabe: dist/css/vars.css und dist/json/tokens.json.
//
// Grundsätze: keine Fremdabhängigkeit, Fehler brechen ab (kein stiller Fallback),
// Primitiven sind nicht Teil der öffentlichen API — nur semantische Tokens werden
// als CSS-Variablen ausgegeben.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(here, "../src");
const distDir = resolve(here, "../dist");
const THEMES = ["dark", "light", "mono"];

const read = (name) => JSON.parse(readFileSync(join(srcDir, name), "utf8"));

// Flacht verschachtelte DTCG-Gruppen zu { "color.text.default": {type, value} } ab.
function flatten(node, prefix = [], inheritedType = undefined, out = {}) {
  const type = node.$type ?? inheritedType;
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    const path = [...prefix, key];
    if (child && typeof child === "object" && "$value" in child) {
      out[path.join(".")] = { type: child.$type ?? type, value: child.$value };
    } else if (child && typeof child === "object") {
      flatten(child, path, type, out);
    }
  }
  return out;
}

// Löst "{pfad.zum.token}" gegen die Primitive auf; unbekannte Ziele sind ein Fehler.
function resolve_({ value }, primitives, trail = []) {
  if (typeof value !== "string") return value;
  const match = value.match(/^\{(.+)\}$/);
  if (!match) return value;
  const target = match[1];
  if (trail.includes(target)) {
    throw new Error(`Alias-Zyklus: ${[...trail, target].join(" -> ")}`);
  }
  const found = primitives[target];
  if (!found) {
    throw new Error(`Alias zeigt ins Leere: {${target}} (Fundstelle: ${trail[0] ?? "?"})`);
  }
  return resolve_(found, primitives, [...trail, target]);
}

const kebab = (path) =>
  path
    .split(".")
    .map((part) => part.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase())
    .join("-");

const primitives = flatten(read("primitives.tokens.json"));
const themes = {};
for (const theme of THEMES) {
  const tokens = flatten(read(`theme-${theme}.tokens.json`));
  if (Object.keys(tokens).length === 0) throw new Error(`Theme ${theme} enthält keine Tokens`);
  themes[theme] = Object.fromEntries(
    Object.entries(tokens).map(([path, token]) => [path, resolve_(token, primitives)]),
  );
}

// Maße und Schrift sind modusunabhängig und gelten für alle Themes.
// Ohne diesen Block laufen var(--wp-space-2) und var(--wp-size-control-md) ins Leere
// (CSS-Variablen ohne Deklaration sind ungültig, nicht "null") — der Fehler ist
// unsichtbar, bis man die Abstände vermisst.
const BASE_GROUPS = ["space", "font", "size", "duration"];
const base = Object.fromEntries(
  Object.entries(primitives)
    .filter(([path]) => BASE_GROUPS.includes(path.split(".")[0]))
    .map(([path, token]) => [path, resolve_(token, primitives)]),
);

// Jede semantische Gruppe muss in allen drei Themes vollständig sein.
const reference = Object.keys(themes[THEMES[0]]).sort();
for (const theme of THEMES.slice(1)) {
  const keys = Object.keys(themes[theme]).sort();
  const missing = reference.filter((k) => !keys.includes(k));
  const extra = keys.filter((k) => !reference.includes(k));
  if (missing.length || extra.length) {
    throw new Error(
      `Theme ${theme} weicht von ${THEMES[0]} ab\n  fehlt: ${missing.join(", ") || "–"}\n  zu viel: ${extra.join(", ") || "–"}`,
    );
  }
}

// CSS: die Maße einmal global, die Farben je Modus.
const baseBlock = `:root {\n${Object.entries(base)
  .map(([path, value]) => `  --wp-${kebab(path)}: ${value};`)
  .join("\n")}\n}`;

const cssBlocks = THEMES.map((theme) => {
  const body = Object.entries(themes[theme])
    .map(([path, value]) => `  --wp-${kebab(path)}: ${value};`)
    .join("\n");
  const selector =
    theme === "dark" ? ':root, [data-theme="dark"]' : `[data-theme="${theme}"]`;
  return `${selector} {\n${body}\n}`;
});

const header = `/* Erzeugt von packages/tokens/scripts/build.mjs — nicht von Hand ändern. */\n`;
const css = header + baseBlock + "\n\n" + cssBlocks.join("\n\n") + "\n";

// JSON: für Styleguide, Werkzeuge und Vergleiche.
const json = JSON.stringify({ version: 1, themes }, null, 2) + "\n";

if (process.argv.includes("--check")) {
  // Prüfmodus für die CI: nur rechnen, nichts schreiben.
  console.log(`Tokens gültig: ${Object.keys(primitives).length} Primitiven, `
    + `${reference.length} semantische Tokens je Theme, Themes: ${THEMES.join("/")}`);
  process.exit(0);
}

mkdirSync(join(distDir, "css"), { recursive: true });
mkdirSync(join(distDir, "json"), { recursive: true });
writeFileSync(join(distDir, "css", "vars.css"), css);
writeFileSync(join(distDir, "json", "tokens.json"), json);

console.log(`dist/css/vars.css        ${css.length} Bytes`);
console.log(`dist/json/tokens.json    ${json.length} Bytes`);
console.log(`${reference.length} semantische Tokens × ${THEMES.length} Themes, `
  + `${Object.keys(primitives).length} Primitiven`);
