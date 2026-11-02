<script setup lang="ts">
// Beschriftung und Wert, zweispaltig: Autor, Homepage, Interface, Groesse.
//
// Als Liste (`dl`), nicht als Tabelle mit Rahmen: es sind keine Datenzeilen mit
// Bedeutung in der Spalte, sondern Eigenschaften eines Gegenstands.
export interface Fact {
  /** Beschriftung. */
  key: string;
  /** Wert; leer wird als Gedankenstrich gezeigt. */
  value?: string | null;
  /** Wert ist monospaced (Pfade, Versionen, Zahlen). */
  mono?: boolean;
}

withDefaults(defineProps<{ facts: Fact[]; labelWidth?: string }>(), { labelWidth: "130px" });
</script>

<template>
  <dl class="wp-facts" :style="{ gridTemplateColumns: `var(--wp-fact-label, ${labelWidth}) 1fr` }">
    <template v-for="f in facts" :key="f.key">
      <dt class="wp-facts__key">{{ f.key }}</dt>
      <dd class="wp-facts__wert" :class="{ 'is-mono': f.mono }">
        <slot :name="`wert-${f.key}`">{{ f.value || "—" }}</slot>
      </dd>
    </template>
  </dl>
</template>

<style>
.wp-facts { display: grid; gap: 2px var(--wp-space-3); margin: 0; font-size: var(--wp-font-size-xs); }
.wp-facts__key { color: var(--wp-color-text-faint); }
.wp-facts__wert { margin: 0; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.wp-facts__wert.is-mono { font-family: var(--wp-font-family-mono); }
</style>
