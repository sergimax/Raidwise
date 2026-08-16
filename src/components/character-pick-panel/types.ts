import type { CharacterRecord } from "../../types/characters.ts";
import type { DungeonRecord, DungeonToggles } from "../../types/dungeons.ts";
import type { CharacterPickSessionState } from "../../hooks/use-character-pick-session-state.ts";

export type CharacterPickPanelProps = {
  characters: CharacterRecord[];
  visibleDungeons: DungeonRecord[];
  dungeonToggles: DungeonToggles;
  dungeonNameSearch: string;
  onDungeonNameSearchChange: (query: string) => void;
  totalDungeonCount: number;
  session: CharacterPickSessionState;
};
