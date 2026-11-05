import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  LOAD_WARNING_CORRUPTED_SAVE,
  STORAGE_CONFLICT,
  STORAGE_READ_FAILED,
} from "../storage/constants.ts";
import {
  getWriteError,
  readSnapshot,
  type LoadedSave,
  type SaveError,
  type SaveSnapshot,
  type StorageKeys,
} from "../storage/local-save.ts";

function sameSnapshot(left: SaveSnapshot, right: SaveSnapshot): boolean {
  return left.current === right.current && left.legacy === right.legacy;
}

/** Save committed edits immediately and keep the draft when a different snapshot is found. */
export function useLocalSave<T>(
  keys: StorageKeys,
  initial: LoadedSave<T>,
  state: T,
  serialize: (state: T) => string,
) {
  const { key, legacyKey } = keys;
  const expected = useRef(initial.snapshot);
  const observedState = useRef(state);
  const [loadWarning, setLoadWarning] = useState(initial.loadWarning);
  const [saveError, setSaveError] = useState<SaveError | null>(null);
  const original = loadWarning ? initial.snapshot?.current ?? initial.snapshot?.legacy ?? null : null;
  const canRecover = loadWarning === LOAD_WARNING_CORRUPTED_SAVE && original !== null;

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
      setSaveError(getWriteError(error));
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
    if (canRecover && persist(state)) setLoadWarning(null);
  }, [canRecover, persist, state]);

  return {
    storageLoadWarning: loadWarning,
    storageSaveError: saveError,
    storageOriginal: original,
    exportStorageDraft,
    recoverStorage: canRecover ? recoverStorage : undefined,
  };
}
