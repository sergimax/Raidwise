# App background directions

Open [index.html](./index.html) directly in a browser. No server or build is required.
The gallery uses local logo, font and raid artwork assets from `public/`.

Eighteen proposals compare the page background, header, panel shell and inner blocks
using the same illustrative tracker content. Use the theme button to compare
light and dark palettes, and the selector to focus on one proposal.
Preview content is static; the theme button and variant selector are interactive.

| ID | Direction | Main idea |
| --- | --- | --- |
| A | Warm matte (recommended starting point) | Warm neutral layers, solid surfaces, restrained shadows |
| B | Cool slate | Blue-grey layers with orange accents |
| C | Tactical | Muted green-grey layers, grid only behind panels |
| D | Raid atmosphere | Local ICC artwork under a tint, opaque working surfaces |
| E | Almost flat | Shared canvas, section rules, no shell shadows |
| F | Contrast header | Always-dark header above neutral working surfaces |
| G | Graphite and copper | Warm graphite, copper edges and small radii |
| H | Atlas | Olive neutrals, diffuse light and rounder shells |
| I | Flat + dots and glow | E structure, 16 px dots and a warm radial gradient |
| J | Edge dots | Fading side dots and one common working plane |
| K | Header halo | Gradient in the header, accent beside the page title |
| L | Single sheet | Shared surface with a vertical divider and underlined fields |
| M | Section rail | Vertical rules and section markers instead of panel frames |
| N | Work islands | Separate fields and table on a dotted canvas |
| O | Horizon | Horizontal gradient band, open sections and left field edges |
| P | Fading dots | Dots masked to the upper corner, flat fields |
| Q | Tool well | Floating header, inset filters and an open table section |
| R | Contour | Fading contour arcs and rectangular fields |

These are proposals, not shipped theme changes or exact app screenshots.
The existing orange accent is retained in all eighteen directions. On small screens,
panels stack and the example table scrolls within its container.

After choosing a direction, map its surface variables to `src/index.css` and
`src/theme/create-app-theme.ts`, then check real tables, overlays, hover/focus
states and contrast in both themes before shipping.

## Follow-up to direction E

I–R explore the preferred flat structure beyond palette changes: pattern placement,
gradient placement, shared versus separate working surfaces, header framing and
section dividers. I is the closest bridge to the current dots-and-glow background.
Decorative layers are static CSS, with no animation or remote resources.
Tables and working fields retain opaque fills.
