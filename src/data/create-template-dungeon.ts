import type {
  Dungeon,
  DungeonDifficulty,
  DungeonSize,
} from "../types/dungeons.ts";
import { DungeonDifficulty as DungeonDifficultyValues } from "../types/dungeons.ts";
import { RaidNames, type RaidKey } from "./raid-names.ts";

export type CreateTemplateDungeonOptions = {
  raidKey: RaidKey;
  size: DungeonSize;
  difficulty: DungeonDifficulty;
  itemLevel: number[];
  /** When true, sets `emblem` from raid metadata (template ICC / Ruby Sanctum rows). */
  withEmblem?: boolean;
};

export function createTemplateDungeon({
  raidKey,
  size,
  difficulty,
  itemLevel,
  withEmblem = false,
}: CreateTemplateDungeonOptions): Dungeon {
  const raid = RaidNames[raidKey];
  const nameVariant =
    difficulty === DungeonDifficultyValues.HEROIC && "heroic" in raid
      ? raid.heroic
      : raid;
  return {
    name: nameVariant.ru,
    ...(nameVariant.shortRu ? { shortName: nameVariant.shortRu } : {}),
    size,
    itemLevel,
    difficulty,
    raidKey,
    ...(withEmblem ? { emblem: raid.emblem } : {}),
  };
}
