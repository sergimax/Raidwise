import { describe, expect, it } from "vitest";
import { ClassName, Classes } from "../types/characters.ts";
import { DungeonDifficulty } from "../types/dungeons.ts";
import { unholyDeathKnightBis } from "../data/bis-presets/unholy-death-knight.ts";
import { retributionPaladinBis } from "../data/bis-presets/retribution-paladin.ts";
import { createTestCharacter, createTestDungeon } from "../test/fixtures.ts";
import { testTranslator } from "../test/i18n.ts";
import { evaluateCharacterGearHints } from "./character-gear-hints.ts";
import { buildBisSlotMap } from "./bis-lists.ts";
import {
  evaluateGearUpgradeHint,
  collectMissingIlvlLootItemIds,
  formatGearUpgradeHintTooltip,
  getDungeonPeakItemLevel,
  getGearHintCellDisplay,
  type GearUpgradeHintTrack,
} from "./gear-upgrade-hint.ts";
import { getGearHintCellBackgroundColor } from "./gear-hint-display.ts";
import { createAppTheme } from "../theme/create-app-theme.ts";
import { parseWowSimsExporterJson } from "./parse-wowsims-exporter.ts";

const RHEE_EXPORT = JSON.stringify({
  class: "shaman",
  gear: {
    items: [
      { id: 51197 },
      { id: 50452 },
      { id: 51199 },
      { id: 49998 },
      { id: 51195 },
      { id: 53126 },
      { id: 50831 },
      { id: 50993 },
      { id: 51198 },
      { id: 53127 },
      { id: 50604 },
      { id: 50402 },
      { id: 50362 },
      { id: 50355 },
      { id: 50426 },
      { id: 50016 },
      { id: 50458 },
    ],
  },
});

const emptyTrack: GearUpgradeHintTrack = {
  level: 0,
  upgradeSlotCount: 0,
  upgradeSlots: [],
};

describe("getDungeonPeakItemLevel", () => {
  it("returns the highest ilvl in the dungeon row", () => {
    expect(getDungeonPeakItemLevel([264, 271])).toBe(271);
    expect(getDungeonPeakItemLevel([284])).toBe(284);
  });
});

describe("getGearHintCellDisplay", () => {
  it("prefers BiS tint when both BiS and ilvl tracks are active", () => {
    expect(
      getGearHintCellDisplay({
        bis: { level: 2, upgradeSlotCount: 1, upgradeSlots: [{ slot: 1 }] },
        bisVariant: emptyTrack,
        ilvl: { level: 3, upgradeSlotCount: 5, upgradeSlots: [] },
        equippedCount: 10,
        peakDungeonItemLevel: 284,
        slotAware: true,
        bisListActive: true,
      }),
    ).toEqual({ kind: "bis", level: 2 });
  });

  it("uses BiS variant track level for cell tint", () => {
    expect(
      getGearHintCellDisplay({
        bis: emptyTrack,
        bisVariant: { level: 2, upgradeSlotCount: 1, upgradeSlots: [{ slot: 7 }] },
        ilvl: emptyTrack,
        equippedCount: 10,
        peakDungeonItemLevel: 264,
        slotAware: true,
        bisListActive: true,
      }),
    ).toEqual({ kind: "bis", level: 2 });
  });

  it("falls back to ilvl tint when BiS list is inactive", () => {
    expect(
      getGearHintCellDisplay({
        bis: emptyTrack,
        bisVariant: emptyTrack,
        ilvl: { level: 2, upgradeSlotCount: 3, upgradeSlots: [] },
        equippedCount: 10,
        peakDungeonItemLevel: 284,
        slotAware: true,
        bisListActive: false,
      }),
    ).toEqual({ kind: "ilvl", level: 2 });
  });
});

