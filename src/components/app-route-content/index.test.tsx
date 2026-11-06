import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
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

const headerCommits = vi.hoisted(() => vi.fn());
vi.mock("../app-header/index.tsx", async (importOriginal) => {
  const { AppHeader } = await importOriginal<typeof import("../app-header/index.tsx")>();
  const { Profiler } = await import("react");
  return {
    AppHeader: (props: React.ComponentProps<typeof AppHeader>) => (
      <Profiler id="header" onRender={headerCommits}><AppHeader {...props} /></Profiler>
    ),
  };
});

function CurrentPath() {
  return <span data-testid="current-path">{useLocation().pathname}</span>;
}

function HistoryControls() {
  const navigate = useNavigate();
  return <>
    <button onClick={() => navigate(-1)}>Back</button>
    <button onClick={() => navigate(1)}>Forward</button>
  </>;
}

async function renderRoute(path: string, options: { locale?: "en" | "ru"; history?: string[]; basename?: string } = {}) {
  render(
    <AppThemeProvider>
      <ItemTooltipLocaleProvider initialLocale={options.locale ?? "en"}>
        <WowDataProvider>
          <MemoryRouter basename={options.basename} initialEntries={[...(options.history ?? []), path]}>
            <RaidTrackerProvider>
              <BisListsProvider>
                <RaidWorkspaceSessionProvider>
                  <AppRouteContent />
                  <CurrentPath />
                  {options.history && <HistoryControls />}
                </RaidWorkspaceSessionProvider>
              </BisListsProvider>
            </RaidTrackerProvider>
          </MemoryRouter>
        </WowDataProvider>
      </ItemTooltipLocaleProvider>
    </AppThemeProvider>,
  );
  await screen.findByRole("main", {}, { timeout: 5000 });
}

describe("AppRouteContent", () => {
  beforeEach(() => {
    localStorage.clear();
    window.scrollTo = vi.fn();
  });

  it("updates the character pick filter without committing the workspace header", async () => {
    const user = userEvent.setup();
    await renderRoute("/raids/select-character", { history: ["/settings"] });
    const filterName = "Enable minimum gear score filter for character pick";
    const filter = await screen.findByLabelText(filterName, {}, { timeout: 5000 });
    headerCommits.mockClear();
    await user.click(filter);
    expect(filter).toBeChecked();
    expect(headerCommits.mock.calls).toHaveLength(0);

    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("heading", { name: "Application settings" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Forward" }));
    expect(await screen.findByLabelText(filterName)).toBeChecked();
  });

  it("redirects the root URL to the raid workspace", async () => {
    await renderRoute("/");

    expect(screen.getByTestId("current-path")).toHaveTextContent("/raids");
    expect(await screen.findByRole("table")).toBeInTheDocument();
  });

  it("redirects the old changelog URL to settings and navigates back through desktop navigation", async () => {
    const user = userEvent.setup();
    await renderRoute("/changelog");

    expect(screen.getByTestId("current-path")).toHaveTextContent("/settings");
    expect(screen.getByRole("heading", { name: "Application settings" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sections" }));
    await user.click(screen.getByRole("menuitem", { name: "My Raids" }));
    expect(screen.getByTestId("current-path")).toHaveTextContent("/raids");
    expect(await screen.findByRole("table")).toBeInTheDocument();
  });

  it.each(["/unknown", "/raids/typo"])("shows a not found page for %s", async (path) => {
    await renderRoute(path);

    expect(screen.getByTestId("current-path")).toHaveTextContent(path);
    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
  });

  it("shows a localized 404 and restores the known raid tool with a trailing slash through history", async () => {
    const user = userEvent.setup();
    await renderRoute("/raidwise/raids/typo", {
      locale: "ru", basename: "/raidwise", history: ["/raidwise/raids/add-new-raid///"],
    });
    expect(screen.getByRole("heading", { name: "Страница не найдена" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back" }));
    await screen.findByRole("table");
    expect(document.querySelector('input[name="dungeonName"]')).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Forward" }));
    expect(screen.getByRole("heading", { name: "Страница не найдена" })).toBeInTheDocument();
  });

  it("keeps the recovery warning and exports the original after an external write", async () => {
    const raw = '{"characters":[null],"dungeons":[],"dungeonToggles":{}}';
    localStorage.setItem("raidwise", raw);
    const user = userEvent.setup();
    await renderRoute("/raids");

    localStorage.setItem("raidwise", '{"characters":[],"dungeons":[],"dungeonToggles":{}}');
    fireEvent(window, new StorageEvent("storage", { key: "raidwise" }));
    expect(screen.getByText(/Some saved data could not be read/)).toBeInTheDocument();
    expect(screen.getByText(/The saved data changed in another tab/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Replace with working copy" })).not.toBeInTheDocument();

    const createObjectURL = vi.fn<(blob: Blob) => string>().mockReturnValue("blob:recovery");
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    vi.stubGlobal("URL", class extends URL {
      static createObjectURL = createObjectURL;
      static revokeObjectURL = vi.fn();
    });
    try {
      await user.click(screen.getByRole("button", { name: "Download original" }));
      const [blob] = createObjectURL.mock.calls[0];
      const contents = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(blob);
      });
      expect(contents).toBe(raw);
      expect(click.mock.contexts[0]).toHaveAttribute("download", "raidwise-tracker-original.json");
    } finally {
      click.mockRestore();
      vi.unstubAllGlobals();
    }
  });

  it("opens a raid tool from its URL and returns to the workspace when closed", async () => {
    const user = userEvent.setup();
    await renderRoute("/raids/bis-builds");

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
    await renderRoute(path);

    expect(screen.getByTestId("current-path")).toHaveTextContent(path);
    expect(document.querySelector(`input[name="${fieldName}"]`)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: closeLabel }));
    expect(screen.getByTestId("current-path")).toHaveTextContent("/raids");
    expect(document.querySelector(`input[name="${fieldName}"]`)).not.toBeInTheDocument();
  });

  it("keeps the selected language while navigating between settings and raids", async () => {
    const user = userEvent.setup();
    await renderRoute("/settings");

    await user.click(screen.getByRole("button", {
      name: "Interface language EN. Switch to RU.",
    }));
    expect(screen.getByRole("heading", { name: "Настройки приложения" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Разделы" }));
    await user.click(screen.getByRole("menuitem", { name: "Мои рейды" }));
    expect(screen.getByTestId("current-path")).toHaveTextContent("/raids");
    expect(await screen.findByRole("button", {
      name: "Язык интерфейса RU. Переключить на EN.",
    })).toBeInTheDocument();
  });
});

describe("responsive header menu", () => {
  it("opens a tracker action from the same mobile menu as the app sections", async () => {
    localStorage.clear();
    const originalMatchMedia = window.matchMedia;
    const media = vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      ...originalMatchMedia(query), matches: query.includes("max-width:899.95px"),
    }));
    try {
      const user = userEvent.setup();
      await renderRoute("/raids");
      expect(screen.getByRole("tab", { name: "BiS builds" })).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Sections" }));
      expect(screen.getByRole("menuitem", { name: "Settings" })).toBeInTheDocument();
      await user.click(screen.getByRole("menuitem", { name: "BiS builds" }));
      expect(screen.getByTestId("current-path")).toHaveTextContent("/raids/bis-builds");
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    } finally {
      media.mockRestore();
    }
  });
});
