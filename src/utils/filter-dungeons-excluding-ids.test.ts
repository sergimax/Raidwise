import { describe, expect, it } from "vitest";
import { createTestDungeon } from "../test/fixtures.ts";
import {
  filterDungeonsExcludingIds,
  toggleDungeonIdExclusion,
} from "./filter-dungeons-excluding-ids.ts";

describe("filterDungeonsExcludingIds", () => {
  const dungeons = [
    createTestDungeon({ id: "a", name: "A" }),
    createTestDungeon({ id: "b", name: "B" }),
    createTestDungeon({ id: "c", name: "C" }),
  ];

  it("returns a copy when nothing is excluded", () => {
    const result = filterDungeonsExcludingIds(dungeons, new Set());
    expect(result).toEqual(dungeons);
    expect(result).not.toBe(dungeons);
  });

  it("drops excluded dungeon ids", () => {
    expect(filterDungeonsExcludingIds(dungeons, new Set(["b"]))).toEqual([
      dungeons[0],
      dungeons[2],
    ]);
  });
});

describe("toggleDungeonIdExclusion", () => {
  it("adds and removes dungeon ids", () => {
    const withB = toggleDungeonIdExclusion(new Set(), "b");
    expect([...withB]).toEqual(["b"]);
    expect([...toggleDungeonIdExclusion(withB, "b")]).toEqual([]);
  });
});
