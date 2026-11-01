# Plan: ein UI-System für alle Weppelmann-Apps

Stand: 2026-11-01 · Status: **Entwurf zur Freigabe** · Gilt für: crosspoint, hexwerk, wledambilight, künftige Apps

## 1. Ziel

Drei Apps, ein Baukasten: **eine** Komponentenbibliothek, **ein** Theming (dark/light/mono),
**ein** Vorgehen (datenorientiert + SIMPLE), **eine** Testpyramide, **ein** Living Styleguide.

Jede App bleibt ein eigenes Repo mit eigenem Release-Zyklus. Geteilt wird nur, was
geteilt werden darf: Darstellung, Tokens, Icons, Werkzeuge. Domänenlogik bleibt in der App.

### Nicht-Ziel

- Kein Monorepo über die drei Apps. Kein gemeinsamer Release-Takt.
- Keine geteilte Domänenlogik (crosspoints DSP, hexwerks Quellen, wleds Capture bleiben lokal).
- Kein Runtime-Theme-Editor, keine Nutzer-Themes, keine Plugin-Oberflächen.

## 2. Entscheidungen

Jede Entscheidung hat eine Zeile Begründung. Wer sie kippt, kippt den Plan.

| # | Entscheidung | Begründung |
|---|---|---|
| E1 | **Frontend ist Web** (HTML/CSS/TS), ausgeliefert über Tauri 2.12 | Einzige Technik, die eine geteilte Komponentenbibliothek über alle drei Apps erlaubt (GTK4 ≠ egui ≠ Web), themebar per CSS-Variablen ist, einen echten Styleguide und echte Frontend-Tests (Playwright/axe) ermöglicht und Windows/macOS für wledambilight erhält. |
| E2 | **Vue 3 + Vite + TypeScript** für Komponenten und Apps | Eigene Kompetenz (100 % JS/Vue laut Profil), SFC = eine Datei pro Komponente, ohne Framework-Magie. Kein React (Ökosystem-Vorteil nicht nötig), kein Svelte (Risiko bei Wartung). |
| E3 | **Tokens nach W3C DTCG 2025.10** (stabile Version seit 2025-10-28) | Standardformat, anschlussfähig an Figma/Tokens Studio; der Compiler zu CSS/Rust/JSON ist unser Code (~150 Zeilen, keine Fremdabhängigkeit). |
| E4 | **Genau drei Themes: dark, light, mono.** Keine weiteren. | Reduziert die Matrix auf 3 × N Komponenten. mono = Graustufen-Palette für Fokus, Kontrast und Farbsehschwäche. |
| E5 | **Versionierung über Changesets**, Auslieferung als private Pakete `@weppelmann/*` (GitHub Packages) | Apps ziehen eine Version (`@weppelmann/components@^1.4`); Erhöhen ist ein Befehl, kein Copy-Paste. |
| E6 | **Testpyramide: Unit (Vitest + Rust) · Integration (cargo + Vertragstests) · Frontend (Playwright + axe-core)** | Ersetzt pyatspi (hexwerk) und den CDP-Screenshot-Client (crosspoint) durch ein Werkzeug für alle Apps. |
| E7 | **`AGENTS.md` in jedem Repo**, Inhalt aus einer Vorlage | Einheitliches Vorgehen ist nur verbindlich, wenn es dort steht, wo jeder Agent und jeder Entwickler zuerst liest. |
| E8 | **Arbeitsregel SIMPLE** (Wrigstad) + datenorientierte UI | Siehe §3. Cheats sind erlaubt, aber ticketpflichtig mit Abbaudatum. |

> **E1 ist die Entscheidung, an der alles hängt.** Die Alternativen und was sie kosten: §8.

## 3. Vorgehen: datenorientiert + SIMPLE

### 3.1 Datenorientiert (verbindlich)

1. **Das Datenmodell ist die einzige Wahrheit.** Die Oberfläche ist eine Projektion
   `render(model) → Sicht`. Kein Zustand in Widgets, der nicht im Modell steht.
2. **Zustände sind Summentypen**, keine Fächer aus Booleans. Nicht
   `isLoading, hasError, isEmpty`, sondern `enum Zustand { Leer, Laedt, Fertig(Daten), Fehler(Text) }`.
   Ein Rust-`enum` mit `serde`, ein TS-Diskriminator — derselbe Vertrag.
