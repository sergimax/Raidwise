import { describe, expect, it, vi } from "vitest";
import { createTestCharacter, createTestDungeon } from "../test/fixtures.ts";
import { ClassName, Classes } from "../types/characters.ts";
import { BIS_LISTS_STORAGE_KEYS } from "./bis-lists/constants.ts";
import { loadLocalBisListsState } from "./bis-lists/index.ts";
import {
  LOAD_WARNING_UNSUPPORTED_SAVE, STORAGE_CONFLICT, STORAGE_LOCK_UNAVAILABLE,
  STORAGE_QUOTA_EXCEEDED, STORAGE_READ_FAILED, TRACKER_STORAGE_KEYS,
} from "./constants.ts";
import { readSnapshot } from "./local-save.ts";
import { loadRaidTrackerState } from "./parse.ts";
import { serializeRaidTrackerState } from "./persist.ts";
import { createWorkspaceBackup, parseWorkspaceBackup, restoreWorkspaceBackup } from "./workspace-backup.ts";
import { WORKSPACE_SAVE_KEY } from "./workspace-save.ts";

const character = createTestCharacter({
  id: "alpha",
  class: Classes.find(({ name }) => name === ClassName.DeathKnight)!,
  mainSpec: { spec: "Unholy", gearScore: 5800, gearItems: [{ id: 51312, slot: 0, enchant: 3817, gems: [40111] }] },
  offSpec: { spec: "Blood", gearScore: 5500 },
  alsoOwnedItemIds: [54581],
});
const dungeon = createTestDungeon({ id: "icc", name: "Icecrown Citadel", raidKey: null });
const tracker = { characters: [character], dungeons: [dungeon], dungeonToggles: { alpha: { icc: true } } };
const bisLists = {
  schemaVersion: 1,
  entries: { "Death Knight|Unholy": {
    selectedPresetId: "local-1",
    presets: [{ id: "local-1", name: "My build", slots: [{ slot: 0, itemIds: [51312, 51127] }] }],
  } },
};
const file = createWorkspaceBackup({ tracker: serializeRaidTrackerState(tracker), bisLists: JSON.stringify(bisLists) });
const document = JSON.parse(file);

function validBackup() {
  const result = parseWorkspaceBackup(file);
  if (!result.ok) throw new Error(`Test fixture rejected: ${result.error}`);
  return result.backup;
}

function readWorkspaceSnapshots() {
  return { tracker: readSnapshot(TRACKER_STORAGE_KEYS), bisLists: readSnapshot(BIS_LISTS_STORAGE_KEYS) };
}

