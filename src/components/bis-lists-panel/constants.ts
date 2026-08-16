import {
  FILTER_UNIT_GRID_GAP_SPACING,
  getFilterUnitColumnTemplate,
} from "../filter-unit/constants.ts";

/**
 * BiS panel scroll budgets for the Items paper-doll and Lists chips.
 *
 * Items height is primary (full doll + a couple of alternative stacks).
 * Lists height is capped to a visible chip count, and also cannot exceed
 * the leftover left-column space under Class & spec when Items is at max.
 */

/** Armor table row count (left|right paper-doll pairs). */
export const BIS_ITEMS_ARMOR_ROW_COUNT = 8;

/** Approx. height of one armor row with a single item + drop-source caption. */
export const BIS_ITEMS_BASE_ROW_HEIGHT_PX = 58;

/** Bottom weapons row (main / off / ranged). */
export const BIS_ITEMS_BOTTOM_ROW_HEIGHT_PX = 72;

/** Extra height when a slot shows an Alternatives stack. */
export const BIS_ITEMS_ALTERNATIVES_EXTRA_HEIGHT_PX = 44;

/**
 * How many alternative-expanded slots should still fit without scrolling
 * (e.g. Feral “Kingdom. With variants”: neck + back, or neck + finger).
 */
export const BIS_ITEMS_ALTERNATIVES_VISIBLE_BUDGET = 2;

/** Compact / narrow viewports — slightly tighter items viewport. */
export const BIS_ITEMS_CONTENT_MAX_HEIGHT_XS_PX = 420;

/** MUI Chip default height (single-line label with ellipsis). */
export const BIS_LISTS_CHIP_HEIGHT_PX = 32;

/** Matches lists `Stack spacing={0.75}` (6px at default theme spacing). */
export const BIS_LISTS_CHIP_GAP_PX = 6;

/** Chips shown in Lists before the list scrolls. */
export const BIS_LISTS_VISIBLE_CHIP_COUNT = 6;

/**
 * FilterSection chrome shared by BiS steps (padding + title + description).
 * Items with titleActions / descriptionActions is close enough for column alignment math.
 */
export const BIS_FILTER_SECTION_CHROME_HEIGHT_PX = 88;

/** Two small class/spec selects + stack gap inside step 1. */
export const BIS_CLASS_SPEC_CONTENT_HEIGHT_PX = 112;

/** Left-column gap between Class & spec and Lists (`spacing={1.5}` → 12px). */
export const BIS_LEFT_COLUMN_SECTION_GAP_PX = 12;

/**
 * Side columns (class/lists | save) use the shared 300px unit; Items fills the
 * middle. Matches Character pick / Soft pick / form unit widths.
 */
export function getBisListsGridTemplateColumns(): string {
  const unitColumn = getFilterUnitColumnTemplate();
  return `${unitColumn} minmax(0, 1fr) ${unitColumn}`;
}

export { FILTER_UNIT_GRID_GAP_SPACING };

/** Max height of the Items paper-doll scroll viewport (md+). */
export function getBisItemsContentMaxHeight(): number {
  return (
    BIS_ITEMS_ARMOR_ROW_COUNT * BIS_ITEMS_BASE_ROW_HEIGHT_PX +
    BIS_ITEMS_BOTTOM_ROW_HEIGHT_PX +
    BIS_ITEMS_ALTERNATIVES_VISIBLE_BUDGET *
      BIS_ITEMS_ALTERNATIVES_EXTRA_HEIGHT_PX
  );
}

/** Outer Items section height when content is at its scroll max. */
export function getBisItemsSectionMaxHeight(): number {
  return BIS_FILTER_SECTION_CHROME_HEIGHT_PX + getBisItemsContentMaxHeight();
}

/** Lists chip viewport from the visible-count budget alone. */
export function getBisListsContentMaxHeightFromChips(): number {
  const chipCount = BIS_LISTS_VISIBLE_CHIP_COUNT;
  return (
    chipCount * BIS_LISTS_CHIP_HEIGHT_PX +
    (chipCount - 1) * BIS_LISTS_CHIP_GAP_PX
  );
}

/**
 * Leftover left-column space for Lists content when the Items column is at
 * its max height (Class & spec stacked above Lists).
 */
export function getBisListsContentMaxHeightFromItemsColumn(): number {
  const classSpecSectionHeight =
    BIS_FILTER_SECTION_CHROME_HEIGHT_PX + BIS_CLASS_SPEC_CONTENT_HEIGHT_PX;
  return (
    getBisItemsSectionMaxHeight() -
    classSpecSectionHeight -
    BIS_LEFT_COLUMN_SECTION_GAP_PX -
    BIS_FILTER_SECTION_CHROME_HEIGHT_PX
  );
}

/**
 * Lists scroll viewport: chip-count cap, and never taller than the Items
 * column leftover under Class & spec.
 */
export function getBisListsContentMaxHeight(): number {
  return Math.min(
    getBisListsContentMaxHeightFromChips(),
    getBisListsContentMaxHeightFromItemsColumn(),
  );
}
