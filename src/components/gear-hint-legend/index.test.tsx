import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GEAR_HINT_LEGEND_DISMISSED_STORAGE_KEY } from "../../constants/gear-hint-legend.ts";
import { renderWithTheme, screen } from "../../test/render-with-theme.tsx";
import { GearHintLegend } from "./index.tsx";

describe("GearHintLegend", () => {
  it("shows amber BiS and blue Upgrades meanings on one line", () => {
    renderWithTheme(<GearHintLegend onDismiss={vi.fn()} />);

    expect(screen.getByText("BiS")).toBeInTheDocument();
    expect(screen.getByText("Upgrades")).toBeInTheDocument();
    expect(screen.getByText(/= missing BiS targets/)).toBeInTheDocument();
    expect(screen.getByText(/= stat-filtered ilvl upgrades/)).toBeInTheDocument();
  });

  it("calls onDismiss when the close control is activated", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    renderWithTheme(<GearHintLegend onDismiss={onDismiss} />);

    await user.click(screen.getByRole("button", { name: "Dismiss gear hint legend" }));

    expect(onDismiss).toHaveBeenCalledOnce();
  });
});

describe("GEAR_HINT_LEGEND_DISMISSED_STORAGE_KEY", () => {
  it("uses a dedicated localStorage key", () => {
    expect(GEAR_HINT_LEGEND_DISMISSED_STORAGE_KEY).toBe(
      "raidwise-gear-hint-legend-dismissed",
    );
  });
});
