import { Stack, Table, TableBody, TableContainer } from "@mui/material";
import { memo, useCallback, useMemo, useState } from "react";
import { CharacterEditDialog } from "../character-edit-dialog/index.tsx";
import { DungeonEditDialog } from "../dungeon-edit-dialog/index.tsx";
import { useRaidTrackerContext } from "../../hooks/use-raid-tracker-context.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import type { DungeonRecord } from "../../types/dungeons.ts";
import { AddDungeonRow } from "./add-dungeon-row.tsx";
import { DungeonTableRow } from "./dungeon-table-row.tsx";
import { groupAdjacentRaids } from "./group-adjacent-raids.ts";
import { raidRowBackgroundFile, raidRowBackgroundSx } from "./raid-row-background.ts";
import { RaidTrackerDeleteDialog } from "./raid-tracker-delete-dialog.tsx";
import { DeleteConfirmDialog } from "./delete-confirm-dialog.tsx";
import { raidTrackerTableAriaLabel } from "./raid-tracker-table-empty-state.ts";
import { RaidTrackerTableEmptyState } from "./raid-tracker-table-empty-state.tsx";
import { RaidTrackerTableHead } from "./raid-tracker-table-head.tsx";
import type { RaidTrackerTableState } from "./use-raid-tracker-table-state.ts";
import "./styles.css";

type RaidTrackerTableProps = {
  tableState: RaidTrackerTableState;
  onAddCharacter: () => void;
  onAddDungeon: () => void;
  characterFormOpen?: boolean;
  dungeonFormOpen?: boolean;
};

export const RaidTrackerTable = memo(function RaidTrackerTable({
  tableState,
  onAddCharacter,
  onAddDungeon,
  characterFormOpen = false,
  dungeonFormOpen = false,
}: RaidTrackerTableProps) {
  const { t } = useTranslation();
  const domain = useRaidTrackerContext();
  const {
    characters,
    dungeons,
    dungeonToggles,
    handleDungeonToggle: onDungeonToggle,
    handleResetCharacterToggles: onResetCharacterToggles,
    handleResetAllToggles,
    canResetAllToggles,
    updateCharacter,
    moveCharacter,
    updateDungeon,
  } = domain;

  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(
    null,
  );
  const [editingDungeonId, setEditingDungeonId] = useState<string | null>(null);
  const [resetTogglesPending, setResetTogglesPending] = useState(false);
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
  const dungeonGroups = useMemo(
    () =>
      sortKey === "name"
        ? groupAdjacentRaids(sortedDungeons)
        : sortedDungeons.length > 0
          ? [{ dungeons: sortedDungeons }]
          : [],
    [sortKey, sortedDungeons],
  );

  return (
    <Stack spacing={2}>
      <TableContainer
        className="raid-tracker-table-container"
        sx={{
          // Contain wide character columns so the page does not scroll horizontally.
          overflowX: "auto",
          // Let the table sit closer to the main area's edges than other panels.
          ml: { xs: "-12px !important", sm: "-16px !important" },
          width: { xs: "calc(100% + 24px)", sm: "calc(100% + 32px)" },
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
            canResetToggles={canResetAllToggles}
            onRequestResetToggles={() => setResetTogglesPending(true)}
            onSort={handleSort}
            onResetCharacterToggles={onResetCharacterToggles}
            onEditCharacter={handleEditCharacter}
            onRequestDeleteCharacter={handleRequestDeleteCharacter}
            onAddCharacter={onAddCharacter}
            characterFormOpen={characterFormOpen}
          />
          {dungeonGroups.map((group) => {
            const backgroundFile = raidRowBackgroundFile(group.raidKey);
            const groupedBackground = Boolean(backgroundFile && group.dungeons.length > 1);
            return (
              <TableBody
                key={group.dungeons[0]?.id ?? "empty-dungeons"}
                sx={
                  groupedBackground && backgroundFile
                    ? (theme) => raidRowBackgroundSx(theme, backgroundFile)
                    : undefined
                }
              >
                {group.dungeons.map((dungeon: DungeonRecord) => (
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
                    onAddCharacter={onAddCharacter}
                    characterFormOpen={characterFormOpen}
                    groupedBackground={groupedBackground}
                  />
                ))}
              </TableBody>
            );
          })}
          <TableBody>
            {dungeons.length > 0 && sortedDungeons.length === 0 ? (
              <RaidTrackerTableEmptyState
                variant="no-search-matches"
                visiblePinnedColumns={visiblePinnedColumns}
                characterCount={characterCount}
              />
            ) : null}
            <AddDungeonRow
              compactTable={compactTable}
              visiblePinnedColumns={visiblePinnedColumns}
              characterCount={characterCount}
              onAddDungeon={onAddDungeon}
              onAddCharacter={onAddCharacter}
              active={dungeonFormOpen}
              characterFormActive={characterFormOpen}
              showEmptyHint={dungeons.length === 0}
            />
          </TableBody>
        </Table>
      </TableContainer>
      <RaidTrackerDeleteDialog
        pendingDelete={pendingDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      <DeleteConfirmDialog
        open={resetTogglesPending}
        title={t("dataControlsPanel.resetTogglesConfirmTitle")}
        message={t("dataControlsPanel.resetTogglesConfirmMessage")}
        confirmLabel={t("dataControlsPanel.resetConfirm")}
        confirmColor="warning"
        onConfirm={() => {
          handleResetAllToggles();
          setResetTogglesPending(false);
        }}
        onCancel={() => setResetTogglesPending(false)}
      />
      <CharacterEditDialog
        character={editingCharacter}
        characters={characters}
        onClose={handleCloseEditCharacter}
        onSave={updateCharacter}
        onMoveCharacter={moveCharacter}
      />
      <DungeonEditDialog
        dungeon={editingDungeon}
        onClose={handleCloseEditDungeon}
        onSave={updateDungeon}
      />
    </Stack>
  );
});
