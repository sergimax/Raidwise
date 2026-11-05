import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BIS_LISTS_STORAGE_KEY } from "../storage/bis-lists/constants.ts";
import {
  STORAGE_CONFLICT,
  STORAGE_KEY,
  STORAGE_LOCK_UNAVAILABLE,
  STORAGE_QUOTA_EXCEEDED,
  STORAGE_READ_FAILED,
} from "../storage/constants.ts";
import { createTestCharacter } from "../test/fixtures.ts";
import { ClassName } from "../types/characters.ts";
import { useBisListsDomain } from "./use-bis-lists-domain.ts";
import { useTrackerDomain } from "./use-tracker-domain.ts";

function useTrackerEdits() {
  const domain = useTrackerDomain();
  return { ...domain, edit: (name: string) => { domain.addCharacter(createTestCharacter({ name })); } };
}

function useBisEdits() {
  const domain = useBisListsDomain();
  return { ...domain, edit: (name: string) => { domain.savePresetByName(ClassName.DeathKnight, "Unholy", name, []); } };
}

function holdWrites() {
  const waiting: Array<() => void> = [];
  Object.defineProperty(navigator, "locks", {
    configurable: true,
    value: {
      request: (...args: [string, () => void]) => new Promise<void>((resolve) => {
        waiting.push(() => resolve(args[1]()));
      }),
    },
  });
  return () => act(() => {
    for (const release of waiting.splice(0)) release();
  });
}

describe.each([
  { name: "tracker", key: STORAGE_KEY, useDomain: useTrackerEdits },
  { name: "BiS", key: BIS_LISTS_STORAGE_KEY, useDomain: useBisEdits },
])("$name write lifecycle", ({ key, useDomain }) => {
  it("restores all queued edits on remount and saves them once access is granted", () => {
    const release = holdWrites();
    const first = renderHook(() => useDomain());
    const clock = vi.spyOn(Date, "now").mockReturnValue(42);
    try {
      act(() => first.result.current.edit("First"));
      act(() => first.result.current.edit("Second"));
    } finally {
      clock.mockRestore();
    }
    const workingCopy = first.result.current.exportStorageDraft();
    expect(first.result.current.storageSaving).toBe(true);
    expect(localStorage.getItem(key)).toBeNull();
    first.unmount();

    const restored = renderHook(() => useDomain());
    expect(restored.result.current.exportStorageDraft()).toBe(workingCopy);
    release();

    expect(localStorage.getItem(key)).toBe(workingCopy);
    expect(restored.result.current.storageHasDraft).toBe(false);
    expect(sessionStorage.getItem(`${key}:pending`)).toBeNull();
  });

  it("preserves the draft across a quota error and retries it without a new edit", () => {
    const nativeWrite = Storage.prototype.setItem;
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (
      this: Storage, name: string, value: string,
    ) {
      if (this === localStorage) throw new DOMException("Full", "QuotaExceededError");
      nativeWrite.call(this, name, value);
    });
    const hook = renderHook(() => useDomain());
    try {
      act(() => hook.result.current.edit("Quota"));
      expect(hook.result.current.storageSaveError).toBe(STORAGE_QUOTA_EXCEEDED);
      expect(hook.result.current.storageHasDraft).toBe(true);
      expect(hook.result.current.storageVolatileDraft).toBe(false);
      expect(localStorage.getItem(key)).toBeNull();
    } finally {
      write.mockRestore();
    }
    act(() => hook.result.current.retryStorageSave?.());
    expect(localStorage.getItem(key)).toBe(hook.result.current.exportStorageDraft());
    expect(hook.result.current.storageHasDraft).toBe(false);
  });

  it("does not publish a draft based on an unreadable store", () => {
    const nativeRead = Storage.prototype.getItem;
    const read = vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (
      this: Storage, name: string,
    ) {
      if (this === localStorage) throw new DOMException("Denied", "SecurityError");
      return nativeRead.call(this, name);
    });
    const hook = renderHook(() => useDomain());
    try {
      act(() => hook.result.current.edit("Working"));
      expect(hook.result.current.storageLoadWarning).toBe(STORAGE_READ_FAILED);
    } finally {
      read.mockRestore();
    }
    const workingCopy = hook.result.current.exportStorageDraft();
    hook.unmount();
    const restored = renderHook(() => useDomain());
    expect(restored.result.current.exportStorageDraft()).toBe(workingCopy);
    expect(restored.result.current.storageSaveError).toBe(STORAGE_CONFLICT);
    expect(localStorage.getItem(key)).toBeNull();
  });

  it("keeps an exportable draft when the browser cannot coordinate writes", () => {
    Object.defineProperty(navigator, "locks", { configurable: true, value: undefined });
    const { result } = renderHook(() => useDomain());
    act(() => result.current.edit("Uncoordinated"));
    expect(result.current.storageSaveError).toBe(STORAGE_LOCK_UNAVAILABLE);
    expect(result.current.exportStorageDraft()).toContain("Uncoordinated");
    expect(sessionStorage.getItem(`${key}:pending`)).not.toBeNull();
    expect(localStorage.getItem(key)).toBeNull();
  });
});
