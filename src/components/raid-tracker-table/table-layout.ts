import type { TranslateFn } from "../../i18n/translate.ts";
import type { DungeonSortKey } from "../../utils/sort-dungeons.ts";

export function buildPinnedColumns(t: TranslateFn): ReadonlyArray<PinnedColumnDef> {
  return [
    { key: "name", sortKey: "name", label: t("table.dungeonName") },
    { key: "type", sortKey: "type", label: t("table.type") },
    { key: "itemLevel", sortKey: "itemLevel", label: t("table.itemLevel") },
    { key: "complete", sortKey: "completions", label: t("table.complete") },
  ];
}

export const STATIC_COLUMNS: ReadonlyArray<{
  key: "name" | "type" | "itemLevel";
  sortKey: DungeonSortKey;
  label: string;
}> = [
  { key: "name", sortKey: "name", label: "Dungeon name" },
  { key: "type", sortKey: "type", label: "Type" },
  { key: "itemLevel", sortKey: "itemLevel", label: "Item level" },
];

export const COMPLETE_COLUMN = {
  key: "complete" as const,
  sortKey: "completions" as const,
  label: "Complete",
};

export type PinnedColumnKey =
  | (typeof STATIC_COLUMNS)[number]["key"]
  | typeof COMPLETE_COLUMN.key;

export type PinnedColumnDef = {
  key: PinnedColumnKey;
  sortKey: DungeonSortKey;
  label: string;
};

/** Pinned columns after the actions column (dungeon fields + row completions). */
export const PINNED_COLUMNS: ReadonlyArray<PinnedColumnDef> = [
  ...STATIC_COLUMNS,
  COMPLETE_COLUMN,
];

const HIDDEN_PINNED_COLUMNS_ON_COMPACT: ReadonlySet<PinnedColumnKey> = new Set([
  "type",
  "itemLevel",
  "complete",
]);

export function pinnedColumnsForLayout(
  compact: boolean,
  t: TranslateFn,
): ReadonlyArray<PinnedColumnDef> {
  const columns = buildPinnedColumns(t);
  if (!compact) {
    return columns;
  }
  return columns.filter(
    (column) => !HIDDEN_PINNED_COLUMNS_ON_COMPACT.has(column.key),
  );
}

const PINNED_CELL_BASE_SX = {
  position: "sticky",
  zIndex: 2,
  backgroundColor: "background.paper",
  // Soft edge against scrolled character columns; matches --border.
  boxShadow: "1px 0 0 color-mix(in srgb, var(--border) 40%, transparent)",
  boxSizing: "border-box",
} as const;

// Keep these widths stable so sticky offsets work predictably.
export const PINNED_WIDTHS = {
  actions: 68,
  name: 200,
  // Fits Heroic labels like `25 ☠️` (emoji is wider than a letter suffix).
  type: 88,
  itemLevel: 104,
  // Linear completion bar + count label in the pinned Complete column.
  complete: 78,
} as const;

export const CHARACTER_COLUMN_WIDTH = 132;

export const PINNED_LEFT = {
  actions: 0,
  name: PINNED_WIDTHS.actions,
  type: PINNED_WIDTHS.actions + PINNED_WIDTHS.name,
  itemLevel:
    PINNED_WIDTHS.actions + PINNED_WIDTHS.name + PINNED_WIDTHS.type,
  complete:
    PINNED_WIDTHS.actions +
    PINNED_WIDTHS.name +
    PINNED_WIDTHS.type +
    PINNED_WIDTHS.itemLevel,
} as const;

/** Narrow screens: hide type, item level, and completions; pin actions and name only. */
export const COMPACT_PINNED_WIDTHS = {
  actions: PINNED_WIDTHS.actions,
  name: 132,
} as const;

export const COMPACT_PINNED_LEFT = {
  actions: 0,
  name: COMPACT_PINNED_WIDTHS.actions,
} as const;

/** Actions column + pinned dungeon columns + character columns. */
export function raidTrackerTableColumnCount(
  visiblePinnedColumns: ReadonlyArray<PinnedColumnDef>,
  characterCount: number,
): number {
  return 1 + visiblePinnedColumns.length + characterCount;
}

function pinnedPositionForColumn(
  columnKey: PinnedColumnKey,
  compact: boolean,
): { left: number; width: number } | null {
  if (compact) {
    if (columnKey === "name") {
      return { left: COMPACT_PINNED_LEFT.name, width: COMPACT_PINNED_WIDTHS.name };
    }
    return null;
  }
  return { left: PINNED_LEFT[columnKey], width: PINNED_WIDTHS[columnKey] };
}

export function pinnedHeaderSxForColumn(columnKey: PinnedColumnKey, compact: boolean) {
  const position = pinnedPositionForColumn(columnKey, compact);
  if (!position) {
    return undefined;
  }
  return pinnedHeaderCellSx(position.left, position.width);
}

export function pinnedBodySxForColumn(columnKey: PinnedColumnKey, compact: boolean) {
  const position = pinnedPositionForColumn(columnKey, compact);
  if (!position) {
    return undefined;
  }
  return pinnedCellSx(position.left, position.width);
}

export function pinnedActionsColumnSx(compact: boolean, header: boolean) {
  const pinned = header ? pinnedHeaderCellSx : pinnedCellSx;
  const width = compact ? COMPACT_PINNED_WIDTHS.actions : PINNED_WIDTHS.actions;
  const left = compact ? COMPACT_PINNED_LEFT.actions : PINNED_LEFT.actions;
  return pinned(left, width);
}

export function pinnedCellSx(left: number, width: number) {
  return {
    ...PINNED_CELL_BASE_SX,
    left,
    width,
    minWidth: width,
    maxWidth: width,
  } as const;
}

export function pinnedHeaderCellSx(left: number, width: number) {
  return {
    ...pinnedCellSx(left, width),
    zIndex: 4,
  } as const;
}

export const CHARACTER_HEADER_CELL_SX = {
  /** Above body pinned cells; below pinned header corners (zIndex 4). */
  zIndex: 3,
  width: CHARACTER_COLUMN_WIDTH,
  minWidth: CHARACTER_COLUMN_WIDTH,
  maxWidth: CHARACTER_COLUMN_WIDTH,
  paddingLeft: "6px",
  paddingRight: "6px",
  boxSizing: "border-box",
} as const;

export const CHARACTER_BODY_CELL_SX = {
  position: "relative",
  zIndex: 0,
  width: CHARACTER_COLUMN_WIDTH,
  minWidth: CHARACTER_COLUMN_WIDTH,
  maxWidth: CHARACTER_COLUMN_WIDTH,
  paddingLeft: "6px",
  paddingRight: "6px",
  boxSizing: "border-box",
} as const;
