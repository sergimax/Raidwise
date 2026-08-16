import {
  FILTER_UNIT_GRID_GAP_SPACING,
  FILTER_UNIT_HEIGHT,
  FILTER_UNIT_WIDTH,
  getFilterUnitColumnTemplate,
} from "../filter-unit/constants.ts";

/** Min viewport width for filter grid left + result lines right. */
export const CHARACTER_PICK_SIDE_BY_SIDE_MIN_PX = 1680;

/** `matchMedia` / `useMediaQuery` query (no `@media` prefix). */
export const CHARACTER_PICK_SIDE_BY_SIDE_MQ = `(min-width:${CHARACTER_PICK_SIDE_BY_SIDE_MIN_PX}px)`;

/** MUI `sx` object key for the side-by-side breakpoint. */
export const CHARACTER_PICK_SIDE_BY_SIDE_MQ_KEY = `@media ${CHARACTER_PICK_SIDE_BY_SIDE_MQ}`;

/** Max height of the result list before it scrolls (stacked layout). */
export const CHARACTER_PICK_RESULT_MAX_HEIGHT = 320;

/** Column units across the Character pick filter grid (GS + role + specs). */
export const CHARACTER_PICK_FILTER_GRID_COLUMN_COUNT = 3;

export type CharacterPickFilterBlockSpan = {
  heightUnits: number;
  widthUnits: number;
};

/** Default H×W spans per Character pick filter block. */
export const CHARACTER_PICK_FILTER_BLOCK_SPANS = {
  dungeon: { heightUnits: 1, widthUnits: 2 },
  gearScore: { heightUnits: 1, widthUnits: 1 },
  role: { heightUnits: 1, widthUnits: 1 },
  characterSpecs: { heightUnits: 2, widthUnits: 1 },
} as const satisfies Record<string, CharacterPickFilterBlockSpan>;

export type CharacterPickFilterGridAreaId =
  keyof typeof CHARACTER_PICK_FILTER_BLOCK_SPANS;

/** Total pixel height of the 2-row filter grid (rows + inter-row gaps). */
export function getCharacterPickFilterGridHeight(
  gridRowGapPx = FILTER_UNIT_GRID_GAP_SPACING * 8,
): number {
  const rowCount = Math.max(
    ...Object.values(CHARACTER_PICK_FILTER_BLOCK_SPANS).map(
      (span) => span.heightUnits,
    ),
  );
  return rowCount * FILTER_UNIT_HEIGHT + (rowCount - 1) * gridRowGapPx;
}

export function getCharacterPickFilterGridTemplateColumns(): string {
  const unitColumn = getFilterUnitColumnTemplate();
  return `${unitColumn} ${unitColumn} ${unitColumn}`;
}

export function getCharacterPickFilterGridTemplateRows(): string {
  const maxHeightUnits = Math.max(
    ...Object.values(CHARACTER_PICK_FILTER_BLOCK_SPANS).map(
      (span) => span.heightUnits,
    ),
  );
  return `repeat(${maxHeightUnits}, ${FILTER_UNIT_HEIGHT}px)`;
}

export function getCharacterPickFilterGridTemplateAreas(
  hasDungeon: boolean,
): string {
  if (hasDungeon) {
    return [
      '"dungeon dungeon characterSpecs"',
      '"gearScore role characterSpecs"',
    ].join(" ");
  }

  return ['"gearScore role characterSpecs"', '". . characterSpecs"'].join(" ");
}

export function getCharacterPickFilterGridMaxWidth(): number {
  return FILTER_UNIT_WIDTH * CHARACTER_PICK_FILTER_GRID_COLUMN_COUNT;
}

/**
 * Results column on wide layouts — 2 unit columns including the inter-column gap
 * (same span math as Soft pick copy).
 */
export function getCharacterPickResultColumnMinWidth(
  gridColumnGapPx = FILTER_UNIT_GRID_GAP_SPACING * 8,
): number {
  return 2 * FILTER_UNIT_WIDTH + gridColumnGapPx;
}

export {
  FILTER_UNIT_GRID_GAP_SPACING,
  dungeonFilterContentSx,
} from "../filter-unit/constants.ts";
