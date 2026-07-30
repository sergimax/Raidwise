import { ClassName } from "../../types/characters.ts";
import type { BuiltInSpecBis } from "../../types/bis-lists.ts";

/**
 * WotLK BiS presets for Restoration Shaman.
 */
export const restorationShamanBis: BuiltInSpecBis = {
  className: ClassName.Shaman,
  spec: "Restoration",
  presets: [
    {
      id: "kingdom-with-variants",
      name: "Kingdom. With variants",
      slots: [
        { slot: 0, itemIds: [51247] }, // Head: Sanctified Frost Witch's Headpiece
        { slot: 1, itemIds: [50724] }, // Neck: Blood Queen's Crimson Choker
        { slot: 2, itemIds: [51245] }, // Shoulder: Sanctified Frost Witch's Spaulders
        { slot: 3, itemIds: [54583] }, // Back: Cloak of Burning Dusk
        { slot: 4, itemIds: [51249] }, // Chest: Sanctified Frost Witch's Tunic
        { slot: 5, itemIds: [54584] }, // Wrist: Phaseshifter's Bracers
        { slot: 6, itemIds: [50703, 54560] }, // Hands: Unclean Surgical Gloves / Changeling Gloves
        { slot: 7, itemIds: [54587] }, // Waist: Split Shape Belt
        { slot: 8, itemIds: [51246] }, // Legs: Sanctified Frost Witch's Legguards
        { slot: 9, itemIds: [50699] }, // Feet: Plague Scientist's Boots
        { slot: 10, itemIds: [50664] }, // Finger 1: Ring of Rapid Ascent
        { slot: 11, itemIds: [54585] }, // Finger 2: Ring of Phased Regeneration
        { slot: 12, itemIds: [54589] }, // Trinket 1: Glowing Twilight Scale
        { slot: 13, itemIds: [47432, 50366] }, // Trinket 2: Solace of the Fallen / Althor's Abacus
        { slot: 14, itemIds: [50734, 46017] }, // Main hand: Royal Scepter of Terenas II / Val'anyr, Hammer of Ancient Kings
        { slot: 15, itemIds: [50616] }, // Off hand: Bulwark of Smouldering Steel
      ],
    },
    {
      id: "titans",
      name: "Titans",
      slots: [
        { slot: 0, itemIds: [51247] }, // Head: Sanctified Frost Witch's Headpiece
        { slot: 1, itemIds: [50724] }, // Neck: Blood Queen's Crimson Choker
        { slot: 2, itemIds: [51245] }, // Shoulder: Sanctified Frost Witch's Spaulders
        { slot: 3, itemIds: [54583] }, // Back: Cloak of Burning Dusk
        { slot: 4, itemIds: [51249] }, // Chest: Sanctified Frost Witch's Tunic
        { slot: 5, itemIds: [54584] }, // Wrist: Phaseshifter's Bracers
        { slot: 6, itemIds: [50703] }, // Hands: Unclean Surgical Gloves
        { slot: 7, itemIds: [54587] }, // Waist: Split Shape Belt
        { slot: 8, itemIds: [51246] }, // Legs: Sanctified Frost Witch's Legguards
        { slot: 9, itemIds: [50699] }, // Feet: Plague Scientist's Boots
        { slot: 10, itemIds: [50664] }, // Finger 1: Ring of Rapid Ascent
        { slot: 11, itemIds: [54585] }, // Finger 2: Ring of Phased Regeneration
        { slot: 12, itemIds: [54589] }, // Trinket 1: Glowing Twilight Scale
        { slot: 13, itemIds: [50366] }, // Trinket 2: Althor's Abacus
        { slot: 14, itemIds: [50734] }, // Main hand: Royal Scepter of Terenas II
        { slot: 15, itemIds: [50616] }, // Off hand: Bulwark of Smouldering Steel
      ],
    },
  ],
};
