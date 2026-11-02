<script setup lang="ts">
// Organismen: abgeschlossene Flächen mit eigenem Zustand.
import { ref } from "vue";
import * as UI from "@weppelmann/components";
import type { Column, TableState } from "@weppelmann/components";
import { IconChevronDown, IconFolder, IconPlug, IconSearch, IconSettings, IconWifi } from "@weppelmann/icons";

const navAktiv = ref("clients");
const navEintraege = [
  { id: "clients", label: "Clients", icon: IconPlug, count: "1" },
  { id: "installiert", label: "Installiert", icon: IconFolder, count: "2" },
  { id: "katalog", label: "Katalog", icon: IconSearch, count: "27695" },
  { id: "einstellungen", label: "Einstellungen", icon: IconSettings },
];

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

// Die fünf Organismen aus WLED Ambilight. Sie stehen hier, weil sie in einer
// laufenden App benutzt werden — nicht, weil sie sich gut anhören.
const railTabs = [
  { id: "zonen", label: "Zonen" },
  { id: "bild", label: "Bild" },
  { id: "app", label: "App" },
];
const railTab = ref("zonen");
const demogeraete = ["192.168.178.151", "openrgb · Tastatur"];
const demofarben: [number, number, number][] = Array.from({ length: 48 }, (_, i) => {
  const h = (i / 48) * 360;
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return Math.round(255 * (1 - Math.max(0, Math.min(k, 4 - k, 1))) * 0.9 + 20);
  };
  return [f(5), f(3), f(1)] as [number, number, number];
});
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
        <p class="cell__label">WpAppBar · WpSidePanel · WpInspector · WpTelemetryBar · WpColorStrip</p>
        <p class="cell__hint">
          Fünf Organismen, die aus der laufenden Ambilight-App herausgeschnitten und von
          Domäne befreit wurden: Titel, Zähler, Zustand und Handlungen kommen herein,
          Geräte und Zahlen bleiben in der App.
        </p>
        <div class="demo">
          <UI.WpAppBar title="WLED Ambilight" :icon="IconWifi">
            <template #status><UI.WpBadge tone="ok" label="Live · 45 fps" /></template>
            <template #actions>
              <UI.WpButton label="Neustart" size="sm" />
              <UI.WpButton label="Pausieren" size="sm" variant="primary" />
            </template>
          </UI.WpAppBar>
          <div class="demo__body">
            <UI.WpSidePanel title="Geräte" :count="demogeraete.length">
              <div v-for="(g, i) in demogeraete" :key="g" class="demo__device">
                <span class="demo__name">{{ g }}</span>
                <UI.WpBadge :tone="i === 0 ? 'ok' : 'neutral'" :label="i === 0 ? 'verbunden' : 'bereit'" />
              </div>
              <template #footer><UI.WpButton label="Per Adresse hinzufügen" size="sm" /></template>
            </UI.WpSidePanel>
            <div class="demo__stage">
              <p class="cell__hint">Hier liegt die Vorschau (Fläche, die die App füllt).</p>
            </div>
            <UI.WpInspector :tabs="railTabs" :model-value="railTab" width="230px"
                            @update:model-value="railTab = $event">
              <UI.WpText variant="caption" tone="muted">Reiter „{{ railTab }}“ — Inhalt kommt aus der App.</UI.WpText>
            </UI.WpInspector>
          </div>
          <UI.WpTelemetryBar title="Ausgabe" stats="in 44 fps · out 50 fps">
            <div class="demo__row">
              <span class="demo__name">WLED</span>
              <UI.WpColorStrip :colors="demofarben" label="48 Werte" />
            </div>
          </UI.WpTelemetryBar>
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
<div class="cell">
        <p class="cell__label">WpNavList — Seitenleiste (Rail)</p>
        <div class="navprobe">
          <UI.WpNavList :entries="navEintraege" :model-value="navAktiv" title="ANSICHT"
                        @update:model-value="navAktiv = $event" />
        </div>
        <div class="navprobe navprobe--schmal">
          <UI.WpNavList :entries="navEintraege" :model-value="navAktiv" compact
                        @update:model-value="navAktiv = $event" />
        </div>
        <p class="cell__hint">
          Zeichen, Name, Zahl; aktiv an der Kante markiert. Kompakt bleiben nur die Zeichen.
        </p>
      </div>

      <div class="cell">
        <p class="cell__label">WpStatusBar — Fusszeile des Fensters</p>
        <UI.WpStatusBar brand="HEXWERK" state="bereit · fertig" counts="KATALOG 27695 · ADDONS 2 · CLIENTS 1" />
        <UI.WpStatusBar brand="WLED">
          <template #lead><UI.WpSpinner size="sm" /><span>Katalog</span></template>
        </UI.WpStatusBar>
        <p class="cell__hint">Eine Zeile, feste Höhe; alles andere wird abgeschnitten.</p>
      </div>
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
.demo { display: flex; flex-direction: column; border: var(--wp-size-border) solid var(--wp-color-border-strong); background: var(--wp-color-bg-canvas); }
.demo__body { display: flex; align-items: stretch; min-height: 200px; }
.demo__stage { flex: 1; display: flex; align-items: center; justify-content: center; padding: var(--wp-space-3); }
.demo__device { display: flex; align-items: center; justify-content: space-between; gap: var(--wp-space-2); padding: var(--wp-space-2); border: var(--wp-size-border) solid var(--wp-color-border-subtle); background: var(--wp-color-bg-raised); }
.demo__name { font-family: var(--wp-font-family-mono); font-size: var(--wp-font-size-xs); color: var(--wp-color-text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.demo__row { display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: var(--wp-space-2); }
@media (max-width: 900px) { .split, .two { grid-template-columns: 1fr; } }
.navprobe { padding: var(--wp-space-2); background: var(--wp-color-bg-panel);
  border: var(--wp-size-border) solid var(--wp-color-border-subtle); max-width: 232px; }
.navprobe--schmal { max-width: 58px; }
</style>