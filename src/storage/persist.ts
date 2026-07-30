import {
  CURRENT_SCHEMA_VERSION,
  STORAGE_KEY,
} from "./constants.ts";
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

export function saveRaidTrackerState(
  state: PersistedTrackerState,
  onError?: (message: string | null) => void,
): void {
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
    ...(dungeon.raidKey ? { raidKey: dungeon.raidKey } : {}),
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

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    onError?.(null);
  } catch (error) {
    const message =
      error instanceof DOMException && error.name === "QuotaExceededError"
        ? "Storage quota exceeded. Please free up space."
        : "Failed to save data. Please try again.";
    onError?.(message);
  }
}
