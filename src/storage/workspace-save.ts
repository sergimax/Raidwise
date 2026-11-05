import { BIS_LISTS_STORAGE_KEY } from "./bis-lists/constants.ts";
import { STORAGE_KEY } from "./constants.ts";
import { isRecord } from "./guards.ts";

export const WORKSPACE_SAVE_KEY = "raidwise-workspace";
export const WORKSPACE_SAVE_LOCK = "raidwise:save:workspace";
const WORKSPACE_SAVE_VERSION = 1;

export type WorkspaceSave = { tracker: string; bisLists: string };

export class WorkspaceSaveReadError extends Error {
  readonly raw: string;
  readonly unsupported: boolean;

  constructor(raw: string, unsupported: boolean) {
    super("Cannot read the saved workspace");
    this.raw = raw;
    this.unsupported = unsupported;
  }
}

export function workspaceSection(key: string): keyof WorkspaceSave | undefined {
  if (key === STORAGE_KEY) return "tracker";
  if (key === BIS_LISTS_STORAGE_KEY) return "bisLists";
}

export function readWorkspaceSave(): WorkspaceSave | null {
  const raw = localStorage.getItem(WORKSPACE_SAVE_KEY);
  if (raw === null) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new WorkspaceSaveReadError(raw, false);
  }
  if (isRecord(value) && typeof value.version === "number" && value.version > WORKSPACE_SAVE_VERSION) {
    throw new WorkspaceSaveReadError(raw, true);
  }
  if (!isRecord(value) || value.version !== WORKSPACE_SAVE_VERSION ||
    typeof value.tracker !== "string" || typeof value.bisLists !== "string") {
    throw new WorkspaceSaveReadError(raw, false);
  }
  return { tracker: value.tracker, bisLists: value.bisLists };
}

export function writeWorkspaceSave(save: WorkspaceSave): void {
  localStorage.setItem(WORKSPACE_SAVE_KEY, JSON.stringify({ version: WORKSPACE_SAVE_VERSION, ...save }));
}
