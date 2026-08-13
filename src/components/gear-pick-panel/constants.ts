import {
  EXPORT_FILTER_GRID_GAP_SPACING,
  EXPORT_FILTER_UNIT_HEIGHT,
  EXPORT_FILTER_UNIT_WIDTH,
  getExportFilterGridTemplateRows,
} from "../export-panel/constants.ts";

/** Pixel gap between Soft pick grid tracks (`gap: 1.5` → 12px at default spacing). */
const GEAR_PICK_GRID_GAP_PX = EXPORT_FILTER_GRID_GAP_SPACING * 8;

/**
 * Soft pick panel grid areas.
 * Filter columns are fixed unit width; softs / copy are fixed 2-unit spans.
 * Layout steps up by **available panel width** (container queries), not viewport:
 * - filters: raids + character + rules; softs and copy each on their own row
 * - md: softs beside filters when 2 filter units + softs fit; copy stays below
 * - wide: copy joins top-right when softs + copy both fit beside filters
 */
export type GearPickGridAreaId =
  | "rules"
  | "characterSpecs"
  | "dungeon"
  | "softs"
  | "copy";

export type GearPickGridLayout = "filters" | "md" | "wide";

/** Soft-reserve call (copy) block span — 1 row × 2 column units. */
export const GEAR_PICK_COPY_BLOCK_SPAN = {
  heightUnits: 1,
  widthUnits: 2,
} as const;

/** Soft targets block width — 2× standard filter unit (gap-inclusive). */
export const GEAR_PICK_SOFTS_BLOCK_WIDTH_UNITS = 2;

/** Soft targets block height — matches the two filter rows it spans in md/wide. */
export const GEAR_PICK_SOFTS_BLOCK_HEIGHT_UNITS = 2;

/**
 * Width of a 1×2 copy span: `widthUnits × unit + (widthUnits − 1) × gap`.
 * For the default 1×2 this is 600 + 12 = 612 (not 600).
 */
export function getGearPickCopyBlockMaxWidth(
  gridColumnGapPx = GEAR_PICK_GRID_GAP_PX,
): number {
  const { widthUnits } = GEAR_PICK_COPY_BLOCK_SPAN;
  return (
    widthUnits * EXPORT_FILTER_UNIT_WIDTH + (widthUnits - 1) * gridColumnGapPx
  );
}

/** Width for the soft-targets column (2× unit + gap). */
export function getGearPickSoftsBlockMaxWidth(
  gridColumnGapPx = GEAR_PICK_GRID_GAP_PX,
): number {
  return (
    GEAR_PICK_SOFTS_BLOCK_WIDTH_UNITS * EXPORT_FILTER_UNIT_WIDTH +
    (GEAR_PICK_SOFTS_BLOCK_WIDTH_UNITS - 1) * gridColumnGapPx
  );
}

export function getGearPickCopyBlockMaxHeight(
  gridRowGapPx = GEAR_PICK_GRID_GAP_PX,
): number {
  const { heightUnits } = GEAR_PICK_COPY_BLOCK_SPAN;
  return (
    heightUnits * EXPORT_FILTER_UNIT_HEIGHT + (heightUnits - 1) * gridRowGapPx
  );
}

/** Height when softs sits on its own row (2 filter units tall). */
export function getGearPickSoftsBlockMaxHeight(
  gridRowGapPx = GEAR_PICK_GRID_GAP_PX,
): number {
  return (
    GEAR_PICK_SOFTS_BLOCK_HEIGHT_UNITS * EXPORT_FILTER_UNIT_HEIGHT +
    (GEAR_PICK_SOFTS_BLOCK_HEIGHT_UNITS - 1) * gridRowGapPx
  );
}

/** Content width for 2 fixed filter unit columns. */
export function getGearPickFiltersRowWidth(
  gridColumnGapPx = GEAR_PICK_GRID_GAP_PX,
): number {
  return 2 * EXPORT_FILTER_UNIT_WIDTH + gridColumnGapPx;
}

/** Min container width for softs beside filters (copy still below). */
export function getGearPickMdLayoutMinWidth(
  gridColumnGapPx = GEAR_PICK_GRID_GAP_PX,
): number {
  return (
    getGearPickFiltersRowWidth(gridColumnGapPx) +
    gridColumnGapPx +
    getGearPickSoftsBlockMaxWidth(gridColumnGapPx)
  );
}

/** Min container width for softs + copy beside filters. */
export function getGearPickWideLayoutMinWidth(
  gridColumnGapPx = GEAR_PICK_GRID_GAP_PX,
): number {
  return (
    getGearPickMdLayoutMinWidth(gridColumnGapPx) +
    gridColumnGapPx +
    getGearPickCopyBlockMaxWidth(gridColumnGapPx)
  );
}

/** `@container` query keys for Soft pick layout steps. */
export function getGearPickMdContainerMqKey(): string {
  return `@container (min-width: ${getGearPickMdLayoutMinWidth()}px)`;
}

export function getGearPickWideContainerMqKey(): string {
  return `@container (min-width: ${getGearPickWideLayoutMinWidth()}px)`;
}

/**
 * Legacy alias — Soft pick wide layout now uses container queries.
 * Kept for the unused side-by-side hook export surface.
 */
export const GEAR_PICK_SIDE_BY_SIDE_MIN_PX = getGearPickWideLayoutMinWidth();
export const GEAR_PICK_SIDE_BY_SIDE_MQ = `(min-width:${GEAR_PICK_SIDE_BY_SIDE_MIN_PX}px)`;
export const GEAR_PICK_SIDE_BY_SIDE_MQ_KEY = `@media ${GEAR_PICK_SIDE_BY_SIDE_MQ}`;

export function getGearPickGridTemplateAreas(layout: GearPickGridLayout): string {
  if (layout === "wide") {
    return [
      '"dungeon characterSpecs softs copy"',
      '"rules characterSpecs softs ."',
    ].join(" ");
  }

  if (layout === "md") {
    return [
      '"dungeon characterSpecs softs"',
      '"rules characterSpecs softs"',
      '"copy copy ."',
    ].join(" ");
  }

  // filters: softs + copy each take a full row under the filter pair
  return [
    '"dungeon characterSpecs"',
    '"rules characterSpecs"',
    '"softs softs"',
    '"copy copy"',
  ].join(" ");
}

export function getGearPickGridTemplateColumns(
  layout: GearPickGridLayout,
): string {
  /**
   * Fixed unit columns — raids / character / rules must not shrink below
   * the shared filter unit (unlike Character pick's minmax(0, unit)).
   */
  const unitColumn = `${EXPORT_FILTER_UNIT_WIDTH}px`;
  const softsColumn = `${getGearPickSoftsBlockMaxWidth()}px`;

  if (layout === "wide") {
    return `${unitColumn} ${unitColumn} ${softsColumn} ${getGearPickCopyBlockMaxWidth()}px`;
  }

  if (layout === "md") {
    return `${unitColumn} ${unitColumn} ${softsColumn}`;
  }

  return `${unitColumn} ${unitColumn}`;
}

export function getGearPickGridTemplateRows(layout: GearPickGridLayout): string {
  const filterRows = getExportFilterGridTemplateRows();
  if (layout === "wide") {
    return filterRows;
  }
  if (layout === "md") {
    return `${filterRows} ${getGearPickCopyBlockMaxHeight()}px`;
  }
  return `${filterRows} ${getGearPickSoftsBlockMaxHeight()}px ${getGearPickCopyBlockMaxHeight()}px`;
}
