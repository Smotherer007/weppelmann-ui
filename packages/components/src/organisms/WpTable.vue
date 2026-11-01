<script setup lang="ts">
// Datentabelle. Ersetzt gtk::ColumnView.
//
// Der Zustand ist ein Summentyp: leer, lädt, fertig, Fehler schließen einander aus.
// Die Tabelle entscheidet nichts — sie stellt dar, was das Modell sagt.
import type { Column, SortDirection, TableState } from "../types";
import { IconArrowDown, IconArrowUp, IconArrowUpDown } from "@weppelmann/icons";
import WpIcon from "../atoms/WpIcon.vue";

withDefaults(
  defineProps<{
    columns: Column[];
    state: TableState;
    sortKey?: string;
    sortDirection?: SortDirection;
    caption?: string;
  }>(),
  { sortDirection: "asc" },
);
const emit = defineEmits<{ sort: [key: string, direction: SortDirection] }>();

function toggleSort(key: string, sortable?: boolean, currentKey?: string, currentDir?: SortDirection) {
  if (!sortable) return;
  const direction: SortDirection = currentKey === key && currentDir === "asc" ? "desc" : "asc";
  emit("sort", key, direction);
}
</script>

<template>
  <div class="wp-table">
    <table role="table">
      <caption v-if="caption" class="wp-table__caption">{{ caption }}</caption>
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            scope="col"
            :style="{ textAlign: col.align ?? 'start', width: col.width }"
            :aria-sort="sortKey === col.key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : col.sortable ? 'none' : undefined"
          >
            <button
              v-if="col.sortable"
              type="button"
              class="wp-table__sort"
              :class="{ 'is-active': sortKey === col.key }"
              @click="toggleSort(col.key, col.sortable, sortKey, sortDirection)"
            >
              {{ col.label }}
              <WpIcon v-if="sortKey === col.key" :icon="sortDirection === 'asc' ? IconArrowUp : IconArrowDown"
                      size="xs" class="wp-table__arrow" />
              <WpIcon v-else :icon="IconArrowUpDown" size="xs" class="wp-table__arrow is-idle" />
            </button>
            <span v-else>{{ col.label }}</span>
          </th>
        </tr>
      </thead>
      <tbody v-if="state.kind === 'fertig' && state.rows.length > 0">
        <tr v-for="(row, i) in state.rows" :key="i">
          <td v-for="col in columns" :key="col.key" :style="{ textAlign: col.align ?? 'start' }">
            {{ row[col.key] }}
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td :colspan="columns.length" class="wp-table__state">
            <span v-if="state.kind === 'laedt'" class="wp-table__loading">Lädt …</span>
            <span v-else-if="state.kind === 'fehler'" class="wp-table__error">{{ state.message }}</span>
            <span v-else>{{ state.kind === 'leer' ? (state.text ?? 'Keine Einträge') : '' }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style>
.wp-table { overflow-x: auto; border: var(--wp-size-border) solid var(--wp-color-border-subtle); }
.wp-table table { width: 100%; border-collapse: collapse; font-size: var(--wp-font-size-md); }
.wp-table__caption { text-align: start; padding: var(--wp-space-2); color: var(--wp-color-text-muted); font-size: var(--wp-font-size-sm); }
.wp-table th {
  background: var(--wp-color-bg-raised); color: var(--wp-color-text-muted);
  font-size: var(--wp-font-size-sm); font-weight: var(--wp-font-weight-medium);
  padding: 6px var(--wp-space-2); border-bottom: var(--wp-size-border) solid var(--wp-color-border-subtle);
  white-space: nowrap;
}
.wp-table td { padding: 6px var(--wp-space-2); border-bottom: var(--wp-size-border) solid var(--wp-color-border-subtle); }
.wp-table tbody tr:hover { background: var(--wp-color-bg-hover); }
.wp-table tbody tr:last-child td { border-bottom: 0; }
.wp-table__sort {
  background: none; border: 0; padding: 0; font: inherit; color: inherit; cursor: pointer;
  display: inline-flex; align-items: center; gap: 4px;
}
.wp-table__sort.is-active { color: var(--wp-color-text-default); }
.wp-table__arrow { color: var(--wp-color-accent-default); }
.wp-table__arrow.is-idle { color: var(--wp-color-text-faint); opacity: 0.6; }
.wp-table__state { padding: var(--wp-space-5) var(--wp-space-2); text-align: center; color: var(--wp-color-text-faint); }
.wp-table__error { color: var(--wp-color-status-error); }
</style>
