import type { RaidKey } from "../../data/raid-names.ts";
import type { DungeonRecord } from "../../types/dungeons.ts";

export type AdjacentRaidGroup = {
  raidKey?: RaidKey;
  dungeons: DungeonRecord[];
};

const MAX_RAID_BACKGROUND_ROWS = 4;

/** Group neighboring template raids in blocks of up to four rows. */
export function groupAdjacentRaids(dungeons: DungeonRecord[]): AdjacentRaidGroup[] {
  const groups: AdjacentRaidGroup[] = [];
  for (const dungeon of dungeons) {
    const previous = groups[groups.length - 1];
    if (
      dungeon.raidKey &&
      previous?.raidKey === dungeon.raidKey &&
      previous.dungeons.length < MAX_RAID_BACKGROUND_ROWS
    ) {
      previous.dungeons.push(dungeon);
    } else {
      groups.push({ raidKey: dungeon.raidKey, dungeons: [dungeon] });
    }
  }
  return groups;
}
