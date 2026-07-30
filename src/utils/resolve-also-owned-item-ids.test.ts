import { describe, expect, it } from "vitest";
import { resolveAlsoOwnedItemIds } from "./resolve-also-owned-item-ids.ts";

describe("resolveAlsoOwnedItemIds", () => {
  it("keeps previous when update omits the field", () => {
    expect(resolveAlsoOwnedItemIds(undefined, [50108, 50730])).toEqual([
      50108, 50730,
    ]);
  });

  it("clears when update is an empty array", () => {
    expect(resolveAlsoOwnedItemIds([], [50108, 50730])).toBeUndefined();
  });

  it("replaces with non-empty update", () => {
    expect(resolveAlsoOwnedItemIds([50088], [50108])).toEqual([50088]);
  });

  it("stays cleared when previous was empty and update omits", () => {
    expect(resolveAlsoOwnedItemIds(undefined, undefined)).toBeUndefined();
    expect(resolveAlsoOwnedItemIds(undefined, [])).toBeUndefined();
  });
});