describe("evaluateGearUpgradeHint", () => {
  it("returns no hint when the character has no imported gear", () => {
    expect(
      evaluateGearUpgradeHint(undefined, {
        name: "Цитадель Ледяной Короны",
        raidKey: "icecrownCitadel",
        itemLevel: [277, 284],
      }),
    ).toEqual({
      bis: emptyTrack,
      bisVariant: emptyTrack,
      ilvl: emptyTrack,
      equippedCount: 0,
      peakDungeonItemLevel: 284,
      slotAware: false,
      bisListActive: false,
    });
  });

  it("returns no hint when all gear meets the dungeon peak ilvl", () => {
    expect(
      evaluateGearUpgradeHint([{ slot: 0, id: 51197 }], {
        name: "Цитадель Ледяной Короны",
        raidKey: "icecrownCitadel",
        itemLevel: [264, 264],
      }),
    ).toEqual({
      bis: emptyTrack,
      bisVariant: emptyTrack,
      ilvl: emptyTrack,
      equippedCount: 1,
      peakDungeonItemLevel: 264,
      slotAware: true,
      bisListActive: false,
    });
  });

  it("flags high upgrade potential for BiS-ish gear vs top-tier raids", () => {
    const parsed = parseWowSimsExporterJson(RHEE_EXPORT, ClassName.Shaman);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }

    const iccHint = evaluateGearUpgradeHint(parsed.gearItems, {
      name: "Цитадель Ледяной Короны",
      raidKey: "icecrownCitadel",
      itemLevel: [277, 284],
    });
    expect(iccHint.slotAware).toBe(true);
    expect(iccHint.ilvl.upgradeSlotCount).toBeGreaterThan(0);
    expect(iccHint.ilvl.level).toBeGreaterThanOrEqual(2);

    const naxxHint = evaluateGearUpgradeHint(parsed.gearItems, {
      name: "Наксрамас",
      raidKey: "naxxramas",
      itemLevel: [213],
    });
    expect(naxxHint.ilvl.level).toBe(0);
  });

  it("does not treat weapon slots as upgradeable in Ruby Sanctum", () => {
    const parsed = parseWowSimsExporterJson(RHEE_EXPORT, ClassName.Shaman);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }

    const rsHint = evaluateGearUpgradeHint(parsed.gearItems, {
      name: "Рубиновое святилище",
      raidKey: "rubySanctum",
      itemLevel: [284],
    });

    expect(rsHint.slotAware).toBe(true);
    expect(rsHint.ilvl.upgradeSlots.some((slotHint) => slotHint.slot === 14)).toBe(
      false,
    );
    expect(rsHint.ilvl.upgradeSlots.some((slotHint) => slotHint.slot === 15)).toBe(
      false,
    );
    expect(rsHint.ilvl.upgradeSlotCount).toBeGreaterThan(0);
  });

  it("filters BiS track to BiS items while keeping ilvl track separate", () => {
    const priestNeckOnly = buildBisSlotMap({
      id: "local-priest",
      name: "Shadow priest",
      slots: [{ slot: 1, itemIds: [50647] }],
    });

    const rsHint = evaluateGearUpgradeHint(
      [{ slot: 1, id: 50452 }],
      {
        name: "Рубиновое святилище",
        raidKey: "rubySanctum",
        itemLevel: [284],
      },
      priestNeckOnly,
    );

    expect(rsHint.bisListActive).toBe(true);
    expect(rsHint.bis.upgradeSlotCount).toBe(0);
    expect(rsHint.ilvl.upgradeSlotCount).toBeGreaterThan(0);
  });

  it("uses BiS targets for Unholy DK neck upgrades in Ruby Sanctum", () => {
    const unholyBis = buildBisSlotMap(unholyDeathKnightBis.presets[0]);
    const rsHint = evaluateGearUpgradeHint(
      [{ slot: 1, id: 50452 }],
      {
        name: "Рубиновое святилище",
        raidKey: "rubySanctum",
        itemLevel: [284],
      },
      unholyBis,
    );

    expect(rsHint.bisListActive).toBe(true);
    expect(rsHint.bis.upgradeSlotCount).toBe(1);
    expect(rsHint.bis.upgradeSlots[0]?.bestLootItemId).toBe(54581);
  });

  it("does not flag BiS trinkets missing when equipped in the swapped trinket slot", () => {
    const unholyBis = buildBisSlotMap(unholyDeathKnightBis.presets[0]);
    const rsHint = evaluateGearUpgradeHint(
      [
        { slot: 12, id: 54590 },
        { slot: 13, id: 50363 },
      ],
      {
        name: "The Ruby Sanctum",
        raidKey: "rubySanctum",
        size: 25,
        difficulty: DungeonDifficulty.HEROIC,
        itemLevel: [284],
      },
      unholyBis,
    );

    expect(rsHint.bis.upgradeSlots.some((slotHint) => slotHint.bestLootItemId === 54590)).toBe(
      false,
    );
    expect(rsHint.bis.upgradeSlots.some((slotHint) => slotHint.bestLootItemId === 50363)).toBe(
      false,
    );
  });

  it("does not flag BiS rings missing when equipped in the swapped finger slot", () => {
    const unholyBis = buildBisSlotMap(unholyDeathKnightBis.presets[0]);
    const iccHint = evaluateGearUpgradeHint(
      [
        { slot: 10, id: 50657 },
        { slot: 11, id: 52572 },
      ],
      {
        name: "ICC25 HM",
        raidKey: "icecrownCitadel",
        size: 25,
        difficulty: DungeonDifficulty.HEROIC,
        itemLevel: [277, 284],
      },
      unholyBis,
    );

    expect(iccHint.bis.upgradeSlots.some((slotHint) => slotHint.bestLootItemId === 52572)).toBe(
      false,
    );
    expect(iccHint.bis.upgradeSlots.some((slotHint) => slotHint.bestLootItemId === 50657)).toBe(
      false,
    );
  });

  it("flags missing BiS targets even when equipped gear is higher ilvl", () => {
    const bryntrollBis = buildBisSlotMap({
      id: "local-uhdk-bryn",
      name: "with bryn",
      slots: [{ slot: 14, itemIds: [50709] }],
    });

    const iccHint = evaluateGearUpgradeHint(
      [{ slot: 14, id: 49623 }],
      {
        name: "ICC25 HM",
        raidKey: "icecrownCitadel",
        itemLevel: [277, 284],
      },
      bryntrollBis,
    );

    expect(iccHint.bisListActive).toBe(true);
    expect(iccHint.bis.upgradeSlotCount).toBe(1);
    expect(iccHint.bis.upgradeSlots[0]?.bestLootItemId).toBe(50709);
  });

  it("does not flag a slot when equipped gear matches the active BiS list", () => {
    const shadowmourneBis = buildBisSlotMap({
      id: "default",
      name: "Default",
      slots: [{ slot: 14, itemIds: [49623] }],
    });

    const iccHint = evaluateGearUpgradeHint(
      [{ slot: 14, id: 49623 }],
      {
        name: "ICC25 HM",
        raidKey: "icecrownCitadel",
        itemLevel: [277, 284],
      },
      shadowmourneBis,
    );

    expect(iccHint.bisListActive).toBe(true);
    expect(iccHint.bis.upgradeSlotCount).toBe(0);
  });

  it("falls back to ilvl-only hints for custom dungeons without raid loot", () => {
    const hint = evaluateGearUpgradeHint([{ slot: 14, id: 50426 }], {
      name: "Custom dungeon",
      itemLevel: [300],
    });

    expect(hint.slotAware).toBe(false);
    expect(hint.ilvl.upgradeSlotCount).toBe(1);
  });

  it("resolves raid loot from the Russian dungeon name when raidKey is missing", () => {
    const dungeon = createTestDungeon({
      name: "Рубиновое святилище",
      itemLevel: [284],
      difficulty: DungeonDifficulty.HEROIC,
    });

    const hint = evaluateGearUpgradeHint([{ slot: 14, id: 50426 }], dungeon);
    expect(hint.slotAware).toBe(true);
    expect(hint.ilvl.upgradeSlotCount).toBe(0);
  });

  it("does not suggest crossbow ranged upgrades for priests", () => {
    const hint = evaluateGearUpgradeHint(
      [{ slot: 16, id: 50033 }],
      {
        name: "ICC25 HM",
        raidKey: "icecrownCitadel",
        itemLevel: [277, 284],
      },
      undefined,
      { className: ClassName.Priest, spec: "Shadow" },
    );

    const rangedHint = hint.ilvl.upgradeSlots.find((slotHint) => slotHint.slot === 16);
    expect(rangedHint?.bestLootItemId).not.toBe(49981);
    expect(rangedHint?.bestLootItemId).not.toBe(50733);
  });

  it("flags BiS heroic belt on ICC25H when equipped belt is 264", () => {
    const bisSlotMap = buildBisSlotMap(retributionPaladinBis.presets[0]);
    const equipContext = { className: ClassName.Paladin, spec: "Retribution" };

    const hint = evaluateGearUpgradeHint(
      [{ slot: 7, id: 50995 }],
      {
        name: "ICC25H",
        raidKey: "icecrownCitadel",
        itemLevel: [277, 284],
      },
      bisSlotMap,
      equipContext,
    );

    expect(hint.bis.upgradeSlotCount).toBe(1);
    expect(hint.bis.upgradeSlots[0]?.bestLootItemId).toBe(50707);
  });

  it("treats also-owned BiS items as satisfying exact BiS targets", () => {
    const bisSlotMap = buildBisSlotMap(retributionPaladinBis.presets[0]);
    const equipContext = { className: ClassName.Paladin, spec: "Retribution" };

    const hint = evaluateGearUpgradeHint(
      [{ slot: 7, id: 50995 }],
      {
        name: "ICC25H",
        raidKey: "icecrownCitadel",
        itemLevel: [277, 284],
      },
      bisSlotMap,
      equipContext,
      [50707],
    );

    expect(hint.bis.upgradeSlotCount).toBe(0);
  });

  it("flags BiS normal belt variant on ICC25N when equipped belt is below tier", () => {
    const bisSlotMap = buildBisSlotMap(retributionPaladinBis.presets[0]);
    const equipContext = { className: ClassName.Paladin, spec: "Retribution" };

    const hint = evaluateGearUpgradeHint(
      [{ slot: 7, id: 50778 }],
      {
        name: "ICC25N",
        raidKey: "icecrownCitadel",
        itemLevel: [264],
      },
      bisSlotMap,
      equipContext,
    );

    expect(hint.bis.upgradeSlotCount).toBe(0);
    expect(hint.bisVariant.upgradeSlotCount).toBe(1);
    expect(hint.bisVariant.upgradeSlots[0]?.bestLootItemId).toBe(50067);
    expect(
      hint.ilvl.upgradeSlots.find((slotHint) => slotHint.slot === 7)?.bestLootItemId,
    ).not.toBe(50067);
  });

  it("does not flag belt when the normal BiS name variant is already equipped", () => {
    const bisSlotMap = buildBisSlotMap(retributionPaladinBis.presets[0]);
    const equipContext = { className: ClassName.Paladin, spec: "Retribution" };

    const hint = evaluateGearUpgradeHint(
      [{ slot: 7, id: 50067 }],
      {
        name: "ICC25N",
        raidKey: "icecrownCitadel",
        itemLevel: [264],
      },
      bisSlotMap,
      equipContext,
    );

    expect(hint.bis.upgradeSlotCount).toBe(0);
    expect(hint.bisVariant.upgradeSlotCount).toBe(0);
  });

  it("flags same-ilvl BiS normal variant when heroic id is on the list", () => {
    const bisSlotMap = buildBisSlotMap(retributionPaladinBis.presets[0]);
    const equipContext = { className: ClassName.Paladin, spec: "Retribution" };

    const hint = evaluateGearUpgradeHint(
      [{ slot: 7, id: 50995 }],
      {
        name: "ICC25N",
        raidKey: "icecrownCitadel",
        itemLevel: [264],
      },
      bisSlotMap,
      equipContext,
    );

    expect(hint.bis.upgradeSlotCount).toBe(0);
    expect(hint.bisVariant.upgradeSlotCount).toBe(1);
    expect(hint.bisVariant.upgradeSlots[0]?.bestLootItemId).toBe(50067);
  });

  it("excludes BiS loot from generic ilvl upgrade track", () => {
    const bisSlotMap = buildBisSlotMap(retributionPaladinBis.presets[0]);
    const equipContext = { className: ClassName.Paladin, spec: "Retribution" };

    const hint = evaluateGearUpgradeHint(
      [{ slot: 7, id: 50778 }],
      {
        name: "ICC25N",
        raidKey: "icecrownCitadel",
        itemLevel: [264],
      },
      bisSlotMap,
      equipContext,
    );

    expect(
      hint.ilvl.upgradeSlots.find((slotHint) => slotHint.slot === 7)?.bestLootItemId,
    ).not.toBe(50067);
  });

  it("does not suggest agility hunter helm for Elemental Shaman", () => {
    const hint = evaluateGearUpgradeHint(
      [{ slot: 0, id: 51247 }],
      {
        name: "ICC25H",
        raidKey: "icecrownCitadel",
        itemLevel: [277, 284],
      },
      undefined,
      { className: ClassName.Shaman, spec: "Elemental" },
    );

    const headUpgrade = hint.ilvl.upgradeSlots.find((slotHint) => slotHint.slot === 0);
    expect(headUpgrade?.bestLootItemId).not.toBe(47718);
    expect(headUpgrade?.bestLootItemId).not.toBe(47942);
  });

  it("does not suggest spirit priest cloak for Restoration Shaman", () => {
    const hint = evaluateGearUpgradeHint(
      [{ slot: 3, id: 54583 }],
      {
        name: "ICC25H",
        raidKey: "icecrownCitadel",
        itemLevel: [277, 284],
      },
      undefined,
      { className: ClassName.Shaman, spec: "Restoration" },
    );

    const cloakUpgrade = hint.ilvl.upgradeSlots.find((slotHint) => slotHint.slot === 3);
    expect(cloakUpgrade?.bestLootItemId).not.toBe(46976);
    expect(cloakUpgrade?.bestLootItemId).not.toBe(46977);
  });

  it("does not suggest priest off-hand for Restoration Shaman", () => {
    const hint = evaluateGearUpgradeHint(
      [{ slot: 15, id: 50616 }],
      {
        name: "ICC25H",
        raidKey: "icecrownCitadel",
        itemLevel: [277, 284],
      },
      undefined,
      { className: ClassName.Shaman, spec: "Restoration" },
    );

    const offHandUpgrade = hint.ilvl.upgradeSlots.find(
      (slotHint) => slotHint.slot === 15,
    );
    expect(offHandUpgrade?.bestLootItemId).not.toBe(47053);
    expect(offHandUpgrade?.bestLootItemId).not.toBe(47064);
  });

  it("does not suggest Ruby Sanctum DPS loot for Protection Warrior ilvl hints", () => {
    const equipContext = { className: ClassName.Warrior, spec: "Protection" };

    const rs25NormalHint = evaluateGearUpgradeHint(
      [{ slot: 1, id: 37646 }],
      {
        name: "РС 25",
        raidKey: "rubySanctum",
        size: 25,
        difficulty: DungeonDifficulty.NORMAL,
        itemLevel: [271],
      },
      undefined,
      equipContext,
    );
    expect(
      rs25NormalHint.ilvl.upgradeSlots.find((slotHint) => slotHint.slot === 1)
        ?.bestLootItemId,
    ).not.toBe(54557);

    const rs10HeroicHint = evaluateGearUpgradeHint(
      [{ slot: 5, id: 37646 }],
      {
        name: "РС 10 ХМ",
        raidKey: "rubySanctum",
        size: 10,
        difficulty: DungeonDifficulty.HEROIC,
        itemLevel: [271],
      },
      undefined,
      equipContext,
    );
    expect(
      rs10HeroicHint.ilvl.upgradeSlots.find((slotHint) => slotHint.slot === 5)
        ?.bestLootItemId,
    ).not.toBe(53126);
    expect(
      rs10HeroicHint.ilvl.upgradeSlots.find((slotHint) => slotHint.slot === 5)
        ?.bestLootItemId,
    ).not.toBe(53134);

    const rs10NormalHint = evaluateGearUpgradeHint(
      [
        { slot: 1, id: 37646 },
        { slot: 5, id: 37646 },
        { slot: 10, id: 37646 },
      ],
      {
        name: "РС 10",
        raidKey: "rubySanctum",
        size: 10,
        difficulty: DungeonDifficulty.NORMAL,
        itemLevel: [258],
      },
      undefined,
      equipContext,
    );
    const rs10NormalLootIds = collectMissingIlvlLootItemIds(rs10NormalHint);
    expect(rs10NormalLootIds).not.toContain(53103);
    expect(rs10NormalLootIds).not.toContain(53110);
    expect(rs10NormalLootIds).not.toContain(53112);
  });

  it("separates Ruby Sanctum 10H and 25N loot at the same item level", () => {
    const equipContext = { className: ClassName.Warrior, spec: "Fury" };
    const gearItems = [{ slot: 5, id: 37646 }];

    const rs10HeroicHint = evaluateGearUpgradeHint(
      gearItems,
      {
        name: "RS 10H",
        raidKey: "rubySanctum",
        size: 10,
        difficulty: DungeonDifficulty.HEROIC,
        itemLevel: [271],
      },
      undefined,
      equipContext,
    );
    expect(rs10HeroicHint.ilvl.upgradeSlots[0]?.bestLootItemId).toBe(54559);

    const rs25NormalHint = evaluateGearUpgradeHint(
      gearItems,
      {
        name: "RS 25",
        raidKey: "rubySanctum",
        size: 25,
        difficulty: DungeonDifficulty.NORMAL,
        itemLevel: [271],
      },
      undefined,
      equipContext,
    );
    expect(rs25NormalHint.ilvl.upgradeSlots[0]?.bestLootItemId).toBe(53126);
  });

  it("groups Ruby Sanctum 25H BiS loot by boss in gear hint tooltips", () => {
    const dungeon = createTestDungeon({
      name: "The Ruby Sanctum",
      raidKey: "rubySanctum",
      size: 25,
      difficulty: DungeonDifficulty.HEROIC,
      itemLevel: [284],
    });
    const bisSlotMap = buildBisSlotMap(retributionPaladinBis.presets[0]!);

    const hints = evaluateCharacterGearHints(
      createTestCharacter({
        class: Classes.find((characterClass) => characterClass.name === ClassName.Paladin),
        mainSpec: {
          spec: "Retribution",
          gearItems: [
            { slot: 1, id: 37646 },
            { slot: 9, id: 37646 },
            { slot: 11, id: 37646 },
            { slot: 13, id: 37646 },
          ],
        },
      }),
      dungeon,
      () => bisSlotMap,
      "en",
    );

    expect(hints.main?.bisBossLootGroups).toEqual([
      {
        bossName: "Halion",
        itemIds: [54576, 54578, 54581, 54590],
      },
    ]);
  });

  it("collects best ilvl loot item ids for boss-grouped tooltip sections", () => {
    const parsed = parseWowSimsExporterJson(RHEE_EXPORT, ClassName.Shaman);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }

    const hint = evaluateGearUpgradeHint(parsed.gearItems, {
      name: "Цитадель Ледяной Короны",
      raidKey: "icecrownCitadel",
      itemLevel: [277, 284],
    });

    const ilvlItemIds = collectMissingIlvlLootItemIds(hint);
    expect(ilvlItemIds.length).toBeGreaterThan(0);
    expect(ilvlItemIds).toEqual(
      expect.arrayContaining(
        hint.ilvl.upgradeSlots
          .map((slotHint) => slotHint.bestLootItemId)
          .filter((itemId): itemId is number => itemId !== undefined),
      ),
    );
  });

  it("detects Vault of Archavon tier loot for BiS hands missing from gear", () => {
    const dungeon = createTestDungeon({
      name: "Vault of Archavon",
      raidKey: "vaultOfArchavon",
      size: 10,
      difficulty: DungeonDifficulty.NORMAL,
      itemLevel: [232, 251],
    });
    const bisSlotMap = buildBisSlotMap({
      id: "voa-test",
      name: "VoA test",
      slots: [{ slot: 6, itemIds: [50079] }],
    });

    const hint = evaluateGearUpgradeHint(
      [{ slot: 6, id: 47230 }],
      dungeon,
      bisSlotMap,
      { className: ClassName.Warrior, spec: "Protection" },
    );

    expect(hint.slotAware).toBe(true);
    expect(hint.bis.level).toBeGreaterThan(0);
    expect(hint.bis.upgradeSlots).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ slot: 6, bestLootItemId: 50079 }),
      ]),
    );
  });
});

