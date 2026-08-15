import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLocalStorageItemMigrating } from "./local-storage-migrate.ts";

describe("getLocalStorageItemMigrating", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns the current key when present", () => {
    localStorage.setItem("raidwise", "new");
    localStorage.setItem("my-raid-cds", "old");
    expect(getLocalStorageItemMigrating("raidwise", "my-raid-cds")).toBe("new");
    expect(localStorage.getItem("my-raid-cds")).toBe("old");
  });

  it("copies legacy value to the new key and removes the legacy entry", () => {
    localStorage.setItem("my-raid-cds", "legacy-payload");
    expect(getLocalStorageItemMigrating("raidwise", "my-raid-cds")).toBe(
      "legacy-payload",
    );
    expect(localStorage.getItem("raidwise")).toBe("legacy-payload");
    expect(localStorage.getItem("my-raid-cds")).toBeNull();
  });

  it("returns null when neither key exists", () => {
    expect(getLocalStorageItemMigrating("raidwise", "my-raid-cds")).toBeNull();
  });

  it("returns null when localStorage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(getLocalStorageItemMigrating("raidwise", "my-raid-cds")).toBeNull();
    vi.restoreAllMocks();
  });
});
