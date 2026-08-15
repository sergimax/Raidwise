import type {
  BisListPreset,
  BisListSlot,
  LocalBisListsState,
  LocalSpecBisEntry,
} from "../../types/bis-lists.ts";
import {
  BIS_LISTS_SCHEMA_VERSION,
  BIS_LISTS_STORAGE_KEY,
  LEGACY_BIS_LISTS_STORAGE_KEY,
} from "./constants.ts";
import { isRecord } from "../guards.ts";
import { getLocalStorageItemMigrating } from "../../utils/local-storage-migrate.ts";

const EMPTY_STATE: LocalBisListsState = {
  schemaVersion: BIS_LISTS_SCHEMA_VERSION,
  entries: {},
};

export const BIS_LISTS_STORAGE_QUOTA_MESSAGE =
  "Storage quota exceeded. Please free up space.";
export const BIS_LISTS_STORAGE_SAVE_FAILED_MESSAGE =
  "Failed to save data. Please try again.";

/** Soft-parse one slot; drop non-integer / non-positive item ids, keep the rest. */
function parseBisListSlot(value: unknown): BisListSlot | null {
  if (!isRecord(value)) {
    return null;
  }
  if (
    typeof value.slot !== "number" ||
    !Number.isInteger(value.slot) ||
    value.slot < 0
  ) {
    return null;
  }
  if (!Array.isArray(value.itemIds)) {
    return null;
  }
  const itemIds = value.itemIds.filter(
    (itemId): itemId is number =>
      typeof itemId === "number" && Number.isInteger(itemId) && itemId > 0,
  );
  return { slot: value.slot, itemIds };
}

/** Reject presets missing id/name; skip invalid slot rows inside a valid preset. */
function parseBisListPreset(value: unknown): BisListPreset | null {
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
  const slots: BisListSlot[] = [];
  for (const slotEntry of value.slots) {
    const parsedSlot = parseBisListSlot(slotEntry);
    if (parsedSlot) {
      slots.push(parsedSlot);
    }
  }
  return {
    id: value.id,
    name: value.name,
    slots,
  };
}

/** One class|spec bucket: requires `selectedPresetId` + `presets` array. */
function parseLocalSpecBisEntry(value: unknown): LocalSpecBisEntry | null {
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
  const presets: BisListPreset[] = [];
  for (const preset of value.presets) {
    const parsedPreset = parseBisListPreset(preset);
    if (parsedPreset) {
      presets.push(parsedPreset);
    }
  }
  return {
    selectedPresetId: value.selectedPresetId,
    presets,
  };
}

/**
 * Keys must look like `ClassName|Spec` (see `specBisStorageKey`).
 * Malformed entries are skipped so one bad row does not wipe the whole BiS store.
 */
function parseEntries(
  value: unknown,
): LocalBisListsState["entries"] {
  if (!isRecord(value)) {
    return {};
  }

  const entries: LocalBisListsState["entries"] = {};
  for (const [storageKey, entryValue] of Object.entries(value)) {
    if (typeof storageKey !== "string" || !storageKey.includes("|")) {
      continue;
    }
    const parsedEntry = parseLocalSpecBisEntry(entryValue);
    if (parsedEntry) {
      entries[storageKey] = parsedEntry;
    }
  }
  return entries;
}

/**
 * Load BiS lists from `raidwise-bis-lists` (migrates legacy `my-raid-cds-bis-lists`).
 * Wrong schema or corrupt JSON → empty.
 * Entries are soft-validated; bad rows are dropped rather than failing the whole load.
 */
export function loadLocalBisListsState(): LocalBisListsState {
  try {
    const raw = getLocalStorageItemMigrating(
      BIS_LISTS_STORAGE_KEY,
      LEGACY_BIS_LISTS_STORAGE_KEY,
    );
    if (!raw) {
      return EMPTY_STATE;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.schemaVersion !== BIS_LISTS_SCHEMA_VERSION) {
      return EMPTY_STATE;
    }

    return {
      schemaVersion: BIS_LISTS_SCHEMA_VERSION,
      entries: parseEntries(parsed.entries),
    };
  } catch {
    return EMPTY_STATE;
  }
}

/**
 * Persist BiS lists. `onError(null)` on success; quota/unknown failures use the
 * exported English message constants (mapped to i18n in the BiS panel).
 */
export function saveLocalBisListsState(
  state: LocalBisListsState,
  onError?: (message: string | null) => void,
): void {
  try {
    localStorage.setItem(BIS_LISTS_STORAGE_KEY, JSON.stringify(state));
    onError?.(null);
  } catch (error) {
    const message =
      error instanceof DOMException && error.name === "QuotaExceededError"
        ? BIS_LISTS_STORAGE_QUOTA_MESSAGE
        : BIS_LISTS_STORAGE_SAVE_FAILED_MESSAGE;
    onError?.(message);
  }
}
