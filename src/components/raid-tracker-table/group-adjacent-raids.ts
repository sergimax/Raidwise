import type { RaidKey } from "../../data/raid-names.ts";
import type { DungeonRecord } from "../../types/dungeons.ts";

export type AdjacentRaidGroup = {
  raidKey?: RaidKey;
  dungeons: DungeonRecord[];
};

/** Group only neighboring template raids; custom rows stay independent. */
export function groupAdjacentRaids(dungeons: DungeonRecord[]): AdjacentRaidGroup[] {
  const groups: AdjacentRaidGroup[] = [];
  for (const dungeon of dungeons) {
    const previous = groups[groups.length - 1];
    if (dungeon.raidKey && previous?.raidKey === dungeon.raidKey) {
      previous.dungeons.push(dungeon);
    } else {
      groups.push({ raidKey: dungeon.raidKey, dungeons: [dungeon] });
    }
  }
  return groups;
}
