<script setup lang="ts">
// Molekül: Beschriftung, Steuerelement, Hinweis oder Fehler — und die Verdrahtung
// für Screenreader. Die Kennung kommt aus dem Slot, damit das Steuerelement sie
// am richtigen Element trägt (nicht am Wrapper).
import { computed } from "vue";
import { useId } from "../composables/useId";

const props = withDefaults(defineProps<{ label: string; hint?: string; error?: string; required?: boolean }>(), {});
const id = useId("wp-field");
const messageId = `${id}-msg`;
const hasMessage = computed(() => Boolean(props.error || props.hint));
</script>

<template>
  <div class="wp-formfield">
    <label :for="id" class="wp-formfield__label">
      {{ label }}<span v-if="required" class="wp-formfield__req" aria-hidden="true">*</span>
    </label>
    <slot :id="id" :describedby="hasMessage ? messageId : undefined" :invalid="Boolean(error)" />
    <p v-if="error" :id="messageId" class="wp-formfield__msg wp-formfield__msg--error">{{ error }}</p>
    <p v-else-if="hint" :id="messageId" class="wp-formfield__msg">{{ hint }}</p>
  </div>
</template>

<style>
.wp-formfield { display: flex; flex-direction: column; gap: 4px; }
.wp-formfield__label { font-size: var(--wp-font-size-sm); color: var(--wp-color-text-muted); }
.wp-formfield__req { color: var(--wp-color-status-error); margin-left: 3px; }
.wp-formfield__msg { margin: 0; font-size: var(--wp-font-size-xs); color: var(--wp-color-text-faint); }
.wp-formfield__msg--error { color: var(--wp-color-status-error); }
</style>
