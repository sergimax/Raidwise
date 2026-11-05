/**
 * Session state for raid sorting, filtering, delete confirmation and completion counts.
 */
import { useCallback, useMemo, useState } from "react";
import { usePendingDelete } from "./use-pending-delete.ts";
import type { DungeonRecord } from "../types/dungeons.ts";
import { countCompletedForDungeon } from "../utils/completion-counts.ts";
import { filterDungeonsByName } from "../utils/filter-dungeons-by-name.ts";
import {
  defaultSortDirectionForKey,
  sortDungeons,
  type DungeonSortKey,
  type SortDirection,
} from "../utils/sort-dungeons.ts";
import type { RaidTrackerPendingDelete, UseRaidTrackerTableStateParams } from "../types/raid-tracker-table.ts";

export function useRaidTrackerTableState({
  characters,
  dungeons,
  dungeonToggles,
  onDeleteCharacter,
  onDeleteDungeon,
}: UseRaidTrackerTableStateParams) {
  const dungeonCount = dungeons.length;
  const characterCount = characters.length;
  const [sortKey, setSortKey] = useState<DungeonSortKey>("itemLevel");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
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
      if (nextSortKey === sortKey) {
        setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(nextSortKey);
        setSortDirection(defaultSortDirectionForKey(nextSortKey));
      }
    },
    [sortKey],
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

  const sortedDungeons = useMemo(
    () => sortDungeons(filteredDungeons, sortKey, sortDirection, completionsByDungeonId),
    [filteredDungeons, sortKey, sortDirection, completionsByDungeonId],
  );

  return useMemo(
    () => ({
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
      handleCancelDelete: cancelDelete,
      handleConfirmDelete: confirmDelete,
    }),
    [
      cancelDelete,
      characterCount,
      completionsByDungeonId,
      confirmDelete,
      dungeonCount,
      dungeonNameSearch,
      handleRequestDeleteCharacter,
      handleRequestDeleteDungeon,
      handleSort,
      pendingDelete,
      sortDirection,
      sortKey,
      sortedDungeons,
    ],
  );
}

export type RaidTrackerTableState = ReturnType<typeof useRaidTrackerTableState>;
