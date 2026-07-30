import { ClassName } from "../../types/characters.ts";
import type { BuiltInSpecBis } from "../../types/bis-lists.ts";

/**
 * WotLK BiS presets for Holy Paladin.
 */
export const holyPaladinBis: BuiltInSpecBis = {
  className: ClassName.Paladin,
  spec: "Holy",
  presets: [
    {
      id: "kingdom-with-variants",
      name: "Kingdom. With variants",
      slots: [
        { slot: 0, itemIds: [51272] }, // Head: Sanctified Lightsworn Headpiece
        { slot: 1, itemIds: [50724] }, // Neck: Blood Queen's Crimson Choker
        { slot: 2, itemIds: [51273] }, // Shoulder: Sanctified Lightsworn Spaulders
        { slot: 3, itemIds: [54583] }, // Back: Cloak of Burning Dusk
        { slot: 4, itemIds: [50680] }, // Chest: Rot-Resistant Breastplate
        { slot: 5, itemIds: [54584] }, // Wrist: Phaseshifter's Bracers
        { slot: 6, itemIds: [50650] }, // Hands: Fallen Lord's Handguards
        { slot: 7, itemIds: [54587] }, // Waist: Split Shape Belt
        { slot: 8, itemIds: [49891, 50694] }, // Legs: Leggings of Woven Death / Plaguebringer's Stained Pants
        { slot: 9, itemIds: [54586] }, // Feet: Foreshadow Steps
        { slot: 10, itemIds: [50664] }, // Finger 1: Ring of Rapid Ascent
        { slot: 11, itemIds: [54585] }, // Finger 2: Ring of Phased Regeneration
        { slot: 12, itemIds: [54589] }, // Trinket 1: Glowing Twilight Scale
        { slot: 13, itemIds: [48724, 46051, 54588] }, // Trinket 2: Talisman of Resurgence / Meteorite Crystal / Charred Twilight Scale
        { slot: 14, itemIds: [50732, 50734, 46017] }, // Main hand: Bloodsurge, Kel'Thuzad's Blade of Agony / Royal Scepter of Terenas II / Val'anyr, Hammer of Ancient Kings
        { slot: 15, itemIds: [50616] }, // Off hand: Bulwark of Smouldering Steel
      ],
    },
    {
      id: "titans",
      name: "Titans",
      slots: [
        { slot: 0, itemIds: [51272] }, // Head: Sanctified Lightsworn Headpiece
        { slot: 1, itemIds: [50724] }, // Neck: Blood Queen's Crimson Choker
        { slot: 2, itemIds: [51273] }, // Shoulder: Sanctified Lightsworn Spaulders
        { slot: 3, itemIds: [54583] }, // Back: Cloak of Burning Dusk
        { slot: 4, itemIds: [50680] }, // Chest: Rot-Resistant Breastplate
        { slot: 5, itemIds: [54584] }, // Wrist: Phaseshifter's Bracers
        { slot: 6, itemIds: [50650] }, // Hands: Fallen Lord's Handguards
        { slot: 7, itemIds: [54587] }, // Waist: Split Shape Belt
        { slot: 8, itemIds: [49891] }, // Legs: Leggings of Woven Death
        { slot: 9, itemIds: [54586] }, // Feet: Foreshadow Steps
        { slot: 10, itemIds: [50664] }, // Finger 1: Ring of Rapid Ascent
        { slot: 11, itemIds: [54585] }, // Finger 2: Ring of Phased Regeneration
        { slot: 12, itemIds: [54589] }, // Trinket 1: Glowing Twilight Scale
        { slot: 14, itemIds: [50734] }, // Main hand: Royal Scepter of Terenas II
        { slot: 15, itemIds: [50616] }, // Off hand: Bulwark of Smouldering Steel
      ],
    },
  ],
};
