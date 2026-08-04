import { describe, expect, it } from "vitest";
import {
  EXPORT_FILTER_BLOCK_SPANS,
  EXPORT_FILTER_GRID_COLUMN_COUNT,
  EXPORT_PANEL_SIDE_BY_SIDE_MIN_PX,
  EXPORT_PANEL_SIDE_BY_SIDE_MQ,
  EXPORT_PANEL_SIDE_BY_SIDE_MQ_KEY,
  EXPORT_FILTER_SPECS_VISIBLE_ROW_COUNT,
  EXPORT_FILTER_UNIT_HEIGHT,
  EXPORT_FILTER_UNIT_WIDTH,
  getExportFilterBlockHeight,
  getExportFilterGridHeight,
  getExportFilterGridMaxWidth,
  getExportFilterGridTemplateAreas,
  getExportFilterGridTemplateColumns,
  getExportFilterGridTemplateRows,
  getExportFilterSpecsListMaxHeight,
  getExportResultColumnMinWidth,
  getFilterUnitColumnTemplate,
} from "./constants.ts";

describe("getExportFilterGridTemplateAreas", () => {
  it("places raid on row one; GS, role, and specs continue below / right", () => {
    const areas = getExportFilterGridTemplateAreas(true);

    expect(areas).toContain("dungeon dungeon characterSpecs");
    expect(areas).toContain("gearScore role characterSpecs");
    expect(areas.indexOf("dungeon")).toBeLessThan(areas.indexOf("gearScore"));
  });

  it("omits dungeon row when there are no dungeons", () => {
    const areas = getExportFilterGridTemplateAreas(false);

    expect(areas).not.toContain("dungeon");
    expect(areas).toContain("gearScore role characterSpecs");
    expect(areas).toContain(". . characterSpecs");
  });
});

describe("EXPORT_FILTER_BLOCK_SPANS", () => {
  it("uses equal unit-width columns with specs as a 2×1 block", () => {
    expect(EXPORT_FILTER_GRID_COLUMN_COUNT).toBe(3);
    expect(EXPORT_FILTER_BLOCK_SPANS.dungeon).toEqual({
      heightUnits: 1,
      widthUnits: 2,
    });
    expect(EXPORT_FILTER_BLOCK_SPANS.gearScore).toEqual({
      heightUnits: 1,
      widthUnits: 1,
    });
    expect(EXPORT_FILTER_BLOCK_SPANS.role).toEqual({
      heightUnits: 1,
      widthUnits: 1,
    });
    expect(EXPORT_FILTER_BLOCK_SPANS.characterSpecs).toEqual({
      heightUnits: 2,
      widthUnits: 1,
    });
    const unitColumn = getFilterUnitColumnTemplate();
    expect(getExportFilterGridTemplateColumns()).toBe(
      `${unitColumn} ${unitColumn} ${unitColumn}`,
    );
    expect(getExportFilterGridMaxWidth()).toBe(EXPORT_FILTER_UNIT_WIDTH * 3);
  });
});

describe("export filter fixed heights", () => {
  it("uses fixed grid row heights (no auto growth)", () => {
    expect(getExportFilterGridTemplateRows()).toBe(
      `repeat(2, ${EXPORT_FILTER_UNIT_HEIGHT}px)`,
    );
  });

  it("sizes 1× and 2× blocks from the unit height", () => {
    expect(getExportFilterBlockHeight(1)).toBe(EXPORT_FILTER_UNIT_HEIGHT);
    expect(getExportFilterBlockHeight(2)).toBe(EXPORT_FILTER_UNIT_HEIGHT * 2);
  });

  it("fits eight character rows in the specs scroll viewport", () => {
    expect(getExportFilterSpecsListMaxHeight()).toBe(346);
    expect(EXPORT_FILTER_SPECS_VISIBLE_ROW_COUNT).toBe(8);
  });

  it("includes inter-row gap in total filter grid height", () => {
    expect(getExportFilterGridHeight()).toBe(EXPORT_FILTER_UNIT_HEIGHT * 2 + 12);
  });

  it("uses 1680px as the side-by-side layout threshold", () => {
    expect(EXPORT_PANEL_SIDE_BY_SIDE_MIN_PX).toBe(1680);
    expect(EXPORT_PANEL_SIDE_BY_SIDE_MQ).toBe("(min-width:1680px)");
    expect(EXPORT_PANEL_SIDE_BY_SIDE_MQ_KEY).toBe("@media (min-width:1680px)");
  });

  it("sizes the results column as a 2-unit span including gap", () => {
    expect(getExportResultColumnMinWidth()).toBe(
      EXPORT_FILTER_UNIT_WIDTH * 2 + 12,
    );
  });
});
