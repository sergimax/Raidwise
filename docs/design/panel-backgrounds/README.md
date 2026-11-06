# Toolbar panel background variants

Gallery of background patterns for `TrackerToolbarPanel`
(Character pick, Soft pick, BiS, forms, Data). In these proposals, the pattern
is applied to the panel shell and the `FilterSection` blocks retain a solid fill.

**Browse locally:** open [`index.html`](./index.html) in a browser. Use the
light/dark toggle to check both modes.

## In app today

| Piece | Role |
|-------|------|
| `--dot-grid` / `--dot-grid-size` | `src/index.css` |
| Page dot grid (`body::before`, rotated 45°) | CssBaseline in `src/theme/create-app-theme.ts` |
| Opaque toolbar panel with 3px corners | `src/components/tracker-toolbar-panel/index.tsx` |
| Section rails and borders | `src/components/filter-unit/filter-section.tsx` |

The app uses the refined direction **S** from the [app background gallery](../app-backgrounds/).
The rotated 12px dot grid sits behind the opaque panels.

## Variants in the gallery

| ID | Idea |
|----|------|
| **A** `none` | Control — no pattern |
| **B** `stage-14` | Diagonal hatch 14px |
| **C** `stage-10` | Finer hatch |
| **D** `stage-20` | Coarser hatch |
| **E** `stage-strong` | Same hatch, stronger contrast |
| **F** `dots` | Dot grid (previous panel treatment) |
| **G** `grid` | Square graph lines |
| **H** `lines` | Soft diagonal stripes |
| **I** `brand-wash` | Brand radials only |
| **J** `stage-plus-wash` | Hatch + brand wash |
| **K** `checker` | Offset checker weave |
