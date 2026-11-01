# AGENTS.md — Vorlage für alle Weppelmann-Projekte

> Diese Datei liegt in **jedem** Repo (UI-Bibliothek und Apps). Sie ist die verbindliche
> Arbeitsanweisung für Menschen und Agenten. Abweichungen nur mit Eintrag in
> `docs/adr/` und Vermerk hier. Der projektspezifische Teil ist §8.

## 1. Worum es geht

Ein Satz, was diese Software für wen tut. (Beim Kopieren ersetzen.)

## 2. Nicht verhandelbar

1. **Datenorientiert.** Das Datenmodell ist die einzige Wahrheit, die Oberfläche ist
   `render(model) → Sicht`. Kein Zustand in der Darstellung, der nicht im Modell steht.
2. **Zustände als Summentypen.** `enum Zustand { Leer, Laedt, Fertig(Daten), Fehler(Text) }`
   statt Fächer aus Booleans. Ein Rust-`enum` mit `serde` und ein TS-Diskriminator
   beschreiben denselben Vertrag.
3. **Sichtbarkeit folgt aus dem Modell.** „Einblenden" ist keine Anweisung, sondern eine
   Folge des Zustands. Kein `show()`, kein `display:none` als Logik, keine `v-if`-Kette
   für Geschäftslogik.
4. **Keine Logik in der Darstellung.** Rechnen, laden, filtern in `domain` (Rust) oder in
   reinen TS-Funktionen — beide mit Unit-Tests.
5. **SIMPLE** (Wrigstad): immer ein lauffähiges Programm, nach jeder Änderung bauen,
   Tests laufen lassen, Problem rekursiv verkleinern. Cheats sind erlaubt, aber
   ticketpflichtig, lokal begrenzt und werden abgebaut.
6. **Keine Farben, Größen oder Abstände im Code.** Nur semantische Tokens
   (`var(--wp-color-text-default)`). Hex-Werte, `px`-Magie und `--wp-gray-300` in
   Komponenten sind Fehler.
7. **Drei Themes, sonst nichts:** `dark`, `light`, `mono`. Keine Runtime-Themes,
   keine Nutzer-Themes, kein Theme-Editor.
8. **Tests sind Teil der Lieferung.** Unit, Integration, Vertrag, Frontend, axe.
   Ein Fix ohne Test ist ein Fix auf Probe.
9. **Keine Secrets** in Code, Commits, Logs oder Testdaten. Konfiguration über
   Umgebung, Beispiel in `.env.example`.
10. **Plattformneutral.** Kein `cfg(target_os)` und keine Pfadannahmen im Frontend.
    Unterschiede kommen als Daten (`platform` im Modell → `data-platform` am Root).
    Tastenkürzel über `Mod`, nie fest `Ctrl`. Siehe PLAN.md §10.

## 3. Struktur

```
crates/domain    Datenmodell, Regeln, keine I/O          → Unit-Tests
crates/adapters  Dateisystem, Netz, Geräte, Fremdsysteme → Integrationstests
crates/ipc       Befehle/Ereignisse + Schema             → Vertragstests
ui/              Vue 3 + TS, dünn; nutzt @weppelmann/components
docs/            architektur.md, datenfluss.md, adr/
tests/e2e/       Playwright gegen die App mit gemocktem Backend
```

Richtung der Abhängigkeiten: `domain ← adapters ← ipc ← ui`. Nie zurück.
`ui/` kennt keine Domäne, nur Befehle, Ereignisse und Zustände.

## 4. Befehle

```bash
# alles prüfen (das ist der Befehl vor jedem Commit)
cargo fmt --all --check && cargo clippy --all-targets -- -D warnings && cargo test
npm --prefix ui run lint && npm --prefix ui run typecheck && npm --prefix ui run test
npm --prefix tests/e2e run test        # Playwright, headless

npm --prefix ui run dev                # Frontend autark, Backend gemockt
npm --prefix ui run build              # Produktionsbuild
cargo tauri build                      # Paket bauen
```

Frontend-Entwicklung läuft **ohne** das echte Backend: `ui/` startet gegen das
Mock-Backend aus `@weppelmann/testkit`. Wer für eine UI-Aufgabe das echte
Gerät, PipeWire oder eine WoW-Installation braucht, hat die Grenze falsch gezogen.

## 5. Definition of Done

- [ ] Tests grün (Unit, Integration, Vertrag, E2E), axe ohne Befund
- [ ] `clippy -D warnings`, `eslint`, `tsc --noEmit` sauber
- [ ] alle drei Themes geprüft (dark, light, mono)
- [ ] Tastaturbedienung geprüft, Fokus sichtbar, Rollen und Namen gesetzt
- [ ] Screenshot im PR (vorher/nachher bei UI-Änderungen)
- [ ] keine Tokens umgangen, keine Hex-Werte, keine neuen Abhängigkeiten ohne Begründung
- [ ] Dokumentation angepasst: `README.md` (was die App tut), `docs/` (wie sie gebaut ist)
- [ ] Cheats dieses PRs als Ticket vermerkt

## 6. Commits und Releases

- Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `build:`, `ci:`).
- `release-please` mit `bump-minor-pre-major: true` (0.x bleibt unter 1.0, auch bei
  Breaking Changes) und `extra-files` für die `.metainfo.xml`.
- Kleine Commits, ein Gedanke pro Commit, deutschsprachige Betreffzeile erlaubt.
- Kein „WIP"-Merge nach `main`; `main` ist immer lauffähig.

## 7. Dokumentation

- `README.md`: was die App tut, für wen, Screenshots (dark + light), Installation je
  Plattform, ein Absatz zu Daten und Datenschutz. Das ist die Visitenkarte, nicht das
  Handbuch.
- `docs/architektur.md`: Schichten, Grenzen, Datenfluss als Mermaid-Diagramm.
- `docs/datenfluss.md`: was ein Befehl auslöst, bis das Bild steht.
- `docs/adr/NNNN-titel.md`: getroffene Entscheidung, Alternativen, Kosten.
- Screenshots werden **erzeugt** (Playwright), nicht von Hand abgelegt.

## 8. Projektspezifisch

- Name, Zweck, Zielgruppe:
- Abweichende Befehle:
- Besonderheiten (Plattformen, Sandkasten-Rechte, externe Dienste):
- Kontakt/Issues:
