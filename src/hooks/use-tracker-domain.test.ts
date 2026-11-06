import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DungeonList } from "../data/dungeons.ts";
import { loadRaidTrackerState } from "../storage/index.ts";
import { LEGACY_STORAGE_KEY, LOAD_WARNING_CORRUPTED_SAVE, LOAD_WARNING_UNSUPPORTED_SAVE, STORAGE_CONFLICT, STORAGE_KEY, STORAGE_QUOTA_EXCEEDED } from "../storage/constants.ts";
import { createTestCharacter, createTestDungeon } from "../test/fixtures.ts";
import { DungeonDifficulty } from "../types/dungeons.ts";
import { useTrackerDomain } from "./use-tracker-domain.ts";
import { getLocalizedDungeonDisplayName } from "../i18n/localized-domain.ts";

describe("useTrackerDomain", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("saves changes immediately and restores them on mount", () => {
    const character = createTestCharacter({ id: "alpha", name: "Alpha" });
    const dungeon = createTestDungeon({
      id: "icc",
      name: "Icecrown Citadel",
      shortName: "ICC",
    });
    const { result, unmount } = renderHook(() => useTrackerDomain());

    act(() => {
      result.current.addCharacter(character);
      result.current.addDungeon(dungeon);
      result.current.handleDungeonToggle(character.id, dungeon.id);
    });


    expect(loadRaidTrackerState().state).toEqual({
      characters: [character],
      dungeons: [dungeon],
      dungeonToggles: { alpha: { icc: true } },
    });

    unmount();
    const restored = renderHook(() => useTrackerDomain());
    expect(restored.result.current.characters).toEqual([character]);
    expect(restored.result.current.dungeons).toEqual([dungeon]);
    expect(restored.result.current.dungeonToggles).toEqual({
      alpha: { icc: true },
    });
  });

  it("removes dependent toggles when a character or dungeon is deleted", () => {
    const alpha = createTestCharacter({ id: "alpha" });
    const beta = createTestCharacter({ id: "beta" });
    const icc = createTestDungeon({ id: "icc" });
    const ulduar = createTestDungeon({ id: "ulduar" });
    const { result } = renderHook(() => useTrackerDomain());

    act(() => {
      result.current.addCharacter(alpha);
      result.current.addCharacter(beta);
      result.current.addDungeon(icc);
      result.current.addDungeon(ulduar);
      result.current.handleDungeonToggle(alpha.id, icc.id);
      result.current.handleDungeonToggle(beta.id, icc.id);
      result.current.handleDungeonToggle(beta.id, ulduar.id);
    });

    act(() => {
      result.current.handleDeleteCharacter(alpha.id);
      result.current.handleDeleteDungeon(icc.id);
    });
    expect(result.current.characters).toEqual([beta]);
    expect(result.current.dungeons).toEqual([ulduar]);
    expect(result.current.dungeonToggles).toEqual({ beta: { ulduar: true } });

    act(() => {
      result.current.handleResetCharacterToggles(beta.id);
    });
    expect(result.current.dungeonToggles).toEqual({ beta: {} });
    expect(result.current.canResetAllToggles).toBe(false);
  });

  it("updates character gear, column order, and editable dungeon fields", () => {
    const alpha = createTestCharacter({ id: "alpha" });
    const beta = createTestCharacter({ id: "beta" });
    const dungeon = createTestDungeon({ id: "citadel", itemLevel: [200, 213] });
    const { result } = renderHook(() => useTrackerDomain());

    act(() => {
      result.current.addCharacter(alpha);
      result.current.addCharacter(beta);
      result.current.addDungeon(dungeon);
    });
    act(() => {
      result.current.updateCharacter(beta.id, {
        mainSpec: { spec: "Blood", gearScore: 5800 },
        alsoOwnedItemIds: [51312],
      });
      result.current.moveCharacter(beta.id, -1);
      result.current.updateDungeon(dungeon.id, {
        name: "Renamed raid",
        raidKey: null,
        shortName: "RR",
        size: 10,
        difficulty: DungeonDifficulty.HEROIC,
      });
    });

    expect(result.current.characters.map((character) => character.id)).toEqual([
      "beta",
      "alpha",
    ]);
    expect(result.current.characters[0]).toEqual({
      ...beta,
      mainSpec: { spec: "Blood", gearScore: 5800 },
      alsoOwnedItemIds: [51312],
    });
    expect(result.current.dungeons[0]).toEqual({
      ...dungeon,
      name: "Renamed raid",
      raidKey: null,
      shortName: "RR",
      size: 10,
      difficulty: DungeonDifficulty.HEROIC,
    });
  });

  it("adds the raid template only when the dungeon list is empty", () => {
    const { result } = renderHook(() => useTrackerDomain());

    act(() => {
      result.current.handleAddFromTemplate();
    });
    const firstIds = result.current.dungeons.map((dungeon) => dungeon.id);
    expect(firstIds).toHaveLength(DungeonList.length);
    expect(new Set(firstIds).size).toBe(DungeonList.length);

    act(() => {
      result.current.handleAddFromTemplate();
    });
    expect(result.current.dungeons.map((dungeon) => dungeon.id)).toEqual(firstIds);
  });

  it("preserves corrupted tracker data until replacement is requested", () => {
    const raw = "{broken";
    localStorage.setItem(STORAGE_KEY, raw);
    const { result } = renderHook(() => useTrackerDomain());
    act(() => result.current.addCharacter(createTestCharacter()));
    expect(localStorage.getItem(STORAGE_KEY)).toBe(raw);
    expect(result.current.storageOriginal).toBe(raw);
    expect(result.current.storageLoadWarning).toBe(LOAD_WARNING_CORRUPTED_SAVE);

    act(() => result.current.recoverStorage?.());
    expect(result.current.storageLoadWarning).toBeNull();
    expect(loadRaidTrackerState().state.characters).toHaveLength(1);
  });

  it("keeps future tracker saves available for export without a replacement action", () => {
    const raw = JSON.stringify({ schemaVersion: 999, data: "keep me" });
    localStorage.setItem(STORAGE_KEY, raw);
    const { result, unmount } = renderHook(() => useTrackerDomain());
    act(() => result.current.addCharacter(createTestCharacter()));
    expect(result.current.storageOriginal).toBe(raw);
    expect(result.current.storageLoadWarning).toBe(LOAD_WARNING_UNSUPPORTED_SAVE);
    expect(result.current.recoverStorage).toBeUndefined();
    unmount();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(raw);
  });

  it("loads legacy data even when the first write fails and moves it after a successful write", () => {
    const raw = JSON.stringify({
      characters: [{ id: "legacy", name: "Alpha", className: "Death Knight" }],
      dungeons: [],
      dungeonToggles: {},
    });
    localStorage.setItem(LEGACY_STORAGE_KEY, raw);
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Full", "QuotaExceededError");
    });
    const { result } = renderHook(() => useTrackerDomain());
    expect(result.current.characters.map(({ id }) => id)).toEqual(["legacy"]);
    expect(write).not.toHaveBeenCalled();
    act(() => result.current.addCharacter(createTestCharacter({ id: "new" })));
    expect(result.current.storageSaveError).toBe(STORAGE_QUOTA_EXCEEDED);
    expect(localStorage.getItem(LEGACY_STORAGE_KEY)).toBe(raw);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    write.mockRestore();
    act(() => result.current.addDungeon(createTestDungeon()));
    expect(result.current.storageSaveError).toBeNull();
    expect(loadRaidTrackerState().state.characters.map(({ id }) => id)).toEqual(["legacy", "new"]);
    expect(localStorage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
  });

  it("preserves a stale tab's working copy without overwriting another tab", () => {
    const first = renderHook(() => useTrackerDomain());
    const second = renderHook(() => useTrackerDomain());
    act(() => first.result.current.addCharacter(createTestCharacter()));
    act(() => second.result.current.addDungeon(createTestDungeon()));

    expect(second.result.current.storageSaveError).toBe(STORAGE_CONFLICT);
    expect(JSON.parse(second.result.current.exportStorageDraft()).dungeons).toHaveLength(1);
    expect(loadRaidTrackerState().state.characters).toHaveLength(1);
    expect(loadRaidTrackerState().state.dungeons).toHaveLength(0);
  });

  it("keeps template loot on rename and updates it only for an explicitly selected variant", () => {
    const { result } = renderHook(() => useTrackerDomain());
    const raid = createTestDungeon({
      name: "Icecrown Citadel",
      raidKey: "icecrownCitadel",
      itemLevel: [264, 271],
    });
    const variant = { size: raid.size, difficulty: raid.difficulty };
    act(() => result.current.addDungeon(raid));
    act(() => result.current.updateDungeon(raid.id, { ...variant, raidKey: "icecrownCitadel", name: "Friday team" }));
    const renamed = loadRaidTrackerState().state.dungeons[0]!;
    expect(renamed.raidKey).toBe("icecrownCitadel");
    expect(getLocalizedDungeonDisplayName(renamed, "ru", false)).toBe("Friday team");

    act(() => result.current.updateDungeon(raid.id, { ...variant, raidKey: "rubySanctum", name: "Friday team" }));
    expect(loadRaidTrackerState().state.dungeons[0]).toMatchObject({
      raidKey: "rubySanctum",
      itemLevel: [271],
    });
    act(() => result.current.updateDungeon(raid.id, { ...variant, size: 40, raidKey: "rubySanctum", name: "Friday team" }));
    expect(loadRaidTrackerState().state.dungeons[0]).toMatchObject({ size: raid.size, itemLevel: [271] });
  });

  it("reports a failed save and clears the error after a successful retry", () => {
    const { result } = renderHook(() => useTrackerDomain());
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });

    act(() => {
      result.current.addCharacter(createTestCharacter({ id: "alpha" }));
    });
    expect(result.current.storageSaveError).toBe(
      STORAGE_QUOTA_EXCEEDED,
    );

    write.mockRestore();
    act(() => {
      result.current.addDungeon(createTestDungeon({ id: "icc" }));
    });
    expect(result.current.storageSaveError).toBeNull();
    expect(loadRaidTrackerState().state.dungeons).toHaveLength(1);
  });
});
