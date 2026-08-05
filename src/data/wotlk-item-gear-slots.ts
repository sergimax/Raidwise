import { buildItemIdMap } from "./build-item-id-map.ts";
import { createLazyJsonLoader } from "./lazy-json.ts";

let itemGearSlotsById = new Map<number, readonly number[]>();

export const ensureWotlkItemGearSlotsLoaded = createLazyJsonLoader(
  () => import("./wotlk-item-gear-slots.json"),
  (data) => {
    itemGearSlotsById = buildItemIdMap(
      data as Record<string, readonly number[]>,
    );
  },
);

/** Valid WowSims gear slot indices for an item id, when known. */
export function getWotlkItemGearSlots(itemId: number): readonly number[] | undefined {
  const slots = itemGearSlotsById.get(itemId);
  return slots && slots.length > 0 ? slots : undefined;
}

export function itemFitsGearSlot(itemId: number, gearSlot: number): boolean {
  const validSlots = getWotlkItemGearSlots(itemId);
  return validSlots?.includes(gearSlot) ?? false;
}
