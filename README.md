# Raidwise

**English** | [Русский](README.ru.md)

Web app to track raid cooldowns per character and dungeon, with BiS gear hints and raid signup helpers (WotLK-focused).
Data persists locally in `localStorage`.
Live site: [sergimax.ru/raidwise](https://sergimax.ru/raidwise)

![App version](https://img.shields.io/badge/App_version-2.7.0-purple)
![Game version](https://img.shields.io/badge/WoW-3.3.5a-brown)

<img src="./public/logo.svg" width="148" height="148">

## Features

Toolbar panels are mutually exclusive (only one open at a time).

### Characters & dungeons

Add characters and raids manually, or load the WotLK template when the list is empty; edit specs, WowSims gear, also-owned items, raid metadata, and column order later.
Header **info** opens a short intro (CDs, gear planning, or BiS-only).

### Cooldown toggles

Mark which character has CD on which raid.
Reset one character from the table header, or everyone from **Settings**.

### Table

Sort and search raids (EN/RU, e.g. `ICC25H` / `ЦЛК25хм`); **Type** shows size (+ skull for Heroic), with per-row edit/delete.
Character columns use class-colored names and main/off GS; Complete is a progress bar; compact on small screens, with horizontal scroll inside the table when many characters are present.

### Settings

Bulk reset CDs, or delete all characters / dungeons / local BiS lists (with confirm); when empty, **Add raids from template**.

### Character pick for a raid

Copyable signup lines of characters still missing CD on filtered raids, with min GS / role / spec filters and optional **Specs** / **GS** in the line format.
Session-kept filters; click Selected raid chips to exclude false matches.

### Soft pick for a raid

Plan soft reserves for one character + spec on BiS upgrades from filtered raids (**re-roll** or **+100**, max softs 1–4), with competition colors, win-odds hints, and a pasteable call list.
Uses the active **BiS builds** list; other-spec gear counts as owned; session state survives closing the panel.

### BiS builds

Built-in presets per spec (Kingdom first, then Titans/community); local copies are editable for gear-choice hints.
Paper-doll slot layout with alternatives; **Copy** exports `Slot: Item` lines.

### Gear hints

CD cells tint <span style="color:#d97706">amber</span> for missing BiS and <span style="color:#0284c7">blue</span> for stat-filtered ilvl upgrades (hidden when that CD is marked; main/off split when both specs are set).
Boss-grouped tooltips include tier tokens; also-owned items count without being on the WowSims export.

### EN / RU

Full UI and item tooltips; first visit defaults to Russian.

### Theme

Light/dark mode saved locally; design tokens in [docs/design/design-system.md](docs/design/design-system.md).

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
| `npm run download:raid-icons` | Regenerate template-raid achievement icons in `src/assets/raid-icons/` |
| `npm run download:fonts` | Regenerate self-hosted Onest / Noto Sans / JetBrains Mono woff2 + `src/fonts.css` |
| `npm run compress:class-icons` | Resize class/spec icons to 32×32 WebP in `src/assets/class-icons/` |
| `npm run lighthouse` | Desktop Lighthouse vs preview/production URL → `docs/lighthouse/` (run `preview` first for local) |
| `npm run lighthouse:mobile` | Same with the mobile preset |

Built-in BiS lists are authored in `scripts/bis/bis-list-sources.md` (Titans + community) and `scripts/bis/bis-list-mix.md` (Kingdom. With variants: numbered weapons + `N-M` slot alternatives).
Regenerate TypeScript presets after editing the markdown.

### Persistence

| Key | Contents |
|-----|----------|
| `raidwise` | Characters, dungeons, toggles (`schemaVersion` 6) |
| `raidwise-bis-lists` | BiS preset selections and local lists (`schemaVersion` 1; malformed entries skipped on load) |
| `raidwise-item-tooltip-locale` | `en` or `ru` (defaults to `ru`) |
| `raidwise-color-mode` | Light/dark preference |
| `raidwise-gear-hint-legend-dismissed` | Dismissed gear-hint legend above the table |

Legacy `my-raid-cds*` keys are copied to the new names on first load, then removed.

Character names: new names are letters only (Unicode `\p{L}+`); display capitalizes the first letter. Legacy names with digits/symbols still load.

Corrupted tracker data resets with an error alert.
Legacy saves migrate on load.

### Deployment (caching & HTTP)

Vite emits content-hashed files under `assets/` (e.g. `/raidwise/assets/index-….js`). For good Lighthouse cache scores on [sergimax.ru/raidwise](https://sergimax.ru/raidwise):

| Path | Cache-Control | Notes |
|------|---------------|--------|
| `/raidwise/assets/*` | `public, max-age=31536000, immutable` | Filenames change every build |
| `/raidwise/index.html` | `no-cache` or short `max-age` (e.g. 60) | Must revalidate so clients pick up new hashes |
| `/raidwise/fonts/*` | `public, max-age=31536000, immutable` | Self-hosted woff2 |

Also enable **HTTP/2** (or HTTP/3) and **brotli** or **gzip** for JS/CSS/JSON/SVG/woff2.

Example Nginx location snippets:

```nginx
location /raidwise/assets/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
location = /raidwise/index.html {
  add_header Cache-Control "no-cache";
}
location /raidwise/fonts/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
```
