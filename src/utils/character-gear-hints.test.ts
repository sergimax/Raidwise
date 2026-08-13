import { describe, expect, it } from "vitest";
import { ClassName, Classes } from "../types/characters.ts";
import { DungeonDifficulty } from "../types/dungeons.ts";
import { disciplinePriestBis } from "../data/bis-presets/discipline-priest.ts";
import { unholyDeathKnightBis } from "../data/bis-presets/unholy-death-knight.ts";
import { buildBisSlotMap } from "./bis-lists.ts";
import {
  evaluateCharacterGearHints,
  evaluateCharacterGearHintTints,
  getEffectiveAlsoOwnedItemIds,
  hasAnyGearHint,
  type CharacterGearHints,
} from "./character-gear-hints.ts";
import { getGearHintCellDisplay } from "./gear-upgrade-hint.ts";
import { createTestCharacter, createTestDungeon } from "../test/fixtures.ts";

const emptyTrack = {
  level: 0 as const,
  upgradeSlotCount: 0,
  upgradeSlots: [],
};

const icc25Heroic = createTestDungeon({
  name: "Icecrown Citadel",
  raidKey: "icecrownCitadel",
  size: 25,
  difficulty: DungeonDifficulty.HEROIC,
  itemLevel: [264, 271, 277, 284],
});

const icc25Normal = createTestDungeon({
  name: "Icecrown Citadel",
  raidKey: "icecrownCitadel",
  size: 25,
  difficulty: DungeonDifficulty.NORMAL,
  itemLevel: [251, 258, 264],
});

const deathKnightClass = Classes.find(
  (characterClass) => characterClass.name === ClassName.DeathKnight,
)!;

const priestClass = Classes.find(
  (characterClass) => characterClass.name === ClassName.Priest,
)!;

const unholyBisSlotMap = buildBisSlotMap(unholyDeathKnightBis.presets[0]!);
const disciplineBisSlotMap = buildBisSlotMap(disciplinePriestBis.presets[0]!);

function getUnholyBisSlotMap(className: ClassName, spec: string) {
  if (className === ClassName.DeathKnight && spec === "Unholy") {
    return unholyBisSlotMap;
  }
  return new Map();
}

function getDisciplineBisSlotMap(className: ClassName, spec: string) {
  if (className === ClassName.Priest && spec === "Discipline") {
    return disciplineBisSlotMap;
  }
  return new Map();
}

describe("getEffectiveAlsoOwnedItemIds", () => {
  it("merges explicit also-owned with the other spec's gear ids", () => {
    const character = createTestCharacter({
      class: priestClass,
      mainSpec: {
        spec: "Discipline",
        gearItems: [{ slot: 7, id: 50702 }],
      },
      offSpec: {
        spec: "Shadow",
        gearItems: [{ slot: 7, id: 49978 }],
      },
      alsoOwnedItemIds: [50108],
    });

    expect(getEffectiveAlsoOwnedItemIds(character, "main").sort()).toEqual([
      49978, 50108,
    ]);
    expect(getEffectiveAlsoOwnedItemIds(character, "off").sort()).toEqual([
      50108, 50702,
    ]);
  });

  it("returns empty when neither side contributes ids", () => {
    expect(
      getEffectiveAlsoOwnedItemIds(
        createTestCharacter({
          class: priestClass,
          mainSpec: { spec: "Discipline" },
        }),
        "main",
      ),
    ).toEqual([]);
  });
});

describe("hasAnyGearHint", () => {
  it("returns false for empty hints", () => {
    expect(hasAnyGearHint({})).toBe(false);
  });

  it("returns true when a BiS track is active", () => {
    expect(
      hasAnyGearHint({
        main: {
          specGear: { spec: "Unholy" },
          gearHint: {
            bis: { level: 1, upgradeSlotCount: 1, upgradeSlots: [{ slot: 1 }] },
            bisVariant: emptyTrack,
            ilvl: emptyTrack,
            equippedCount: 8,
            peakDungeonItemLevel: 284,
            slotAware: true,
            bisListActive: true,
          },
          tierSetHint: { tokenNeeds: [] },
          bisBossLootGroups: [],
          bisVariantBossLootGroups: [],
          ilvlBossLootGroups: [],
        },
      }),
    ).toBe(true);
  });

  it("counts tier tokens toward hasAnyGearHint without a cell tint", () => {
    const hints: CharacterGearHints = {
      main: {
        specGear: { spec: "Unholy" },
        gearHint: {
          bis: emptyTrack,
          bisVariant: emptyTrack,
          ilvl: emptyTrack,
          equippedCount: 4,
          peakDungeonItemLevel: 284,
          slotAware: true,
          bisListActive: true,
        },
        tierSetHint: {
          tokenNeeds: [{ tokenItemId: 52028, slot: 0, targetItemId: 51127 }],
        },
        bisBossLootGroups: [],
        bisVariantBossLootGroups: [],
        ilvlBossLootGroups: [],
      },
    };

    expect(hasAnyGearHint(hints)).toBe(true);
    expect(getGearHintCellDisplay(hints.main!.gearHint)).toBeNull();
  });
});

describe("evaluateCharacterGearHintTints", () => {
  it("skips boss loot grouping on the tint path", () => {
    const tints = evaluateCharacterGearHintTints(
      createTestCharacter({
        class: deathKnightClass,
        mainSpec: { spec: "Unholy", gearItems: [{ slot: 1, id: 37646 }] },
      }),
      icc25Heroic,
      getUnholyBisSlotMap,
    );

    expect(tints.main?.gearHint).toBeDefined();
    expect(tints.main).not.toHaveProperty("bisBossLootGroups");
  });
});

describe("evaluateCharacterGearHints", () => {
  it("returns empty hints when the character has no class", () => {
    expect(
      evaluateCharacterGearHints(
        createTestCharacter({ class: undefined }),
        icc25Heroic,
        getUnholyBisSlotMap,
        "en",
      ),
    ).toEqual({});
  });

  it("evaluates main and off specs independently", () => {
    const hints = evaluateCharacterGearHints(
      createTestCharacter({
        class: deathKnightClass,
        mainSpec: { spec: "Unholy" },
        offSpec: { spec: "Blood" },
      }),
      icc25Heroic,
      getUnholyBisSlotMap,
      "en",
    );

    expect(hints.main?.specGear.spec).toBe("Unholy");
    expect(hints.off?.specGear.spec).toBe("Blood");
  });

  it("treats the other spec's gear as owned for BiS variant satisfaction", () => {
    // Shadow already wears normal Crushing Coldwraith Belt (49978).
    // Discipline BiS wants heroic 50613 — ICC 25N should not soft/hint the normal.
    const hints = evaluateCharacterGearHints(
      createTestCharacter({
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
          gearItems: [{ slot: 7, id: 49978 }],
        },
      }),
      icc25Normal,
      getDisciplineBisSlotMap,
      "en",
    );

    const variantItemIds = hints.main?.bisVariantBossLootGroups.flatMap(
      (group) => group.itemIds,
    );
    expect(variantItemIds).not.toContain(49978);
  });
});
