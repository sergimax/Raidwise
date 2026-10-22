import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ItemTooltipLocaleProvider } from "../../contexts/item-tooltip-locale-provider.tsx";
import { AppBreadcrumbs } from "./index.tsx";

function CurrentPath() {
  return <span data-testid="path">{useLocation().pathname}</span>;
}

function renderBreadcrumbs(path: string) {
  return render(
    <ItemTooltipLocaleProvider initialLocale="en">
      <MemoryRouter initialEntries={[path]}>
        <AppBreadcrumbs />
        <CurrentPath />
      </MemoryRouter>
    </ItemTooltipLocaleProvider>,
  );
}

describe("AppBreadcrumbs", () => {
  it("shows the current top-level section", () => {
    renderBreadcrumbs("/settings");

    const breadcrumbs = screen.getByRole("navigation", { name: "Breadcrumb navigation" });
    expect(within(breadcrumbs).getByRole("link", { name: "Raidwise" })).toHaveAttribute("href", "/raids");
    expect(within(breadcrumbs).getByText("Settings")).toHaveAttribute("aria-current", "page");
  });

  it("links back to raids from a nested panel", async () => {
    const user = userEvent.setup();
    renderBreadcrumbs("/raids/bis-builds");

    const breadcrumbs = screen.getByRole("navigation", { name: "Breadcrumb navigation" });
    expect(within(breadcrumbs).getByText("BiS builds")).toHaveAttribute("aria-current", "page");
    await user.click(within(breadcrumbs).getByRole("link", { name: "My Raids" }));
    expect(screen.getByTestId("path")).toHaveTextContent("/raids");
  });
});
