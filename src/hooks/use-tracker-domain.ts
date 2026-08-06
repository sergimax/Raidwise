import { useCallback, useEffect, useMemo, useState } from "react";
import { DungeonList } from "../data/dungeons.ts";
import { loadRaidTrackerState, saveRaidTrackerState } from "../storage/index.ts";
import type { CharacterRecord, CharacterSpecGearUpdate } from "../types/characters.ts";
import type {
  DungeonCustomizationUpdate,
  DungeonRecord,
  DungeonToggles,
} from "../types/dungeons.ts";
import {
  flipCooldown,
  hasAnyCooldownOn,
  removeCharacterFromToggles,
  removeDungeonFromToggles,
  resetCharacterToggles,
} from "../utils/dungeon-toggles.ts";
import { moveCharacterInList } from "../utils/move-character.ts";
import { resolveAlsoOwnedItemIds } from "../utils/resolve-also-owned-item-ids.ts";
import { generateUUID } from "../uuid.ts";

/** Domain state: characters, dungeons, toggles, persistence, and mutations. */
export function useTrackerDomain() {
  const [initialLoad] = useState(loadRaidTrackerState);
  const [characters, setCharacters] = useState<CharacterRecord[]>(
    initialLoad.state.characters,
  );
  const [dungeons, setDungeons] = useState<DungeonRecord[]>(
    initialLoad.state.dungeons,
  );
  const [dungeonToggles, setDungeonToggles] = useState<DungeonToggles>(
    initialLoad.state.dungeonToggles,
  );
  const [storageError, setStorageError] = useState<string | null>(
    initialLoad.loadWarning,
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      saveRaidTrackerState(
        { characters, dungeons, dungeonToggles },
        (errorMessage) => {
          setStorageError(errorMessage);
        },
      );
    }, 400);
    return () => clearTimeout(timeout);
  }, [characters, dungeons, dungeonToggles]);

  const addCharacter = useCallback((character: CharacterRecord) => {
    setCharacters((previous) => [...previous, character]);
  }, []);

  const updateCharacter = useCallback(
    (characterId: string, specGear: CharacterSpecGearUpdate) => {
      setCharacters((previous) =>
        previous.map((character) => {
          if (character.id !== characterId) {
            return character;
          }
          const next: CharacterRecord = {
            id: character.id,
            name: character.name,
            class: character.class,
          };
          if (specGear.mainSpec !== undefined) {
            next.mainSpec = specGear.mainSpec;
          }
          if (specGear.offSpec !== undefined) {
            next.offSpec = specGear.offSpec;
          }
          const alsoOwnedItemIds = resolveAlsoOwnedItemIds(
            specGear.alsoOwnedItemIds,
            character.alsoOwnedItemIds,
          );
          if (alsoOwnedItemIds !== undefined) {
            next.alsoOwnedItemIds = alsoOwnedItemIds;
          }
          return next;
        }),
      );
    },
    [],
  );

  const moveCharacter = useCallback(
    (characterId: string, direction: -1 | 1) => {
      setCharacters((previous) =>
        moveCharacterInList(previous, characterId, direction),
      );
    },
    [],
  );

  const addDungeon = useCallback((dungeon: DungeonRecord) => {
    setDungeons((previous) => [...previous, dungeon]);
  }, []);

  const updateDungeon = useCallback(
    (dungeonId: string, customization: DungeonCustomizationUpdate) => {
      setDungeons((previous) =>
        previous.map((dungeon) => {
          if (dungeon.id !== dungeonId) {
            return dungeon;
          }
          const next: DungeonRecord = {
            id: dungeon.id,
            name: customization.name,
            size: customization.size,
            itemLevel: dungeon.itemLevel,
            difficulty: customization.difficulty,
            ...(customization.shortName ? { shortName: customization.shortName } : {}),
            ...(customization.emblem ? { emblem: customization.emblem } : {}),
          };
          return next;
        }),
      );
    },
    [],
  );

  const handleDungeonToggle = useCallback(
    (characterId: string, dungeonId: string) => {
      setDungeonToggles((previous) =>
        flipCooldown(previous, characterId, dungeonId),
      );
    },
    [],
  );

  /** One-shot: fills the table from `DungeonList` only while it has no dungeons. */
  const handleAddFromTemplate = useCallback(() => {
    setDungeons((previousDungeons) => {
      if (previousDungeons.length > 0) {
        return previousDungeons;
      }
      return DungeonList.map((templateDungeon) => ({
        ...templateDungeon,
        id: generateUUID(),
      }));
    });
  }, []);

  const handleDeleteCharacter = useCallback((characterId: string) => {
    setCharacters((previous) =>
      previous.filter((character) => character.id !== characterId),
    );
    setDungeonToggles((previous) =>
      removeCharacterFromToggles(previous, characterId),
    );
  }, []);

  const handleDeleteDungeon = useCallback((dungeonId: string) => {
    setDungeons((previous) =>
      previous.filter((dungeon) => dungeon.id !== dungeonId),
    );
    setDungeonToggles((previous) =>
      removeDungeonFromToggles(previous, dungeonId),
    );
  }, []);

  const handleDeleteAllCharacters = useCallback(() => {
    setCharacters([]);
    setDungeonToggles({});
  }, []);

  const handleDeleteAllDungeons = useCallback(() => {
    setDungeons([]);
    setDungeonToggles({});
  }, []);

  const handleResetAllToggles = useCallback(() => {
    setDungeonToggles({});
  }, []);

  const handleResetCharacterToggles = useCallback((characterId: string) => {
    setDungeonToggles((previous) =>
      resetCharacterToggles(previous, characterId),
    );
  }, []);

  const canResetAllToggles = useMemo(
    () => hasAnyCooldownOn(dungeonToggles),
    [dungeonToggles],
  );

  return useMemo(
    () => ({
      characters,
      dungeons,
      dungeonToggles,
      storageError,
      addCharacter,
      updateCharacter,
      moveCharacter,
      addDungeon,
      updateDungeon,
      handleDungeonToggle,
      handleDeleteCharacter,
      handleDeleteDungeon,
      handleDeleteAllCharacters,
      handleDeleteAllDungeons,
      handleAddFromTemplate,
      handleResetAllToggles,
      handleResetCharacterToggles,
      canResetAllToggles,
    }),
    [
      addCharacter,
      addDungeon,
      canResetAllToggles,
      characters,
      dungeonToggles,
      dungeons,
      handleAddFromTemplate,
      handleDeleteAllCharacters,
      handleDeleteAllDungeons,
      handleDeleteCharacter,
      handleDeleteDungeon,
      handleDungeonToggle,
      handleResetAllToggles,
      handleResetCharacterToggles,
      moveCharacter,
      storageError,
      updateCharacter,
      updateDungeon,
    ],
  );
}

export type TrackerDomainStore = ReturnType<typeof useTrackerDomain>;
