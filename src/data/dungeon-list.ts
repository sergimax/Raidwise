import type { Dungeon } from "../types/dungeons.ts";
import { DungeonDifficulty } from "../types/dungeons.ts";
import { createTemplateDungeon } from "./create-template-dungeon.ts";

const N = DungeonDifficulty.NORMAL;
const H = DungeonDifficulty.HEROIC;

const row = createTemplateDungeon;

/** Default WotLK raid rows for “Add raids from template”. */
export const DungeonList: Array<Dungeon> = [
  row({ raidKey: "vaultOfArchavon", size: 10, difficulty: N, itemLevel: [232, 251] }),
  row({ raidKey: "vaultOfArchavon", size: 25, difficulty: N, itemLevel: [245, 264] }),
  row({ raidKey: "trialOfTheCrusader", size: 25, difficulty: N, itemLevel: [245] }),
  row({ raidKey: "trialOfTheCrusader", size: 25, difficulty: H, itemLevel: [258] }),
  row({
    raidKey: "icecrownCitadel",
    size: 10,
    difficulty: N,
    itemLevel: [251, 258],
    withEmblem: true,
  }),
  row({
    raidKey: "icecrownCitadel",
    size: 10,
    difficulty: H,
    itemLevel: [264, 271],
    withEmblem: true,
  }),
  row({
    raidKey: "icecrownCitadel",
    size: 25,
    difficulty: N,
    itemLevel: [264, 271],
    withEmblem: true,
  }),
  row({
    raidKey: "icecrownCitadel",
    size: 25,
    difficulty: H,
    itemLevel: [277, 284],
    withEmblem: true,
  }),
  row({
    raidKey: "rubySanctum",
    size: 25,
    difficulty: N,
    itemLevel: [271],
    withEmblem: true,
  }),
  row({
    raidKey: "rubySanctum",
    size: 25,
    difficulty: H,
    itemLevel: [284],
    withEmblem: true,
  }),
];
