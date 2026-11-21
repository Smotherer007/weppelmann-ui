# markenwerk

Marken-Zeichen aus ASCII-Rastern. Die Quelle ist Text, alles andere wird
erzeugt — SVG, PNG in allen Desktop-Größen, ein monochromes Tray-Bild und der
Symbolstil.

## Warum

Ein Zeichen, das man in einem Editor sehen und zeilenweise ändern kann, wird
auch gepflegt. Und wer die Quelle kennt, kann jede Größe ableiten: neun PNGs,
zwei Tray-Bilder und ein Symbol je Marke von Hand nachzuziehen ist die Art
Arbeit, die irgendwann auseinanderläuft.

## Raster schreiben

Eine Datei `marken/<slug>.pm`:

```
name = Hexwerk
surface = #4F7A2E
ink = #E9E5DC
---
.......##...............
......##................
```

- `name`, `surface`, `ink` sind Pflicht, `shade` optional
- `---` trennt Kopf und Raster
- `.` ist Fläche, `#` ist Zeichnung, `+` ist Schattenfarbe
- das Raster muss **quadratisch** sein, höchstens 64 Zeilen
- Kommentar ist `;` bis Zeilenende — nicht `#`, weil `#` auch Farben beginnt

32 × 32 ist die gute Größe: bei 32 px Anzeige ist es 1:1, und größer wird
sowieso nur noch verdoppelt.

## Befehle

```
node src/cli.ts check           # Raster prüfen
node src/cli.ts render          # alle Marken -> dist/<slug>/
node src/cli.ts render hexwerk  # eine Marke
node src/cli.ts logo sprechwerk # Logo: Zeichen + Wortmarke, hell und dunkel
node src/cli.ts sheet           # Kontaktbogen -> dist/kontaktbogen.svg
npm test                        # Tests (Format, PNG, Rendern, Schrift, Logo)
```

## Was erzeugt wird

| Datei | Zweck |
|---|---|
| `icon.svg` | Quelle, 512 px, `crispEdges` |
| `icon-<n>.png` | 16, 24, 32, 48, 64, 128, 256, 512, 1024 |
| `tray-32.png`, `tray-64.png` | nur die Zeichnung, weiß, Fläche durchsichtig |
| `symbolic.svg` | nur die Zeichnung, `currentColor`, ohne Fläche |
| `logo-dark.svg`, `logo-light.svg` | Zeichen + Wortmarke (nur mit `logo`) |

Verkleinert wird mit Mehrheitsentscheid, nicht durch Weglassen — sonst
verschluckt 16 px ganze Striche. Vergrößert wird ohne Glättung.

## Wortmarke

Das Logo setzt Zeichen und Wortmarke zusammen (`src/logo.ts`). Die Buchstaben
stehen als Raster in `src/schrift.ts` — 7 × 10 Zellen, Strich 2 px, das W ist
mit 12 Zellen breiter. Zehn Zeilen, weil der Strich dann ein Fünftel der Höhe
ist; bei acht war er ein Viertel und die Buchstaben standen wie Kästchen da.
Ein SVG mit `<text>` wäre kürzer, hinge aber an einer Systemschrift; die Marke
soll überall gleich aussehen. Vorhanden sind nur die Buchstaben, die die
Wortmarke braucht (C E H K P R S W); ein fehlender Buchstabe bricht mit einer
Meldung ab, statt still ein Fragezeichen zu setzen.

Zwei Fassungen: `dark` schreibt die Wortmarke in Knochenweiß `#E9E5DC`,
`light` in der Flächenfarbe der Marke. Die Kachel bleibt gleich.

## Ohne Abhängigkeit

Der PNG-Encoder steht in `src/png.ts` (Signatur, IHDR, IDAT, IEND über `zlib`).
Eine Bibliothek für ein Bild aus Rechtecken wäre eine Abhängigkeit zu viel.
