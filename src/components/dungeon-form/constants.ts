import {
  FILTER_UNIT_GRID_GAP_SPACING,
  FILTER_UNIT_WIDTH,
} from "../filter-unit/constants.ts";

/** Four sequential sections, wrapping to the available panel width. */
export const DUNGEON_FORM_GRID_COLUMN_COUNT = 4;

export function getDungeonFormGridTemplateColumns(): string {
  return `repeat(auto-fit, minmax(min(100%, ${FILTER_UNIT_WIDTH}px), 1fr))`;
}

/** Content width of the four-column unit grid (columns + inter-column gap). */
export function getDungeonFormGridMaxWidth(
  gridColumnGapPx = FILTER_UNIT_GRID_GAP_SPACING * 8,
): number {
  return (
    DUNGEON_FORM_GRID_COLUMN_COUNT * FILTER_UNIT_WIDTH +
    (DUNGEON_FORM_GRID_COLUMN_COUNT - 1) * gridColumnGapPx
  );
}

export { FILTER_UNIT_GRID_GAP_SPACING };
