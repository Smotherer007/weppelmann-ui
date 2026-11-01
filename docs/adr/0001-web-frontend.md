# 0001 — Frontend als Web-Anwendung (Vue 3 + Tauri)

Datum: 2026-11-01 · Status: angenommen

## Kontext

Drei Apps mit drei verschiedenen Oberflächentechniken: crosspoint und hexwerk auf GTK4
(libadwaita), wledambilight auf egui, crosspoint zusätzlich mit einer HTML-Steuerschnittstelle
(2547 Zeilen). Eine gemeinsame Komponentenbibliothek ist über zwei Toolkits hinweg nicht
möglich. wledambilight liefert heute für Linux, Windows und macOS.

## Entscheidung

Alle Oberflächen werden Web-Anwendungen (HTML/CSS/TypeScript, Vue 3), ausgeliefert über
Tauri 2. Die Rust-Kerne bleiben unverändert und werden über eine typisierte Befehlsschicht
angebunden.

## Alternativen

| Alternative | Warum verworfen |
|---|---|
| GTK4 überall | wledambilight verlöre Windows und macOS; Styleguide und Frontend-Tests blieben Handarbeit über AT-SPI |
| egui überall | Kein CSS, kein Token-System, kein Styleguide-Ökosystem; Listen, Tabellen und Textauswahl würden handgezeichnet |
| Zwei Frontends | Zwei Bibliotheken, zwei Testwege, zwei Theme-Compiler — widerspricht dem Ziel |

## Folgen

- Kosten: crosspoint und hexwerk verlieren ihre GTK-Oberflächen (13.000 Zeilen).
- Gewinn: eine Bibliothek, ein Styleguide, echte Frontend-Tests, Austauschbarkeit der
  Darstellung ohne Neubau der Kerne.
- flatpak: WebView (WebKitGTK) muss im Sandkasten vorhanden sein; Bau im Container
  statt mit fertigem Binary.
