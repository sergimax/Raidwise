import { ClassName } from "../../types/characters.ts";
import type { BuiltInSpecBis } from "../../types/bis-lists.ts";

/**
 * WotLK BiS presets for Balance Druid.
 */
export const balanceDruidBis: BuiltInSpecBis = {
  className: ClassName.Druid,
  spec: "Balance",
  presets: [
    {
      id: "kingdom-with-variants",
      name: "Kingdom. With variants",
      slots: [
        { slot: 0, itemIds: [51290] }, // Head: Sanctified Lasherweave Cover
        { slot: 1, itemIds: [50724] }, // Neck: Blood Queen's Crimson Choker
        { slot: 2, itemIds: [51292] }, // Shoulder: Sanctified Lasherweave Mantle
        { slot: 3, itemIds: [54583] }, // Back: Cloak of Burning Dusk
        { slot: 4, itemIds: [51294] }, // Chest: Sanctified Lasherweave Vestment
        { slot: 5, itemIds: [54584] }, // Wrist: Phaseshifter's Bracers
        { slot: 6, itemIds: [51291] }, // Hands: Sanctified Lasherweave Gloves
        { slot: 7, itemIds: [50613] }, // Waist: Crushing Coldwraith Belt
        { slot: 8, itemIds: [51293] }, // Legs: Sanctified Lasherweave Trousers
        { slot: 9, itemIds: [50699] }, // Feet: Plague Scientist's Boots
        { slot: 10, itemIds: [50614] }, // Finger 1: Loop of the Endless Labyrinth
        { slot: 11, itemIds: [50398, 50714] }, // Finger 2: Ashen Band of Endless Destruction / Valanar's Other Signet Ring
        { slot: 12, itemIds: [54588] }, // Trinket 1: Charred Twilight Scale
        { slot: 13, itemIds: [50365] }, // Trinket 2: Phylactery of the Nameless Lich
        { slot: 14, itemIds: [50734] }, // Main hand: Royal Scepter of Terenas II
        { slot: 15, itemIds: [50719] }, // Off hand: Shadow Silk Spindle
      ],
    },
    {
      id: "titans",
      name: "Titans",
      slots: [
        { slot: 0, itemIds: [51290] }, // Head: Sanctified Lasherweave Cover
        { slot: 1, itemIds: [50724] }, // Neck: Blood Queen's Crimson Choker
        { slot: 2, itemIds: [51292] }, // Shoulder: Sanctified Lasherweave Mantle
        { slot: 3, itemIds: [54583] }, // Back: Cloak of Burning Dusk
        { slot: 4, itemIds: [51294] }, // Chest: Sanctified Lasherweave Vestment
        { slot: 5, itemIds: [54584] }, // Wrist: Phaseshifter's Bracers
        { slot: 6, itemIds: [51291] }, // Hands: Sanctified Lasherweave Gloves
        { slot: 7, itemIds: [50613] }, // Waist: Crushing Coldwraith Belt
        { slot: 8, itemIds: [51293] }, // Legs: Sanctified Lasherweave Trousers
        { slot: 9, itemIds: [50699] }, // Feet: Plague Scientist's Boots
        { slot: 10, itemIds: [50398] }, // Finger 1: Ashen Band of Endless Destruction
        { slot: 11, itemIds: [50614] }, // Finger 2: Loop of the Endless Labyrinth
        { slot: 12, itemIds: [54588] }, // Trinket 1: Charred Twilight Scale
        { slot: 13, itemIds: [50365] }, // Trinket 2: Phylactery of the Nameless Lich
        { slot: 14, itemIds: [50734] }, // Main hand: Royal Scepter of Terenas II
        { slot: 15, itemIds: [50719] }, // Off hand: Shadow Silk Spindle
      ],
    },
  ],
};