describe("workspace backup", () => {
  it("round-trips gear, raid association, cooldowns and BiS selection with one committed save", async () => {
    const backup = validBackup();
    expect(backup.summary).toEqual({ characters: 1, raids: 1, cooldowns: 1, bisLists: 1 });
    localStorage.setItem(TRACKER_STORAGE_KEYS.legacyKey, JSON.stringify({ characters: [], dungeons: [], dungeonToggles: {} }));
    expect(await restoreWorkspaceBackup(backup, readWorkspaceSnapshots(), readWorkspaceSnapshots)).toBeNull();
    expect(loadRaidTrackerState().state).toEqual(tracker);
    expect(loadLocalBisListsState().state).toEqual(bisLists);
    expect(localStorage.getItem(TRACKER_STORAGE_KEYS.legacyKey)).toBeNull();
    expect(JSON.parse(createWorkspaceBackup(backup.save))).toEqual(JSON.parse(file));
  });

  it.each([
    ["missing BiS", { bisLists: undefined }],
    ["missing raids", { tracker: { ...document.tracker, dungeons: undefined } }],
    ["orphaned cooldown", { tracker: { ...document.tracker, dungeonToggles: { alpha: { unknownRaid: true } } } }],
    ["duplicate character", { tracker: { ...document.tracker, characters: [document.tracker.characters[0], document.tracker.characters[0]] } }],
    ["invalid BiS slot", { bisLists: { schemaVersion: 1, entries: { "Death Knight|Unholy": {
      selectedPresetId: "local-1", presets: [{ id: "local-1", name: "My build", slots: [{ slot: 0, itemIds: [-1] }] }],
    } } } }],
  ])("rejects damaged sections (%s) instead of dropping records", (_reason, sections) => {
    expect(parseWorkspaceBackup(JSON.stringify({ ...document, ...sections }))).toEqual({ ok: false, error: "invalid" });
  });

  it.each([
    ["file", { version: 2 }],
    ["tracker", { tracker: { ...document.tracker, schemaVersion: 1000 } }],
    ["BiS", { bisLists: { ...document.bisLists, schemaVersion: 1000 } }],
  ])("rejects unsupported %s versions", (_reason, sections) => {
    expect(parseWorkspaceBackup(JSON.stringify({ ...document, ...sections }))).toEqual({ ok: false, error: "unsupported" });
  });

  it("leaves both original saves untouched if the atomic write exceeds quota", async () => {
    localStorage.setItem(TRACKER_STORAGE_KEYS.key, JSON.stringify({ characters: [], dungeons: [], dungeonToggles: {} }));
    localStorage.setItem(BIS_LISTS_STORAGE_KEYS.key, JSON.stringify({ schemaVersion: 1, entries: {} }));
    const expected = readWorkspaceSnapshots();
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new DOMException("quota exceeded", "QuotaExceededError");
    });
    try {
      expect(await restoreWorkspaceBackup(validBackup(), expected, readWorkspaceSnapshots)).toBe(STORAGE_QUOTA_EXCEEDED);
      expect(readWorkspaceSnapshots()).toEqual(expected);
      expect(localStorage.getItem(WORKSPACE_SAVE_KEY)).toBeNull();
    } finally {
      write.mockRestore();
    }
  });

  it("rejects a changed save or a draft created after the preview", async () => {
    const expected = readWorkspaceSnapshots();
    const backup = validBackup();
    expect(await restoreWorkspaceBackup(backup, expected, () => null)).toBe(STORAGE_CONFLICT);
    localStorage.setItem(BIS_LISTS_STORAGE_KEYS.key, JSON.stringify(bisLists));
    expect(await restoreWorkspaceBackup(backup, expected, () => expected)).toBe(STORAGE_CONFLICT);
    expect(localStorage.getItem(WORKSPACE_SAVE_KEY)).toBeNull();
  });

  it("recovers the readable section and restores a damaged workspace only against its original bytes", async () => {
    const backup = validBackup();
    const damaged = JSON.stringify({ version: 1, tracker: backup.save.tracker, bisLists: null });
    localStorage.setItem(WORKSPACE_SAVE_KEY, damaged);
    expect(loadRaidTrackerState()).toMatchObject({ state: tracker, snapshot: { workspaceOriginal: damaged } });
    const expected = readWorkspaceSnapshots();
    localStorage.setItem(WORKSPACE_SAVE_KEY, damaged + " ");
    expect(await restoreWorkspaceBackup(backup, expected, () => expected)).toBe(STORAGE_CONFLICT);
    expect(localStorage.getItem(WORKSPACE_SAVE_KEY)).toBe(damaged + " ");
    expect(await restoreWorkspaceBackup(backup, readWorkspaceSnapshots(), readWorkspaceSnapshots)).toBeNull();
    expect(loadLocalBisListsState().state).toEqual(bisLists);
  });

  it("can restore malformed workspace JSON and preserves future workspace storage", async () => {
    localStorage.setItem(WORKSPACE_SAVE_KEY, "{");
    const damaged = readWorkspaceSnapshots();
    expect(damaged.tracker.workspaceOriginal).toBe("{");
    expect(await restoreWorkspaceBackup(validBackup(), damaged, () => damaged)).toBeNull();
    const expected = readWorkspaceSnapshots();
    for (const [raw, warning] of [['{"version":2}', LOAD_WARNING_UNSUPPORTED_SAVE]]) {
      localStorage.setItem(WORKSPACE_SAVE_KEY, raw);
      const load = loadRaidTrackerState();
      expect(load.loadWarning).toBe(warning);
      expect(load.snapshot?.current).toBe(raw);
      expect(await restoreWorkspaceBackup(validBackup(), expected, () => expected)).toBe(STORAGE_READ_FAILED);
      expect(localStorage.getItem(WORKSPACE_SAVE_KEY)).toBe(raw);
    }
  });

  it("requires browser locks to restore", async () => {
    const expected = readWorkspaceSnapshots();
    const locks = Object.getOwnPropertyDescriptor(navigator, "locks")!;
    Object.defineProperty(navigator, "locks", { configurable: true, value: undefined });
    try {
      expect(await restoreWorkspaceBackup(validBackup(), expected, () => expected)).toBe(STORAGE_LOCK_UNAVAILABLE);
    } finally {
      Object.defineProperty(navigator, "locks", locks);
    }
  });
});
