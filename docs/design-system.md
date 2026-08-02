# Design system — My Raid CDs

Portable visual tokens and UI recipes used by this app. Use as:

1. **In-repo reference** when adding panels, forms, and surfaces
2. **Import seed** for another project (`docs/design-tokens.json` + this file)
3. **Cross-project alignment** — keep core tokens stable; extend domain layers per app

**Source of truth (code):**

| Layer | Path |
| --- | --- |
| MUI theme | `src/theme/create-app-theme.ts` |
| Tooltip surfaces | `src/theme/tooltip-surface.ts` |
| CSS variables + scrollbars | `src/index.css` |
| App shell spacing | `src/App.css` |
| Color mode sync | `src/contexts/color-mode-provider.tsx`, `src/hooks/color-mode.ts` |
| Machine tokens | `docs/design-tokens.json` |

When tokens change in code, update this doc and `design-tokens.json` in the same change.

---

## Visual direction

- **Base:** Slate neutrals (Tailwind slate scale), not pure grey
- **Brand / primary:** Blue (`#2563eb` light → `#60a5fa` dark)
- **Accent / secondary:** Teal (`#0f766e` light → `#2dd4bf` dark)
- **Surfaces:** Soft paper cards with `1px` divider borders and light elevation; no heavy multi-layer shadows
- **Radii:** Soft but not pill-heavy — global `10px`, controls often `8px`
- **Type:** System UI stack; buttons **no** uppercase (`textTransform: none`)
- **Atmosphere:** Fixed radial gradients on `body` (primary + secondary tint), subtle

Avoid defaulting new work to purple-on-white gradients, cream/serif “AI landing” looks, or glow-heavy dark chrome unless the product explicitly needs them.

---

## Color mode

- Attribute: `document.documentElement.dataset.colorMode` = `light` | `dark`
- CSS: `:root` / `:root[data-color-mode="dark"]` in `index.css`
- Storage key: `my-raid-cds-color-mode`
- Theme-color meta: light `#f1f5f9`, dark `#0f172a`

CSS variables mirror the MUI palette so non-MUI markup stays in sync.

---

## Core palette

### Light

| Role | Hex | CSS var | MUI |
| --- | --- | --- | --- |
| Text | `#0f172a` | `--text` | `text.primary` |
| Text muted | `#64748b` | `--text-muted` | `text.secondary` |
| Page background | `#f1f5f9` | `--page-bg` | `background.default` |
| Surface / paper | `#ffffff` | `--surface` | `background.paper` |
| Border / divider | `#e2e8f0` | `--border` | `divider` |
| Primary | `#2563eb` | `--link` | `primary.main` |
| Primary dark / hover | `#1d4ed8` | `--link-hover` | `primary.dark` |
| Primary light | `#60a5fa` | — | `primary.light` |
| Secondary | `#0f766e` | — | `secondary.main` |
| Secondary light / dark | `#14b8a6` / `#0d5c56` | — | `secondary.light` / `.dark` |
| Info (ilvl hints) | `#0284c7` | — | `info.main` |
| Warning (BiS hints) | `#d97706` | — | `warning.main` |
| Hover border (inputs) | `#cbd5e1` | — | hard-coded in theme |
| Scrollbar thumb | `#cbd5e1` → hover `#94a3b8` | `--scrollbar-thumb*` | — |

Action:

- `hover`: `alpha(#0f172a, 0.04)`
- `selected`: `alpha(#2563eb, 0.08)`

### Dark

| Role | Hex | CSS var | MUI |
| --- | --- | --- | --- |
| Text | `#f8fafc` | `--text` | `text.primary` |
| Text muted | `#94a3b8` | `--text-muted` | `text.secondary` |
| Page background | `#0f172a` | `--page-bg` | `background.default` |
| Surface / paper | `#1e293b` | `--surface` | `background.paper` |
| Border / divider | `#334155` | `--border` | `divider` |
| Primary | `#60a5fa` | `--link` | `primary.main` |
| Primary light / dark | `#93c5fd` / `#2563eb` | `--link-hover` = light | |
| Secondary | `#2dd4bf` | — | `secondary.main` |
| Info | `#38bdf8` | — | `info.main` |
| Warning | `#f59e0b` | — | `warning.main` |
| Hover border (inputs) | `#475569` | — | hard-coded |
| Scrollbar thumb | `#475569` → hover `#64748b` | `--scrollbar-thumb*` | — |

