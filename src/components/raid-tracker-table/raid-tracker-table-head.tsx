/**
 * Table header row: pinned dungeon columns (sort, search) and per-character
 * columns (edit/reset/delete actions).
 */
import { Fragment } from "react";
import { TableCell, TableHead, TableRow } from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";
import type { CharacterRecord } from "../../types/characters.ts";
import type { DungeonSortKey, SortDirection } from "../../utils/sort-dungeons.ts";
import { CharacterHeaderCell } from "./character-header-cell.tsx";
import { renderPinnedColumnHeader } from "./pinned-column-renderers.tsx";
import { pinnedActionsColumnSx, type PinnedColumnDef } from "./table-layout.ts";

type RaidTrackerTableHeadProps = {
  compactTable: boolean;
  visiblePinnedColumns: ReadonlyArray<PinnedColumnDef>;
  characters: CharacterRecord[];
  sortKey: DungeonSortKey;
  sortDirection: SortDirection;
  dungeonNameSearch: string;
  onDungeonNameSearchChange: (query: string) => void;
  onSort: (sortKey: DungeonSortKey) => void;
  onResetCharacterToggles: (characterId: string) => void;
  onEditCharacter: (characterId: string) => void;
  onRequestDeleteCharacter: (characterId: string) => void;
};

export function RaidTrackerTableHead({
  compactTable,
  visiblePinnedColumns,
  characters,
  sortKey,
  sortDirection,
  dungeonNameSearch,
  onDungeonNameSearchChange,
  onSort,
  onResetCharacterToggles,
  onEditCharacter,
  onRequestDeleteCharacter,
}: RaidTrackerTableHeadProps) {
  const { t } = useTranslation();

  return (
    <TableHead>
      <TableRow>
        <TableCell
          sx={pinnedActionsColumnSx(compactTable, true)}
          aria-label={t("table.rowActions")}
        />
        {visiblePinnedColumns.map((column) => (
          <Fragment key={column.key}>
            {renderPinnedColumnHeader({
              column,
              compactTable,
              sortKey,
              sortDirection,
              onSort,
              dungeonNameSearch,
              onDungeonNameSearchChange: onDungeonNameSearchChange,
            })}
          </Fragment>
        ))}
        {characters.map((character) => (
          <CharacterHeaderCell
            key={character.id}
            character={character}
            onResetCharacterToggles={onResetCharacterToggles}
            onEditCharacter={onEditCharacter}
            onDeleteCharacter={onRequestDeleteCharacter}
          />
        ))}
      </TableRow>
    </TableHead>
  );
}
