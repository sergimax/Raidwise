import { createContext } from "react";
import {
  DEFAULT_ITEM_TOOLTIP_LOCALE,
  ITEM_TOOLTIP_LOCALE_STORAGE_KEY,
  ITEM_TOOLTIP_LOCALES,
  LEGACY_ITEM_TOOLTIP_LOCALE_STORAGE_KEY,
  type ItemTooltipLocale,
} from "../constants/item-tooltips.ts";
import { getLocalStorageItemMigrating } from "../utils/local-storage-migrate.ts";

export type ItemTooltipLocaleContextValue = {
  locale: ItemTooltipLocale;
  setLocale: (locale: ItemTooltipLocale) => void;
  toggleLocale: () => void;
};

export const ItemTooltipLocaleContext =
  createContext<ItemTooltipLocaleContextValue | null>(null);

function readStoredItemTooltipLocale(): ItemTooltipLocale | null {
  const raw = getLocalStorageItemMigrating(
    ITEM_TOOLTIP_LOCALE_STORAGE_KEY,
    LEGACY_ITEM_TOOLTIP_LOCALE_STORAGE_KEY,
  );
  if (raw && ITEM_TOOLTIP_LOCALES.includes(raw as ItemTooltipLocale)) {
    return raw as ItemTooltipLocale;
  }
  return null;
}

export function getInitialItemTooltipLocale(): ItemTooltipLocale {
  return readStoredItemTooltipLocale() ?? DEFAULT_ITEM_TOOLTIP_LOCALE;
}
