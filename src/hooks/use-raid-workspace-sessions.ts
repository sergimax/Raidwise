import { useContext, type Context } from "react";
import {
  BisListsSessionContext,
  CharacterPickSessionContext,
  GearPickSessionContext,
  RaidTableSessionContext,
  RaidWorkspaceSessionContext,
} from "../contexts/raid-workspace-session-context.ts";

function useSession<T>(context: Context<T | null>): T {
  const value = useContext(context);
  if (value === null) {
    throw new Error("Workspace sessions must be used inside RaidWorkspaceSessionProvider");
  }
  return value;
}

export function useBisListsSession() {
  return useSession(BisListsSessionContext);
}

export function useCharacterPickSession() {
  return useSession(CharacterPickSessionContext);
}

export function useGearPickSession() {
  return useSession(GearPickSessionContext);
}

export function useRaidTableSession() {
  return useSession(RaidTableSessionContext);
}

export function useHasRaidWorkspaceSession() {
  return useContext(RaidWorkspaceSessionContext);
}
