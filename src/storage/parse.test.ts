import { describe, expect, it, vi } from "vitest";
import { EmblemKey } from "../assets/emblems/emblem-icons.ts";
import { RaidNames } from "../data/raid-names.ts";
import { Classes } from "../types/characters.ts";
import { DungeonDifficulty } from "../types/dungeons.ts";
import {
  LEGACY_STORAGE_KEY,
  LOAD_WARNING_CORRUPTED_SAVE,
  STORAGE_KEY,
  STORAGE_READ_FAILED,
} from "./constants.ts";
import { loadRaidTrackerState } from "./parse.ts";
import type { StoredPayload } from "./types.ts";
import { EMPTY_STATE } from "./types.ts";

function writeStoredPayload(payload: StoredPayload): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

describe("loadRaidTrackerState", () => {
  it("returns empty state when storage key is missing", () => {
    expect(loadRaidTrackerState()).toMatchObject({
      state: EMPTY_STATE,
      loadWarning: null,
    });
  });

  it("distinguishes an inaccessible store from an empty store", () => {
    const read = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Denied", "SecurityError");
    });
    try {
      expect(loadRaidTrackerState()).toEqual({
        state: EMPTY_STATE,
        loadWarning: STORAGE_READ_FAILED,
        snapshot: null,
      });
    } finally {
      read.mockRestore();
    }
  });

  it("reads legacy data without changing its key", () => {
    const payload: StoredPayload = {
      schemaVersion: 6,
      characters: [],
      dungeons: [],
      dungeonToggles: {},
    };
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(payload));

    expect(loadRaidTrackerState()).toMatchObject({
      state: EMPTY_STATE,
      loadWarning: null,
    });
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(LEGACY_STORAGE_KEY)).toBe(JSON.stringify(payload));
  });

  it("returns corrupted warning for invalid JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{not-json");
    expect(loadRaidTrackerState()).toMatchObject({
      state: EMPTY_STATE,
      loadWarning: LOAD_WARNING_CORRUPTED_SAVE,
    });
  });

  it.each([undefined, 6])("recovers valid rows beside malformed rows in schema %s", (schemaVersion) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      schemaVersion,
      characters: [null, { id: "one", name: "Alpha", className: Classes[0].name }],
      dungeons: [null, { id: "raid", name: "Raid", size: 10, itemLevel: [200] }],
      dungeonToggles: { one: { raid: true } },
    }));
    const { state, loadWarning } = loadRaidTrackerState();
    expect(loadWarning).toBe(LOAD_WARNING_CORRUPTED_SAVE);
    expect(state.characters.map(({ id }) => id)).toEqual(["one"]);
    expect(state.dungeons.map(({ id }) => id)).toEqual(["raid"]);
    expect(state.dungeonToggles).toEqual({ one: { raid: true } });
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
    expect(result.loadWarning).toBe(LOAD_WARNING_CORRUPTED_SAVE);
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
    expect(result.loadWarning).toBe(LOAD_WARNING_CORRUPTED_SAVE);
    expect(result.state.dungeonToggles).toEqual({
      "character-1": { "dungeon-1": true },
    });
  });

  it("recovers valid gear and rejects duplicate and reserved ids without changing the original", () => {
    const character = {
      id: "one",
      name: "Alpha",
      className: Classes[0].name,
      mainSpec: { spec: "Blood", gearItems: [null, { slot: 1, id: 50426, gems: [123, "bad"] }] },
    };
    const raw = JSON.stringify({
      schemaVersion: 6,
      characters: [character, { ...character, name: "Duplicate" }, { ...character, id: "__proto__" }],
      dungeons: [{ id: "raid", name: "Raid", size: 10, itemLevel: [200, null] }],
      dungeonToggles: { one: { raid: true, missing: true }, unknown: { raid: true } },
    });
    localStorage.setItem(STORAGE_KEY, raw);
    const loaded = loadRaidTrackerState();
    expect(loaded.loadWarning).toBe(LOAD_WARNING_CORRUPTED_SAVE);
    expect(loaded.state.characters).toHaveLength(1);
    expect(loaded.state.characters[0]).toMatchObject({
      name: "Alpha",
      mainSpec: { gearItems: [{ slot: 1, id: 50426, gems: [123] }] },
    });
    expect(loaded.state.dungeons[0].itemLevel).toEqual([200]);
    expect(loaded.state.dungeonToggles).toEqual({ one: { raid: true } });
    expect(loaded.snapshot?.current).toBe(raw);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(raw);
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
