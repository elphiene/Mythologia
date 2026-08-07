# Mythologia

> *Τιτᾶνες · Ἥρωες · Νόστοι* — Titans · Heroes · Returns

An interactive, connected map of Greek myth. Every major figure, place and story
is a node; every bloodline, marriage, cause and crossover is a line. Click anyone
to read their story and watch the threads that touch them light up while the rest
fall away.

Styled after Attic vase painting — a dark **red-figure** ground by default, with a
pale **black-figure** mode you can toggle.

## Views

| View | What it shows |
|---|---|
| **Map** | The whole myth-web laid out across seven eras, from *Before the World* to *The Returns*, with connections coloured by kind (blood, marriage, "leads directly to", timeline crossovers). |
| **Family tree** | Every divine and heroic house on one chart — solid lines parent-to-child, dashed gold for marriages, thick crimson for a curse passed down the blood. |
| **Geography** | The figures placed on a map of the ancient Mediterranean, with traceable **routes** (Odysseus's ten years home, Aeneas's flight from Troy, and more). Legendary, unplaceable stops are marked with a dashed ring and an asterisk. |
| **Index** | An alphabetical, filterable list of every entry. |

Plus full-text **search**, era filtering, pan/zoom, and a keyboard-navigable UI.

## Running it

There is no build step and no server required — it is a single self-contained HTML
file with all data, styles and logic inlined.

```bash
# just open it
xdg-open index.html          # Linux
open index.html              # macOS

# …or serve it locally if you prefer
python3 -m http.server 8000  # then visit http://localhost:8000
```

To publish, drop `index.html` on any static host (GitHub Pages, Cloudflare Pages,
Netlify, …).

## Repository layout

```
index.html    the app — the single source of truth
versions/      archived earlier drafts (v0–v5) and the original .jsx source
```

## Editing the content

All the myth data lives in `index.html` as three plain JavaScript arrays near the
top of the `<script>` block:

- **`NODES`** — every figure/place/story (`id`, `name`, `type`, position, and a
  `story` string). Story text supports inline cross-links with `[[id|Display]]`.
- **`EDGES`** — the connections, built with the `e(a, b, t)` helper (`t` is the
  kind): `blood`, `descent`, `union`, `part`, `cause`, `crossover`.
- **`GREEK`** — the Greek-script name shown alongside each entry.

Add a node, wire up its edges, and it appears in every view automatically.

## Credits

Text, data and design by [elphiene](https://github.com/elphiene). Fonts:
[GFS Didot](https://fonts.google.com/specimen/GFS+Didot) and
[Spectral](https://fonts.google.com/specimen/Spectral) via Google Fonts.
