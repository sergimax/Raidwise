import { BIS_LISTS_STORAGE_KEY } from "./bis-lists/constants.ts";
import { STORAGE_KEY } from "./constants.ts";
import { isRecord } from "./guards.ts";

export const WORKSPACE_SAVE_KEY = "raidwise-workspace";
export const WORKSPACE_SAVE_LOCK = "raidwise:save:workspace";
const WORKSPACE_SAVE_VERSION = 1;

export type WorkspaceSave = { tracker: string; bisLists: string };

export class WorkspaceSaveReadError extends Error {
  readonly raw: string;

  constructor(raw: string) {
    super("Unsupported workspace version");
    this.raw = raw;
  }
}

export function workspaceSection(key: string): keyof WorkspaceSave | undefined {
  if (key === STORAGE_KEY) return "tracker";
  if (key === BIS_LISTS_STORAGE_KEY) return "bisLists";
}

export function readWorkspaceSave(): { tracker: string | null; bisLists: string | null; original?: string } | null {
  const raw = localStorage.getItem(WORKSPACE_SAVE_KEY);
  if (raw === null) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { tracker: null, bisLists: null, original: raw };
  }
  if (isRecord(value) && typeof value.version === "number" && value.version > WORKSPACE_SAVE_VERSION) {
    throw new WorkspaceSaveReadError(raw);
  }
  if (!isRecord(value) || value.version !== WORKSPACE_SAVE_VERSION) return { tracker: null, bisLists: null, original: raw };
  const tracker = typeof value.tracker === "string" ? value.tracker : null;
  const bisLists = typeof value.bisLists === "string" ? value.bisLists : null;
  return tracker === null || bisLists === null ? { tracker, bisLists, original: raw } : { tracker, bisLists };
}

export function writeWorkspaceSave(save: WorkspaceSave): void {
  localStorage.setItem(WORKSPACE_SAVE_KEY, JSON.stringify({ version: WORKSPACE_SAVE_VERSION, ...save }));
}
