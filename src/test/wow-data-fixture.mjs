import { readFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, vi } from "vitest";
import { ensureAllWowDataLoaded } from "../data/ensure-wow-data.ts";

const dataDir = resolve(dirname(fileURLToPath(import.meta.url)), "../data");

beforeAll(async () => {
  const fetchFixture = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const pathname = new URL(String(input), "http://localhost").pathname;
    const text = await readFile(resolve(dataDir, basename(pathname)), "utf8");
    return new Response(text, { headers: { "Content-Type": "application/json" } });
  });
  try {
    await ensureAllWowDataLoaded("en");
  } finally {
    fetchFixture.mockRestore();
  }
});