3. **Sichtbarkeit folgt aus dem Modell.** „Element einblenden" ist kein Befehl, sondern
   eine Folge des Zustands. Kein imperatives `show()`, kein `display:none`-Gefummel,
   keine `v-if`-Ketten als Geschäftslogik. Das ist der Punkt, den du als obsolet
   bezeichnet hast — er wird hier zur Regel.
4. **Logik liegt nicht in der Darstellung.** Rechnen, laden, filtern passiert in
   `domain` (Rust) oder in reinen TS-Funktionen mit Unit-Tests. Eine Komponente
   entscheidet nichts, sie stellt dar.
5. **Verträge sind explizit.** Jeder Befehl und jedes Ereignis zwischen Backend und
   Frontend hat ein Schema (serde → JSON Schema → generierte TS-Typen). Kein
   untypisiertes `any` über die IPC-Grenze.

### 3.2 SIMPLE in zehn Schritten (Arbeitsweise)

1. Aufgabe in Wortarten zerlegen: Verben = Verhalten, Substantive = Daten.
2. Erst einen Test schreiben, der das erwartete Verhalten festnagelt.
3. Immer ein lauffähiges Programm haben.
4. Nach jeder Änderung kompilieren bzw. bauen.
5. Tests laufen lassen, nicht nur das Auge.
6. Problem rekursiv in Teilprobleme zerlegen, lösen erst wenn es einfach aussieht.
7. Teilproblem in kleinste Schritte zerlegen; geradeaus zuerst, Schleifen zuletzt.
8. **Cheat**, wenn du feststeckst (Fake-Daten, gemockte Schnittstelle) — mit Ticket.
9. **Dodge**, um die Aufgabe zu vereinfachen — mit Notiz im Plan.
10. Zwischen Denken, Coden und Refactoring wechseln; Cheats zuerst zurückbauen.

**Three Rules of Cheating** (aus SIMPLE übernommen): 1. der Cheat ist dokumentiert,
2. der Cheat ist lokal begrenzt, 3. der Cheat wird abgebaut, sobald der echte Weg geht.
Ein Cheat ohne Ticket ist ein Fehler, kein Cheat.

## 4. Zielbild der Repos

### 4.1 Das UI-Repo (neu, privat)

Werkzeuge: **npm workspaces** (npm 12 ist vorhanden), Vite, Vue 3, TypeScript.
Kein pnpm, kein Yarn — ein zusätzlicher Paketmanager wäre eine Abhängigkeit ohne Not.

```
weppelmann-ui/
├── AGENTS.md                       # Vorgehen, Regeln, Befehle
├── PLAN.md                         # dieses Dokument
├── docs/
│   ├── architektur.md              # Schichten, Datenfluss (Mermaid)
│   ├── tokens.md                   # Token-Namen, Bedeutung, Modi
│   ├── komponenten.md              # Katalog: Name, Zustände, Verwendung
│   ├── barrierefreiheit.md         # Tastatur, Rollen, Kontrast, Prüfregeln
│   └── adr/                        # Entscheidungen (0001-web-frontend.md …)
├── packages/
│   ├── tokens/                     # DTCG-JSON → dist/css, dist/rust, dist/json
│   ├── components/                 # @weppelmann/components (Vue 3 + TS)
│   ├── icons/                      # Symbol- und App-Icons, generiert
│   └── testkit/                    # Playwright-Fixtures, axe-Setup, Mock-Backend
├── apps/
│   └── styleguide/                 # Living Styleguide (rendert die Bibliothek)
└── .github/workflows/ci.yml         # lint → unit → e2e → styleguide-build → publish
```

### 4.2 Jede App danach (Beispiel hexwerk)

```
hexwerk/
├── AGENTS.md
├── crates/
│   ├── core/       # Datenmodell + Regeln, ohne I/O  → Unit-Tests
│   ├── sources/    # Adapter (HTTP, Dateien)         → Integrationstests
│   ├── index/      # …
│   ├── install/    # …
│   └── ipc/        # Befehlsschicht + Schema         → Vertragstests
├── ui/             # Vue-Frontend, dünn; nutzt @weppelmann/components
├── docs/           # architektur.md, datenfluss.md, adr/
├── tests/e2e/      # Playwright gegen die App mit gemocktem Backend
└── README.md       # Screenshots + was die App tut (Werbung)
```

