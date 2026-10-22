import { EmblemKey } from "../assets/emblems/emblem-icons.ts";

/** WotLK raids: Russian (in-game) name + English (original) name + primary emblem. */
export const RaidNames = {
  naxxramas: {
    ru: "Наксрамас",
    en: "Naxxramas",
    shortRu: "Накс",
    shortEn: "Naxx",
    emblem: EmblemKey.TRIUMPH,
  },
  obsidianSanctum: {
    ru: "Обсидиановое святилище",
    en: "The Obsidian Sanctum",
    shortRu: "ОС",
    shortEn: "OS",
    emblem: EmblemKey.TRIUMPH,
  },
  onyxiasLair: {
    ru: "Логово Ониксии",
    en: "Onyxia's Lair",
    shortRu: "Оня",
    shortEn: "Ony",
    emblem: EmblemKey.TRIUMPH,
  },
  vaultOfArchavon: {
    ru: "Склеп Аркавона",
    en: "Vault of Archavon",
    shortRu: "СА",
    shortEn: "VA",
    emblem: EmblemKey.TRIUMPH,
  },
  trialOfTheCrusader: {
    ru: "Испытание крестоносца",
    en: "Trial of the Crusader",
    shortRu: "ИК",
    shortEn: "ToC",
    heroic: {
      ru: "Испытание Великого крестоносца",
      en: "Trial of the Grand Crusader",
      shortRu: "ИВК",
      shortEn: "ToGC",
    },
    emblem: EmblemKey.TRIUMPH,
  },
  ulduar: {
    ru: "Ульдуар",
    en: "Ulduar",
    shortRu: "Ульда",
    shortEn: "Ulda",
    emblem: EmblemKey.TRIUMPH,
  },
  icecrownCitadel: {
    ru: "Цитадель Ледяной Короны",
    en: "Icecrown Citadel",
    shortRu: "ЦЛК",
    shortEn: "ICC",
    emblem: EmblemKey.FROST,
  },
  rubySanctum: {
    ru: "Рубиновое святилище",
    en: "The Ruby Sanctum",
    shortRu: "РС",
    shortEn: "RS",
    emblem: EmblemKey.FROST,
  },
} as const;

export type RaidKey = keyof typeof RaidNames;
