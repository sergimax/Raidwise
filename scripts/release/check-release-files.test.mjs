import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { expect, it } from "vitest";

const checker = resolve("scripts/release/check-release-files.mjs");

it("skips ordinary changes and validates release files when the version changes", () => {
  const repo = mkdtempSync(join(tmpdir(), "raidwise-release-check-"));
  const git = (...args) =>
    execFileSync("git", args, { cwd: repo, encoding: "utf8" }).trim();
  const write = (path, contents) => writeFileSync(join(repo, path), contents);
  const commit = (message) => {
    git("add", ".");
    git("-c", "commit.gpgsign=false", "commit", "--quiet", "-m", message);
    return git("rev-parse", "HEAD");
  };
  const check = (base, head) =>
    spawnSync(process.execPath, [checker, "--base", base, "--head", head], {
      cwd: repo,
      encoding: "utf8",
    });

  try {
    git("init", "--quiet");
    git("config", "user.email", "test@example.com");
    git("config", "user.name", "Release Check Test");
    write("package.json", JSON.stringify({ version: "1.0.0" }));
    write(
      "package-lock.json",
      JSON.stringify({ version: "1.0.0", packages: { "": { version: "1.0.0" } } }),
    );
    write("README.md", "![version](https://img.shields.io/badge/App_version-1.0.0-purple)\n");
    write("README.ru.md", "![version](https://img.shields.io/badge/App_version-1.0.0-purple)\n");
    write("CHANGELOG.md", "## [1.0.0] - 2026-01-01\n");
    const base = commit("initial release");

    write("notes.md", "Documentation update\n");
    const ordinaryHead = commit("update documentation");
    const ordinary = check(base, ordinaryHead);
    expect(ordinary.status).toBe(0);
    expect(ordinary.stdout).toContain("skipping release-files check");

    write("package.json", JSON.stringify({ version: "1.0.1" }));
    const incompleteHead = commit("incomplete release");
    const incomplete = check(ordinaryHead, incompleteHead);
    expect(incomplete.status).toBe(1);
    expect(incomplete.stderr).toContain("Release bump is incomplete");

    write(
      "package-lock.json",
      JSON.stringify({ version: "1.0.1", packages: { "": { version: "1.0.1" } } }),
    );
    write("README.md", "![version](https://img.shields.io/badge/App_version-1.0.1-purple)\n");
    write("README.ru.md", "![version](https://img.shields.io/badge/App_version-1.0.1-purple)\n");
    write("CHANGELOG.md", "## [1.0.1] - 2026-01-02\n## [1.0.0] - 2026-01-01\n");
    const completeHead = commit("complete release");
    const complete = check(ordinaryHead, completeHead);
    expect(complete.status).toBe(0);
    expect(complete.stdout).toContain("Release files OK for version 1.0.1");
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});
