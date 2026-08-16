import {
  EXPORT_FILTER_GRID_GAP_SPACING,
  EXPORT_FILTER_UNIT_WIDTH,
  getFilterUnitColumnTemplate,
} from "../export-panel/constants.ts";

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
  gridColumnGapPx = EXPORT_FILTER_GRID_GAP_SPACING * 8,
): number {
  return (
    DUNGEON_FORM_GRID_COLUMN_COUNT * EXPORT_FILTER_UNIT_WIDTH +
    (DUNGEON_FORM_GRID_COLUMN_COUNT - 1) * gridColumnGapPx
  );
}

export { EXPORT_FILTER_GRID_GAP_SPACING };
