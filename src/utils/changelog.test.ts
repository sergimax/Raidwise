import { describe, expect, it } from "vitest";
import { getLatestRelease } from "./changelog.ts";

describe("getLatestRelease", () => {
  it("skips unreleased changes and keeps every change in the newest release", () => {
    const markdown = [
      "## [Unreleased]",
      "### Added",
      "- Not published yet",
      "## [2.1.0] - 2026-10-22",
      "### Added",
      "- First change",
      "- Second change",
      "### Fixed",
      "- Third change",
      "## [2.0.0] - 2026-09-01",
      "### Added",
      "- Older change",
    ].join("\n");

    expect(getLatestRelease(markdown)).toEqual({
      version: "2.1.0",
      changes: [
        { category: "Added", text: "First change" },
        { category: "Added", text: "Second change" },
        { category: "Fixed", text: "Third change" },
      ],
    });
  });

  it("keeps the newest release even when it has no changes", () => {
    expect(getLatestRelease("## [2.1.0]\n\n## [2.0.0]\n### Added\n- Older change"))
      .toEqual({ version: "2.1.0", changes: [] });
  });

  it("returns null when there is no published release", () => {
    expect(getLatestRelease("## [Unreleased]\n### Added\n- Not published yet"))
      .toBeNull();
  });
});
