import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BisListsProvider } from "../../contexts/bis-lists-provider.tsx";
import { ItemTooltipLocaleProvider } from "../../contexts/item-tooltip-locale-provider.tsx";
import { RaidTrackerProvider } from "../../contexts/raid-tracker-provider.tsx";
import { DungeonList } from "../../data/dungeon-list.ts";
import { AppThemeProvider } from "../app-theme-provider/index.tsx";
import { TrackerLayout } from "./index.tsx";

vi.hoisted(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

function renderTrackerLayout() {
  return render(
    <AppThemeProvider>
      <ItemTooltipLocaleProvider initialLocale="en">
        <RaidTrackerProvider>
          <BisListsProvider>
            <TrackerLayout />
          </BisListsProvider>
        </RaidTrackerProvider>
      </ItemTooltipLocaleProvider>
    </AppThemeProvider>,
  );
}

describe("TrackerLayout add from template confirm", () => {
  beforeEach(() => {
    localStorage.clear();
    window.scrollTo = vi.fn();
  });

  it("loads template raids only after confirm", async () => {
    const user = userEvent.setup();
    renderTrackerLayout();

    expect(
      screen.getByText(
        "Add a dungeon or use Add raids from template to get started.",
      ),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Add raids from template" }),
    );

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText("Add raids from template?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Add a dungeon or use Add raids from template to get started.",
      ),
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Add" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Add a dungeon or use Add raids from template to get started.",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByRole("row").length,
    ).toBeGreaterThanOrEqual(DungeonList.length);
  });

  it("leaves the dungeon list empty when confirm is cancelled", async () => {
    const user = userEvent.setup();
    renderTrackerLayout();

    await user.click(
      screen.getByRole("button", { name: "Add raids from template" }),
    );

    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "Add a dungeon or use Add raids from template to get started.",
      ),
    ).toBeInTheDocument();
  });
});
