/**
 * Release-file presence check for CI.
 *
 * When `package.json` version changes vs the comparison base, require that the
 * usual release files were also touched in the same git range.
 *
 * Current check (intentionally loose): each required path appears in
 * `git diff --name-only <base>...<head>`.
 *
 * Future (stricter) checks to consider:
 * - Same semver string in package.json, package-lock.json (root + packages[""]),
 *   and both README App_version badges
 * - CHANGELOG.md has a matching `## [X.Y.Z] - YYYY-MM-DD` section for that version
 * - Version is a valid semver bump relative to the base (not equal / not lower)
 */

import { execFileSync } from "node:child_process";
import { parseArgs } from "node:util";

const RELEASE_FILES = [
  "package.json",
  "package-lock.json",
  "README.md",
  "README.ru.md",
  "CHANGELOG.md",
];

function git(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trimEnd();
}

function packageVersionAt(ref) {
  try {
    const raw = git(["show", `${ref}:package.json`]);
    return JSON.parse(raw).version;
  } catch {
    return null;
  }
}

function resolveRefs(cliBase, cliHead) {
  const head =
    cliHead ||
    process.env.RELEASE_CHECK_HEAD ||
    process.env.GITHUB_SHA ||
    "HEAD";

  const base =
    cliBase ||
    process.env.RELEASE_CHECK_BASE ||
    process.env.GITHUB_BASE_SHA ||
    process.env.GITHUB_EVENT_BEFORE ||
    null;

  return { base, head };
}

function isNullOrZeroSha(sha) {
  return !sha || /^0+$/.test(sha);
}

function main() {
  const { values } = parseArgs({
    options: {
      base: { type: "string" },
      head: { type: "string" },
    },
    allowPositionals: false,
  });

  const { base, head } = resolveRefs(values.base, values.head);

  if (isNullOrZeroSha(base)) {
    console.log(
      "No comparison base (first push or missing GITHUB_BASE_SHA) — skipping release-files check.",
    );
    process.exit(0);
  }

  const baseVersion = packageVersionAt(base);
  const headVersion = packageVersionAt(head);

  if (baseVersion === null || headVersion === null) {
    console.error(
      `Could not read package.json version (base=${base}, head=${head}).`,
    );
    process.exit(1);
  }

  if (baseVersion === headVersion) {
    console.log(
      `No package.json version bump (${headVersion}) — skipping release-files check.`,
    );
    process.exit(0);
  }

  console.log(
    `Detected version bump: ${baseVersion} → ${headVersion}. Checking release files were touched…`,
  );

  // Triple-dot: changes on head since merge-base with base (PR-friendly).
  const changed = new Set(
    git(["diff", "--name-only", `${base}...${head}`])
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  );

  const missing = RELEASE_FILES.filter((path) => !changed.has(path));

  if (missing.length > 0) {
    console.error(
      [
        "Release bump is incomplete. When version changes, these files must also change:",
        ...RELEASE_FILES.map((path) => `  - ${path}`),
        "",
        "Missing from this range:",
        ...missing.map((path) => `  - ${path}`),
        "",
        // Reminder for whoever tightens this script later — see file header.
        "(Loose check: file presence only. Stricter version/CHANGELOG content checks may be added later.)",
      ].join("\n"),
    );
    process.exit(1);
  }

  console.log("Release files OK (all required paths changed in this range):");
  for (const path of RELEASE_FILES) {
    console.log(`  - ${path}`);
  }
}

main();
