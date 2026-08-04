# Design system — My Raid CDs

Portable visual tokens and UI recipes used by this app. Use as:

1. **In-repo reference** when adding panels, forms, and surfaces
2. **Import seed** for another project (`docs/design/design-tokens.json` + this file)
3. **Cross-project alignment** — keep core tokens stable; extend domain layers per app

**Source of truth (code):**

| Layer | Path |
| --- | --- |
| MUI theme | `src/theme/create-app-theme.ts` (`appThemeTokens`) |
| Quiet / spot links | `src/theme/links.css` |
| Tooltip surfaces | `src/theme/tooltip-surface.ts` |
| CSS variables + scrollbars | `src/index.css` |
| App shell spacing | `src/App.css` |
| Color mode sync | `src/contexts/color-mode-provider.tsx`, `src/hooks/color-mode.ts` |
| Machine tokens | `docs/design/design-tokens.json` |

When tokens change in code, update this doc and `design-tokens.json` in the same change.

---

## Visual direction

| Trait | Rule |
| --- | --- |
| Chrome | Quiet MUJI neutrals — warm paper (`#fcfbf9` / `#1a1a1a`), not slate-blue fog |
| Brand | Burnt orange (Signal energy) — identity only, **not** primary CTAs |
| Primary CTAs | Inverse ink (`#0a0a0a` on light / `#fafafa` on dark) |
| Ok / Danger | Forest/mint green · true red — never reuse brand orange |
| Surfaces | Soft card shadow + modest radii (`10` / `8`) |
| Type | Onest display · Noto Sans body · JetBrains Mono chips/meta (Cyrillic + Latin) |

**Avoid:** Facebook/SaaS blue as brand; pink/magenta identity; brand≈danger or brand≈ok pairs; Latin-only display fonts (Syne, Space Grotesk) as sole UI fonts.

---

## Color mode

- Attribute: `document.documentElement.dataset.colorMode` = `light` | `dark`
- CSS: `:root` / `:root[data-color-mode="dark"]` in `index.css`
- Storage key: `my-raid-cds-color-mode`
- Theme-color meta: light `#fcfbf9`, dark `#1a1a1a`
- Default for new ports: `light`

CSS variables mirror the MUI palette so non-MUI markup stays in sync.

---

## Core palette

### Light

| Role | Hex | CSS var | MUI |
| --- | --- | --- | --- |
| Page background | `#fcfbf9` | `--bg` / `--page-bg` | `background.default` |
| Surface / paper | `#ffffff` | `--surface` | `background.paper` |
| Chip / inset | `#f3f2ef` | `--chip-bg` | — |
| Sticky header | `rgba(252, 251, 249, 0.96)` | `--header-bg` | AppBar |
| Border | `#8a8a8a` | `--border` | `divider` |
| Text | `#141414` | `--text` | `text.primary` |
| Text strong | `#0a0a0a` | `--text-strong` | — |
| Text muted | `#555555` | `--text-muted` | `text.secondary` |
| Brand | `#9a3412` | `--brand` | `secondary.main` |
| Brand soft / border | `#fff7ed` / `#c2410c` | `--brand-soft` / `--brand-border` | — |
| Ok | `#166534` | `--ok` | `success.main` |
| Danger | `#dc2626` | `--danger` | `error.main` |
| Link (quiet) | `#2c5282` | `--link` | — |
| Link spot | `#9a3412` | `--link-spot` | — |
| Primary bg / fg | `#0a0a0a` / `#ffffff` | `--primary-bg` / `--primary-fg` | `primary.main` / contrast |
| Shadow | `0 6px 18px rgba(0, 0, 0, 0.07)` | `--shadow` | card / paper outlined |
| Info (ilvl hints) | `#0284c7` | — | `info.main` (domain) |
| Warning (BiS hints) | `#d97706` | — | `warning.main` (domain) |
| Scrollbar thumb | `#c4c4c0` → hover `#8a8a8a` | `--scrollbar-thumb*` | — |

Action:

- `hover`: `alpha(#141414, 0.04)`
- `selected`: `alpha(#9a3412, 0.1)`

### Dark

