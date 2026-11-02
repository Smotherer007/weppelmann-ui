// Gemeinsame Typen der Bibliothek. Sie liegen hier und nicht in den SFCs,
// weil `<script setup>` keine Exporte erlaubt.

/** Eintrag einer Auswahlliste (Select, Multiselect, Combobox, Radio). */
export interface ListOption {
  value: string;
  label: string;
  hint?: string;
  disabled?: boolean;
}

/** Reiter in WpTabs. */
export interface Tab {
  id: string;
  label: string;
  badge?: string;
  disabled?: boolean;
}

/** Eintrag in WpMenu. */
export interface MenuItem {
  id: string;
  label: string;
  hint?: string;
  disabled?: boolean;
  danger?: boolean;
  separatorBefore?: boolean;
}

/** Spalte einer Tabelle. */
export interface Column {
  key: string;
  label: string;
  align?: "start" | "end";
  width?: string;
  sortable?: boolean;
}

/** Zustand einer Tabelle als Summentyp. */
export type TableState =
  | { kind: "leer"; text?: string }
  | { kind: "laedt" }
  | { kind: "fertig"; rows: Record<string, string | number>[] }
  | { kind: "fehler"; message: string };

export type SortDirection = "asc" | "desc";

/** Eine Auswahl in einem Umschalter, Radio oder Menü. */
export interface Option {
  value: string;
  label: string;
  hint?: string;
  disabled?: boolean;
}
