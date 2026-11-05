import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  LOAD_WARNING_CORRUPTED_SAVE,
  STORAGE_CONFLICT,
  STORAGE_LOCK_UNAVAILABLE,
  STORAGE_READ_FAILED,
} from "../storage/constants.ts";
import { getWriteError, readSnapshot, sameSnapshot, saveLockName, writeSnapshot, type SaveError, type StorageKeys } from "../storage/local-save.ts";
import { readPendingSave, samePendingSave, writePendingSave, type WorkingSave } from "../storage/pending-save.ts";
import { WORKSPACE_SAVE_KEY, WORKSPACE_SAVE_LOCK, workspaceSection } from "../storage/workspace-save.ts";

/** Stage committed edits before requesting exclusive access to the shared save. */
export function useLocalSave<T>(
  { key, legacyKey }: StorageKeys,
  initial: WorkingSave<T>,
  state: T,
  serialize: (state: T) => string,
) {
  const expected = useRef(initial.pending ? initial.pending.base : initial.snapshot);
  const observedState = useRef(state);
  const pending = useRef(initial.pending);
  const journal = useRef(initial.pending);
  const scheduled = useRef(false);
  const [loadWarning, setLoadWarning] = useState(initial.loadWarning);
  const [saveError, setSaveError] = useState<SaveError | null>(() =>
    initial.pending && initial.snapshot && initial.snapshot.current !== initial.pending.raw &&
    !sameSnapshot(initial.snapshot, initial.pending.base) ? STORAGE_CONFLICT : null,
  );
  const [hasDraft, setHasDraft] = useState(initial.pending !== null);
  const [saving, setSaving] = useState(false);
  const [volatileDraft, setVolatileDraft] = useState(false);
  const original = loadWarning ? initial.snapshot?.current ?? initial.snapshot?.legacy ?? null : null;

  const scheduleWrite = useCallback(() => {
    if (scheduled.current || !pending.current) return;
    const locks = navigator.locks;
    if (!locks) {
      setSaveError(STORAGE_LOCK_UNAVAILABLE);
      return;
    }

    const keys = { key, legacyKey };
    const reportFailure = (error: unknown) => {
      scheduled.current = false;
      setSaving(false);
      setSaveError(getWriteError(error));
    };

    const flush = () => {
      scheduled.current = false;
      setSaving(false);
      const draft = pending.current;
      if (!draft) return;

      try {
        const snapshot = readSnapshot(keys);
        // A remount may have staged a newer draft while this lock was queued.
        const ownsJournal = samePendingSave(readPendingSave(keys), journal.current);
        if (snapshot.current !== draft.raw) {
          if (!ownsJournal) {
            setSaveError(STORAGE_READ_FAILED);
            return;
          }
          if (!draft.base || !sameSnapshot(snapshot, draft.base)) {
            setSaveError(STORAGE_CONFLICT);
            return;
          }
          writeSnapshot(keys, snapshot, draft.raw);
        }
        expected.current = { current: draft.raw, legacy: null };
        pending.current = null;
        try {
          if (ownsJournal) {
            writePendingSave(keys, null);
            journal.current = null;
          }
        } catch {
          // A replay of an already committed draft is safe.
        }
        setHasDraft(false);
        setVolatileDraft(false);
        setSaveError(null);
        if (draft.repair) setLoadWarning(null);
      } catch (error) {
        reportFailure(error);
      }
    };

    scheduled.current = true;
    setSaving(true);
    try {
      void locks.request(saveLockName(key), () => {
        if (workspaceSection(key) && localStorage.getItem(WORKSPACE_SAVE_KEY) !== null) {
          return locks.request(WORKSPACE_SAVE_LOCK, flush);
        }
        return flush();
      }).catch(reportFailure);
    } catch (error) {
      reportFailure(error);
    }
  }, [key, legacyKey]);

  const stage = useCallback((value: T, repair = false) => {
    const draft = { base: expected.current, raw: serialize(value), repair };
    pending.current = draft;
    setHasDraft(true);
    try {
      writePendingSave({ key, legacyKey }, draft);
      journal.current = draft;
      setVolatileDraft(false);
    } catch {
      setVolatileDraft(true);
    }
    if (!loadWarning || (repair && loadWarning === LOAD_WARNING_CORRUPTED_SAVE)) scheduleWrite();
  }, [key, legacyKey, loadWarning, scheduleWrite, serialize]);

  useLayoutEffect(() => {
    if (observedState.current === state) return;
    observedState.current = state;
    // Publish the draft synchronously before the browser can navigate away.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    stage(state, pending.current?.repair);
  }, [stage, state]);

  useEffect(() => {
    const draft = pending.current;
    if (draft && (!loadWarning || (draft.repair && loadWarning === LOAD_WARNING_CORRUPTED_SAVE))) {
      // A lock callback reports the result after the browser grants the lock.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      scheduleWrite();
    }
  }, [loadWarning, scheduleWrite]);

  useEffect(() => {
    const checkForExternalChange = (event: StorageEvent) => {
      if (event.key !== null && event.key !== key && event.key !== legacyKey &&
        !(event.key === WORKSPACE_SAVE_KEY && workspaceSection(key))) return;
      try {
        const snapshot = readSnapshot({ key, legacyKey });
        if (expected.current && !sameSnapshot(snapshot, expected.current)) {
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
  const getRestoreSnapshot = useCallback(() => (
    pending.current || (loadWarning && loadWarning !== LOAD_WARNING_CORRUPTED_SAVE)
      ? null
      : expected.current
  ), [loadWarning]);
  const recoverStorage = useCallback(() => stage(state, true), [stage, state]);
  const retryStorageSave = useCallback(() => stage(state), [stage, state]);
  const discardStorageDraft = useCallback(() => {
    try {
      writePendingSave({ key, legacyKey }, null);
      pending.current = null;
      journal.current = null;
      return true;
    } catch (error) {
      setSaveError(getWriteError(error));
      return false;
    }
  }, [key, legacyKey]);

  return useMemo(() => ({
    storageLoadWarning: loadWarning,
    storageSaveError: saveError,
    storageOriginal: original,
    storageSaving: saving,
    storageHasDraft: hasDraft,
    storageVolatileDraft: volatileDraft,
    exportStorageDraft,
    getRestoreSnapshot,
    recoverStorage: loadWarning === LOAD_WARNING_CORRUPTED_SAVE && original !== null ? recoverStorage : undefined,
    retryStorageSave: hasDraft && !loadWarning ? retryStorageSave : undefined,
    discardStorageDraft,
  }), [
    discardStorageDraft, exportStorageDraft, getRestoreSnapshot, hasDraft, loadWarning, original, recoverStorage,
    retryStorageSave, saveError, saving, volatileDraft,
  ]);
}
