import {
  CURRENT_SCHEMA_VERSION,
  STORAGE_KEY,
} from "./constants.ts";
import { getWriteError, type SaveError } from "./local-save.ts";
import { pruneToggles } from "../utils/dungeon-toggles.ts";
import type { CharacterRecord } from "../types/characters.ts";
import type { PersistedTrackerState, StoredCharacter, StoredCharacterSpecGear, StoredDungeon, StoredPayload } from "./types.ts";

function toStoredSpecGear(
  specGear: NonNullable<CharacterRecord["mainSpec"]>,
): StoredCharacterSpecGear {
  const stored: StoredCharacterSpecGear = { spec: specGear.spec };
  if (specGear.gearScore !== undefined) {
    stored.gearScore = specGear.gearScore;
  }
  if (specGear.gearItems) {
    stored.gearItems = specGear.gearItems;
  }
  return stored;
}

export function serializeRaidTrackerState(state: PersistedTrackerState): string {
  const { characters, dungeons, dungeonToggles } = state;
  const characterIds = new Set(characters.map((character) => character.id));
  const dungeonIds = new Set(dungeons.map((dungeon) => dungeon.id));

  const storedCharacters: StoredCharacter[] = characters.map((character) => ({
    id: character.id,
    name: character.name,
    className: character.class?.name ?? "",
    ...(character.mainSpec ? { mainSpec: toStoredSpecGear(character.mainSpec) } : {}),
    ...(character.offSpec ? { offSpec: toStoredSpecGear(character.offSpec) } : {}),
    ...(character.alsoOwnedItemIds && character.alsoOwnedItemIds.length > 0
      ? { alsoOwnedItemIds: character.alsoOwnedItemIds }
      : {}),
  }));

  const storedDungeons: StoredDungeon[] = dungeons.map((dungeon) => ({
    id: dungeon.id,
    name: dungeon.name,
    size: dungeon.size,
    itemLevel: dungeon.itemLevel,
    difficulty: dungeon.difficulty,
    ...(dungeon.shortName ? { shortName: dungeon.shortName } : {}),
    ...(dungeon.emblem ? { emblem: dungeon.emblem } : {}),
    ...(dungeon.raidKey !== undefined ? { raidKey: dungeon.raidKey } : {}),
  }));

  const storedToggles = pruneToggles(dungeonToggles, {
    characterIds,
    dungeonIds,
    omitEmptyCharacters: true,
  });

  const payload: StoredPayload = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    characters: storedCharacters,
    dungeons: storedDungeons,
    dungeonToggles: storedToggles,
  };
  return JSON.stringify(payload);
}

export function saveRaidTrackerState(
  state: PersistedTrackerState,
  onError?: (error: SaveError | null) => void,
): void {
  try {
    localStorage.setItem(STORAGE_KEY, serializeRaidTrackerState(state));
    onError?.(null);
  } catch (error) {
    onError?.(getWriteError(error));
  }
}