Action:

- `hover`: `alpha(#f8fafc, 0.06)`
- `selected`: `alpha(#60a5fa, 0.16)`

### Page atmosphere (CssBaseline `body`)

- Light: radial blue `rgba(37, 99, 235, 0.07)` + teal `rgba(15, 118, 110, 0.05)`, `backgroundAttachment: fixed`
- Dark: radial blue `rgba(96, 165, 250, 0.12)` + teal `rgba(45, 212, 191, 0.08)`, fixed

---

## Shape & radius

| Token | Value (px) | Usage |
| --- | --- | --- |
| `shape.borderRadius` | `10` | Global MUI shape; tables, menus, alerts |
| Control | `8` | Buttons, icon buttons, tooltips |
| Dialog | `12` | Dialog paper |
| Filter / step card | `8` (`borderRadius: 1` in theme spacing ≈ 8px) | `ExportFilterSection` |
| Scrollbar thumb | `999` (pill) | WebKit thumb only |

MUI `borderRadius: 1` in `sx` = **8px** when theme spacing is 8.

---

## Borders

Default chrome:

```text
border: 1px solid <divider>
```

| Surface | Border | Notes |
| --- | --- | --- |
| Outlined `Paper` | `divider` | Toolbar panels (`TrackerToolbarPanel`) |
| Step / filter card | `border: 1`, `borderColor: "divider"`, `borderRadius: 1` | `ExportFilterSection` |
| Table container | `1px solid divider` | + paper fill + soft shadow |
| Dialog paper | `1px solid divider` | radius 12 |
| Menu paper | `1px solid divider` | radius 10 |
| Outlined button | `divider`; hover `#cbd5e1` / `#475569` | translucent paper fill |
| Outlined input hover outline | same hover border colors | soft paper fill behind field |
| Intro / panel cards | `border: 1`, `borderColor: "divider"`, `borderRadius: 1` | matches filter cards |

Do **not** invent a second border color for generic chrome — use `divider` / `--border`.

---

## Elevation / shadows

Keep shadows soft and slate-tinted (light) or black (dark).

| Token | Light | Dark |
| --- | --- | --- |
| Card / outlined paper / table | `0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)` | `0 1px 2px rgba(0, 0, 0, 0.35)` |
| Menu | `0 8px 24px rgba(15, 23, 42, 0.12)` | `0 8px 24px rgba(0, 0, 0, 0.45)` |
| Tooltip | MUI `shadows[8]` | MUI `shadows[12]` |
| Paper default | `backgroundImage: none` | (no gradient overlay on elevation) |

---

## Typography

```text
system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif
```

| Style | Rules |
| --- | --- |
| Button | `textTransform: none`, `fontWeight: 600`, `letterSpacing: 0` |
| `h6` | `fontWeight: 700`, `letterSpacing: -0.02em` |
| `subtitle1` | `fontWeight: 600`, `letterSpacing: -0.01em` |
| Step title | `body2`, `fontWeight: 600`; step index `text.secondary`, `fontWeight: 700` |
| Step description | `caption`, `text.secondary`, `lineHeight: 1.35` |
| Panel title | `subtitle1`, `fontWeight: 700`, `lineHeight: 1.3` |

---

## Forms & stepped panels

### Recipes

1. **Toolbar shell** — `Paper variant="outlined"`, padding `{ xs: 1.5, sm: 2 }`, header row = title + close (`TrackerToolbarPanel`). Prefer **no** panel-level layout blurb; put help on steps.
2. **Numbered step** — `ExportFilterSection` with `step`, `title`, optional `titleMark` (`(optional)`), `description`, children. Content overflow often `visible` so selects/autocomplete aren’t clipped.
3. **Field density** — Prefer `size="small"` on TextField / Select / FormControl in add forms.
4. **Stack rhythm** — Outer form / panel stacks use `spacing={1.5}`; fields inside a step often `1`–`1.25`.
5. **Errors** — Field-level `helperText` + `error` when possible; otherwise `FormErrorMessage` under actions.
6. **Actions** — `FormActionsRow` for submit; no Cancel in toolbar forms (close via panel ✕).

