import type { ItemTooltipLocale } from "../constants/item-tooltips.ts";
import { buildItemIdMap } from "./build-item-id-map.ts";
import { createLazyJsonLoader } from "./lazy-json.ts";

let itemNamesEnById = new Map<number, string>();
let itemNamesRuById = new Map<number, string>();
let itemNameToIdEnCache: Map<string, number> | undefined;

const ensureEnNamesLoaded = createLazyJsonLoader(
  () => import("./wotlk-item-names.json"),
  (data) => {
    itemNamesEnById = buildItemIdMap(data as Record<string, string>);
    itemNameToIdEnCache = undefined;
  },
);

const ensureRuNamesLoaded = createLazyJsonLoader(
  () => import("./wotlk-item-names-ru.json"),
  (data) => {
    itemNamesRuById = buildItemIdMap(data as Record<string, string>);
  },
);

function readName(map: Map<number, string>, itemId: number): string | undefined {
  const name = map.get(itemId);
  return typeof name === "string" && name.length > 0 ? name : undefined;
}

/** Load item name map(s) for a UI locale (RU also keeps EN for fallback once loaded). */
export function ensureItemNamesLoaded(locale: ItemTooltipLocale): Promise<void> {
  if (locale === "ru") {
    return ensureRuNamesLoaded();
  }
  return ensureEnNamesLoaded();
}

/** English names (needed for BiS name→id and N/H variant indexing). */
export function ensureEnglishItemNamesLoaded(): Promise<void> {
  return ensureEnNamesLoaded();
}

/** Item display name for the given tooltip locale; falls back EN → other locale → undefined. */
export function getWotlkItemName(
  itemId: number,
  locale: ItemTooltipLocale = "en",
): string | undefined {
  if (locale === "ru") {
    return readName(itemNamesRuById, itemId) ?? readName(itemNamesEnById, itemId);
  }

  return readName(itemNamesEnById, itemId);
}

/** Lowercase English name → item id (for BiS paste parsing). Empty until EN names are loaded. */
export function getWotlkItemNameToIdEnMap(): Map<string, number> {
  if (!itemNameToIdEnCache) {
    itemNameToIdEnCache = new Map();
    for (const [itemId, itemName] of itemNamesEnById) {
      itemNameToIdEnCache.set(itemName.trim().toLowerCase(), itemId);
    }
  }
  return itemNameToIdEnCache;
}

/** Raw English name lookup for variant indexing (empty until EN names are loaded). */
export function getEnglishItemNameEntries(): IterableIterator<[number, string]> {
  return itemNamesEnById.entries();
}
