import { RaidNames, type RaidKey } from "./raid-names.ts";

/** WowSims drop zone ids for each WotLK template raid. */
export const RaidZoneIds: Record<RaidKey, readonly number[]> = {
  naxxramas: [3456],
  obsidianSanctum: [4493, 4494],
  onyxiasLair: [2159],
  vaultOfArchavon: [4603],
  trialOfTheCrusader: [4722, 4723],
  ulduar: [4273],
  icecrownCitadel: [4812, 4813, 4820, 4809],
  rubySanctum: [4987],
};

export function isRaidKey(value: string): value is RaidKey {
  return Object.hasOwn(RaidNames, value);
}
