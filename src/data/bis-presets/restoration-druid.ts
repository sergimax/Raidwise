import { ClassName } from "../../types/characters.ts";
import type { BuiltInSpecBis } from "../../types/bis-lists.ts";

/**
 * WotLK BiS presets for Restoration Druid.
 * @see https://forum.warmane.com/showthread.php?t=226506
 */
export const restorationDruidBis: BuiltInSpecBis = {
  className: ClassName.Druid,
  spec: "Restoration",
  presets: [
    {
      id: "kingdom-with-variants",
      name: "Kingdom. With variants",
      slots: [
        { slot: 0, itemIds: [51296] }, // Head: Sanctified Lasherweave Headguard
        { slot: 1, itemIds: [50609] }, // Neck: Bone Sentinel's Amulet
        { slot: 2, itemIds: [51299] }, // Shoulder: Sanctified Lasherweave Shoulderpads
        { slot: 3, itemIds: [54583] }, // Back: Cloak of Burning Dusk
        { slot: 4, itemIds: [50717] }, // Chest: Sanguine Silk Robes
        { slot: 5, itemIds: [54582] }, // Wrist: Bracers of Fiery Night
        { slot: 6, itemIds: [51291] }, // Hands: Sanctified Lasherweave Gloves
        { slot: 7, itemIds: [50705] }, // Waist: Professor's Bloodied Smock
        { slot: 8, itemIds: [51297] }, // Legs: Sanctified Lasherweave Legguards
        { slot: 9, itemIds: [50699] }, // Feet: Plague Scientist's Boots
        { slot: 10, itemIds: [50636] }, // Finger 1: Memory of Malygos
        { slot: 11, itemIds: [54585, 50400] }, // Finger 2: Ring of Phased Regeneration / Ashen Band of Endless Wisdom
        { slot: 12, itemIds: [54589] }, // Trinket 1: Glowing Twilight Scale
        { slot: 13, itemIds: [50366] }, // Trinket 2: Althor's Abacus
        { slot: 14, itemIds: [50685, 50734, 46017] }, // Main hand: Trauma / Royal Scepter of Terenas II / Val'anyr, Hammer of Ancient Kings
        { slot: 15, itemIds: [50635] }, // Off hand: Sundial of Eternal Dusk
      ],
    },
    {
      id: "titans",
      name: "Titans",
      slots: [
        { slot: 0, itemIds: [51296] }, // Head: Sanctified Lasherweave Headguard
        { slot: 1, itemIds: [50609] }, // Neck: Bone Sentinel's Amulet
        { slot: 2, itemIds: [51299] }, // Shoulder: Sanctified Lasherweave Shoulderpads
        { slot: 3, itemIds: [54583] }, // Back: Cloak of Burning Dusk
        { slot: 4, itemIds: [50717] }, // Chest: Sanguine Silk Robes
        { slot: 5, itemIds: [54582] }, // Wrist: Bracers of Fiery Night
        { slot: 6, itemIds: [51291] }, // Hands: Sanctified Lasherweave Gloves
        { slot: 7, itemIds: [50705] }, // Waist: Professor's Bloodied Smock
        { slot: 8, itemIds: [51297] }, // Legs: Sanctified Lasherweave Legguards
        { slot: 9, itemIds: [50699] }, // Feet: Plague Scientist's Boots
        { slot: 10, itemIds: [50400] }, // Finger 1: Ashen Band of Endless Wisdom
        { slot: 11, itemIds: [54585] }, // Finger 2: Ring of Phased Regeneration
        { slot: 12, itemIds: [54589] }, // Trinket 1: Glowing Twilight Scale
        { slot: 13, itemIds: [50366] }, // Trinket 2: Althor's Abacus
        { slot: 14, itemIds: [50734] }, // Main hand: Royal Scepter of Terenas II
        { slot: 15, itemIds: [50635] }, // Off hand: Sundial of Eternal Dusk
      ],
    },
    {
      id: "warmane-funkymusic-resto-druid",
      name: "Resto Druid (Warmane · Funkymusic)",
      slots: [
        { slot: 0, itemIds: [51290] }, // Head: Sanctified Lasherweave Cover
        { slot: 1, itemIds: [50609] }, // Neck: Bone Sentinel's Amulet
        { slot: 2, itemIds: [51292] }, // Shoulder: Sanctified Lasherweave Mantle
        { slot: 3, itemIds: [50668] }, // Back: Greatcloak of the Turned Champion
        { slot: 4, itemIds: [50717] }, // Chest: Sanguine Silk Robes
        { slot: 5, itemIds: [54582] }, // Wrist: Bracers of Fiery Night
        { slot: 6, itemIds: [51291] }, // Hands: Sanctified Lasherweave Gloves
        { slot: 7, itemIds: [50705] }, // Waist: Professor's Bloodied Smock
        { slot: 8, itemIds: [51293] }, // Legs: Sanctified Lasherweave Trousers
        { slot: 9, itemIds: [50665] }, // Feet: Boots of Unnatural Growth
        { slot: 10, itemIds: [50400] }, // Finger 1: Ashen Band of Endless Wisdom
        { slot: 11, itemIds: [50636] }, // Finger 2: Memory of Malygos
        { slot: 12, itemIds: [54589] }, // Trinket 1: Glowing Twilight Scale
        { slot: 13, itemIds: [50366] }, // Trinket 2: Althor's Abacus
        { slot: 14, itemIds: [46017] }, // Main hand: Val'anyr, Hammer of Ancient Kings
        { slot: 15, itemIds: [50635] }, // Off hand: Sundial of Eternal Dusk
        { slot: 16, itemIds: [50454] }, // Ranged: Idol of the Black Willow
      ],
    },
  ],
};
