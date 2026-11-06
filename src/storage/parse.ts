import { EmblemKey, type EmblemKey as EmblemKeyType } from "../assets/emblems/emblem-icons.ts";
import { isSpecValidForClass } from "../data/class-specs.ts";
import { isRaidKey } from "../data/raid-zones.ts";
import { defaultShortNameForDungeonName } from "../utils/dungeon-short-name.ts";
import { pruneToggles } from "../utils/dungeon-toggles.ts";
import { Classes, type ClassName, type CharacterRecord, type CharacterSpecGear } from "../types/characters.ts";
import type { CharacterGearItem } from "../types/character-gear.ts";
import {
  DungeonDifficulty,
  DungeonSizes,
  type DungeonRecord,
} from "../types/dungeons.ts";
import {
  CURRENT_SCHEMA_VERSION,
  LOAD_WARNING_CORRUPTED_SAVE,
  LOAD_WARNING_UNSUPPORTED_SAVE,
  TRACKER_STORAGE_KEYS,
} from "./constants.ts";
import { loadLocalSave, type LoadWarning } from "./local-save.ts";
import { migrateStoredPayload } from "./migrate.ts";
import {
  EMPTY_STATE,
  type LoadRaidTrackerResult,
  type StoredCharacter,
  type StoredDungeon,
  type StoredPayload,
} from "./types.ts";
import { isRecord } from "./guards.ts";

const VALID_EMBLEM_KEYS = new Set<string>(Object.values(EmblemKey));
type Warn = () => void;

function isStoredId(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "" && !Object.hasOwn(Object.prototype, value);
}

function parseStoredEmblem(stored: StoredDungeon): EmblemKeyType | undefined {
  if (typeof stored.emblem === "string" && VALID_EMBLEM_KEYS.has(stored.emblem)) {
    return stored.emblem as EmblemKeyType;
  }
  return undefined;
}

function readRawPayload(raw: string): {
  payload: StoredPayload | null;
  warning: LoadWarning | null;
} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { payload: null, warning: LOAD_WARNING_CORRUPTED_SAVE };
  }

  if (!isRecord(parsed)) {
    return { payload: null, warning: LOAD_WARNING_CORRUPTED_SAVE };
  }

  if (typeof parsed.schemaVersion === "number" && parsed.schemaVersion > CURRENT_SCHEMA_VERSION) {
    return { payload: null, warning: LOAD_WARNING_UNSUPPORTED_SAVE };
  }

  const characters = Array.isArray(parsed.characters) ? parsed.characters : [];
  const dungeons = Array.isArray(parsed.dungeons) ? parsed.dungeons : [];
  const characterRows = characters.filter(isRecord);
  const dungeonRows = dungeons.filter(isRecord);
  const toggles = isRecord(parsed.dungeonToggles) ? parsed.dungeonToggles : null;
  const schemaVersion =
    typeof parsed.schemaVersion === "number" &&
    Number.isInteger(parsed.schemaVersion) && parsed.schemaVersion >= 0
      ? parsed.schemaVersion
      : undefined;
  const partial =
    !Array.isArray(parsed.characters) || !toggles ||
    (parsed.schemaVersion !== undefined && schemaVersion === undefined) ||
    (parsed.dungeons !== undefined && !Array.isArray(parsed.dungeons)) ||
    characterRows.length !== characters.length ||
    dungeonRows.length !== dungeons.length;

  return {
    payload: {
      schemaVersion,
      characters: characterRows as StoredCharacter[],
      dungeons: dungeonRows as StoredDungeon[],
      dungeonToggles: toggles ?? {},
    },
    warning: partial ? LOAD_WARNING_CORRUPTED_SAVE : null,
  };
}

