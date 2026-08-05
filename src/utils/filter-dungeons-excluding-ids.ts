import type { DungeonRecord } from "../types/dungeons.ts";

/** Dungeons still included after manual chip exclusions (passive chips). */
export function filterDungeonsExcludingIds(
  dungeons: readonly DungeonRecord[],
  excludedDungeonIds: ReadonlySet<string>,
): DungeonRecord[] {
  if (excludedDungeonIds.size === 0) {
    return [...dungeons];
  }
  return dungeons.filter((dungeon) => !excludedDungeonIds.has(dungeon.id));
}

export function toggleDungeonIdExclusion(
  excludedDungeonIds: ReadonlySet<string>,
  dungeonId: string,
): Set<string> {
  const next = new Set(excludedDungeonIds);
  if (next.has(dungeonId)) {
    next.delete(dungeonId);
  } else {
    next.add(dungeonId);
  }
  return next;
}
