import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import App from "./App.tsx";
import { AppThemeProvider } from "./components/app-theme-provider/index.tsx";
import { APP_ROUTES } from "./routing/app-route.ts";

vi.hoisted(() => {
  vi.stubGlobal("matchMedia", (media: string) => ({
    media,
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }));
});

it("loads core item data for character import and adds hint data when opening BiS", async () => {
  const previousPath = window.location.pathname;
  const basename = import.meta.env.BASE_URL.replace(/\/$/, "");
  window.history.replaceState(null, "", basename + APP_ROUTES.addCharacter);
  localStorage.setItem("raidwise-item-tooltip-locale", "en");
  const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async () => Response.json({}));
  const requestedFiles = () => fetchMock.mock.calls.map(([url]) =>
    new URL(String(url), window.location.origin).pathname.split("/").at(-1),
  );
  const user = userEvent.setup();

  try {
    render(<AppThemeProvider><App /></AppThemeProvider>);
    const closeForm = await screen.findByRole("button", { name: "Close add character panel" }, { timeout: 5000 });
    await waitFor(() => expect(requestedFiles().sort()).toEqual([
      "wotlk-item-levels.json", "wotlk-item-names.json",
    ]));

    await user.click(closeForm);
    await user.click(screen.getByRole("tab", { name: "BiS builds" }));
    expect(await screen.findByPlaceholderText("Custom list name", {}, { timeout: 5000 })).toBeInTheDocument();
    expect(requestedFiles()).toContain("wotlk-item-stats.json");
    expect(requestedFiles().filter((name) => name === "wotlk-item-levels.json")).toHaveLength(1);
  } finally {
    fetchMock.mockRestore();
    window.history.replaceState(null, "", previousPath);
  }
});
