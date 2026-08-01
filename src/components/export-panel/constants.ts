/** Min viewport width for filter grid left + result lines right. */
export const EXPORT_PANEL_SIDE_BY_SIDE_MIN_PX = 1600;

/** `matchMedia` / `useMediaQuery` query (no `@media` prefix). */
export const EXPORT_PANEL_SIDE_BY_SIDE_MQ = `(min-width:${EXPORT_PANEL_SIDE_BY_SIDE_MIN_PX}px)`;

/** MUI `sx` object key for the side-by-side breakpoint. */
export const EXPORT_PANEL_SIDE_BY_SIDE_MQ_KEY = `@media ${EXPORT_PANEL_SIDE_BY_SIDE_MQ}`;

/** Theme spacing multiplier used for export filter grid gap (`gap: 1.5`). */
export const EXPORT_FILTER_GRID_GAP_SPACING = 1.5;

/** Max height of the export result list before it scrolls (stacked layout). */
export const EXPORT_RESULT_MAX_HEIGHT = 320;

/** Width of one grid column unit (export / Soft pick filter blocks share this). */
export const EXPORT_FILTER_UNIT_WIDTH = 300;

/**
 * Fixed height of one grid row unit (1× block).
 * Fits raid chips, GS slider, and role 2×2 icons (chips scroll inside the raid block).
 */
export const EXPORT_FILTER_UNIT_HEIGHT = 224;

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
export const EXPORT_FILTER_SPECS_VISIBLE_ROW_COUNT = 8;

/** Spec row height — small FormControlLabel with spec icon + gear score. */
export const EXPORT_FILTER_SPECS_ROW_HEIGHT_PX = 38;

/** Matches `CHARACTER_SPEC_LIST_ROW_GAP` (0.75 → 6px at default spacing). */
export const EXPORT_FILTER_SPECS_ROW_GAP_PX = 6;

/** Max scroll viewport height for the character specs list (8 rows). */
export function getExportFilterSpecsListMaxHeight(): number {
  const rowCount = EXPORT_FILTER_SPECS_VISIBLE_ROW_COUNT;
  return (
    rowCount * EXPORT_FILTER_SPECS_ROW_HEIGHT_PX +
    (rowCount - 1) * EXPORT_FILTER_SPECS_ROW_GAP_PX
  );
}

/** Total height of a block spanning `heightUnits` grid rows (excludes inter-row gap). */
export function getExportFilterBlockHeight(heightUnits: number): number {
  return heightUnits * EXPORT_FILTER_UNIT_HEIGHT;
}

/** Column units across the filter grid (GS + role + specs). */
export const EXPORT_FILTER_GRID_COLUMN_COUNT = 3;

export type ExportFilterBlockSpan = {
  /** Row span — height in unit rows (H in H×W). */
  heightUnits: number;
  /** Column span — width in unit columns (W in H×W). */
  widthUnits: number;
};

/** Default H×W spans per filter block. */
export const EXPORT_FILTER_BLOCK_SPANS = {
  dungeon: { heightUnits: 1, widthUnits: 2 },
  gearScore: { heightUnits: 1, widthUnits: 1 },
  role: { heightUnits: 1, widthUnits: 1 },
  characterSpecs: { heightUnits: 2, widthUnits: 1 },
} as const satisfies Record<string, ExportFilterBlockSpan>;

/** Total pixel height of the 2-row filter grid (rows + inter-row gaps). */
export function getExportFilterGridHeight(
  gridRowGapPx = EXPORT_FILTER_GRID_GAP_SPACING * 8,
): number {
  const rowCount = Math.max(
    ...Object.values(EXPORT_FILTER_BLOCK_SPANS).map((span) => span.heightUnits),
  );
  return rowCount * EXPORT_FILTER_UNIT_HEIGHT + (rowCount - 1) * gridRowGapPx;
}

export type ExportFilterGridAreaId = keyof typeof EXPORT_FILTER_BLOCK_SPANS;

export function getFilterUnitColumnTemplate(): string {
  return `minmax(0, ${EXPORT_FILTER_UNIT_WIDTH}px)`;
}

export function getExportFilterGridTemplateColumns(): string {
  const unitColumn = getFilterUnitColumnTemplate();
  return `${unitColumn} ${unitColumn} ${unitColumn}`;
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

export function getExportFilterGridTemplateRows(): string {
  const maxHeightUnits = Math.max(
    ...Object.values(EXPORT_FILTER_BLOCK_SPANS).map((span) => span.heightUnits),
  );
  return `repeat(${maxHeightUnits}, ${EXPORT_FILTER_UNIT_HEIGHT}px)`;
}

export function getExportFilterGridTemplateAreas(hasDungeon: boolean): string {
  if (hasDungeon) {
    // Step order: raid (1) on top; GS (2), role (3), specs (4) below / right.
    return [
      '"dungeon dungeon characterSpecs"',
      '"gearScore role characterSpecs"',
    ].join(" ");
  }

  return [
    '"gearScore role characterSpecs"',
    '". . characterSpecs"',
  ].join(" ");
}

export function getExportFilterGridMaxWidth(): number {
  return EXPORT_FILTER_UNIT_WIDTH * EXPORT_FILTER_GRID_COLUMN_COUNT;
}

/**
 * Character pick results column on wide layouts — 2 unit columns including the
 * inter-column gap (same span math as Soft pick copy).
 */
export function getExportResultColumnMinWidth(
  gridColumnGapPx = EXPORT_FILTER_GRID_GAP_SPACING * 8,
): number {
  return 2 * EXPORT_FILTER_UNIT_WIDTH + gridColumnGapPx;
}
