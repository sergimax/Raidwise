import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ClassName } from "../types/characters.ts";
import type { BisListSlot, LocalBisListsState } from "../types/bis-lists.ts";
import { parseLocalBisListsState } from "../storage/bis-lists/index.ts";
import { BIS_LISTS_STORAGE_KEY, LEGACY_BIS_LISTS_STORAGE_KEY } from "../storage/bis-lists/constants.ts";
import { loadLocalSave, useLocalSave } from "./use-local-save.ts";
import { getBuiltInPresetsForSpec } from "../data/bis-presets/index.ts";
import {
  clearAllLocalBisPresets,
  countLocalBisPresets,
  getLocalPresetsForSpec,
  getMergedPresetsForSpec,
  getSelectedPresetForSpec,
  isLocalBisPreset,
  resolveBisSlotMap,
  resolveSaveLocalPresetByName,
  specBisStorageKey,
  type BisSlotMap,
  upsertLocalSpecEntry,
} from "../utils/bis-lists.ts";

const storageKeys = { key: BIS_LISTS_STORAGE_KEY, legacyKey: LEGACY_BIS_LISTS_STORAGE_KEY };

/**
 * BiS presets domain: built-in + local lists, selection, and slot maps.
 * Mutations must go through functional updates (`applyLocalUpdate` /
 * `setLocalState(prev => …)`) so rapid select/save/delete cannot clobber each other.
 * Persistence follows committed edits.
 */