Regel: **`ui/` kennt keine Domäne.** Es kennt Befehle, Ereignisse und Zustände.
Damit ist das Frontend autark entwickelbar — mit gemocktem Backend, ohne PipeWire,
ohne WoW-Installation, in der CI.

### 4.3 Atomic Design (verbindlich)

Die Bibliothek ist nach Atomic Design gegliedert, nicht nach Technik. Die Ebene steht im
Pfad, damit man beim Suchen sofort weiß, wie viel Verantwortung eine Komponente hat.

| Ebene | Ordner | Regel | Beispiele |
|---|---|---|---|
| **Atom** | `packages/components/src/atoms/` | Ein Element, keine Kenntnis anderer Komponenten außer Layout-Atomen. Darf alles über Tokens stylen, nichts entscheiden. | `WpButton`, `WpBadge`, `WpInput`, `WpCheckbox`, `WpSwitch`, `WpText`, `WpSpinner`, `WpProgress`, `WpDivider`, `WpStack` |
| **Molekül** | `molecules/` | Setzt Atome zu einer bedienbaren Einheit zusammen (Label + Feld + Fehler). Kennt keine Domäne. | `WpFormField`, `WpSelect`, `WpMultiselect`, `WpCombobox`, `WpRadioGroup`, `WpTabs`, `WpToast`, `WpEmptyState` |
| **Organismus** | `organisms/` | Eine abgeschlossene Fläche mit eigenem Zustand (Tabelle, Dialog, Menü, Karte). Darf Moleküle enthalten, keine App-Daten. | `WpTable`, `WpDialog`, `WpMenu`, `WpCard`, `WpToolbar` |
| **Template** | `apps/styleguide/src/templates/` | Skelett einer Seite: wo welche Organismen stehen, ohne echte Daten. Bleibt im Styleguide — eine App kann es kopieren, die Bibliothek liefert es nicht. | Katalog-Layout, Einstellungs-Layout |
| **Page** | `apps/styleguide/src/pages/` | Template mit echten Beispieldaten. Zeigt das Zusammenspiel und ist die Vorlage für die App-Bildschirme. | Addon-Katalog, Einstellungen, Kanalzug |

Zwei Regeln dazu:

- **Aufstieg ist verboten, Abstieg erlaubt.** Ein Atom darf kein Molekül importieren; ein
  Organismus darf Atome und Moleküle nutzen. Wer eine Ausnahme braucht, hat die Ebene
  falsch gewählt.
- **Der Styleguide zeigt jede Ebene und mindestens eine Seite je Template.** Ein Katalog
  aus Einzelteilen beantwortet nicht die Frage, ob die Teile zusammen funktionieren.

## 5. Komponenteninventar

Aus dem Bestand gezogen (Zählung über alle drei Apps), gemappt auf die Web-Bibliothek.
Mit `*` markiert: Komponente, die es heute in keinem der drei Projekte gibt, die aber
aus dem Datenfluss-Modell folgt (Lade-/Leer-/Fehlerzustand).

| # | Web-Komponente | ersetzt | Zustände |
|---|---|---|---|
| 1 | `WpButton` | `gtk::Button`, `adw`-Buttons | default, primary, ghost, danger, busy, disabled |
| 2 | `WpIconButton` | `gtk::MenuButton` | default, active |
| 3 | `WpText` | `gtk::Label` (247×) | body, caption, mono-number, heading |
| 4 | `WpStack` | `gtk::Box` (196×) | – |
| 5 | `WpPanel` | `adw::ToolbarView`, Pane-Flächen | flat, raised |
| 6 | `WpInput` | `gtk::Entry`, `gtk::SearchEntry` | default, focus, invalid, disabled |
| 7 | `WpSelect` | `gtk::DropDown` (23×) | default, open |
| 8 | `WpSwitch` / `WpCheckbox` | `gtk::Switch`, `gtk::CheckButton` | on, off, indeterminate |
| 9 | `WpSlider` | `gtk::Scale` | default, dragging |
| 10 | `WpTable` | `gtk::ColumnView` (5×) | leer, gefüllt, sortiert, ausgewählt |
| 11 | `WpList` | `gtk::ListBox` | – |
| 12 | `WpTabs` | `gtk::Stack` (13×) | – |
| 13 | `WpDialog` | `adw::AlertDialog` (5×) | info, warnung, fehler, bestätigung |
| 14 | `WpToast` | `adw::Toast` (4×) | info, erfolg, fehler |
| 15 | `WpSpinner` / `WpProgress` | `adw::Spinner`, `gtk::ProgressBar` | – |
| 16 | `WpMenu` | `gtk::Popover` (7×) | – |
| 17 | `WpAppShell` | `adw::NavigationSplitView` + `HeaderBar` | sidebar offen/geschlossen |
| 18 | `WpCanvas` | `gtk::DrawingArea` (5×), egui-`painter` | – |
| 19 | `WpDropzone` | `gtk::DropTarget` | idle, over, reject |
| 20 | `WpFormField` | – (überall von Hand) | default, hint, error |
| 21 | `WpBadge` | „Chips" aus `Label`-Bastelei | neutral, ok, warn, error |
| 22 | `WpEmptyState` * | – | leer, fehler, keine Treffer |
| 23 | `WpSkeleton` * | – | laden |

