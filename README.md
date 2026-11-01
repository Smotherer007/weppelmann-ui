# weppelmann-ui

Ein UI-Baukasten für die Weppelmann-Apps: geteilte Komponenten, drei Themes,
ein Living Styleguide. Vue 3 + TypeScript, ausgeliefert über Tauri.

| Paket | Inhalt |
|---|---|
| `@weppelmann/tokens` | Design-Tokens nach W3C DTCG, Compiler nach CSS/JSON |
| `@weppelmann/components` | Vue-3-Komponenten (in Arbeit) |
| `@weppelmann/icons` | Symbole und App-Icons (in Arbeit) |
| `@weppelmann/testkit` | Playwright-Fixtures, axe-Setup, Mock-Backend (in Arbeit) |
| `styleguide` | Living Styleguide, rendert Tokens und Komponenten |

Verbindlich: [PLAN.md](PLAN.md) und [AGENTS.md](AGENTS.md).

## Loslegen

```bash
npm install
npm run tokens      # Tokens bauen -> packages/tokens/dist
npm run dev         # Styleguide unter http://localhost:5173
```

## Themes

Genau drei: `dark` (Standard), `light`, `mono`. Umschaltung über
`data-theme` am Wurzelelement. Keine weiteren Themes, kein Runtime-Editor.

## Lizenz

GPL-3.0-or-later. Siehe [LICENSE](LICENSE).
