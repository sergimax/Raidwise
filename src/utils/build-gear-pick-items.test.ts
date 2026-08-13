import { describe, expect, it } from "vitest";
import { disciplinePriestBis } from "../data/bis-presets/discipline-priest.ts";
import { retributionPaladinBis } from "../data/bis-presets/retribution-paladin.ts";
import { shadowPriestBis } from "../data/bis-presets/shadow-priest.ts";
import { ClassName, Classes } from "../types/characters.ts";
import { DungeonDifficulty } from "../types/dungeons.ts";
import { createTestCharacter, createTestDungeon } from "../test/fixtures.ts";
import { buildBisSlotMap } from "./bis-lists.ts";
import { buildGearPickItems } from "./build-gear-pick-items.ts";

const paladinClass = Classes.find(
  (characterClass) => characterClass.name === ClassName.Paladin,
)!;

const priestClass = Classes.find(
  (characterClass) => characterClass.name === ClassName.Priest,
)!;

const retributionBisSlotMap = buildBisSlotMap(
  retributionPaladinBis.presets[0]!,
);
const disciplineBisSlotMap = buildBisSlotMap(disciplinePriestBis.presets[0]!);

function getRetributionBisSlotMap(className: ClassName, spec: string) {
  if (className === ClassName.Paladin && spec === "Retribution") {
    return retributionBisSlotMap;
  }
  return new Map();
}

function getDisciplineBisSlotMap(className: ClassName, spec: string) {
  if (className === ClassName.Priest && spec === "Discipline") {
    return disciplineBisSlotMap;
  }
  return new Map();
}

const rubySanctum25Heroic = createTestDungeon({
  name: "The Ruby Sanctum",
  raidKey: "rubySanctum",
  size: 25,
  difficulty: DungeonDifficulty.HEROIC,
  itemLevel: [284],
});

describe("buildGearPickItems", () => {
  it("returns empty when the character has no class", () => {
    expect(
      buildGearPickItems({
        character: createTestCharacter({ class: undefined }),
        specSide: "main",
        dungeons: [rubySanctum25Heroic],
        getBisSlotMapForSpec: getRetributionBisSlotMap,
        locale: "en",
      }),
    ).toEqual([]);
  });

  it("returns empty when the selected spec side is missing", () => {
    expect(
      buildGearPickItems({
        character: createTestCharacter({
          class: paladinClass,
          mainSpec: { spec: "Retribution" },
          offSpec: undefined,
        }),
        specSide: "off",
        dungeons: [rubySanctum25Heroic],
        getBisSlotMapForSpec: getRetributionBisSlotMap,
        locale: "en",
      }),
    ).toEqual([]);
  });

  it("collects BiS upgrades for the selected spec only", () => {
    const character = createTestCharacter({
      class: paladinClass,
      mainSpec: {
        spec: "Retribution",
        gearItems: [
          { slot: 1, id: 37646 },
          { slot: 9, id: 37646 },
          { slot: 11, id: 37646 },
          { slot: 13, id: 37646 },
        ],
      },
      offSpec: {
        spec: "Holy",
        gearItems: [
          { slot: 1, id: 37646 },
          { slot: 9, id: 37646 },
        ],
      },
    });

    const mainItems = buildGearPickItems({
      character,
      specSide: "main",
      dungeons: [rubySanctum25Heroic],
      getBisSlotMapForSpec: getRetributionBisSlotMap,
      locale: "en",
    });

    expect(mainItems.map((item) => item.itemId).sort((left, right) => left - right)).toEqual([
      54576, 54578, 54580, 54581, 54590,
    ]);
    expect(mainItems.every((item) => item.kind === "bis")).toBe(true);
    expect(mainItems.every((item) => item.bossName === "Halion")).toBe(true);

    const offItems = buildGearPickItems({
      character,
      specSide: "off",
      dungeons: [rubySanctum25Heroic],
      getBisSlotMapForSpec: getRetributionBisSlotMap,
      locale: "en",
    });

    // Holy has no BiS map from the stub resolver — selected side only, no main leakage.
    expect(offItems).toEqual([]);
  });

  it("omits BiS variants already equipped on the other spec", () => {
    const icc25Normal = createTestDungeon({
      name: "Icecrown Citadel",
      raidKey: "icecrownCitadel",
      size: 25,
      difficulty: DungeonDifficulty.NORMAL,
      itemLevel: [251, 258, 264],
    });

    const items = buildGearPickItems({
      character: createTestCharacter({
        class: priestClass,
        mainSpec: {
          spec: "Discipline",
          gearItems: [
            { slot: 1, id: 37646 },
            { slot: 7, id: 37646 },
          ],
        },
        offSpec: {
          spec: "Shadow",
          // Normal Crushing Coldwraith Belt — owned on Shadow, BiS heroic on Disc.
          gearItems: [{ slot: 7, id: 49978 }],
        },
      }),
      specSide: "main",
      dungeons: [icc25Normal],
      getBisSlotMapForSpec: getDisciplineBisSlotMap,
      locale: "en",
    });

    expect(items.map((item) => item.itemId)).not.toContain(49978);
    expect(items.map((item) => item.itemId)).not.toContain(50613);
  });

  it("includes empty-slot BiS off-hand for Shadow priest on a 2H staff", () => {
    const shadowBisSlotMap = buildBisSlotMap(shadowPriestBis.presets[0]!);
    const getShadowBisSlotMap = (className: ClassName, spec: string) => {
      if (className === ClassName.Priest && spec === "Shadow") {
        return shadowBisSlotMap;
      }
      return new Map();
    };

    const icc25Heroic = createTestDungeon({
      name: "Icecrown Citadel",
      raidKey: "icecrownCitadel",
      size: 25,
      difficulty: DungeonDifficulty.HEROIC,
      itemLevel: [264, 277],
    });

    const items = buildGearPickItems({
      character: createTestCharacter({
        class: priestClass,
        mainSpec: {
          spec: "Shadow",
          // Archus, Greatstaff of Antonidas — no off-hand.
          gearItems: [{ slot: 14, id: 50731 }],
        },
      }),
      specSide: "main",
      dungeons: [icc25Heroic],
      getBisSlotMapForSpec: getShadowBisSlotMap,
      locale: "en",
    });

    expect(items.map((item) => item.itemId)).toContain(50719);
  });
});
