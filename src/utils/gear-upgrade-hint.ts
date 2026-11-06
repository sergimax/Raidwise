import type { TranslateFn } from "../i18n/translate.ts";
import { getWotlkItemLevel } from "../data/wotlk-item-levels.ts";
import type { CharacterGearItem } from "../types/character-gear.ts";
import type { BisSlotMap } from "./bis-lists.ts";
import { evaluateSlotTracks, type GearUpgradeDungeon, type GearUpgradeSlotHint } from "./gear-upgrade-slot.ts";
import type { CharacterEquipContext } from "./item-equip-restrictions.ts";
import { resolveDungeonRaidKey } from "./resolve-dungeon-raid-key.ts";

export type { GearUpgradeSlotHint } from "./gear-upgrade-slot.ts";

export type GearUpgradeHintLevel = 0 | 1 | 2 | 3;

export type GearUpgradeHintTrack = {
  level: GearUpgradeHintLevel;
  upgradeSlotCount: number;
  upgradeSlots: GearUpgradeSlotHint[];
};

export type GearUpgradeHint = {
  /** Exact BiS-list item ids missing as upgrades in this dungeon (tier 1). */
  bis: GearUpgradeHintTrack;
  /** Normal name variants of BiS items missing as upgrades (tier 2). */
  bisVariant: GearUpgradeHintTrack;
  /** Spec-relevant ilvl raid loot excluding BiS targets (tier 3). */
  ilvl: GearUpgradeHintTrack;
  equippedCount: number;
  peakDungeonItemLevel: number;
  slotAware: boolean;
  bisListActive: boolean;
};

export type GearHintCellDisplay = {
  kind: "bis" | "ilvl";
  level: GearUpgradeHintLevel;
};

const EMPTY_HINT_TRACK: GearUpgradeHintTrack = {
  level: 0,
  upgradeSlotCount: 0,
  upgradeSlots: [],
};

/** Peak ilvl offered by a dungeon row (highest tier drop). */
export function getDungeonPeakItemLevel(itemLevels: readonly number[]): number {
  if (itemLevels.length === 0) {
    return 0;
  }
  return Math.max(...itemLevels);
}

function upgradeHintLevelFromRatio(ratio: number): GearUpgradeHintLevel {
  if (ratio <= 0) {
    return 0;
  }
  if (ratio <= 0.25) {
    return 1;
  }
  if (ratio <= 0.5) {
    return 2;
  }
  return 3;
}

function isSlotUpgradeableNaive(
  itemLevel: number | undefined,
  peakDungeonItemLevel: number,
): boolean {
  return itemLevel === undefined || itemLevel < peakDungeonItemLevel;
}

function buildHintTrack(
  upgradeSlots: GearUpgradeSlotHint[],
  equippedCount: number,
): GearUpgradeHintTrack {
  const level =
    equippedCount === 0
      ? 0
      : upgradeHintLevelFromRatio(upgradeSlots.length / equippedCount);

  return {
    level,
    upgradeSlotCount: upgradeSlots.length,
    upgradeSlots,
  };
}

function evaluateNaiveIlvlTrack(
  gearItems: readonly CharacterGearItem[],
  peakDungeonItemLevel: number,
): GearUpgradeHintTrack {
  const upgradeSlots: GearUpgradeSlotHint[] = [];

  for (const item of gearItems) {
    const itemLevel = getWotlkItemLevel(item.id);
    if (isSlotUpgradeableNaive(itemLevel, peakDungeonItemLevel)) {
      upgradeSlots.push({ slot: item.slot, bestLootItemLevel: peakDungeonItemLevel });
    }
  }

  return buildHintTrack(upgradeSlots, gearItems.length);
}

function emptyGearUpgradeHint(
  equippedCount: number,
  peakDungeonItemLevel: number,
  slotAware: boolean,
  bisListActive: boolean,
): GearUpgradeHint {
  return {
    bis: EMPTY_HINT_TRACK,
    bisVariant: EMPTY_HINT_TRACK,
    ilvl: EMPTY_HINT_TRACK,
    equippedCount,
    peakDungeonItemLevel,
    slotAware,
    bisListActive,
  };
}

