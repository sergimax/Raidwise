# Lighthouse reports

JSON/HTML audits for local preview and production. Generated manually — not part of CI.

## Local (production build)

```bash
npm run build
npm run preview
```

In another terminal:

```bash
npm run lighthouse          # desktop → http://localhost:4173/raidwise/
npm run lighthouse:mobile   # mobile preset
```

## Production URL

```bash
npm run lighthouse -- https://sergimax.ru/raidwise/
npm run lighthouse:mobile -- https://sergimax.ru/raidwise/
```

Reports are written as `docs/lighthouse/<host>-<preset>-<timestamp>.report.{json,html}`.

On Windows, a project-local `.lighthouse-tmp/` folder is used to reduce chrome-launcher temp cleanup `EPERM` noise. A non-zero CLI exit after files appear is often that cleanup race — open the written HTML/JSON.