| Role | Hex | CSS var | MUI |
| --- | --- | --- | --- |
| Page background | `#1a1a1a` | `--bg` / `--page-bg` | `background.default` |
| Surface / paper | `#242424` | `--surface` | `background.paper` |
| Chip / inset | `#1f1f1f` | `--chip-bg` | — |
| Sticky header | `rgba(26, 26, 26, 0.96)` | `--header-bg` | AppBar |
| Border | `#8a8a8a` | `--border` | `divider` |
| Text | `#f2f2f2` | `--text` | `text.primary` |
| Text strong | `#fafafa` | `--text-strong` | — |
| Text muted | `#a3a3a3` | `--text-muted` | `text.secondary` |
| Brand | `#fb923c` | `--brand` | `secondary.main` |
| Brand soft / border | `#3d2818` / `#fb923c` | `--brand-soft` / `--brand-border` | — |
| Ok | `#86efac` | `--ok` | `success.main` |
| Danger | `#ff7b72` | `--danger` | `error.main` |
| Link (quiet) | `#8ab4c8` | `--link` | — |
| Link spot | `#fb923c` | `--link-spot` | — |
| Primary bg / fg | `#fafafa` / `#111111` | `--primary-bg` / `--primary-fg` | `primary.main` / contrast |
| Shadow | `0 8px 24px rgba(0, 0, 0, 0.4)` | `--shadow` | card / paper outlined |
| Info | `#38bdf8` | — | `info.main` |
| Warning | `#f59e0b` | — | `warning.main` |
| Scrollbar thumb | `#555555` → hover `#8a8a8a` | `--scrollbar-thumb*` | — |

Action:

- `hover`: `alpha(#f2f2f2, 0.06)`
- `selected`: `alpha(#fb923c, 0.18)`

### Page atmosphere (CssBaseline `body`)

Warm brand-soft radials (not SaaS blue/teal):

- Light: `rgba(154, 52, 18, 0.06)` + `rgba(194, 65, 12, 0.04)`, `backgroundAttachment: fixed`
- Dark: `rgba(251, 146, 60, 0.1)` + `rgba(61, 40, 24, 0.45)`, fixed

---

## Shape & radius

| Token | Value | Usage |
| --- | --- | --- |
| `--radius` / `shape.borderRadius` | `10px` | Global MUI shape; tables, menus, alerts |
| `--control-radius` / control | `8px` | Buttons, icon buttons, tooltips |
| Dialog | `12px` | Dialog paper |
| Filter / step card | `8px` (`borderRadius: 1`) | `ExportFilterSection` |
| Inline mention chip | `8px` | Intro feature chips |
| Game / slot icon thumb | `4px` | Class, spec, raid, gear-slot thumbs |
| Scrollbar thumb | `999` (pill) | WebKit thumb only |
| `--gap` / `--pad` | `0.55rem` / `0.65rem` | Density reference |

MUI `borderRadius: 1` in `sx` = **8px** when theme spacing is 8.

---

## Borders

Interactive chrome uses border `#8a8a8a` (≥ ~3:1 vs page bg):

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
| Outlined button | `divider`; hover `#6b6b6b` / `#a3a3a3` | translucent paper fill |
| Outlined input hover outline | same hover border colors | soft paper fill behind field |
| Intro / panel cards | `border: 1`, `borderColor: "divider"`, `borderRadius: 1` | matches filter cards |

Do **not** invent a second border color for generic chrome — use `divider` / `--border`.

---

## Elevation / shadows

| Token | Light | Dark |
| --- | --- | --- |
| Card / outlined paper / table | `0 6px 18px rgba(0, 0, 0, 0.07)` | `0 8px 24px rgba(0, 0, 0, 0.4)` |
| Inline mention (micro) | `0 1px 1px rgba(0, 0, 0, 0.04)` | `0 1px 1px rgba(0, 0, 0, 0.25)` |
| Menu | `0 8px 24px rgba(0, 0, 0, 0.12)` | `0 8px 24px rgba(0, 0, 0, 0.45)` |
| Tooltip | MUI `shadows[8]` | MUI `shadows[12]` |
| Paper default | `backgroundImage: none` | (no gradient overlay on elevation) |
| Sticky column edge | `1px 0 0 color-mix(…, var(--border) 40%)` | (table pin separator; layout-only) |

---

## Typography

| Role | Stack |
| --- | --- |
| Body | `'Noto Sans', system-ui, sans-serif` |
| Display | `'Onest', 'Noto Sans', system-ui, sans-serif` |
| Mono | `'JetBrains Mono', 'IBM Plex Mono', monospace` |

Fonts loaded from Google Fonts in `index.html` (Cyrillic + Latin).

| Style | Rules |
| --- | --- |
| Brand wordmark | Display stack, weight **700**, color `--brand` |
| Button | `textTransform: none`, `fontWeight: 600`, `letterSpacing: 0` |
| `h6` / `subtitle1` | Display stack; `h6` weight 700 |
| Body prose | line-height ~**1.55** |
| Version / meta | Mono stack |

---

## Links (two kinds)

| Kind | When | Visual |
| --- | --- | --- |
| **Quiet** (`a` / `--link`) | Informational, secondary | Slate ≠ body text; weight 500; **1px** underline; offset ~3px |
| **Spot** (`a.link-spot` / `--link-spot`) | Must be found in prose | Brand; Onest; **bold + italic**; **2px** underline |

Implemented in `src/theme/links.css`. Hover may intensify toward brand; do not turn quiet links into full spot styling on hover alone.

---

## Forms & stepped panels

### Recipes

