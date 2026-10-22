---
name: bump
description: Prepare a requested Raidwise version bump, changelog, and release documentation, then run local CI and browser checks before push.
---

# Version bump and changelog

Read the repository's [AGENTS.md](../../../AGENTS.md) before making release
edits. Paths below are relative to the repository root.

## 1. Establish the release changes

- Read the current version from `package.json`.
- Review commits and the working diff since the previous release. Use the last
  `CHANGELOG.md` heading as the release baseline when possible; if the baseline
  cannot be established, explain the uncertainty instead of inventing changes.
- Identify user-facing changes to the app, UI, persistence, or documented
  behavior. If there are no notable user-facing changes, stop without bumping
  unless the user explicitly requests an exception.

## 2. Choose the version

Use the requested version when supplied. Otherwise choose PATCH for fixes and
small improvements, MINOR for non-breaking features, or MAJOR for breaking
changes, following `AGENTS.md`. Update `package.json`'s version field and the
root `version` and `packages[""].version` in `package-lock.json`. Avoid unrelated
lockfile changes.

## 3. Write the changelog

Add a release heading above older entries in root `CHANGELOG.md`, following its
existing Keep a Changelog format. Use today's date unless specified otherwise.
Include only real user-facing changes supported by the reviewed commits and
diff. Do not add filler about release hygiene.

## 4. Synchronize documentation

Review `README.md` and `README.ru.md` for descriptions affected by the release.
Update both when the change affects documented behavior or usage.
Synchronize their `App_version` badges with the package version.

## 5. Verify locally before push and report

Verify the package and lockfile versions, both README badges, and the changelog
heading against the working tree. Review the diff for accuracy and documentation
coverage. After all release edits, run `npm run ci` and `npm run test:browser`
locally so the user can see whether the current changes pass before pushing
them for pull request review. Fix failures and rerun both commands against the
final working tree. Report any check that cannot run and do not describe the
release as verified in that case. The CI release-files script reads committed
Git refs, so it does not validate uncommitted release edits. Report the
commands and results. Do not create a commit or tag unless the user requested
it.
