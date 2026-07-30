import { ClassName } from "../../types/characters.ts";
import type { BuiltInSpecBis } from "../../types/bis-lists.ts";

/**
 * WotLK BiS presets for Holy Priest.
 * @see https://forum.warmane.com/showthread.php?t=380470
 * @see https://forum.warmane.com/showthread.php?t=420152
 * @see https://forum.warmane.com/showthread.php?t=448147
 * @see https://forum.wowcircle.com/showthread.php?t=350169
 * @see https://forum.warmane.com/showthread.php?t=380470
 */
export const holyPriestBis: BuiltInSpecBis = {
  className: ClassName.Priest,
  spec: "Holy",
  presets: [
    {
      id: "kingdom-with-variants",
      name: "Kingdom. With variants",
      slots: [
        { slot: 0, itemIds: [51261] }, // Head: Sanctified Crimson Acolyte Hood
        { slot: 1, itemIds: [50609] }, // Neck: Bone Sentinel's Amulet
        { slot: 2, itemIds: [51264] }, // Shoulder: Sanctified Crimson Acolyte Shoulderpads
        { slot: 3, itemIds: [54583] }, // Back: Cloak of Burning Dusk
        { slot: 4, itemIds: [50717, 51263] }, // Chest: Sanguine Silk Robes / Sanctified Crimson Acolyte Robe
        { slot: 5, itemIds: [54582] }, // Wrist: Bracers of Fiery Night
        { slot: 6, itemIds: [51260] }, // Hands: Sanctified Crimson Acolyte Gloves
        { slot: 7, itemIds: [50702] }, // Waist: Lingering Illness
        { slot: 8, itemIds: [51262] }, // Legs: Sanctified Crimson Acolyte Leggings
        { slot: 9, itemIds: [50699] }, // Feet: Plague Scientist's Boots
        { slot: 10, itemIds: [54585] }, // Finger 1: Ring of Phased Regeneration
        { slot: 11, itemIds: [50636] }, // Finger 2: Memory of Malygos
        { slot: 12, itemIds: [54589] }, // Trinket 1: Glowing Twilight Scale
        { slot: 13, itemIds: [47432, 50366] }, // Trinket 2: Solace of the Fallen / Althor's Abacus
        { slot: 14, itemIds: [50731] }, // Main hand: Archus, Greatstaff of Antonidas
        { slot: 16, itemIds: [50631] }, // Ranged: Nightmare Ender
      ],
    },
    {
      id: "warmane-mercy-empowered-renew-spec",
      name: "Empowered Renew Spec (Warmane · Mercy)",
      slots: [
        { slot: 0, itemIds: [51261] }, // Head: Sanctified Crimson Acolyte Hood
        { slot: 1, itemIds: [50609] }, // Neck: Bone Sentinel's Amulet
        { slot: 2, itemIds: [51264] }, // Shoulder: Sanctified Crimson Acolyte Shoulderpads
        { slot: 3, itemIds: [54583, 50668] }, // Back: Cloak of Burning Dusk / Greatcloak of the Turned Champion
        { slot: 4, itemIds: [50717] }, // Chest: Sanguine Silk Robes
        { slot: 5, itemIds: [54582, 50686] }, // Wrist: Bracers of Fiery Night / Death Surgeon's Sleeves
        { slot: 6, itemIds: [51260] }, // Hands: Sanctified Crimson Acolyte Gloves
        { slot: 7, itemIds: [50997, 50702] }, // Waist: Circle of Ossus / Lingering Illness
        { slot: 8, itemIds: [51262] }, // Legs: Sanctified Crimson Acolyte Leggings
        { slot: 9, itemIds: [50699] }, // Feet: Plague Scientist's Boots
        { slot: 10, itemIds: [50636] }, // Finger 1: Memory of Malygos
        { slot: 11, itemIds: [50400, 54585] }, // Finger 2: Ashen Band of Endless Wisdom / Ring of Phased Regeneration
        { slot: 12, itemIds: [50366] }, // Trinket 1: Althor's Abacus
        { slot: 13, itemIds: [54589] }, // Trinket 2: Glowing Twilight Scale
        { slot: 14, itemIds: [50734] }, // Main hand: Royal Scepter of Terenas II
        { slot: 15, itemIds: [50635] }, // Off hand: Sundial of Eternal Dusk
        { slot: 16, itemIds: [50684, 50631] }, // Ranged: Corpse-Impaling Spike / Nightmare Ender
      ],
    },
    {
      id: "warmane-iqui-end-game",
      name: "End game (Warmane · Iqui)",
      slots: [
        { slot: 0, itemIds: [51261] }, // Head: Sanctified Crimson Acolyte Hood
        { slot: 1, itemIds: [50609] }, // Neck: Bone Sentinel's Amulet
        { slot: 2, itemIds: [51264] }, // Shoulder: Sanctified Crimson Acolyte Shoulderpads
        { slot: 3, itemIds: [50668] }, // Back: Greatcloak of the Turned Champion
        { slot: 4, itemIds: [50717] }, // Chest: Sanguine Silk Robes
        { slot: 5, itemIds: [54582] }, // Wrist: Bracers of Fiery Night
        { slot: 6, itemIds: [51260] }, // Hands: Sanctified Crimson Acolyte Gloves
        { slot: 7, itemIds: [50702] }, // Waist: Lingering Illness
        { slot: 8, itemIds: [51262] }, // Legs: Sanctified Crimson Acolyte Leggings
        { slot: 9, itemIds: [50699] }, // Feet: Plague Scientist's Boots
        { slot: 10, itemIds: [54585] }, // Finger 1: Ring of Phased Regeneration
        { slot: 11, itemIds: [50636] }, // Finger 2: Memory of Malygos
        { slot: 12, itemIds: [47432] }, // Trinket 1: Solace of the Fallen
        { slot: 13, itemIds: [54589] }, // Trinket 2: Glowing Twilight Scale
        { slot: 14, itemIds: [46017] }, // Main hand: Val'anyr, Hammer of Ancient Kings
        { slot: 15, itemIds: [50635] }, // Off hand: Sundial of Eternal Dusk
        { slot: 16, itemIds: [50631] }, // Ranged: Nightmare Ender
      ],
    },
    {
      id: "warmane-gearkingxaw-holy-pve",
      name: "Holy PVE (Warmane · GearkingXAW)",
      slots: [
        { slot: 0, itemIds: [51255] }, // Head: Sanctified Crimson Acolyte Cowl
        { slot: 1, itemIds: [50609] }, // Neck: Bone Sentinel's Amulet
        { slot: 2, itemIds: [51257] }, // Shoulder: Sanctified Crimson Acolyte Mantle
        { slot: 3, itemIds: [50668] }, // Back: Greatcloak of the Turned Champion
        { slot: 4, itemIds: [50717] }, // Chest: Sanguine Silk Robes
        { slot: 5, itemIds: [54582] }, // Wrist: Bracers of Fiery Night
        { slot: 6, itemIds: [51260] }, // Hands: Sanctified Crimson Acolyte Gloves
        { slot: 7, itemIds: [50613] }, // Waist: Crushing Coldwraith Belt
        { slot: 8, itemIds: [51262] }, // Legs: Sanctified Crimson Acolyte Leggings
        { slot: 9, itemIds: [50699] }, // Feet: Plague Scientist's Boots
        { slot: 10, itemIds: [54585] }, // Finger 1: Ring of Phased Regeneration
        { slot: 11, itemIds: [50636] }, // Finger 2: Memory of Malygos
        { slot: 12, itemIds: [47432] }, // Trinket 1: Solace of the Fallen
        { slot: 13, itemIds: [54589] }, // Trinket 2: Glowing Twilight Scale
        { slot: 14, itemIds: [50734] }, // Main hand: Royal Scepter of Terenas II
        { slot: 15, itemIds: [50635] }, // Off hand: Sundial of Eternal Dusk
        { slot: 16, itemIds: [50684] }, // Ranged: Corpse-Impaling Spike
      ],
    },
    {
      id: "circle-terran100-manamanagement",
      name: "Manamanagement (Circle · Terran100)",
      slots: [
        { slot: 0, itemIds: [51261] }, // Head: Sanctified Crimson Acolyte Hood
        { slot: 1, itemIds: [50609] }, // Neck: Bone Sentinel's Amulet
        { slot: 2, itemIds: [51264] }, // Shoulder: Sanctified Crimson Acolyte Shoulderpads
        { slot: 3, itemIds: [50668] }, // Back: Greatcloak of the Turned Champion
        { slot: 4, itemIds: [50717] }, // Chest: Sanguine Silk Robes
        { slot: 5, itemIds: [50686] }, // Wrist: Death Surgeon's Sleeves
        { slot: 6, itemIds: [51260] }, // Hands: Sanctified Crimson Acolyte Gloves
        { slot: 7, itemIds: [50702] }, // Waist: Lingering Illness
        { slot: 8, itemIds: [51262] }, // Legs: Sanctified Crimson Acolyte Leggings
        { slot: 9, itemIds: [50699] }, // Feet: Plague Scientist's Boots
        { slot: 10, itemIds: [54585] }, // Finger 1: Ring of Phased Regeneration
        { slot: 11, itemIds: [50636] }, // Finger 2: Memory of Malygos
        { slot: 12, itemIds: [54590] }, // Trinket 1: Sharpened Twilight Scale
        { slot: 13, itemIds: [47432] }, // Trinket 2: Solace of the Fallen
        { slot: 14, itemIds: [50731] }, // Main hand: Archus, Greatstaff of Antonidas
        { slot: 16, itemIds: [50631] }, // Ranged: Nightmare Ender
      ],
    },
    {
      id: "warmane-mercy-serendipity-spec",
      name: "Serendipity Spec (Warmane · Mercy)",
      slots: [
        { slot: 0, itemIds: [51261] }, // Head: Sanctified Crimson Acolyte Hood
        { slot: 1, itemIds: [50609] }, // Neck: Bone Sentinel's Amulet
        { slot: 2, itemIds: [51264] }, // Shoulder: Sanctified Crimson Acolyte Shoulderpads
        { slot: 3, itemIds: [54583, 50668] }, // Back: Cloak of Burning Dusk / Greatcloak of the Turned Champion
        { slot: 4, itemIds: [50717] }, // Chest: Sanguine Silk Robes
        { slot: 5, itemIds: [50686] }, // Wrist: Death Surgeon's Sleeves
        { slot: 6, itemIds: [51260] }, // Hands: Sanctified Crimson Acolyte Gloves
        { slot: 7, itemIds: [50702] }, // Waist: Lingering Illness
        { slot: 8, itemIds: [51262] }, // Legs: Sanctified Crimson Acolyte Leggings
        { slot: 9, itemIds: [50699] }, // Feet: Plague Scientist's Boots
        { slot: 10, itemIds: [50636] }, // Finger 1: Memory of Malygos
        { slot: 11, itemIds: [50400, 54585] }, // Finger 2: Ashen Band of Endless Wisdom / Ring of Phased Regeneration
        { slot: 12, itemIds: [50366] }, // Trinket 1: Althor's Abacus
        { slot: 13, itemIds: [54589] }, // Trinket 2: Glowing Twilight Scale
        { slot: 14, itemIds: [50734] }, // Main hand: Royal Scepter of Terenas II
        { slot: 15, itemIds: [50635] }, // Off hand: Sundial of Eternal Dusk
        { slot: 16, itemIds: [50631] }, // Ranged: Nightmare Ender
      ],
    },
  ],
};
