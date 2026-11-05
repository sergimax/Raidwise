import { describe, expect, it } from "vitest";
import {
  flipCooldown,
  hasAnyCooldownOn,
  isCooldownOn,
  pruneToggles,
  removeCharacterFromToggles,
  removeDungeonFromToggles,
  resetCharacterToggles,
} from "./dungeon-toggles.ts";
import { createTestToggles } from "../test/fixtures.ts";

describe("isCooldownOn", () => {
  it("returns false when toggle is missing", () => {
    expect(isCooldownOn({}, "character-1", "dungeon-1")).toBe(false);
  });

  it("returns stored toggle value", () => {
    const toggles = createTestToggles([
      { characterId: "character-1", dungeonId: "dungeon-1", on: true },
    ]);
    expect(isCooldownOn(toggles, "character-1", "dungeon-1")).toBe(true);
  });
});

describe("flipCooldown", () => {
  it("toggles off to on without mutating input", () => {
    const toggles = createTestToggles([
      { characterId: "character-1", dungeonId: "dungeon-1", on: false },
    ]);
    const next = flipCooldown(toggles, "character-1", "dungeon-1");
    expect(next).not.toBe(toggles);
    expect(isCooldownOn(next, "character-1", "dungeon-1")).toBe(true);
    expect(isCooldownOn(toggles, "character-1", "dungeon-1")).toBe(false);
  });

  it("creates character entry when missing", () => {
    const next = flipCooldown({}, "character-1", "dungeon-1");
    expect(isCooldownOn(next, "character-1", "dungeon-1")).toBe(true);
  });
});

describe("removeCharacterFromToggles", () => {
  it("removes character key", () => {
    const toggles = createTestToggles([
      { characterId: "character-1", dungeonId: "dungeon-1" },
      { characterId: "character-2", dungeonId: "dungeon-1" },
    ]);
    const next = removeCharacterFromToggles(toggles, "character-1");
    expect(next).toEqual({
      "character-2": { "dungeon-1": true },
    });
  });
});

describe("removeDungeonFromToggles", () => {
  it("removes dungeon from all characters", () => {
    const toggles = createTestToggles([
      { characterId: "character-1", dungeonId: "dungeon-1" },
      { characterId: "character-1", dungeonId: "dungeon-2" },
      { characterId: "character-2", dungeonId: "dungeon-1" },
    ]);
    const next = removeDungeonFromToggles(toggles, "dungeon-1");
    expect(next).toEqual({
      "character-1": { "dungeon-2": true },
      "character-2": {},
    });
  });
});

describe("resetCharacterToggles", () => {
  it("clears toggles for one character", () => {
    const toggles = createTestToggles([
      { characterId: "character-1", dungeonId: "dungeon-1" },
      { characterId: "character-2", dungeonId: "dungeon-1" },
    ]);
    const next = resetCharacterToggles(toggles, "character-1");
    expect(next).toEqual({
      "character-1": {},
      "character-2": { "dungeon-1": true },
    });
  });
});

describe("hasAnyCooldownOn", () => {
  it("returns false when all toggles are off or empty", () => {
    expect(hasAnyCooldownOn({})).toBe(false);
    expect(
      hasAnyCooldownOn({
        "character-1": { "dungeon-1": false },
      }),
    ).toBe(false);
  });

  it("returns true when any toggle is on", () => {
    const toggles = createTestToggles([
      { characterId: "character-1", dungeonId: "dungeon-1", on: true },
    ]);
    expect(hasAnyCooldownOn(toggles)).toBe(true);
  });
});

describe("pruneToggles", () => {
  const dungeonIds = new Set(["dungeon-1", "dungeon-2"]);
  const characterIds = new Set(["character-1"]);

  it("drops unknown dungeon and character IDs", () => {
    const toggles = {
      "character-1": { "dungeon-1": true, "dungeon-3": true },
      "character-2": { "dungeon-1": true },
    };
    const pruned = pruneToggles(toggles, { characterIds, dungeonIds });
    expect(pruned).toEqual({
      "character-1": { "dungeon-1": true },
    });
  });

  it("ignores non-boolean values", () => {
    const toggles = {
      "character-1": {
        "dungeon-1": true,
        "dungeon-2": "yes" as unknown as boolean,
      },
    };
    const pruned = pruneToggles(toggles, {
      dungeonIds,
    });
    expect(pruned).toEqual({
      "character-1": { "dungeon-1": true },
    });
  });

  it("omits empty character entries when omitEmptyCharacters is true", () => {
    const toggles = {
      "character-1": { "dungeon-3": true },
      "character-2": { "dungeon-1": true },
    };
    const pruned = pruneToggles(toggles, {
      dungeonIds,
      omitEmptyCharacters: true,
    });
    expect(pruned).toEqual({
      "character-2": { "dungeon-1": true },
    });
  });
});
