import { describe, expect, it } from "vitest";
import {
  ADD_PLACEHOLDER_BORDER,
  ADD_PLACEHOLDER_BORDER_ACTIVE,
  ADD_PLACEHOLDER_BORDER_HOVER,
  addPlaceholderControlSx,
} from "./add-placeholder-cell-sx.ts";

describe("addPlaceholderControlSx", () => {
  it("uses a dashed border at rest", () => {
    const sx = addPlaceholderControlSx({ active: false });

    expect(ADD_PLACEHOLDER_BORDER).toMatch(/dashed/);
    expect(sx).toMatchObject({
      border: ADD_PLACEHOLDER_BORDER,
      borderRadius: 1,
      cursor: "pointer",
      color: "text.secondary",
    });
  });

  it("strengthens border and soft brand fill when active", () => {
    const sx = addPlaceholderControlSx({ active: true });

    expect(sx.border).toBe(ADD_PLACEHOLDER_BORDER_ACTIVE);
    expect(sx.bgcolor).toMatch(/brand/);
  });

  it("defines hover border and fill for pointer feedback", () => {
    const sx = addPlaceholderControlSx({ active: false });
    const hover = sx["&:hover"] as Record<string, unknown>;

    expect(hover.border).toBe(ADD_PLACEHOLDER_BORDER_HOVER);
    expect(hover.bgcolor).toBeDefined();
  });

  it("defines focus-visible outline for keyboard users", () => {
    const sx = addPlaceholderControlSx({ active: false });
    const focusVisible = sx["&:focus-visible"] as Record<string, unknown>;

    expect(focusVisible.outline).toBeDefined();
  });
});
