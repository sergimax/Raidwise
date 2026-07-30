import { ClassName } from "../../types/characters.ts";
import type { BuiltInSpecBis } from "../../types/bis-lists.ts";

/**
 * WotLK BiS presets for Frost Death Knight.
 */
export const frostDeathKnightBis: BuiltInSpecBis = {
  className: ClassName.DeathKnight,
  spec: "Frost",
  presets: [
    {
      id: "kingdom-with-variants",
      name: "Kingdom. With variants",
      slots: [
        { slot: 0, itemIds: [51312] }, // Head: Sanctified Scourgelord Helmet
        { slot: 1, itemIds: [54581] }, // Neck: Penumbra Pendant
        { slot: 2, itemIds: [51314] }, // Shoulder: Sanctified Scourgelord Shoulderplates
        { slot: 3, itemIds: [47547, 50467] }, // Back: Varian's Furor / Might of the Ocean Serpent
        { slot: 4, itemIds: [51310] }, // Chest: Sanctified Scourgelord Battleplate
        { slot: 5, itemIds: [54559, 50670] }, // Wrist: Bracers of the Heir / Toskk's Maximized Wristguards
        { slot: 6, itemIds: [50675, 51311] }, // Hands: Aldriana's Gloves of Secrecy / Sanctified Scourgelord Gauntlets
        { slot: 7, itemIds: [50620] }, // Waist: Coldwraith Links
        { slot: 8, itemIds: [51313] }, // Legs: Sanctified Scourgelord Legplates
        { slot: 9, itemIds: [54578] }, // Feet: Apocalypse's Advance
        { slot: 10, itemIds: [52572] }, // Finger 1: Ashen Band of Endless Might
        { slot: 11, itemIds: [50693] }, // Finger 2: Might of Blight
        { slot: 12, itemIds: [50363] }, // Trinket 1: Deathbringer's Will
        { slot: 13, itemIds: [54590] }, // Trinket 2: Sharpened Twilight Scale
        { slot: 14, itemIds: [50737] }, // Main hand: Havoc's Call, Blade of Lordaeron Kings
        { slot: 15, itemIds: [50737] }, // Off hand: Havoc's Call, Blade of Lordaeron Kings
      ],
    },
    {
      id: "titans",
      name: "Titans",
      slots: [
        { slot: 0, itemIds: [51312] }, // Head: Sanctified Scourgelord Helmet
        { slot: 1, itemIds: [54581] }, // Neck: Penumbra Pendant
        { slot: 2, itemIds: [51314] }, // Shoulder: Sanctified Scourgelord Shoulderplates
        { slot: 3, itemIds: [50467] }, // Back: Might of the Ocean Serpent
        { slot: 4, itemIds: [51310] }, // Chest: Sanctified Scourgelord Battleplate
        { slot: 5, itemIds: [50670] }, // Wrist: Toskk's Maximized Wristguards
        { slot: 6, itemIds: [50675] }, // Hands: Aldriana's Gloves of Secrecy
        { slot: 7, itemIds: [50620] }, // Waist: Coldwraith Links
        { slot: 8, itemIds: [51313] }, // Legs: Sanctified Scourgelord Legplates
        { slot: 9, itemIds: [54578] }, // Feet: Apocalypse's Advance
        { slot: 10, itemIds: [52572] }, // Finger 1: Ashen Band of Endless Might
        { slot: 11, itemIds: [50693] }, // Finger 2: Might of Blight
        { slot: 12, itemIds: [50363] }, // Trinket 1: Deathbringer's Will
        { slot: 13, itemIds: [54590] }, // Trinket 2: Sharpened Twilight Scale
        { slot: 14, itemIds: [50737] }, // Main hand: Havoc's Call, Blade of Lordaeron Kings
      ],
    },
  ],
};