1. **Toolbar shell** — `Paper variant="outlined"`, padding `{ xs: 1.5, sm: 2 }`, header row = title + close (`TrackerToolbarPanel`). Prefer **no** panel-level layout blurb; put help on steps.
2. **Numbered step** — Always use `ExportFilterSection` (`step`, `title`, optional `titleMark` / `description`). Do not add a second step-chrome component. Header chrome: **brand** title (Onest), brand soft step badge, **3px brand left edge** on the block.
3. **Field density** — Prefer `size="small"` on TextField / Select / FormControl in add forms.
4. **Stack rhythm** — Outer form / panel stacks use `spacing={1.5}`; fields inside a step often `1`–`1.25`.
5. **Errors** — Field-level `helperText` + `error` when possible; otherwise `FormErrorMessage` under actions.
6. **Actions** — `FormActionsRow` for submit (contained **primary** = ink); no Cancel in toolbar forms (close via panel ✕).
7. **Edit dialogs** — Character / raid edit dialogs stay as flat field stacks. Still use theme inputs, `divider` borders, and dialog paper chrome from the theme.

### Inputs (theme)

- Outlined input fill: `alpha(paper, 0.8)` light / `0.35` dark
- Hover outline: `#6b6b6b` / `#a3a3a3`
- **Switch** — off: quiet chip/surface track; on (light): solid `--ok` + mint thumb with ring; on (dark): softer translucent ok track + mid-green thumb, no glow ring (avoids hard cut-off)

### Buttons (theme)

- `disableElevation: true`
- Root radius `8`, padding inline `12`; small: block `4`, inline `10`
- **Contained primary** — inverse ink fill/border (never brand)
- **Contained secondary** — brand fill (identity / template spotlight only)
- Outlined: divider border + translucent paper; hover uses stronger ink/white alpha fill (not tiny `action.hover`)
- Variant `contained` + `color="inherit"`: brand-tinted fill/border for active toolbar panels; hover deepens brand alpha

### Icon buttons

- Radius `8`; hover `action.hover`

### Status / chips

- Ok → `success` / `--ok*`
- Danger → `error` / `--danger*`
- Brand chip → brand border/text on `--brand-soft` fill (intro template mention)

### Class-colored names

- Chip style via `characterNameDisplaySx` / `classColorChipSx`: **background = WoW class hex darkened ~22%** (`CLASS_CHIP_BG_BRIGHTNESS` 0.78), radius `4px`
- **Foreground** = accessible ink (`#0a0a0a` or `#fafafa`) — whichever has higher WCAG contrast vs the darkened fill
- Same treatment in light and dark mode
- Display names capitalize the first letter (`formatCharacterDisplayName`)

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

Port only if the target app needs the same semantics. Keep separate from core chrome.

### Status semantics (domain exception)

- BiS / ready → **ok** green (`success`)
- Defect → **danger** red (`error`)
- Missing BiS gear hints → **warning** amber (not brand orange)
- Ilvl upgrade hints → **info** blue (not brand)

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

### Completion progress

UI: MUI determinate `LinearProgress` only (`CompletionCountChip` in `dungeon-cells.tsx`); `completed/total` appears in a hover tooltip (and `aria-label`). Bar color from `src/utils/completion-chip-color.ts`: muted → `error` → `warning` → `secondary` (brand) → `info` → `success` (ok). **Light** uses darker/dimmer stops; **dark** keeps full palette brightness. Quiet gray track behind the fill. Documented in `design-tokens.json` → `domain.completionChips`.

---

## Porting checklist

**Core (reuse across projects)**

1. Copy tokens from `design-tokens.json`
2. Port `createAppTheme` structure (palette: primary=ink, secondary=brand, success=ok, error=danger; fonts; CssBaseline atmosphere; Button / Paper / Table / Dialog / Tooltip / OutlinedInput / Menu / Switch)
3. Wire `data-color-mode` + matching CSS vars before paint
4. Load Noto Sans + Onest + JetBrains Mono (Cyrillic + Latin)
5. Implement quiet vs `.link-spot` links (`links.css`)
6. Keep border `#8a8a8a`, radii 8/10/12
7. Prefer stepped `ExportFilterSection`-style cards for multi-field workflows (brand title, step badge, 3px brand left edge)
8. Contrast-check text / muted / brand / ok / danger / link / link-spot / border
9. Port class-color chips (`character-display.ts`) and completion chip fills (`completion-chip-color.ts`) when the product needs them

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
2. Primary CTAs → `color="primary"` (ink). Brand identity → `secondary` or `--brand*`. Never fill primary with brand orange
3. Ok / danger / brand must stay visually separable in both modes
4. New semantic color → map to `primary` / `secondary` / `success` / `error` / `info` / `warning` / `text.*` first
5. Forms in toolbar → numbered steps + short helper caption; avoid duplicating the same hint in the panel header
6. Prefer theme tokens over one-off hex in components (except documented domain palettes)
7. When bumping tokens, update **code + this doc + `design-tokens.json`**
