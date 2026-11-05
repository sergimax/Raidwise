import { isRecord } from "./guards.ts";
import { sameSnapshot, type LoadedSave, type ParsedSave, type SaveSnapshot, type StorageKeys } from "./local-save.ts";

export type PendingSave = { base: SaveSnapshot | null; raw: string; repair: boolean };
export type WorkingSave<T> = LoadedSave<T> & { pending: PendingSave | null };

const draftKey = ({ key }: StorageKeys) => `${key}:pending`;

export function samePendingSave(left: PendingSave | null, right: PendingSave | null): boolean {
  return left === right || (left !== null && right !== null &&
    left.raw === right.raw && left.repair === right.repair && sameSnapshot(left.base, right.base));
}

function isSnapshot(value: unknown): value is SaveSnapshot {
  return isRecord(value) &&
    (value.current === null || typeof value.current === "string") &&
    (value.legacy === null || typeof value.legacy === "string");
}

export function readPendingSave(keys: StorageKeys): PendingSave | null {
  try {
    const raw = sessionStorage.getItem(draftKey(keys));
    if (raw === null) return null;
    const pending: unknown = JSON.parse(raw);
    if (!isRecord(pending) || typeof pending.raw !== "string" ||
        (pending.base !== null && !isSnapshot(pending.base))) {
      return null;
    }
    return { raw: pending.raw, base: pending.base, repair: pending.repair === true };
  } catch {
    return null;
  }
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
