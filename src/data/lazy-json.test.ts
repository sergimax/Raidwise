import { expect, it, vi } from "vitest";
import { createLazyJsonLoader } from "./lazy-json.ts";

it("shares an in-flight request and retries after a rejected import", async () => {
  const data = { 123: "Item" };
  const importer = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue({ default: data });
  const hydrate = vi.fn();
  const load = createLazyJsonLoader(importer, hydrate);
  const first = load();
  expect(load()).toBe(first);
  await expect(first).rejects.toThrow("offline");
  await expect(load()).resolves.toBeUndefined();
  expect(importer).toHaveBeenCalledTimes(2);
  expect(hydrate).toHaveBeenCalledExactlyOnceWith(data);
});