export function evaluateGearUpgradeHint(
  gearItems: readonly CharacterGearItem[] | undefined,
  dungeon: GearUpgradeDungeon,
  bisSlotMap?: BisSlotMap,
  equipContext: CharacterEquipContext = {},
  alsoOwnedItemIds: readonly number[] = [],
): GearUpgradeHint {
  const dungeonItemLevels = dungeon.itemLevel;
  const peakDungeonItemLevel = getDungeonPeakItemLevel(dungeonItemLevels);
  const equippedCount = gearItems?.length ?? 0;
  const bisListActive = bisSlotMap !== undefined && bisSlotMap.size > 0;

  if (equippedCount === 0 || peakDungeonItemLevel === 0 || !gearItems) {
    return emptyGearUpgradeHint(
      equippedCount,
      peakDungeonItemLevel,
      false,
      bisListActive,
    );
  }

  const raidKey = resolveDungeonRaidKey(dungeon);
  if (raidKey) {
    const exactBisSlots: GearUpgradeSlotHint[] = [];
    const variantBisSlots: GearUpgradeSlotHint[] = [];
    const ilvlSlots: GearUpgradeSlotHint[] = [];
    const evaluatedSlots = new Set<number>();

    for (const item of gearItems) {
      evaluatedSlots.add(item.slot);
      const bisItemIdsForSlot = bisListActive
        ? bisSlotMap?.get(item.slot)
        : undefined;
      const slotTracks = evaluateSlotTracks(
        item,
        dungeon,
        raidKey,
        equipContext,
        gearItems,
        alsoOwnedItemIds,
        bisItemIdsForSlot,
        bisListActive,
      );

      if (slotTracks.exactBis) {
        exactBisSlots.push(slotTracks.exactBis);
      }
      if (slotTracks.variantBis) {
        variantBisSlots.push(slotTracks.variantBis);
      }
      if (slotTracks.ilvl) {
        ilvlSlots.push(slotTracks.ilvl);
      }
    }

    // Unequipped BiS slots (e.g. off-hand while wearing a 2H staff) still need
    // Soft pick / amber hints — walk the BiS map like tier-set hints do.
    if (bisListActive && bisSlotMap) {
      for (const [slot, bisItemIdsForSlot] of bisSlotMap) {
        if (evaluatedSlots.has(slot) || bisItemIdsForSlot.length === 0) {
          continue;
        }
        const emptySlotItem: CharacterGearItem = { slot, id: 0 };
        const slotTracks = evaluateSlotTracks(
          emptySlotItem,
          dungeon,
          raidKey,
          equipContext,
          gearItems,
          alsoOwnedItemIds,
          bisItemIdsForSlot,
          true,
          { includeIlvl: false },
        );
        if (slotTracks.exactBis) {
          exactBisSlots.push(slotTracks.exactBis);
        }
        if (slotTracks.variantBis) {
          variantBisSlots.push(slotTracks.variantBis);
        }
      }
    }

    return {
      bis: bisListActive
        ? buildHintTrack(exactBisSlots, equippedCount)
        : EMPTY_HINT_TRACK,
      bisVariant: bisListActive
        ? buildHintTrack(variantBisSlots, equippedCount)
        : EMPTY_HINT_TRACK,
      ilvl: buildHintTrack(ilvlSlots, equippedCount),
      equippedCount,
      peakDungeonItemLevel,
      slotAware: true,
      bisListActive,
    };
  }

  return {
    bis: EMPTY_HINT_TRACK,
    bisVariant: EMPTY_HINT_TRACK,
    ilvl: evaluateNaiveIlvlTrack(gearItems, peakDungeonItemLevel),
    equippedCount,
    peakDungeonItemLevel,
    slotAware: false,
    bisListActive,
  };
}

/** Cell tint kind: BiS targets (exact or normal variant) take priority over ilvl upgrades. */
export function getGearHintCellDisplay(
  hint: GearUpgradeHint,
): GearHintCellDisplay | null {
  const bisLevel = Math.max(hint.bis.level, hint.bisVariant.level) as GearUpgradeHintLevel;

  if (hint.bisListActive && bisLevel > 0) {
    return { kind: "bis", level: bisLevel };
  }
  if (hint.ilvl.level > 0) {
    return { kind: "ilvl", level: hint.ilvl.level };
  }
  return null;
}

export type GearUpgradeHintTooltipOptions = {
  /** Boss-grouped non-BiS ilvl list is shown — omit redundant count line. */
  showIlvlBossLoot?: boolean;
};

function collectMissingLootItemIds(track: GearUpgradeHintTrack): number[] {
  const itemIds: number[] = [];

  for (const slotHint of track.upgradeSlots) {
    if (
      slotHint.bestLootItemId !== undefined &&
      !itemIds.includes(slotHint.bestLootItemId)
    ) {
      itemIds.push(slotHint.bestLootItemId);
    }
  }

  return itemIds;
}

/** Item ids for boss-grouped BiS loot sections (missing upgrades only). */
export function collectMissingBisLootItemIds(hint: GearUpgradeHint): {
  exact: number[];
  variant: number[];
} {
  return {
    exact: collectMissingLootItemIds(hint.bis),
    variant: collectMissingLootItemIds(hint.bisVariant),
  };
}

/** Item ids for boss-grouped non-BiS ilvl upgrade sections (missing upgrades only). */
export function collectMissingIlvlLootItemIds(hint: GearUpgradeHint): number[] {
  return collectMissingLootItemIds(hint.ilvl);
}

export function formatGearUpgradeHintTooltip(
  hint: GearUpgradeHint,
  t: TranslateFn,
  options?: GearUpgradeHintTooltipOptions,
): string {
  if (hint.ilvl.level > 0 && !options?.showIlvlBossLoot) {
    const introKey = hint.slotAware
      ? "gearHint.raidLootUpgrades"
      : "gearHint.belowIlvl";
    return introKey === "gearHint.belowIlvl"
      ? t(introKey, {
          count: hint.ilvl.upgradeSlotCount,
          total: hint.equippedCount,
          ilvl: hint.peakDungeonItemLevel,
        })
      : t(introKey, { count: hint.ilvl.upgradeSlotCount });
  }

  return "";
}
