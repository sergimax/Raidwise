import { isRecord } from "./guards.ts";
import { sameSnapshot, type LoadedSave, type ParsedSave, type SaveSnapshot, type StorageKeys } from "./local-save.ts";

export type PendingSave = { base: SaveSnapshot | null; raw: string; repair: boolean; id?: string; savedAt?: number };
export type DurableSave = PendingSave & { id: string; savedAt: number };
export type WorkingSave<T> = LoadedSave<T> & { pending: PendingSave | null };

const draftKey = ({ key }: StorageKeys) => `${key}:pending`;
export const durableDraftPrefix = (key: string) => `${key}:draft:`;

export function samePendingSave(left: PendingSave | null, right: PendingSave | null): boolean {
  return left === right || (left !== null && right !== null &&
    left.id === right.id && left.raw === right.raw && left.repair === right.repair && sameSnapshot(left.base, right.base));
}

function isSnapshot(value: unknown): value is SaveSnapshot {
  return isRecord(value) &&
    (value.current === null || typeof value.current === "string") &&
    (value.legacy === null || typeof value.legacy === "string") &&
    (value.workspaceOriginal === undefined || typeof value.workspaceOriginal === "string");
}

function parsePendingSave(raw: string | null): PendingSave | null {
  if (raw === null) return null;
  const pending: unknown = JSON.parse(raw);
  if (!isRecord(pending) || typeof pending.raw !== "string" ||
      (pending.base !== null && !isSnapshot(pending.base))) return null;
  return { raw: pending.raw, base: pending.base, repair: pending.repair === true,
    id: typeof pending.id === "string" ? pending.id : undefined,
    savedAt: typeof pending.savedAt === "number" ? pending.savedAt : undefined };
}

export function readPendingSave(keys: StorageKeys): PendingSave | null {
  try {
    return parsePendingSave(sessionStorage.getItem(draftKey(keys)));
  } catch {
    return null;
  }
}

export function readDurableSave(key: string, id: string): DurableSave | null {
  try {
    const draft = parsePendingSave(localStorage.getItem(durableDraftPrefix(key) + id));
    return draft?.id === id && typeof draft.savedAt === "number" && Number.isFinite(draft.savedAt)
      ? { ...draft, id, savedAt: draft.savedAt }
      : null;
  } catch {
    return null;
  }
}

export function listDurableSaves(key: string, saved: string | null | undefined): DurableSave[] {
  try {
    const prefix = durableDraftPrefix(key);
    return Object.keys(localStorage).filter((name) => name.startsWith(prefix))
      .flatMap((name) => {
        const draft = readDurableSave(key, name.slice(prefix.length));
        return draft && draft.raw !== saved ? [draft] : [];
      }).sort((first, second) => second.savedAt - first.savedAt);
  } catch {
    return [];
  }
}

export function writeDurableSave(key: string, draft: DurableSave): void {
  localStorage.setItem(durableDraftPrefix(key) + draft.id, JSON.stringify(draft));
}

export function removeDurableSave(key: string, id: string): void {
  localStorage.removeItem(durableDraftPrefix(key) + id);
}

export function writePendingSave(keys: StorageKeys, pending: PendingSave | null): void {
  if (pending) {
    sessionStorage.setItem(draftKey(keys), JSON.stringify(pending));
  } else {
    sessionStorage.removeItem(draftKey(keys));
  }
}

export function loadWorkingSave<T>(
  keys: StorageKeys,
  loaded: LoadedSave<T>,
  parse: (raw: string) => ParsedSave<T>,
): WorkingSave<T> {
  const pending = readPendingSave(keys);
  if (!pending) return { ...loaded, pending: null };
  const draft = parse(pending.raw);
  return draft.loadWarning
    ? { ...loaded, pending: null }
    : { ...loaded, state: draft.state, pending };
}
