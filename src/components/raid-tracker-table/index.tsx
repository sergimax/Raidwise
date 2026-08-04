import { Stack, Table, TableBody, TableContainer } from "@mui/material";
import { memo, useCallback, useMemo, useState } from "react";
import { CharacterEditDialog } from "../character-edit-dialog/index.tsx";
import { DungeonEditDialog } from "../dungeon-edit-dialog/index.tsx";
import { useRaidTrackerContext } from "../../hooks/use-raid-tracker-context.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import type { DungeonRecord } from "../../types/dungeons.ts";
import { DungeonTableRow } from "./dungeon-table-row.tsx";
import { RaidTrackerDeleteDialog } from "./raid-tracker-delete-dialog.tsx";
import { raidTrackerTableAriaLabel } from "./raid-tracker-table-empty-state.ts";
import { RaidTrackerTableEmptyState } from "./raid-tracker-table-empty-state.tsx";
import { RaidTrackerTableHead } from "./raid-tracker-table-head.tsx";
import type { RaidTrackerTableState } from "./use-raid-tracker-table-state.ts";
import "./styles.css";

type RaidTrackerTableProps = {
  tableState: RaidTrackerTableState;
};

export const RaidTrackerTable = memo(function RaidTrackerTable({
  tableState,
}: RaidTrackerTableProps) {
  const { t } = useTranslation();
  const domain = useRaidTrackerContext();
  const {
    characters,
    dungeons,
    dungeonToggles,
    handleDungeonToggle: onDungeonToggle,
    handleResetCharacterToggles: onResetCharacterToggles,
    updateCharacter,
    updateDungeon,
  } = domain;

  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(
    null,
  );
  const [editingDungeonId, setEditingDungeonId] = useState<string | null>(null);
  const editingCharacter = useMemo(
    () => characters.find((character) => character.id === editingCharacterId) ?? null,
    [characters, editingCharacterId],
  );
  const editingDungeon = useMemo(
    () => dungeons.find((dungeon) => dungeon.id === editingDungeonId) ?? null,
    [dungeons, editingDungeonId],
  );

  const handleEditCharacter = useCallback((characterId: string) => {
    setEditingCharacterId(characterId);
  }, []);

  const handleCloseEditCharacter = useCallback(() => {
    setEditingCharacterId(null);
  }, []);

  const handleEditDungeon = useCallback((dungeonId: string) => {
    setEditingDungeonId(dungeonId);
  }, []);

  const handleCloseEditDungeon = useCallback(() => {
    setEditingDungeonId(null);
  }, []);

  const {
    compactTable,
    visiblePinnedColumns,
    dungeonCount,
    characterCount,
    sortKey,
    sortDirection,
    dungeonNameSearch,
    setDungeonNameSearch,
    pendingDelete,
    sortedDungeons,
    completionsByDungeonId,
    handleSort,
    handleRequestDeleteCharacter,
    handleRequestDeleteDungeon,
    handleCancelDelete,
    handleConfirmDelete,
  } = tableState;

  return (
    <Stack spacing={2}>
      <TableContainer
        className="raid-tracker-table-container"
        sx={{
          // Contain wide character columns so the page does not scroll horizontally.
          overflowX: "auto",
          maxWidth: "100%",
        }}
      >
        <Table
          aria-label={raidTrackerTableAriaLabel(
            dungeons.length,
            sortedDungeons.length,
            t,
          )}
          className={[
            "raid-tracker-table",
            compactTable ? "raid-tracker-table--compact" : null,
          ]
            .filter(Boolean)
            .join(" ")}
          size="small"
          sx={{
            tableLayout: "fixed",
            width: "max-content",
            // Separate collapse so corner radii on sticky cells actually clip.
            borderCollapse: "separate",
          }}
        >
          <RaidTrackerTableHead
            compactTable={compactTable}
            visiblePinnedColumns={visiblePinnedColumns}
            characters={characters}
            sortKey={sortKey}
            sortDirection={sortDirection}
            dungeonNameSearch={dungeonNameSearch}
            onDungeonNameSearchChange={setDungeonNameSearch}
            onSort={handleSort}
            onResetCharacterToggles={onResetCharacterToggles}
            onEditCharacter={handleEditCharacter}
            onRequestDeleteCharacter={handleRequestDeleteCharacter}
          />
          <TableBody>
            {dungeons.length === 0 ? (
              <RaidTrackerTableEmptyState
                variant="no-dungeons"
                visiblePinnedColumns={visiblePinnedColumns}
                characterCount={characterCount}
              />
            ) : sortedDungeons.length === 0 ? (
              <RaidTrackerTableEmptyState
                variant="no-search-matches"
                visiblePinnedColumns={visiblePinnedColumns}
                characterCount={characterCount}
              />
            ) : (
              sortedDungeons.map((dungeon: DungeonRecord) => (
                <DungeonTableRow
                  key={dungeon.id}
                  dungeon={dungeon}
                  characters={characters}
                  compactTable={compactTable}
                  visiblePinnedColumns={visiblePinnedColumns}
                  completionsByDungeonId={completionsByDungeonId}
                  characterCount={characterCount}
                  dungeonToggles={dungeonToggles}
                  onDungeonToggle={onDungeonToggle}
                  onEditDungeon={handleEditDungeon}
                  onRequestDeleteDungeon={handleRequestDeleteDungeon}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <RaidTrackerDeleteDialog
        pendingDelete={pendingDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      <CharacterEditDialog
        character={editingCharacter}
        onClose={handleCloseEditCharacter}
        onSave={updateCharacter}
      />
      <DungeonEditDialog
        dungeon={editingDungeon}
        onClose={handleCloseEditDungeon}
        onSave={updateDungeon}
      />
    </Stack>
  );
});
