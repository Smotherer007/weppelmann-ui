// Öffentliche Oberfläche der Komponentenbibliothek.
// Regel: Komponenten greifen nur auf semantische Tokens zu (--wp-color-text-default),
// nie auf Primitive und nie auf Hex-Werte.
export { default as WpButton } from "./Button/WpButton.vue";
export { default as WpBadge } from "./Badge/WpBadge.vue";
export { default as WpStack } from "./Stack/WpStack.vue";
