<script setup lang="ts">
// Page: Einstellungen. Formularlastig — der Fall, den egui am schlechtesten konnte.
import { ref } from "vue";
import * as UI from "@weppelmann/components";
import type { Tab } from "@weppelmann/components";
import { IconWifi } from "@weppelmann/icons";

const tab = ref("allgemein");
const tabs: Tab[] = [
  { id: "allgemein", label: "Allgemein" },
  { id: "netzwerk", label: "Netzwerk" },
  { id: "erweitert", label: "Erweitert" },
];
const language = ref<string | null>("de");
const theme = ref("dark");
const host = ref("192.168.1.42");
const port = ref("4048");
const autoStart = ref(true);
const verbose = ref(false);

const languages = [
  { value: "de", label: "Deutsch" },
  { value: "en", label: "English" },
];
</script>

<template>
  <div class="page">
    <UI.WpToolbar title="Einstellungen" subtitle="Wird in ~/.config/wled-ambilight/config.json abgelegt" />

    <UI.WpTabs v-model="tab" :tabs="tabs" label="Bereiche">
      <div v-if="tab === 'allgemein'" class="form">
        <UI.WpSelect v-model="language" :options="languages" label="Sprache" />
        <UI.WpRadioGroup v-model="theme" name="theme" label="Theme" :options="[
          { value: 'dark', label: 'Dunkel' },
          { value: 'light', label: 'Hell' },
          { value: 'mono', label: 'Mono' },
        ]" />
        <UI.WpSwitch v-model="autoStart" label="Beim Anmelden starten" />
        <UI.WpFormField label="Konfigurationspfad" hint="Leer lassen für den Standardpfad." v-slot="{ id, describedby }">
          <UI.WpInput :id="id" :aria-describedby="describedby" model-value="" placeholder="~/.config/wled-ambilight" />
        </UI.WpFormField>
      </div>

      <div v-else-if="tab === 'netzwerk'" class="form">
        <div class="pair">
          <UI.WpFormField label="Host" hint="IPv4 oder Name" v-slot="{ id, describedby }">
            <UI.WpInput :id="id" :aria-describedby="describedby" v-model="host" />
          </UI.WpFormField>
          <UI.WpFormField label="Port" v-slot="{ id }">
            <UI.WpInput :id="id" v-model="port" type="number" />
          </UI.WpFormField>
        </div>
        <UI.WpButton label="Verbindung prüfen" :icon="IconWifi" />
        <UI.WpToast tone="ok" title="Erreichbar" description="4048/udp antwortet in 4 ms." />
      </div>

      <div v-else class="form">
        <UI.WpSwitch v-model="verbose" label="Ausführlich protokollieren" />
        <UI.WpTextarea :model-value="'# Protokoll (gekürzt)\n12:04:11 send 4 zones, 30 fps\n12:04:12 device lost, retry in 2s'" :rows="6" />
        <UI.WpText variant="caption" tone="faint">Wird nur bei Problemen gebraucht.</UI.WpText>
      </div>
    </UI.WpTabs>
  </div>
</template>

<style scoped>
.page { padding: var(--wp-space-4); }
.form { display: flex; flex-direction: column; gap: var(--wp-space-3); max-width: 520px; }
.pair { display: grid; grid-template-columns: 1fr 120px; gap: var(--wp-space-3); }
</style>
