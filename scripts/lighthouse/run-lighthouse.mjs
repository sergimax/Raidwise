/**
 * Run Lighthouse against a URL and write JSON + HTML under docs/lighthouse/.
 *
 * Prerequisites for local preview:
 *   npm run build && npm run preview
 *
 * Usage:
 *   npm run lighthouse              # desktop → http://localhost:4173/my-raid-cds/
 *   npm run lighthouse:mobile       # mobile preset, same URL
 *   node scripts/lighthouse/run-lighthouse.mjs https://sergimax.ru/my-raid-cds/
 *   node scripts/lighthouse/run-lighthouse.mjs http://localhost:4173/my-raid-cds/ --mobile
 *
 * On Windows, a project-local temp dir reduces chrome-launcher EPERM cleanup noise.
 * A non-zero exit after the report is written is often that cleanup race — check the output files.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = path.join(root, "docs", "lighthouse");
const defaultUrl = "http://localhost:4173/my-raid-cds/";

function parseArgs(argv) {
  const flags = new Set(argv.filter((arg) => arg.startsWith("--")));
  const positionals = argv.filter((arg) => !arg.startsWith("--"));
  return {
    url: positionals[0] ?? defaultUrl,
    mobile: flags.has("--mobile"),
  };
}

function stamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return (
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  );
}

function hostLabel(url) {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1"
      ? "localhost"
      : hostname.replace(/\./g, "-");
  } catch {
    return "report";
  }
}

function resolveLighthouseBin() {
  const require = createRequire(import.meta.url);
  const packageJsonPath = require.resolve("lighthouse/package.json");
  const binRelative = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")).bin
    ?.lighthouse;
  if (!binRelative || typeof binRelative !== "string") {
    throw new Error("Could not resolve lighthouse binary from package.json");
  }
  return path.join(path.dirname(packageJsonPath), binRelative);
}

const { url, mobile } = parseArgs(process.argv.slice(2));
const preset = mobile ? "mobile" : "desktop";
const outputBase = path.join(
  outDir,
  `${hostLabel(url)}-${preset}-${stamp()}`,
);

fs.mkdirSync(outDir, { recursive: true });

const tmpDir = path.join(root, ".lighthouse-tmp");
fs.mkdirSync(tmpDir, { recursive: true });

const lighthouseBin = resolveLighthouseBin();
const args = [
  url,
  `--preset=${preset}`,
  "--output=json",
  "--output=html",
  `--output-path=${outputBase}`,
  "--chrome-flags=--disable-extensions",
];

console.log(`Lighthouse ${preset}: ${url}`);
console.log(`Output prefix: ${outputBase}.{json,html}`);

const result = spawnSync(process.execPath, [lighthouseBin, ...args], {
  cwd: root,
  stdio: "inherit",
  env: {
    ...process.env,
    TMP: tmpDir,
    TEMP: tmpDir,
  },
});

const jsonPath = `${outputBase}.report.json`;
const htmlPath = `${outputBase}.report.html`;
// Lighthouse may use .json / .html or .report.json depending on version — check both.
const candidates = [
  jsonPath,
  `${outputBase}.json`,
  htmlPath,
  `${outputBase}.html`,
];
const written = candidates.filter((filePath) => fs.existsSync(filePath));
if (written.length > 0) {
  console.log("Wrote:");
  for (const filePath of written) {
    console.log(`  ${path.relative(root, filePath)}`);
  }
} else {
  console.error("No report files found after run.");
}

process.exitCode = result.status === null ? 1 : result.status;
