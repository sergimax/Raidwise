import {
  FILTER_UNIT_GRID_GAP_SPACING,
  FILTER_UNIT_WIDTH,
  getFilterUnitColumnTemplate,
} from "../filter-unit/constants.ts";

/** Two columns: name/short | type/ilvl. */
export const DUNGEON_FORM_GRID_COLUMN_COUNT = 2;

export function getDungeonFormGridTemplateColumns(): string {
  const unitColumn = getFilterUnitColumnTemplate();
  return `${unitColumn} ${unitColumn}`;
}

export function getDungeonFormGridTemplateAreas(): string {
  return [
    '"name type"',
    '"shortName itemLevels"',
  ].join(" ");
}

/** Content width of the 2-column unit grid (columns + inter-column gap). */
export function getDungeonFormGridMaxWidth(
  gridColumnGapPx = FILTER_UNIT_GRID_GAP_SPACING * 8,
): number {
  return (
    DUNGEON_FORM_GRID_COLUMN_COUNT * FILTER_UNIT_WIDTH +
    (DUNGEON_FORM_GRID_COLUMN_COUNT - 1) * gridColumnGapPx
  );
}

export { FILTER_UNIT_GRID_GAP_SPACING };
