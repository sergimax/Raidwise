import { describe, expect, it } from "vitest";
import { RaidNames } from "../data/raid-names.ts";
import {
  defaultShortNameForDungeonName,
  getLocalizedRaidNameSuggestions,
  isKnownRaidName,
} from "./dungeon-short-name.ts";

describe("getLocalizedRaidNameSuggestions", () => {
  it("returns English raid names sorted for en locale", () => {
    const suggestions = getLocalizedRaidNameSuggestions("en");
    expect(suggestions).toContain(RaidNames.icecrownCitadel.en);
    expect(suggestions).toContain(RaidNames.naxxramas.en);
    expect(suggestions.length).toBe(Object.keys(RaidNames).length + 1);
    expect([...suggestions]).toEqual(
      [...suggestions].sort((left, right) => left.localeCompare(right, "en")),
    );
  });

  it("returns Russian raid names sorted for ru locale", () => {
    const suggestions = getLocalizedRaidNameSuggestions("ru");
    expect(suggestions).toContain(RaidNames.icecrownCitadel.ru);
    expect(suggestions).toContain(RaidNames.naxxramas.ru);
    expect(suggestions.length).toBe(Object.keys(RaidNames).length + 1);
    expect([...suggestions]).toEqual(
      [...suggestions].sort((left, right) => left.localeCompare(right, "ru")),
    );
  });
});

describe("isKnownRaidName", () => {
  it("matches localized raid names", () => {
    expect(isKnownRaidName(RaidNames.icecrownCitadel.en)).toBe(true);
    expect(isKnownRaidName(RaidNames.icecrownCitadel.ru)).toBe(true);
    expect(isKnownRaidName("Custom dungeon")).toBe(false);
  });
});

describe("defaultShortNameForDungeonName", () => {
  it("resolves short name for known English raid name", () => {
    expect(defaultShortNameForDungeonName(RaidNames.icecrownCitadel.en)).toBe(
      RaidNames.icecrownCitadel.shortEn,
    );
  });

  it("resolves short name for English raids that previously lacked shortEn", () => {
    expect(defaultShortNameForDungeonName(RaidNames.trialOfTheCrusader.en)).toBe(
      RaidNames.trialOfTheCrusader.shortEn,
    );
    expect(defaultShortNameForDungeonName(RaidNames.onyxiasLair.en)).toBe(
      RaidNames.onyxiasLair.shortEn,
    );
    expect(defaultShortNameForDungeonName(RaidNames.ulduar.en)).toBe(
      RaidNames.ulduar.shortEn,
    );
  });

  it("resolves short name for Russian raid names", () => {
    expect(defaultShortNameForDungeonName(RaidNames.trialOfTheCrusader.ru)).toBe(
      RaidNames.trialOfTheCrusader.shortRu,
    );
  });
});