Spezialfälle bleiben in der App, nicht in der Bibliothek: crosspoints Fader-Bank,
Pegelanzeige, EQ-Raster (bauen auf `WpCanvas` + Tokens auf), wleds Vorschau-Zonen,
hexwerks Addon-Karten (bauen auf `WpPanel` + `WpStack`).

## 6. Theming

- **Drei Modi, sonst nichts:** `dark` (Standard), `light`, `mono`.
- Umschaltung über `data-theme="dark|light|mono"` am Wurzelelement; die Wahl
  überlebt in der Konfiguration der App. Kein System-Automatismus als vierter Modus —
  `dark` ist der Standard, weil alle drei Apps heute dunkel sind.
- `mono` heißt: alle Flächen und Linien in Grauwerten, Akzentfarbe wird zu hellem Grau,
  Statusfarben (ok/warn/error) werden über Form und Symbol unterschieden, nicht über Farbe.
- Tokens sind DTCG-JSON mit drei Modus-Dateien; die semantische Ebene ist stabil,
  die Primitive dürfen sich ändern. **Komponenten greifen nur semantisch zu**
  (`--wp-color-text-default`), niemals auf Primitive (`--wp-gray-300`) und nie auf Hex-Werte.
- Der Compiler erzeugt: `dist/css/vars.css` (Web), `dist/rust/theme.rs` (native
  Restbestände und Backends), `dist/json/tokens.json` (Werkzeuge, Styleguide).

## 7. Tests (verbindlich, in jeder App)

| Stufe | Werkzeug | Prüft | Läuft in CI |
|---|---|---|---|
| Unit | `cargo test`, `vitest` | Regeln, Formatierung, reine Funktionen | ja, jeder Commit |
| Integration | `cargo test --test` | Adapter gegen Fixtures, Dateisystem, HTTP-Mocks | ja |
| Vertrag | generierte TS-Typen + Schema-Validierung der Beispiele | Backend und Frontend verstehen dasselbe | ja |
| Frontend | Playwright gegen Styleguide **und** App mit gemocktem Backend | Rendern, Zustände, Tastaturbedienung, Theme-Wechsel | ja |
| Barrierefreiheit | axe-core je Story und je App-Seite | Rollen, Namen, Kontrast | ja, bricht bei Fehler ab |
| Visuell (optional) | Playwright-Screenshots je Theme | ungewollte Änderungen | nur bei UI-PRs |

Definition of Done für jede Änderung: Tests grün, `clippy -D warnings`, `eslint`/`tsc` sauber,
Screenshot im PR, `AGENTS.md`-Regeln eingehalten, keine Hex-Werte im Code.

## 8. Warum nicht GTK4 überall oder egui überall

