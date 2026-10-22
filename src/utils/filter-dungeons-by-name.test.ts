import { describe, expect, it } from "vitest";
import { RaidNames } from "../data/raid-names.ts";
import { DungeonDifficulty } from "../types/dungeons.ts";
import { filterDungeonsByName } from "./filter-dungeons-by-name.ts";
import { createTestDungeon } from "../test/fixtures.ts";

describe("filterDungeonsByName", () => {
  const dungeons = [
    createTestDungeon({ name: "Icecrown Citadel", shortName: "ICC" }),
    createTestDungeon({ name: "Ulduar", shortName: "Uld" }),
  ];

  const russianIccDungeon = createTestDungeon({
    name: "Цитадель Ледяной Короны",
    shortName: "ЦЛК",
    raidKey: "icecrownCitadel",
  });

  const iccRaids = [
    createTestDungeon({
      id: "icc-10",
      shortName: "ICC",
      raidKey: "icecrownCitadel",
      size: 10,
      difficulty: DungeonDifficulty.NORMAL,
    }),
    createTestDungeon({
      id: "icc-10h",
      shortName: "ICC",
      raidKey: "icecrownCitadel",
      size: 10,
      difficulty: DungeonDifficulty.HEROIC,
    }),
    createTestDungeon({
      id: "icc-25",
      shortName: "ICC",
      raidKey: "icecrownCitadel",
      size: 25,
      difficulty: DungeonDifficulty.NORMAL,
    }),
    createTestDungeon({
      id: "icc-25h",
      shortName: "ICC",
      raidKey: "icecrownCitadel",
      size: 25,
      difficulty: DungeonDifficulty.HEROIC,
    }),
  ];

  const tocRaids = [
    createTestDungeon({
      id: "toc-10",
      name: RaidNames.trialOfTheCrusader.ru,
      shortName: RaidNames.trialOfTheCrusader.shortRu,
      raidKey: "trialOfTheCrusader",
      size: 10,
      difficulty: DungeonDifficulty.NORMAL,
    }),
    createTestDungeon({
      id: "togc-10",
      name: RaidNames.trialOfTheCrusader.heroic.ru,
      shortName: RaidNames.trialOfTheCrusader.heroic.shortRu,
      raidKey: "trialOfTheCrusader",
      size: 10,
      difficulty: DungeonDifficulty.HEROIC,
    }),
    createTestDungeon({
      id: "toc-25",
      name: RaidNames.trialOfTheCrusader.ru,
      shortName: RaidNames.trialOfTheCrusader.shortRu,
      raidKey: "trialOfTheCrusader",
      size: 25,
      difficulty: DungeonDifficulty.NORMAL,
    }),
    createTestDungeon({
      id: "togc-25",
      name: RaidNames.trialOfTheCrusader.heroic.ru,
      shortName: RaidNames.trialOfTheCrusader.heroic.shortRu,
      raidKey: "trialOfTheCrusader",
      size: 25,
      difficulty: DungeonDifficulty.HEROIC,
    }),
  ];

  it("returns full list when query is empty", () => {
    expect(filterDungeonsByName(dungeons, "")).toEqual(dungeons);
    expect(filterDungeonsByName(dungeons, "   ")).toEqual(dungeons);
  });

  it("matches full dungeon name", () => {
    expect(filterDungeonsByName(dungeons, "icecrown")).toEqual([dungeons[0]]);
  });

  it("matches short name", () => {
    expect(filterDungeonsByName(dungeons, "uld")).toEqual([dungeons[1]]);
  });

  it("matches English name when dungeon is stored with Russian labels", () => {
    expect(filterDungeonsByName([russianIccDungeon], "icecrown")).toEqual([
      russianIccDungeon,
    ]);
  });

  it("matches English short name when dungeon is stored with Russian labels", () => {
    expect(filterDungeonsByName([russianIccDungeon], "icc")).toEqual([
      russianIccDungeon,
    ]);
  });

  it("matches Russian short name for template raid", () => {
    expect(filterDungeonsByName([russianIccDungeon], "цлк")).toEqual([
      russianIccDungeon,
    ]);
  });

  it("matches all raids for a short name query", () => {
    expect(filterDungeonsByName(iccRaids, "ICC")).toEqual(iccRaids);
  });

  it("filters by short name and size", () => {
    expect(filterDungeonsByName(iccRaids, "ICC25")).toEqual([
      iccRaids[2],
      iccRaids[3],
    ]);
    expect(filterDungeonsByName(iccRaids, "ICC10")).toEqual([
      iccRaids[0],
      iccRaids[1],
    ]);
  });

  it("filters by short name, size, and mode suffix", () => {
    expect(filterDungeonsByName(iccRaids, "ICC25H")).toEqual([iccRaids[3]]);
    expect(filterDungeonsByName(iccRaids, "ICC25h")).toEqual([iccRaids[3]]);
    expect(filterDungeonsByName(iccRaids, "ICC10H")).toEqual([iccRaids[1]]);
    expect(filterDungeonsByName(iccRaids, "ICC25N")).toEqual([iccRaids[2]]);
    expect(filterDungeonsByName(iccRaids, "ICC25n")).toEqual([iccRaids[2]]);
    expect(filterDungeonsByName(iccRaids, "ICC10n")).toEqual([iccRaids[0]]);
  });

  it("filters Russian rows with Cyrillic mode suffixes", () => {
    const russianIccRaids = iccRaids.map((dungeon) =>
      createTestDungeon({
        ...dungeon,
        name: RaidNames.icecrownCitadel.ru,
        shortName: RaidNames.icecrownCitadel.shortRu,
      }),
    );
    expect(filterDungeonsByName(russianIccRaids, "ЦЛК25хм")).toEqual([
      russianIccRaids[3],
    ]);
    expect(filterDungeonsByName(russianIccRaids, "цлк25х")).toEqual([
      russianIccRaids[3],
    ]);
    expect(filterDungeonsByName(russianIccRaids, "ЦЛК25об")).toEqual([
      russianIccRaids[2],
    ]);
    expect(filterDungeonsByName(russianIccRaids, "цлк25об")).toEqual([
      russianIccRaids[2],
    ]);
  });

  it("keeps both Crusader modes for ИК and only heroic for ИВК", () => {
    expect(filterDungeonsByName(tocRaids, "ИК")).toEqual(tocRaids);
    expect(filterDungeonsByName(tocRaids, "ИВК")).toEqual([
      tocRaids[1],
      tocRaids[3],
    ]);
    expect(filterDungeonsByName(tocRaids, "ИВК10")).toEqual([tocRaids[1]]);
  });
});
