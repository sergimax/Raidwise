# Toolbar panel background variants

Exploration set for the patterned chrome inside `TrackerToolbarPanel`
(Character pick, Soft pick, BiS, forms, Data). Step cards
(`FilterSection`) stay **solid plane fill**; only the panel shell shows
the pattern.

**Browse locally:** open [`index.html`](./index.html) in a browser. Use the
light/dark toggle to check both modes.

## In app today

| Piece | Role |
|-------|------|
| `--dot-grid` / `--dot-grid-size` | `src/index.css` (page + panels) |
| Dot grid on page (`body::before`, rotated 45°) | `src/index.css` + CssBaseline in `create-app-theme.ts` |
| Dot grid on `TrackerToolbarPanel` (upright) | `src/components/tracker-toolbar-panel/index.tsx` |
| Solid `bgcolor` on step blocks | `src/components/filter-unit/filter-section.tsx` |

Current shipping choice: **F — Dot grid** (`12px` pin dots) on page chrome and toolbar panels.

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
