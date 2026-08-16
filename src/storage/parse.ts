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
  type DungeonToggles,
} from "../types/dungeons.ts";
import {
  LEGACY_STORAGE_KEY,
  LOAD_WARNING_CORRUPTED_SAVE,
  STORAGE_KEY,
} from "./constants.ts";
import { migrateStoredPayload } from "./migrate.ts";
import {
  EMPTY_STATE,
  type LoadRaidTrackerResult,
  type StoredCharacter,
  type StoredDungeon,
  type StoredPayload,
} from "./types.ts";
import { isRecord } from "./guards.ts";
import { getLocalStorageItemMigrating } from "../utils/local-storage-migrate.ts";

const VALID_EMBLEM_KEYS = new Set<string>(Object.values(EmblemKey));

function parseStoredEmblem(stored: StoredDungeon): EmblemKeyType | undefined {
  if (typeof stored.emblem === "string" && VALID_EMBLEM_KEYS.has(stored.emblem)) {
    return stored.emblem as EmblemKeyType;
  }
  return undefined;
}

function readRawPayload(): { payload: StoredPayload | null; corrupted: boolean } {
  let raw: string | null;
  try {
    raw = getLocalStorageItemMigrating(STORAGE_KEY, LEGACY_STORAGE_KEY);
  } catch {
    return { payload: null, corrupted: true };
  }

  if (!raw) {
    return { payload: null, corrupted: false };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { payload: null, corrupted: true };
  }

  if (!isRecord(parsed)) {
    return { payload: null, corrupted: true };
  }

  if (!Array.isArray(parsed.characters) || !isRecord(parsed.dungeonToggles)) {
    return { payload: null, corrupted: true };
  }

  const dungeons = Array.isArray(parsed.dungeons) ? parsed.dungeons : [];
  const schemaVersion =
    typeof parsed.schemaVersion === "number" ? parsed.schemaVersion : undefined;

  return {
    payload: {
      schemaVersion,
      characters: parsed.characters as StoredCharacter[],
      dungeons: dungeons as StoredDungeon[],
      dungeonToggles: parsed.dungeonToggles as Record<string, Record<string, boolean>>,
    },
    corrupted: false,
  };
}

function toDungeonRecord(stored: StoredDungeon): DungeonRecord | null {
  if (typeof stored.id !== "string" || typeof stored.name !== "string") {
    return null;
  }

  const rawDifficulty = stored.difficulty ?? stored.mode;
  const difficulty =
    rawDifficulty === DungeonDifficulty.HEROIC
      ? DungeonDifficulty.HEROIC
      : DungeonDifficulty.NORMAL;
  const size = DungeonSizes.includes(stored.size) ? stored.size : 10;
  if (!Array.isArray(stored.itemLevel) || !stored.itemLevel.every(Number.isFinite)) {
    return null;
  }

  const emblem = parseStoredEmblem(stored);
  const shortName =
    typeof stored.shortName === "string" && stored.shortName.trim() !== ""
      ? stored.shortName.trim()
      : defaultShortNameForDungeonName(stored.name);
  const raidKey =
    typeof stored.raidKey === "string" && isRaidKey(stored.raidKey)
      ? stored.raidKey
      : undefined;
  return {
    id: stored.id,
    name: stored.name,
    size,
    itemLevel: stored.itemLevel as number[],
    difficulty,
    ...(shortName ? { shortName } : {}),
    ...(emblem ? { emblem } : {}),
    ...(raidKey ? { raidKey } : {}),
  };
}

function parseOptionalStoredInteger(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value)) {
    return undefined;
  }
  return value > 0 ? value : undefined;
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
  legacyGearScore?: number,
): CharacterSpecGear | undefined {
  if (storedValue === null || storedValue === undefined) {
    return undefined;
  }

  if (typeof storedValue === "object" && !Array.isArray(storedValue)) {
    const record = storedValue as Record<string, unknown>;
    const spec = parseOptionalStoredSpec(className, record.spec);
    if (!spec) {
      return undefined;
    }
    const gearScore = parseOptionalStoredInteger(record.gearScore);
    const gearItems = parseStoredGearItems(record.gearItems);
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
      return undefined;
    }
    const result: CharacterSpecGear = { spec };
    if (legacyGearScore !== undefined) {
      result.gearScore = legacyGearScore;
    }
    return result;
  }

  return undefined;
}

