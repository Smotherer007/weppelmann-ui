# Marken-Zeichen (App-Icons)

Regelwerk für alle Anwendungen aus dem Haus. Ziel: drei Programme, ein
Wiedererkennen — man sieht am Rand des Docks, dass sie zusammengehören, ohne
dass sie gleich aussehen.

## Der Befund, aus dem die Regeln kommen

Die drei vorhandenen Zeichen hatten nichts gemeinsam: Hexwerk war ein grünes
Sechseck mit H auf transparentem Grund, WLED Ambilight eine abgerundete Kachel
mit Verläufen, Farbglühen und Schatten, Crosspoint eine Kachel mit einem
Balkendiagramm samt Achsen, Zahlen und Legende. Drei Grundformen, drei
Detailgrade, keine gemeinsame Farbe.

Ein erster Versuch („gleicher Rahmen, anderes Strichsymbol", siehe
`beispiele/`) war zu dünn: eckig, sauber, aber ohne Eigenleben — es sah nach
Piktogramm aus, nicht nach Marke. Was Wiedererkennung erzeugt, ist nicht der
Rahmen, sondern die **Handschrift**: gleiche Fläche, gleiche Strichsprache,
gleicher Detailgrad. Wie bei einer Serie Zeichnungen aus einem Skizzenbuch.

## Stil „Stempel"

1. **Fläche.** Eckige Kachel mit abgeschnittenen Ecken (Chamfer 80 auf 512),
   vollflächig in einer kräftigen Farbe aus der Palette. Kein Radius, kein
   Verlauf, kein Schatten.
2. **Zeichnung.** Darauf eine Strichzeichnung in Knochenweiß `#E9E5DC`, gleiche
   Strichstärke, gleiche Ecken (`butt`/`miter`). Zwei Strichstärken pro Zeichen
   reichen: 18 für die Hauptform, 10–14 für Binnenlinien.
3. **Motiv.** Ein Gegenstand, kein Piktogramm. Er füllt das Feld (Rand ~15 %),
   darf über die Mitte hinausgehen. Das Motiv sagt die Aufgabe, nicht den
   Produktnamen: Wabe für Verwaltung, Bildschirm mit Licht für Ambilight, zwei
   gekreuzte Stecker für Crosspoint.
4. **Farbzuordnung** — eine kräftige Fläche je Anwendung, Rest der Zeichnung
   immer Knochenweiß:

   | Anwendung | Fläche | Motiv |
   |---|---|---|
   | Hexwerk | `#4F7A2E` | Wabe, drei Zellen, Haken („verwaltet") |
   | WLED Ambilight | `#A8321E` | Bildschirm, Licht fällt nach außen |
   | Crosspoint | `#C9862C` | zwei Klinkenstecker, die sich kreuzen |

5. **Kleine Größen.** Bei 16 und 24 px bleibt eine Form plus ein Detail; die
   Binnenlinien entfallen. Gemessen: zwei gleich gewichtete Formen auf 16 px
   verschmelzen zu einem Fleck.
6. **Symbolstil** (Leisten, Fenstertitel): dieselbe Form, gefüllt, `currentColor`,
   ohne Fläche.

## Ablage je Anwendung

```
assets/icon.svg                 Quelle, 512 × 512
assets/icons/icon-<n>.png       16, 24, 32, 48, 64, 128, 256, 512, 1024
assets/icons/tray-<n>.rgba      Tray, monochrom
data/icons/hicolor/…/apps/*.png Linux-Installation
data/icons/symbolic/…/*.svg     Symbolstil, currentColor
```

## Beispiele

- `beispiele-v2/` — der Stil „Stempel", drei Zeichen, maßstäblich
- `beispiele/` — verworfener erster Versuch (gemeinsame Kontur, Strichsymbol),
  bleibt als Vergleich liegen

Die Motive sind Vorschlag, nicht Beschluss. Fläche, Strichsprache und Detailgrad
stehen; gezeichnet wird je Anwendung.

## Die Marke in der App

Die Marke in der Kopfzeile ist **das Icon aus `assets/icon.svg`** der jeweiligen
App, kopiert nach `ui/public/icon.svg` und als `<img>` eingebunden — nie ein
Platzhalter aus der Icon-Bibliothek. Ein Sechseck mit „H" sieht nach Hexwerk aus
und ist es nicht; der Hut ist die Marke. Gilt genauso für Tray und Fenstersymbol.

Das war ein echter Fehler: `WpIcon :icon="IconBrand"` stand in der Kopfzeile,
während der Hut ungenutzt in `assets/` lag.
