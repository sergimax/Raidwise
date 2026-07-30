import { ClassName } from "../../types/characters.ts";
import type { BuiltInSpecBis } from "../../types/bis-lists.ts";

/**
 * WotLK BiS presets for Discipline Priest.
 */
export const disciplinePriestBis: BuiltInSpecBis = {
  className: ClassName.Priest,
  spec: "Discipline",
  presets: [
    {
      id: "kingdom-with-variants",
      name: "Kingdom. With variants",
      slots: [
        { slot: 0, itemIds: [51261] }, // Head: Sanctified Crimson Acolyte Hood
        { slot: 1, itemIds: [50724] }, // Neck: Blood Queen's Crimson Choker
        { slot: 2, itemIds: [51264] }, // Shoulder: Sanctified Crimson Acolyte Shoulderpads
        { slot: 3, itemIds: [54583] }, // Back: Cloak of Burning Dusk
        { slot: 4, itemIds: [50717, 51259] }, // Chest: Sanguine Silk Robes / Sanctified Crimson Acolyte Raiments
        { slot: 5, itemIds: [54582] }, // Wrist: Bracers of Fiery Night
        { slot: 6, itemIds: [51260] }, // Hands: Sanctified Crimson Acolyte Gloves
        { slot: 7, itemIds: [50613, 50702] }, // Waist: Crushing Coldwraith Belt / Lingering Illness
        { slot: 8, itemIds: [51262] }, // Legs: Sanctified Crimson Acolyte Leggings
        { slot: 9, itemIds: [50699] }, // Feet: Plague Scientist's Boots
        { slot: 10, itemIds: [54585] }, // Finger 1: Ring of Phased Regeneration
        { slot: 11, itemIds: [50664, 50644] }, // Finger 2: Ring of Rapid Ascent / Ring of Maddening Whispers
        { slot: 12, itemIds: [54589] }, // Trinket 1: Glowing Twilight Scale
        { slot: 13, itemIds: [50366, 47432] }, // Trinket 2: Althor's Abacus / Solace of the Fallen
        { slot: 14, itemIds: [50734] }, // Main hand: Royal Scepter of Terenas II
        { slot: 15, itemIds: [50719] }, // Off hand: Shadow Silk Spindle
        { slot: 16, itemIds: [50684, 50631] }, // Ranged: Corpse-Impaling Spike / Nightmare Ender
      ],
    },
    {
      id: "titans",
      name: "Titans",
      slots: [
        { slot: 0, itemIds: [51261] }, // Head: Sanctified Crimson Acolyte Hood
        { slot: 1, itemIds: [50724] }, // Neck: Blood Queen's Crimson Choker
        { slot: 2, itemIds: [51264] }, // Shoulder: Sanctified Crimson Acolyte Shoulderpads
        { slot: 3, itemIds: [54583] }, // Back: Cloak of Burning Dusk
        { slot: 4, itemIds: [50717] }, // Chest: Sanguine Silk Robes
        { slot: 5, itemIds: [54582] }, // Wrist: Bracers of Fiery Night
        { slot: 6, itemIds: [51260] }, // Hands: Sanctified Crimson Acolyte Gloves
        { slot: 7, itemIds: [50702] }, // Waist: Lingering Illness
        { slot: 8, itemIds: [51262] }, // Legs: Sanctified Crimson Acolyte Leggings
        { slot: 9, itemIds: [50699] }, // Feet: Plague Scientist's Boots
        { slot: 10, itemIds: [50664] }, // Finger 1: Ring of Rapid Ascent
        { slot: 11, itemIds: [54585] }, // Finger 2: Ring of Phased Regeneration
        { slot: 12, itemIds: [54589] }, // Trinket 1: Glowing Twilight Scale
        { slot: 13, itemIds: [47432] }, // Trinket 2: Solace of the Fallen
        { slot: 14, itemIds: [50734] }, // Main hand: Royal Scepter of Terenas II
        { slot: 15, itemIds: [50719] }, // Off hand: Shadow Silk Spindle
        { slot: 16, itemIds: [50684] }, // Ranged: Corpse-Impaling Spike
      ],
    },
  ],
};
