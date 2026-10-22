import { RaidNames, type RaidKey } from "../data/raid-names.ts";
import { isRaidKey } from "../data/raid-zones.ts";
import { DungeonDifficulty, type DungeonRecord } from "../types/dungeons.ts";

function normalizeDungeonName(value: string): string {
  return value.trim().toLowerCase();
}

function raidNameCandidates(
  raid: (typeof RaidNames)[RaidKey],
  includeHeroicName = true,
): string[] {
  const candidates: string[] = [raid.ru, raid.en, raid.shortRu];
  if (includeHeroicName && "heroic" in raid) {
    candidates.push(
      raid.heroic.ru,
      raid.heroic.en,
      raid.heroic.shortRu,
      raid.heroic.shortEn,
    );
  }
  if ("shortEn" in raid && typeof raid.shortEn === "string") {
    candidates.push(raid.shortEn);
  }
  return candidates;
}

/** All name variants used for dungeon table search (stored + template raid labels). */
export function getDungeonSearchNameCandidates(
  dungeon: Pick<
    DungeonRecord,
    "name" | "shortName" | "raidKey" | "difficulty"
  >,
): string[] {
  const candidates = new Set<string>([dungeon.name]);
  if (dungeon.shortName) {
    candidates.add(dungeon.shortName);
  }
  const raidKey = resolveDungeonRaidKey(dungeon);
  if (raidKey) {
    for (const candidate of raidNameCandidates(
      RaidNames[raidKey],
      dungeon.difficulty === DungeonDifficulty.HEROIC,
    )) {
      candidates.add(candidate);
    }
  }
  return [...candidates];
}

/** Resolve template raid metadata for a dungeon row (saved key or known name). */
export function resolveDungeonRaidKey(
  dungeon: Pick<DungeonRecord, "name" | "raidKey">,
): RaidKey | undefined {
  if (dungeon.raidKey && isRaidKey(dungeon.raidKey)) {
    return dungeon.raidKey;
  }

  const normalizedName = normalizeDungeonName(dungeon.name);
  for (const raidKey of Object.keys(RaidNames) as RaidKey[]) {
    const raid = RaidNames[raidKey];
    if (
      raidNameCandidates(raid).some(
        (candidate) => normalizeDungeonName(candidate) === normalizedName,
      )
    ) {
      return raidKey;
    }
  }

  return undefined;
}
