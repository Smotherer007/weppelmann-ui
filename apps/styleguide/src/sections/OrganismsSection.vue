<script setup lang="ts">
// Organismen: abgeschlossene Flächen mit eigenem Zustand.
import { ref } from "vue";
import * as UI from "@weppelmann/components";
import type { Column, TableState } from "@weppelmann/components";
import { IconChevronDown } from "@weppelmann/icons";

const columns: Column[] = [
  { key: "name", label: "Addon", sortable: true },
  { key: "version", label: "Version", align: "end", sortable: true },
  { key: "state", label: "Status" },
];

const fertig: TableState = { kind: "fertig", rows: [
  { name: "Details!", version: "11.2.1", state: "aktuell" },
  { name: "WeakAuras", version: "5.19.4", state: "Update verfügbar" },
  { name: "BigWigs", version: "3.15", state: "aktuell" },
] };
const leer: TableState = { kind: "leer", text: "Diese Quelle hat noch keine Addons geliefert." };
const laedt: TableState = { kind: "laedt" };
const fehler: TableState = { kind: "fehler", message: "Die Quelle antwortete mit 429 (zu viele Abfragen)." };
const sortKey = ref("name");
const sortDir = ref<"asc" | "desc">("asc");

const dialogOpen = ref(false);
const chosen = ref<string | null>(null);
const menuItems = [
  { id: "rescan", label: "Neu einlesen", hint: "F5" },
  { id: "folder", label: "Ordner öffnen" },
  { id: "remove", label: "Entfernen", danger: true, separatorBefore: true },
];
</script>

<template>
  <section id="organismen" class="block">
    <header class="block__head">
      <div>
        <p class="block__level">Ebene 3 · Organisms</p>
        <h2>Organismen</h2>
        <p class="block__note">
          Flächen, die man als Ganzes versteht: Tabelle, Karte, Dialog, Menü, Kopfzeile.
          Sie kennen Zustände, aber keine Domäne.
        </p>
      </div>
    </header>

    <div class="stack">
      <div class="cell">
        <p class="cell__label">WpTable — Zustand als Summentyp</p>
        <div class="split">
          <UI.WpTable :columns="columns" :state="fertig" :sort-key="sortKey" :sort-direction="sortDir"
                      @sort="(k, d) => { sortKey = k; sortDir = d }" caption="Beispiel: Addon-Liste" />
          <div class="states">
            <UI.WpTable :columns="columns" :state="laedt" />
            <UI.WpTable :columns="columns" :state="leer" />
            <UI.WpTable :columns="columns" :state="fehler" />
          </div>
        </div>
        <p class="cell__hint">
          Vier Zustände, ein Prop. „geladen und Fehler“ ist nicht darstellbar —
          deshalb kein Boolean-Fächer.
        </p>
      </div>

      <div class="two">
        <UI.WpCard title="Karte mit Kopf" subtitle="Organismus für abgeschlossene Bereiche">
          <p class="cell__hint">Inhalt. Kopf enthält Handlungen, Fuß trägt Zusammenfassung.</p>
          <template #actions><UI.WpButton label="Bearbeiten" size="sm" /></template>
          <template #footer><UI.WpText variant="caption" tone="faint">zuletzt geändert: heute</UI.WpText></template>
        </UI.WpCard>

        <div class="cell">
          <p class="cell__label">WpMenu · WpDialog</p>
          <div class="row">
            <UI.WpMenu :items="menuItems" label="Aktionen" @select="(id) => (chosen = id)">
              <UI.WpButton label="Aktionen" :icon="IconChevronDown" size="sm" />
            </UI.WpMenu>
            <UI.WpButton label="Dialog öffnen" variant="primary" size="sm" @press="dialogOpen = true" />
          </div>
          <p class="cell__hint">Gewählt: {{ chosen ?? "–" }}</p>
        </div>
      </div>

      <div class="cell">
        <p class="cell__label">WpToolbar</p>
        <UI.WpToolbar title="Addon-Katalog" subtitle="12 Quellen · 4.812 Addons">
          <template #search><UI.WpInput model-value="" placeholder="Suchen …" /></template>
          <template #actions>
            <UI.WpButton label="Aktualisieren" />
            <UI.WpButton label="Installieren" variant="primary" />
          </template>
        </UI.WpToolbar>
      </div>
    </div>

    <UI.WpDialog v-model:open="dialogOpen" title="Addon entfernen?"
                 description="Die Dateien werden in den Papierkorb gelegt, nicht gelöscht."
                 tone="warn" confirm-label="In Papierkorb" @confirm="chosen = 'entfernt'">
      <UI.WpText variant="caption" tone="muted">Details! · 11.2.1 · 42 Dateien</UI.WpText>
    </UI.WpDialog>
  </section>
</template>

<style scoped>
.stack { display: flex; flex-direction: column; gap: var(--wp-space-4); }
.cell { display: flex; flex-direction: column; gap: var(--wp-space-2); padding: var(--wp-space-3); border: var(--wp-size-border) solid var(--wp-color-border-subtle); background: var(--wp-color-bg-panel); }
.cell__label { margin: 0; font-family: var(--wp-font-family-mono); font-size: var(--wp-font-size-xs); color: var(--wp-color-text-faint); }
.cell__hint { margin: 0; font-size: var(--wp-font-size-xs); color: var(--wp-color-text-faint); }
.split { display: grid; grid-template-columns: 1.4fr 1fr; gap: var(--wp-space-3); }
.states { display: flex; flex-direction: column; gap: var(--wp-space-2); }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: var(--wp-space-4); }
.row { display: flex; gap: var(--wp-space-2); align-items: center; }
@media (max-width: 900px) { .split, .two { grid-template-columns: 1fr; } }
</style>
