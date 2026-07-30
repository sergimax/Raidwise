import { ClassName } from "../../types/characters.ts";
import type { BuiltInSpecBis } from "../../types/bis-lists.ts";

/**
 * WotLK BiS presets for Elemental Shaman.
 */
export const elementalShamanBis: BuiltInSpecBis = {
  className: ClassName.Shaman,
  spec: "Elemental",
  presets: [
    {
      id: "kingdom-with-variants",
      name: "Kingdom. With variants",
      slots: [
        { slot: 0, itemIds: [51247] }, // Head: Sanctified Frost Witch's Headpiece
        { slot: 1, itemIds: [50724] }, // Neck: Blood Queen's Crimson Choker
        { slot: 2, itemIds: [50698] }, // Shoulder: Horrific Flesh Epaulets
        { slot: 3, itemIds: [54583] }, // Back: Cloak of Burning Dusk
        { slot: 4, itemIds: [51249] }, // Chest: Sanctified Frost Witch's Tunic
        { slot: 5, itemIds: [54584] }, // Wrist: Phaseshifter's Bracers
        { slot: 6, itemIds: [51248] }, // Hands: Sanctified Frost Witch's Handguards
        { slot: 7, itemIds: [54587] }, // Waist: Split Shape Belt
        { slot: 8, itemIds: [51246] }, // Legs: Sanctified Frost Witch's Legguards
        { slot: 9, itemIds: [50699] }, // Feet: Plague Scientist's Boots
        { slot: 10, itemIds: [50398] }, // Finger 1: Ashen Band of Endless Destruction
        { slot: 11, itemIds: [50614, 50714] }, // Finger 2: Loop of the Endless Labyrinth / Valanar's Other Signet Ring
        { slot: 12, itemIds: [54588] }, // Trinket 1: Charred Twilight Scale
        { slot: 13, itemIds: [50365] }, // Trinket 2: Phylactery of the Nameless Lich
        { slot: 14, itemIds: [50734] }, // Main hand: Royal Scepter of Terenas II
        { slot: 15, itemIds: [50616] }, // Off hand: Bulwark of Smouldering Steel
      ],
    },
    {
      id: "titans",
      name: "Titans",
      slots: [
        { slot: 0, itemIds: [51247] }, // Head: Sanctified Frost Witch's Headpiece
        { slot: 1, itemIds: [50724] }, // Neck: Blood Queen's Crimson Choker
        { slot: 2, itemIds: [50698] }, // Shoulder: Horrific Flesh Epaulets
        { slot: 3, itemIds: [54583] }, // Back: Cloak of Burning Dusk
        { slot: 4, itemIds: [51249] }, // Chest: Sanctified Frost Witch's Tunic
        { slot: 5, itemIds: [54584] }, // Wrist: Phaseshifter's Bracers
        { slot: 6, itemIds: [51248] }, // Hands: Sanctified Frost Witch's Handguards
        { slot: 7, itemIds: [54587] }, // Waist: Split Shape Belt
        { slot: 8, itemIds: [51246] }, // Legs: Sanctified Frost Witch's Legguards
        { slot: 9, itemIds: [50699] }, // Feet: Plague Scientist's Boots
        { slot: 10, itemIds: [50398] }, // Finger 1: Ashen Band of Endless Destruction
        { slot: 11, itemIds: [50614] }, // Finger 2: Loop of the Endless Labyrinth
        { slot: 12, itemIds: [54588] }, // Trinket 1: Charred Twilight Scale
        { slot: 13, itemIds: [50365] }, // Trinket 2: Phylactery of the Nameless Lich
        { slot: 14, itemIds: [50734] }, // Main hand: Royal Scepter of Terenas II
        { slot: 15, itemIds: [50616] }, // Off hand: Bulwark of Smouldering Steel
      ],
    },
  ],
};
