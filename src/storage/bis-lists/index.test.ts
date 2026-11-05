import { beforeEach, describe, expect, it } from "vitest";
import { ClassName } from "../../types/characters.ts";
import type { LocalBisListsState } from "../../types/bis-lists.ts";
import { specBisStorageKey } from "../../utils/bis-lists.ts";
import { LOAD_WARNING_CORRUPTED_SAVE, LOAD_WARNING_UNSUPPORTED_SAVE } from "../constants.ts";
import {
  BIS_LISTS_SCHEMA_VERSION,
  BIS_LISTS_STORAGE_KEY,
} from "./constants.ts";
import { loadLocalBisListsState, saveLocalBisListsState } from "./index.ts";

const EMPTY_STATE: LocalBisListsState = {
  schemaVersion: BIS_LISTS_SCHEMA_VERSION,
  entries: {},
};

function writeRawBisListsStorage(value: string): void {
  localStorage.setItem(BIS_LISTS_STORAGE_KEY, value);
}

describe("loadLocalBisListsState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty state when storage key is missing", () => {
    expect(loadLocalBisListsState().state).toEqual(EMPTY_STATE);
  });

  it("returns empty state for invalid JSON", () => {
    writeRawBisListsStorage("{not-json");
    expect(loadLocalBisListsState()).toMatchObject({
      state: EMPTY_STATE,
      loadWarning: LOAD_WARNING_CORRUPTED_SAVE,
    });
  });

  it("returns empty state for wrong schema version", () => {
    writeRawBisListsStorage(JSON.stringify({ schemaVersion: 99, entries: {} }));
    expect(loadLocalBisListsState()).toMatchObject({
      state: EMPTY_STATE,
      loadWarning: LOAD_WARNING_UNSUPPORTED_SAVE,
    });
  });

  it("returns empty state when entries is not an object", () => {
    writeRawBisListsStorage(
      JSON.stringify({ schemaVersion: BIS_LISTS_SCHEMA_VERSION, entries: [] }),
    );
    expect(loadLocalBisListsState().state).toEqual(EMPTY_STATE);
  });

  it("loads a valid persisted state", () => {
    const storageKey = specBisStorageKey(ClassName.DeathKnight, "Unholy");
    const persisted: LocalBisListsState = {
      schemaVersion: BIS_LISTS_SCHEMA_VERSION,
      entries: {
        [storageKey]: {
          selectedPresetId: "local-1",
          presets: [
            {
              id: "local-1",
              name: "Mine",
              slots: [{ slot: 0, itemIds: [51312] }],
            },
          ],
        },
      },
    };
    localStorage.setItem(BIS_LISTS_STORAGE_KEY, JSON.stringify(persisted));
    expect(loadLocalBisListsState().state).toEqual(persisted);
  });

  it("drops malformed entries and presets while keeping valid ones", () => {
    const storageKey = specBisStorageKey(ClassName.DeathKnight, "Unholy");
    writeRawBisListsStorage(
      JSON.stringify({
        schemaVersion: BIS_LISTS_SCHEMA_VERSION,
        entries: {
          [storageKey]: {
            selectedPresetId: "local-1",
            presets: [
              {
                id: "local-1",
                name: "Mine",
                slots: [{ slot: 0, itemIds: [51312, "bad", 0, 51127] }],
              },
              { id: "", name: "Broken", slots: [] },
            ],
          },
          "not-a-key": {
            selectedPresetId: "x",
            presets: [],
          },
        },
      }),
    );

    const { state, loadWarning } = loadLocalBisListsState();
    expect(loadWarning).toBe(LOAD_WARNING_CORRUPTED_SAVE);
    expect(state).toEqual({
      schemaVersion: BIS_LISTS_SCHEMA_VERSION,
      entries: {
        [storageKey]: {
          selectedPresetId: "local-1",
          presets: [
            {
              id: "local-1",
              name: "Mine",
              slots: [{ slot: 0, itemIds: [51312, 51127] }],
            },
          ],
        },
      },
    });
  });
});

describe("saveLocalBisListsState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("round-trips through loadLocalBisListsState", () => {
    const storageKey = specBisStorageKey(ClassName.Warrior, "Arms");
    const state: LocalBisListsState = {
      schemaVersion: BIS_LISTS_SCHEMA_VERSION,
      entries: {
        [storageKey]: {
          selectedPresetId: "local-arms",
          presets: [
            {
              id: "local-arms",
              name: "Arms list",
              slots: [{ slot: 14, itemIds: [49623] }],
            },
          ],
        },
      },
    };

    saveLocalBisListsState(state);
    expect(loadLocalBisListsState().state).toEqual(state);
  });
});
