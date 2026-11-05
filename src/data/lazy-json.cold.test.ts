import { expect, it, vi } from "vitest";
import { createLazyJsonLoader, MissingWowDataAssetError } from "./lazy-json.ts";

it("shares an in-flight request and revalidates a failed asset before hydrating it", async () => {
  const data = { 123: "Item" };
  const fetchMock = vi.spyOn(globalThis, "fetch")
    .mockRejectedValueOnce(new TypeError("offline"))
    .mockResolvedValueOnce(Response.json(data));
  const hydrate = vi.fn();
  const url = "/assets/items.json";
  const load = createLazyJsonLoader(url, hydrate);
  try {
    const first = load();
    expect(load()).toBe(first);
    await expect(first).rejects.toThrow("offline");
    await expect(load()).resolves.toBeUndefined();
    await load();
    expect(fetchMock.mock.calls).toEqual([[url, { cache: "default" }], [url, { cache: "no-cache" }]]);
    expect(hydrate).toHaveBeenCalledExactlyOnceWith(data);
  } finally {
    fetchMock.mockRestore();
  }
});

it.each([
  () => new Response(null, { status: 404 }),
  () => new Response("<html></html>", { headers: { "Content-Type": "text/html" } }),
])("recognizes an unavailable asset URL without hydrating it", async (response) => {
  const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response());
  const hydrate = vi.fn();
  try {
    await expect(createLazyJsonLoader("/assets/old.json", hydrate)()).rejects.toBeInstanceOf(MissingWowDataAssetError);
    expect(hydrate).not.toHaveBeenCalled();
  } finally {
    fetchMock.mockRestore();
  }
});
