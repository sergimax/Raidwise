/** Audit probes assert observed defects, not the desired fixed behavior. */
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { loadRaidTrackerState } from "../../../src/storage/parse.ts";
import { useTrackerDomain } from "../../../src/hooks/use-tracker-domain.ts";
import { useBisListsDomain } from "../../../src/hooks/use-bis-lists-domain.ts";
import { createTestCharacter, createTestDungeon } from "../../../src/test/fixtures.ts";
import { createLazyJsonLoader } from "../../../src/data/lazy-json.ts";
import { getLocalStorageItemMigrating } from "../../../src/utils/local-storage-migrate.ts";
import { resolveDungeonRaidKey } from "../../../src/utils/resolve-dungeon-raid-key.ts";

afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

it("F01: null character in current schema throws instead of warning", () => {
  localStorage.setItem("raidwise", JSON.stringify({ schemaVersion: 6, characters: [null], dungeons: [], dungeonToggles: {} }));
  expect(() => loadRaidTrackerState()).toThrow(TypeError);
});

it("F01: null dungeon in legacy schema throws during migration", () => {
  localStorage.setItem("raidwise", JSON.stringify({ characters: [], dungeons: [null], dungeonToggles: {} }));
  expect(() => loadRaidTrackerState()).toThrow(TypeError);
});

it("F02: tracker unmount before debounce loses mutation", () => {
  vi.useFakeTimers();
  const hook = renderHook(() => useTrackerDomain());
  act(() => hook.result.current.addCharacter(createTestCharacter()));
  hook.unmount();
  act(() => vi.advanceTimersByTime(500));
  expect(localStorage.getItem("raidwise")).toBeNull();
});

it("F03: corrupted tracker is overwritten and warning cleared on idle mount", () => {
  vi.useFakeTimers();
  localStorage.setItem("raidwise", "{broken");
  const hook = renderHook(() => useTrackerDomain());
  expect(hook.result.current.storageError).not.toBeNull();
  act(() => vi.advanceTimersByTime(400));
  expect(hook.result.current.storageError).toBeNull();
  expect(JSON.parse(localStorage.getItem("raidwise")!).characters).toEqual([]);
});

it("F04: unsupported BiS schema is silently overwritten on mount", () => {
  vi.useFakeTimers();
  localStorage.setItem("raidwise-bis-lists", JSON.stringify({ schemaVersion: 999, entries: { future: "valuable data" } }));
  const hook = renderHook(() => useBisListsDomain());
  expect(hook.result.current.storageError).toBeNull();
  act(() => vi.advanceTimersByTime(400));
  expect(JSON.parse(localStorage.getItem("raidwise-bis-lists")!)).toEqual({ schemaVersion: 1, entries: {} });
});

it("F05: stale second store overwrites first store changes", () => {
  vi.useFakeTimers();
  const first = renderHook(() => useTrackerDomain());
  const second = renderHook(() => useTrackerDomain());
  act(() => vi.advanceTimersByTime(400));
  act(() => first.result.current.addCharacter(createTestCharacter({ name: "Alpha" })));
  act(() => vi.advanceTimersByTime(400));
  expect(loadRaidTrackerState().state.characters).toHaveLength(1);
  act(() => second.result.current.addDungeon(createTestDungeon()));
  act(() => vi.advanceTimersByTime(400));
  expect(loadRaidTrackerState().state.characters).toHaveLength(0);
});

it("F06: rejected JSON loader stays rejected without another import", async () => {
  const importer = vi.fn().mockRejectedValueOnce(new Error("network")).mockResolvedValue({ default: {} });
  const load = createLazyJsonLoader(importer, () => {});
  await expect(load()).rejects.toThrow("network");
  await expect(load()).rejects.toThrow("network");
  expect(importer).toHaveBeenCalledTimes(1);
});

it("F07: editing custom display name drops template identity", () => {
  vi.useFakeTimers();
  const hook = renderHook(() => useTrackerDomain());
  const raid = createTestDungeon({ raidKey: "icecrownCitadel" });
  act(() => hook.result.current.addDungeon(raid));
  act(() => hook.result.current.updateDungeon(raid.id, { name: "Friday team", size: raid.size, difficulty: raid.difficulty }));
  expect(resolveDungeonRaidKey(hook.result.current.dungeons[0])).toBeUndefined();
});

it("F08: legacy read is lost to caller when copying exceeds quota", () => {
  localStorage.setItem("legacy-audit", "valuable data");
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("full", "QuotaExceededError"); });
  expect(getLocalStorageItemMigrating("new-audit", "legacy-audit")).toBeNull();
  expect(localStorage.getItem("legacy-audit")).toBe("valuable data");
});
