import { ClassName } from "../../types/characters.ts";
import type { BuiltInSpecBis } from "../../types/bis-lists.ts";

/**
 * WotLK BiS presets for Enhancement Shaman.
 * @see https://forum.wowcircle.com/showthread.php?t=419089
 * @see https://forum.warmane.com/showthread.php?t=311020
 * @see https://www.icy-veins.com/wotlk-classic/enhancement-shaman-dps-pve-gear-best-in-slot
 */
export const enhancementShamanBis: BuiltInSpecBis = {
  className: ClassName.Shaman,
  spec: "Enhancement",
  presets: [
    {
      id: "kingdom-with-variants",
      name: "Kingdom. With variants",
      slots: [
        { slot: 0, itemIds: [51247] }, // Head: Sanctified Frost Witch's Headpiece
        { slot: 1, itemIds: [51890, 50633] }, // Neck: Precious's Putrid Collar / Sindragosa's Cruel Claw
        { slot: 2, itemIds: [51245] }, // Shoulder: Sanctified Frost Witch's Spaulders
        { slot: 3, itemIds: [50653] }, // Back: Shadowvault Slayer's Cloak
        { slot: 4, itemIds: [51249] }, // Chest: Sanctified Frost Witch's Tunic
        { slot: 5, itemIds: [54580] }, // Wrist: Umbrage Armbands
        { slot: 6, itemIds: [50619] }, // Hands: Anub'ar Stalker's Gloves
        { slot: 7, itemIds: [50688, 51853] }, // Waist: Nerub'ar Stalker's Cord / Blood-Drinker's Girdle
        { slot: 8, itemIds: [51246] }, // Legs: Sanctified Frost Witch's Legguards
        { slot: 9, itemIds: [54577] }, // Feet: Returning Footfalls
        { slot: 10, itemIds: [50402, 54576] }, // Finger 1: Ashen Band of Endless Vengeance / Signet of Twilight
        { slot: 11, itemIds: [50604] }, // Finger 2: Band of the Bone Colossus
        { slot: 12, itemIds: [54590] }, // Trinket 1: Sharpened Twilight Scale
        { slot: 13, itemIds: [50363, 50355] }, // Trinket 2: Deathbringer's Will / Herkuml War Token
        { slot: 14, itemIds: [50737] }, // Main hand: Havoc's Call, Blade of Lordaeron Kings
        { slot: 15, itemIds: [50737] }, // Off hand: Havoc's Call, Blade of Lordaeron Kings
      ],
    },
    {
      id: "titans",
      name: "Titans",
      slots: [
        { slot: 0, itemIds: [51247] }, // Head: Sanctified Frost Witch's Headpiece
        { slot: 1, itemIds: [51890] }, // Neck: Precious's Putrid Collar
        { slot: 2, itemIds: [51245] }, // Shoulder: Sanctified Frost Witch's Spaulders
        { slot: 3, itemIds: [50653] }, // Back: Shadowvault Slayer's Cloak
        { slot: 4, itemIds: [51249] }, // Chest: Sanctified Frost Witch's Tunic
        { slot: 5, itemIds: [54580] }, // Wrist: Umbrage Armbands
        { slot: 6, itemIds: [50619] }, // Hands: Anub'ar Stalker's Gloves
        { slot: 7, itemIds: [50688] }, // Waist: Nerub'ar Stalker's Cord
        { slot: 8, itemIds: [51246] }, // Legs: Sanctified Frost Witch's Legguards
        { slot: 9, itemIds: [54577] }, // Feet: Returning Footfalls
        { slot: 10, itemIds: [54576] }, // Finger 1: Signet of Twilight
        { slot: 11, itemIds: [50604] }, // Finger 2: Band of the Bone Colossus
        { slot: 12, itemIds: [54590] }, // Trinket 1: Sharpened Twilight Scale
        { slot: 13, itemIds: [50363] }, // Trinket 2: Deathbringer's Will
        { slot: 14, itemIds: [50737] }, // Main hand: Havoc's Call, Blade of Lordaeron Kings
        { slot: 15, itemIds: [50737] }, // Off hand: Havoc's Call, Blade of Lordaeron Kings
      ],
    },
    {
      id: "circle-meteor-enh-ap",
      name: "Enh-AP (Circle · Meteor)",
      slots: [
        { slot: 0, itemIds: [51242] }, // Head: Sanctified Frost Witch's Faceguard
        { slot: 1, itemIds: [51890] }, // Neck: Precious's Putrid Collar
        { slot: 2, itemIds: [51240] }, // Shoulder: Sanctified Frost Witch's Shoulderguards
        { slot: 3, itemIds: [50653] }, // Back: Shadowvault Slayer's Cloak
        { slot: 4, itemIds: [51244] }, // Chest: Sanctified Frost Witch's Chestguard
        { slot: 5, itemIds: [54580] }, // Wrist: Umbrage Armbands
        { slot: 6, itemIds: [50619] }, // Hands: Anub'ar Stalker's Gloves
        { slot: 7, itemIds: [50688] }, // Waist: Nerub'ar Stalker's Cord
        { slot: 8, itemIds: [51241] }, // Legs: Sanctified Frost Witch's War-Kilt
        { slot: 9, itemIds: [50711] }, // Feet: Treads of the Wasteland
        { slot: 10, itemIds: [50402] }, // Finger 1: Ashen Band of Endless Vengeance
        { slot: 11, itemIds: [50604] }, // Finger 2: Band of the Bone Colossus
        { slot: 12, itemIds: [54590] }, // Trinket 1: Sharpened Twilight Scale
        { slot: 13, itemIds: [50355] }, // Trinket 2: Herkuml War Token
        { slot: 14, itemIds: [50737] }, // Main hand: Havoc's Call, Blade of Lordaeron Kings
        { slot: 15, itemIds: [50737] }, // Off hand: Havoc's Call, Blade of Lordaeron Kings
        { slot: 16, itemIds: [50458] }, // Ranged: Bizuri's Totem of Shattered Ice
      ],
    },
    {
      id: "warmane-jakkre-enh-ap",
      name: "Enh-AP (Warmane · Jakkre)",
      slots: [
        { slot: 0, itemIds: [51242] }, // Head: Sanctified Frost Witch's Faceguard
        { slot: 1, itemIds: [51890] }, // Neck: Precious's Putrid Collar
        { slot: 2, itemIds: [51240] }, // Shoulder: Sanctified Frost Witch's Shoulderguards
        { slot: 3, itemIds: [50653] }, // Back: Shadowvault Slayer's Cloak
        { slot: 4, itemIds: [51244] }, // Chest: Sanctified Frost Witch's Chestguard
        { slot: 5, itemIds: [54580] }, // Wrist: Umbrage Armbands
        { slot: 6, itemIds: [50619] }, // Hands: Anub'ar Stalker's Gloves
        { slot: 7, itemIds: [50688] }, // Waist: Nerub'ar Stalker's Cord
        { slot: 8, itemIds: [51241] }, // Legs: Sanctified Frost Witch's War-Kilt
        { slot: 9, itemIds: [54577] }, // Feet: Returning Footfalls
        { slot: 10, itemIds: [50402] }, // Finger 1: Ashen Band of Endless Vengeance
        { slot: 11, itemIds: [50604] }, // Finger 2: Band of the Bone Colossus
        { slot: 12, itemIds: [50355] }, // Trinket 1: Herkuml War Token
        { slot: 13, itemIds: [54590] }, // Trinket 2: Sharpened Twilight Scale
        { slot: 14, itemIds: [50737] }, // Main hand: Havoc's Call, Blade of Lordaeron Kings
        { slot: 15, itemIds: [50737] }, // Off hand: Havoc's Call, Blade of Lordaeron Kings
        { slot: 16, itemIds: [50458] }, // Ranged: Bizuri's Totem of Shattered Ice
      ],
    },
    {
      id: "icy-veins-seksixeny-enh-sp",
      name: "Enh-SP (Icy-Veins · Seksixeny)",
      slots: [
        { slot: 0, itemIds: [51242] }, // Head: Sanctified Frost Witch's Faceguard
        { slot: 1, itemIds: [50633] }, // Neck: Sindragosa's Cruel Claw
        { slot: 2, itemIds: [51240] }, // Shoulder: Sanctified Frost Witch's Shoulderguards
        { slot: 3, itemIds: [54583] }, // Back: Cloak of Burning Dusk
        { slot: 4, itemIds: [51244] }, // Chest: Sanctified Frost Witch's Chestguard
        { slot: 5, itemIds: [54580] }, // Wrist: Umbrage Armbands
        { slot: 6, itemIds: [50619] }, // Hands: Anub'ar Stalker's Gloves
        { slot: 7, itemIds: [54587] }, // Waist: Split Shape Belt
        { slot: 8, itemIds: [51241] }, // Legs: Sanctified Frost Witch's War-Kilt
        { slot: 9, itemIds: [50711] }, // Feet: Treads of the Wasteland
        { slot: 10, itemIds: [50604] }, // Finger 1: Band of the Bone Colossus
        { slot: 11, itemIds: [50402] }, // Finger 2: Ashen Band of Endless Vengeance
        { slot: 12, itemIds: [50365] }, // Trinket 1: Phylactery of the Nameless Lich
        { slot: 13, itemIds: [54588] }, // Trinket 2: Charred Twilight Scale
        { slot: 14, itemIds: [50734] }, // Main hand: Royal Scepter of Terenas II
        { slot: 15, itemIds: [50737] }, // Off hand: Havoc's Call, Blade of Lordaeron Kings
        { slot: 16, itemIds: [50458] }, // Ranged: Bizuri's Totem of Shattered Ice
      ],
    },
  ],
};
