// Helfer für Listen-Navigation. Kein Rahmenwerk, nur das, was drei Komponenten
// wirklich brauchen (SIMPLE: nicht mehr abstrahieren als nötig).
import type { ListOption } from "../types";

/** Nächster auswählbarer Eintrag; -1, wenn keiner existiert. */
export function nextEnabled(options: ListOption[], from: number, step: 1 | -1): number {
  const n = options.length;
  if (n === 0) return -1;
  let i = from;
  for (let guard = 0; guard < n; guard++) {
    i = (i + step + n) % n;
    if (!options[i].disabled) return i;
  }
  return from;
}

export function firstEnabled(options: ListOption[]): number {
  return options.findIndex((o) => !o.disabled);
}

export function lastEnabled(options: ListOption[]): number {
  for (let i = options.length - 1; i >= 0; i--) if (!options[i].disabled) return i;
  return -1;
}

/** Erster Eintrag, der mit dem getippten Zeichen beginnt (Typeahead). */
export function typeahead(options: ListOption[], char: string, from: number): number {
  const lower = char.toLowerCase();
  for (let step = 1; step <= options.length; step++) {
    const i = (from + step) % options.length;
    if (!options[i].disabled && options[i].label.toLowerCase().startsWith(lower)) return i;
  }
  return -1;
}
