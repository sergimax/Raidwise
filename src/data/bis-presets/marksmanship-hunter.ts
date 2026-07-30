import { ClassName } from "../../types/characters.ts";
import type { BuiltInSpecBis } from "../../types/bis-lists.ts";

/**
 * WotLK BiS presets for Marksmanship Hunter.
 */
export const marksmanshipHunterBis: BuiltInSpecBis = {
  className: ClassName.Hunter,
  spec: "Marksmanship",
  presets: [
    {
      id: "kingdom-with-variants",
      name: "Kingdom. With variants",
      slots: [
        { slot: 0, itemIds: [51286] }, // Head: Sanctified Ahn'Kahar Blood Hunter's Headpiece
        { slot: 1, itemIds: [50633] }, // Neck: Sindragosa's Cruel Claw
        { slot: 2, itemIds: [51288] }, // Shoulder: Sanctified Ahn'Kahar Blood Hunter's Spaulders
        { slot: 3, itemIds: [47546, 50470] }, // Back: Sylvanas' Cunning / Recovered Scarlet Onslaught Cape
        { slot: 4, itemIds: [51289] }, // Chest: Sanctified Ahn'Kahar Blood Hunter's Tunic
        { slot: 5, itemIds: [50655] }, // Wrist: Scourge Hunter's Vambraces
        { slot: 6, itemIds: [51285] }, // Hands: Sanctified Ahn'Kahar Blood Hunter's Handguards
        { slot: 7, itemIds: [50688] }, // Waist: Nerub'ar Stalker's Cord
        { slot: 8, itemIds: [50645] }, // Legs: Leggings of Northern Lights
        { slot: 9, itemIds: [54577] }, // Feet: Returning Footfalls
        { slot: 10, itemIds: [50402] }, // Finger 1: Ashen Band of Endless Vengeance
        { slot: 11, itemIds: [50618] }, // Finger 2: Frostbrood Sapphire Ring
        { slot: 12, itemIds: [50363] }, // Trinket 1: Deathbringer's Will
        { slot: 13, itemIds: [54590] }, // Trinket 2: Sharpened Twilight Scale
        { slot: 14, itemIds: [50735] }, // Main hand: Oathbinder, Charge of the Ranger-General
        { slot: 16, itemIds: [50733] }, // Ranged: Fal'inrush, Defender of Quel'thalas
      ],
    },
    {
      id: "titans",
      name: "Titans",
      slots: [
        { slot: 0, itemIds: [51286] }, // Head: Sanctified Ahn'Kahar Blood Hunter's Headpiece
        { slot: 1, itemIds: [50633] }, // Neck: Sindragosa's Cruel Claw
        { slot: 2, itemIds: [51288] }, // Shoulder: Sanctified Ahn'Kahar Blood Hunter's Spaulders
        { slot: 3, itemIds: [47546] }, // Back: Sylvanas' Cunning
        { slot: 4, itemIds: [51289] }, // Chest: Sanctified Ahn'Kahar Blood Hunter's Tunic
        { slot: 5, itemIds: [50655] }, // Wrist: Scourge Hunter's Vambraces
        { slot: 6, itemIds: [51285] }, // Hands: Sanctified Ahn'Kahar Blood Hunter's Handguards
        { slot: 7, itemIds: [50688] }, // Waist: Nerub'ar Stalker's Cord
        { slot: 8, itemIds: [50645] }, // Legs: Leggings of Northern Lights
        { slot: 9, itemIds: [54577] }, // Feet: Returning Footfalls
        { slot: 10, itemIds: [50402] }, // Finger 1: Ashen Band of Endless Vengeance
        { slot: 11, itemIds: [50618] }, // Finger 2: Frostbrood Sapphire Ring
        { slot: 12, itemIds: [50363] }, // Trinket 1: Deathbringer's Will
        { slot: 13, itemIds: [54590] }, // Trinket 2: Sharpened Twilight Scale
        { slot: 14, itemIds: [50735] }, // Main hand: Oathbinder, Charge of the Ranger-General
        { slot: 16, itemIds: [50733] }, // Ranged: Fal'inrush, Defender of Quel'thalas
      ],
    },
  ],
};
