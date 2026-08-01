import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { APP_INTRO_DISMISSED_STORAGE_KEY } from "../constants/app-intro.ts";
import { useAppIntroVisibility } from "./use-app-intro-visibility.ts";

describe("useAppIntroVisibility", () => {
  it("shows by default on an empty tracker", () => {
    localStorage.removeItem(APP_INTRO_DISMISSED_STORAGE_KEY);

    const { result } = renderHook(() =>
      useAppIntroVisibility({ isEmptyTracker: true }),
    );

    expect(result.current.visible).toBe(true);
  });

  it("stays hidden on an empty tracker after dismiss", () => {
    localStorage.removeItem(APP_INTRO_DISMISSED_STORAGE_KEY);

    const { result, unmount } = renderHook(() =>
      useAppIntroVisibility({ isEmptyTracker: true }),
    );

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.visible).toBe(false);
    unmount();

    const { result: reloaded } = renderHook(() =>
      useAppIntroVisibility({ isEmptyTracker: true }),
    );
    expect(reloaded.current.visible).toBe(false);
  });

  it("hides when the tracker is not empty unless forced open", () => {
    localStorage.removeItem(APP_INTRO_DISMISSED_STORAGE_KEY);

    const { result, rerender } = renderHook(
      ({ isEmptyTracker }) => useAppIntroVisibility({ isEmptyTracker }),
      { initialProps: { isEmptyTracker: false } },
    );

    expect(result.current.visible).toBe(false);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.visible).toBe(true);

    rerender({ isEmptyTracker: true });
    expect(result.current.visible).toBe(true);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.visible).toBe(false);
  });
});
