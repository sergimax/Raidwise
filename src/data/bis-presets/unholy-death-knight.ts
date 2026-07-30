import { ClassName } from "../../types/characters.ts";
import type { BuiltInSpecBis } from "../../types/bis-lists.ts";

/**
 * WotLK BiS presets for Unholy Death Knight.
 * @see https://forum.warmane.com/showthread.php?t=326654
 */
export const unholyDeathKnightBis: BuiltInSpecBis = {
  className: ClassName.DeathKnight,
  spec: "Unholy",
  presets: [
    {
      id: "kingdom-with-variants",
      name: "Kingdom. With variants",
      slots: [
        { slot: 0, itemIds: [51312] }, // Head: Sanctified Scourgelord Helmet
        { slot: 1, itemIds: [54581] }, // Neck: Penumbra Pendant
        { slot: 2, itemIds: [51314] }, // Shoulder: Sanctified Scourgelord Shoulderplates
        { slot: 3, itemIds: [50677, 47548] }, // Back: Winding Sheet / Garrosh's Rage
        { slot: 4, itemIds: [51310] }, // Chest: Sanctified Scourgelord Battleplate
        { slot: 5, itemIds: [50659] }, // Wrist: Polar Bear Claw Bracers
        { slot: 6, itemIds: [50690, 51311] }, // Hands: Fleshrending Gauntlets / Sanctified Scourgelord Gauntlets
        { slot: 7, itemIds: [50620] }, // Waist: Coldwraith Links
        { slot: 8, itemIds: [51313] }, // Legs: Sanctified Scourgelord Legplates
        { slot: 9, itemIds: [54578] }, // Feet: Apocalypse's Advance
        { slot: 10, itemIds: [52572] }, // Finger 1: Ashen Band of Endless Might
        { slot: 11, itemIds: [50657] }, // Finger 2: Skeleton Lord's Circle
        { slot: 12, itemIds: [50363] }, // Trinket 1: Deathbringer's Will
        { slot: 13, itemIds: [54590] }, // Trinket 2: Sharpened Twilight Scale
        { slot: 14, itemIds: [49623] }, // Main hand: Shadowmourne
      ],
    },
    {
      id: "titans",
      name: "Titans",
      slots: [
        { slot: 0, itemIds: [51312] }, // Head: Sanctified Scourgelord Helmet
        { slot: 1, itemIds: [54581] }, // Neck: Penumbra Pendant
        { slot: 2, itemIds: [51314] }, // Shoulder: Sanctified Scourgelord Shoulderplates
        { slot: 3, itemIds: [50677] }, // Back: Winding Sheet
        { slot: 4, itemIds: [51310] }, // Chest: Sanctified Scourgelord Battleplate
        { slot: 5, itemIds: [50659] }, // Wrist: Polar Bear Claw Bracers
        { slot: 6, itemIds: [50690] }, // Hands: Fleshrending Gauntlets
        { slot: 7, itemIds: [50620] }, // Waist: Coldwraith Links
        { slot: 8, itemIds: [51313] }, // Legs: Sanctified Scourgelord Legplates
        { slot: 9, itemIds: [54578] }, // Feet: Apocalypse's Advance
        { slot: 10, itemIds: [52572] }, // Finger 1: Ashen Band of Endless Might
        { slot: 11, itemIds: [50657] }, // Finger 2: Skeleton Lord's Circle
        { slot: 12, itemIds: [50363] }, // Trinket 1: Deathbringer's Will
        { slot: 13, itemIds: [54590] }, // Trinket 2: Sharpened Twilight Scale
        { slot: 14, itemIds: [49623] }, // Main hand: Shadowmourne
      ],
    },
    {
      id: "warmane-drakantas-udk-str",
      name: "Udk-STR (Warmane · Drakantas)",
      slots: [
        { slot: 0, itemIds: [51312] }, // Head: Sanctified Scourgelord Helmet
        { slot: 1, itemIds: [54581] }, // Neck: Penumbra Pendant
        { slot: 2, itemIds: [51314] }, // Shoulder: Sanctified Scourgelord Shoulderplates
        { slot: 3, itemIds: [50677] }, // Back: Winding Sheet
        { slot: 4, itemIds: [51310] }, // Chest: Sanctified Scourgelord Battleplate
        { slot: 5, itemIds: [54580] }, // Wrist: Umbrage Armbands
        { slot: 6, itemIds: [51311] }, // Hands: Sanctified Scourgelord Gauntlets
        { slot: 7, itemIds: [50620] }, // Waist: Coldwraith Links
        { slot: 8, itemIds: [50624] }, // Legs: Scourge Reaver's Legplates
        { slot: 9, itemIds: [54578] }, // Feet: Apocalypse's Advance
        { slot: 10, itemIds: [50693] }, // Finger 1: Might of Blight
        { slot: 11, itemIds: [52572] }, // Finger 2: Ashen Band of Endless Might
        { slot: 12, itemIds: [54590] }, // Trinket 1: Sharpened Twilight Scale
        { slot: 13, itemIds: [50363] }, // Trinket 2: Deathbringer's Will
        { slot: 14, itemIds: [49623] }, // Main hand: Shadowmourne
      ],
    },
  ],
};
