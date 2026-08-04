# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **Raid table:** Removed viewport-sticky table header (it required `overflow-x: visible`, which made the whole page scroll horizontally with many characters).

### Fixed

- **Raid table:** Wide character columns always scroll inside the table container; the page no longer scrolls horizontally when many characters are present (including with the usage-help intro open).

## [2.0.0] - 2026-08-04

### Changed

- **Visual theme:** Warm paper neutrals, burnt-orange brand (identity only — not primary CTAs), inverse-ink primary buttons, green ok / red danger, and bilingual fonts (Noto Sans, Onest, JetBrains Mono). Quiet vs spot link styles.
- **Design docs:** Moved to `docs/design/` (`design-system.md`, `design-tokens.json`); mirrors live tokens in `src/theme/` and `src/index.css`.

### Fixed

- **Raid table:** Sticky system columns no longer overlap the rounded table border at the top-left and bottom-left corners when scrolling horizontally.

## [1.55.0] - 2026-08-03

### Added

- **BiS Items header:** Shows the active list name under the Items step title.
- **Soft pick copy:** Pasteable soft-reserve call starts with `Character:` then `- Item (Boss) xN` lines.
- **Sticky table header:** With no toolbar panel open, the dungeon table header stays under the sticky app bar while scrolling the page.

### Changed

- **Add raids from template:** Default template list focuses on current-tier raids (VoA, ToC 25, ICC, RS 25); older WotLK entries removed from the one-shot template.

## [1.54.0] - 2026-08-02

### Added

- **Usage help:** Intro card with three scenarios (raid CDs, gear planning, BiS-only) and a header info button to show/hide it.
- **Stepped toolbar panels:** Character pick, Soft pick, BiS builds, Add character, and Add raid use numbered step cards with short helpers (no panel-level layout blurbs).
- **Add character:** Multi-step form with optional WowSims gear import for main/off specs while creating.
- **Add raid:** Stepped form; toolbar/form copy uses “raid” (EN) to match RU and the template CTA.
- **BiS custom lists:** Clear one slot while editing, or clear all slots; scroll height budgets for the paper-doll and list chips.
- **Design system docs:** `docs/design-system.md` and `docs/design-tokens.json` document colors, radii, borders, shadows, and form recipes for reuse.
- **CI:** After lint/test/build, a release-files job requires a version bump plus matching `package.json` / lockfile / README badges / `CHANGELOG.md` content (`scripts/check-release-files.mjs`).

### Changed

- **Template CTA:** Label is **Add raids from template** / **Добавить рейды из шаблона** (with confirm in Data when empty).
- **BiS panel:** Stepped Class & spec → Lists → Items → Save layout; save-name errors on the list-name field; Copy / Clear all on the Items header.
- **Scrollbars:** Thin theme-aware scrollbars app-wide.
- **Character pick / Soft pick:** Shared raid search field in the Raids step; clearer optional-step marks and empty Soft pick guidance.

### Fixed

- **BiS item tooltips:** Primary item links no longer stretch as full-width hover targets (tooltips stick less often); hide external tooltips on Items scroll/mouse leave.

## [1.53.1] - 2026-08-01

### Changed

- **README:** Short app description now mentions BiS gear hints and raid signup helpers (EN/RU).
- **Dev dependencies:** Updated nested lockfile packages (`brace-expansion`, `nanoid`, `postcss`).

## [1.53.0] - 2026-07-31

### Added

- **Kingdom BiS presets:** Built-in “Kingdom. With variants” lists from `scripts/bis-list-mix.md` (numbered weapon slots and per-slot alternatives); listed first ahead of Titans/community presets.
- **BiS panel alternatives:** Multi-item slots show the primary choice with drop sources, then a stacked **Alternatives** / **Варианты** block for the rest.
- **BiS list copy:** Copy button on the BiS panel exports the currently shown list as pasteable `Slot: Item` lines.
- **Also owned gear:** Character edit can list item ids available but not on the WowSims export (bags / other spec / vendors); they count toward BiS and ilvl gear hints for both specs (`schemaVersion` 6).

## [1.52.0] - 2026-07-22

### Added

- **README.ru.md:** Russian project readme with language switcher links to/from `README.md`.

### Changed

- **Default locale:** First visit (no saved preference) uses Russian for UI and item tooltips (`DEFAULT_ITEM_TOOLTIP_LOCALE`); `document.documentElement.lang` follows the active locale.
- **README:** Shorter feature summaries in EN/RU; live site link; gear-hint colors match the app palette.

## [1.51.1] - 2026-07-22

### Added

