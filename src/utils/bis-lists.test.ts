import { describe, expect, it } from "vitest";
import { ClassName } from "../types/characters.ts";
import { unholyDeathKnightBis } from "../data/bis-presets/unholy-death-knight.ts";
import {
  buildBisSlotMap,
  clearAllLocalBisPresets,
  compareBuiltInBisPresets,
  confirmBisSlotItemsText,
  countLocalBisPresets,
  getMergedPresetsForSpec,
  getSelectedPresetForSpec,
  isLocalBisPreset,
  parseBisSlotItemId,
  resolveBisSlotMap,
  resolveItemNamesToIds,
  resolveSaveLocalPresetByName,
  specBisStorageKey,
  validateBisSlotItemsText,
} from "./bis-lists.ts";

describe("buildBisSlotMap", () => {
  it("maps preset slots to item id lists", () => {
    const slotMap = buildBisSlotMap(unholyDeathKnightBis.presets[0]);
    expect(slotMap.get(1)).toContain(54581);
    expect(slotMap.get(14)).toContain(49623);
    expect(slotMap.get(16)).toBeUndefined();
  });
});

describe("compareBuiltInBisPresets / getMergedPresetsForSpec", () => {
  it("orders Kingdom before Titans before other built-ins", () => {
    const ordered = [
      { id: "zzz-guide", name: "Z Guide", slots: [] },
      { id: "titans", name: "Titans", slots: [] },
      { id: "kingdom-with-variants", name: "Kingdom. With variants", slots: [] },
      { id: "aaa-guide", name: "A Guide", slots: [] },
    ].sort(compareBuiltInBisPresets);

    expect(ordered.map((preset) => preset.id)).toEqual([
      "kingdom-with-variants",
      "titans",
      "aaa-guide",
      "zzz-guide",
    ]);
  });

  it("places Kingdom first for Unholy DK merged presets", () => {
    const presets = getMergedPresetsForSpec(ClassName.DeathKnight, "Unholy", {
      schemaVersion: 1,
      entries: {},
    });
    expect(presets[0]?.id).toBe("kingdom-with-variants");
    expect(presets.some((preset) => preset.id === "titans")).toBe(true);
  });
});

describe("resolveItemNamesToIds", () => {
  it("resolves English item names and alternatives", () => {
    const resolved = resolveItemNamesToIds(
      "Sigil of the Hanged Man / Sigil of Virulence",
    );
    expect(resolved.unknownNames).toEqual([]);
    expect(resolved.itemIds).toEqual([50459, 47673]);
  });

  it("resolves item ids with or without a hash prefix", () => {
    const resolved = resolveItemNamesToIds("51312 / #54581");
    expect(resolved.unknownNames).toEqual([]);
    expect(resolved.itemIds).toEqual([51312, 54581]);
  });

  it("reports unknown segments that are neither names nor ids", () => {
    const resolved = resolveItemNamesToIds("Not A Real Item / #");
    expect(resolved.itemIds).toEqual([]);
    expect(resolved.unknownNames).toEqual(["Not A Real Item", "#"]);
  });
});

describe("parseBisSlotItemId", () => {
  it("parses numeric and hash-prefixed ids", () => {
    expect(parseBisSlotItemId("51312")).toBe(51312);
    expect(parseBisSlotItemId(" #51312 ")).toBe(51312);
    expect(parseBisSlotItemId("Penumbra Pendant")).toBeUndefined();
  });
});

describe("getSelectedPresetForSpec", () => {
  it("uses the saved preset id when present", () => {
    const storageKey = specBisStorageKey(ClassName.DeathKnight, "Unholy");
    const selected = getSelectedPresetForSpec(ClassName.DeathKnight, "Unholy", {
      schemaVersion: 1,
      entries: {
        [storageKey]: {
          selectedPresetId: "warmane-drakantas-udk-str",
          presets: [],
        },
      },
    });

    expect(selected?.id).toBe("warmane-drakantas-udk-str");
    expect(selected?.slots.some((slot) => slot.itemIds.includes(54581))).toBe(
      true,
    );
  });

  it("returns a selected local preset instead of the built-in default", () => {
    const storageKey = specBisStorageKey(ClassName.DeathKnight, "Unholy");
    const customNeckItemId = 50647;
    const selected = getSelectedPresetForSpec(ClassName.DeathKnight, "Unholy", {
      schemaVersion: 1,
      entries: {
        [storageKey]: {
          selectedPresetId: "local-42",
          presets: [
            {
              id: "local-42",
              name: "q with bryn",
              slots: [{ slot: 1, itemIds: [customNeckItemId] }],
            },
          ],
        },
      },
    });

    expect(selected?.id).toBe("local-42");
    expect(selected?.name).toBe("q with bryn");
    expect(selected?.slots).toEqual([{ slot: 1, itemIds: [customNeckItemId] }]);
  });
});

describe("resolveBisSlotMap", () => {
  it("uses the active local preset for upgrade hints", () => {
    const storageKey = specBisStorageKey(ClassName.DeathKnight, "Unholy");
    const customNeckItemId = 50647;
    const slotMap = resolveBisSlotMap(ClassName.DeathKnight, "Unholy", {
      schemaVersion: 1,
      entries: {
        [storageKey]: {
          selectedPresetId: "local-42",
          presets: [
            {
              id: "local-42",
              name: "q with bryn",
              slots: [{ slot: 1, itemIds: [customNeckItemId] }],
            },
          ],
        },
      },
    });

    expect(slotMap.get(1)).toEqual([customNeckItemId]);
    expect(slotMap.get(1)).not.toEqual([54581]);
  });
});

