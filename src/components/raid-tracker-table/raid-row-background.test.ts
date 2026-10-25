import { describe, expect, it } from "vitest";
import type { RaidKey } from "../../data/raid-names.ts";
import { raidRowBackgroundFile } from "./raid-row-background.ts";

describe("raidRowBackgroundFile", () => {
  it.each([
    ["naxxramas", "Naxx-loading.png"],
    ["obsidianSanctum", "OS-loading.png"],
    ["onyxiasLair", "OL-loading.png"],
    ["vaultOfArchavon", "VoA-loading.png"],
    ["trialOfTheCrusader", "TotC-loading.png"],
    ["ulduar", "Ulduar-loading.png"],
    ["icecrownCitadel", "ICC-loading.png"],
    ["rubySanctum", "RS-loading.png"],
  ] as const satisfies ReadonlyArray<readonly [RaidKey, string]>) (
    "maps %s to %s",
    (raidKey, file) => {
      expect(raidRowBackgroundFile(raidKey)).toBe(file);
    },
  );

  it("returns no background for an unknown raid", () => {
    expect(raidRowBackgroundFile(undefined)).toBeUndefined();
  });
});
