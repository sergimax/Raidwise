/**
 * Release-file check for CI.
 *
 * Requires a `package.json` version bump vs the comparison base, then:
 * 1. The usual release paths were touched in the git range
 * 2. The new version string is present in:
 *    - package.json
 *    - package-lock.json (root + packages[""])
 *    - README.md / README.ru.md App_version badges
 *    - CHANGELOG.md as a Keep a Changelog heading `## [X.Y.Z]`
 *
 * Future checks to consider:
 * - Version is a valid semver bump relative to the base (not lower / not same major leap)
 * - CHANGELOG date looks sane; Unreleased section discipline
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

function gitShow(ref, path) {
  try {
    return git(["show", `${ref}:${path}`]);
  } catch {
    return null;
  }
}

function packageVersionAt(ref) {
  const raw = gitShow(ref, "package.json");
  if (raw === null) {
    return null;
  }
  try {
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Badge fragment used in both README.md and README.ru.md. */
function readmeBadgeHasVersion(readmeText, version) {
  const pattern = new RegExp(
    `img\\.shields\\.io/badge/App_version-${escapeRegExp(version)}-`,
  );
  return pattern.test(readmeText);
}

function changelogHasVersionHeading(changelogText, version) {
  const pattern = new RegExp(
    `^## \\[${escapeRegExp(version)}\\](?:\\s|$)`,
    "m",
  );
  return pattern.test(changelogText);
}

function collectContentErrors(head, version) {
  const errors = [];

  const packageJsonRaw = gitShow(head, "package.json");
  if (packageJsonRaw === null) {
    errors.push("package.json: could not read at head");
  } else {
    let packageJson;
    try {
      packageJson = JSON.parse(packageJsonRaw);
    } catch {
      errors.push("package.json: invalid JSON");
      packageJson = null;
    }
    if (packageJson && packageJson.version !== version) {
      errors.push(
        `package.json: expected version "${version}", found "${packageJson.version}"`,
      );
    }
  }

  const lockRaw = gitShow(head, "package-lock.json");
  if (lockRaw === null) {
    errors.push("package-lock.json: could not read at head");
  } else {
    let lockfile;
    try {
      lockfile = JSON.parse(lockRaw);
    } catch {
      errors.push("package-lock.json: invalid JSON");
      lockfile = null;
    }
    if (lockfile) {
      if (lockfile.version !== version) {
        errors.push(
          `package-lock.json: expected root version "${version}", found "${lockfile.version}"`,
        );
      }
      const rootPackageVersion = lockfile.packages?.[""]?.version;
      if (rootPackageVersion !== version) {
        errors.push(
          `package-lock.json: expected packages[""].version "${version}", found "${rootPackageVersion}"`,
        );
      }
    }
  }

  for (const readmePath of ["README.md", "README.ru.md"]) {
    const readmeText = gitShow(head, readmePath);
    if (readmeText === null) {
      errors.push(`${readmePath}: could not read at head`);
      continue;
    }
    if (!readmeBadgeHasVersion(readmeText, version)) {
      errors.push(
        `${readmePath}: App_version badge does not include "${version}"`,
      );
    }
  }

  const changelogText = gitShow(head, "CHANGELOG.md");
  if (changelogText === null) {
    errors.push("CHANGELOG.md: could not read at head");
  } else if (!changelogHasVersionHeading(changelogText, version)) {
    errors.push(
      `CHANGELOG.md: missing heading "## [${version}]" (Keep a Changelog section for this release)`,
    );
  }

  return errors;
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
    console.error(
      [
        `No package.json version bump (still ${headVersion}).`,
        "Each push that runs this check must bump the app version and update release files.",
      ].join("\n"),
    );
    process.exit(1);
  }

  console.log(
    `Detected version bump: ${baseVersion} → ${headVersion}. Checking release files…`,
  );

  // Triple-dot: changes on head since merge-base with base (PR-friendly).
  const changed = new Set(
    git(["diff", "--name-only", `${base}...${head}`])
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  );

  const missingPaths = RELEASE_FILES.filter((path) => !changed.has(path));
  const contentErrors = collectContentErrors(head, headVersion);
  const allErrors = [
    ...missingPaths.map(
      (path) => `${path}: not changed in this range (must be updated for a release)`,
    ),
    ...contentErrors,
  ];

  if (allErrors.length > 0) {
    console.error(
      [
        "Release bump is incomplete:",
        ...allErrors.map((error) => `  - ${error}`),
        "",
        "Required: same version in package.json, package-lock.json, README badges,",
        "and a CHANGELOG.md section heading for that version.",
      ].join("\n"),
    );
    process.exit(1);
  }

  console.log(`Release files OK for version ${headVersion}:`);
  for (const path of RELEASE_FILES) {
    console.log(`  - ${path}`);
  }
}

main();
