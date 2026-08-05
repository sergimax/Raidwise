import { buildItemIdMap } from "./build-item-id-map.ts";
import { createLazyJsonLoader } from "./lazy-json.ts";

let itemLevelsById = new Map<number, number>();

export const ensureWotlkItemLevelsLoaded = createLazyJsonLoader(
  () => import("./wotlk-item-levels.json"),
  (data) => {
    itemLevelsById = buildItemIdMap(data as Record<string, number>);
  },
);

/** WotLK item level for a game item id, when known in the bundled WowSims database. */
export function getWotlkItemLevel(itemId: number): number | undefined {
  return itemLevelsById.get(itemId);
}
