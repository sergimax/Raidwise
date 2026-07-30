import { ClassName } from "../../types/characters.ts";
import type { BuiltInSpecBis } from "../../types/bis-lists.ts";

/**
 * WotLK BiS presets for Retribution Paladin.
 */
export const retributionPaladinBis: BuiltInSpecBis = {
  className: ClassName.Paladin,
  spec: "Retribution",
  presets: [
    {
      id: "kingdom-with-variants",
      name: "Kingdom. With variants",
      slots: [
        { slot: 0, itemIds: [51277] }, // Head: Sanctified Lightsworn Helmet
        { slot: 1, itemIds: [54581] }, // Neck: Penumbra Pendant
        { slot: 2, itemIds: [51279] }, // Shoulder: Sanctified Lightsworn Shoulderplates
        { slot: 3, itemIds: [50653] }, // Back: Shadowvault Slayer's Cloak
        { slot: 4, itemIds: [51275] }, // Chest: Sanctified Lightsworn Battleplate
        { slot: 5, itemIds: [54580] }, // Wrist: Umbrage Armbands
        { slot: 6, itemIds: [50690] }, // Hands: Fleshrending Gauntlets
        { slot: 7, itemIds: [50707] }, // Waist: Astrylian's Sutured Cinch
        { slot: 8, itemIds: [51278] }, // Legs: Sanctified Lightsworn Legplates
        { slot: 9, itemIds: [54578] }, // Feet: Apocalypse's Advance
        { slot: 10, itemIds: [50402] }, // Finger 1: Ashen Band of Endless Vengeance
        { slot: 11, itemIds: [54576] }, // Finger 2: Signet of Twilight
        { slot: 12, itemIds: [50706] }, // Trinket 1: Tiny Abomination in a Jar
        { slot: 13, itemIds: [54590] }, // Trinket 2: Sharpened Twilight Scale
        { slot: 14, itemIds: [49623, 50727, 50735] }, // Main hand: Shadowmourne / Bloodfall / Oathbinder, Charge of the Ranger-General
      ],
    },
    {
      id: "titans",
      name: "Titans",
      slots: [
        { slot: 0, itemIds: [51277] }, // Head: Sanctified Lightsworn Helmet
        { slot: 1, itemIds: [54581] }, // Neck: Penumbra Pendant
        { slot: 2, itemIds: [51279] }, // Shoulder: Sanctified Lightsworn Shoulderplates
        { slot: 3, itemIds: [50653] }, // Back: Shadowvault Slayer's Cloak
        { slot: 4, itemIds: [51275] }, // Chest: Sanctified Lightsworn Battleplate
        { slot: 5, itemIds: [54580] }, // Wrist: Umbrage Armbands
        { slot: 6, itemIds: [50690] }, // Hands: Fleshrending Gauntlets
        { slot: 7, itemIds: [50707] }, // Waist: Astrylian's Sutured Cinch
        { slot: 8, itemIds: [51278] }, // Legs: Sanctified Lightsworn Legplates
        { slot: 9, itemIds: [54578] }, // Feet: Apocalypse's Advance
        { slot: 10, itemIds: [50402] }, // Finger 1: Ashen Band of Endless Vengeance
        { slot: 11, itemIds: [54576] }, // Finger 2: Signet of Twilight
        { slot: 12, itemIds: [50706] }, // Trinket 1: Tiny Abomination in a Jar
        { slot: 13, itemIds: [54590] }, // Trinket 2: Sharpened Twilight Scale
        { slot: 14, itemIds: [49623] }, // Main hand: Shadowmourne
      ],
    },
  ],
};
