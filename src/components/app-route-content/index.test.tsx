import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BisListsProvider } from "../../contexts/bis-lists-provider.tsx";
import { ItemTooltipLocaleProvider } from "../../contexts/item-tooltip-locale-provider.tsx";
import { RaidTrackerProvider } from "../../contexts/raid-tracker-provider.tsx";
import { RaidWorkspaceSessionProvider } from "../../contexts/raid-workspace-session-provider.tsx";
import { WowDataProvider } from "../../contexts/wow-data-provider.tsx";
import { AppThemeProvider } from "../app-theme-provider/index.tsx";
import { AppRouteContent } from "./index.tsx";

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

function CurrentPath() {
  return <span data-testid="current-path">{useLocation().pathname}</span>;
}

function renderRoute(path: string) {
  return render(
    <AppThemeProvider>
      <ItemTooltipLocaleProvider initialLocale="en">
        <WowDataProvider>
          <MemoryRouter initialEntries={[path]}>
            <RaidTrackerProvider>
              <BisListsProvider>
                <RaidWorkspaceSessionProvider>
                  <AppRouteContent />
                  <CurrentPath />
                </RaidWorkspaceSessionProvider>
              </BisListsProvider>
            </RaidTrackerProvider>
          </MemoryRouter>
        </WowDataProvider>
      </ItemTooltipLocaleProvider>
    </AppThemeProvider>,
  );
}

describe("AppRouteContent", () => {
  beforeEach(() => {
    localStorage.clear();
    window.scrollTo = vi.fn();
  });

  it("redirects the root URL to the raid workspace", () => {
    renderRoute("/");

    expect(screen.getByTestId("current-path")).toHaveTextContent("/raids");
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("redirects the old changelog URL to settings and navigates back through the menu", async () => {
    const user = userEvent.setup();
    renderRoute("/changelog");

    expect(screen.getByTestId("current-path")).toHaveTextContent("/settings");
    expect(screen.getByRole("heading", { name: "Application settings" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sections" }));
    await user.click(screen.getByRole("menuitem", { name: "My Raids" }));
    expect(screen.getByTestId("current-path")).toHaveTextContent("/raids");
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("shows a not found page for an unknown URL", () => {
    renderRoute("/unknown");

    expect(screen.getByTestId("current-path")).toHaveTextContent("/unknown");
    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
  });

  it("opens a raid tool from its URL and returns to the workspace when closed", async () => {
    const user = userEvent.setup();
    renderRoute("/raids/bis-builds");

    expect(screen.getByTestId("current-path")).toHaveTextContent("/raids/bis-builds");
    expect(screen.getByText("BiS lists")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close BiS lists panel" }));
    expect(screen.getByTestId("current-path")).toHaveTextContent("/raids");
    expect(screen.queryByText("BiS lists")).not.toBeInTheDocument();
  });

  it.each([
    ["/raids/add-new-raid", "dungeonName", "Close add raid panel"],
    ["/raids/add-character", "characterName", "Close add character panel"],
  ])("opens and closes the form at %s", async (path, fieldName, closeLabel) => {
    const user = userEvent.setup();
    renderRoute(path);

    expect(screen.getByTestId("current-path")).toHaveTextContent(path);
    expect(document.querySelector(`input[name="${fieldName}"]`)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: closeLabel }));
    expect(screen.getByTestId("current-path")).toHaveTextContent("/raids");
    expect(document.querySelector(`input[name="${fieldName}"]`)).not.toBeInTheDocument();
  });

  it("keeps the selected language while navigating between settings and raids", async () => {
    const user = userEvent.setup();
    renderRoute("/settings");

    await user.click(screen.getByRole("button", {
      name: "Interface language EN. Switch to RU.",
    }));
    expect(screen.getByRole("heading", { name: "Настройки приложения" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Разделы" }));
    await user.click(screen.getByRole("menuitem", { name: "Мои рейды" }));
    expect(screen.getByTestId("current-path")).toHaveTextContent("/raids");
    expect(screen.getByRole("button", {
      name: "Язык интерфейса RU. Переключить на EN.",
    })).toBeInTheDocument();
  });
});