describe("isLocalBisPreset", () => {
  it("identifies local presets by id prefix", () => {
    expect(isLocalBisPreset({ id: "local-1", name: "Mine", slots: [] })).toBe(
      true,
    );
    expect(isLocalBisPreset(unholyDeathKnightBis.presets[0])).toBe(false);
  });
});

describe("countLocalBisPresets / clearAllLocalBisPresets", () => {
  const localState = {
    schemaVersion: 1 as const,
    entries: {
      "Death Knight|Unholy": {
        selectedPresetId: "local-1",
        presets: [
          { id: "local-1", name: "Mine", slots: [] },
          { id: "local-2", name: "Alt", slots: [] },
        ],
      },
      "Mage|Fire": {
        selectedPresetId: "default",
        presets: [{ id: "local-fire", name: "Fire custom", slots: [] }],
      },
    },
  };

  it("counts local presets across specs", () => {
    expect(countLocalBisPresets(localState)).toBe(3);
  });

  it("removes all local presets and drops emptied buckets", () => {
    const cleared = clearAllLocalBisPresets(localState);
    expect(countLocalBisPresets(cleared)).toBe(0);
    expect(cleared.entries).toEqual({});
  });

  it("keeps built-in selection entries that have no local presets", () => {
    const withBuiltinOnly = {
      schemaVersion: 1 as const,
      entries: {
        "Mage|Frost": {
          selectedPresetId: "community-1",
          presets: [],
        },
      },
    };
    expect(clearAllLocalBisPresets(withBuiltinOnly)).toBe(withBuiltinOnly);
  });
});

describe("validateBisSlotItemsText", () => {
  it("accepts items that match the gear slot", () => {
    const validated = validateBisSlotItemsText(0, "51312", "strict");
    expect(validated.error).toBeUndefined();
    expect(validated.itemIds).toEqual([51312]);
  });

  it("rejects items placed in the wrong gear slot", () => {
    const validated = validateBisSlotItemsText(
      0,
      "Sanctified Scourgelord Handguards",
      "strict",
    );
    expect(validated.itemIds).toEqual([]);
    expect(validated.error).toContain("Hands");
    expect(validated.error).toContain("Head");
  });

  it("validates complete ids while typing without waiting for blur", () => {
    const validated = validateBisSlotItemsText(0, "51132", "partial");
    expect(validated.error).toContain("Hands");
  });

  it("does not flag incomplete name segments while typing", () => {
    const validated = validateBisSlotItemsText(0, "Sanctified Scour", "partial");
    expect(validated.error).toBeUndefined();
  });

  it("reports unknown items on strict validation", () => {
    const validated = validateBisSlotItemsText(0, "Not A Real Item", "strict");
    expect(validated.error).toContain("Unknown item");
  });
});

describe("confirmBisSlotItemsText", () => {
  it("formats confirmed ids to canonical item names", () => {
    const confirmed = confirmBisSlotItemsText(0, "51312");
    expect(confirmed.ok).toBe(true);
    if (!confirmed.ok) {
      return;
    }
    expect(confirmed.itemIds).toEqual([51312]);
    expect(confirmed.itemsText).toBe("Sanctified Scourgelord Helmet");
  });

  it("returns validation errors without confirming", () => {
    const confirmed = confirmBisSlotItemsText(0, "51132");
    expect(confirmed.ok).toBe(false);
    if (confirmed.ok) {
      return;
    }
    expect(confirmed.error).toContain("Hands");
  });
});

describe("resolveSaveLocalPresetByName", () => {
  const builtInPresets = unholyDeathKnightBis.presets;

  it("creates a new local preset when the name is new", () => {
    const resolved = resolveSaveLocalPresetByName(
      [],
      builtInPresets,
      "My list",
      [{ slot: 1, itemIds: [54581] }],
    );

    expect("error" in resolved).toBe(false);
    if ("error" in resolved) {
      return;
    }

    expect(resolved.preset.name).toBe("My list");
    expect(resolved.preset.id).toMatch(/^local-/);
    expect(resolved.presets).toHaveLength(1);
  });

  it("updates an existing local preset when the name matches", () => {
    const existing = {
      id: "local-99",
      name: "Circle",
      slots: [{ slot: 1, itemIds: [1] }],
    };
    const resolved = resolveSaveLocalPresetByName(
      [existing],
      builtInPresets,
      "circle",
      [{ slot: 1, itemIds: [54581] }],
    );

    expect("error" in resolved).toBe(false);
    if ("error" in resolved) {
      return;
    }

    expect(resolved.preset.id).toBe("local-99");
    expect(resolved.preset.slots[0]?.itemIds).toEqual([54581]);
    expect(resolved.presets).toHaveLength(1);
  });

  it("rejects empty names and built-in preset names", () => {
    expect(resolveSaveLocalPresetByName([], builtInPresets, "  ", [])).toEqual({
      error: "List name is required",
    });
    expect(
      resolveSaveLocalPresetByName([], builtInPresets, builtInPresets[0]!.name, []),
    ).toEqual({
      error: "Use a custom name (not a built-in list name)",
    });
  });
});
