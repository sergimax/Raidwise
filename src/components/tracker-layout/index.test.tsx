import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
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
        <MemoryRouter>
          <RaidTrackerProvider>
            <BisListsProvider>
              <TrackerLayout />
            </BisListsProvider>
          </RaidTrackerProvider>
        </MemoryRouter>
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

    const table = screen.getByRole("table");
    expect(
      within(table).getByRole("button", { name: /^add raid$/i }),
    ).toBeInTheDocument();
    expect(
      within(table).getByText(/add raids from template when the list is empty/i),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Add raids from template" }),
    );

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText("Add raids from template?"),
    ).toBeInTheDocument();
    expect(
      within(table).getByText(/add raids from template when the list is empty/i),
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Add" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      within(screen.getByRole("table")).queryByText(
        /add raids from template when the list is empty/i,
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
      within(screen.getByRole("table")).getByText(
        /add raids from template when the list is empty/i,
      ),
    ).toBeInTheDocument();
  });
});

describe("header usage help", () => {
  it("toggles the intro from the header while leaving theme selection in settings", async () => {
    localStorage.clear();
    const user = userEvent.setup();
    renderTrackerLayout();
    const header = within(screen.getByRole("banner"));
    expect(header.queryByRole("button", { name: /Switch to .* mode/ })).not.toBeInTheDocument();
    await user.click(header.getByRole("button", { name: "Hide how this app can help" }));
    expect(header.getByRole("button", { name: "Show how this app can help" })).toHaveAttribute("aria-pressed", "false");
    await user.click(header.getByRole("button", { name: "Show how this app can help" }));
    expect(header.getByRole("button", { name: "Hide how this app can help" })).toHaveAttribute("aria-pressed", "true");
  });
});
