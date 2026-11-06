# Lighthouse reports

Run Lighthouse manually against a local preview or production URL. CI runs a separate browser smoke suite.

The reports committed here are archived desktop measurements from August 2026. They used a local build under the former `/my-raid-cds/` base path. The latest archived [HTML report](localhost-desktop-20260807T012013.report.html) and its [JSON data](localhost-desktop-20260807T012013.report.json) are the source of the README badges.

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
