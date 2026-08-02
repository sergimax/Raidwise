import { describe, expect, it } from "vitest";
import {
  BIS_ITEMS_ALTERNATIVES_VISIBLE_BUDGET,
  BIS_ITEMS_CONTENT_MAX_HEIGHT_XS_PX,
  BIS_LISTS_CHIP_GAP_PX,
  BIS_LISTS_CHIP_HEIGHT_PX,
  BIS_LISTS_VISIBLE_CHIP_COUNT,
  getBisItemsContentMaxHeight,
  getBisListsContentMaxHeight,
  getBisListsContentMaxHeightFromChips,
  getBisListsContentMaxHeightFromItemsColumn,
} from "./constants.ts";

describe("BiS panel height budgets", () => {
  it("sizes items tall enough for a full doll plus a couple of alternatives", () => {
    // 8×58 + 72 + 2×44 = 624
    expect(getBisItemsContentMaxHeight()).toBe(624);
    expect(getBisItemsContentMaxHeight()).toBeGreaterThan(
      BIS_ITEMS_CONTENT_MAX_HEIGHT_XS_PX,
    );
    expect(BIS_ITEMS_ALTERNATIVES_VISIBLE_BUDGET).toBe(2);
  });

  it("caps lists by visible chip count", () => {
    expect(getBisListsContentMaxHeightFromChips()).toBe(
      BIS_LISTS_VISIBLE_CHIP_COUNT * BIS_LISTS_CHIP_HEIGHT_PX +
        (BIS_LISTS_VISIBLE_CHIP_COUNT - 1) * BIS_LISTS_CHIP_GAP_PX,
    );
  });

  it("keeps lists within the leftover under Class & spec vs Items", () => {
    const fromColumn = getBisListsContentMaxHeightFromItemsColumn();
    const fromChips = getBisListsContentMaxHeightFromChips();
    expect(fromColumn).toBeGreaterThan(fromChips);
    expect(getBisListsContentMaxHeight()).toBe(fromChips);
  });
});