function toDungeonRecord(stored: StoredDungeon, warn: Warn): DungeonRecord | null {
  if (!isStoredId(stored.id) || typeof stored.name !== "string" || !stored.name.trim()) {
    return null;
  }

  const rawDifficulty = stored.difficulty ?? stored.mode;
  const difficulty =
    rawDifficulty === DungeonDifficulty.HEROIC
      ? DungeonDifficulty.HEROIC
      : DungeonDifficulty.NORMAL;
  const size = DungeonSizes.includes(stored.size) ? stored.size : 10;
  if (!Array.isArray(stored.itemLevel)) return null;
  const itemLevel = stored.itemLevel.filter(Number.isFinite);
  if (itemLevel.length === 0 && stored.itemLevel.length > 0) return null;

  const emblem = parseStoredEmblem(stored);
  const shortName =
    typeof stored.shortName === "string" && stored.shortName.trim() !== ""
      ? stored.shortName.trim()
      : stored.raidKey === null ? undefined : defaultShortNameForDungeonName(stored.name);
  const raidKey =
    typeof stored.raidKey === "string" && isRaidKey(stored.raidKey)
      ? stored.raidKey
      : stored.raidKey === null ? null : undefined;
  if (
    itemLevel.length !== stored.itemLevel.length ||
    (stored.size !== undefined && stored.size !== size) ||
    (rawDifficulty !== undefined && rawDifficulty !== difficulty) ||
    (stored.emblem !== undefined && !emblem) ||
    (stored.raidKey !== undefined && raidKey === undefined) ||
    (stored.shortName !== undefined && typeof stored.shortName !== "string")
  ) {
    warn();
  }
  return {
    id: stored.id,
    name: stored.name,
    size,
    itemLevel,
    difficulty,
    ...(shortName ? { shortName } : {}),
    ...(emblem ? { emblem } : {}),
    ...(raidKey !== undefined ? { raidKey } : {}),
  };
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function parseOptionalStoredInteger(value: unknown, warn: Warn): number | undefined {
  if (isPositiveInteger(value)) return value;
  if (value !== undefined) warn();
  return undefined;
}

function parseOptionalStoredSpec(
  className: ClassName,
  value: unknown,
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed || !isSpecValidForClass(className, trimmed)) {
    return undefined;
  }
  return trimmed;
}

function parseStoredSpecGearPair(
  className: ClassName,
  storedValue: unknown,
  warn: Warn,
  legacyGearScore?: number,
): CharacterSpecGear | undefined {
  if (storedValue === null || storedValue === undefined) {
    return undefined;
  }

  if (typeof storedValue === "object" && !Array.isArray(storedValue)) {
    const record = storedValue as Record<string, unknown>;
    const spec = parseOptionalStoredSpec(className, record.spec);
    if (!spec) {
      warn();
      return undefined;
    }
    const gearScore = parseOptionalStoredInteger(record.gearScore, warn);
    const gearItems = parseStoredGearItems(record.gearItems, warn);
    const result: CharacterSpecGear = { spec };
    if (gearScore !== undefined) {
      result.gearScore = gearScore;
    }
    if (gearItems) {
      result.gearItems = gearItems;
    }
    return result;
  }

  if (typeof storedValue === "string") {
    const spec = parseOptionalStoredSpec(className, storedValue);
    if (!spec) {
      warn();
      return undefined;
    }
    const result: CharacterSpecGear = { spec };
    if (legacyGearScore !== undefined) {
      result.gearScore = legacyGearScore;
    }
    return result;
  }

  warn();
  return undefined;
}

function parseStoredGearItems(value: unknown, warn: Warn): CharacterGearItem[] | undefined {
  if (!Array.isArray(value)) {
    if (value !== undefined) warn();
    return undefined;
  }

  const gearItems: CharacterGearItem[] = [];
  for (const entry of value) {
    if (
      !isRecord(entry) || typeof entry.slot !== "number" ||
      !Number.isSafeInteger(entry.slot) || entry.slot < 0 ||
      !isPositiveInteger(entry.id)
    ) {
      warn();
      continue;
    }

    const item: CharacterGearItem = {
      slot: entry.slot,
      id: entry.id,
    };

    const enchant = parseOptionalStoredInteger(entry.enchant, warn);
    if (enchant !== undefined) item.enchant = enchant;

    if (Array.isArray(entry.gems)) {
      const gems = entry.gems.filter(isPositiveInteger);
      if (gems.length !== entry.gems.length) warn();
      if (gems.length > 0) {
        item.gems = gems;
      }
    } else if (entry.gems !== undefined) {
      warn();
    }

    gearItems.push(item);
  }

  return gearItems.length > 0 ? gearItems : undefined;
}

