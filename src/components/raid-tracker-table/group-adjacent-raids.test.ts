import { describe, expect, it } from "vitest";
import type { DungeonRecord } from "../../types/dungeons.ts";
import { groupAdjacentRaids } from "./group-adjacent-raids.ts";

function dungeon(id: string, raidKey?: DungeonRecord["raidKey"]): DungeonRecord {
  return {
    id,
    name: id,
    size: 10,
    itemLevel: [200],
    difficulty: "Normal",
    raidKey,
  };
}

describe("groupAdjacentRaids", () => {
  it("groups neighboring raid variants without joining separated or custom rows", () => {
    const rows = [
      dungeon("icc-10", "icecrownCitadel"),
      dungeon("icc-25", "icecrownCitadel"),
      dungeon("custom-a"),
      dungeon("custom-b"),
      dungeon("icc-heroic", "icecrownCitadel"),
      dungeon("rs-10", "rubySanctum"),
      dungeon("rs-25", "rubySanctum"),
    ];

    expect(groupAdjacentRaids(rows).map((group) => group.dungeons.map((row) => row.id))).toEqual([
      ["icc-10", "icc-25"],
      ["custom-a"],
      ["custom-b"],
      ["icc-heroic"],
      ["rs-10", "rs-25"],
    ]);
  });

  it("starts a new background after four adjacent variants of one raid", () => {
    const rows = Array.from({ length: 9 }, (_, index) =>
      dungeon(`icc-${index}`, "icecrownCitadel"),
    );

    expect(groupAdjacentRaids(rows).map((group) => group.dungeons.length)).toEqual([
      4, 4, 1,
    ]);
  });
});
