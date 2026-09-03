import { describe, expect, it } from "vitest";
import { PINNED_COLUMNS, raidTrackerTableColumnCount } from "./table-layout.ts";

describe("raidTrackerTableColumnCount", () => {
  it("counts actions + pinned + characters by default", () => {
    expect(raidTrackerTableColumnCount(PINNED_COLUMNS, 3)).toBe(1 + 4 + 3);
  });

  it("includes the trailing add-character column when requested", () => {
    expect(
      raidTrackerTableColumnCount(PINNED_COLUMNS, 3, {
        includeAddCharacterColumn: true,
      }),
    ).toBe(1 + 4 + 3 + 1);
  });
});
