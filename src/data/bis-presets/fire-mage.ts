import { ClassName } from "../../types/characters.ts";
import type { BuiltInSpecBis } from "../../types/bis-lists.ts";

/**
 * WotLK BiS presets for Fire Mage.
 */
export const fireMageBis: BuiltInSpecBis = {
  className: ClassName.Mage,
  spec: "Fire",
  presets: [
    {
      id: "kingdom-with-variants",
      name: "Kingdom. With variants",
      slots: [
        { slot: 0, itemIds: [51281] }, // Head: Sanctified Bloodmage Hood
        { slot: 1, itemIds: [50724] }, // Neck: Blood Queen's Crimson Choker
        { slot: 2, itemIds: [51284] }, // Shoulder: Sanctified Bloodmage Shoulderpads
        { slot: 3, itemIds: [54583] }, // Back: Cloak of Burning Dusk
        { slot: 4, itemIds: [50629] }, // Chest: Robe of the Waking Nightmare
        { slot: 5, itemIds: [54582] }, // Wrist: Bracers of Fiery Night
        { slot: 6, itemIds: [51280] }, // Hands: Sanctified Bloodmage Gloves
        { slot: 7, itemIds: [50613] }, // Waist: Crushing Coldwraith Belt
        { slot: 8, itemIds: [51282] }, // Legs: Sanctified Bloodmage Leggings
        { slot: 9, itemIds: [50699] }, // Feet: Plague Scientist's Boots
        { slot: 10, itemIds: [50398] }, // Finger 1: Ashen Band of Endless Destruction
        { slot: 11, itemIds: [50664, 50614] }, // Finger 2: Ring of Rapid Ascent / Loop of the Endless Labyrinth
        { slot: 12, itemIds: [54588] }, // Trinket 1: Charred Twilight Scale
        { slot: 13, itemIds: [50365] }, // Trinket 2: Phylactery of the Nameless Lich
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
        { slot: 4, itemIds: [50629] }, // Chest: Robe of the Waking Nightmare
        { slot: 5, itemIds: [54582] }, // Wrist: Bracers of Fiery Night
        { slot: 6, itemIds: [51280] }, // Hands: Sanctified Bloodmage Gloves
        { slot: 7, itemIds: [50613] }, // Waist: Crushing Coldwraith Belt
        { slot: 8, itemIds: [51282] }, // Legs: Sanctified Bloodmage Leggings
        { slot: 9, itemIds: [50699] }, // Feet: Plague Scientist's Boots
        { slot: 10, itemIds: [50398] }, // Finger 1: Ashen Band of Endless Destruction
        { slot: 11, itemIds: [50614] }, // Finger 2: Loop of the Endless Labyrinth
        { slot: 12, itemIds: [54588] }, // Trinket 1: Charred Twilight Scale
        { slot: 13, itemIds: [50365] }, // Trinket 2: Phylactery of the Nameless Lich
        { slot: 14, itemIds: [50732] }, // Main hand: Bloodsurge, Kel'Thuzad's Blade of Agony
        { slot: 15, itemIds: [50719] }, // Off hand: Shadow Silk Spindle
        { slot: 16, itemIds: [50684] }, // Ranged: Corpse-Impaling Spike
      ],
    },
  ],
};