function parseStoredAlsoOwnedItemIds(value: unknown, warn: Warn): number[] | undefined {
  if (!Array.isArray(value)) {
    if (value !== undefined) warn();
    return undefined;
  }

  const validIds = value.filter(isPositiveInteger);
  if (validIds.length !== value.length) warn();
  const itemIds = [...new Set(validIds)];

  return itemIds.length > 0 ? itemIds : undefined;
}

function toCharacterRecord(stored: StoredCharacter, warn: Warn): CharacterRecord | null {
  if (!isStoredId(stored.id) || typeof stored.name !== "string" || !stored.name.trim()) {
    return null;
  }
  const charClass = Classes.find((candidate) => candidate.name === stored.className);
  if (!charClass) return null;

  const legacyGearScore = parseOptionalStoredInteger(stored.gearScore, warn);
  const legacyGearItems = parseStoredGearItems(stored.gearItems, warn);
  let mainSpec = parseStoredSpecGearPair(charClass.name, stored.mainSpec, warn, legacyGearScore);
  const offSpec = parseStoredSpecGearPair(charClass.name, stored.offSpec, warn);

  if (mainSpec && legacyGearItems && !mainSpec.gearItems) {
    mainSpec = { ...mainSpec, gearItems: legacyGearItems };
  }
  if (offSpec && offSpec.spec === mainSpec?.spec) warn();
  const alsoOwnedItemIds = parseStoredAlsoOwnedItemIds(stored.alsoOwnedItemIds, warn);

  return {
    id: stored.id,
    name: stored.name,
    class: charClass,
    ...(mainSpec ? { mainSpec } : {}),
    ...(offSpec && offSpec.spec !== mainSpec?.spec ? { offSpec } : {}),
    ...(alsoOwnedItemIds ? { alsoOwnedItemIds } : {}),
  };
}

function parseUniqueRows<Stored, Row extends { id: string }>(
  storedRows: Stored[],
  parse: (stored: Stored, warn: Warn) => Row | null,
  warn: Warn,
): Row[] {
  const rows = new Map<string, Row>();
  for (const stored of storedRows) {
    const row = parse(stored, warn);
    if (!row || rows.has(row.id)) {
      warn();
      continue;
    }
    rows.set(row.id, row);
  }
  return [...rows.values()];
}

function parsePayload(payload: StoredPayload, warn: Warn): LoadRaidTrackerResult["state"] {
  const migrated = migrateStoredPayload(payload);
  const characters = parseUniqueRows(migrated.characters, toCharacterRecord, warn);
  const dungeons = parseUniqueRows(migrated.dungeons, toDungeonRecord, warn);
  const dungeonToggles = pruneToggles(migrated.dungeonToggles, {
    characterIds: new Set(characters.map(({ id }) => id)),
    dungeonIds: new Set(dungeons.map(({ id }) => id)),
    onDiscard: warn,
  });

  return { characters, dungeons, dungeonToggles };
}

export function parseRaidTrackerState(raw: string | null): LoadRaidTrackerResult {
  if (raw === null) {
    return { state: EMPTY_STATE, loadWarning: null };
  }

  const { payload, warning } = readRawPayload(raw);
  if (!payload) return { state: EMPTY_STATE, loadWarning: warning };
  let corrupt = warning === LOAD_WARNING_CORRUPTED_SAVE;
  const state = parsePayload(payload, () => { corrupt = true; });
  return {
    state,
    loadWarning: corrupt ? LOAD_WARNING_CORRUPTED_SAVE : null,
  };
}

export function loadRaidTrackerState() {
  return loadLocalSave(TRACKER_STORAGE_KEYS, parseRaidTrackerState);
}
