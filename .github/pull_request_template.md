## Summary

<!-- What changed and why (1–3 sentences). -->

## Checklist

Author fills every applicable box before merge. Mark N/A items as checked with a short note in Summary if needed.

### Quality

- [ ] `npm run ci` passes locally (lint + `test:run` + build)
- [ ] Tests added or updated for bug fixes and new features
- [ ] No secrets, credentials, or local-only paths committed

<!-- ### User-facing (skip if pure internal) -->

<!-- - [ ] EN + RU strings updated in `src/i18n/messages/` -->
<!-- - [ ] README Features updated in **both** `README.md` and `README.ru.md` when public behavior changed -->
<!-- - [ ] Persistence docs updated if `localStorage` keys or `schemaVersion` changed -->

### Release (required for merge to `main`)

CI **Release files** fails without a full bump — see `/bump` / `scripts/release/check-release-files.mjs`.

- [ ] Version bumped in `package.json` **and** `package-lock.json` (root + `packages[""]`)
- [ ] `CHANGELOG.md` has `## [X.Y.Z] - YYYY-MM-DD` with real user-facing bullets (not “version bump”)
- [ ] `App_version` badges in `README.md` and `README.ru.md` match the new version

## Changelog draft

<!-- Paste the CHANGELOG bullets for this PR (same wording as CHANGELOG.md). -->
