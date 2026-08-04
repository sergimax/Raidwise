import {
  type DungeonRecord,
  type DungeonToggles,
} from "../types/dungeons.ts";
import { compareDungeonType } from "./dungeon-type.ts";
import { getStartingItemLevel } from "./item-level-tier.ts";
import { isCooldownOn } from "./dungeon-toggles.ts";

export type DungeonSortKey =
  | "name"
  | "type"
  | "itemLevel"
  | "completions";

export type SortDirection = "asc" | "desc";

export function defaultSortDirectionForKey(key: DungeonSortKey): SortDirection {
  if (key === "itemLevel" || key === "completions" || key === "type") {
    return "desc";
  }
  return "asc";
}

export function sortDungeons(
  list: DungeonRecord[],
  key: DungeonSortKey,
  direction: SortDirection,
  completionsByDungeonId?: Readonly<Record<string, number>>,
): DungeonRecord[] {
  const startingIlvlCache =
    key === "itemLevel" ? new Map<string, number>() : null;
  const getCachedStartingItemLevel = (dungeon: DungeonRecord): number => {
    if (!startingIlvlCache) return getStartingItemLevel(dungeon.itemLevel);
    const cached = startingIlvlCache.get(dungeon.id);
    if (cached !== undefined) return cached;
    const computed = getStartingItemLevel(dungeon.itemLevel);
    startingIlvlCache.set(dungeon.id, computed);
    return computed;
  };

  const sorted = [...list].sort((firstDungeon, secondDungeon) => {
    let comparison = 0;
    if (key === "name") {
      comparison =
        firstDungeon.name.localeCompare(secondDungeon.name) ||
        compareDungeonType(firstDungeon, secondDungeon);
    } else if (key === "type") {
      comparison =
        compareDungeonType(firstDungeon, secondDungeon) ||
        getCachedStartingItemLevel(firstDungeon) -
          getCachedStartingItemLevel(secondDungeon);
    } else if (key === "itemLevel") {
      comparison =
        getCachedStartingItemLevel(firstDungeon) -
          getCachedStartingItemLevel(secondDungeon) ||
        firstDungeon.name.localeCompare(secondDungeon.name);
    } else if (key === "completions") {
      const firstCount = completionsByDungeonId?.[firstDungeon.id] ?? 0;
      const secondCount = completionsByDungeonId?.[secondDungeon.id] ?? 0;
      comparison =
        firstCount - secondCount ||
        firstDungeon.name.localeCompare(secondDungeon.name) ||
        compareDungeonType(firstDungeon, secondDungeon);
    }
    return direction === "asc" ? comparison : -comparison;
  });
  return sorted;
}

/** Sort dungeons by whether a character has CD on each row (on before off when desc).
 * TODO: check if character-toggle sort is still needed (header control removed). */
export function sortDungeonsByCharacterToggle(
  list: DungeonRecord[],
  characterId: string,
  direction: SortDirection,
  dungeonToggles: DungeonToggles,
): DungeonRecord[] {
  const sorted = [...list].sort((firstDungeon, secondDungeon) => {
    const firstValue = isCooldownOn(dungeonToggles, characterId, firstDungeon.id)
      ? 1
      : 0;
    const secondValue = isCooldownOn(
      dungeonToggles,
      characterId,
      secondDungeon.id,
    )
      ? 1
      : 0;
    const comparison =
      firstValue - secondValue ||
      firstDungeon.name.localeCompare(secondDungeon.name) ||
      compareDungeonType(firstDungeon, secondDungeon);
    return direction === "asc" ? comparison : -comparison;
  });
  return sorted;
}