### Inputs (theme)

- Outlined input fill: `alpha(paper, 0.8)` light / `0.35` dark
- Hover outline: `#cbd5e1` / `#475569`

### Buttons (theme)

- `disableElevation: true`
- Root radius `8`, padding inline `12`; small: block `4`, inline `10`
- Outlined: divider border + translucent paper; hover uses `action.hover`
- Variant `contained` + `color="inherit"`: black/white alpha fill (quiet secondary actions)

### Icon buttons

- Radius `8`; hover `action.hover`

---

## Scrollbars

Global in `index.css`:

| Token | Value |
| --- | --- |
| Size | `8px` |
| Track | transparent |
| Thumb radius | pill (`999px`) with `2px` transparent border + `background-clip: content-box` |

Hide external WoW tooltips on scroll/mouseleave where item links live inside scroll regions.

---

## App shell spacing

| Token | Value |
| --- | --- |
| Toolbar height | `56px` xs / `64px` sm+ (`--app-toolbar-min-height`) |
| Main padding | top `1.5rem`→`2rem`, x `1.25rem`→`1.75rem`, bottom `2rem` |
| `html` scroll-padding-top | toolbar height |

Panel max widths (app layout, not core brand):

| Panel | Max width |
| --- | --- |
| Narrow (add character / raid) | `480` |
| Data controls | `680` |
| BiS | `1280` |
| Character / Soft pick | `1920` |

---

## Domain overlays (app-specific)

Port only if the target app needs the same semantics.

### Tooltip surface (inverted in light mode)

| Mode | bgcolor | color | muted | border |
| --- | --- | --- | --- | --- |
| Light app | `#27272a` | `#fafafa` | `#d4d4d8` | `#3f3f46` |
| Dark app | `#3f3f46` | `#fafafa` | `#d4d4d8` | `#52525b` |

Item links on tooltip backgrounds always use the **dark** ilvl color set (`TOOLTIP_ITEM_LINK_COLOR_MODE`).

### Gear hint tints

- BiS → `warning.main` alphas (light `0.22 / 0.32 / 0.44`, dark slightly stronger)
- Ilvl upgrades → `info.main` alphas (light `0.18 / 0.28 / 0.4`)

### Item level tier rainbow

WotLK GearScore-style tiers in `src/utils/item-level-tier.ts` (11 colors light + dark). Unknown item purple: light `#7c3aed`, dark `#c084fc`.

Item links: weight `600`, dotted underline → solid on hover.

---

## Porting checklist

**Core (reuse across projects)**

1. Copy palette + CSS variables from `design-tokens.json` / this doc
2. Port `createAppTheme` structure (palette, shape, CssBaseline gradients, Button / Paper / Table / Dialog / Tooltip / OutlinedInput / Menu overrides)
3. Wire `data-color-mode` + matching CSS vars before paint
4. Keep border recipe: `1px solid divider`, radii 8/10/12 as above
5. Prefer stepped `ExportFilterSection`-style cards for multi-field workflows

**Optional**

- Scrollbar CSS block from `index.css`
- Tooltip inversion helper
- Domain colors (ilvl tiers, hint alphas) only when needed

**Do not port blindly**

- Raid/BiS/export layout constants
- WoW item link / emblem assets
- Storage keys prefixed `my-raid-cds-*` (rename per app)

---

## Consistency rules for agents & humans

1. New chrome surfaces → outlined paper or `border + divider + borderRadius 1`, not ad-hoc hex borders
2. New semantic color → map to `primary` / `secondary` / `info` / `warning` / `text.*` first
3. Forms in toolbar → numbered steps + short helper caption; avoid duplicating the same hint in the panel header
4. Prefer theme tokens over one-off hex in components (except documented domain palettes)
5. When bumping tokens, update **code + this doc + `design-tokens.json`**
