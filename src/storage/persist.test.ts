import { describe, expect, it, vi } from "vitest";
import { Classes } from "../types/characters.ts";
import { DungeonDifficulty } from "../types/dungeons.ts";
import {
  createTestCharacter,
  createTestDungeon,
  createTestToggles,
} from "../test/fixtures.ts";
import { STORAGE_KEY, STORAGE_QUOTA_EXCEEDED } from "./constants.ts";
import { loadRaidTrackerState } from "./parse.ts";
import { saveRaidTrackerState } from "./persist.ts";

describe("saveRaidTrackerState", () => {
  it("round-trips characters, dungeons, and toggles through localStorage", () => {
    const character = createTestCharacter({
      id: "character-1",
      name: "Alpha",
      class: Classes[2],
      mainSpec: { spec: "Beast Mastery", gearScore: 5800 },
      offSpec: { spec: "Survival", gearScore: 5200 },
    });
    const dungeon = createTestDungeon({
      id: "dungeon-1",
      name: "Icecrown Citadel",
      shortName: "ICC",
      size: 25,
      itemLevel: [264],
      difficulty: DungeonDifficulty.HEROIC,
    });
    const toggles = createTestToggles([
      { characterId: character.id, dungeonId: dungeon.id, on: true },
    ]);

    saveRaidTrackerState({
      characters: [character],
      dungeons: [dungeon],
      dungeonToggles: toggles,
    });

    const loaded = loadRaidTrackerState();
    expect(loaded.loadWarning).toBeNull();
    expect(loaded.state.characters).toEqual([character]);
    expect(loaded.state.dungeons).toEqual([dungeon]);
    expect(loaded.state.dungeonToggles).toEqual(toggles);
  });

  it("prunes orphaned toggle keys on save", () => {
    const character = createTestCharacter({ id: "character-1" });
    const dungeon = createTestDungeon({ id: "dungeon-1" });
    const toggles = {
      "character-1": { "dungeon-1": true, "dungeon-2": true },
      "character-2": { "dungeon-1": true },
    };

    saveRaidTrackerState({
      characters: [character],
      dungeons: [dungeon],
      dungeonToggles: toggles,
    });

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!) as {
      dungeonToggles: Record<string, Record<string, boolean>>;
    };
    expect(parsed.dungeonToggles).toEqual({
      "character-1": { "dungeon-1": true },
    });
  });

  it("calls onError when storage quota is exceeded", () => {
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        const error = new DOMException("Quota exceeded", "QuotaExceededError");
        throw error;
      });
    const onError = vi.fn();

    saveRaidTrackerState(
      {
        characters: [],
        dungeons: [],
        dungeonToggles: {},
      },
      onError,
    );

    expect(onError).toHaveBeenCalledWith(
      STORAGE_QUOTA_EXCEEDED,
    );
    setItem.mockRestore();
  });
});
