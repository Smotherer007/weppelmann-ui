<script setup lang="ts">
// Moleküle: Atome im Verbund, eine bedienbare Einheit. Kein Domänenwissen.
import { ref } from "vue";
import * as UI from "@weppelmann/components";
import { IconSearch } from "@weppelmann/icons";

const device = ref<string | null>("wled");
const picks = ref<string[]>(["wled", "govee"]);
const search = ref<string | null>(null);
const mode = ref("smooth");
const tab = ref("geraete");
const sprache = ref("de");
const schema = ref("dark");
const ansicht = ref("karten");
const sprachen = [
  { value: "de", label: "Deutsch" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
];
const schemas = [
  { value: "dark", label: "Dunkel" },
  { value: "light", label: "Hell" },
  { value: "mono", label: "Mono" },
];
const ansichten = [
  { value: "karten", label: "Karten" },
  { value: "liste", label: "Liste" },
  { value: "tabelle", label: "Tabelle" },
];
// Ein echtes Bild statt Platzhalter: das graue Kästchen ist die Flaeche, die
// jeder Zustand gleich gross haelt.
const bild =
  "data:image/svg+xml;utf8," +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180">' +
    '<rect width="320" height="180" fill="#1F2831"/>' +
    '<rect x="24" y="96" width="272" height="8" fill="#2E3A46"/>' +
    '<rect x="24" y="112" width="180" height="8" fill="#2E3A46"/>' +
    '<circle cx="64" cy="56" r="22" fill="#4F7A2E"/>' +
    '<path d="M42 56 H86" stroke="#E9E5DC" stroke-width="4"/>' +
    '<rect x="104" y="40" width="160" height="10" fill="#E9E5DC"/>' +
    '<rect x="104" y="58" width="110" height="8" fill="#98A3AF"/></svg>');
const name = ref("Wohnzimmer");
const options = [
  { value: "wled", label: "WLED", hint: "DDP, 60 Hz" },
  { value: "govee", label: "Govee", hint: "LAN" },
  { value: "nanoleaf", label: "Nanoleaf", hint: "HTTP" },
  { value: "openrgb", label: "OpenRGB", hint: "SDK" },
  { value: "razer", label: "Razer Chroma" },
  { value: "alt", label: "Alte Brücke", disabled: true },
];
const tabs = [
  { id: "geraete", label: "Geräte", badge: "3" },
  { id: "zonen", label: "Zonen", badge: "4" },
  { id: "erweitert", label: "Erweitert", disabled: true },
];
</script>

