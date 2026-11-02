import { describe, expect, it } from "vitest";
import { testTranslator } from "../test/i18n.ts";
import { getFormattedItemDropSources } from "./item-drop-sources.ts";
import { getBisItemSourceText } from "./bis-item-sources.ts";

describe("getBisItemSourceText", () => {
  it.each([47748, 50080, 51312])("labels T9/T10 armor as emblems: %s", (itemId) => {
    expect(getBisItemSourceText(itemId, "en", testTranslator)).toBe("Emblems of Frost + ICC25H");
  });
  it.each([47752, 47750, 50079, 50081, 51311, 51313])("labels hands and legs as Vault of Archavon: %s", (itemId) => {
    expect(getBisItemSourceText(itemId, "en", testTranslator)).toBe("Vault of Archavon + ICC25H");
    expect(getBisItemSourceText(itemId, "ru", testTranslator)).toBe("Склеп Аркавона + ЦЛК25хм");
  });
  it.each([45336, 50606])("preserves ordinary raid sources for other items: %s", (itemId) => {
    const expected = getFormattedItemDropSources(itemId, "en")
      .map((source) => `${source.raidLabel} · ${source.bossName}`).join(" · ");
    expect(getBisItemSourceText(itemId, "en", testTranslator)).toBe(expected);
  });
});
