import {
  LOAD_WARNING_CORRUPTED_SAVE,
  LOAD_WARNING_UNSUPPORTED_SAVE,
  STORAGE_CONFLICT,
  STORAGE_LOCK_UNAVAILABLE,
  STORAGE_QUOTA_EXCEEDED,
  STORAGE_READ_FAILED,
  STORAGE_WRITE_FAILED,
} from "./constants.ts";

export type LoadWarning =
  | typeof LOAD_WARNING_CORRUPTED_SAVE
  | typeof LOAD_WARNING_UNSUPPORTED_SAVE
  | typeof STORAGE_READ_FAILED;

export type SaveError =
  | typeof STORAGE_CONFLICT
  | typeof STORAGE_LOCK_UNAVAILABLE
  | typeof STORAGE_QUOTA_EXCEEDED
  | typeof STORAGE_READ_FAILED
  | typeof STORAGE_WRITE_FAILED;

export type ParsedSave<T> = { state: T; loadWarning: LoadWarning | null };
export type SaveSnapshot = { current: string | null; legacy: string | null };
export type LoadedSave<T> = ParsedSave<T> & { snapshot: SaveSnapshot | null };
export type StorageKeys = { key: string; legacyKey: string };

export function sameSnapshot(left: SaveSnapshot | null, right: SaveSnapshot | null): boolean {
  return left === right ||
    (left !== null && right !== null && left.current === right.current && left.legacy === right.legacy);
}

export function readSnapshot({ key, legacyKey }: StorageKeys): SaveSnapshot {
  const current = localStorage.getItem(key);
  return { current, legacy: current === null ? localStorage.getItem(legacyKey) : null };
}

export function loadLocalSave<T>(
  keys: StorageKeys,
  parse: (raw: string | null) => ParsedSave<T>,
): LoadedSave<T> {
  let snapshot: SaveSnapshot;
  try {
    snapshot = readSnapshot(keys);
  } catch {
    return { state: parse(null).state, loadWarning: STORAGE_READ_FAILED, snapshot: null };
  }
  return { ...parse(snapshot.current ?? snapshot.legacy), snapshot };
}

export function getWriteError(error: unknown): SaveError {
  return error instanceof DOMException && error.name === "QuotaExceededError"
    ? STORAGE_QUOTA_EXCEEDED
    : STORAGE_WRITE_FAILED;
}
