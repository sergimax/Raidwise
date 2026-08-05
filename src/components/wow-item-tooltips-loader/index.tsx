import {
  COT_TOOLTIP_SCRIPT_ID,
  COT_TOOLTIP_SCRIPT_URL,
  WOWROAD_TOOLTIP_CONFIG_SCRIPT_ID,
  WOWROAD_TOOLTIP_SCRIPT_ID,
  WOWROAD_TOOLTIP_SCRIPT_URL,
  type ItemTooltipLocale,
} from "../../constants/item-tooltips.ts";

function appendScript(id: string, src: string): void {
  if (document.getElementById(id)) {
    return;
  }

  const script = document.createElement("script");
  script.id = id;
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
}

function appendInlineScript(id: string, content: string): void {
  if (document.getElementById(id)) {
    return;
  }

  const script = document.createElement("script");
  script.id = id;
  script.textContent = content;
  document.head.appendChild(script);
}

const loadedLocales = new Set<ItemTooltipLocale>();

/**
 * Injects the tooltip provider for the active UI locale only (RU → WowRoad, EN → CoT).
 * Safe to call repeatedly; no-ops after the first successful load per locale.
 */
export function ensureItemTooltipsLoaded(locale: ItemTooltipLocale): void {
  if (loadedLocales.has(locale)) {
    return;
  }
  loadedLocales.add(locale);

  if (locale === "ru") {
    appendInlineScript(
      WOWROAD_TOOLTIP_CONFIG_SCRIPT_ID,
      'var wowroad_tooltips = { "colorlinks": true, "iconizelinks": false, "renamelinks": false };',
    );
    appendScript(WOWROAD_TOOLTIP_SCRIPT_ID, WOWROAD_TOOLTIP_SCRIPT_URL);
    return;
  }

  appendScript(COT_TOOLTIP_SCRIPT_ID, COT_TOOLTIP_SCRIPT_URL);
}
