import { describe, expect, it } from "vitest";
import {
  EXPORT_FILTER_UNIT_HEIGHT,
  EXPORT_FILTER_UNIT_WIDTH,
} from "../export-panel/constants.ts";
import {
  GEAR_PICK_COPY_BLOCK_SPAN,
  getGearPickCopyBlockMaxHeight,
  getGearPickCopyBlockMaxWidth,
  getGearPickGridTemplateAreas,
  getGearPickGridTemplateColumns,
  getGearPickGridTemplateRows,
  getGearPickMdLayoutMinWidth,
  getGearPickSoftsBlockMaxHeight,
  getGearPickSoftsBlockMaxWidth,
  getGearPickWideLayoutMinWidth,
} from "./constants.ts";

describe("getGearPickGridTemplateAreas", () => {
  it("stacks softs and copy under the filter pair when they do not fit beside", () => {
    const areas = getGearPickGridTemplateAreas("filters");

    expect(areas).toContain("dungeon characterSpecs");
    expect(areas).toContain("rules characterSpecs");
    expect(areas).toContain("softs softs");
    expect(areas).toContain("copy copy");
  });

  it("places softs beside filters with copy on its own row when softs fits", () => {
    const areas = getGearPickGridTemplateAreas("md");

    expect(areas).toContain("dungeon characterSpecs softs");
    expect(areas).toContain("rules characterSpecs softs");
    expect(areas).toContain("copy copy .");
  });

  it("places copy top-right when softs and copy both fit beside filters", () => {
    const areas = getGearPickGridTemplateAreas("wide");

    expect(areas).toContain("dungeon characterSpecs softs copy");
    expect(areas).toContain("rules characterSpecs softs .");
  });
});

describe("GEAR_PICK_COPY_BLOCK_SPAN", () => {
  it("is a 1×2 filter unit including the inter-column gap", () => {
    expect(GEAR_PICK_COPY_BLOCK_SPAN).toEqual({
      heightUnits: 1,
      widthUnits: 2,
    });
    expect(getGearPickCopyBlockMaxWidth()).toBe(
      EXPORT_FILTER_UNIT_WIDTH * 2 + 12,
    );
    expect(getGearPickCopyBlockMaxHeight()).toBe(EXPORT_FILTER_UNIT_HEIGHT);
    expect(getGearPickSoftsBlockMaxWidth()).toBe(
      EXPORT_FILTER_UNIT_WIDTH * 2 + 12,
    );
    expect(getGearPickSoftsBlockMaxHeight()).toBe(
      EXPORT_FILTER_UNIT_HEIGHT * 2 + 12,
    );
  });
});

describe("getGearPickGridTemplateColumns", () => {
  it("uses two fixed filter columns when softs wraps below", () => {
    const unitColumn = `${EXPORT_FILTER_UNIT_WIDTH}px`;
    expect(getGearPickGridTemplateColumns("filters")).toBe(
      `${unitColumn} ${unitColumn}`,
    );
  });

  it("adds a fixed 2-unit softs column when softs fits beside filters", () => {
    const unitColumn = `${EXPORT_FILTER_UNIT_WIDTH}px`;
    const softsColumn = `${getGearPickSoftsBlockMaxWidth()}px`;
    expect(getGearPickGridTemplateColumns("md")).toBe(
      `${unitColumn} ${unitColumn} ${softsColumn}`,
    );
  });

  it("adds softs and copy columns when both fit beside filters", () => {
    const unitColumn = `${EXPORT_FILTER_UNIT_WIDTH}px`;
    const softsColumn = `${getGearPickSoftsBlockMaxWidth()}px`;
    expect(getGearPickGridTemplateColumns("wide")).toBe(
      `${unitColumn} ${unitColumn} ${softsColumn} ${getGearPickCopyBlockMaxWidth()}px`,
    );
  });
});

describe("getGearPickGridTemplateRows", () => {
  it("adds softs and copy rows under filters when they wrap", () => {
    expect(getGearPickGridTemplateRows("filters")).toBe(
      `repeat(2, ${EXPORT_FILTER_UNIT_HEIGHT}px) ${getGearPickSoftsBlockMaxHeight()}px ${getGearPickCopyBlockMaxHeight()}px`,
    );
  });

  it("keeps two filter rows plus a copy row when softs is beside", () => {
    expect(getGearPickGridTemplateRows("md")).toBe(
      `repeat(2, ${EXPORT_FILTER_UNIT_HEIGHT}px) ${EXPORT_FILTER_UNIT_HEIGHT}px`,
    );
  });

  it("uses only the two fixed rows on wide", () => {
    expect(getGearPickGridTemplateRows("wide")).toBe(
      `repeat(2, ${EXPORT_FILTER_UNIT_HEIGHT}px)`,
    );
  });
});

describe("Soft pick container layout widths", () => {
  it("requires filters+softs before softs sits beside, then +copy for wide", () => {
    expect(getGearPickMdLayoutMinWidth()).toBe(1236);
    expect(getGearPickWideLayoutMinWidth()).toBe(1860);
    expect(getGearPickWideLayoutMinWidth()).toBeGreaterThan(
      getGearPickMdLayoutMinWidth(),
    );
  });
});