export function useBisListsDomain() {
  const [initialLoad] = useState(() => loadLocalSave(storageKeys, parseLocalBisListsState));
  const [localState, setLocalState] = useState(initialLoad.state);
  const { storageError, storageOriginal, exportStorageDraft, recoverStorage } =
    useLocalSave(storageKeys, initialLoad, localState, JSON.stringify);
  const localStateRef = useRef(localState);

  useEffect(() => {
    localStateRef.current = localState;
  }, [localState]);

  /** Prefer this over reading `localState` inside mutation callbacks. */
  const applyLocalUpdate = useCallback(
    (updater: (previous: LocalBisListsState) => LocalBisListsState) => {
      setLocalState((previous) => {
        const next = updater(previous);
        localStateRef.current = next;
        return next;
      });
    },
    [],
  );

  const getPresetsForSpec = useCallback(
    (className: ClassName, spec: string) =>
      getMergedPresetsForSpec(className, spec, localState),
    [localState],
  );

  const getSelectedPreset = useCallback(
    (className: ClassName, spec: string) =>
      getSelectedPresetForSpec(className, spec, localState),
    [localState],
  );

  /** Rebuild cache when local BiS state changes; reuse Maps across cell evaluations. */
  const bisSlotMapCache = useMemo(() => {
    const cache = new Map<string, BisSlotMap>();
    return {
      get(className: ClassName, spec: string): BisSlotMap {
        const storageKey = specBisStorageKey(className, spec);
        const cached = cache.get(storageKey);
        if (cached) {
          return cached;
        }
        const resolved = resolveBisSlotMap(className, spec, localState);
        cache.set(storageKey, resolved);
        return resolved;
      },
    };
  }, [localState]);

  const getBisSlotMapForSpec = useCallback(
    (className: ClassName, spec: string): BisSlotMap =>
      bisSlotMapCache.get(className, spec),
    [bisSlotMapCache],
  );

  const selectPreset = useCallback(
    (className: ClassName, spec: string, presetId: string) => {
      applyLocalUpdate((previous) =>
        upsertLocalSpecEntry(previous, className, spec, {
          selectedPresetId: presetId,
          presets: getLocalPresetsForSpec(previous, className, spec),
        }),
      );
    },
    [applyLocalUpdate],
  );

  const savePresetByName = useCallback(
    (
      className: ClassName,
      spec: string,
      name: string,
      slots: BisListSlot[],
    ): { ok: true } | { ok: false; error: string } => {
      const builtInPresets = getBuiltInPresetsForSpec(className, spec);
      // Validate before scheduling state work. Do not capture the return value
      // inside a `setState` updater — those run later and must stay pure.
      const preview = resolveSaveLocalPresetByName(
        getLocalPresetsForSpec(localStateRef.current, className, spec),
        builtInPresets,
        name,
        slots,
      );
      if ("error" in preview) {
        return { ok: false, error: preview.error };
      }

      applyLocalUpdate((previous) => {
        const resolved = resolveSaveLocalPresetByName(
          getLocalPresetsForSpec(previous, className, spec),
          builtInPresets,
          name,
          slots,
        );
        if ("error" in resolved) {
          return previous;
        }
        return upsertLocalSpecEntry(previous, className, spec, {
          selectedPresetId: resolved.preset.id,
          presets: resolved.presets,
        });
      });

      return { ok: true };
    },
    [applyLocalUpdate],
  );

  const deleteLocalPreset = useCallback(
    (className: ClassName, spec: string, presetId: string) => {
      if (!presetId.startsWith("local-")) {
        return;
      }

      applyLocalUpdate((previous) => {
        const storageKey = specBisStorageKey(className, spec);
        const existingEntry = previous.entries[storageKey];
        if (!existingEntry) {
          return previous;
        }

        const nextLocalPresets = existingEntry.presets.filter(
          (preset) => preset.id !== presetId,
        );
        const builtInPresets = getBuiltInPresetsForSpec(className, spec);
        const wasSelected = existingEntry.selectedPresetId === presetId;
        const nextSelectedPresetId = wasSelected
          ? (builtInPresets[0]?.id ?? nextLocalPresets[0]?.id ?? "default")
          : existingEntry.selectedPresetId;

        return upsertLocalSpecEntry(previous, className, spec, {
          selectedPresetId: nextSelectedPresetId,
          presets: nextLocalPresets,
        });
      });
    },
    [applyLocalUpdate],
  );

  const updateSelectedLocalPresetSlots = useCallback(
    (className: ClassName, spec: string, slots: BisListSlot[]) => {
      applyLocalUpdate((previous) => {
        const storageKey = specBisStorageKey(className, spec);
        const existingEntry = previous.entries[storageKey];
        if (!existingEntry) {
          return previous;
        }

        const selectedPreset = getSelectedPresetForSpec(
          className,
          spec,
          previous,
        );
        if (!selectedPreset || !isLocalBisPreset(selectedPreset)) {
          return previous;
        }

        const updatedPresets = existingEntry.presets.map((preset) =>
          preset.id === selectedPreset.id ? { ...preset, slots } : preset,
        );

        return upsertLocalSpecEntry(previous, className, spec, {
          selectedPresetId: existingEntry.selectedPresetId,
          presets: updatedPresets,
        });
      });
    },
    [applyLocalUpdate],
  );

  const clearAllLocalPresets = useCallback(() => {
    applyLocalUpdate(clearAllLocalBisPresets);
  }, [applyLocalUpdate]);

  const hasAnyLocalBisPresets = useMemo(
    () => countLocalBisPresets(localState) > 0,
    [localState],
  );

  return useMemo(
    () => ({
      getPresetsForSpec,
      getSelectedPreset,
      getBisSlotMapForSpec,
      selectPreset,
      savePresetByName,
      deleteLocalPreset,
      updateSelectedLocalPresetSlots,
      clearAllLocalPresets,
      hasAnyLocalBisPresets,
      storageError,
      storageOriginal,
      exportStorageDraft,
      recoverStorage,
    }),
    [
      clearAllLocalPresets,
      deleteLocalPreset,
      getBisSlotMapForSpec,
      getPresetsForSpec,
      getSelectedPreset,
      hasAnyLocalBisPresets,
      savePresetByName,
      selectPreset,
      storageError,
      storageOriginal,
      exportStorageDraft,
      recoverStorage,
      updateSelectedLocalPresetSlots,
    ],
  );
}

export type BisListsDomain = ReturnType<typeof useBisListsDomain>;
