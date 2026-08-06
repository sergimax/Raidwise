import type { CharacterRecord } from "../../types/characters.ts";
import type { DungeonRecord, DungeonToggles } from "../../types/dungeons.ts";
import type { ExportSessionState } from "../../hooks/use-export-session-state.ts";

export type ExportPanelProps = {
  characters: CharacterRecord[];
  visibleDungeons: DungeonRecord[];
  dungeonToggles: DungeonToggles;
  dungeonNameSearch: string;
  onDungeonNameSearchChange: (query: string) => void;
  totalDungeonCount: number;
  session: ExportSessionState;
};
