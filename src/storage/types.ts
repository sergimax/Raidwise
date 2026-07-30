import type { EmblemKey } from "../assets/emblems/emblem-icons.ts";
import type { RaidKey } from "../data/raid-names.ts";
import type { CharacterRecord } from "../types/characters.ts";
import type { DungeonRecord, DungeonToggles } from "../types/dungeons.ts";

export type PersistedTrackerState = {
  characters: CharacterRecord[];
  dungeons: DungeonRecord[];
  dungeonToggles: DungeonToggles;
};

export type LoadRaidTrackerResult = {
  state: PersistedTrackerState;
  loadWarning: string | null;
};

export type StoredCharacterSpecGear = {
  spec: string;
  gearScore?: number;
  gearItems?: StoredCharacterGearItem[];
};

export type StoredCharacterGearItem = {
  slot: number;
  id: number;
  enchant?: number;
  gems?: number[];
};

export type StoredCharacter = {
  id: string;
  name: string;
  className: string;
  mainSpec?: StoredCharacterSpecGear | string;
  offSpec?: StoredCharacterSpecGear | string;
  /** Item ids owned/available but not on the WowSims export (schema v6+). */
  alsoOwnedItemIds?: number[];
  /** Legacy v2 flat gear score — migrated to main spec on load. */
  gearScore?: number;
  /** Legacy v4 flat gear — migrated to main spec on load. */
  gearItems?: StoredCharacterGearItem[];
};

export type StoredDungeon = {
  id: string;
  name: string;
  shortName?: string;
  size: DungeonRecord["size"];
  itemLevel: number[];
  emblem?: EmblemKey;
  raidKey?: RaidKey;
  /** Legacy key from older saves */
  mode?: string;
  difficulty?: string;
};

export type StoredPayload = {
  schemaVersion?: number;
  characters: StoredCharacter[];
  dungeons: StoredDungeon[];
  dungeonToggles: Record<string, Record<string, boolean>>;
};

export const EMPTY_STATE: PersistedTrackerState = {
  characters: [],
  dungeons: [],
  dungeonToggles: {},
};
