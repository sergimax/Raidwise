import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  LOAD_WARNING_CORRUPTED_SAVE,
  STORAGE_CONFLICT,
  STORAGE_LOCK_UNAVAILABLE,
  STORAGE_READ_FAILED,
} from "../storage/constants.ts";
import { getWriteError, readSnapshot, sameSnapshot, saveLockName, writeSnapshot, type SaveError, type StorageKeys } from "../storage/local-save.ts";
import {
  durableDraftPrefix, listDurableSaves, readDurableSave, readPendingSave, removeDurableSave,
  samePendingSave, writeDurableSave, writePendingSave, type DurableSave, type WorkingSave,
} from "../storage/pending-save.ts";
import { withSaveVisibility } from "../storage/save-visibility.ts";
import { WORKSPACE_SAVE_KEY, WORKSPACE_SAVE_LOCK, workspaceSection } from "../storage/workspace-save.ts";
import { generateUUID } from "../uuid.ts";

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
  const durableId = useRef(initial.pending?.id);
  const resumedId = useRef(initial.pending?.id);
  const scheduled = useRef(false);
  const [loadWarning, setLoadWarning] = useState(initial.loadWarning);
  const [saveError, setSaveError] = useState<SaveError | null>(() =>
    initial.pending && initial.snapshot && initial.snapshot.current !== initial.pending.raw &&
    !sameSnapshot(initial.snapshot, initial.pending.base) ? STORAGE_CONFLICT : null,
  );
  const [hasDraft, setHasDraft] = useState(initial.pending !== null);
  const [saving, setSaving] = useState(false);
  const [volatileDraft, setVolatileDraft] = useState(false);
  const [drafts, setDrafts] = useState(() => listDurableSaves(key, initial.snapshot?.current));
  const [tabOnlyDraft, setTabOnlyDraft] = useState(() => Boolean(initial.pending &&
    (!initial.pending.id || !readDurableSave(key, initial.pending.id))));
  const original = loadWarning ? initial.snapshot?.workspaceOriginal ?? initial.snapshot?.current ?? initial.snapshot?.legacy ?? null : null;
  const canRepairSection = loadWarning === LOAD_WARNING_CORRUPTED_SAVE && initial.snapshot?.workspaceOriginal === undefined;

  const scheduleWrite = useCallback(() => {
    if (scheduled.current || !pending.current) return;
    const locks = navigator.locks;
    if (!locks) {
      setSaveError(STORAGE_LOCK_UNAVAILABLE);
      return;
    }

    const keys = { key, legacyKey };
    const requestWrite = () => {
      let draft = pending.current;
      const finish = () => {
        if (pending.current && pending.current !== draft) {
          requestWrite();
        } else {
          scheduled.current = false;
          setSaving(false);
        }
      };
      const reportFailure = (error: unknown) => {
        setSaveError(getWriteError(error));
        finish();
      };
      const write = (commit: (write: () => void) => void) => {
        draft = pending.current;
        if (!draft) return;
        const snapshot = readSnapshot(keys);
        // A remount may have staged a newer draft while this lock was queued.
        const sessionDraft = readPendingSave(keys);
        const ownsSession = samePendingSave(sessionDraft, journal.current);
        const ownsDurable = draft.id !== undefined && samePendingSave(readDurableSave(key, draft.id), draft);
        const ownsJournal = sessionDraft ? ownsSession : ownsDurable ||
          (journal.current === null && durableId.current === undefined);
        if (snapshot.current !== draft.raw) {
          if (!ownsJournal) {
            setSaveError(STORAGE_READ_FAILED);
            return;
          }
          if (!draft.base || !sameSnapshot(snapshot, draft.base)) {
            setSaveError(STORAGE_CONFLICT);
            return;
          }
          const raw = draft.raw;
          commit(() => writeSnapshot(keys, snapshot, raw));
        }
        expected.current = { current: draft.raw, legacy: null };
        const repair = draft.repair;
        return () => {
          if (repair) setLoadWarning(null);
          if (pending.current !== draft) return;
          pending.current = null;
          try {
            if (ownsSession && samePendingSave(readPendingSave(keys), journal.current)) {
              writePendingSave(keys, null);
              journal.current = null;
            }
          } catch {
            // A replay of an already committed draft is safe.
          }
          const completedIds = new Set([durableId.current, resumedId.current]);
          for (const id of completedIds) {
            if (!id) continue;
            try { removeDurableSave(key, id); } catch { /* The committed copy remains available. */ }
          }
          durableId.current = undefined;
          resumedId.current = undefined;
          setDrafts((previous) => previous.filter(({ id }) => !completedIds.has(id)));
          setHasDraft(false);
          setVolatileDraft(false);
          setTabOnlyDraft(false);
          setSaveError(null);
        };
      };
      const flush = () => {
        const complete = (acknowledge: ReturnType<typeof write>) => {
          acknowledge?.();
          finish();
        };
        try {
          const result = withSaveVisibility(locks, write);
          if (result instanceof Promise) return result.then(complete);
          complete(result);
        } catch (error) {
          reportFailure(error);
        }
      };

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
    };

    scheduled.current = true;
    setSaving(true);
    requestWrite();
  }, [key, legacyKey]);

  const stage = useCallback((value: T, repair = false) => {
    const draft: DurableSave = { base: expected.current, raw: serialize(value), repair, id: generateUUID(), savedAt: Date.now() };
    pending.current = draft;
    setHasDraft(true);
    let savedInSession = false;
    let savedDurably = false;
    try {
      writePendingSave({ key, legacyKey }, draft);
      journal.current = draft;
      savedInSession = true;
    } catch { /* The durable journal can still hold this edit. */ }
    try {
      writeDurableSave(key, draft);
      savedDurably = true;
      const previousId = durableId.current;
      durableId.current = draft.id;
      if (previousId && previousId !== resumedId.current) removeDurableSave(key, previousId);
    } catch { /* Keep any previous durable revision and the current working copy. */ }
    setTabOnlyDraft(!savedDurably);
    setVolatileDraft(!savedDurably && !savedInSession);
    if (!loadWarning || (repair && canRepairSection)) scheduleWrite();
  }, [key, legacyKey, loadWarning, canRepairSection, scheduleWrite, serialize]);

  useLayoutEffect(() => {
    if (observedState.current === state) return;
    observedState.current = state;
    // Publish the draft synchronously before the browser can navigate away.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    stage(state, pending.current?.repair);
  }, [stage, state]);

  useEffect(() => {
    const draft = pending.current;
    if (draft && (!loadWarning || (draft.repair && canRepairSection))) {
      // A lock callback reports the result after the browser grants the lock.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      scheduleWrite();
    }
  }, [loadWarning, canRepairSection, scheduleWrite]);

  useEffect(() => {
    if (!hasDraft || !tabOnlyDraft) return;
    const warn = (event: BeforeUnloadEvent) => {
      if (!pending.current) return;
      event.preventDefault();
      event.returnValue = true;
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasDraft, tabOnlyDraft]);

  useEffect(() => {
    const checkForExternalChange = (event: StorageEvent) => {
      if (event.key?.startsWith(durableDraftPrefix(key))) {
        setDrafts(listDurableSaves(key, expected.current?.current));
        return;
      }
      if (event.key !== null && event.key !== key && event.key !== legacyKey &&
        !(event.key === WORKSPACE_SAVE_KEY && workspaceSection(key))) return;
      try {
        const snapshot = readSnapshot({ key, legacyKey });
        setDrafts(listDurableSaves(key, snapshot.current ?? snapshot.legacy));
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
  const openStorageDraft = useCallback((id: string) => {
    if (pending.current) return false;
    const draft = readDurableSave(key, id);
    if (!draft) return false;
    try {
      writePendingSave({ key, legacyKey }, draft);
      return true;
    } catch { return false; }
  }, [key, legacyKey]);
  const discardStorageDraft = useCallback(() => {
    try {
      writePendingSave({ key, legacyKey }, null);
      if (durableId.current) removeDurableSave(key, durableId.current);
      if (resumedId.current && resumedId.current !== durableId.current) removeDurableSave(key, resumedId.current);
      durableId.current = undefined;
      resumedId.current = undefined;
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
    storageTabOnlyDraft: hasDraft && tabOnlyDraft,
    storageDrafts: drafts,
    openStorageDraft,
    exportStorageDraft,
    getRestoreSnapshot,
    recoverStorage: canRepairSection && original !== null ? recoverStorage : undefined,
    retryStorageSave: hasDraft && !loadWarning ? retryStorageSave : undefined,
    discardStorageDraft,
  }), [
    discardStorageDraft, drafts, exportStorageDraft, getRestoreSnapshot, hasDraft, loadWarning, openStorageDraft, original, recoverStorage,
    retryStorageSave, saveError, saving, tabOnlyDraft, volatileDraft, canRepairSection,
  ]);
}
