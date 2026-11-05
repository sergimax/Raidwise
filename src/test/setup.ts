import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach } from "vitest";
import { ensureAllWowDataLoaded } from "../data/ensure-wow-data.ts";

beforeAll(async () => {
  await ensureAllWowDataLoaded("en");
});

beforeEach(() => {
  // Most UI tests need an uncontended save. Browser and persistence tests exercise the queue.
  Object.defineProperty(navigator, "locks", {
    configurable: true,
    value: { request: (...args: [string, () => void]) => Promise.resolve(args[1]()) },
  });
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});
