# Toolbar panel background variants

Exploration set for the patterned chrome inside `TrackerToolbarPanel`
(Character pick, Soft pick, BiS, forms, Data). Step cards
(`ExportFilterSection`) stay **solid plane fill**; only the panel shell shows
the pattern.

**Browse locally:** open [`index.html`](./index.html) in a browser. Use the
light/dark toggle to check both modes.

## In app today

| Piece | Role |
|-------|------|
| `--panel-bg-dot` / `--panel-bg-dot-size` | `src/index.css` |
| Dot grid on `TrackerToolbarPanel` Paper | `src/components/tracker-toolbar-panel/index.tsx` |
| Solid `bgcolor` on step blocks | `src/components/export-panel/export-filter-section.tsx` |

Current shipping choice: **F — Dot grid** (`12px` pin dots).

## Variants in the gallery

| ID | Idea |
|----|------|
| **A** `none` | Control — no pattern |
| **B** `stage-14` | Diagonal hatch 14px |
| **C** `stage-10` | Finer hatch |
| **D** `stage-20` | Coarser hatch |
| **E** `stage-strong` | Same hatch, stronger contrast |
| **F** `dots` | Dot grid (current) |
| **G** `grid` | Square graph lines |
| **H** `lines` | Soft diagonal stripes |
| **I** `brand-wash` | Brand radials only |
| **J** `stage-plus-wash` | Hatch + brand wash |
| **K** `checker` | Offset checker weave |

When you pick one, update the CSS vars / panel shell to match that variant’s
rules from `index.html`.