| Weg | Was er kostet |
|---|---|
| **GTK4 für alle drei** | wledambilight verliert Windows und macOS (`packaging/windows/installer.iss`, `packaging/macos/Info.plist` wären tot), kein WebView im Sandkasten, Styleguide und Frontend-Tests bleiben Handarbeit (AT-SPI). |
| **egui für alle drei** | Alle Widgets sind selbstgezeichnet (`ui.painter`, `allocate_exact_size` — heute schon 15× in wledambilight). Listen, Tabellen, Formulare und Textauswahl werden Handarbeit; Barrierefreiheit läuft über AccessKit, nicht über das, was ein Browser von Haus aus mitbringt. Kein Styleguide-Ökosystem. |
| **Zwei Frontends (GTK + egui) erhalten** | Zwei Komponentenbibliotheken pflegen, zwei Testwege, zwei Theme-Compiler. Widerspricht „einheitlich" direkt. |

Der Web-Weg ist der einzige, bei dem *eine* Bibliothek drei Apps bedient, ohne dass eine
App Plattformen verliert.

## 9. Phasen

| Phase | Inhalt | Abnahme |
|---|---|---|
| **P0** Fundament | Repo, `pnpm`-Workspace, Tokens (dark/light/mono), Compiler nach CSS/Rust/JSON, Styleguide-Skelett mit Theme-Umschalter, CI (lint, unit, build), `AGENTS.md`, `docs/` | Styleguide startet, zeigt Token-Tabellen in drei Modi; CI grün |
| **P1** Kernbibliothek | Komponenten 1–15 aus §5 mit Stories, Vitest und axe-Tests | jede Komponente in allen drei Modi und allen Zuständen im Styleguide, axe ohne Befund |
| **P2** Pilot: wledambilight | egui-Oberfläche ersetzt durch Vue/Tauri; Engine unverändert; Tray bleibt (Tauri), Screenshots in README | App startet, alle bisherigen Funktionen erreichbar, E2E grün, Windows/macOS-Build vorhanden |
| **P3** crosspoint | bestehende Web-UI (`web/index.html`, 2547 Z.) auf die Bibliothek heben; GTK-Oberfläche stilllegen; Engine/HTTP-API unverändert; Flatpak baut im Sandkasten statt mit fertigem Binary | Mixer bedienbar, 60-Hz-Pegel flüssig, Pegel-/EQ-Zeichnung über `WpCanvas` |
| **P4** hexwerk | GTK-Oberfläche (10.692 Z.) auf Vue/Tauri; `crates/ui-gtk` entfällt; pyatspi-Tests durch Playwright ersetzt | alle fünf Bildschirme, Import/Installation, E2E grün |
| **P5** Aufräumen | alte Paletten, `theme.rs`-Kopien, doppelte `.desktop`-Dateien, `civil_from_days`-Kopien, veraltete Metainfo, Release-Konfigs angleichen | `grep` findet keine Hex-Werte mehr außerhalb der Tokens |

P2 ist der Beweis: erst wenn eine App komplett durch die neue Kette läuft, werden
crosspoint und hexwerk angefasst.

## 10. Plattformen (verbindlich)

| App | Linux | Windows | macOS | Begründung |
|---|---|---|---|---|
| **crosspoint** | ja | nein | nein | Der Kern ist der PipeWire-Graph (plus JACK-Soname, VBAN). Ohne PipeWire gibt es die App nicht. Kein Port, keine Andeutung im Code. |
| **hexwerk** | ja | sofern möglich | sofern möglich | Die Domäne ist eine WoW-Installation plus Addon-Dateien. Auf Windows und macOS liegen die Addons in nativen Ordnern statt in Proton-Präfixen — die Erkennung ist der Aufwand, nicht die Oberfläche. |
| **wledambilight** | ja | ja | ja | Heute schon so (`capture/{linux,windows,macos}.rs`); mit Tauri bleiben alle drei. |

Daraus folgen sieben Regeln. Sie gelten auch dann, wenn eine App heute nur Linux ist —
die Bibliothek ist plattformneutral, sonst ist sie keine Bibliothek.

1. **Kein Plattformcode im Frontend.** `packages/**` und `ui/**` enthalten kein
   `cfg(target_os)`, keinen Pfad mit `/`, keine Annahme über Fensterdekoration.
   Unterschiede kommen als Daten: das Backend liefert `platform: "linux"|"windows"|"macos"`
   im Modell, das Frontend setzt daraus `data-platform` am Wurzelelement.
2. **Tastenkürzel über `Mod`**, nie fest `Ctrl`: auf macOS `⌘`, sonst `Ctrl`.
   Ein Kürzel wird einmal definiert, die Anzeige leitet sich aus der Plattform ab.
