# Raidwise project instructions

These instructions are the shared source of project rules for Codex and other
coding agents working in this repository.

## Focused repository work

- This is a React 19 + TypeScript + Vite app using Material UI. Follow the
  existing app structure and conventions; do not import conventions from the
  separate Raidwise WoW addon project.
- Search for symbols with `rg` before reading whole files. Keep investigation
  focused on the relevant modules and contracts.
- Domain state and persistence live in the existing hooks, contexts, and
  `src/storage/`; localized UI strings live in `src/i18n/messages/`.
- Tests are colocated as `*.test.ts` and `*.test.tsx`. Select relevant checks
  from `package.json`; use `npm run lint`, `npm run test:run`, and `npm run build`
  as appropriate. Do not bump the app version or update the changelog unless
  asked for a release.
- Review `git diff --stat` and the relevant diff before completing work. Keep
  changes scoped and update user-facing documentation when behavior changes.

## Code style

- Use TypeScript and React patterns already established in `src/`.
- Keep components focused and state ownership consistent with the existing
  domain hooks and context providers.
- Match existing formatting, naming, and Material UI usage in touched files.
- Preserve English and Russian UI parity when changing localized strings.

## Naming and structure

- Use kebab-case for component and utility file names, matching nearby files.
- Keep tests next to the code they cover.
- Keep shared domain logic in existing hooks or `src/utils/`, and keep UI
  components presentational where that matches the surrounding design.

## Commit messages

Use Conventional Commits: `<type>[optional scope]: <description>`.

- Generate exactly one commit message for the current staged changes. Summarize
  related changes across files in one concise subject.
- Return only that single message; do not produce alternatives, a list of
  separate messages, or a detailed change summary in the body.
- Use `feat` for features, `fix` for bug fixes, `docs` for documentation,
  `style` for formatting, `refactor` for refactoring, `perf` for performance,
  `test` for tests, and `chore` for tooling and maintenance.
- Add a scope when it helps identify the affected area, for example
  `feat(app-header): add locale toggle`.
- Mark breaking changes with `!` after the type or scope, or explain them with
  a `BREAKING CHANGE:` footer.
- Do not create a commit unless requested.

## Versioning and changelog

- The application version is in `package.json` and is exposed to the app through
  Vite. Ordinary edits do not change it.
- Only bump the version and update `CHANGELOG.md` when the user asks for a
  release or version bump.
- For a requested release, review user-facing changes since the previous
  release, update the changelog in Keep a Changelog style, and keep any
  corresponding README descriptions current.
- Do not create a commit or tag unless requested.
