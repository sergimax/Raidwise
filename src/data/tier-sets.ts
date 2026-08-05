import { buildItemIdMap } from "./build-item-id-map.ts";
import { createLazyJsonLoader } from "./lazy-json.ts";
import type { TierSetItemEntry, TierSetTier } from "../types/tier-sets.ts";

let tierSetsByItemId = new Map<number, TierSetItemEntry>();
/** `${setName}|${slot}` → piece item ids for that set/slot. */
let pieceIdsBySetSlot = new Map<string, number[]>();
/** `${setName}|${slot}|${step}` → piece item id. */
let pieceIdBySetSlotStep = new Map<string, number>();

function rebuildTierSetIndexes(
  nextTierSetsByItemId: Map<number, TierSetItemEntry>,
): void {
  const nextPieceIdsBySetSlot = new Map<string, number[]>();
  const nextPieceIdBySetSlotStep = new Map<string, number>();

  for (const [itemId, entry] of nextTierSetsByItemId) {
    const setSlotKey = `${entry.setName}|${entry.slot}`;
    const pieceIds = nextPieceIdsBySetSlot.get(setSlotKey);
    if (pieceIds) {
      pieceIds.push(itemId);
    } else {
      nextPieceIdsBySetSlot.set(setSlotKey, [itemId]);
    }
    nextPieceIdBySetSlotStep.set(`${setSlotKey}|${entry.step}`, itemId);
  }

  tierSetsByItemId = nextTierSetsByItemId;
  pieceIdsBySetSlot = nextPieceIdsBySetSlot;
  pieceIdBySetSlotStep = nextPieceIdBySetSlotStep;
}

export const ensureTierSetsLoaded = createLazyJsonLoader(
  () => import("./tier-sets-by-item-id.json"),
  (data) => {
    rebuildTierSetIndexes(
      buildItemIdMap(data as Record<string, TierSetItemEntry>),
    );
  },
);

/** Gear slots used by WotLK PvE tier sets (head, shoulder, chest, hands, legs). */
export const TIER_SET_GEAR_SLOTS = [0, 2, 4, 6, 8, 10] as const;

export function isTierSetGearSlot(slot: number): boolean {
  return (TIER_SET_GEAR_SLOTS as readonly number[]).includes(slot);
}

export function getTierSetItemEntry(itemId: number): TierSetItemEntry | undefined {
  return tierSetsByItemId.get(itemId);
}

/** All tier-set piece ids for a set name + gear slot (pre-indexed after load). */
export function getTierSetPieceIdsForSlot(
  setName: string,
  slot: number,
): readonly number[] {
  return pieceIdsBySetSlot.get(`${setName}|${slot}`) ?? [];
}

export function findTierSetPieceAtStep(
  setName: string,
  slot: number,
  step: 1 | 2 | 3,
): TierSetItemEntry | undefined {
  const itemId = pieceIdBySetSlotStep.get(`${setName}|${slot}|${step}`);
  return itemId === undefined ? undefined : tierSetsByItemId.get(itemId);
}

export function findTierSetPieceItemIdAtStep(
  setName: string,
  slot: number,
  step: 1 | 2 | 3,
): number | undefined {
  return pieceIdBySetSlotStep.get(`${setName}|${slot}|${step}`);
}

export function tierLabel(tier: TierSetTier): string {
  switch (tier) {
    case "t8":
      return "T8";
    case "t9":
      return "T9";
    case "t10":
      return "T10";
  }
}
