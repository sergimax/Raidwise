---
name: bump
description: >-
  Bump the app semver, update CHANGELOG.md, and sync README badges/docs for new
  user-facing behavior. Use only when the user invokes /bump or explicitly
  asks to bump/release the version.
disable-model-invocation: true
---

# /bump — Version bump & changelog

Follow `.cursor/rules/versioning-changelog.mdc` exactly. Do not invent a
different versioning or changelog style.

## When to stop without releasing

If there are **no notable user-facing changes** since the previous release
(only internal refactors, comment-only edits, etc.), do **not** bump.
Tell the user why and stop.

## Workflow

Copy and track:

```
Bump progress:
- [ ] 1. Diff since last release
- [ ] 2. Choose MAJOR / MINOR / PATCH
- [ ] 3. Bump version in package.json + package-lock.json
- [ ] 4. Write CHANGELOG.md entry
- [ ] 5. Sync README EN+RU badges / docs for new public surface
- [ ] 6. Summarize for the user (do not commit unless asked)
```

### 1. Diff since last release

- Read current version from `package.json` (`version`) — it must match
  `package-lock.json` root + `packages[""].version` and the README EN+RU
  `App_version` badges; if not, fix that first.
- Collect changes since the previous tagged/released version (or since the
  last dated `CHANGELOG.md` entry if no tag): commits + diff of app sources
  and docs.
- Focus on **user-facing** changes: UI, toolbar panels, storage/schema,
  i18n, deploy path, gear hints, BiS, Character/Soft pick, breaking renames.

### 2. Choose bump type

Per versioning-changelog.mdc:

| Bump | When |
|------|------|
| **PATCH** | Bug fixes, minor tweaks |
| **MINOR** | New features, non-breaking changes |
| **MAJOR** | Breaking changes |

If commits include `BREAKING CHANGE` / `!`, prefer **MAJOR**.

### 3. Bump version (all required places)

Set the same `X.Y.Z` in:

1. `package.json` → `"version": "X.Y.Z"`
2. `package-lock.json` → root `"version"` and `packages[""].version`

Never bump only one of those.

CI later checks these via `npm run check:release-files`
(`scripts/release/check-release-files.mjs`) — that script validates; it does
**not** bump for you.

### 4. Update CHANGELOG.md

- File: `CHANGELOG.md` at repo root
- Keep a Changelog format
- Move content out of `## [Unreleased]` into a new dated release (or write
  the release section from the diff if Unreleased is empty)
- New entry **at the top** (above older releases):

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- ...

### Changed
- ...

### Fixed
- ...
```

Rules:

- Use today's date (`YYYY-MM-DD`) unless the user specifies otherwise.
- Include only sections that have real bullets: `### Added`, `### Changed`,
  `### Deprecated`, `### Removed`, `### Fixed`, `### Security`.
- Describe **actual** changes from the diff/commits — not “bump version”,
  “chore”, or empty filler.
- One clear bullet per user-visible change.

### 5. Docs check (required)

Compare public surface in code vs docs:

| Check | Where |
|-------|--------|
| App version badge | `README.md` and `README.ru.md` (`App_version-X.Y.Z`) |
| New toolbar panels / features | README Features (EN + RU) |
| Persistence / localStorage keys | README Persistence / Хранение |
| Deploy base path (`vite.config.ts` `base`) | README Deployment |
| User-facing schema / storage changes | README + project rules if needed |

If code added behavior not mentioned in docs, **update the docs in the same
bump**. If docs mention removed behavior, fix or remove those lines.

### 6. Finish

- Do **not** create a git commit or tag unless the user asks.
- Report: new version, changelog bullets written, and any doc updates made.
- Optionally remind that CI **Release files** will validate the bump on PR.

## Anti-patterns

- Bumping for “release hygiene” with nothing user-facing
- Changelog that only says “version bump”
- Updating `package.json` but leaving `package-lock.json` or README badges stale
- Skipping the README EN+RU pass after user-facing UI or storage changes
- Leaving notable changes stuck under `## [Unreleased]` after cutting the release
