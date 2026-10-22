# Checklist

Author fills every applicable box before merge. Note N/A items in the PR description.

## Quality

- [ ] `npm i` - found 0 vulnerabilities
- [ ] `npm run ci` passes locally (lint + tests with coverage + build)
- [ ] `npm run test:browser` passes locally (browser smoke checks)
- [ ] No secrets, credentials, or local-only paths committed

<!-- ### User-facing (skip if pure internal) -->

<!-- - [ ] EN + RU strings updated in `src/i18n/messages/` -->
<!-- - [ ] README Features updated in **both** `README.md` and `README.ru.md` when public behavior changed -->
<!-- - [ ] Persistence docs updated if `localStorage` keys or `schemaVersion` changed -->

## Release (only when bumping the app version)

CI **Release files** validates these files when the app version changes — see `/bump` / `scripts/release/check-release-files.mjs`.

- [ ] Version bumped in `package.json` **and** `package-lock.json` (root + `packages[""]`)
- [ ] `CHANGELOG.md` has `## [X.Y.Z] - YYYY-MM-DD` with real user-facing bullets (not “version bump”)
- [ ] `App_version` badges in `README.md` and `README.ru.md` match the new version

# Changelog draft

<!-- Paste the CHANGELOG bullets for this PR (same wording as CHANGELOG.md). -->