- **Author site:** Header meta cluster links to [sergimax.ru](https://sergimax.ru) via a home icon beside GitHub.

## [1.51.0] - 2026-07-21

### Changed

- **BiS armor slots:** Left/right paper-doll slots sit in a paired table so rows stay aligned; weapon slots stay in the bottom three-column row.
- **Soft pick copy lines:** Pasteable soft-reserve lines use `- Item (Boss) xN ` format.
- **Boss order:** Soft pick targets and table gear-hint boss groups follow ICC / ToC encounter order (not alphabetical).
- **Favicon:** Browser tab icon uses a dedicated `logo-as-icon.svg` (header crest remains `logo.svg`).

## [1.50.0] - 2026-07-21

### Added

- **Data controls:** Toolbar **Data** panel replaces the lone Reset all toggles button — reset toggles, delete all characters, delete all dungeons (or add from template when empty), and delete all custom BiS lists, each with a short description and confirm dialog.

### Changed

- **BiS items layout:** Slot editor uses an in-game paper-doll arrangement (left armor column, right armor column, bottom main/off/ranged), with non-editable shirt and tabard placeholders.

## [1.49.1] - 2026-07-21

### Changed

- **Toolbar panels:** Cap width on large screens so panels stay usable — BiS lists at 1280px; Character pick and Soft pick at 1920px (unit-grid side-by-side keeps a 2-unit results / softs column).

## [1.49.0] - 2026-07-21

### Changed

- **UI chrome:** Slate light/dark palette, frosted sticky header, card-style table and toolbar panels, subtler page background wash, and button labels without uppercase.
- **Empty state:** Intro copy sits in a short titled card (EN/RU).
- **App logo:** New crest for the header and favicon (paths respect the Vite base URL).

### Security

- **Dev tooling:** Upgraded Vite to 7.3.6 so the lockfile can resolve `esbuild` 0.28.1, clearing the Windows development-server file-read advisory ([GHSA-g7r4-m6w7-qqqr](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr)).

## [1.48.1] - 2026-07-19

### Fixed

- **BiS save validation:** Saving a list with an invalid name (empty or a built-in list name) now returns the error to the BiS panel instead of reporting success.

## [1.48.0] - 2026-07-19

### Added

- **BiS save errors:** BiS builds panel shows a localized alert when localStorage save fails (quota exceeded or generic failure).

### Fixed

- **BiS local lists load:** Malformed entries or slots in saved BiS data are skipped instead of wiping the whole BiS store.

### Changed

- **Gear hints performance:** Table cell tints use a cheaper evaluation path; boss-grouped loot for tooltips and Soft pick is built when needed. Bundled item lookups use numeric ID maps for faster access.

## [1.47.0] - 2026-07-18

### Changed

- **Soft pick layout:** Three breakpoints — stacked on small screens; medium puts softs beside filters with the soft-reserve call (1×2) below; wide (≥1600px) puts the call beside softs. Filter columns share one unit width so Rules, Raids, and Character & spec align as 1×1 / 2×1 blocks.
- **Character pick specs column:** Same unit width as min GS / role (was wider); character-spec rows use the shared compact list layout with Soft pick (truncating names, denser radio/checkbox + GS).

## [1.46.0] - 2026-07-18

### Added

- **Soft pick:** Toolbar panel to plan soft reserves for one character + spec — BiS/variant upgrades from table-filtered raids, soft-reserve rules (max softs; re-roll or +100), my softs vs others’ histogram per item, and a copyable soft-reserve call list (session-only).

### Fixed

- **Dungeon table search:** Normal mode can be filtered with `n` / `об` (e.g. `ICC25N`, `ЦЛК25об`), matching heroic `h` / `хм` / `х`. Size-only queries like `ICC25` still match both difficulties.

## [1.45.0] - 2026-07-10

### Fixed

- **Gear hint trinket roles:** Ilvl upgrade tooltips no longer suggest proc trinkets outside the intended role — tank (e.g. Unidentifiable Organ), healer (Solace, Glowing Twilight Scale, Althor's Abacus, Bauble of True Blood), or melee DPS (Tiny Abomination, Whispering Fanged Skull).
- **Faction-equivalent trinkets:** Alliance/Horde Solace variants count as the same item; the other faction's copy is not suggested when one is already equipped (including across the two trinket slots).

## [1.44.0] - 2026-07-06

### Added

- **Character pick spec sync:** Spec checkboxes clear and disable for characters on cooldown for every visible raid; **Select all** skips them. Selection updates when the table raid search or cooldown toggles change.
- **Inactive spec visuals:** CD rows use italic, muted, grayscale styling; role/GS–blocked specs use strikethrough. Hover tooltips explain CD vs filter reasons (EN/RU).

### Changed

- **Toolbar order:** **Character pick** and **BiS builds** sit before **Add character** / **Add dungeon**.
- **Character pick spec labels:** Built-in spec icon/GS tooltip is off in the spec filter block so inactive-state tooltips do not conflict.

## [1.43.0] - 2026-07-06

### Added

- **Character pick wide layout:** At viewport widths ≥1600px, signup result lines sit to the right of the filter grid; the list scrolls inside a fixed-height block aligned to the grid.

### Changed

- **Copy button label:** Per-raid signup lines use **Copy** / **Скопировать** (was “Copy for PM” / “Скопировать для ЛС”).

### Fixed

- **Tooltip readability (light theme):** App tooltips use a dark high-contrast panel in light mode; gear-hint item links use the bright ilvl palette on that surface.

## [1.42.0] - 2026-07-06

### Added

- **Character pick bulk filters:** **Select all** / **Clear all** icon buttons on the character-spec block; **Reset all filters** in the panel header (specs, roles, min GS).

### Changed

- **Character pick copy:** Panel title, result section, and status messages use **Character pick** / **Подбор персонажа** (EN/RU) instead of Export wording.
- **Role filter layout:** Equal-width 2×2 grid; checkbox stays next to the role icon.

## [1.41.0] - 2026-07-06

### Added

- **Export filter grid:** GS, role, character-spec, and raid filters in a fixed-layout bordered grid (full-width export panel). Role filter shows WoW LFG role icons in a 2×2 layout with hover highlight. Raid block reflects the table search (match count + chips with per-raid achievement icons). Character spec list scrolls after eight rows.
- **Export result lines:** Per-raid signup lines replace the read-only textarea (**Copy for PM** | raid badge | character text; copy omits the raid prefix).
- **Raid icons:** Bundled achievement artwork for all eight WotLK template raids in the export panel (`npm run download:raid-icons`).

### Changed

- **Toolbar labels:** **Character pick** / **BiS builds** (EN), **Подбор персонажа** / **BIS сборки** (RU) replace Export and BiS on the toolbar buttons.
- **Export minimum GS UI:** Slider value shown as large bold text under the track (no floating thumb label); helper text moved to the section description.
- **Export panel width:** Export panel is full width like BiS (no 640px cap); filter grid uses full container width on narrow screens.

## [1.40.0] - 2026-07-04

### Added

- **Export role filter:** Tank, healer, melee DPS, and ranged DPS checkboxes (all on by default). Unchecked roles disable matching per-character spec checkboxes and omit those specs from export lines. Roles are derived from bundled spec profiles (`spec-stat-priorities.ts`).

### Changed

- **Export minimum GS filter:** When enabled, specs below the selected threshold are disabled in the character checklist and omitted from export lines (same UX as the role filter; stored spec toggles are preserved when the filter is turned off).

## [1.39.0] - 2026-07-04

### Added

- **Character edit sync hints:** Info alerts when gear score was edited without re-importing WowSimsExporter gear, or when imported gear changed without updating the gear score field; baselines reset when the spec changes.

### Changed

- **Ruby Sanctum gear hints:** Ilvl and BiS loot pools respect dungeon size and difficulty — RS 10 Normal, 10 Heroic, 25 Normal, and 25 Heroic each use their own drop pool (including at the same item level).
- **BiS read-only layout:** Built-in preset rows hide the action column; slot labels use a fixed column with ellipsis when names overflow.

### Fixed

- **BiS ring/trinket hints:** Swapped finger and trinket slots no longer show as missing BiS when the target item is equipped in the alternate slot of the pair.
- **BiS slot row layout:** Fixed column shift when viewing read-only presets.
- **Gear hint tooltips:** Boss-grouped BiS sections and flat fallbacks omit items whose drop sources do not match the dungeon row.
- **Ilvl stat filtering:** Tighter compatibility rules for Protection and Retribution Paladin (tank necks, stamina-only trinkets, caster procs), Druid specs, Unholy Death Knight intellect mail, and related cross-armor edge cases.

## [1.38.0] - 2026-07-03

### Added

- **BiS slot icons:** BiS list rows show WoW paper-doll placeholder icons beside localized slot labels; Back reuses the Chest icon (same as WotLK UI). Regenerate PNGs via `npm run download:gear-slot-icons`.

## [1.37.0] - 2026-07-02

### Changed

- **Dungeon table search:** Mixed queries filter by raid name, optional size, and optional heroic suffix (e.g. `ICC`, `Uld10`, `ToC25H`, `ЦЛК25хм`); English and Russian raid names and abbreviations match in either UI locale. Search field placeholder and tooltip show example patterns.

## [1.36.0] - 2026-06-30

### Added

- **Export minimum GS filter:** Optional checkbox + compact GS slider (`4`–`7`, e.g. `≥ 5.6`) above the character spec checklist omits checked specs below the threshold from export lines; specs without a stored GS are still included.

## [1.35.0] - 2026-06-30

### Fixed

- **Dual-spec gear hint cells:** When a character has main and off specs, toggle cell tint is split left/right per spec; only the side with upgrade hints is colored instead of filling the whole cell.
- **Tank gear hints:** Ilvl upgrade suggestions for tank specs now require defense, dodge, or parry on the item; DPS Ruby Sanctum loot (e.g. Penumbra Pendant, Signet of Twilight, Bracers of the Heir, Baltharus' Gift) is no longer suggested. BiS list targets are unchanged. Also maps bundled WowSims defense/dodge/parry stats and fixes ranged attack power index (21).

### Changed

- **Gear hint cell contrast:** Toggle tint alphas are tuned per theme — slightly stronger level-1 hints in light mode, higher opacity across levels in dark mode for easier scanning. BiS amber uses custom `warning` palette colors aligned with the zinc/sky theme (replacing MUI defaults).
- **Gear hint tooltips:** Boss-loot section headers show a colored dot and short **BiS** (amber) or **Upgrades** (blue) label before the section description, matching toggle cell tints.
- **Gear hint row hover:** Toggle cell tints render on a `::after` overlay so table row hover fills the whole cell evenly; dual-spec half-tints no longer look broken on the untinted side.
- **Gear hint legend:** A dismissible legend above the table explains amber **BiS** vs blue **Upgrades** toggle colors (saved in `localStorage` after close).

## [1.34.0] - 2026-06-30

### Added

- **Dungeon name suggestions:** The new-dungeon form suggests WotLK raid names via locale-aware autocomplete; selecting a known raid fills or updates the short name abbreviation.

### Fixed

- **Dungeon short name auto-fill:** English raid name matching no longer requires `shortEn` to be present before recognizing the name; added missing English abbreviations for Onyxia's Lair (`Ony`), Trial of the Crusader (`ToC`), and Ulduar (`Ulda`).

## [1.33.2] - 2026-06-30

### Changed

- **CI:** GitHub Actions runs **Lint**, **Test**, and **Build** as parallel jobs (shared `.github/actions/setup-project` setup); stale workflow runs cancel on new pushes. Actions upgraded to Node.js 24–native versions (`checkout@v5`, `setup-node@v5`, `upload-artifact@v6`).

## [1.33.1] - 2026-06-30

### Fixed

- **Vault of Archavon gear hints:** WowSims has no zone data for VoA — `build:wow-data` now supplements tier set hands/legs (T9 from Koralon, T10 from Toravon) into `raid-loot-by-key.json` and `wotlk-item-drop-sources.json`, restoring BiS and ilvl tooltip recommendations for VoA rows. RU boss labels added for Archavon, Emalon, Koralon, and Toravon.

## [1.33.0] - 2026-06-30

### Added

- **Unified BiS preset source:** Titans guild and community guides in one `scripts/bis-list-sources.md`; single generator `npm run generate:bis-presets` (`scripts/generate-bis-presets.mjs`, `scripts/bis-resolve-titans.mjs`).
- **BiS editor split:** `bis-slot-row/`, `utils/bis-list-editor.ts`, and `use-bis-lists-editor-state.ts` for panel draft/validation.
- **Overlay panels hook:** `useOverlayPanels` — mutually exclusive character, dungeon, export, and BiS toolbar panels plus form field state.
- **Gear hint display:** MUI cell styles extracted to `utils/gear-hint-display.ts`.
- **Tests:** Overlay panels, BiS domain/storage, BiS panel flows, `character-gear-hints`, and `bis-list-editor`.

### Changed

- **Toolbar layout:** Export panel renders in `RaidTrackerMain` inside the shared `TrackerToolbarPanel`; `RaidTrackerMain` owns `useRaidTrackerTableState`.
- **BiS context:** `getBisSlotMapForSpec` exposed from `BisListsContext` for stable gear-hint lookups in toggle cells.
- **BiS domain:** Public API trimmed to presets, selection, slot maps, and local save/delete.
- **README** slimmed; **project rules** updated for current layout and scripts.

### Removed

- **`generate:titans-bis`** and **`generate:bis-sources`** (replaced by `generate:bis-presets`); deleted `scripts/titans-bis/` and `scripts/resolve-bis-sources.mjs`.

## [1.32.0] - 2026-06-30

### Added

- **Gear hint tooltip — ilvl boss loot:** Boss-grouped scrollable list for stat-filtered ilvl upgrades (separate from BiS exact and normal-variant sections).
- **Spec-aware ilvl filtering:** Reject +spirit for shamans, +hit for healers, off-hand shields only for Restoration shaman, two-handed main hand only for Feral, and plate armor only for plate tanks (`spec-stat-priorities.ts`, `item-stat-fit.ts`, `item-equip-restrictions.ts`).
- **Tier set tokens:** Correct T8/T9/T10 token item IDs and set→category mappings; class-filtered token hints (`canClassUseTierSetToken`); EN/RU item names for upgrade tokens via `scripts/tier-set-token-names.mjs` in `build:wow-data`.
- **Normal-only raids:** Flat item list fallback when boss metadata is missing (e.g. Onyxia) via `groupBisItemIdsByBossForDungeonWithFallback`.

### Changed

- **Gear hint tooltip:** Tier set lines show item links only (quantity when &gt; 1); ilvl summary hidden when the ilvl boss list is shown; BiS missing-count summary lines removed when boss-grouped lists are present.
- **`build:wow-data`:** Merges tier set token EN names and includes token item IDs in the WoWRoad Russian name fetch.

### Fixed

- **i18n:** Tier set token and ilvl boss loot labels in EN/RU.

## [1.31.0] - 2026-06-29

### Changed

- **Compact table:** Dungeon name column shows short raid name + size (+ skull for Heroic), e.g. `ICC 25 ☠️` / `ЦЛК 25`, with full name in tooltip (`getLocalizedDungeonCompactLabel`).

### Fixed

- **Toggle cells with gear hints:** Per-cell memo equality includes `locale` and BiS list state so upgrade hints and toggle labels stay current after language or preset changes.

## [1.30.0] - 2026-06-29

### Added

- **Community BiS presets:** Holy Priest, Subtlety/Assassination Rogue, Destruction Warlock, Arms/Protection Warrior, Beast Mastery/Survival Hunter, and Frost Mage (Warmane, Circle, Icy Veins sources in `scripts/bis-list-sources.md`). Every WotLK spec now has at least one built-in BiS list.

### Changed

- **`generate:bis-sources`:** Parses `# Class - Spec` sections with `## Server - Author - List - URL` sub-blocks (legacy flat blocks still supported); expanded slot labels (Russian, wand/shield/two-hand, ring/trinket variants).
- **Gear upgrade hints:** Tint and tooltip hidden when the character–dungeon toggle is on (marked complete); hint tooltip closes when toggling the switch while it is open.

### Fixed

- **BiS panel:** Slot items no longer missing on first open when a default preset is already selected.
- **Toggle cells with gear hints:** Switch thumb animation stays smooth (per-cell memoization; stable tooltip wrapper).

## [1.29.0] - 2026-06-27

### Added

- **Stat-aware ilvl upgrade hints:** Generic ilvl track filters raid loot by spec-relevant stats (GearScore2-inspired weights in `spec-stat-priorities.ts`, scoring in `item-stat-fit.ts`; bundled `wotlk-item-stats.json` from `build:wow-data`).
- **BiS normal/heroic variants:** Same English name + slot (e.g. ICC Astrylian belt N/H) count as satisfying BiS targets and appear as a separate **normal variants** tooltip section when the heroic id is on the list.
- **Gear hint tooltip — three tiers:** Exact BiS boss loot, normal BiS variants, and a short ilvl summary (plus tier set tokens on ICC/ToC token rows).

### Changed

- **Toggle cell tints:** **Amber** (3 intensities) for missing BiS exact or variant targets; **blue** (3 intensities) for other ilvl upgrades — no longer tied to dungeon ilvl-tier colors on cells.
- **Dungeon table styling:** Name and ilvl columns use plain typography; ilvl-tier colors remain on item links only.
- **Gear hint tooltip:** Boss-grouped BiS lists show **missing** items only, inline per boss with a scroll cap; summary lines shortened (BiS counts omitted when boss lists are shown).
- **Item links:** Render inline so alternatives and tooltip loot no longer stack one item per line.
- **`build:wow-data`:** Also emits sparse item stat bundles (`wotlk-item-stats.json`).

## [1.28.0] - 2026-06-27

### Added

- **Character edit — clear gear:** **Clear gear** button per spec column removes imported gear for that spec (save persists the removal).

### Changed

- **Character edit dialog:** Main and off spec in side-by-side columns (spec, gear score, stored gear, WowSims import each); wider dialog; compact JSON paste field; stored gear lists scroll within a bounded pane per column; off spec column always shown.

## [1.27.0] - 2026-06-27

### Added

- **BiS drop sources:** Bundled boss/raid drop data (`wotlk-item-drop-sources.json`, emitted by `build:wow-data`); BiS panel shows an export-style source line under each item (e.g. `ICC25H · Lord Marrowgar`, `РС25хм · Халион`).
- **Gear hint tooltip — boss-grouped BiS loot:** When a BiS list is active, the dungeon cell tooltip groups BiS items by boss for the matching raid row; spec sections use talent icons via `SpecOptionLabel`.
- **Boss name localization (RU):** WowSims encounter labels map to in-game Russian boss names (`data/raid-boss-names.ts`).

### Changed

- **Gear hint tooltip:** Tier set tokens use compact lines instead of a table; ilvl upgrade copy omits per-slot item lists when boss-grouped BiS loot is shown; BiS missing count drives the section title when applicable.
- **BiS panel layout:** Drop sources render on a separate line below item names; slots without raid drops stay vertically centered in the row.

## [1.26.0] - 2026-06-27

### Added

- **Gear upgrade hints — dual tracks:** Toggle cells use **amber** for missing BiS-list targets (priority) and **dungeon ilvl-tier color** for possible higher-ilvl raid loot; tooltips list BiS gaps and ilvl suggestions separately.
- **Roadmap:** `docs/roadmap.md` for future feature ideas (e.g. stat-aware class/spec loot filtering).

### Changed

- **Ilvl upgrade tooltips:** Copy uses “may have” wording and notes that only equipability is checked (item stats not validated).

## [1.25.0] - 2026-06-27

### Added

- **Toolbar panels — shared shell:** Add character, add dungeon, BiS lists, and Export use a common outlined card (`TrackerToolbarPanel`) with title, optional hint, and close control.
- **Toolbar panels — scroll:** Opening or switching a toolbar panel scrolls the page to the top (replaces per-panel `scrollIntoView`).

### Changed

- **Add character / add dungeon:** Close via the panel header ✕ instead of a Cancel button; only one toolbar panel open at a time.
- **Export panel:** Title, instructions, and close moved to the shared shell (same layout as BiS).
- **Toolbar actions:** Add from template, reset all toggles, and opening another panel close any open overlay (export, BiS, add forms).
- **Narrow panels:** Character, dungeon, and export cards are width-constrained so the close button aligns with form content (BiS stays full width).

## [1.24.0] - 2026-06-27

### Added

- **BiS panel — class/spec icons:** Class and spec dropdowns show WoW class and talent icons (same `ClassOptionLabel` / `SpecOptionLabel` as the character form).
- **Edit character — class/spec icons:** Class row under the character name, spec dropdowns, and WowSimsExporter import section headers show matching icons.

### Changed

- **BiS panel layout:** Wider class/spec column so icon + localized labels do not overlap the select arrow.
- **Character edit copy:** Gear score helper and WowSimsExporter import hints updated (EN/RU).
- **Feral Druid (RU):** In-game spec label updated to «Сила зверя».

### Fixed

- **BiS panel — Warrior / Rogue:** Selecting classes whose default spec has no built-in list no longer crashes the app (custom-list hint path uses localization helpers again).

## [1.23.0] - 2026-06-27

### Added

- **Community BiS presets:** Built-in lists from forum and Icy-Veins guides for Unholy Death Knight, Enhancement Shaman (Warmane, Circle, Icy-Veins), Feral Druid (Warmane, Circle, Icy-Veins), and Restoration Druid (Warmane) — each preset named by source and author (e.g. `Udk-STR (Warmane · Drakantas)`).
- **Community BiS tooling:** `npm run generate:bis-sources` parses `scripts/bis-list-sources.md`, resolves English and Russian item names to ids, and writes the matching preset TypeScript under `data/bis-presets/` (does not modify `index.ts`).

### Changed

- **Unholy / Enhancement / Feral / Restoration Druid presets:** Replaced Titans-only (or legacy Default/Titans) built-in lists for those specs with the new community-source presets; other specs still use **Titans** lists from `generate:titans-bis`.

### Fixed

- **BiS panel — first render:** Item rows appear immediately when opening the panel for a spec with built-in presets (slot drafts sync on mount via `activeSlotDrafts` instead of waiting for a second render).

## [1.22.1] - 2026-06-27

### Changed

- **BiS lists — specs without built-in preset:** When a class/spec has no built-in list (e.g. Warrior Arms), the BiS panel shows an empty slot editor and save form so you can create a local list instead of a developer-only placeholder message.

## [1.22.0] - 2026-06-27

### Added

- **Titans BiS presets:** Built-in **Titans** lists for 21 WotLK specs (Death Knight Blood/Frost/Unholy, Druid Balance/Feral/Restoration, Hunter Marksmanship, Mage Arcane/Fire, Paladin Holy/Protection/Retribution, Priest Discipline/Shadow, Rogue Combat, Shaman Elemental/Enhancement/Restoration, Warlock Affliction/Demonology, Warrior Fury) — ICC/RS tier from Titans guild guides in `data/bis-presets/`.
- **Titans BiS tooling:** `npm run generate:titans-bis` parses `scripts/titans-bis/source.md` and writes or merges preset TypeScript; `npm run comment:bis-presets` adds slot + item name trailing comments via `scripts/bis-preset-format.mjs`.

### Changed

- **Blood / Unholy DK presets:** Existing **Default** lists kept; **Titans** variant added alongside; all preset slot lines include inline item-name comments.
- **Type column:** `formatDungeonTypeLabel` supports a `skull` style; `DungeonTypeCell` uses the localized skull marker for Heroic rows (export labels still use `H` / `хм` suffixes).

### Fixed

- **Titans BiS generator — `index.ts` registration:** `generate:titans-bis` adds imports and array entries via structural updates to `BuiltInBisPresets` (throws on failure) instead of hard-coded anchor regexes that could silently skip new presets.
- **Titans BiS generator — weapon slots:** Assigns main hand, off hand, and ranged from `source.md` using `wotlk-item-equip-props.json` (Titan's Grip, caster shields, ranged items); supports `+`-separated weapons and `MainAlt1 / MainAlt2 + OffHand` lines. Fixes Fury (Shadowmourne + Glorenzelg + Fal'inrush), Holy Paladin / Elemental / Restoration Shaman (Terenas + Bulwark of Smouldering Steel), and similar multi-weapon presets.
- **Smouldering Steel item mapping:** Manual alias `Сила тлеющей стали` now resolves to **50616** (Bulwark of Smouldering Steel), not Bloodvenom Blade.

## [1.21.0] - 2026-06-27

### Changed

- **Raid tracker table — Type column:** Replaced separate **Size** and **Mode** pinned columns with a single **Type** column (`DungeonTypeCell`): size for Normal rows; size plus skull icon for Heroic (export labels still use `H` / `хм` via `formatDungeonTypeLabel`).
- **Type sort:** New `type` sort key with WotLK priority order descending: `25H` → `25` → `10H` → `10` → `5` → `40` → `20` (`utils/dungeon-type.ts`, `compareDungeonType`); default direction is descending. Same-type ties break by item level (higher first when descending).
- **Compact table:** Below `md`, hides **Type** (not size/mode separately) along with item level and completions.

### Fixed

- **Type sort tiebreaker:** Same-type rows no longer sort by item level in the opposite direction when using descending sort.

## [1.20.0] - 2026-06-27

### Added

- **Per-spec gear import:** **Edit character** has separate WowSimsExporter import sections for main and off spec (off section when off spec is set); each spec stores its own equipped items.
- **Dual-spec upgrade hints:** Table toggle cells evaluate hints per spec — each uses that spec’s imported gear and selected BiS list. When both specs have hints, the cell uses a split background tint (main left, off right); tooltips show labeled sections per spec.
- **Blood DK BiS preset:** Built-in **Default** list for Death Knight / Blood (Warmane ICC / RS guide) in `data/bis-presets/blood-death-knight.ts`.

### Changed

- **Character storage:** `gearItems` live on `mainSpec` / `offSpec` (`{ spec, gearScore?, gearItems? }`); legacy v4 top-level `gearItems` migrate to `mainSpec.gearItems` on load. Tracker `schemaVersion` **5**.
- **Gear hints:** `evaluateCharacterGearHints` in `utils/character-gear-hints.ts` replaces main-spec-only hint path; `GearHintTooltipContent` composes per-spec sections.

### Fixed

- **Edit character:** Changing main or off spec without re-importing gear no longer saves the previous spec’s items under the new spec; gear drafts are cleared on spec change and only persist when tied to the selected spec name (`character-edit-spec-gear.ts`).

## [1.19.0] - 2026-06-27

### Added

- **Class/spec equip rules:** Gear upgrade hints and BiS slot validation respect WotLK usability — armor type, weapon proficiencies, ranged slot (wands vs bows, etc.), dual wield (e.g. Enhancement shaman), and Titan’s Grip (Fury/Arms warrior 2H off-hand). Rules mirror WowSims `canEquipItem`; loot suggestions no longer offer items the character cannot wear (e.g. crossbows for priests).
- **Bundled equip metadata:** `wotlk-item-equip-props.json` (weapon/armor/ranged types + class allowlists per item id); `utils/item-equip-restrictions.ts` with `canEquipItemForCharacter` and `filterUsableLootItemIds`.

### Changed

- **Gear upgrade hints:** `evaluateGearUpgradeHint` takes the character’s class and main spec and filters raid loot before picking best upgrades per slot.
- **BiS lists:** Confirming or saving slot items rejects gear not usable by the panel’s selected class/spec.
- **`npm run build:wow-data`:** Also writes `src/data/wotlk-item-equip-props.json`.

## [1.18.0] - 2026-06-27

### Added

- **Tier set token hints:** Gear-upgrade tooltips on character toggle cells include a token table when the hovered dungeon row drops sanctification / ToC tokens and the character’s BiS list targets tier set pieces still needing an upgrade. Shows token name (linked), quantity, and gear slots; ICC (10H / 25N / 25H) and ToC token bosses only — no table on raids that do not drop tokens (e.g. Ruby Sanctum).
- **Bundled tier set data:** `tier-sets-by-item-id.json` (upgrade chains per set slot), `tier-set-tokens.ts` (T10 + T9 token ids and drop sources), `evaluateTierSetHint` in `utils/tier-set-hint.ts`; `GearHintTooltipContent` composes loot summary and token rows.

### Changed

- **`npm run build:wow-data`:** Also writes `src/data/tier-sets-by-item-id.json` from `scripts/wowsims-db.json` (PvE tier sets T8–T10; excludes PvP Gladiator sets).

## [1.17.1] - 2026-06-27

### Changed

- **Item links:** `WowItemLink` names use ilvl-tier color (same scale as dungeon ilvl), bold weight, and a dotted underline so items stand out from slot labels and plain text in stored gear and BiS lists. Unknown item ids use a purple fallback. Styles in `wow-item-link/item-link-styles.ts`.

## [1.17.0] - 2026-06-27

### Added

- **UI locale:** Header **EN** / **RU** toggles the full interface — toolbar, forms, dialogs, table, BiS panel, export, validation errors, and storage alerts — in addition to item tooltips. Copy lives in `src/i18n/messages/` (`en.ts`, `ru.ts`); components use `useTranslation()` (`t("key")`). Domain labels (classes, specs, template raid names, gear slots, difficulties, emblems) resolve via `src/i18n/localized-domain.ts` and existing `RaidNames` / `ClassSpecNames` metadata.

### Changed

- **Export & table display:** Dungeon short names, spec labels in export lines, and template raid names in the grid follow the selected locale (e.g. ICC ↔ ЦЛК, heroic `H` vs `хм`).
- **Locale storage:** Same `localStorage` key as before (`my-raid-cds-item-tooltip-locale`); preference now drives UI strings and item tooltip provider (Cavern of Time / WoWRoad).

## [1.16.0] - 2026-06-27

### Added

- **BiS lists:** Toolbar **BiS lists** panel — pick class and spec, view built-in presets (read-only), create and edit local presets with item IDs per gear slot, save under a custom name, and delete local lists. Built-in presets can be copied via **Save list**. Selection is persisted in `localStorage` (`my-raid-cds-bis-lists`).
- **Character gear import:** **Edit character** accepts WowSimsExporter JSON paste to import equipped items; shows a gear summary and per-slot item links with tooltips. Optional spec from the export can fill main spec when empty.
- **Gear upgrade hints:** Character toggle cells get a subtle background tint when imported gear has upgrades in that dungeon’s item-level tier. Tooltip lists upgradeable slots; when a BiS list is selected for the character’s spec, hints filter to BiS-relevant loot only.
- **Item tooltips:** Header **EN** / **RU** toggle switches item tooltip provider (Cavern of Time / WoWRoad). Item names and links follow the selected locale.
- **Bundled WoW data:** WotLK item levels, English and Russian names, gear-slot mappings, and raid loot indexed by template raid key — used for gear display, BiS validation, and upgrade hints.
- **`npm run build:wow-data`:** Regenerates bundled data from `scripts/wowsims-db.json` (pass `--skip-ru` to skip WoWRoad Russian name fetch).

### Changed

- **Local storage:** `schemaVersion` **4** — characters may store `gearItems` (`{ slot, id, enchant?, gems? }[]`); template dungeons persist optional `raidKey` for slot-aware loot lookup.

## [1.15.0] - 2026-06-26

### Added

- **Edit dungeon:** **Edit** icon on each dungeon row opens `DungeonEditDialog` to customize name, short name, size, mode (Normal/Heroic), and emblem badge. Item levels and cooldown toggles are unchanged.

## [1.14.0] - 2026-06-24

### Added

- **Export panel:** Per-character spec selection — icon checkboxes for main and off spec (when set); characters without specs can be included or excluded individually.

### Changed

- **Export lines:** Roster detail uses `Name: ShortSpec gs` per character; multiple specs are comma-separated; characters on a raid line are separated by ` / `. Spec labels use class-scoped short names from `data/class-specs.ts`; gear scores in copy text omit the `k` suffix (e.g. `6.6`, rounded down). Table headers and tooltips still show compact gear scores with `k` (e.g. `6.6k`).

## [1.13.1] - 2026-06-25

### Changed

- **Export:** Toolbar **Import** renamed to **Export** — the panel still builds copy-ready CD status lines; a real import flow is planned later. Code and docs use `export-panel`, `build-export-status.ts`, `format-character-export.ts`, etc.

### Fixed

- **Gear score display:** Compact gear scores in character column headers and export lines round **down** to one decimal in thousands (e.g. `5599` → `5.5k`, not `5.6k`).

## [1.13.0] - 2026-06-24

### Added

- **Character specs & gear:** Optional main/off talent spec and gear score per character (WotLK specs per class). Set when adding a character or via **Edit** in the character column header (`CharacterEditDialog`).
- **Spec icons:** WotLK talent icons in spec dropdowns and in the character column (icon + compact gear score; full spec name in tooltip).
- **Import roster detail:** Copy lines include per-character spec abbreviations and compact gear scores, e.g. `ЦЛК25хм - Elst Udk 6.6k \ Blood 6k` (class-scoped short labels from `data/class-specs.ts`).

### Changed

- **Local storage:** `schemaVersion` **3** — characters may store `mainSpec` / `offSpec` (`{ spec, gearScore? }`). Older saves with flat `mainSpec`/`offSpec` strings or a single `gearScore` field migrate on load.

## [1.12.2] - 2026-06-22

### Changed

- **Internal:** Added Vitest test suite (utils, storage parse/persist, character/dungeon forms, table empty state). CI runs `npm run test:run` after lint. Colocated `*.test.ts` / `*.test.tsx` files; shared helpers in `src/test/`.

## [1.12.1] - 2026-06-22

### Fixed

- **Import:** Character checkboxes stay in sync when characters are added or removed while the Import panel is open (new characters are selected by default).

### Changed

- **Internal:** Refactored tracker architecture — domain state in `useTrackerDomain` (context); forms and import panel in `TrackerLayout` (no form keystroke re-renders in toolbar/table); toggle logic in `utils/dungeon-toggles.ts`; character display in `utils/character-display.ts`; `ColorModeProvider` in `contexts/`; type renames (`PersistedTrackerState`, `RaidTrackerStore`). No user-visible behavior change.

## [1.12.0] - 2026-06-21

### Added

- **Import:** Toolbar **Import** action builds copy-ready text from dungeons currently shown in the table (respects name search). One line per matching raid lists characters still without CD (toggle off), e.g. `ICC25H - Char1, Char2` or `ЦЛК25хм - Char1, Char2`. Character checkboxes limit who is included; heroic suffix is `H` for Latin short names and `хм` for Cyrillic.

## [1.11.0] - 2026-06-20

### Added

- **Dungeon short names:** Each dungeon can have an optional short name (abbreviation). WotLK template raids include preset Russian and English abbreviations (e.g. Накс / Naxx, ЦЛК / ICC).
- **Add dungeon:** Optional **Short name** field; when left blank, a default abbreviation is applied for known raid names.
- **Compact table:** Shows the short name on narrow screens with a tooltip for the full dungeon name.
- **Dungeon search:** Matches both full name and short name.

### Changed

- **Local storage:** Saves optional `shortName` on dungeon records; existing saves backfill defaults when the name matches a known template raid.

## [1.10.2] - 2026-06-17

### Fixed

- **Add dungeon:** Removed duplicate-name validation so the same raid can be added multiple times with different difficulty or size.

## [1.10.1] - 2026-06-04

### Changed

- **Header:** GitHub icon links to the project repository ([sergimax/my-raid-cds](https://github.com/sergimax/my-raid-cds)) instead of the author profile.

## [1.10.0] - 2026-06-03

### Added

- **Raid tracker table:** Empty-body hints when there are no dungeons (“Add a dungeon or use Add from template…”) or when name search filters out all rows (“No dungeons match your search”).
- **Accessibility:** Add-character and add-dungeon validation errors use `role="alert"`; empty table rows and context-specific `aria-label` on the tracker grid; empty-state messages use live regions.

### Changed

- **Add forms:** Cancel and submit actions use shared `FormActionsRow`; new-dungeon defaults (size 10, item level `200`) live in `dungeon-form-defaults.ts`.
- **Raid tracker state:** Internal refactor only — add-character and add-dungeon forms behave the same. Form state lives in dedicated hooks; validation moved to `validate-character` / `validate-dungeon` utilities; `useRaidTracker` composes persistence, toggles, and forms.
- **App layout:** `RaidTrackerProvider` and `useRaidTrackerContext()` supply tracker state to the toolbar, main content, and table; `App` only mounts the provider and shell (no change to tracker UI or behavior).
- **Tracker toolbar:** Desktop buttons and narrow-screen menu share one action config (`buildTrackerActions`); labels and behavior stay the same.
- **Character column headers:** Per-character completion counts are precomputed in `useRaidTrackerTableState` (`completionsByCharacterId`); header chips show the same values without recounting on each render.
- **Delete confirmation:** Character and dungeon remove/delete dialog copy is centralized in `getRaidTrackerDeleteDialogProps` / `RaidTrackerDeleteDialog` (same titles, messages, and buttons as before).
- **Responsive layout:** Toolbar menu and compact table columns both use `useCompactLayout()` (below `md`); same breakpoint as before, defined in one place.
- **Local storage:** Load and save logic split into `storage/parse.ts` and `storage/persist.ts` (public API in `storage/index.ts`); new saves include `schemaVersion` (1). Emblems still load only from each dungeon’s saved `emblem` field (no raid-name backfill).
- **Item level tier colors:** Light/dark palettes live in `item-level-tier.ts` and apply via MUI `sx` (same GearScore-style colors as before; less duplicated CSS in the raid tracker table stylesheet).
- **WotLK template data:** `RaidNames` and `DungeonList` split into `raid-names.ts` and `dungeon-list.ts`; rows built with `createTemplateDungeon` (same template raids and emblems as before; `data/dungeons.ts` re-exports).

### Fixed

- **Add dungeon:** Duplicate names (case-insensitive) are rejected with an error, consistent with duplicate character name + class checks.
- **Add from template:** Loading the WotLK raid template is a one-shot fill when the dungeon list is empty; calling it again after dungeons exist no longer appends duplicate rows (toolbar still hides the action when the list is not empty).
- **Corrupted save:** Invalid or unreadable local data shows an error and resets the tracker instead of failing silently with an empty table.

### Removed

- Legacy **CompletionSummary** component (was not shown in the app; per-row and per-character completion counts remain in the raid tracker table).
- Unused `ruRaidNameToEn` / `formatRaidNameRuWithEn` helpers from raid template data (English names remain on `RaidNames` metadata only).

## [1.9.1] - 2026-06-02

### Changed

- **Raid tracker table:** Internal refactor only — table UI and behavior are unchanged. Logic moved into `useRaidTrackerTableState` (sort, search, layout, derived rows); pinned columns use a single render registry; body rows use `DungeonTableRow`; the header row uses `RaidTrackerTableHead`.
- **Delete confirmation:** Character and dungeon delete flows use shared `usePendingDelete`; dialog text and confirm/cancel behavior are the same as in 1.9.0.

## [1.9.0] - 2026-06-01

### Added

- **Delete confirmation:** Removing a character or deleting a dungeon opens an MUI dialog with the entity name, a warning that toggles are removed and the action cannot be undone, and **Cancel** / **Remove** (character) or **Delete** (dungeon) actions.

## [1.8.0] - 2026-05-30

### Changed

- **Responsive header:** Below `md`, tracker actions use a menu icon instead of a wrapped button stack; toolbar stays a single row on narrow screens.
- **Version label:** Moved to the header right (next to the GitHub link).
- **Add character / Add dungeon forms:** Cancel and submit sit in one action row on all viewports (right-aligned).
- **Raid tracker table (compact):** Below `md`, pinned size, difficulty, item level, and completion columns are hidden; dungeon name column and search/header controls use tighter spacing.

### Fixed

- **Add forms:** Cancel, toolbar dismiss, and opening the other form reset entered fields; Cancel uses dedicated close handlers instead of toggle.

## [1.7.0] - 2026-05-29

### Changed

- **Item level tier colors:** Progression grey → green → cyan → blue → violet → orange → red for item level values and matching dungeon names; separate light and dark palettes via CSS variables.
- **Template raid emblems:** Frost emblem on Icecrown Citadel and Ruby Sanctum template rows only (3.3.5a); Triumph removed from the default template list.
- **Emblem persistence:** Emblems load only from the `emblem` field on each dungeon row (no raid-name backfill on load).
- **Dark mode:** Primary palette (`#60a5fa`) and `Switch` styling for cooldown toggles (zinc off state, primary track when on).

## [1.6.0] - 2026-05-29

### Added

- **Completion count chips** in the dungeon completions column and character headers (`done/total` with ratio-based color gradation).

### Changed

- **Completion display:** Plain text replaced with filled MUI `Chip`; colors progress gray → red → yellow → blue → green with WCAG AA contrast for small labels.

## [1.5.0] - 2026-05-29

### Added

- **Light/dark theme:** Toolbar toggle; preference saved to `localStorage` (`my-raid-cds-color-mode`); falls back to system `prefers-color-scheme` when unset.
- **Pre-paint theme sync** in `index.html` (same storage key) to avoid a light flash on load; updates `theme-color` meta and `data-color-mode` on `<html>`.
- **Sticky MUI AppBar** header: app name, version label (`v.x.y.z`), tracker actions, theme toggle, and GitHub link (tooltip: author attribution).

### Changed

- **App header:** Rebuilt with MUI `AppBar` / `Toolbar` (responsive nav-style layout); tracker controls use compact toolbar buttons.
- **Author/version UI:** Moved from footer into the header (`AppVersionLabel`, `AppMetaInfo` with GitHub icon).
- **Theming:** MUI theme via `AppThemeProvider` and `createAppTheme`; global CSS variables in `index.css` switch with `data-color-mode`.
- **Emblem assets:** PNG emblems replaced with WebP.
- **Dev experience:** Split color mode provider/hook into separate modules to satisfy Fast Refresh rules.
- **Scrolling:** Add `scroll-padding-top` to account for the sticky header; share header min-height via `--app-toolbar-min-height`.

### Removed

- **`AppFooter`** and footer styles (metadata now in the header).

## [1.4.0] - 2026-05-28

### Added

- **Emblem icons** beside template raid names in the dungeon column (Triumph for legacy raids, Frost for Icecrown Citadel and Ruby Sanctum); stored on dungeon rows and restored from raid name when loading older saves.
- **Color-coded raid size chips** in the size column (distinct MUI chip color per group size).
- **Heroic mode styling** in the mode column (**N** / **H** chips with stronger Heroic styling).

### Changed

- **App header:** Toolbar actions are passed in as props for a cleaner header layout (`Stack`).
- **Raid tracker table:** Tighter pinned-column layout and dedicated cells for size and mode; character header moved into its own subcomponent.
- **Production build:** Split vendor bundles (React, MUI, MUI icons) with Rollup `manualChunks` for smaller app chunks and better caching.

### Fixed

- **Raid tracker table:** Pinned and character header cells no longer use cell-level overflow/ellipsis that clipped stacks (search field, action buttons); long character names truncate on the name label only.

### Removed

- **dungeon-mode-icons:** Unused SVG assets and module (mode column uses MUI chips instead).

## [1.3.0] - 2026-05-28

### Added

- **Raid tracker table (`RaidTrackerTable`):** MUI table with sticky header, horizontal scroll for character columns, and a pinned left block (delete, dungeon name, size, mode, item level, completion count).
- **Sorting:** Click column headers to sort by dungeon name, size, mode, item level (starting ilvl), or completion count; click a character header to sort rows by that character’s toggles (completed first / last).
- **Dungeon name search:** Filter field in the dungeon name header (substring match, case-insensitive).
- **GearScore-style colors:** Item level values and dungeon names use the same tier palette (grey → blue → violet → orange → red).
- **Completion counts in the table:** Per-character `done/total` under each header; per-dungeon `done/total` in the completion column (no separate summary panel).
- **Icon actions:** MUI icons with tooltips — delete dungeon (`Delete`), reset character toggles (`RestartAlt`), remove character (`Delete`); completions column header uses `SportsScore`.
- **Add from template** when the dungeon list is empty (toolbar).
- **Character name limit:** Max 12 characters in the add-character form (input cap + submit validation).
- **`@mui/icons-material`** for table and toolbar icon buttons.

### Changed

- **App wired to `useRaidTracker`:** Characters, dungeons, toggles, and forms use the shared hook; data persists to `localStorage` (debounced save).
- **Layout:** Main content is full width (not centered); footer stays centered.
- **Add forms:** Only one of character or dungeon form can be open at a time; successful submit closes the form.
- **Mode column:** Table header label is **Mode** (values remain Normal / Heroic); stored field is still `difficulty`.
- **Compact table:** Tighter cell padding, small switches, fixed character column width (fits 12-character names + class icon).
- **WoW class styling:** Character headers and class picker show icon + class-colored name (`characterNameDisplaySx`).

### Removed

- **Completion summary** block above the table (counts live in the table headers and completion column).

### Fixed

- **localStorage:** Load/save dungeons with `difficulty`; older saves that only had **`mode`** map to Normal or Heroic on import.
- **MUI buttons:** Global `button` styles in `index.css` no longer override Material UI button hover/background (fixes white-on-white hover on toolbar actions).

## [1.2.0] - 2026-05-12

### Changed

- Dungeon table: dedicated **Size** column (10 / 25 / …), sticky with the dungeon block when scrolling horizontally; raid-size sort and direction live in the size column header
- Dungeon table: dedicated **Mode** column showing **Normal** or **Heroic**, sticky with that block; mode sort and direction live in the mode column header (ascending: Normal then Heroic; descending: Heroic then Normal, with name and raid size as tie-breakers)
- Dungeon table: dedicated **Completions** column with the per-dungeon marked count (same count badge styling as before), sticky with that block; completions sort and direction live in that column header
- Dungeon table: dedicated **ilvl** column showing **starting** item level (`itemLevel` minimum per row), sticky with that block; tier coloring matches the raid’s item-level band; empty ilvl shows an em dash; item-level sort and direction live in that column header
- Dungeon table: sort by **item level** uses **starting** (lowest) ilvl per dungeon, not the previous max-ilvl comparison; name remains the tie-breaker
- Dungeon table: dungeon header uses a **Name** control (label + direction) instead of a sort `<select>`; name sort and direction apply only when that control is active (other sorts use their column headers)
- Dungeon table: dungeon name cell shows raid name and delete only; completion count is only in the completions column; row hover title still summarizes player size, mode, completions, and full item level list

## [1.1.4] - 2026-04-22

### Changed

- App layout: remove centered max-width wrapper; content is left-aligned and can grow horizontally
- Header: keep action buttons near the app title
- Forms: keep character/dungeon forms compact (max-width) instead of stretching full screen
- Styles: remove adaptive `@media` breakpoints (consistent compact UI at all widths); add missing zinc tokens (`--zinc-100`, `--zinc-300`) for badge/count text colors
- Dungeon table: heroic mode badge is more visually distinct; character columns use equal widths and long names are truncated; table no longer stretches full width

### Refactor

- Dungeon table: split `components/dungeon-table/index.tsx` into smaller components and utilities

## [1.1.3] - 2026-04-20

### Added

- Dungeon table: per-character badge showing how many dungeons are marked (count ignores deleted dungeons)

### Changed

- Dungeon table: character header layout/styles updated to fit the new count badge

## [1.1.2] - 2026-04-09

### Changed

- Main hook module path is kebab-case: `hooks/use-raid-tracker.ts` (exported `useRaidTracker` unchanged)
- Dungeon table: stable `useCallback` handlers for toggles and row actions; `data-*` attributes for IDs; item-level sort reuses a per-sort cache of max item level per dungeon
- Forms and table: event handler parameters use descriptive names (e.g. `event`) for readability

### Docs

- README project structure lists `use-raid-tracker.ts`
- Cursor project rules: naming section (kebab-case file paths, avoid oversimplified local names)

## [1.1.1] - 2026-04-06

### Changed

- Footer copy: single line `version <semver> by sergimax via cursor` (version from `package.json` via Vite); `sergimax` and `cursor` link to GitHub profile and Cursor site; GitHub mark icon removed

## [1.1.0] - 2026-04-05

### Added

- Dungeon name search in the table header (case-insensitive substring filter; empty search shows all rows)
- Monospace font stack for the whole app, including form controls

### Changed

- Dungeon table: per-row delete stays in the dungeon column; distinct cool-toned styling for that column vs character cells
- Table chrome simplified (bottom borders, lighter sticky separation); raid size badge without outline border
- Sorting defaults to item level descending; “Default” sort option removed
- Delete all dungeons control removed (remove dungeons with per-row delete only)
- Shared design tokens on `:root` (`--zinc-*`, borders, table surfaces); forms and dungeon table use them for colors
- `App.css`: one consolidated `1024px` media block; footer styles live with `AppFooter`
- `AppFooter` in `components/app-footer/` (`index.tsx`, `types.ts`, `styles.css`) and exported from the components barrel
- Dungeon table: single memo for filtered+sorted rows; tooltip/toggle helpers; ilvl tier from a threshold list instead of a long branch chain
- Dungeon form: `useMemo` for available presets and for the effective preset `<select>` value

### Fixed

- Toolbar button rules in `App.css` apply only to header actions so “Add character” / “Add dungeon” stay primary (indigo), not overridden by gray header styling

### Docs

- README usage steps and Cursor project rules updated for current flows (e.g. search, no delete-all)

## [1.0.3] - 2026-03-21

### Added

- Dungeon form preset selector: pick from WotLK template when adding manually (presets already in table are hidden)
- Raid names shown with Russian (in-game) and English (original) in parentheses
- `displayDungeonName` helper for locale-based dungeon name display

### Changed

- Dungeon form receives `existingDungeons` to filter preset options and avoid invalid select state

## [1.0.2] - 2026-03-13

### Changed

- Compact desktop layout at 1024px+ (smaller padding, buttons, table cells, toggles, icons)
- Consolidated and reorganized CSS across App, forms, and dungeon table

## [1.0.1] - 2026-03-11

### Added

- Zebra striping for odd table rows

## [1.0.0] - 2026-03-11

### Added

- Raid cooldown tracker: characters, dungeons, per-character–dungeon toggles
- Add characters with WoW class (Death Knight, Druid, Hunter, Mage, Paladin, Priest, Rogue, Shaman, Warlock, Warrior)
- Add dungeons manually (name, size 10/20/25/40, item level, mode Normal/Heroic)
- Add from template: load WoW WotLK raids (Russian names) when table is empty
- Toggle cooldown usage per character–dungeon pair
- Reset all cooldown toggles (Reset dungeons button)
- Reset toggles per character (🔄 button in character header)
- Delete all dungeons (Delete all button in table header)
- Delete individual characters or dungeons (🗑️ icon)
- Dungeon table sorting by name, size, or item level
- GearScore-style item level coloring
- localStorage persistence
- App version in footer (from package.json)

### Changed

- Dungeon list starts empty by default (no preloaded dungeons)
