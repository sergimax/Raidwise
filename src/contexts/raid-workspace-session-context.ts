import { createContext } from "react";
import type { useRaidTrackerTableState } from "../components/raid-tracker-table/use-raid-tracker-table-state.ts";
import type { useBisListsSessionState } from "../hooks/use-bis-lists-session-state.ts";
import type { useCharacterPickSessionState } from "../hooks/use-character-pick-session-state.ts";
import type { useGearPickSessionState } from "../hooks/use-gear-pick-session-state.ts";

export type RaidWorkspaceSessions = {
  bisLists: ReturnType<typeof useBisListsSessionState>;
  characterPick: ReturnType<typeof useCharacterPickSessionState>;
  gearPick: ReturnType<typeof useGearPickSessionState>;
  table: ReturnType<typeof useRaidTrackerTableState>;
};

export const RaidWorkspaceSessionContext =
  createContext<RaidWorkspaceSessions | null>(null);
