---
name: bump
description: Bump the Raidwise app version and prepare its changelog and release documentation when explicitly asked to bump or release.
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
changes, following `AGENTS.md`. Update only `package.json`'s version field.

## 3. Write the changelog

Add a release heading above older entries in root `CHANGELOG.md`, following its
existing Keep a Changelog format. Use today's date unless specified otherwise.
Include only real user-facing changes supported by the reviewed commits and
diff. Do not add filler about release hygiene.

## 4. Synchronize documentation

Review `README.md` and `README.ru.md` for descriptions affected by the release.
Update both when the change affects documented behavior or usage.

## 5. Verify and report

Verify the package version and changelog heading, and review the diff for
accuracy and documentation coverage. Do not create a commit or tag unless the
user requested it.
