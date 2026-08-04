import { describe, expect, it } from "vitest";
import {
  EXPORT_FILTER_UNIT_HEIGHT,
  EXPORT_FILTER_UNIT_WIDTH,
  getFilterUnitColumnTemplate,
} from "../export-panel/constants.ts";
import {
  GEAR_PICK_COPY_BLOCK_SPAN,
  GEAR_PICK_SIDE_BY_SIDE_MIN_PX,
  getGearPickCopyBlockMaxHeight,
  getGearPickCopyBlockMaxWidth,
  getGearPickGridTemplateAreas,
  getGearPickGridTemplateColumns,
  getGearPickGridTemplateRows,
} from "./constants.ts";

describe("getGearPickGridTemplateAreas", () => {
  it("places raid on row one; rules below; softs beside; copy 1×2 below on medium", () => {
    const areas = getGearPickGridTemplateAreas("md");

    expect(areas).toContain("dungeon characterSpecs softs");
    expect(areas).toContain("rules characterSpecs softs");
    expect(areas).toContain("copy copy .");
    expect(areas.indexOf("dungeon")).toBeLessThan(areas.indexOf("rules"));
  });

  it("places raid on row one and copy as a 1×2 top-right cell on wide", () => {
    const areas = getGearPickGridTemplateAreas("wide");

    expect(areas).toContain("dungeon characterSpecs softs copy");
    expect(areas).toContain("rules characterSpecs softs .");
    expect(areas.indexOf("dungeon")).toBeLessThan(areas.indexOf("rules"));
  });
});

describe("GEAR_PICK_COPY_BLOCK_SPAN", () => {
  it("is a 1×2 filter unit including the inter-column gap", () => {
    expect(GEAR_PICK_COPY_BLOCK_SPAN).toEqual({
      heightUnits: 1,
      widthUnits: 2,
    });
    // Must include gap: 2×UNIT + 1×gap (not 2×UNIT alone). Matches rules + character specs.
    expect(getGearPickCopyBlockMaxWidth()).toBe(
      EXPORT_FILTER_UNIT_WIDTH * 2 + 12,
    );
    expect(getGearPickCopyBlockMaxHeight()).toBe(EXPORT_FILTER_UNIT_HEIGHT);
  });
});

describe("getGearPickGridTemplateColumns", () => {
  it("uses the shared unit column for rules and character specs on medium", () => {
    const unitColumn = getFilterUnitColumnTemplate();
    const softsColumn = `minmax(${EXPORT_FILTER_UNIT_WIDTH}px, 1fr)`;
    expect(getGearPickGridTemplateColumns("md")).toBe(
      `${unitColumn} ${unitColumn} ${softsColumn}`,
    );
  });

  it("keeps shared unit columns and a 1×2 copy column on wide", () => {
    const unitColumn = getFilterUnitColumnTemplate();
    const softsColumn = `minmax(${EXPORT_FILTER_UNIT_WIDTH}px, 1fr)`;
    // Copy column max uses getGearPickCopyBlockMaxWidth() (gap-inclusive) — keep in sync.
    expect(getGearPickGridTemplateColumns("wide")).toBe(
      `${unitColumn} ${unitColumn} ${softsColumn} minmax(0, ${getGearPickCopyBlockMaxWidth()}px)`,
    );
  });
});

describe("getGearPickGridTemplateRows", () => {
  it("keeps two fixed filter rows plus a 1× copy row on medium", () => {
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

describe("GEAR_PICK_SIDE_BY_SIDE_MIN_PX", () => {
  it("matches Character pick wide breakpoint", () => {
    expect(GEAR_PICK_SIDE_BY_SIDE_MIN_PX).toBe(1680);
  });
});
