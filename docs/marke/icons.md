# Marken-Zeichen (App-Icons)

Regelwerk für alle Anwendungen aus dem Haus. Ziel: drei Programme, ein
Wiedererkennen — man sieht am Rand des Docks, dass sie zusammengehören, ohne
dass sie gleich aussehen.

## Der Befund, aus dem die Regeln kommen

Die drei vorhandenen Zeichen hatten nichts gemeinsam: Hexwerk war ein grünes
Sechseck mit H auf transparentem Grund, WLED Ambilight eine abgerundete Kachel
mit Verläufen, Farbglühen und Schatten, Crosspoint eine Kachel mit einem
Balkendiagramm samt Achsen, Zahlen und Legende. Drei Grundformen, drei
Detailgrad, keine gemeinsame Farbe.

## Regeln

1. **Zeichen, keine Kachel.** Kein Hintergrund, kein Verlauf, kein Schatten,
   keine Fase. Das Zeichen steht auf dem Untergrund, den der Desktop vorgibt —
   es muss auf hellen wie auf dunklen Leisten funktionieren.
2. **Eine gemeinsame Kontur.** Alle Zeichen sitzen in derselben Sechseck-Kontur.
   Das ist die Marke: gleicher Rahmen, gleiche Strichstärke, gleicher Rand.
3. **Ein Zeichen im Inneren, höchstens drei Striche.** Buchstabe oder Sinnbild,
   das die Aufgabe in einem Wort sagt. Keine Diagramme, keine Achsen, keine
   Zahlen, keine Legenden — das ist bei 16 px ohnehin nicht lesbar.
4. **Zwei Farben.** Kontur in Amber `#F2A63B` (die Markenfarbe). Innenzeichen in
   einer Signalfarbe der Palette — eine je Anwendung.
5. **Maße.** Raster 512 × 512, Kontur-Rand 29 px (5,7 %), Strichstärke Kontur
   28, Innenzeichen 44. Strich-Enden eckig (`butt`/`miter`) — die Oberflächen
   der Bibliotheken sind auch eckig.
6. **Was klein noch trägt.** Bei 16 und 24 px bleibt Kontur plus **eine** Form
   übrig; das Innenzeichen wird dann gefüllt gezeichnet, nicht gestrichelt.
   Gemessen: bei 16 px verschmolzen Bildschirm und Leiste von WLED Ambilight zu
   einem Fleck — zwei Formen auf 16 px sind eine zu viel. Das Innenzeichen wird
   für diese Größe vereinfacht (nur der Bildschirm, Strichstärke 52).
7. **Symbolstil.** Für Leisten und Fenstertitel: dieselbe Form, gefüllt, in
   `currentColor`. Gefüllt, weil Umfärbung mit Füllungen arbeitet (bei Hexwerk
   hat sich gezeigt: ein gestrichenes Zeichen wird beim Umfärben zum Block).

## Farbzuordnung

| Anwendung | Kontur | Innenzeichen | Warum |
|---|---|---|---|
| Hexwerk | `#F2A63B` | `#86B26A` | Grün steht für „verwaltet, in Ordnung" |
| WLED Ambilight | `#F2A63B` | `#D9614A` | Rot ist die Farbe des Lichts am Rand |
| Crosspoint | `#F2A63B` | `#E9E5DC` | Neutral, weil Audio keine Signalfarbe hat |

Alle Werte stammen aus `packages/tokens/src/primitives.tokens.json`.

## Ablage je Anwendung

```
assets/icon.svg                 Quelle, 512 × 512
assets/icons/icon-<n>.png       16, 24, 32, 48, 64, 128, 256, 512, 1024
assets/icons/tray-<n>.rgba      Tray, monochrom
data/icons/hicolor/…/apps/*.png Linux-Installation
data/icons/symbolic/…/*.svg     Symbolstil, currentColor
```

## Beispiel

`beispiele/` enthält die drei Zeichen in diesem Stil als SVG. Sie sind Vorschlag,
nicht Beschluss: Kontur und Maße stehen, die Innenzeichen sind austauschbar.
