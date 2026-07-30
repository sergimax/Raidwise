import { ClassName } from "../../types/characters.ts";
import type { BuiltInSpecBis } from "../../types/bis-lists.ts";

/**
 * WotLK BiS presets for Combat Rogue.
 */
export const combatRogueBis: BuiltInSpecBis = {
  className: ClassName.Rogue,
  spec: "Combat",
  presets: [
    {
      id: "kingdom-with-variants",
      name: "Kingdom. With variants",
      slots: [
        { slot: 0, itemIds: [51252] }, // Head: Sanctified Shadowblade Helmet
        { slot: 1, itemIds: [50633] }, // Neck: Sindragosa's Cruel Claw
        { slot: 2, itemIds: [51254] }, // Shoulder: Sanctified Shadowblade Pauldrons
        { slot: 3, itemIds: [50653, 47546, 50470] }, // Back: Shadowvault Slayer's Cloak / Sylvanas' Cunning / Recovered Scarlet Onslaught Cape
        { slot: 4, itemIds: [51250] }, // Chest: Sanctified Shadowblade Breastplate
        { slot: 5, itemIds: [50670, 54580] }, // Wrist: Toskk's Maximized Wristguards / Umbrage Armbands
        { slot: 6, itemIds: [50675] }, // Hands: Aldriana's Gloves of Secrecy
        { slot: 7, itemIds: [50707] }, // Waist: Astrylian's Sutured Cinch
        { slot: 8, itemIds: [51253] }, // Legs: Sanctified Shadowblade Legplates
        { slot: 9, itemIds: [50607] }, // Feet: Frostbitten Fur Boots
        { slot: 10, itemIds: [50402] }, // Finger 1: Ashen Band of Endless Vengeance
        { slot: 11, itemIds: [50618, 54576] }, // Finger 2: Frostbrood Sapphire Ring / Signet of Twilight
        { slot: 12, itemIds: [50363] }, // Trinket 1: Deathbringer's Will
        { slot: 13, itemIds: [54590] }, // Trinket 2: Sharpened Twilight Scale
        { slot: 14, itemIds: [50737] }, // Main hand: Havoc's Call, Blade of Lordaeron Kings
        { slot: 15, itemIds: [50654] }, // Off hand: Scourgeborne Waraxe
        { slot: 16, itemIds: [50733] }, // Ranged: Fal'inrush, Defender of Quel'thalas
      ],
    },
    {
      id: "titans",
      name: "Titans",
      slots: [
        { slot: 0, itemIds: [51252] }, // Head: Sanctified Shadowblade Helmet
        { slot: 1, itemIds: [50633] }, // Neck: Sindragosa's Cruel Claw
        { slot: 2, itemIds: [51254] }, // Shoulder: Sanctified Shadowblade Pauldrons
        { slot: 3, itemIds: [47546] }, // Back: Sylvanas' Cunning
        { slot: 4, itemIds: [51250] }, // Chest: Sanctified Shadowblade Breastplate
        { slot: 5, itemIds: [54580] }, // Wrist: Umbrage Armbands
        { slot: 6, itemIds: [50675] }, // Hands: Aldriana's Gloves of Secrecy
        { slot: 7, itemIds: [50707] }, // Waist: Astrylian's Sutured Cinch
        { slot: 8, itemIds: [51253] }, // Legs: Sanctified Shadowblade Legplates
        { slot: 9, itemIds: [50607] }, // Feet: Frostbitten Fur Boots
        { slot: 10, itemIds: [50402] }, // Finger 1: Ashen Band of Endless Vengeance
        { slot: 11, itemIds: [54576] }, // Finger 2: Signet of Twilight
        { slot: 12, itemIds: [50363] }, // Trinket 1: Deathbringer's Will
        { slot: 13, itemIds: [54590] }, // Trinket 2: Sharpened Twilight Scale
        { slot: 14, itemIds: [50737] }, // Main hand: Havoc's Call, Blade of Lordaeron Kings
        { slot: 15, itemIds: [50654] }, // Off hand: Scourgeborne Waraxe
        { slot: 16, itemIds: [50733] }, // Ranged: Fal'inrush, Defender of Quel'thalas
      ],
    },
  ],
};
