import { ClassName } from "../../types/characters.ts";
import type { BuiltInSpecBis } from "../../types/bis-lists.ts";

/**
 * WotLK BiS presets for Feral Druid.
 * @see https://forum.warmane.com/showthread.php?t=431156
 * @see https://forum.wowcircle.com/showthread.php?t=2727
 * @see https://www.icy-veins.com/wotlk-classic/feral-druid-dps-pve-gear-best-in-slot?area=phase_5
 */
export const feralDruidBis: BuiltInSpecBis = {
  className: ClassName.Druid,
  spec: "Feral",
  presets: [
    {
      id: "kingdom-with-variants",
      name: "Kingdom. With variants",
      slots: [
        { slot: 0, itemIds: [51296] }, // Head: Sanctified Lasherweave Headguard
        { slot: 1, itemIds: [50633, 54581] }, // Neck: Sindragosa's Cruel Claw / Penumbra Pendant
        { slot: 2, itemIds: [51299] }, // Shoulder: Sanctified Lasherweave Shoulderpads
        { slot: 3, itemIds: [50653, 47546, 50470] }, // Back: Shadowvault Slayer's Cloak / Sylvanas' Cunning / Recovered Scarlet Onslaught Cape
        { slot: 4, itemIds: [51300] }, // Chest: Sanctified Lasherweave Robes
        { slot: 5, itemIds: [54580] }, // Wrist: Umbrage Armbands
        { slot: 6, itemIds: [50675] }, // Hands: Aldriana's Gloves of Secrecy
        { slot: 7, itemIds: [50707] }, // Waist: Astrylian's Sutured Cinch
        { slot: 8, itemIds: [51297] }, // Legs: Sanctified Lasherweave Legguards
        { slot: 9, itemIds: [50607] }, // Feet: Frostbitten Fur Boots
        { slot: 10, itemIds: [50402] }, // Finger 1: Ashen Band of Endless Vengeance
        { slot: 11, itemIds: [54576, 50604] }, // Finger 2: Signet of Twilight / Band of the Bone Colossus
        { slot: 12, itemIds: [50363] }, // Trinket 1: Deathbringer's Will
        { slot: 13, itemIds: [54590] }, // Trinket 2: Sharpened Twilight Scale
        { slot: 14, itemIds: [50735] }, // Main hand: Oathbinder, Charge of the Ranger-General
      ],
    },
    {
      id: "titans",
      name: "Titans",
      slots: [
        { slot: 0, itemIds: [51296] }, // Head: Sanctified Lasherweave Headguard
        { slot: 1, itemIds: [50633] }, // Neck: Sindragosa's Cruel Claw
        { slot: 2, itemIds: [51299] }, // Shoulder: Sanctified Lasherweave Shoulderpads
        { slot: 3, itemIds: [47546] }, // Back: Sylvanas' Cunning
        { slot: 4, itemIds: [51300] }, // Chest: Sanctified Lasherweave Robes
        { slot: 5, itemIds: [54580] }, // Wrist: Umbrage Armbands
        { slot: 6, itemIds: [50675] }, // Hands: Aldriana's Gloves of Secrecy
        { slot: 7, itemIds: [50707] }, // Waist: Astrylian's Sutured Cinch
        { slot: 8, itemIds: [51297] }, // Legs: Sanctified Lasherweave Legguards
        { slot: 9, itemIds: [50607] }, // Feet: Frostbitten Fur Boots
        { slot: 10, itemIds: [50402] }, // Finger 1: Ashen Band of Endless Vengeance
        { slot: 11, itemIds: [54576] }, // Finger 2: Signet of Twilight
        { slot: 12, itemIds: [50363] }, // Trinket 1: Deathbringer's Will
        { slot: 13, itemIds: [54590] }, // Trinket 2: Sharpened Twilight Scale
        { slot: 14, itemIds: [50735] }, // Main hand: Oathbinder, Charge of the Ranger-General
      ],
    },
    {
      id: "warmane-ayizan-feral-cat",
      name: "Feral Cat (Warmane · Ayizan)",
      slots: [
        { slot: 0, itemIds: [51296] }, // Head: Sanctified Lasherweave Headguard
        { slot: 1, itemIds: [50633] }, // Neck: Sindragosa's Cruel Claw
        { slot: 2, itemIds: [51299] }, // Shoulder: Sanctified Lasherweave Shoulderpads
        { slot: 3, itemIds: [50653] }, // Back: Shadowvault Slayer's Cloak
        { slot: 4, itemIds: [51298] }, // Chest: Sanctified Lasherweave Raiment
        { slot: 5, itemIds: [50670, 54580] }, // Wrist: Toskk's Maximized Wristguards / Umbrage Armbands
        { slot: 6, itemIds: [50675] }, // Hands: Aldriana's Gloves of Secrecy
        { slot: 7, itemIds: [50707] }, // Waist: Astrylian's Sutured Cinch
        { slot: 8, itemIds: [51297] }, // Legs: Sanctified Lasherweave Legguards
        { slot: 9, itemIds: [50607] }, // Feet: Frostbitten Fur Boots
        { slot: 10, itemIds: [50618, 54576] }, // Finger 1: Frostbrood Sapphire Ring / Signet of Twilight
        { slot: 11, itemIds: [50402] }, // Finger 2: Ashen Band of Endless Vengeance
        { slot: 12, itemIds: [54590] }, // Trinket 1: Sharpened Twilight Scale
        { slot: 13, itemIds: [50363] }, // Trinket 2: Deathbringer's Will
        { slot: 14, itemIds: [50735] }, // Main hand: Oathbinder, Charge of the Ranger-General
        { slot: 16, itemIds: [50456] }, // Ranged: Idol of the Crying Moon
      ],
    },
    {
      id: "circle-decay-feral-dd",
      name: "Feral DD (Circle · Decay)",
      slots: [
        { slot: 0, itemIds: [51296] }, // Head: Sanctified Lasherweave Headguard
        { slot: 1, itemIds: [50633] }, // Neck: Sindragosa's Cruel Claw
        { slot: 2, itemIds: [51299] }, // Shoulder: Sanctified Lasherweave Shoulderpads
        { slot: 3, itemIds: [50653] }, // Back: Shadowvault Slayer's Cloak
        { slot: 4, itemIds: [51298] }, // Chest: Sanctified Lasherweave Raiment
        { slot: 5, itemIds: [54580] }, // Wrist: Umbrage Armbands
        { slot: 6, itemIds: [50675] }, // Hands: Aldriana's Gloves of Secrecy
        { slot: 7, itemIds: [50707] }, // Waist: Astrylian's Sutured Cinch
        { slot: 8, itemIds: [51297] }, // Legs: Sanctified Lasherweave Legguards
        { slot: 9, itemIds: [50607] }, // Feet: Frostbitten Fur Boots
        { slot: 10, itemIds: [50604] }, // Finger 1: Band of the Bone Colossus
        { slot: 11, itemIds: [50402] }, // Finger 2: Ashen Band of Endless Vengeance
        { slot: 12, itemIds: [54590] }, // Trinket 1: Sharpened Twilight Scale
        { slot: 13, itemIds: [50363] }, // Trinket 2: Deathbringer's Will
        { slot: 14, itemIds: [50735] }, // Main hand: Oathbinder, Charge of the Ranger-General
      ],
    },
    {
      id: "icy-veins-seksixeny-feral-dps",
      name: "Feral DPS (Icy-Veins · Seksixeny)",
      slots: [
        { slot: 0, itemIds: [51296] }, // Head: Sanctified Lasherweave Headguard
        { slot: 1, itemIds: [50633] }, // Neck: Sindragosa's Cruel Claw
        { slot: 2, itemIds: [51299] }, // Shoulder: Sanctified Lasherweave Shoulderpads
        { slot: 3, itemIds: [50653] }, // Back: Shadowvault Slayer's Cloak
        { slot: 4, itemIds: [51298] }, // Chest: Sanctified Lasherweave Raiment
        { slot: 5, itemIds: [54580] }, // Wrist: Umbrage Armbands
        { slot: 6, itemIds: [50675] }, // Hands: Aldriana's Gloves of Secrecy
        { slot: 7, itemIds: [50707] }, // Waist: Astrylian's Sutured Cinch
        { slot: 8, itemIds: [51297] }, // Legs: Sanctified Lasherweave Legguards
        { slot: 9, itemIds: [50607] }, // Feet: Frostbitten Fur Boots
        { slot: 10, itemIds: [54576] }, // Finger 1: Signet of Twilight
        { slot: 11, itemIds: [50604] }, // Finger 2: Band of the Bone Colossus
        { slot: 12, itemIds: [50363] }, // Trinket 1: Deathbringer's Will
        { slot: 13, itemIds: [54590] }, // Trinket 2: Sharpened Twilight Scale
        { slot: 14, itemIds: [50735] }, // Main hand: Oathbinder, Charge of the Ranger-General
        { slot: 16, itemIds: [50456] }, // Ranged: Idol of the Crying Moon
      ],
    },
  ],
};
