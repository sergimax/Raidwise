import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DungeonList } from "../data/dungeons.ts";
import { loadRaidTrackerState } from "../storage/index.ts";
import { STORAGE_KEY } from "../storage/constants.ts";
import { createTestCharacter, createTestDungeon } from "../test/fixtures.ts";
import { DungeonDifficulty } from "../types/dungeons.ts";
import { useTrackerDomain } from "./use-tracker-domain.ts";

describe("useTrackerDomain", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("saves the latest changes after the debounce and restores them on mount", () => {
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

    act(() => {
      vi.advanceTimersByTime(399);
    });
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
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

  it("reports a failed save and clears the error after a successful retry", () => {
    const { result } = renderHook(() => useTrackerDomain());
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });

    act(() => {
      result.current.addCharacter(createTestCharacter({ id: "alpha" }));
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.storageError).toBe(
      "Storage quota exceeded. Please free up space.",
    );

    write.mockRestore();
    act(() => {
      result.current.addDungeon(createTestDungeon({ id: "icc" }));
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.storageError).toBeNull();
    expect(loadRaidTrackerState().state.dungeons).toHaveLength(1);
  });
});
