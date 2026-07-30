import { describe, expect, it } from "vitest";
import { EmblemKey } from "../assets/emblems/emblem-icons.ts";
import { RaidNames } from "../data/raid-names.ts";
import { Classes } from "../types/characters.ts";
import { DungeonDifficulty } from "../types/dungeons.ts";
import {
  LOAD_WARNING_CORRUPTED_SAVE,
  STORAGE_KEY,
} from "./constants.ts";
import { loadRaidTrackerState } from "./parse.ts";
import type { StoredPayload } from "./types.ts";
import { EMPTY_STATE } from "./types.ts";

function writeStoredPayload(payload: StoredPayload): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

describe("loadRaidTrackerState", () => {
  it("returns empty state when storage key is missing", () => {
    expect(loadRaidTrackerState()).toEqual({
      state: EMPTY_STATE,
      loadWarning: null,
    });
  });

  it("returns corrupted warning for invalid JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{not-json");
    expect(loadRaidTrackerState()).toEqual({
      state: EMPTY_STATE,
      loadWarning: LOAD_WARNING_CORRUPTED_SAVE,
    });
  });

  it("maps legacy mode to difficulty", () => {
    writeStoredPayload({
      schemaVersion: 1,
      characters: [],
      dungeons: [
        {
          id: "dungeon-1",
          name: "Raid",
          size: 25,
          itemLevel: [200],
          mode: DungeonDifficulty.HEROIC,
        },
      ],
      dungeonToggles: {},
    });

    const result = loadRaidTrackerState();
    expect(result.state.dungeons[0]?.difficulty).toBe(DungeonDifficulty.HEROIC);
  });

  it("drops invalid emblem values", () => {
    writeStoredPayload({
      schemaVersion: 1,
      characters: [],
      dungeons: [
        {
          id: "dungeon-1",
          name: "Raid",
          size: 25,
          itemLevel: [200],
          difficulty: DungeonDifficulty.NORMAL,
          emblem: "invalid-emblem" as EmblemKey,
        },
      ],
      dungeonToggles: {},
    });

    const result = loadRaidTrackerState();
    expect(result.state.dungeons[0]?.emblem).toBeUndefined();
  });

  it("backfills shortName from known raid names", () => {
    writeStoredPayload({
      schemaVersion: 1,
      characters: [],
      dungeons: [
        {
          id: "dungeon-1",
          name: RaidNames.icecrownCitadel.en,
          size: 25,
          itemLevel: [264],
          difficulty: DungeonDifficulty.NORMAL,
        },
      ],
      dungeonToggles: {},
    });

    const result = loadRaidTrackerState();
    expect(result.state.dungeons[0]?.shortName).toBe(
      RaidNames.icecrownCitadel.shortEn,
    );
  });

  it("loads optional character spec + gear score pairs", () => {
    writeStoredPayload({
      schemaVersion: 3,
      characters: [
        {
          id: "character-1",
          name: "Alpha",
          className: Classes[0].name,
          mainSpec: { spec: "Blood", gearScore: 5800 },
          offSpec: { spec: "Unholy", gearScore: 5200 },
        },
      ],
      dungeons: [],
      dungeonToggles: {},
    });

    const result = loadRaidTrackerState();
    expect(result.state.characters[0]).toEqual({
      id: "character-1",
      name: "Alpha",
      class: Classes[0],
      mainSpec: { spec: "Blood", gearScore: 5800 },
      offSpec: { spec: "Unholy", gearScore: 5200 },
    });
  });

  it("migrates legacy v2 flat spec and gear score fields", () => {
    writeStoredPayload({
      schemaVersion: 2,
      characters: [
        {
          id: "character-1",
          name: "Alpha",
          className: Classes[0].name,
          mainSpec: "Blood",
          offSpec: "Unholy",
          gearScore: 5800,
        },
      ],
      dungeons: [],
      dungeonToggles: {},
    });

    const result = loadRaidTrackerState();
    expect(result.state.characters[0]).toEqual({
      id: "character-1",
      name: "Alpha",
      class: Classes[0],
      mainSpec: { spec: "Blood", gearScore: 5800 },
      offSpec: { spec: "Unholy" },
    });
  });

  it("drops invalid character spec values on load", () => {
    writeStoredPayload({
      schemaVersion: 2,
      characters: [
        {
          id: "character-1",
          name: "Alpha",
          className: Classes[0].name,
          mainSpec: "Fire",
          offSpec: "Arcane",
        },
      ],
      dungeons: [],
      dungeonToggles: {},
    });

    const result = loadRaidTrackerState();
    expect(result.state.characters[0]).toEqual({
      id: "character-1",
      name: "Alpha",
      class: Classes[0],
    });
  });

  it("prunes non-boolean toggle values on load", () => {
    writeStoredPayload({
      schemaVersion: 1,
      characters: [
        {
          id: "character-1",
          name: "Alpha",
          className: Classes[0].name,
        },
      ],
      dungeons: [
        {
          id: "dungeon-1",
          name: "Raid",
          size: 25,
          itemLevel: [200],
          difficulty: DungeonDifficulty.NORMAL,
        },
      ],
      dungeonToggles: {
        "character-1": {
          "dungeon-1": true,
          "dungeon-2": "yes" as unknown as boolean,
        },
      },
    });

    const result = loadRaidTrackerState();
    expect(result.state.dungeonToggles).toEqual({
      "character-1": { "dungeon-1": true },
    });
  });

  it("loads stored character gear items", () => {
    writeStoredPayload({
      schemaVersion: 4,
      characters: [
        {
          id: "character-1",
          name: "Rhee",
          className: Classes[7].name,
          mainSpec: { spec: "Enhancement", gearScore: 6400 },
          gearItems: [
            { slot: 0, id: 51197, enchant: 3817, gems: [41398, 40118] },
            { slot: 14, id: 50426, enchant: 3789 },
          ],
        },
      ],
      dungeons: [],
      dungeonToggles: {},
    });

    const result = loadRaidTrackerState();
    expect(result.state.characters[0]?.mainSpec?.gearItems).toEqual([
      { slot: 0, id: 51197, enchant: 3817, gems: [41398, 40118] },
      { slot: 14, id: 50426, enchant: 3789 },
    ]);
  });

  it("loads per-spec gear items from stored spec objects", () => {
    writeStoredPayload({
      schemaVersion: 5,
      characters: [
        {
          id: "character-1",
          name: "Rhee",
          className: Classes[7].name,
          mainSpec: {
            spec: "Enhancement",
            gearScore: 6400,
            gearItems: [{ slot: 0, id: 51197 }],
          },
          offSpec: {
            spec: "Restoration",
            gearItems: [{ slot: 1, id: 50426 }],
          },
        },
      ],
      dungeons: [],
      dungeonToggles: {},
    });

    const result = loadRaidTrackerState();
    expect(result.state.characters[0]?.mainSpec?.gearItems).toEqual([
      { slot: 0, id: 51197 },
    ]);
    expect(result.state.characters[0]?.offSpec?.gearItems).toEqual([
      { slot: 1, id: 50426 },
    ]);
  });

  it("loads also-owned item ids on characters", () => {
    writeStoredPayload({
      schemaVersion: 6,
      characters: [
        {
          id: "character-1",
          name: "Rhee",
          className: Classes[7].name,
          mainSpec: { spec: "Enhancement", gearScore: 6400 },
          alsoOwnedItemIds: [50707, 49623, 50707, -1, "bad" as unknown as number],
        },
      ],
      dungeons: [],
      dungeonToggles: {},
    });

    const result = loadRaidTrackerState();
    expect(result.state.characters[0]?.alsoOwnedItemIds).toEqual([50707, 49623]);
  });
});
