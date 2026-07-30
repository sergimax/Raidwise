import { ClassName } from "../../types/characters.ts";
import type { BuiltInSpecBis } from "../../types/bis-lists.ts";

/**
 * WotLK BiS presets for Blood Death Knight.
 */
export const bloodDeathKnightBis: BuiltInSpecBis = {
  className: ClassName.DeathKnight,
  spec: "Blood",
  presets: [
    {
      id: "kingdom-with-variants",
      name: "Kingdom. With variants",
      slots: [
        { slot: 0, itemIds: [50640] }, // Head: Broken Ram Skull Helm
        { slot: 1, itemIds: [50627] }, // Neck: Noose of Malachite
        { slot: 2, itemIds: [51309] }, // Shoulder: Sanctified Scourgelord Pauldrons
        { slot: 3, itemIds: [50718] }, // Back: Royal Crimson Cloak
        { slot: 4, itemIds: [51305] }, // Chest: Sanctified Scourgelord Chestguard
        { slot: 5, itemIds: [50611] }, // Wrist: Bracers of Dark Reckoning
        { slot: 6, itemIds: [51307] }, // Hands: Sanctified Scourgelord Handguards
        { slot: 7, itemIds: [50691] }, // Waist: Belt of Broken Bones
        { slot: 8, itemIds: [51308] }, // Legs: Sanctified Scourgelord Legguards
        { slot: 9, itemIds: [54579, 50625] }, // Feet: Treads of Impending Resurrection / Grinning Skull Greatboots
        { slot: 10, itemIds: [50622] }, // Finger 1: Devium's Eternally Cold Ring
        { slot: 11, itemIds: [50642, 50404] }, // Finger 2: Juggernaut Band / Ashen Band of Endless Courage
        { slot: 12, itemIds: [50364] }, // Trinket 1: Sindragosa's Flawless Fang
        { slot: 13, itemIds: [54591, 47216, 50356] }, // Trinket 2: Petrified Twilight Scale / The Black Heart / Corroded Skeleton Key
        { slot: 14, itemIds: [50730] }, // Main hand: Glorenzelg, High-Blade of the Silver Hand
      ],
    },
    {
      id: "titans",
      name: "Titans",
      slots: [
        { slot: 0, itemIds: [50640] }, // Head: Broken Ram Skull Helm
        { slot: 1, itemIds: [50627] }, // Neck: Noose of Malachite
        { slot: 2, itemIds: [51309] }, // Shoulder: Sanctified Scourgelord Pauldrons
        { slot: 3, itemIds: [50718] }, // Back: Royal Crimson Cloak
        { slot: 4, itemIds: [51305] }, // Chest: Sanctified Scourgelord Chestguard
        { slot: 5, itemIds: [50611] }, // Wrist: Bracers of Dark Reckoning
        { slot: 6, itemIds: [51307] }, // Hands: Sanctified Scourgelord Handguards
        { slot: 7, itemIds: [50691] }, // Waist: Belt of Broken Bones
        { slot: 8, itemIds: [51308] }, // Legs: Sanctified Scourgelord Legguards
        { slot: 9, itemIds: [54579] }, // Feet: Treads of Impending Resurrection
        { slot: 10, itemIds: [50404] }, // Finger 1: Ashen Band of Endless Courage
        { slot: 11, itemIds: [50622] }, // Finger 2: Devium's Eternally Cold Ring
        { slot: 12, itemIds: [50364] }, // Trinket 1: Sindragosa's Flawless Fang
        { slot: 14, itemIds: [50730] }, // Main hand: Glorenzelg, High-Blade of the Silver Hand
      ],
    },
  ],
};
