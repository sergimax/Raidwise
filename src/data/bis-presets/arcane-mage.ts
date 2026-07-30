import { ClassName } from "../../types/characters.ts";
import type { BuiltInSpecBis } from "../../types/bis-lists.ts";

/**
 * WotLK BiS presets for Arcane Mage.
 */
export const arcaneMageBis: BuiltInSpecBis = {
  className: ClassName.Mage,
  spec: "Arcane",
  presets: [
    {
      id: "kingdom-with-variants",
      name: "Kingdom. With variants",
      slots: [
        { slot: 0, itemIds: [51281] }, // Head: Sanctified Bloodmage Hood
        { slot: 1, itemIds: [50724] }, // Neck: Blood Queen's Crimson Choker
        { slot: 2, itemIds: [51284] }, // Shoulder: Sanctified Bloodmage Shoulderpads
        { slot: 3, itemIds: [54583] }, // Back: Cloak of Burning Dusk
        { slot: 4, itemIds: [51283] }, // Chest: Sanctified Bloodmage Robe
        { slot: 5, itemIds: [54582] }, // Wrist: Bracers of Fiery Night
        { slot: 6, itemIds: [51280] }, // Hands: Sanctified Bloodmage Gloves
        { slot: 7, itemIds: [50613] }, // Waist: Crushing Coldwraith Belt
        { slot: 8, itemIds: [50694] }, // Legs: Plaguebringer's Stained Pants
        { slot: 9, itemIds: [50699] }, // Feet: Plague Scientist's Boots
        { slot: 10, itemIds: [50398] }, // Finger 1: Ashen Band of Endless Destruction
        { slot: 11, itemIds: [50664] }, // Finger 2: Ring of Rapid Ascent
        { slot: 12, itemIds: [54588] }, // Trinket 1: Charred Twilight Scale
        { slot: 13, itemIds: [50348] }, // Trinket 2: Dislodged Foreign Object
        { slot: 14, itemIds: [50732] }, // Main hand: Bloodsurge, Kel'Thuzad's Blade of Agony
        { slot: 15, itemIds: [50719] }, // Off hand: Shadow Silk Spindle
        { slot: 16, itemIds: [50684] }, // Ranged: Corpse-Impaling Spike
      ],
    },
    {
      id: "titans",
      name: "Titans",
      slots: [
        { slot: 0, itemIds: [51281] }, // Head: Sanctified Bloodmage Hood
        { slot: 1, itemIds: [50724] }, // Neck: Blood Queen's Crimson Choker
        { slot: 2, itemIds: [51284] }, // Shoulder: Sanctified Bloodmage Shoulderpads
        { slot: 3, itemIds: [54583] }, // Back: Cloak of Burning Dusk
        { slot: 4, itemIds: [51283] }, // Chest: Sanctified Bloodmage Robe
        { slot: 5, itemIds: [54582] }, // Wrist: Bracers of Fiery Night
        { slot: 6, itemIds: [51280] }, // Hands: Sanctified Bloodmage Gloves
        { slot: 7, itemIds: [50613] }, // Waist: Crushing Coldwraith Belt
        { slot: 8, itemIds: [50694] }, // Legs: Plaguebringer's Stained Pants
        { slot: 9, itemIds: [50699] }, // Feet: Plague Scientist's Boots
        { slot: 10, itemIds: [50398] }, // Finger 1: Ashen Band of Endless Destruction
        { slot: 11, itemIds: [50664] }, // Finger 2: Ring of Rapid Ascent
        { slot: 12, itemIds: [54588] }, // Trinket 1: Charred Twilight Scale
        { slot: 13, itemIds: [50348] }, // Trinket 2: Dislodged Foreign Object
        { slot: 14, itemIds: [50732] }, // Main hand: Bloodsurge, Kel'Thuzad's Blade of Agony
        { slot: 15, itemIds: [50719] }, // Off hand: Shadow Silk Spindle
        { slot: 16, itemIds: [50684] }, // Ranged: Corpse-Impaling Spike
      ],
    },
  ],
};
