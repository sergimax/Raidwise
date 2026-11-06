import { afterEach, describe, expect, it, vi } from "vitest";
import { withSaveVisibility } from "./save-visibility.ts";

const markerKey = "raidwise:save-revision";
const locks = { request: (_name: string, callback: () => unknown) => callback() } as LockManager;

function mockReceipts(initial?: string) {
  let receipt = initial;
  const close = vi.fn();
  vi.stubGlobal("indexedDB", {
    open: () => {
      const request = {
        onsuccess: () => {},
        onupgradeneeded: () => {},
        result: {
          close,
          createObjectStore: vi.fn(),
          transaction: () => {
            const transaction = {
              oncomplete: () => {},
              objectStore: () => ({
                get: () => {
                  const read = { result: receipt, onsuccess: () => {} };
                  void Promise.resolve().then(() => read.onsuccess());
                  return read;
                },
                put: (revision: string) => {
                  void Promise.resolve().then(() => {
                    receipt = revision;
                    transaction.oncomplete();
                  });
                },
              }),
            };
            return transaction;
          },
        },
      };
      void Promise.resolve().then(() => {
        request.onupgradeneeded();
        request.onsuccess();
      });
      return request;
    },
  });
  return { close, latest: () => receipt };
}

afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("save visibility across tabs", () => {
  it("waits for the last committed revision before reading and writing", async () => {
    vi.useFakeTimers();
    const receipts = mockReceipts("latest");
    localStorage.setItem(markerKey, "stale");
    localStorage.setItem("save", "old data");

    const operation = vi.fn((commit: (write: () => void) => void) => {
      expect(localStorage.getItem("save")).toBe("updated by another tab");
      commit(() => localStorage.setItem("save", "next edit"));
    });
    const saving = withSaveVisibility(locks, operation);
    await vi.advanceTimersByTimeAsync(100);
    expect(operation).not.toHaveBeenCalled();

    localStorage.setItem("save", "updated by another tab");
    localStorage.setItem(markerKey, "latest");
    await vi.advanceTimersByTimeAsync(20);
    await saving;
    expect(operation).toHaveBeenCalledOnce();
    expect(localStorage.getItem("save")).toBe("next edit");
    expect(receipts.latest()).toBe(localStorage.getItem(markerKey));
    expect(receipts.latest()).not.toBe("latest");
    expect(receipts.close).toHaveBeenCalledOnce();
  });

  it("does not execute a save if the latest revision never becomes visible", async () => {
    vi.useFakeTimers();
    const receipts = mockReceipts("latest");
    const operation = vi.fn();
    const failure = expect(withSaveVisibility(locks, operation)).rejects.toThrow("Latest save is not visible");
    await vi.advanceTimersByTimeAsync(2000);
    await failure;
    expect(operation).not.toHaveBeenCalled();
    expect(receipts.close).toHaveBeenCalledOnce();
  });

  it("leaves the receipt and storage marker untouched if a first write fails", async () => {
    const receipts = mockReceipts();
    const error = new DOMException("Storage is full", "QuotaExceededError");
    await expect(withSaveVisibility(locks, (commit) => commit(() => {
      throw error;
    }))).rejects.toBe(error);
    expect(receipts.latest()).toBeUndefined();
    expect(localStorage.getItem(markerKey)).toBeNull();
  });
});
