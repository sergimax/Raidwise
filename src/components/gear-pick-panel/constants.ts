import {
  EXPORT_FILTER_GRID_GAP_SPACING,
  EXPORT_FILTER_UNIT_HEIGHT,
  EXPORT_FILTER_UNIT_WIDTH,
  getExportFilterGridTemplateRows,
  getFilterUnitColumnTemplate,
} from "../export-panel/constants.ts";

/** Pixel gap between Soft pick grid tracks (`gap: 1.5` → 12px at default spacing). */
const GEAR_PICK_GRID_GAP_PX = EXPORT_FILTER_GRID_GAP_SPACING * 8;

/** Reuses Character pick side-by-side breakpoint (≥1600px) for the wide Soft pick layout. */
export {
  EXPORT_PANEL_SIDE_BY_SIDE_MIN_PX as GEAR_PICK_SIDE_BY_SIDE_MIN_PX,
  EXPORT_PANEL_SIDE_BY_SIDE_MQ as GEAR_PICK_SIDE_BY_SIDE_MQ,
  EXPORT_PANEL_SIDE_BY_SIDE_MQ_KEY as GEAR_PICK_SIDE_BY_SIDE_MQ_KEY,
} from "../export-panel/constants.ts";

/**
 * Soft pick panel grid areas.
 * Filter columns share one unit width so 1×1 / 2×1 blocks align visually.
 * Step order: raid (1) on top; character (2) spans right; rules (3) below raid.
 * - xs: stacked (DOM order)
 * - md: filters + softs; copy 1×2 below
 * - wide (≥1600): filters + softs; copy 1×2 top-right
 */
export type GearPickGridAreaId =
  | "rules"
  | "characterSpecs"
  | "dungeon"
  | "softs"
  | "copy";

export type GearPickGridLayout = "md" | "wide";

/** Soft-reserve call (copy) block span — 1 row × 2 column units. */
export const GEAR_PICK_COPY_BLOCK_SPAN = {
  heightUnits: 1,
  widthUnits: 2,
} as const;

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

export function getGearPickCopyBlockMaxHeight(
  gridRowGapPx = GEAR_PICK_GRID_GAP_PX,
): number {
  const { heightUnits } = GEAR_PICK_COPY_BLOCK_SPAN;
  return (
    heightUnits * EXPORT_FILTER_UNIT_HEIGHT + (heightUnits - 1) * gridRowGapPx
  );
}

export function getGearPickGridTemplateAreas(layout: GearPickGridLayout): string {
  if (layout === "wide") {
    return [
      '"dungeon characterSpecs softs copy"',
      '"rules characterSpecs softs ."',
    ].join(" ");
  }

  return [
    '"dungeon characterSpecs softs"',
    '"rules characterSpecs softs"',
    '"copy copy ."',
  ].join(" ");
}

export function getGearPickGridTemplateColumns(
  layout: GearPickGridLayout,
): string {
  /** Same unit column as Character pick (rules / raids / character specs). */
  const unitColumn = getFilterUnitColumnTemplate();
  /** Softs stay at least one unit wide so the block cannot collapse away. */
  const softsColumn = `minmax(${EXPORT_FILTER_UNIT_WIDTH}px, 1fr)`;
  const copyColumn = `minmax(0, ${getGearPickCopyBlockMaxWidth()}px)`;

  if (layout === "wide") {
    return `${unitColumn} ${unitColumn} ${softsColumn} ${copyColumn}`;
  }

  return `${unitColumn} ${unitColumn} ${softsColumn}`;
}

export function getGearPickGridTemplateRows(layout: GearPickGridLayout): string {
  const filterRows = getExportFilterGridTemplateRows();
  if (layout === "wide") {
    return filterRows;
  }
  return `${filterRows} ${getGearPickCopyBlockMaxHeight()}px`;
}
