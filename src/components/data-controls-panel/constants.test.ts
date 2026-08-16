import { describe, expect, it } from "vitest";
import {
  FILTER_UNIT_HEIGHT,
  FILTER_UNIT_WIDTH,
  getFilterUnitColumnTemplate,
} from "../filter-unit/constants.ts";
import {
  DATA_CONTROLS_GRID_COLUMN_COUNT,
  getDataControlsGridMaxWidth,
  getDataControlsGridTemplateAreas,
  getDataControlsGridTemplateColumns,
  getDataControlsGridTemplateRows,
} from "./constants.ts";

describe("data controls grid", () => {
  it("uses a 2×2 unit layout matching Character pick block sizes", () => {
    expect(DATA_CONTROLS_GRID_COLUMN_COUNT).toBe(2);
    const unitColumn = getFilterUnitColumnTemplate();
    expect(getDataControlsGridTemplateColumns()).toBe(
      `${unitColumn} ${unitColumn}`,
    );
    expect(getDataControlsGridTemplateRows()).toBe(
      `repeat(2, ${FILTER_UNIT_HEIGHT}px)`,
    );
    expect(getDataControlsGridTemplateAreas()).toContain(
      "resetToggles deleteCharacters",
    );
    expect(getDataControlsGridTemplateAreas()).toContain(
      "deleteDungeons deleteBisLists",
    );
    expect(getDataControlsGridMaxWidth()).toBe(
      FILTER_UNIT_WIDTH * 2 + 12,
    );
  });
});