3. **Keine gebündelte Schrift als Standard.** Systemschrift-Stack
   (San Francisco, Segoe UI Variable, Cantarell/Inter), Zahlen in einer Monoschrift
   mit `font-variant-numeric: tabular-nums`.
4. **Fenster kommen von der Shell** (Tauri-Decoration). macOS bekommt links Platz für
   die Ampelknöpfe, Windows und Linux nicht — als Token, nicht als Sonderfall im Markup.
5. **Menüs zweigestaltig, eine Komponente:** auf macOS in der Menüleiste, sonst im
   Fenster. `WpMenu` entscheidet anhand von `data-platform`, nicht die App.
6. **CI-Matrix:** `ubuntu-latest`, `macos-latest`, `windows-latest` für Bau und Tests;
   Playwright und axe laufen auf allen dreien. crosspoint baut nur auf Linux, die
   Bibliothek muss trotzdem auf allen dreien durchlaufen.
7. **Was eine App nicht kann, steht in ihrer README**, nicht in der Bibliothek.
   Keine „falls verfügbar"-Zweige, die niemand testet.

## 11. Risiken

1. **WebKitGTK-Performance bei crosspoint** (60-Hz-Pegel, viele Fader). Gegenmittel:
   `WpCanvas` mit `requestAnimationFrame`, Pegel gebündelt über einen IPC-Kanal,
   Messung als Abnahmekriterium in P3 (nicht „fühlt sich flüssig an").
2. **Umfang hexwerk** (größte Oberfläche). Gegenmittel: P4 zuletzt, Bildschirm für
   Bildschirm, alte GTK-Oberfläche bis zum Schluss lauffähig lassen.
3. **WebView im Flatpak.** Tauri braucht `webkit2gtk-4.1` im Sandkasten. Gegenmittel:
   Manifest früh in P2 auf Bau im Container umstellen (wie hexwerk), nicht auf
   fertige Binaries setzen (wie crosspoint heute).
4. **Zwei Sprachen in einem Repo** (Rust + TS) erhöhen die Einstiegshürde.
   Gegenmittel: `AGENTS.md` mit exakten Befehlen, eine Aufgabe = ein Befehl.
5. **Paketverwaltung privat** (GitHub Packages braucht Token in CI und lokal).
   Gegenmittel: `.npmrc` mit Platzhalter, Token nur über Umgebung.

## 12. Was ersatzlos entfällt

- crosspoint: GTK-Oberfläche, `crates/ui-gtk/src/theme.rs`-Token-Editor, Runtime-Themes,
  `web/index.html` als eigene Farbwelt, `tools/fenster_screenshot.py` (CDP-Client),
  `data/`**und**`packaging/linux/`-Doppelung der `.desktop`-Datei.
- hexwerk: `crates/ui-gtk` samt `theme.css` (1052 Z.), `tools/ux_check.py`,
  `tools/gui_test.py`, `tools/ux_check.sh`.
- wledambilight: `src/theme.rs` (1071 Z. egui-Paletten), `src/i18n.rs` (geht im
  gemeinsamen Sprachmodul auf), `docs/theme-beispiel.json` (Nutzer-Themes).
- alle drei: eigene Screenshot-Werkzeuge, handgepflegte Icon-Sätze ohne Generator,
  `civil_from_days`-Kopien.

## 13. Entschieden am 2026-11-01

1. **Technik (E1):** Web-Frontend, Vue 3 + Tauri 2. Bestätigt.
2. **Repo-Ort:** zuerst lokal unter `~/Dokumente/Projekte/weppelmann-ui`, Push erst nach
   ausdrücklicher Freigabe. Bis dahin keine Remote, keine Veröffentlichung.
3. **Pilot (P2):** wledambilight. Begründung: kleinste Oberfläche, beweist Tray,
   Windows und macOS in einem Durchgang.
4. **Lizenz:** GPL-3.0-**or-later**. Damit ist wledambilight von `-only` auf `-or-later`
   umzustellen (Copyright liegt bei dir, der Wechsel ist eine Zeile plus Datum).
5. **Paketmanager:** npm workspaces.

Noch offen und später zu klären: künftige App-IDs (`de.weppelmann.*` oder
`io.github.smotherer007.*`) und der Ort des privaten Remotes. Beides blockiert P0 nicht.
