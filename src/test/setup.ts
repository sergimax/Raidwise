import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll } from "vitest";
import { ensureAllWowDataLoaded } from "../data/ensure-wow-data.ts";

beforeAll(async () => {
  await ensureAllWowDataLoaded("en");
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});
