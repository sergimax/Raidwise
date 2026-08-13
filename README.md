# My Raid CDs

**English** | [Русский](README.ru.md)

Web app to track raid cooldowns per character and dungeon, with BiS gear hints and raid signup helpers (WotLK-focused).
Data persists locally in `localStorage`.
Live site: [sergimax.ru/my-raid-cds](https://sergimax.ru/my-raid-cds)

![App version](https://img.shields.io/badge/App_version-2.6.0-purple)
![Game version](https://img.shields.io/badge/WoW-3.3.5a-brown)

<img src="./public/logo.svg" width="148" height="148">

## Features

Toolbar panels are mutually exclusive (only one open at a time).

### Characters & dungeons

Add manually (**Add character** / **Add raid**, stepped forms) or load the WotLK raid template when the list is empty.
New character names are letters only; the UI capitalizes the first letter.
Edit specs, WowSims gear, also-owned items (bags / other spec / vendors for hints), and raid metadata later.
Reorder table columns from the edit dialog (`Position: < n >`).
Header **info** toggles a short usage-help intro (three ways to use the app: CDs, gear planning, or BiS-only).

### Cooldown toggles

Mark which character has CD on which raid.
Reset one character from the table header, or everyone from the **Data** panel.

### Table

Sort and search raids (name, size, mode — EN/RU, e.g. `ICC25H` / `ЦЛК25хм`).
Character headers show class-colored names, main/off GS (or `- / -`), and edit / reset / delete.
Complete column uses a progress bar (count on hover).
Compact layout on small screens.
Wide character columns scroll horizontally inside the table (page stays put).

### Data controls

Bulk reset CDs, or delete all characters / dungeons / local BiS lists (with confirm).
When there are no dungeons — **Add raids from template**.

### Character pick for a raid

Copyable signup line of characters still missing CD on filtered raids.
Filters: min GS, role, specs (kept for the browser session when you close or switch panels).
Result line format toggles (**Specs** / **GS**); characters look like `Name Spec gs / Spec gs`, separated by commas.
Click Selected raid chips to exclude false matches from the results (chips stay visible).
Header reset clears the raid search and chip exclusions.

### Soft pick for a raid

Soft reserves for one character + spec on BiS upgrades from filtered raids (active list from **BiS builds**).
Session-only (character, rules, softs, and raid exclusions survive closing the panel).
Competition colors and win-odds hints help pick softs; reset one row or the whole Soft targets list.
Pasteable call list can include/hide the character name and boss details.
Gear on the other spec counts as already owned for Soft targets and table hints.
Same clickable raid chips to exclude rows (softs for items that drop off the list are cleared); header reset for search/exclusions.
Layout wraps Soft targets / the copy block onto their own rows when the panel is too narrow.

### BiS builds

Built-in presets per spec (Kingdom with slot variants first, then Titans/community); local copies are editable and used for gear-choice hints.
Class/spec choice stays for the browser session when you leave the panel; preset selection is already saved in BiS storage.
Slot layout matches the in-game paper doll; alternative items stack under the primary choice.
Custom lists support clear-slot / clear-all; Items shows the active list name and scrolls with Lists within fixed height budgets.

### Gear hints

CD cells:
- <span style="color:#d97706">amber</span> — missing BiS
- <span style="color:#0284c7">blue</span> — ilvl upgrade

Tooltips group loot by boss.
Also-owned items (edit character) count as available for BiS/ilvl hints without being on the WowSims export.

### EN / RU

Full UI and item tooltips.
First visit defaults to Russian.

### Theme

Light/dark mode, saved locally (palette, typography, and link styles).
Header links to GitHub and [sergimax.ru](https://sergimax.ru).
Design tokens / recipes: [docs/design/design-system.md](docs/design/design-system.md).

## Development

![Lighthouse Performance](https://img.shields.io/badge/Performance-93-%230cce6b?logo=lighthouse&logoColor=white)
![Lighthouse Accessibility](https://img.shields.io/badge/Accessibility-98-%230cce6b?logo=lighthouse&logoColor=white)
![Lighthouse Best Practices](https://img.shields.io/badge/Best_Practices-100-%230cce6b?logo=lighthouse&logoColor=white)
![Lighthouse SEO](https://img.shields.io/badge/SEO-100-%230cce6b?logo=lighthouse&logoColor=white)

**Stack:**
React 19, TypeScript, Vite, MUI, Vitest + Testing Library.

**CI:**
Locally, `npm run ci` runs lint + tests + build.
On push/PR to `main`, GitHub Actions runs **Lint**, **Test**, and **Build** in parallel, then **Release files** (validates that `package.json` was bumped and CHANGELOG / README badges / lockfile match — does not bump versions itself) (`.github/workflows/ci.yml`); pushes to `main` also upload a `dist` artifact (`.github/workflows/build-artifacts.yml`).

**Layout:**
`src/components/` (UI), `src/hooks/` (domain + overlay panels), `src/utils/`, `src/data/` (WoW bundles + BiS presets), `src/storage/`. Tests are colocated as `*.test.ts(x)`.

**Performance:**
WoW item JSON is code-split and loaded after the app shell (`WowDataProvider` / `ensure-wow-data`); fonts are self-hosted under `public/fonts/`; class/spec icons are 32×32 WebP; item tooltip scripts load on first item-link interaction for the active locale only.

Contributor/agent conventions: [`.cursor/rules/project-rules.mdc`](.cursor/rules/project-rules.mdc).

**Planned features:**
[docs/roadmap.md](docs/roadmap.md).

### Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run test` / `npm run test:run` | Vitest (watch / single run) |
| `npm run ci` | Lint + test:run + build (pre-push checks) |
| `npm run build:wow-data` | Regenerate bundled WoW JSON from `scripts/wow-data/wowsims-db.json` (includes VoA tier loot derived from tier set metadata when WowSims omits zone 4603) |
| `npm run generate:bis-presets` | Regenerate built-in BiS presets from `scripts/bis/bis-list-sources.md` + `scripts/bis/bis-list-mix.md` |
| `npm run comment:bis-presets` | Add slot comments to BiS preset files |
| `npm run download:gear-slot-icons` | Regenerate WoW paper-doll slot placeholder PNGs in `src/assets/gear-slot-icons/` |
| `npm run download:fonts` | Regenerate self-hosted Onest / Noto Sans / JetBrains Mono woff2 + `src/fonts.css` |
| `npm run compress:class-icons` | Resize class/spec icons to 32×32 WebP in `src/assets/class-icons/` |
| `npm run lighthouse` | Desktop Lighthouse vs preview/production URL → `docs/lighthouse/` (run `preview` first for local) |
| `npm run lighthouse:mobile` | Same with the mobile preset |

Built-in BiS lists are authored in `scripts/bis/bis-list-sources.md` (Titans + community) and `scripts/bis/bis-list-mix.md` (Kingdom. With variants: numbered weapons + `N-M` slot alternatives).
Regenerate TypeScript presets after editing the markdown.

### Persistence

| Key | Contents |
|-----|----------|
| `my-raid-cds` | Characters, dungeons, toggles (`schemaVersion` 6) |
| `my-raid-cds-bis-lists` | BiS preset selections and local lists (`schemaVersion` 1; malformed entries skipped on load) |
| `my-raid-cds-item-tooltip-locale` | `en` or `ru` (defaults to `ru`) |
| `my-raid-cds-color-mode` | Light/dark preference |
| `my-raid-cds-gear-hint-legend-dismissed` | Dismissed gear-hint legend above the table |

Character names: new names are letters only (Unicode `\p{L}+`); display capitalizes the first letter. Legacy names with digits/symbols still load.

Corrupted tracker data resets with an error alert.
Legacy saves migrate on load.

### Deployment (caching & HTTP)

Vite emits content-hashed files under `assets/` (e.g. `/my-raid-cds/assets/index-….js`). For good Lighthouse cache scores on [sergimax.ru/my-raid-cds](https://sergimax.ru/my-raid-cds):

| Path | Cache-Control | Notes |
|------|---------------|--------|
| `/my-raid-cds/assets/*` | `public, max-age=31536000, immutable` | Filenames change every build |
| `/my-raid-cds/index.html` | `no-cache` or short `max-age` (e.g. 60) | Must revalidate so clients pick up new hashes |
| `/my-raid-cds/fonts/*` | `public, max-age=31536000, immutable` | Self-hosted woff2 |

Also enable **HTTP/2** (or HTTP/3) and **brotli** or **gzip** for JS/CSS/JSON/SVG/woff2.

Example Nginx location snippets:

```nginx
location /my-raid-cds/assets/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
location = /my-raid-cds/index.html {
  add_header Cache-Control "no-cache";
}
location /my-raid-cds/fonts/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
```
