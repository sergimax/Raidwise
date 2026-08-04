/**
 * Ephemeral UI state for the raid tracker table: dungeon sorting,
 * name search, delete confirmation, responsive pinned-column layout, and
 * derived row data (filtered/sorted dungeons, per-dungeon completion counts).
 * Character-toggle sort plumbing remains with TODOs (UI control removed).
 */
import { useCallback, useMemo, useState } from "react";
import { useCompactLayout } from "../../hooks/use-compact-layout.ts";
import { usePendingDelete } from "../../hooks/use-pending-delete.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import type { DungeonRecord } from "../../types/dungeons.ts";
import { countCompletedForDungeon } from "../../utils/completion-counts.ts";
import { filterDungeonsByName } from "../../utils/filter-dungeons-by-name.ts";
import {
  defaultSortDirectionForKey,
  sortDungeons,
  sortDungeonsByCharacterToggle,
  type DungeonSortKey,
  type SortDirection,
} from "../../utils/sort-dungeons.ts";
import { pinnedColumnsForLayout } from "./table-layout.ts";
import type { RaidTrackerPendingDelete, UseRaidTrackerTableStateParams } from "./types.ts";

export function useRaidTrackerTableState({
  characters,
  dungeons,
  dungeonToggles,
  onDeleteCharacter,
  onDeleteDungeon,
}: UseRaidTrackerTableStateParams) {
  const { t } = useTranslation();
  const compactTable = useCompactLayout();
  const visiblePinnedColumns = useMemo(
    () => pinnedColumnsForLayout(compactTable, t),
    [compactTable, t],
  );

  const dungeonCount = dungeons.length;
  const characterCount = characters.length;
  const [sortKey, setSortKey] = useState<DungeonSortKey>("itemLevel");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  // TODO: check if character-toggle sort is still needed (UI control removed from header).
  const [characterSortId, setCharacterSortId] = useState<string | null>(null);
  const [characterSortDirection, setCharacterSortDirection] =
    useState<SortDirection>("desc");
  const [dungeonNameSearch, setDungeonNameSearch] = useState("");

  const handleConfirmPendingDelete = useCallback(
    (item: RaidTrackerPendingDelete) => {
      if (item.kind === "character") {
        onDeleteCharacter(item.id);
      } else {
        onDeleteDungeon(item.id);
      }
    },
    [onDeleteCharacter, onDeleteDungeon],
  );

  const {
    pendingDelete,
    requestDelete,
    cancelDelete,
    confirmDelete,
  } = usePendingDelete<RaidTrackerPendingDelete>(handleConfirmPendingDelete);

  const handleRequestDeleteCharacter = useCallback(
    (characterId: string) => {
      const character = characters.find((entry) => entry.id === characterId);
      if (!character) return;
      requestDelete({
        kind: "character",
        id: characterId,
        name: character.name,
      });
    },
    [characters, requestDelete],
  );

  const handleRequestDeleteDungeon = useCallback(
    (dungeon: DungeonRecord) => {
      requestDelete({
        kind: "dungeon",
        id: dungeon.id,
        name: dungeon.name,
      });
    },
    [requestDelete],
  );

  const handleSort = useCallback(
    (nextSortKey: DungeonSortKey) => {
      // TODO: check if character-toggle sort is still needed (clears latent character sort).
      setCharacterSortId(null);
      if (nextSortKey === sortKey) {
        setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(nextSortKey);
        setSortDirection(defaultSortDirectionForKey(nextSortKey));
      }
    },
    [sortKey],
  );

  // TODO: check if character-toggle sort is still needed (no header control wired).
  const handleCharacterSort = useCallback(
    (nextCharacterId: string) => {
      setSortKey("itemLevel");
      setSortDirection("desc");
      if (characterSortId === nextCharacterId) {
        setCharacterSortDirection((previous) =>
          previous === "asc" ? "desc" : "asc",
        );
      } else {
        setCharacterSortId(nextCharacterId);
        setCharacterSortDirection("desc");
      }
    },
    [characterSortId],
  );

  const filteredDungeons = useMemo(
    () => filterDungeonsByName(dungeons, dungeonNameSearch),
    [dungeons, dungeonNameSearch],
  );

  const completionsByDungeonId = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const dungeon of dungeons) {
      counts[dungeon.id] = countCompletedForDungeon(
        dungeon.id,
        characters,
        dungeonToggles,
      );
    }
    return counts;
  }, [characters, dungeonToggles, dungeons]);

  const sortedDungeons = useMemo(() => {
    // TODO: check if character-toggle sort is still needed (branch unused without UI).
    if (characterSortId) {
      return sortDungeonsByCharacterToggle(
        filteredDungeons,
        characterSortId,
        characterSortDirection,
        dungeonToggles,
      );
    }
    return sortDungeons(
      filteredDungeons,
      sortKey,
      sortDirection,
      completionsByDungeonId,
    );
  }, [
    characterSortDirection,
    characterSortId,
    completionsByDungeonId,
    dungeonToggles,
    filteredDungeons,
    sortDirection,
    sortKey,
  ]);

  return useMemo(
    () => ({
      compactTable,
      visiblePinnedColumns,
      dungeonCount,
      characterCount,
      sortKey,
      sortDirection,
      // TODO: check if character-toggle sort is still needed (exported but unwired).
      characterSortId,
      characterSortDirection,
      dungeonNameSearch,
      setDungeonNameSearch,
      pendingDelete,
      sortedDungeons,
      completionsByDungeonId,
      handleSort,
      handleCharacterSort,
      handleRequestDeleteCharacter,
      handleRequestDeleteDungeon,
      handleCancelDelete: cancelDelete,
      handleConfirmDelete: confirmDelete,
    }),
    [
      cancelDelete,
      characterCount,
      characterSortDirection,
      characterSortId,
      compactTable,
      completionsByDungeonId,
      confirmDelete,
      dungeonCount,
      dungeonNameSearch,
      handleCharacterSort,
      handleRequestDeleteCharacter,
      handleRequestDeleteDungeon,
      handleSort,
      pendingDelete,
      sortDirection,
      sortKey,
      sortedDungeons,
      visiblePinnedColumns,
    ],
  );
}

export type RaidTrackerTableState = ReturnType<typeof useRaidTrackerTableState>;
