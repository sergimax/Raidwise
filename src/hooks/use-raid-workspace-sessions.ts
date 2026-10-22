import { useContext } from "react";
import { RaidWorkspaceSessionContext } from "../contexts/raid-workspace-session-context.ts";

export function useRaidWorkspaceSessions() {
  const value = useContext(RaidWorkspaceSessionContext);
  if (!value) {
    throw new Error("useRaidWorkspaceSessions must be used inside its provider");
  }
  return value;
}

export function useOptionalRaidWorkspaceSessions() {
  return useContext(RaidWorkspaceSessionContext);
}
