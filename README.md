**English** | [Русский](README.ru.md)

<img src="./public/logo.svg" width="148" height="148">

Web app to track raid cooldowns per character and dungeon, with BiS gear hints and raid signup helpers (WotLK-focused).
Data persists locally in `localStorage`.
Live site: [sergimax.ru/raidwise](https://sergimax.ru/raidwise)

![App version](https://img.shields.io/badge/App_version-2.12.0-purple)
![Game version](https://img.shields.io/badge/WoW-3.3.5a-brown)

## Features

Toolbar panels are mutually exclusive (only one open at a time).
Breadcrumbs at the top of each page show the current section or raid tool and link back to My Raids.

### Characters & dungeons

Add characters and raids manually (toolbar buttons or the dotted empty column/row on the table), or load the WotLK template when the list is empty; edit specs, WowSims gear, also-owned items, raid metadata, and column order later.
In the raid editor, renaming a row keeps its loot template.
Choose a different **Loot template** to apply that variant’s size, difficulty, and item levels.
**No loot template** detaches the row and keeps its existing item levels.
Cooldown marks stay with the row.
The responsive MUI AppBar keeps app sections in a dropdown beside the logo and scrollable tracker actions in the same toolbar at every screen width; on mobile, the menu also contains these actions. The logo text hides below 1200px. The header **info** button shows or hides the usage intro (CDs, gear planning, or BiS-only). **Settings → Interface** controls the color theme. Both choices are saved locally.

### Cooldown toggles

Mark which character has CD on which raid.
Reset one character from the table header, or everyone from **Raid settings**.

### Table

Sort and search raids (EN/RU, e.g. `ICC25H` / `ЦЛК25хм`); **Type** shows size (+ skull for Heroic), with per-row edit/delete. When sorted by name, adjacent variants of the same template raid share a background image across up to four rows; extra variants start another image.
Character columns use class-colored names and main/off GS; Complete is a progress bar; compact on small screens, with horizontal scroll inside the table when many characters are present.

### Raid settings

Bulk reset CDs, or delete all characters / dungeons / local BiS lists (with confirm); when empty, **Add raids from template**.

**Workspace backup** downloads one JSON file with characters and their gear, raids, cooldown marks, custom BiS lists, and BiS selections from the current tab.
Choose a file up to 10 MiB to compare its contents with the current workspace.
Confirming replaces both data sections and reloads the app.
If the workspace changes after you choose the file, load the latest save and preview the backup again.
The backup excludes language, theme, and panel filters.

### Settings

The header version links to the GitHub repository. The About section shows the app version and a labeled source-code link.
What's new shows the latest version entry from the [changelog](CHANGELOG.md).

### Character pick for a raid

Copyable signup lines of characters still missing CD on filtered raids, with min GS / role / spec filters, optional **With upgrades**, and optional **Specs** / **GS** in the line format.
Session-kept filters; **Reset parameters** clears them; click Selected raid chips to exclude false matches.

### Soft pick for a raid

Plan soft reserves for one character + spec on BiS upgrades from filtered raids (**re-roll** or **+100**, configurable soft reserve maximum with no fixed upper bound), with competition colors, win-odds hints, and a pasteable call list.
For re-rolls, ordinary rolls count only when one player calls softs on an item; with multiple callers, only soft rolls count.
The call list contains only your selected soft reserves. A toggle controls whether to show the number assigned to each item.
The **All useful items** toggle (off by default) appends the remaining items from the useful-item list after your selected reserves.
**All items from the BiS list** includes exact active-list items from selected raids, including owned gear; it is mutually exclusive with **All useful items**.
Optional **With upgrades** dims characters with no BiS targets; **Reset parameters** clears the panel filters.
Uses the active **BiS builds** list; other-spec gear counts as owned; session state survives closing the panel.

### BiS builds

Built-in presets per spec (Kingdom first, then Titans/community); local copies are editable for gear-choice hints.
Single-column gear slot list with alternatives (shirt and tabard omitted); **Copy** exports `Slot: Item` lines.
T9/T10 sources in the BiS list show Emblems of Frost, or Vault of Archavon for hands and legs, plus ICC25H for upgrade tokens.

### Gear hints

The gear hint legend shows a sample cell, and the usage intro illustrates available upgrades and both cooldown states.
CD cells use color gradients fading from the center toward the edges: main spec on the left, off spec on the right; BiS (coral, including variants) on top and ordinary ilvl upgrades (teal) below. Each band has independent strength based on upgrade slots; empty bands stay untinted and marked CDs hide the hints.
Cells show unique BiS counts (including variants) and ordinary upgrade counts beside the toggle: main spec on the left, off spec on the right. Counts hide when CD is marked.
Boss-grouped tooltips show unique item counts for each BiS, BiS variant, and ordinary upgrade category and include tier tokens; also-owned items count without being on the WowSims export.

### EN / RU

Full UI and item tooltips; first visit defaults to Russian.

### Theme

Light/dark mode saved locally, with a system preference fallback when browser storage is unavailable; flat section rails within unified panels over a subtle page dot grid (refined design direction S); design tokens in [docs/design/design-system.md](docs/design/design-system.md).

## Development

Archived desktop Lighthouse scores from August 2026. [Reports and measurement commands](docs/lighthouse/README.md).

![Lighthouse Performance](https://img.shields.io/badge/Performance-93-%230cce6b?logo=lighthouse&logoColor=white)
![Lighthouse Accessibility](https://img.shields.io/badge/Accessibility-98-%230cce6b?logo=lighthouse&logoColor=white)
![Lighthouse Best Practices](https://img.shields.io/badge/Best_Practices-100-%230cce6b?logo=lighthouse&logoColor=white)
![Lighthouse SEO](https://img.shields.io/badge/SEO-100-%230cce6b?logo=lighthouse&logoColor=white)

**Stack:**
React 19, TypeScript, Vite, MUI, Vitest + Testing Library.

**CI:**
Locally, `npm run ci` runs lint + tests with coverage + build; `npm run test:browser` runs the browser smoke checks separately.
On pushes and PRs targeting `main` or `master`, GitHub Actions runs **Lint**, **Test and coverage**, **Build**, and **Browser smoke** in parallel. **Release files** then validates the changelog, README badges, and lockfile when the version changes. Pushes to either branch also upload a `dist` artifact. [CI workflow](.github/workflows/ci.yml) · [Build artifacts workflow](.github/workflows/build-artifacts.yml).

**Layout:**
`src/components/` (UI), `src/hooks/` (domain + overlay panels), `src/utils/`, `src/data/` (WoW bundles + BiS presets), `src/storage/`. Tests are colocated as `*.test.ts(x)`.

**Performance:**
WoW item data loads after the app shell as separate JSON files.
A failed request can be retried while the raid tracker stays available.
BiS and Soft pick wait for the data they need.
If the current build refers to a missing file, the app offers a reload.
Fonts are self-hosted under `public/fonts/` and class/spec icons are 32×32 WebP.
External item tooltips load when you focus or hover over an item link.
After a failed request, the next interaction retries it.

### Project documentation

- [Roadmap](docs/roadmap.md) and [release notes](CHANGELOG.md).
- [Web app audit](docs/audits/2026-11-05/README.md), with findings, implementation plan, and follow-up checks.
- [Design system](docs/design/design-system.md), with design tokens and links to the concept galleries.
- [Contributor and agent conventions](AGENTS.md).

### Quick start

Use Node.js 22.19+ in the Node.js 22 release line to match GitHub Actions.

```bash
npm ci
npm run dev
```

Open [http://localhost:5173/raidwise/](http://localhost:5173/raidwise/).

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run test` / `npm run test:run` | Vitest (watch / single run) |
| `npm run test:coverage` | Run Vitest with source coverage; see `coverage/index.html` for uncovered lines and branches |
| `npm run test:coverage:changed` | Run all Vitest tests and report coverage for locally changed source files. Use `npm run test:run -- --coverage --coverage.changed=<base>` to compare with a commit or branch. |
| `npm run test:browser` | Build and check theme, accessibility, save persistence, and item-data recovery in Chrome (set `CHROME_PATH` if needed) |
| `npm run ci` | Lint + test:coverage + build (pre-push checks) |
| `npm run build:wow-data` | Regenerate bundled WoW JSON from `scripts/wow-data/wowsims-db.json` (includes VoA tier loot derived from tier set metadata when WowSims omits zone 4603) |
| `npm run generate:bis-presets` | Regenerate built-in BiS presets from `scripts/bis/bis-list-sources.md` + `scripts/bis/bis-list-mix.md` |
| `npm run comment:bis-presets` | Add slot comments to BiS preset files |
| `npm run download:gear-slot-icons` | Regenerate WoW paper-doll slot placeholder PNGs in `src/assets/gear-slot-icons/` |
| `npm run download:raid-icons` | Regenerate template-raid achievement icons in `src/assets/raid-icons/` |
| `npm run download:fonts` | Regenerate self-hosted Onest / Noto Sans / JetBrains Mono woff2 + `src/fonts.css` |
| `npm run compress:class-icons` | Resize class/spec icons to 32×32 WebP in `src/assets/class-icons/` |
| `npm run lighthouse` | Desktop Lighthouse vs preview/production URL → `docs/lighthouse/` (run `preview` first for local) |
| `npm run lighthouse:mobile` | Same with the mobile preset |

The CI test job uploads the `coverage-report` artifact. Coverage includes all runtime TypeScript files under `src/`, including files outside the test imports. Tests and test helpers are excluded. The full run requires 87% line coverage, 86% statement and function coverage, and 80% branch coverage. Browser smoke checks run separately.
Vitest uses up to four workers to limit contention during jsdom and coverage runs.

Built-in BiS lists are authored in [Titans and community sources](scripts/bis/bis-list-sources.md) and [Kingdom lists](scripts/bis/bis-list-mix.md). The Kingdom source supports numbered weapons and `N-M` slot alternatives. Run `npm run generate:bis-presets` after editing either file.

### Persistence

| Key | Contents |
|-----|----------|
| `raidwise` | Characters, dungeons, toggles (`schemaVersion` 7) |
| `raidwise-bis-lists` | BiS preset selections and local lists (`schemaVersion` 1; malformed entries skipped on load) |
| `raidwise-workspace` | Both saves after restoring a workspace backup (`version` 1) |
| `raidwise-item-tooltip-locale` | `en` or `ru` (defaults to `ru`) |
| `raidwise-color-mode` | Light/dark preference |
| `raidwise-gear-hint-legend-dismissed` | Dismissed gear-hint legend above the table |

The tracker and BiS lists read legacy `my-raid-cds*` saves and move them to the current keys on the next successful save.

Restoring a workspace backup commits both sections in one browser write. Subsequent edits use the combined save, which requires a Raidwise build with workspace backup support.

Character names: new names are letters only (Unicode `\p{L}+`); display capitalizes the first letter. Legacy names with digits/symbols still load.

Tracker and BiS edits are staged before taking the browser save lock.
Reloading the same tab reopens its draft.
If the browser saved the draft outside the tab, use **Open draft** in the tracker or BiS panel after closing the tab to recover it in the same browser profile.
If another tab changes the shared save first, Raidwise keeps the working copy and lets you download it or explicitly discard it and load the saved version. Save failures can be retried from the warning.
Shared saves require Web Locks over HTTPS or on localhost.
Raidwise compares the `localStorage` save revision with the latest revision recorded in IndexedDB before writing. If the tab cannot confirm that it sees the latest save, it reports an error and keeps the draft.
If the browser cannot store a draft outside the current tab, Raidwise warns before leaving and offers to download the working copy.

If a save is damaged, Raidwise pauses writes and shows the records it can recover. The warning lets you download the original or confirm a replacement with the working copy.
If the shared workspace record is damaged, valid sections remain visible.
Restore both sections from a verified backup in **Raid settings**.
For an unsupported save version, download the original or open it in a compatible version of Raidwise. BiS warnings appear in **BiS builds**.

### Deployment (caching & HTTP)

Vite emits content-hashed files under `assets/` (e.g. `/raidwise/assets/index-….js`). For good Lighthouse cache scores on [sergimax.ru/raidwise](https://sergimax.ru/raidwise):

| Path | Cache-Control | Notes |
|------|---------------|--------|
| `/raidwise/assets/*` | `public, max-age=31536000, immutable` | Filenames change every build |
| `/raidwise/index.html` | `no-cache` or short `max-age` (e.g. 60) | Must revalidate so clients pick up new hashes |
| `/raidwise/fonts/*` | `public, max-age=31536000, immutable` | Self-hosted woff2 |

Also enable **HTTP/2** (or HTTP/3) and **brotli** or **gzip** for JS/CSS/JSON/SVG/woff2.
Client-side routes under `/raidwise/` must fall back to `index.html` so direct links and refreshes work.

Example Nginx locations inside a `server` block. `root` maps `/raidwise/...`
to files under `/usr/share/nginx/raidwise/...`; unknown client-side routes
fall back to `index.html`, while missing files under `assets` and `fonts` stay 404.

```nginx
location = /raidwise {
  return 301 /raidwise/;
}

location = /raidwise/index.html {
  root /usr/share/nginx;
  add_header Cache-Control "no-cache";
}

location ^~ /raidwise/assets/ {
  root /usr/share/nginx;
  try_files $uri =404;
  add_header Cache-Control "public, max-age=31536000, immutable";
}

location ^~ /raidwise/fonts/ {
  root /usr/share/nginx;
  try_files $uri =404;
  add_header Cache-Control "public, max-age=31536000, immutable";
}

location ^~ /raidwise/ {
  root /usr/share/nginx;
  try_files $uri $uri/ /raidwise/index.html;
}
```
