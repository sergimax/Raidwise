import type { CharacterRecord } from "./characters.ts";
import type { DungeonRecord, DungeonToggles } from "./dungeons.ts";

export type RaidTrackerPendingDelete =
  | { kind: "character"; id: string; name: string }
  | { kind: "dungeon"; id: string; name: string };

export type UseRaidTrackerTableStateParams = {
  characters: CharacterRecord[];
  dungeons: DungeonRecord[];
  dungeonToggles: DungeonToggles;
  onDeleteCharacter: (characterId: string) => void;
  onDeleteDungeon: (dungeonId: string) => void;
};
