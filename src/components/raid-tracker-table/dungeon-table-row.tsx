/**
 * One dungeon table row: delete action, pinned dungeon field cells, and
 * per-character cooldown toggle switches.
 */
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton, Stack, TableCell, TableRow, Tooltip } from "@mui/material";
import { memo, useCallback } from "react";
import { useTranslation } from "../../i18n/use-translation.ts";
import { useBisListsContext } from "../../hooks/use-bis-lists-context.ts";
import { getLocalizedDungeonDisplayName } from "../../i18n/localized-domain.ts";
import type { CharacterRecord } from "../../types/characters.ts";
import type { DungeonRecord, DungeonToggles } from "../../types/dungeons.ts";
import { isCooldownOn } from "../../utils/dungeon-toggles.ts";
import { CharacterToggleCell } from "./character-toggle-cell.tsx";
import { AddCharacterBodyCell } from "./add-character-column.tsx";
import {
  pinnedColumnBodyAlign,
  pinnedColumnBodySx,
  renderPinnedColumnBody,
} from "./pinned-column-renderers.tsx";
import {
  pinnedActionsColumnSx,
  type PinnedColumnDef,
} from "./table-layout.ts";

type DungeonTableRowProps = {
  dungeon: DungeonRecord;
  characters: CharacterRecord[];
  compactTable: boolean;
  visiblePinnedColumns: ReadonlyArray<PinnedColumnDef>;
  completionsByDungeonId: Readonly<Record<string, number>>;
  characterCount: number;
  dungeonToggles: DungeonToggles;
  onDungeonToggle: (characterId: string, dungeonId: string) => void;
  onEditDungeon: (dungeonId: string) => void;
  onRequestDeleteDungeon: (dungeon: DungeonRecord) => void;
  onAddCharacter: () => void;
  characterFormOpen?: boolean;
};

function dungeonRowTogglesEqual(
  previous: DungeonToggles,
  next: DungeonToggles,
  dungeonId: string,
  characters: readonly CharacterRecord[],
): boolean {
  for (const character of characters) {
    if (
      isCooldownOn(previous, character.id, dungeonId) !==
      isCooldownOn(next, character.id, dungeonId)
    ) {
      return false;
    }
  }
  return true;
}

function areDungeonTableRowPropsEqual(
  previous: DungeonTableRowProps,
  next: DungeonTableRowProps,
): boolean {
  if (previous.dungeon !== next.dungeon) {
    return false;
  }
  if (previous.characters !== next.characters) {
    return false;
  }
  if (previous.compactTable !== next.compactTable) {
    return false;
  }
  if (previous.visiblePinnedColumns !== next.visiblePinnedColumns) {
    return false;
  }
  if (previous.characterCount !== next.characterCount) {
    return false;
  }
  if (previous.onDungeonToggle !== next.onDungeonToggle) {
    return false;
  }
  if (previous.onEditDungeon !== next.onEditDungeon) {
    return false;
  }
  if (previous.onRequestDeleteDungeon !== next.onRequestDeleteDungeon) {
    return false;
  }
  if (previous.onAddCharacter !== next.onAddCharacter) {
    return false;
  }
  if (previous.characterFormOpen !== next.characterFormOpen) {
    return false;
  }
  if (
    previous.completionsByDungeonId[previous.dungeon.id] !==
    next.completionsByDungeonId[next.dungeon.id]
  ) {
    return false;
  }
  return dungeonRowTogglesEqual(
    previous.dungeonToggles,
    next.dungeonToggles,
    previous.dungeon.id,
    previous.characters,
  );
}

export const DungeonTableRow = memo(function DungeonTableRow({
  dungeon,
  characters,
  compactTable,
  visiblePinnedColumns,
  completionsByDungeonId,
  characterCount,
  dungeonToggles,
  onDungeonToggle,
  onEditDungeon,
  onRequestDeleteDungeon,
  onAddCharacter,
  characterFormOpen = false,
}: DungeonTableRowProps) {
  const { t, locale } = useTranslation();
  const { getBisSlotMapForSpec } = useBisListsContext();
  const dungeonDisplayName = getLocalizedDungeonDisplayName(dungeon, locale, false);

  const handleEdit = useCallback(() => {
    onEditDungeon(dungeon.id);
  }, [dungeon.id, onEditDungeon]);

  const handleRequestDelete = useCallback(() => {
    onRequestDeleteDungeon(dungeon);
  }, [dungeon, onRequestDeleteDungeon]);

  return (
    <TableRow hover>
      <TableCell sx={pinnedActionsColumnSx(compactTable, false)}>
        <Stack direction="row" spacing={0.25} sx={{ justifyContent: "center" }}>
          <Tooltip title={t("table.editDungeon", { name: dungeonDisplayName })}>
            <IconButton
              size="small"
              color="default"
              onClick={handleEdit}
              aria-label={t("table.editDungeon", { name: dungeonDisplayName })}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("table.deleteDungeon", { name: dungeonDisplayName })}>
            <IconButton
              size="small"
              color="error"
              onClick={handleRequestDelete}
              aria-label={t("table.deleteDungeon", { name: dungeonDisplayName })}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
      {visiblePinnedColumns.map((column) => (
        <TableCell
          key={column.key}
          align={pinnedColumnBodyAlign(column.key)}
          sx={pinnedColumnBodySx(column.key, compactTable)}
        >
          {renderPinnedColumnBody({
            column,
            compactTable,
            dungeon,
            completionsByDungeonId,
            characterCount,
          })}
        </TableCell>
      ))}
      {characters.map((character) => (
        <CharacterToggleCell
          key={character.id}
          character={character}
          dungeon={dungeon}
          dungeonToggles={dungeonToggles}
          onDungeonToggle={onDungeonToggle}
          locale={locale}
          getBisSlotMapForSpec={getBisSlotMapForSpec}
        />
      ))}
      <AddCharacterBodyCell
        onAddCharacter={onAddCharacter}
        active={characterFormOpen}
      />
    </TableRow>
  );
}, areDungeonTableRowPropsEqual);
