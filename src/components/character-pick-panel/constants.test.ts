import { describe, expect, it } from "vitest";
import {
  FILTER_UNIT_HEIGHT,
  FILTER_UNIT_SPECS_VISIBLE_ROW_COUNT,
  FILTER_UNIT_WIDTH,
  getCharacterSpecListMaxHeight,
  getFilterUnitBlockHeight,
  getFilterUnitColumnTemplate,
} from "../filter-unit/constants.ts";
import {
  CHARACTER_PICK_FILTER_BLOCK_SPANS,
  CHARACTER_PICK_FILTER_GRID_COLUMN_COUNT,
  CHARACTER_PICK_SIDE_BY_SIDE_MIN_PX,
  CHARACTER_PICK_SIDE_BY_SIDE_MQ,
  CHARACTER_PICK_SIDE_BY_SIDE_MQ_KEY,
  getCharacterPickFilterGridHeight,
  getCharacterPickFilterGridMaxWidth,
  getCharacterPickFilterGridTemplateAreas,
  getCharacterPickFilterGridTemplateColumns,
  getCharacterPickFilterGridTemplateRows,
  getCharacterPickResultColumnMinWidth,
} from "./constants.ts";

describe("getCharacterPickFilterGridTemplateAreas", () => {
  it("places raid on row one; GS, role, and specs continue below / right", () => {
    const areas = getCharacterPickFilterGridTemplateAreas(true);

    expect(areas).toContain("dungeon dungeon characterSpecs");
    expect(areas).toContain("gearScore role characterSpecs");
    expect(areas.indexOf("dungeon")).toBeLessThan(areas.indexOf("gearScore"));
  });

  it("omits dungeon row when there are no dungeons", () => {
    const areas = getCharacterPickFilterGridTemplateAreas(false);

    expect(areas).not.toContain("dungeon");
    expect(areas).toContain("gearScore role characterSpecs");
    expect(areas).toContain(". . characterSpecs");
  });
});

describe("CHARACTER_PICK_FILTER_BLOCK_SPANS", () => {
  it("uses equal unit-width columns with specs as a 2×1 block", () => {
    expect(CHARACTER_PICK_FILTER_GRID_COLUMN_COUNT).toBe(3);
    expect(CHARACTER_PICK_FILTER_BLOCK_SPANS.dungeon).toEqual({
      heightUnits: 1,
      widthUnits: 2,
    });
    expect(CHARACTER_PICK_FILTER_BLOCK_SPANS.gearScore).toEqual({
      heightUnits: 1,
      widthUnits: 1,
    });
    expect(CHARACTER_PICK_FILTER_BLOCK_SPANS.role).toEqual({
      heightUnits: 1,
      widthUnits: 1,
    });
    expect(CHARACTER_PICK_FILTER_BLOCK_SPANS.characterSpecs).toEqual({
      heightUnits: 2,
      widthUnits: 1,
    });
    const unitColumn = getFilterUnitColumnTemplate();
    expect(getCharacterPickFilterGridTemplateColumns()).toBe(
      `${unitColumn} ${unitColumn} ${unitColumn}`,
    );
    expect(getCharacterPickFilterGridMaxWidth()).toBe(FILTER_UNIT_WIDTH * 3);
  });
});

describe("character pick filter fixed heights", () => {
  it("uses fixed grid row heights (no auto growth)", () => {
    expect(getCharacterPickFilterGridTemplateRows()).toBe(
      `repeat(2, ${FILTER_UNIT_HEIGHT}px)`,
    );
  });

  it("sizes 1× and 2× blocks from the unit height", () => {
    expect(getFilterUnitBlockHeight(1)).toBe(FILTER_UNIT_HEIGHT);
    expect(getFilterUnitBlockHeight(2)).toBe(FILTER_UNIT_HEIGHT * 2);
  });

  it("fits eight character rows in the specs scroll viewport", () => {
    expect(getCharacterSpecListMaxHeight()).toBe(346);
    expect(FILTER_UNIT_SPECS_VISIBLE_ROW_COUNT).toBe(8);
  });

  it("includes inter-row gap in total filter grid height", () => {
    expect(getCharacterPickFilterGridHeight()).toBe(
      FILTER_UNIT_HEIGHT * 2 + 12,
    );
  });

  it("uses 1680px as the side-by-side layout threshold", () => {
    expect(CHARACTER_PICK_SIDE_BY_SIDE_MIN_PX).toBe(1680);
    expect(CHARACTER_PICK_SIDE_BY_SIDE_MQ).toBe("(min-width:1680px)");
    expect(CHARACTER_PICK_SIDE_BY_SIDE_MQ_KEY).toBe(
      "@media (min-width:1680px)",
    );
  });

  it("sizes the results column as a 2-unit span including gap", () => {
    expect(getCharacterPickResultColumnMinWidth()).toBe(
      FILTER_UNIT_WIDTH * 2 + 12,
    );
  });
});
