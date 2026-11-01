import { useId as vueUseId } from "vue";

/** Stabile ID für aria-Verknüpfungen (Vue 3.5+). */
export function useId(prefix: string): string {
  return `${prefix}-${vueUseId()}`;
}
