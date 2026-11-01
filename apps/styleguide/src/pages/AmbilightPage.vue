<script setup lang="ts">
// Page: WLED Ambilight. Zusammengesetzt aus Toolbar, Karten, Formularen, Vorschau.
// Die Daten sind Beispieldaten — in der echten App kommen sie über die IPC-Schicht
// als Ereignis (Zustand) und gehen als Befehl zurück.
import { computed, ref } from "vue";
import * as UI from "@weppelmann/components";
import { IconMore, IconPlay, IconStop } from "@weppelmann/icons";

const running = ref(true);
const device = ref<string | null>("wled");
const outputs = ref<string[]>(["wled"]);
const brightness = ref(180);
const saturation = ref(140);
const interval = ref(33);
const smoothing = ref(62);
const mode = ref("ddp");

const devices = [
  { value: "wled", label: "WLED — Wohnzimmer", hint: "192.168.1.42 · DDP" },
  { value: "govee", label: "Govee H6199", hint: "LAN" },
  { value: "none", label: "Kein Gerät", hint: "Suche läuft" },
];
const outputOptions = [
  { value: "wled", label: "WLED" },
  { value: "openrgb", label: "OpenRGB" },
  { value: "nanoleaf", label: "Nanoleaf" },
  { value: "razer", label: "Razer Chroma" },
];
const zones = [
  { id: "oben", left: "8%", top: "4%", width: "84%", height: "10%" },
  { id: "links", left: "8%", top: "18%", width: "12%", height: "64%" },
  { id: "rechts", left: "80%", top: "18%", width: "12%", height: "64%" },
  { id: "unten", left: "8%", top: "86%", width: "84%", height: "10%" },
];

const status = computed(() =>
  running.value
    ? { tone: "ok" as const, label: "senden" }
    : { tone: "neutral" as const, label: "gestoppt" },
);
const fps = computed(() => running.value ? 30 : 0);
</script>

<template>
  <div class="page">
    <UI.WpToolbar title="WLED Ambilight" subtitle="Bildschirmfarben an die LEDs im Raum">
      <template #actions>
        <UI.WpBadge :tone="status.tone" :label="status.label" />
        <UI.WpButton :label="running ? 'Stoppen' : 'Starten'" :icon="running ? IconStop : IconPlay"
                     :variant="running ? 'secondary' : 'primary'" @press="running = !running" />
        <UI.WpMenu :items="[
          { id: 'prefs', label: 'Einstellungen' },
          { id: 'about', label: 'Über WLED Ambilight', separatorBefore: true },
        ]" label="Mehr">
          <UI.WpButton label="Mehr" :icon="IconMore" size="sm" />
        </UI.WpMenu>
      </template>
    </UI.WpToolbar>

    <div class="cols">
      <div class="col">
        <UI.WpCard title="Aufnahme">
          <div class="form">
            <UI.WpSelect v-model="device" :options="devices" label="Ausgabegerät" />
            <UI.WpMultiselect v-model="outputs" :options="outputOptions" label="Ausgänge" />
            <UI.WpSlider v-model="brightness" label="Helligkeit" :max="255" />
            <UI.WpSlider v-model="saturation" label="Sättigung" :max="255" />
            <UI.WpSlider v-model="interval" label="Sendeintervall" :min="16" :max="200" suffix=" ms" />
          </div>
        </UI.WpCard>

        <UI.WpCard title="Verhalten">
          <UI.WpRadioGroup v-model="mode" name="proto" label="Protokoll" :options="[
            { value: 'ddp', label: 'DDP (schnell)' },
            { value: 'http', label: 'HTTP-API' },
          ]" />
          <UI.WpDivider spaced />
          <UI.WpSwitch v-model="running" label="Beim Start automatisch senden" />
        </UI.WpCard>
      </div>

      <div class="col col--wide">
        <UI.WpCard title="Vorschau" subtitle="Zonen auf dem Bildschirm" flush>
          <div class="preview">
            <div class="screen">
              <span class="screen__label">Bildschirm</span>
              <span v-for="z in zones" :key="z.id" class="zone"
                    :style="{ left: z.left, top: z.top, width: z.width, height: z.height }">
                <span class="zone__id">{{ z.id }}</span>
              </span>
            </div>
          </div>
        </UI.WpCard>

        <UI.WpCard title="Messwerte">
          <div class="metrics">
            <div class="metric"><span class="metric__k">Bilder/s</span><span class="metric__v">{{ fps }}</span></div>
            <div class="metric"><span class="metric__k">Latenz</span><span class="metric__v">11 ms</span></div>
            <div class="metric"><span class="metric__k">Pakete</span><span class="metric__v">1.284.302</span></div>
            <div class="metric"><span class="metric__k">Zonen</span><span class="metric__v">{{ zones.length }}</span></div>
          </div>
          <UI.WpDivider spaced />
          <UI.WpText variant="caption" tone="muted">Glättung {{ smoothing }} %</UI.WpText>
          <UI.WpProgress :value="running ? smoothing : 0" label="Glättung" />
        </UI.WpCard>
      </div>
    </div>

    <UI.WpToast v-if="!running" tone="info" title="Senden gestoppt"
                description="Die LEDs behalten den letzten Stand." />
  </div>
</template>

<style scoped>
.page { padding: var(--wp-space-4); display: flex; flex-direction: column; gap: var(--wp-space-4); }
.cols { display: grid; grid-template-columns: 320px 1fr; gap: var(--wp-space-4); }
.col { display: flex; flex-direction: column; gap: var(--wp-space-4); }
.form { display: flex; flex-direction: column; gap: var(--wp-space-3); }
.preview { padding: var(--wp-space-3); background: var(--wp-color-bg-raised); }
.screen { position: relative; aspect-ratio: 16 / 10; background: var(--wp-color-bg-input);
          border: var(--wp-size-border) solid var(--wp-color-border-strong); overflow: hidden; }
.screen__label { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
                 font-family: var(--wp-font-family-mono); font-size: var(--wp-font-size-xs); color: var(--wp-color-text-faint); }
.zone { position: absolute; border: 1px dashed var(--wp-color-accent-default); background: color-mix(in srgb, var(--wp-color-accent-default) 12%, transparent); display: flex; align-items: center; justify-content: center; }
.zone__id { font-family: var(--wp-font-family-mono); font-size: 10px; color: var(--wp-color-accent-default); }
.metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: var(--wp-space-3); }
.metric { display: flex; flex-direction: column; gap: 2px; }
.metric__k { font-size: var(--wp-font-size-xs); color: var(--wp-color-text-faint); }
.metric__v { font-family: var(--wp-font-family-mono); font-size: var(--wp-font-size-lg); font-variant-numeric: tabular-nums; }
@media (max-width: 900px) { .cols { grid-template-columns: 1fr; } }
</style>
