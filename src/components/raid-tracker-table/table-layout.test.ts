import { describe, expect, it } from "vitest";
import {
  COMPACT_PINNED_WIDTHS,
  PINNED_COLUMNS,
  PINNED_WIDTHS,
  pinnedAddDungeonSpanSx,
  pinnedAddDungeonSpanWidth,
  raidTrackerTableColumnCount,
} from "./table-layout.ts";

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

describe("pinnedAddDungeonSpanWidth", () => {
  it("sums actions + all visible pinned columns on wide layout", () => {
    expect(pinnedAddDungeonSpanWidth(false, PINNED_COLUMNS)).toBe(
      PINNED_WIDTHS.actions +
        PINNED_WIDTHS.name +
        PINNED_WIDTHS.type +
        PINNED_WIDTHS.itemLevel +
        PINNED_WIDTHS.complete,
    );
  });

  it("sums actions + name only on compact layout", () => {
    expect(
      pinnedAddDungeonSpanWidth(true, PINNED_COLUMNS.slice(0, 1)),
    ).toBe(COMPACT_PINNED_WIDTHS.actions + COMPACT_PINNED_WIDTHS.name);
  });
});

describe("pinnedAddDungeonSpanSx", () => {
  it("pins the add-raid span at left 0 with sticky positioning", () => {
    const sx = pinnedAddDungeonSpanSx(false, PINNED_COLUMNS);

    expect(sx).toMatchObject({
      position: "sticky",
      left: 0,
      width: pinnedAddDungeonSpanWidth(false, PINNED_COLUMNS),
    });
  });
});
