import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { STORAGE_CONFLICT, STORAGE_READ_FAILED } from "../storage/constants.ts";

type StorageKeys = { key: string; legacyKey: string };
type Snapshot = { current: string | null; legacy: string | null };
type LoadedState<T> = { state: T; loadWarning: string | null };

function readSnapshot({ key, legacyKey }: StorageKeys): Snapshot {
  const current = localStorage.getItem(key);
  return { current, legacy: current === null ? localStorage.getItem(legacyKey) : null };
}

function sameSnapshot(left: Snapshot, right: Snapshot): boolean {
  return left.current === right.current && left.legacy === right.legacy;
}

export function loadLocalSave<T>(
  keys: StorageKeys,
  parse: (raw: string | null) => LoadedState<T>,
) {
  let snapshot: Snapshot;
  try {
    snapshot = readSnapshot(keys);
  } catch {
    return { ...parse(null), loadWarning: STORAGE_READ_FAILED, snapshot: null };
  }
  return { ...parse(snapshot.current ?? snapshot.legacy), snapshot };
}

/** Save committed edits immediately and keep the draft when a different snapshot is found. */
export function useLocalSave<T>(
  keys: StorageKeys,
  initial: LoadedState<T> & { snapshot: Snapshot | null },
  state: T,
  serialize: (state: T) => string,
) {
  const { key, legacyKey } = keys;
  const expected = useRef(initial.snapshot);
  const observedState = useRef(state);
  const [loadWarning, setLoadWarning] = useState(initial.loadWarning);
  const [saveError, setSaveError] = useState<string | null>(null);
  const original = loadWarning ? initial.snapshot?.current ?? initial.snapshot?.legacy : null;

  const persist = useCallback((value: T): boolean => {
    try {
      const snapshot = readSnapshot({ key, legacyKey });
      if (!expected.current || !sameSnapshot(snapshot, expected.current)) {
        setSaveError(STORAGE_CONFLICT);
        return false;
      }
      const raw = serialize(value);
      localStorage.setItem(key, raw);
      expected.current = { current: raw, legacy: null };
      if (snapshot.legacy !== null) {
        try {
          localStorage.removeItem(legacyKey);
        } catch {
          // The current key already contains the committed state.
        }
      }
      setSaveError(null);
      return true;
    } catch (error) {
      setSaveError(
        error instanceof DOMException && error.name === "QuotaExceededError"
          ? "Storage quota exceeded. Please free up space."
          : "Failed to save data. Please try again.",
      );
      return false;
    }
  }, [key, legacyKey, serialize]);

  useLayoutEffect(() => {
    if (observedState.current === state) return;
    observedState.current = state;
    // Report the result of the synchronous storage write before the next paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!loadWarning) persist(state);
  }, [loadWarning, persist, state]);

  useEffect(() => {
    const checkForExternalChange = (event: StorageEvent) => {
      if (event.key !== null && event.key !== key && event.key !== legacyKey) return;
      try {
        if (expected.current && !sameSnapshot(readSnapshot({ key, legacyKey }), expected.current)) {
          setSaveError(STORAGE_CONFLICT);
        }
      } catch {
        setSaveError(STORAGE_READ_FAILED);
      }
    };
    window.addEventListener("storage", checkForExternalChange);
    return () => window.removeEventListener("storage", checkForExternalChange);
  }, [key, legacyKey]);

  const exportStorageDraft = useCallback(() => serialize(state), [serialize, state]);
  const recoverStorage = useCallback(() => {
    if (original != null && persist(state)) setLoadWarning(null);
  }, [original, persist, state]);

  return {
    storageError: saveError ?? loadWarning,
    storageOriginal: original,
    exportStorageDraft,
    recoverStorage: original != null ? recoverStorage : undefined,
  };
}