<template>
  <section id="molekuele" class="block">
    <header class="block__head">
      <div>
        <p class="block__level">Ebene 2 · Molecules</p>
        <h2>Moleküle</h2>
        <p class="block__note">
          Zusammengesetzte Bedienelemente: Beschriftung, Steuerelement und Meldung
          gehören zusammen. Tastatur und ARIA sind hier verdrahtet, nicht in der App.
        </p>
      </div>
    </header>

    <div class="grid">
      <div class="cell">
        <p class="cell__label">WpFormField + WpInput (verdrahtet)</p>
        <UI.WpFormField label="Gerätename" hint="Erscheint in der Geräteliste." v-slot="{ id, describedby, invalid }">
          <UI.WpInput :id="id" :aria-describedby="describedby" :state="invalid ? 'invalid' : 'default'" v-model="name" />
        </UI.WpFormField>
        <UI.WpFormField label="Host" error="Nicht erreichbar (Zeitüberschreitung)." v-slot="{ id, describedby, invalid }">
          <UI.WpInput :id="id" :aria-describedby="describedby" :state="invalid ? 'invalid' : 'default'" model-value="192.168.1." />
        </UI.WpFormField>
        <UI.WpFormField label="Sendeintervall" hint="Millisekunden, 16–200." required v-slot="{ id }">
          <UI.WpInput :id="id" :model-value="'33'" type="number" />
        </UI.WpFormField>
      </div>

      <div class="cell">
        <p class="cell__label">WpSelect — Einfachauswahl</p>
        <UI.WpSelect v-model="device" :options="options" label="Ausgabegerät" />
        <p class="cell__hint">Pfeiltasten öffnen und bewegen, Enter wählt, Esc schließt.</p>
        <p class="cell__label">WpMultiselect</p>
        <UI.WpMultiselect v-model="picks" :options="options" label="Aktive Ausgänge" />
      </div>

      <div class="cell">
        <p class="cell__label">WpCombobox — Suche mit Treffern</p>
        <UI.WpCombobox v-model="search" :options="options" label="Gerät suchen" placeholder="Tippen zum Filtern …" />
        <p class="cell__hint">aria-autocomplete=list, Trefferzahl wird angesagt.</p>
        <p class="cell__label">WpRadioGroup</p>
        <UI.WpRadioGroup v-model="mode" name="mode" label="Übergang" :options="[
          { value: 'smooth', label: 'Weich' },
          { value: 'instant', label: 'Direkt' },
          { value: 'fade', label: 'Überblenden', disabled: true },
        ]" />
      </div>

      <div class="cell">
        <p class="cell__label">WpTabs</p>
        <UI.WpTabs v-model="tab" :tabs="tabs" label="Bereiche">
          <p class="cell__hint">Inhalt des gewählten Reiters: {{ tab }}</p>
        </UI.WpTabs>
      </div>

      <div class="cell">
        <p class="cell__label">WpToast</p>
        <UI.WpToast tone="ok" title="Gespeichert" description="Einstellungen liegen in ~/.config." />
        <UI.WpToast tone="warn" title="Gerät antwortet langsam" description="Letzte Antwort vor 3 s." />
        <UI.WpToast tone="error" title="Verbindung verloren" description="WLED 192.168.1.42." />
      </div>

      <div class="cell">
        <p class="cell__label">WpToggleGroup — Umschaltknöpfe (gtk::ToggleButton)</p>
        <UI.WpToggleGroup v-model="sprache" :options="sprachen" label="Sprache" />
        <UI.WpToggleGroup v-model="schema" :options="schemas" label="Farbschema" size="sm" />
        <UI.WpToggleGroup v-model="ansicht" :options="ansichten" label="Ansicht" block />
        <p class="cell__hint">
          Eine Auswahl, immer genau ein Wert; der gedrückte Knopf ist gefüllt.
          Semantik als radiogroup mit aria-checked, damit „1 von 4" angesagt wird.
        </p>
      </div>

      <div class="cell">
        <p class="cell__label">WpImageFrame — drei Zustände, gleiches Format</p>
        <div class="bilder">
          <UI.WpImageFrame :state="{ kind: 'bild', src: bild }" caption="1 / 3 · Screenshot" alt="Vorschau" />
          <UI.WpImageFrame :state="{ kind: 'laedt' }" :ratio="'16 / 9'" caption="lädt" />
          <UI.WpImageFrame :state="{ kind: 'fehlt', text: 'keine Vorschau' }" :ratio="'16 / 9'" />
        </div>
        <p class="cell__hint">
          Rahmen als Haarlinie, Bild eingepasst statt beschnitten — in einer Galerie
          springt nichts, wenn die Bilder unterschiedlich groß sind.
        </p>
      </div>

      <div class="cell">
        <p class="cell__label">WpEmptyState</p>
        <UI.WpEmptyState kind="keine-treffer" title="Keine Geräte gefunden" description="Suche im Netzwerk, oder trage die Adresse von Hand ein.">
          <template #action><UI.WpButton label="Netzwerk durchsuchen" :icon="IconSearch" variant="primary" /></template>
        </UI.WpEmptyState>
      </div>
    </div>
  </section>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: var(--wp-space-4); }
.cell { display: flex; flex-direction: column; gap: var(--wp-space-3); padding: var(--wp-space-3); border: var(--wp-size-border) solid var(--wp-color-border-subtle); background: var(--wp-color-bg-panel); }
.cell__label { margin: 0; font-family: var(--wp-font-family-mono); font-size: var(--wp-font-size-xs); color: var(--wp-color-text-faint); }
.bilder { display: grid; grid-template-columns: 1fr; gap: var(--wp-space-2); }
.cell__hint { margin: 0; font-size: var(--wp-font-size-xs); color: var(--wp-color-text-faint); }
</style>
