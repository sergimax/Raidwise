import { buildItemIdMap } from "./build-item-id-map.ts";
import { createLazyJsonLoader } from "./lazy-json.ts";
import dataUrl from "./wotlk-item-levels.json?url&no-inline";

let itemLevelsById = new Map<number, number>();

export const ensureWotlkItemLevelsLoaded = createLazyJsonLoader(
  dataUrl,
  (data) => {
    itemLevelsById = buildItemIdMap(data as Record<string, number>);
  },
);

/** WotLK item level for a game item id, when known in the bundled WowSims database. */
export function getWotlkItemLevel(itemId: number): number | undefined {
  return itemLevelsById.get(itemId);
}
