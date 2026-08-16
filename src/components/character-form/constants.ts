import {
  FILTER_UNIT_GRID_GAP_SPACING,
  FILTER_UNIT_WIDTH,
  getFilterUnitColumnTemplate,
} from "../filter-unit/constants.ts";

/** Identity stays 1 unit; main / off use 2× unit width for gear import lists. */
export const CHARACTER_FORM_IDENTITY_WIDTH_UNITS = 1;
export const CHARACTER_FORM_SPEC_WIDTH_UNITS = 2;
export const CHARACTER_FORM_GRID_COLUMN_COUNT = 3;

export function getCharacterFormSpecColumnTemplate(): string {
  return `minmax(0, ${CHARACTER_FORM_SPEC_WIDTH_UNITS * FILTER_UNIT_WIDTH}px)`;
}

export function getCharacterFormGridTemplateColumns(): string {
  const identityColumn = getFilterUnitColumnTemplate();
  const specColumn = getCharacterFormSpecColumnTemplate();
  return `${identityColumn} ${specColumn} ${specColumn}`;
}

/** Content width of the unit grid (columns + inter-column gaps). */
export function getCharacterFormGridMaxWidth(
  gridColumnGapPx = FILTER_UNIT_GRID_GAP_SPACING * 8,
): number {
  const totalWidthUnits =
    CHARACTER_FORM_IDENTITY_WIDTH_UNITS +
    2 * CHARACTER_FORM_SPEC_WIDTH_UNITS;
  return (
    totalWidthUnits * FILTER_UNIT_WIDTH +
    (CHARACTER_FORM_GRID_COLUMN_COUNT - 1) * gridColumnGapPx
  );
}

export { FILTER_UNIT_GRID_GAP_SPACING };
