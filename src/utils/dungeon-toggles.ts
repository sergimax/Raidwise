import type { DungeonToggles } from "../types/dungeons.ts";
import { isRecord } from "../storage/guards.ts";

export function isCooldownOn(
  toggles: DungeonToggles,
  characterId: string,
  dungeonId: string,
): boolean {
  return toggles[characterId]?.[dungeonId] ?? false;
}

export function flipCooldown(
  toggles: DungeonToggles,
  characterId: string,
  dungeonId: string,
): DungeonToggles {
  const previousForCharacter = toggles[characterId] ?? {};
  const nextValue = !isCooldownOn(toggles, characterId, dungeonId);
  return {
    ...toggles,
    [characterId]: {
      ...previousForCharacter,
      [dungeonId]: nextValue,
    },
  };
}

export function removeCharacterFromToggles(
  toggles: DungeonToggles,
  characterId: string,
): DungeonToggles {
  const next = { ...toggles };
  delete next[characterId];
  return next;
}

export function removeDungeonFromToggles(
  toggles: DungeonToggles,
  dungeonId: string,
): DungeonToggles {
  const next: DungeonToggles = {};
  for (const [characterId, togglesByDungeon] of Object.entries(toggles)) {
    const nextForCharacter = { ...togglesByDungeon };
    delete nextForCharacter[dungeonId];
    next[characterId] = nextForCharacter;
  }
  return next;
}

export function resetCharacterToggles(
  toggles: DungeonToggles,
  characterId: string,
): DungeonToggles {
  return {
    ...toggles,
    [characterId]: {},
  };
}

export function hasAnyCooldownOn(toggles: DungeonToggles): boolean {
  for (const togglesByCharacter of Object.values(toggles)) {
    for (const value of Object.values(togglesByCharacter)) {
      if (value) return true;
    }
  }
  return false;
}

type PruneTogglesOptions = {
  dungeonIds: ReadonlySet<string>;
  characterIds?: ReadonlySet<string>;
  /** Drop character keys with no dungeon toggles left (save path). */
  omitEmptyCharacters?: boolean;
  /** Report malformed or orphaned entries during recovery. */
  onDiscard?: () => void;
};

/**
 * Filter by character/dungeon IDs (save + load paths)
 */
export function pruneToggles(
  toggles: Record<string, unknown>,
  {
    characterIds,
    dungeonIds,
    omitEmptyCharacters = false,
    onDiscard,
  }: PruneTogglesOptions,
): DungeonToggles {
  const result: DungeonToggles = {};

  for (const [characterId, togglesByDungeon] of Object.entries(toggles)) {
    if ((characterIds && !characterIds.has(characterId)) || !isRecord(togglesByDungeon)) {
      onDiscard?.();
      continue;
    }

    const prunedForCharacter: Record<string, boolean> = {};
    for (const [dungeonId, value] of Object.entries(togglesByDungeon)) {
      if (!dungeonIds.has(dungeonId) || typeof value !== "boolean") {
        onDiscard?.();
        continue;
      }
      prunedForCharacter[dungeonId] = value;
    }

    if (omitEmptyCharacters && Object.keys(prunedForCharacter).length === 0) {
      continue;
    }

    result[characterId] = prunedForCharacter;
  }

  return result;
}
