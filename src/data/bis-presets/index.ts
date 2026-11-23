import type { ClassName } from "../../types/characters.ts";
import type { BisListPreset, BuiltInSpecBis } from "../../types/bis-lists.ts";
import { bloodDeathKnightBis } from "./blood-death-knight.ts";
import { unholyDeathKnightBis } from "./unholy-death-knight.ts";
import { enhancementShamanBis } from "./enhancement-shaman.ts";
import { restorationShamanBis } from "./restoration-shaman.ts";
import { elementalShamanBis } from "./elemental-shaman.ts";
import { afflictionWarlockBis } from "./affliction-warlock.ts";
import { demonologyWarlockBis } from "./demonology-warlock.ts";
import { frostDeathKnightBis } from "./frost-death-knight.ts";
import { combatRogueBis } from "./combat-rogue.ts";
import { holyPaladinBis } from "./holy-paladin.ts";
import { protectionPaladinBis } from "./protection-paladin.ts";
import { retributionPaladinBis } from "./retribution-paladin.ts";
import { marksmanshipHunterBis } from "./marksmanship-hunter.ts";
import { fireMageBis } from "./fire-mage.ts";
import { arcaneMageBis } from "./arcane-mage.ts";
import { disciplinePriestBis } from "./discipline-priest.ts";
import { shadowPriestBis } from "./shadow-priest.ts";
import { restorationDruidBis } from "./restoration-druid.ts";
import { balanceDruidBis } from "./balance-druid.ts";
import { feralDruidBis } from "./feral-druid.ts";
import { furyWarriorBis } from "./fury-warrior.ts";
import { armsWarriorBis } from "./arms-warrior.ts";
import { protectionWarriorBis } from "./protection-warrior.ts";
import { holyPriestBis } from "./holy-priest.ts";
import { subtletyRogueBis } from "./subtlety-rogue.ts";
import { assassinationRogueBis } from "./assassination-rogue.ts";
import { destructionWarlockBis } from "./destruction-warlock.ts";
import { beastMasteryHunterBis } from "./beast-mastery-hunter.ts";
import { survivalHunterBis } from "./survival-hunter.ts";
import { frostMageBis } from "./frost-mage.ts";
import { emityPresets } from "./emity.ts";

const existingPresets: readonly BuiltInSpecBis[] = [
  bloodDeathKnightBis,
  unholyDeathKnightBis,
  furyWarriorBis,
  armsWarriorBis,
  protectionWarriorBis,
  feralDruidBis,
  balanceDruidBis,
  restorationDruidBis,
  holyPriestBis,
  shadowPriestBis,
  disciplinePriestBis,
  arcaneMageBis,
  fireMageBis,
  frostMageBis,
  marksmanshipHunterBis,
  beastMasteryHunterBis,
  survivalHunterBis,
  retributionPaladinBis,
  protectionPaladinBis,
  holyPaladinBis,
  combatRogueBis,
  subtletyRogueBis,
  assassinationRogueBis,
  frostDeathKnightBis,
  demonologyWarlockBis,
  afflictionWarlockBis,
  destructionWarlockBis,
  elementalShamanBis,
  restorationShamanBis,
  enhancementShamanBis,
];

export const BuiltInBisPresets: readonly BuiltInSpecBis[] = existingPresets.map(
  (entry) => ({
    ...entry,
    presets: [
      ...entry.presets,
      ...(emityPresets[`${entry.className}|${entry.spec}`] ?? []),
    ],
  }),
);

export function findBuiltInSpecBis(
  className: ClassName,
  spec: string,
): BuiltInSpecBis | undefined {
  return BuiltInBisPresets.find(
    (entry) => entry.className === className && entry.spec === spec,
  );
}

export function getBuiltInPresetsForSpec(
  className: ClassName,
  spec: string,
): readonly BisListPreset[] {
  return findBuiltInSpecBis(className, spec)?.presets ?? [];
}