function parseStoredGearItems(value: unknown): CharacterGearItem[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const gearItems: CharacterGearItem[] = [];
  for (const entry of value) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      continue;
    }
    const record = entry as Record<string, unknown>;
    if (
      typeof record.slot !== "number" ||
      !Number.isInteger(record.slot) ||
      record.slot < 0 ||
      typeof record.id !== "number" ||
      !Number.isInteger(record.id) ||
      record.id <= 0
    ) {
      continue;
    }

    const item: CharacterGearItem = {
      slot: record.slot,
      id: record.id,
    };

    if (
      typeof record.enchant === "number" &&
      Number.isInteger(record.enchant) &&
      record.enchant > 0
    ) {
      item.enchant = record.enchant;
    }

    if (Array.isArray(record.gems)) {
      const gems = record.gems.filter(
        (gem): gem is number =>
          typeof gem === "number" && Number.isInteger(gem) && gem > 0,
      );
      if (gems.length > 0) {
        item.gems = gems;
      }
    }

    gearItems.push(item);
  }

  return gearItems.length > 0 ? gearItems : undefined;
}

function parseStoredAlsoOwnedItemIds(value: unknown): number[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const itemIds: number[] = [];
  for (const entry of value) {
    if (
      typeof entry !== "number" ||
      !Number.isInteger(entry) ||
      entry <= 0 ||
      itemIds.includes(entry)
    ) {
      continue;
    }
    itemIds.push(entry);
  }

  return itemIds.length > 0 ? itemIds : undefined;
}

function parseCharacters(storedCharacters: StoredCharacter[]): CharacterRecord[] {
  return storedCharacters
    .map((stored) => {
      if (typeof stored.id !== "string" || typeof stored.name !== "string") {
        return null;
      }
      const charClass = Classes.find(
        (candidate) => candidate.name === stored.className,
      );
      if (!charClass) return null;

      const legacyGearScore = parseOptionalStoredInteger(stored.gearScore);
      const legacyGearItems = parseStoredGearItems(stored.gearItems);
      let mainSpec = parseStoredSpecGearPair(
        charClass.name,
        stored.mainSpec,
        legacyGearScore,
      );
      const offSpec = parseStoredSpecGearPair(charClass.name, stored.offSpec);

      if (mainSpec && legacyGearItems && !mainSpec.gearItems) {
        mainSpec = { ...mainSpec, gearItems: legacyGearItems };
      }

      const alsoOwnedItemIds = parseStoredAlsoOwnedItemIds(
        stored.alsoOwnedItemIds,
      );

      return {
        id: stored.id,
        name: stored.name,
        class: charClass,
        ...(mainSpec ? { mainSpec } : {}),
        ...(offSpec && offSpec.spec !== mainSpec?.spec ? { offSpec } : {}),
        ...(alsoOwnedItemIds ? { alsoOwnedItemIds } : {}),
      } as CharacterRecord;
    })
    .filter((character): character is CharacterRecord => character !== null);
}

function parseDungeons(storedDungeons: StoredDungeon[]): DungeonRecord[] {
  const result: DungeonRecord[] = [];
  for (const stored of storedDungeons) {
    const dungeon = toDungeonRecord(stored);
    if (dungeon) result.push(dungeon);
  }
  return result;
}

function parseDungeonToggles(
  storedToggles: Record<string, Record<string, boolean>>,
  dungeonIds: Set<string>,
): DungeonToggles {
  return pruneToggles(storedToggles, {
    dungeonIds,
    requireBooleanValues: true,
  });
}

function parsePayload(payload: StoredPayload): LoadRaidTrackerResult["state"] {
  const migrated = migrateStoredPayload(payload);
  const characters = parseCharacters(migrated.characters);
  const dungeons = parseDungeons(migrated.dungeons);
  const dungeonIds = new Set(dungeons.map((dungeon) => dungeon.id));
  const dungeonToggles =
    dungeons.length > 0
      ? parseDungeonToggles(migrated.dungeonToggles, dungeonIds)
      : {};

  return { characters, dungeons, dungeonToggles };
}

export function loadRaidTrackerState(): LoadRaidTrackerResult {
  const { payload, corrupted } = readRawPayload();

  if (corrupted) {
    return {
      state: EMPTY_STATE,
      loadWarning: LOAD_WARNING_CORRUPTED_SAVE,
    };
  }

  if (!payload) {
    return { state: EMPTY_STATE, loadWarning: null };
  }

  return {
    state: parsePayload(payload),
    loadWarning: null,
  };
}
