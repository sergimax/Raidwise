import type { ReactNode } from "react";
import { useRaidTrackerTableState } from "../hooks/use-raid-tracker-table-state.ts";
import { useBisListsSessionState } from "../hooks/use-bis-lists-session-state.ts";
import { useCharacterPickSessionState } from "../hooks/use-character-pick-session-state.ts";
import { useGearPickSessionState } from "../hooks/use-gear-pick-session-state.ts";
import { useRaidTrackerContext } from "../hooks/use-raid-tracker-context.ts";
import {
  BisListsSessionContext,
  CharacterPickSessionContext,
  GearPickSessionContext,
  RaidTableSessionContext,
  RaidWorkspaceSessionContext,
} from "./raid-workspace-session-context.ts";

type ProviderProps = { children: ReactNode };

function BisListsSessionProvider({ children }: ProviderProps) {
  const session = useBisListsSessionState();
  return <BisListsSessionContext value={session}>{children}</BisListsSessionContext>;
}

function CharacterPickSessionProvider({ children }: ProviderProps) {
  const session = useCharacterPickSessionState();
  return <CharacterPickSessionContext value={session}>{children}</CharacterPickSessionContext>;
}

function GearPickSessionProvider({ children }: ProviderProps) {
  const session = useGearPickSessionState();
  return <GearPickSessionContext value={session}>{children}</GearPickSessionContext>;
}

function RaidTableSessionProvider({ children }: ProviderProps) {
  const domain = useRaidTrackerContext();
  const session = useRaidTrackerTableState({
    characters: domain.characters,
    dungeons: domain.dungeons,
    dungeonToggles: domain.dungeonToggles,
    onDeleteCharacter: domain.handleDeleteCharacter,
    onDeleteDungeon: domain.handleDeleteDungeon,
  });
  return <RaidTableSessionContext value={session}>{children}</RaidTableSessionContext>;
}

export function RaidWorkspaceSessionProvider({ children }: ProviderProps) {
  return (
    <RaidWorkspaceSessionContext value={true}>
      <RaidTableSessionProvider>
        <CharacterPickSessionProvider>
          <GearPickSessionProvider>
            <BisListsSessionProvider>{children}</BisListsSessionProvider>
          </GearPickSessionProvider>
        </CharacterPickSessionProvider>
      </RaidTableSessionProvider>
    </RaidWorkspaceSessionContext>
  );
}