describe("formatGearUpgradeHintTooltip", () => {
  it("lists ilvl upgrade summary when boss loot list is not shown", () => {
    const tooltip = formatGearUpgradeHintTooltip(
      {
        bis: {
          level: 2,
          upgradeSlotCount: 1,
          upgradeSlots: [{ slot: 1, bestLootItemId: 54581, bestLootItemLevel: 284 }],
        },
        bisVariant: {
          level: 1,
          upgradeSlotCount: 1,
          upgradeSlots: [{ slot: 7, bestLootItemId: 50067, bestLootItemLevel: 264 }],
        },
        ilvl: {
          level: 2,
          upgradeSlotCount: 2,
          upgradeSlots: [
            { slot: 12, bestLootItemId: 54569, bestLootItemLevel: 284 },
          ],
        },
        equippedCount: 17,
        peakDungeonItemLevel: 284,
        slotAware: true,
        bisListActive: true,
      },
      testTranslator,
    );
    expect(tooltip).toBe("Up to 2 ilvl upgrade(s)");
    expect(tooltip).not.toContain("missing BiS");
    expect(tooltip).not.toContain("normal variant");
    expect(tooltip).not.toContain("→");
  });

  it("omits ilvl count line when boss-grouped ilvl loot is shown", () => {
    const tooltip = formatGearUpgradeHintTooltip(
      {
        bis: {
          level: 2,
          upgradeSlotCount: 3,
          upgradeSlots: [{ slot: 1, bestLootItemId: 54581, bestLootItemLevel: 284 }],
        },
        bisVariant: {
          level: 1,
          upgradeSlotCount: 1,
          upgradeSlots: [{ slot: 7, bestLootItemId: 50067, bestLootItemLevel: 264 }],
        },
        ilvl: {
          level: 2,
          upgradeSlotCount: 11,
          upgradeSlots: [],
        },
        equippedCount: 17,
        peakDungeonItemLevel: 284,
        slotAware: true,
        bisListActive: true,
      },
      testTranslator,
      { showIlvlBossLoot: true },
    );

    expect(tooltip).toBe("");
  });

  it("omits ilvl count line when boss loot list is shown", () => {
    const tooltip = formatGearUpgradeHintTooltip(
      {
        bis: emptyTrack,
        bisVariant: emptyTrack,
        ilvl: {
          level: 2,
          upgradeSlotCount: 3,
          upgradeSlots: [
            { slot: 12, bestLootItemId: 54569, bestLootItemLevel: 284 },
          ],
        },
        equippedCount: 17,
        peakDungeonItemLevel: 284,
        slotAware: true,
        bisListActive: false,
      },
      testTranslator,
      { showIlvlBossLoot: true },
    );

    expect(tooltip).toBe("");
  });

  it("uses amber for BiS and blue for ilvl toggle cell tints with stronger levels", () => {
    const theme = createAppTheme("light");

    const bisLow = getGearHintCellBackgroundColor({ kind: "bis", level: 1 }, theme);
    const bisHigh = getGearHintCellBackgroundColor({ kind: "bis", level: 3 }, theme);
    const ilvlLow = getGearHintCellBackgroundColor({ kind: "ilvl", level: 1 }, theme);
    const ilvlHigh = getGearHintCellBackgroundColor({ kind: "ilvl", level: 3 }, theme);

    expect(bisLow).toMatch(/^rgba\(.*\)$/);
    expect(bisHigh).toMatch(/^rgba\(.*\)$/);
    expect(ilvlLow).toMatch(/^rgba\(.*\)$/);
    expect(ilvlHigh).toMatch(/^rgba\(.*\)$/);
    expect(bisLow).not.toEqual(ilvlLow);
    expect(bisHigh).not.toEqual(ilvlHigh);
    expect(bisLow).not.toEqual(bisHigh);
    expect(ilvlLow).not.toEqual(ilvlHigh);
  });

  it("builds Onyxia gear hint sections with item links for imported gear", () => {
    const dungeon = createTestDungeon({
      name: "Логово Ониксии",
      raidKey: "onyxiasLair",
      size: 10,
      difficulty: DungeonDifficulty.NORMAL,
      itemLevel: [232],
    });

    const hints = evaluateCharacterGearHints(
      createTestCharacter({
        id: "emst",
        name: "emst",
        class: Classes.find((characterClass) => characterClass.name === ClassName.Warrior),
        mainSpec: {
          spec: "Protection",
          gearItems: [
            { slot: 1, id: 37646 },
            { slot: 12, id: 37657 },
          ],
        },
      }),
      dungeon,
      () => new Map(),
      "ru",
    );

    expect(hints.main?.ilvlBossLootGroups.length).toBeGreaterThan(0);
  });

  it("builds Vault of Archavon BiS boss loot groups for tooltip recommendations", () => {
    const dungeon = createTestDungeon({
      name: "Склеп Аркавона",
      raidKey: "vaultOfArchavon",
      size: 10,
      difficulty: DungeonDifficulty.NORMAL,
      itemLevel: [232, 251],
    });
    const bisSlotMap = buildBisSlotMap({
      id: "voa-test",
      name: "VoA test",
      slots: [{ slot: 6, itemIds: [50079] }],
    });

    const hints = evaluateCharacterGearHints(
      createTestCharacter({
        id: "prot",
        name: "Prot",
        class: Classes.find((characterClass) => characterClass.name === ClassName.Warrior),
        mainSpec: {
          spec: "Protection",
          gearItems: [{ slot: 6, id: 47230 }],
        },
      }),
      dungeon,
      () => bisSlotMap,
      "ru",
    );

    expect(hints.main?.bisBossLootGroups).toEqual([
      {
        bossName: "Торавон Страж Льда",
        itemIds: [50079],
      },
    ]);
  });

  it("keeps faction Solace on ilvl when the other faction version is equipped", () => {
    // Ilvl exclusion is name-variant only: wearing Horde Fallen H must not hide Alliance Solace H.
    const hint = evaluateGearUpgradeHint(
      [
        { slot: 12, id: 47432 },
        { slot: 13, id: 11815 },
      ],
      {
        name: "ToC25H",
        raidKey: "trialOfTheCrusader",
        size: 25,
        difficulty: DungeonDifficulty.HEROIC,
        itemLevel: [258],
      },
      undefined,
      { className: ClassName.Priest, spec: "Holy" },
    );

    const ilvlItemIds = collectMissingIlvlLootItemIds(hint);
    expect(ilvlItemIds).toContain(47059);
    expect(ilvlItemIds).not.toContain(47432);
  });

  it("treats same-ilvl faction Solace as satisfying BiS exact target", () => {
    const bisSlotMap = buildBisSlotMap({
      id: "solace-faction-bis-satisfied",
      name: "Solace faction BiS satisfied",
      slots: [
        { slot: 12, itemIds: [47432] },
        { slot: 13, itemIds: [47432] },
      ],
    });

    const hint = evaluateGearUpgradeHint(
      [
        { slot: 12, id: 47059 },
        { slot: 13, id: 11815 },
      ],
      {
        name: "ToC25H",
        raidKey: "trialOfTheCrusader",
        size: 25,
        difficulty: DungeonDifficulty.HEROIC,
        itemLevel: [258],
      },
      bisSlotMap,
      { className: ClassName.Priest, spec: "Holy" },
    );

    expect(hint.bis.upgradeSlots.map((slotHint) => slotHint.bestLootItemId)).not.toContain(
      47432,
    );
  });

  it("keeps faction Solace on ilvl track when BiS lists the other faction id", () => {
    // Horde Fallen H is on the BiS list; Alliance Defeated must not be scrubbed
    // from ilvl just because they are faction-equivalent.
    const bisSlotMap = buildBisSlotMap({
      id: "solace-faction-ilvl-test",
      name: "Solace faction ilvl test",
      slots: [
        { slot: 12, itemIds: [47432] },
        { slot: 13, itemIds: [47432] },
      ],
    });

    const hint = evaluateGearUpgradeHint(
      [
        { slot: 12, id: 11815 },
        { slot: 13, id: 11815 },
      ],
      {
        name: "ToC25H",
        raidKey: "trialOfTheCrusader",
        size: 25,
        difficulty: DungeonDifficulty.HEROIC,
        itemLevel: [258],
      },
      bisSlotMap,
      { className: ClassName.Priest, spec: "Holy" },
    );

    // BiS track owns Horde Fallen H; name-variant track is N-only (not in this row).
    expect(hint.bis.upgradeSlots.map((slotHint) => slotHint.bestLootItemId)).toContain(
      47432,
    );

    // Ilvl exclusion uses name variants only, so Alliance Solace H stays eligible.
    const ilvlItemIds = collectMissingIlvlLootItemIds(hint);
    expect(ilvlItemIds).not.toContain(47432);
    expect(ilvlItemIds).toContain(47059);
  });

  it("does not suggest Solace trinkets for Shadow Priest ilvl upgrades", () => {
    const hint = evaluateGearUpgradeHint(
      [
        { slot: 12, id: 11815 },
        { slot: 13, id: 11815 },
      ],
      {
        name: "ICC25",
        raidKey: "icecrownCitadel",
        size: 25,
        difficulty: DungeonDifficulty.NORMAL,
        itemLevel: [245, 258],
      },
      undefined,
      { className: ClassName.Priest, spec: "Shadow" },
    );

    const ilvlItemIds = collectMissingIlvlLootItemIds(hint);
    expect(ilvlItemIds).not.toContain(47041);
    expect(ilvlItemIds).not.toContain(47271);
  });

  it("does not suggest Tiny Abomination trinkets for Demonology Warlock ilvl upgrades", () => {
    const hint = evaluateGearUpgradeHint(
      [
        { slot: 12, id: 11815 },
        { slot: 13, id: 11815 },
      ],
      {
        name: "ICC25 HM",
        raidKey: "icecrownCitadel",
        size: 25,
        difficulty: DungeonDifficulty.HEROIC,
        itemLevel: [264, 277],
      },
      undefined,
      { className: ClassName.Warlock, spec: "Demonology" },
    );

    const ilvlItemIds = collectMissingIlvlLootItemIds(hint);
    expect(ilvlItemIds).not.toContain(50351);
    expect(ilvlItemIds).not.toContain(50706);
  });

  it("does not suggest role-exclusive proc trinkets outside their intended roles", () => {
    const shadowHint = evaluateGearUpgradeHint(
      [
        { slot: 12, id: 11815 },
        { slot: 13, id: 11815 },
      ],
      {
        name: "ICC25 HM",
        raidKey: "icecrownCitadel",
        size: 25,
        difficulty: DungeonDifficulty.HEROIC,
        itemLevel: [264, 277, 284],
      },
      undefined,
      { className: ClassName.Priest, spec: "Shadow" },
    );
    const shadowIlvlItemIds = collectMissingIlvlLootItemIds(shadowHint);
    expect(shadowIlvlItemIds).not.toContain(50341);
    expect(shadowIlvlItemIds).not.toContain(54589);
    expect(shadowIlvlItemIds).not.toContain(50366);
    expect(shadowIlvlItemIds).not.toContain(50726);

    const retHint = evaluateGearUpgradeHint(
      [
        { slot: 12, id: 11815 },
        { slot: 13, id: 11815 },
      ],
      {
        name: "ICC25 HM",
        raidKey: "icecrownCitadel",
        size: 25,
        difficulty: DungeonDifficulty.HEROIC,
        itemLevel: [264, 277],
      },
      undefined,
      { className: ClassName.Paladin, spec: "Retribution" },
    );
    const retIlvlItemIds = collectMissingIlvlLootItemIds(retHint);
    expect(retIlvlItemIds).not.toContain(50341);
    expect(retIlvlItemIds).not.toContain(54589);
  });
});
