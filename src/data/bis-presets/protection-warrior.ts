import { ClassName } from "../../types/characters.ts";
import type { BuiltInSpecBis } from "../../types/bis-lists.ts";

/**
 * WotLK BiS presets for Protection Warrior.
 * @see https://www.icy-veins.com/wotlk-classic/protection-warrior-tank-pve-guide
 */
export const protectionWarriorBis: BuiltInSpecBis = {
  className: ClassName.Warrior,
  spec: "Protection",
  presets: [
    {
      id: "kingdom-with-variants",
      name: "Kingdom. With variants",
      slots: [
        { slot: 0, itemIds: [50640] }, // Head: Broken Ram Skull Helm
        { slot: 1, itemIds: [50627] }, // Neck: Noose of Malachite
        { slot: 2, itemIds: [51224] }, // Shoulder: Sanctified Ymirjar Lord's Pauldrons
        { slot: 3, itemIds: [50718] }, // Back: Royal Crimson Cloak
        { slot: 4, itemIds: [51220] }, // Chest: Sanctified Ymirjar Lord's Breastplate
        { slot: 5, itemIds: [50611] }, // Wrist: Bracers of Dark Reckoning
        { slot: 6, itemIds: [51222] }, // Hands: Sanctified Ymirjar Lord's Handguards
        { slot: 7, itemIds: [50691] }, // Waist: Belt of Broken Bones
        { slot: 8, itemIds: [51223] }, // Legs: Sanctified Ymirjar Lord's Legguards
        { slot: 9, itemIds: [54579] }, // Feet: Treads of Impending Resurrection
        { slot: 10, itemIds: [50642] }, // Finger 1: Juggernaut Band
        { slot: 11, itemIds: [50622, 50404] }, // Finger 2: Devium's Eternally Cold Ring / Ashen Band of Endless Courage
        { slot: 12, itemIds: [50364] }, // Trinket 1: Sindragosa's Flawless Fang
        { slot: 13, itemIds: [54591, 47216, 50356] }, // Trinket 2: Petrified Twilight Scale / The Black Heart / Corroded Skeleton Key
        { slot: 14, itemIds: [50737, 50738, 50672] }, // Main hand: Havoc's Call, Blade of Lordaeron Kings / Mithrios, Bronzebeard's Legacy / Bloodvenom Blade
        { slot: 15, itemIds: [50729] }, // Off hand: Icecrown Glacial Wall
        { slot: 16, itemIds: [50638] }, // Ranged: Zod's Repeating Longbow
      ],
    },
    {
      id: "icy-veins-abide-protection",
      name: "Protection (icy-veins · Abide)",
      slots: [
        { slot: 0, itemIds: [50640] }, // Head: Broken Ram Skull Helm
        { slot: 1, itemIds: [50682] }, // Neck: Bile-Encrusted Medallion
        { slot: 2, itemIds: [51224] }, // Shoulder: Sanctified Ymirjar Lord's Pauldrons
        { slot: 3, itemIds: [50718] }, // Back: Royal Crimson Cloak
        { slot: 4, itemIds: [51220] }, // Chest: Sanctified Ymirjar Lord's Breastplate
        { slot: 5, itemIds: [50611] }, // Wrist: Bracers of Dark Reckoning
        { slot: 6, itemIds: [51222] }, // Hands: Sanctified Ymirjar Lord's Handguards
        { slot: 7, itemIds: [50691] }, // Waist: Belt of Broken Bones
        { slot: 8, itemIds: [51223] }, // Legs: Sanctified Ymirjar Lord's Legguards
        { slot: 9, itemIds: [54579] }, // Feet: Treads of Impending Resurrection
        { slot: 10, itemIds: [50404] }, // Finger 1: Ashen Band of Endless Courage
        { slot: 11, itemIds: [50622] }, // Finger 2: Devium's Eternally Cold Ring
        { slot: 12, itemIds: [50364] }, // Trinket 1: Sindragosa's Flawless Fang
        { slot: 13, itemIds: [54591] }, // Trinket 2: Petrified Twilight Scale
        { slot: 14, itemIds: [50738] }, // Main hand: Mithrios, Bronzebeard's Legacy
        { slot: 15, itemIds: [50729] }, // Off hand: Icecrown Glacial Wall
        { slot: 16, itemIds: [51834] }, // Ranged: Dreamhunter's Carbine
      ],
    },
  ],
};
