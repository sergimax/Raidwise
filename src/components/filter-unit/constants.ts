/**
 * Shared unit-grid tokens for toolbar filter chrome (Character pick, Soft pick,
 * forms, BiS, Data). Character pick–only layout lives in `character-pick-panel/`.
 */

/** Theme spacing multiplier used for filter grid gap (`gap: 1.5`). */
export const FILTER_UNIT_GRID_GAP_SPACING = 1.5;

/** Width of one grid column unit. */
export const FILTER_UNIT_WIDTH = 300;

/**
 * Fixed height of one grid row unit (1× block).
 * Fits raid chips, GS slider, and role 2×2 icons (chips scroll inside the raid block).
 */
export const FILTER_UNIT_HEIGHT = 224;

/** Keeps search + match count pinned; only raid chips scroll inside the section. */
export const dungeonFilterContentSx = {
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
} as const;

/**
 * Character-spec list (Character pick + Soft pick) — fits a 2×1 unit column.
 * Shared so both panels stay equal in size.
 */
export const CHARACTER_SPEC_LIST_GRID_TEMPLATE_COLUMNS =
  "minmax(0, 1fr) auto auto";
export const CHARACTER_SPEC_LIST_COLUMN_GAP = 0.5;
export const CHARACTER_SPEC_LIST_ROW_GAP = 0.75;
export const CHARACTER_SPEC_LIST_ICON_SIZE = 16;

/** Character spec rows visible before the list scrolls (2× block content). */
export const FILTER_UNIT_SPECS_VISIBLE_ROW_COUNT = 8;

/** Spec row height — small FormControlLabel with spec icon + gear score. */
export const FILTER_UNIT_SPECS_ROW_HEIGHT_PX = 38;

/** Matches `CHARACTER_SPEC_LIST_ROW_GAP` (0.75 → 6px at default theme spacing). */
export const FILTER_UNIT_SPECS_ROW_GAP_PX = 6;

/** Max scroll viewport height for the character specs list (8 rows). */
export function getCharacterSpecListMaxHeight(): number {
  const rowCount = FILTER_UNIT_SPECS_VISIBLE_ROW_COUNT;
  return (
    rowCount * FILTER_UNIT_SPECS_ROW_HEIGHT_PX +
    (rowCount - 1) * FILTER_UNIT_SPECS_ROW_GAP_PX
  );
}

/** Total height of a block spanning `heightUnits` grid rows (excludes inter-row gap). */
export function getFilterUnitBlockHeight(heightUnits: number): number {
  return heightUnits * FILTER_UNIT_HEIGHT;
}

export function getFilterUnitColumnTemplate(): string {
  return `minmax(0, ${FILTER_UNIT_WIDTH}px)`;
}

/** Shared grid sx for Character pick / Soft pick character-spec lists. */
export function getCharacterSpecListGridSx(options?: {
  maxHeight?: number;
}): Record<string, unknown> {
  return {
    display: "grid",
    gridTemplateColumns: CHARACTER_SPEC_LIST_GRID_TEMPLATE_COLUMNS,
    columnGap: CHARACTER_SPEC_LIST_COLUMN_GAP,
    rowGap: CHARACTER_SPEC_LIST_ROW_GAP,
    alignItems: "center",
    minWidth: 0,
    ...(options?.maxHeight != null
      ? {
          maxHeight: options.maxHeight,
          overflowY: "auto",
          pr: 0.25,
        }
      : null),
  };
}

/**
 * Default 2-row filter grid height (Character pick / Soft pick filter rows).
 * Soft pick reuses this for its filter band.
 */
export function getFilterUnitTwoRowGridHeight(
  gridRowGapPx = FILTER_UNIT_GRID_GAP_SPACING * 8,
): number {
  return 2 * FILTER_UNIT_HEIGHT + gridRowGapPx;
}

export function getFilterUnitTwoRowTemplateRows(): string {
  return `repeat(2, ${FILTER_UNIT_HEIGHT}px)`;
}
