import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

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
