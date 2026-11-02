<script setup lang="ts">
import { ref } from "vue";

// Zeigt im Styleguide, was das Atom meldet.
const letzterLink = ref("");
import * as UI from "@weppelmann/components";
const variants = ["primary", "secondary", "ghost", "danger"] as const;
const tones = ["neutral", "ok", "warn", "error"] as const;
const text = ref("Kick");
const on = ref(true);
const checked = ref(false);
</script>

<template>
  <section id="atome" class="block">
    <header class="block__head">
      <div>
        <p class="block__level">Ebene 1 · Atoms</p>
        <h2>Atome</h2>
        <p class="block__note">
          Ein Element, kein Wissen über andere Komponenten. Alles, was hier fehlt,
          gehört eine Ebene höher.
        </p>
      </div>
    </header>

    <div class="grid">
      <div class="cell">
        <p class="cell__label">WpButton — Variante × Zustand</p>
        <div class="row wrap">
          <UI.WpButton v-for="v in variants" :key="v"
                       :label="v" :variant="v" />
        </div>
        <div class="row wrap">
          <UI.WpButton label="busy" state="busy" />
          <UI.WpButton label="disabled" state="disabled" />
          <UI.WpButton label="klein" size="sm" />
          <UI.WpButton label="groß" size="lg" variant="primary" />
        </div>
      </div>

      <div class="cell">
        <p class="cell__label">WpBadge</p>
        <div class="row wrap">
          <UI.WpBadge v-for="t in tones" :key="t" :tone="t" :label="t" />
        </div>
        <p class="cell__hint">In <code>mono</code> unterscheidet die Form.</p>
      </div>

      <div class="cell">
        <p class="cell__label">WpInput · WpTextarea</p>
        <UI.WpInput v-model="text" placeholder="Kanalname" />
        <UI.WpInput :model-value="'falsch'" state="invalid" />
        <UI.WpInput :model-value="'gesperrt'" state="disabled" />
        <UI.WpTextarea :model-value="'Notiz'" :rows="2" />
      </div>

      <div class="cell">
        <p class="cell__label">WpCheckbox · WpSwitch</p>
        <UI.WpCheckbox v-model="checked" label="Addons automatisch aktualisieren" />
        <UI.WpSwitch v-model="on" label="Engine läuft" />
      </div>

      <div class="cell">
        <p class="cell__label">WpSpinner · WpProgress</p>
        <div class="row"><UI.WpSpinner /><UI.WpSpinner size="md" /></div>
        <UI.WpProgress :value="72" label="Installation" />
        <UI.WpProgress :value="null" label="Suche" />
      </div>

      <div class="cell">
        <p class="cell__label">WpText · WpDivider</p>
        <UI.WpText variant="heading">Überschrift</UI.WpText>
        <UI.WpText>Fließtext</UI.WpText>
        <UI.WpText variant="caption" tone="muted">Bildunterschrift</UI.WpText>
        <UI.WpText variant="mono" tone="ok">-6.2 dB</UI.WpText>
        <UI.WpDivider spaced />
      </div>
      <div class="cell">
        <p class="cell__label">WpLink — meldet `open`, öffnet nicht selbst</p>
        <UI.WpLink href="https://hexwerk.weppelmann.eu" external label="hexwerk.weppelmann.eu"
                   @open="letzterLink = $event" />
        <UI.WpLink href="https://github.com/Smotherer007" external label="Smotherer007 auf GitHub"
                   @open="letzterLink = $event" />
        <p class="cell__hint">
          Die Bibliothek kennt keine Fenster: sie meldet die Adresse, die App ruft
          den Systembrowser. In WebKitGTK tut `target="_blank"` genau nichts.
          <template v-if="letzterLink">Geöffnet werden würde: {{ letzterLink }}</template>
        </p>
      </div>

    </div>
  </section>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--wp-space-4); }
.cell { display: flex; flex-direction: column; gap: var(--wp-space-2); padding: var(--wp-space-3); border: var(--wp-size-border) solid var(--wp-color-border-subtle); background: var(--wp-color-bg-panel); }
.cell__label { margin: 0; font-family: var(--wp-font-family-mono); font-size: var(--wp-font-size-xs); color: var(--wp-color-text-faint); }
.cell__hint { margin: 0; font-size: var(--wp-font-size-xs); color: var(--wp-color-text-faint); }
.row { display: flex; gap: var(--wp-space-2); align-items: center; }
.wrap { flex-wrap: wrap; }
code { font-family: var(--wp-font-family-mono); font-size: 11px; background: var(--wp-color-bg-raised); padding: 1px 4px; }
</style>
