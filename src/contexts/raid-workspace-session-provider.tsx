import type { ReactNode } from "react";
import { useRaidTrackerTableState } from "../components/raid-tracker-table/use-raid-tracker-table-state.ts";
import { useBisListsSessionState } from "../hooks/use-bis-lists-session-state.ts";
import { useCharacterPickSessionState } from "../hooks/use-character-pick-session-state.ts";
import { useGearPickSessionState } from "../hooks/use-gear-pick-session-state.ts";
import { useRaidTrackerContext } from "../hooks/use-raid-tracker-context.ts";
import { RaidWorkspaceSessionContext } from "./raid-workspace-session-context.ts";

export function RaidWorkspaceSessionProvider({ children }: { children: ReactNode }) {
  const domain = useRaidTrackerContext();
  const value = {
    bisLists: useBisListsSessionState(),
    characterPick: useCharacterPickSessionState(),
    gearPick: useGearPickSessionState(),
    table: useRaidTrackerTableState({
      characters: domain.characters,
      dungeons: domain.dungeons,
      dungeonToggles: domain.dungeonToggles,
      onDeleteCharacter: domain.handleDeleteCharacter,
      onDeleteDungeon: domain.handleDeleteDungeon,
    }),
  };

  return (
    <RaidWorkspaceSessionContext.Provider value={value}>
      {children}
    </RaidWorkspaceSessionContext.Provider>
  );
}
