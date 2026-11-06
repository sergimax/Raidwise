import { BIS_LISTS_SCHEMA_VERSION, BIS_LISTS_STORAGE_KEYS } from "./bis-lists/constants.ts";
import { parseLocalBisListsState } from "./bis-lists/index.ts";
import {
  CURRENT_SCHEMA_VERSION,
  LOAD_WARNING_UNSUPPORTED_SAVE,
  STORAGE_CONFLICT,
  STORAGE_LOCK_UNAVAILABLE,
  STORAGE_READ_FAILED,
  TRACKER_STORAGE_KEYS,
} from "./constants.ts";
import { isRecord } from "./guards.ts";
import { getWriteError, readSnapshot, sameSnapshot, saveLockName, type SaveError, type SaveSnapshot } from "./local-save.ts";
import { parseRaidTrackerState } from "./parse.ts";
import { serializeRaidTrackerState } from "./persist.ts";
import { withSaveVisibility } from "./save-visibility.ts";
import type { PersistedTrackerState } from "./types.ts";
import type { LocalBisListsState } from "../types/bis-lists.ts";
import { writeWorkspaceSave, type WorkspaceSave } from "./workspace-save.ts";

const BACKUP_FORMAT = "raidwise-backup";
const BACKUP_VERSION = 1;
export const MAX_BACKUP_BYTES = 10 * 1024 * 1024;

export type WorkspaceSummary = { characters: number; raids: number; cooldowns: number; bisLists: number };
export type BackupFileError = "invalid" | "unsupported";
export type WorkspaceBackup = { save: WorkspaceSave; summary: WorkspaceSummary };
export type WorkspaceSnapshots = { tracker: SaveSnapshot; bisLists: SaveSnapshot };

export function createWorkspaceBackup({ tracker, bisLists }: WorkspaceSave): string {
  return JSON.stringify({
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    tracker: JSON.parse(tracker),
    bisLists: JSON.parse(bisLists),
  });
}

function summarizeStates(tracker: PersistedTrackerState, bisLists: LocalBisListsState): WorkspaceSummary {
  return {
    characters: tracker.characters.length,
    raids: tracker.dungeons.length,
    cooldowns: Object.values(tracker.dungeonToggles).reduce((total, raidToggles) =>
      total + Object.values(raidToggles).filter(Boolean).length, 0),
    bisLists: Object.values(bisLists.entries).reduce((total, { presets }) => total + presets.length, 0),
  };
}

export function summarizeWorkspace(save: WorkspaceSave): WorkspaceSummary {
  return summarizeStates(parseRaidTrackerState(save.tracker).state, parseLocalBisListsState(save.bisLists).state);
}

export function parseWorkspaceBackup(raw: string):
  | { ok: true; backup: WorkspaceBackup }
  | { ok: false; error: BackupFileError } {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ok: false, error: "invalid" };
  }
  if (!isRecord(value) || value.format !== BACKUP_FORMAT || !Number.isSafeInteger(value.version)) {
    return { ok: false, error: "invalid" };
  }
  if (value.version !== BACKUP_VERSION) return { ok: false, error: "unsupported" };

  const { tracker, bisLists } = value;
  if (!isRecord(tracker) || !isRecord(bisLists) ||
    typeof tracker.schemaVersion !== "number" || !Number.isSafeInteger(tracker.schemaVersion) || tracker.schemaVersion < 1 ||
    !Number.isSafeInteger(bisLists.schemaVersion)) return { ok: false, error: "invalid" };
  if (tracker.schemaVersion > CURRENT_SCHEMA_VERSION || bisLists.schemaVersion !== BIS_LISTS_SCHEMA_VERSION) {
    return { ok: false, error: "unsupported" };
  }
  if (!Array.isArray(tracker.dungeons)) return { ok: false, error: "invalid" };

  const parsedTracker = parseRaidTrackerState(JSON.stringify(tracker));
  const parsedBisLists = parseLocalBisListsState(JSON.stringify(bisLists));
  if (parsedTracker.loadWarning || parsedBisLists.loadWarning) return { ok: false, error: "invalid" };

  const save = {
    tracker: serializeRaidTrackerState(parsedTracker.state),
    bisLists: JSON.stringify(parsedBisLists.state),
  };
  return { ok: true, backup: { save, summary: summarizeStates(parsedTracker.state, parsedBisLists.state) } };
}

function sameWorkspace(left: WorkspaceSnapshots | null, right: WorkspaceSnapshots): boolean {
  return left !== null && sameSnapshot(left.tracker, right.tracker) && sameSnapshot(left.bisLists, right.bisLists);
}

/** Both existing locks exclude ordinary saves while the pair is checked and committed. */
export async function restoreWorkspaceBackup(
  backup: WorkspaceBackup,
  expected: WorkspaceSnapshots,
  getCurrent: () => WorkspaceSnapshots | null,
): Promise<SaveError | null> {
  const locks = navigator.locks;
  if (!locks) return STORAGE_LOCK_UNAVAILABLE;
  try {
    return await locks.request(saveLockName(TRACKER_STORAGE_KEYS.key), () =>
      locks.request(saveLockName(BIS_LISTS_STORAGE_KEYS.key), () => withSaveVisibility(locks, (commit) => {
        if (!sameWorkspace(getCurrent(), expected)) return STORAGE_CONFLICT;

        let saved: WorkspaceSnapshots;
        try {
          saved = { tracker: readSnapshot(TRACKER_STORAGE_KEYS), bisLists: readSnapshot(BIS_LISTS_STORAGE_KEYS) };
        } catch {
          return STORAGE_READ_FAILED;
        }
        if (!sameWorkspace(saved, expected)) return STORAGE_CONFLICT;
        if (parseRaidTrackerState(saved.tracker.current ?? saved.tracker.legacy).loadWarning === LOAD_WARNING_UNSUPPORTED_SAVE ||
          parseLocalBisListsState(saved.bisLists.current ?? saved.bisLists.legacy).loadWarning === LOAD_WARNING_UNSUPPORTED_SAVE) {
          return STORAGE_READ_FAILED;
        }

        // One setItem is the commit point. Old keys become irrelevant only after it succeeds.
        commit(() => writeWorkspaceSave(backup.save));
        for (const { key, legacyKey } of [TRACKER_STORAGE_KEYS, BIS_LISTS_STORAGE_KEYS]) {
          try {
            localStorage.removeItem(key);
            localStorage.removeItem(legacyKey);
          } catch {
            // The committed workspace takes precedence over any remaining old keys.
          }
        }
        return null;
      })),
    );
  } catch (error) {
    return getWriteError(error);
  }
}
