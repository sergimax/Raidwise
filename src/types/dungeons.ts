import type { EmblemKey } from "../assets/emblems/emblem-icons.ts";
import type { RaidKey } from "../data/raid-names.ts";

export const DungeonDifficulty = {
  NORMAL: "Normal",
  HEROIC: "Heroic",
} as const;

export type DungeonDifficulty = (typeof DungeonDifficulty)[keyof typeof DungeonDifficulty];

export const DungeonSizes = [5, 10, 20, 25, 40] as const;

export type DungeonSize = (typeof DungeonSizes)[number];

export type Dungeon = {
  name: string;
  /** Optional abbreviation; shown in compact table when set. */
  shortName?: string;
  size: DungeonSize;
  itemLevel: Array<number>;
  difficulty: DungeonDifficulty;
  /** WotLK emblem primarily rewarded by this raid (display only). */
  emblem?: EmblemKey;
  /** Template for loot hints. Missing keys infer from legacy names. Null explicitly detaches. */
  raidKey?: RaidKey | null;
};

export type DungeonRecord = Dungeon & { id: string };

/** Display fields and the selected loot template variant. */
export type DungeonCustomizationUpdate = Pick<
  Dungeon,
  "name" | "size" | "difficulty"
> & {
  raidKey: RaidKey | null;
  shortName?: string;
  emblem?: EmblemKey;
};

export type DungeonToggles = Record<string, Record<string, boolean>>;
