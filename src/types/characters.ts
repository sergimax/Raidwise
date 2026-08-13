import { classIcons } from "../assets/class-icons/class-icons";

export const ClassName = {
  DeathKnight: "Death Knight",
  Druid: "Druid",
  Hunter: "Hunter",
  Mage: "Mage",
  Paladin: "Paladin",
  Priest: "Priest",
  Rogue: "Rogue",
  Shaman: "Shaman",
  Warlock: "Warlock",
  Warrior: "Warrior",
} as const;

export type ClassName = (typeof ClassName)[keyof typeof ClassName];

export type CharacterClass = {
  name: ClassName;
  color: string;
  icon: string;
};

export const Classes: Array<CharacterClass> = [
  { name: ClassName.DeathKnight, icon: classIcons["Death Knight"], color: "C41E3A" },
  { name: ClassName.Druid, icon: classIcons.Druid, color: "FF7C0A" },
  { name: ClassName.Hunter, icon: classIcons.Hunter, color: "AAD372" },
  { name: ClassName.Mage, icon: classIcons.Mage, color: "3FC7EB" },
  { name: ClassName.Paladin, icon: classIcons.Paladin, color: "F48CBA" },
  { name: ClassName.Priest, icon: classIcons.Priest, color: "FFFFFF" },
  { name: ClassName.Rogue, icon: classIcons.Rogue, color: "FFF468" },
  { name: ClassName.Shaman, icon: classIcons.Shaman, color: "0070DD" },
  { name: ClassName.Warlock, icon: classIcons.Warlock, color: "8788EE" },
  { name: ClassName.Warrior, icon: classIcons.Warrior, color: "C69B6D" },
];

import type { CharacterGearItem } from "./character-gear.ts";

/** Talent specialization with optional GearScore and imported gear for that spec. */
export type CharacterSpecGear = {
  spec: string;
  gearScore?: number;
  gearItems?: CharacterGearItem[];
};

export type Character = {
  name: string;
  class?: CharacterClass;
  mainSpec?: CharacterSpecGear;
  offSpec?: CharacterSpecGear;
  /**
   * Item ids available to equip but not on either WowSims export
   * (bags, bank, vendors). Shared across main/off for hint math.
   * Gear imported on the other spec is counted automatically.
   */
  alsoOwnedItemIds?: number[];
};

export type CharacterRecord = Character & { id: string };

export type CharacterSpecGearUpdate = {
  mainSpec?: CharacterSpecGear;
  offSpec?: CharacterSpecGear;
  /** Empty array clears; omit to leave unchanged when updating specs only. */
  alsoOwnedItemIds?: number[];
};
