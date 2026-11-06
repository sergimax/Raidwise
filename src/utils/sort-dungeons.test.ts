import { describe, expect, it } from "vitest";
import { DungeonDifficulty } from "../types/dungeons.ts";
import { defaultSortDirectionForKey, sortDungeons } from "./sort-dungeons.ts";
import { createTestDungeon } from "../test/fixtures.ts";

describe("defaultSortDirectionForKey", () => {
  it("uses desc for item level, completions, and type", () => {
    expect(defaultSortDirectionForKey("itemLevel")).toBe("desc");
    expect(defaultSortDirectionForKey("completions")).toBe("desc");
    expect(defaultSortDirectionForKey("type")).toBe("desc");
  });

  it("uses asc for name", () => {
    expect(defaultSortDirectionForKey("name")).toBe("asc");
  });
});

describe("sortDungeons", () => {
  const dungeons = [
    createTestDungeon({ id: "b", name: "Beta", size: 10 }),
    createTestDungeon({ id: "a", name: "Alpha", size: 25 }),
  ];

  it("sorts by name ascending", () => {
    const sorted = sortDungeons(dungeons, "name", "asc");
    expect(sorted.map((dungeon) => dungeon.name)).toEqual(["Alpha", "Beta"]);
  });

  it("sorts by type descending with 25H before 25 before 10", () => {
    const mixed = [
      createTestDungeon({
        id: "10n",
        name: "ToC10",
        size: 10,
        difficulty: DungeonDifficulty.NORMAL,
      }),
      createTestDungeon({
        id: "25n",
        name: "ICC25",
        size: 25,
        difficulty: DungeonDifficulty.NORMAL,
      }),
      createTestDungeon({
        id: "25h",
        name: "ICC25H",
        size: 25,
        difficulty: DungeonDifficulty.HEROIC,
      }),
    ];
    const sorted = sortDungeons(mixed, "type", "desc");
    expect(sorted.map((dungeon) => dungeon.id)).toEqual(["25h", "25n", "10n"]);
  });

  it("sorts same type by item level descending (higher ilvl first)", () => {
    const mixed = [
      createTestDungeon({
        id: "low",
        name: "ICC",
        size: 25,
        difficulty: DungeonDifficulty.NORMAL,
        itemLevel: [264],
      }),
      createTestDungeon({
        id: "high",
        name: "ICC",
        size: 25,
        difficulty: DungeonDifficulty.NORMAL,
        itemLevel: [277],
      }),
    ];
    const sorted = sortDungeons(mixed, "type", "desc");
    expect(sorted.map((dungeon) => dungeon.id)).toEqual(["high", "low"]);
  });

  it("sorts by item level using starting tier", () => {
    const mixed = [
      createTestDungeon({ id: "low", name: "Low", itemLevel: [200] }),
      createTestDungeon({ id: "high", name: "High", itemLevel: [264, 277] }),
    ];
    const sorted = sortDungeons(mixed, "itemLevel", "desc");
    expect(sorted.map((dungeon) => dungeon.id)).toEqual(["high", "low"]);
  });

  it("sorts by completion counts", () => {
    const mixed = [
      createTestDungeon({ id: "few", name: "Few" }),
      createTestDungeon({ id: "many", name: "Many" }),
    ];
    const sorted = sortDungeons(mixed, "completions", "desc", {
      few: 1,
      many: 3,
    });
    expect(sorted.map((dungeon) => dungeon.id)).toEqual(["many", "few"]);
  });
});
