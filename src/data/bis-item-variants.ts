import { getWotlkItemGearSlots } from "./wotlk-item-gear-slots.ts";
import { getWotlkItemLevel } from "./wotlk-item-levels.ts";
import {
  getEnglishItemNameEntries,
  getWotlkItemName,
} from "./wotlk-item-names.ts";

function variantGroupKey(gearSlot: number, englishName: string): string {
  return `${gearSlot}:${englishName}`;
}

let variantIdsByGroupKey = new Map<string, number[]>();

/** Build same-name N/H indexes after EN names + gear slots are loaded. */
export function rebuildBisItemVariantIndex(): void {
  const nextVariantIdsByGroupKey = new Map<string, number[]>();

  for (const [itemId, englishName] of getEnglishItemNameEntries()) {
    if (!englishName) {
      continue;
    }

    const gearSlots = getWotlkItemGearSlots(itemId);
    if (!gearSlots || gearSlots.length === 0) {
      continue;
    }

    for (const gearSlot of gearSlots) {
      const groupKey = variantGroupKey(gearSlot, englishName);
      const existingIds = nextVariantIdsByGroupKey.get(groupKey);
      if (existingIds) {
        existingIds.push(itemId);
      } else {
        nextVariantIdsByGroupKey.set(groupKey, [itemId]);
      }
    }
  }

  variantIdsByGroupKey = nextVariantIdsByGroupKey;
}

/** Alliance/Horde pairs with different English names (e.g. Solace of the Fallen / Defeated). */
const FactionVariantGroups: readonly (readonly number[])[] = [
  [47041, 47059, 47271, 47432],
];

const factionVariantIdsByItemId = new Map<number, readonly number[]>(
  FactionVariantGroups.flatMap((group) => group.map((itemId) => [itemId, group] as const)),
);

/** Faction-tied variants of the same item (normal + heroic for both factions). */
export function getFactionVariantItemIds(
  itemId: number,
  gearSlot?: number,
): readonly number[] {
  const group = factionVariantIdsByItemId.get(itemId);
  if (!group) {
    return [itemId];
  }

  if (gearSlot === undefined) {
    return group;
  }

  return group.filter((variantId) =>
    getWotlkItemGearSlots(variantId)?.includes(gearSlot),
  );
}

/** Name variants plus faction variants at a gear slot. */
export function getEquivalentItemIdsAtSlot(
  itemId: number,
  gearSlot: number,
): readonly number[] {
  const equivalentIds = new Set<number>();

  for (const nameVariantId of getNameVariantItemIdsAtSlot(itemId, gearSlot)) {
    for (const factionVariantId of getFactionVariantItemIds(nameVariantId, gearSlot)) {
      equivalentIds.add(factionVariantId);
    }
  }

  return [...equivalentIds];
}

/** Same English name + gear slot (e.g. ICC normal/heroic Astrylian's belt). */
export function getNameVariantItemIdsAtSlot(
  itemId: number,
  gearSlot: number,
): readonly number[] {
  const englishName = getWotlkItemName(itemId, "en");
  if (!englishName || !getWotlkItemGearSlots(itemId)?.includes(gearSlot)) {
    return [itemId];
  }

  return variantIdsByGroupKey.get(variantGroupKey(gearSlot, englishName)) ?? [itemId];
}

/** Expands to same-name N/H ids only (not faction pairs). */
export function expandItemIdsWithNameVariantsAtSlot(
  itemIds: readonly number[],
  gearSlot: number,
): number[] {
  const expandedIds = new Set<number>();

  for (const itemId of itemIds) {
    for (const variantId of getNameVariantItemIdsAtSlot(itemId, gearSlot)) {
      expandedIds.add(variantId);
    }
  }

  return [...expandedIds];
}

/** Expands to name + faction equivalents at a gear slot (BiS satisfaction helpers). */
export function expandItemIdsWithEquivalentIdsAtSlot(
  itemIds: readonly number[],
  gearSlot: number,
): number[] {
  const expandedIds = new Set<number>();

  for (const itemId of itemIds) {
    for (const equivalentId of getEquivalentItemIdsAtSlot(itemId, gearSlot)) {
      expandedIds.add(equivalentId);
    }
  }

  return [...expandedIds];
}

/** Name variants for a slot that are not on the BiS list (e.g. ICC normal vs heroic id). */
export function getNonListNameVariantItemIdsAtSlot(
  bisItemIds: readonly number[],
  gearSlot: number,
): number[] {
  const bisItemIdSet = new Set(bisItemIds);
  return expandItemIdsWithNameVariantsAtSlot(bisItemIds, gearSlot).filter(
    (itemId) => !bisItemIdSet.has(itemId),
  );
}

/** Same-name N/H only (not faction pairs). Used for ilvl equipped exclusion. */
export function isItemIdOrNameVariantAtSlot(
  itemId: number,
  targetItemIds: readonly number[],
  gearSlot: number,
): boolean {
  if (targetItemIds.includes(itemId)) {
    return true;
  }

  return targetItemIds.some((targetItemId) =>
    getNameVariantItemIdsAtSlot(targetItemId, gearSlot).includes(itemId),
  );
}

/**
 * Exact BiS id or a same-ilvl faction twin (e.g. Alliance Solace H ↔ Horde Fallen H).
 * Does not collapse normal/heroic.
 */
export function isItemIdOrSameIlvlFactionVariantAtSlot(
  itemId: number,
  targetItemIds: readonly number[],
  gearSlot: number,
): boolean {
  if (targetItemIds.includes(itemId)) {
    return true;
  }

  const itemLevel = getWotlkItemLevel(itemId);
  if (itemLevel === undefined) {
    return false;
  }

  return targetItemIds.some((targetItemId) => {
    if (!getFactionVariantItemIds(targetItemId, gearSlot).includes(itemId)) {
      return false;
    }
    return getWotlkItemLevel(targetItemId) === itemLevel;
  });
}

/** Name variants plus faction variants (any difficulty). Prefer track-specific helpers above. */
export function isItemIdOrEquivalentAtSlot(
  itemId: number,
  targetItemIds: readonly number[],
  gearSlot: number,
): boolean {
  if (targetItemIds.includes(itemId)) {
    return true;
  }

  return targetItemIds.some((targetItemId) =>
    getEquivalentItemIdsAtSlot(targetItemId, gearSlot).includes(itemId),
  );
}
