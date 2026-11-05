import type {
  BisListPreset,
  BisListSlot,
  LocalBisListsState,
  LocalSpecBisEntry,
} from "../../types/bis-lists.ts";
import { isSpecValidForClass } from "../../data/class-specs.ts";
import { ClassName } from "../../types/characters.ts";
import {
  BIS_LISTS_SCHEMA_VERSION,
  BIS_LISTS_STORAGE_KEY,
  BIS_LISTS_STORAGE_KEYS,
} from "./constants.ts";
import { isRecord } from "../guards.ts";
import { getWriteError, loadLocalSave, type ParsedSave, type SaveError } from "../local-save.ts";
import { LOAD_WARNING_CORRUPTED_SAVE, LOAD_WARNING_UNSUPPORTED_SAVE } from "../constants.ts";

const EMPTY_STATE: LocalBisListsState = {
  schemaVersion: BIS_LISTS_SCHEMA_VERSION,
  entries: {},
};

/** Soft-parse one slot; drop non-integer / non-positive item ids, keep the rest. */
function parseBisListSlot(value: unknown, warn: () => void): BisListSlot | null {
  if (!isRecord(value)) {
    return null;
  }
  if (
    typeof value.slot !== "number" ||
    !Number.isSafeInteger(value.slot) ||
    value.slot < 0
  ) {
    return null;
  }
  if (!Array.isArray(value.itemIds)) {
    return null;
  }
  const itemIds = value.itemIds.filter(
    (itemId): itemId is number =>
      typeof itemId === "number" && Number.isSafeInteger(itemId) && itemId > 0,
  );
  if (itemIds.length !== value.itemIds.length) warn();
  return { slot: value.slot, itemIds };
}

/** Reject presets missing id/name; skip invalid slot rows inside a valid preset. */
function parseBisListPreset(value: unknown, warn: () => void): BisListPreset | null {
  if (!isRecord(value)) {
    return null;
  }
  if (typeof value.id !== "string" || value.id.trim() === "") {
    return null;
  }
  if (typeof value.name !== "string" || value.name.trim() === "") {
    return null;
  }
  if (!Array.isArray(value.slots)) {
    return null;
  }
  const slots = new Map<number, BisListSlot>();
  for (const slotEntry of value.slots) {
    const parsedSlot = parseBisListSlot(slotEntry, warn);
    if (!parsedSlot || slots.has(parsedSlot.slot)) {
      warn();
      continue;
    }
    slots.set(parsedSlot.slot, parsedSlot);
  }
  return {
    id: value.id,
    name: value.name,
    slots: [...slots.values()],
  };
}

/** One class|spec bucket: requires `selectedPresetId` + `presets` array. */
function parseLocalSpecBisEntry(value: unknown, warn: () => void): LocalSpecBisEntry | null {
  if (!isRecord(value)) {
    return null;
  }
  if (
    typeof value.selectedPresetId !== "string" ||
    value.selectedPresetId.trim() === ""
  ) {
    return null;
  }
  if (!Array.isArray(value.presets)) {
    return null;
  }
  const presets = new Map<string, BisListPreset>();
  for (const preset of value.presets) {
    const parsedPreset = parseBisListPreset(preset, warn);
    if (!parsedPreset || presets.has(parsedPreset.id)) {
      warn();
      continue;
    }
    presets.set(parsedPreset.id, parsedPreset);
  }
  return {
    selectedPresetId: value.selectedPresetId,
    presets: [...presets.values()],
  };
}

/** Keep recognized class and spec buckets, even if neighboring entries are invalid. */
function parseEntries(
  value: unknown,
  warn: () => void,
): LocalBisListsState["entries"] {
  if (!isRecord(value)) {
    warn();
    return {};
  }

  const entries: LocalBisListsState["entries"] = {};
  for (const [storageKey, entryValue] of Object.entries(value)) {
    const [classKey, spec, extra] = storageKey.split("|");
    const className = Object.values(ClassName).find((value) => value === classKey);
    if (!className || !spec || extra !== undefined || !isSpecValidForClass(className, spec)) {
      warn();
      continue;
    }
    const parsedEntry = parseLocalSpecBisEntry(entryValue, warn);
    if (parsedEntry) {
      entries[storageKey] = parsedEntry;
    } else warn();
  }
  return entries;
}

/** Recover valid rows and report any discarded data. */
export function parseLocalBisListsState(raw: string | null): ParsedSave<LocalBisListsState> {
  if (raw === null) return { state: EMPTY_STATE, loadWarning: null };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !Number.isSafeInteger(parsed.schemaVersion)) {
      return { state: EMPTY_STATE, loadWarning: LOAD_WARNING_CORRUPTED_SAVE };
    }
    if (parsed.schemaVersion !== BIS_LISTS_SCHEMA_VERSION) {
      return { state: EMPTY_STATE, loadWarning: LOAD_WARNING_UNSUPPORTED_SAVE };
    }
    let corrupt = false;
    const entries = parseEntries(parsed.entries, () => { corrupt = true; });
    return {
      state: { schemaVersion: BIS_LISTS_SCHEMA_VERSION, entries },
      loadWarning: corrupt ? LOAD_WARNING_CORRUPTED_SAVE : null,
    };
  } catch {
    return { state: EMPTY_STATE, loadWarning: LOAD_WARNING_CORRUPTED_SAVE };
  }
}

export function loadLocalBisListsState() {
  return loadLocalSave(BIS_LISTS_STORAGE_KEYS, parseLocalBisListsState);
}

export function saveLocalBisListsState(
  state: LocalBisListsState,
  onError?: (error: SaveError | null) => void,
): void {
  try {
    localStorage.setItem(BIS_LISTS_STORAGE_KEY, JSON.stringify(state));
    onError?.(null);
  } catch (error) {
    onError?.(getWriteError(error));
  }
}
