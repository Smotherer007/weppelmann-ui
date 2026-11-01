<script setup lang="ts">
// Page: Addon-Katalog (Hexwerk-Form). Zeigt Toolbar + Tabs + Tabelle + Detail + Dialog.
import { computed, ref } from "vue";
import * as UI from "@weppelmann/components";
import type { Column, Tab, TableState } from "@weppelmann/components";
import { IconClose, IconRefresh } from "@weppelmann/icons";

const tab = ref("alle");
const showDetail = ref(true);
const dialog = ref(false);
const sortKey = ref("name");
const sortDir = ref<"asc" | "desc">("asc");

const tabs: Tab[] = [
  { id: "alle", label: "Alle", badge: "3" },
  { id: "update", label: "Update", badge: "1" },
  { id: "defekt", label: "Defekt", badge: "1" },
];

const columns: Column[] = [
  { key: "name", label: "Addon", sortable: true },
  { key: "version", label: "Version", align: "end", sortable: true },
  { key: "source", label: "Quelle" },
  { key: "state", label: "Status" },
];

const all = [
  { name: "Details!", version: "11.2.1", source: "CurseForge", state: "aktuell" },
  { name: "WeakAuras", version: "5.19.4", source: "Wago", state: "Update" },
  { name: "ElvUI", version: "13.79", source: "Tukui", state: "defekt" },
];
const rows = computed(() => {
  if (tab.value === "update") return all.filter((r) => r.state === "Update");
  if (tab.value === "defekt") return all.filter((r) => r.state === "defekt");
  return all;
});
const state = computed<TableState>(() =>
  rows.value.length === 0 ? { kind: "leer", text: "Nichts in diesem Reiter." } : { kind: "fertig", rows: rows.value },
);
</script>

<template>
  <div class="page">
    <UI.WpToolbar title="Hexwerk" subtitle="Addons für World of Warcraft in Proton-Präfixen">
      <template #search><UI.WpInput model-value="" type="search" placeholder="Addon suchen …" /></template>
      <template #actions>
        <UI.WpButton label="Quellen prüfen" />
        <UI.WpButton label="Alles aktualisieren" :icon="IconRefresh" variant="primary" @press="dialog = true" />
      </template>
    </UI.WpToolbar>

    <UI.WpTabs v-model="tab" :tabs="tabs" label="Filter">
      <div class="split">
        <UI.WpTable :columns="columns" :state="state" :sort-key="sortKey" :sort-direction="sortDir"
                    @sort="(k, d) => { sortKey = k; sortDir = d }" />
        <UI.WpCard v-if="showDetail" title="WeakAuras" subtitle="Wago · 5.19.4">
          <div class="detail">
            <UI.WpBadge tone="warn" label="Update verfügbar" />
            <UI.WpText variant="caption" tone="muted">
              12.402 Dateien · zuletzt geändert 30.10.2026 · drei Spielversionen
            </UI.WpText>
            <UI.WpDivider />
            <UI.WpStack direction="row" gap="sm">
              <UI.WpButton label="Aktualisieren" variant="primary" size="sm" />
              <UI.WpButton label="Im Ordner zeigen" size="sm" />
            </UI.WpStack>
          </div>
          <template #actions><UI.WpButton label="Schließen" :icon="IconClose" size="sm" @press="showDetail = false" /></template>
        </UI.WpCard>
      </div>
    </UI.WpTabs>

    <UI.WpDialog v-model:open="dialog" title="Alles aktualisieren?" tone="info"
                 description="Es werden 1.284 Addons aus 12 Quellen geprüft. Das dauert etwa zwei Minuten."
                 confirm-label="Starten" />
  </div>
</template>

<style scoped>
.page { padding: var(--wp-space-4); display: flex; flex-direction: column; gap: var(--wp-space-3); }
.split { display: grid; grid-template-columns: 1.6fr 1fr; gap: var(--wp-space-4); align-items: start; }
.detail { display: flex; flex-direction: column; gap: var(--wp-space-2); }
@media (max-width: 900px) { .split { grid-template-columns: 1fr; } }
</style>
