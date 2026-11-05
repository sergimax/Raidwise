import { createContext } from "react";
import type { useRaidTrackerTableState } from "../hooks/use-raid-tracker-table-state.ts";
import type { useBisListsSessionState } from "../hooks/use-bis-lists-session-state.ts";
import type { useCharacterPickSessionState } from "../hooks/use-character-pick-session-state.ts";
import type { useGearPickSessionState } from "../hooks/use-gear-pick-session-state.ts";

export const RaidWorkspaceSessionContext = createContext(false);
export const BisListsSessionContext = createContext<ReturnType<typeof useBisListsSessionState> | null>(null);
export const CharacterPickSessionContext = createContext<ReturnType<typeof useCharacterPickSessionState> | null>(null);
export const GearPickSessionContext = createContext<ReturnType<typeof useGearPickSessionState> | null>(null);
export const RaidTableSessionContext = createContext<ReturnType<typeof useRaidTrackerTableState> | null>(null);
