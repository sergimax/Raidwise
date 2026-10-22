import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import changelog from "../../../CHANGELOG.md?raw";
import { ItemTooltipLocaleProvider } from "../../contexts/item-tooltip-locale-provider.tsx";
import { AppThemeProvider } from "../app-theme-provider/index.tsx";
import { AppSettingsPage } from "./index.tsx";

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

describe("AppSettingsPage", () => {
  it("shows labeled site links and the version on its own line", () => {
    render(
      <AppThemeProvider>
        <ItemTooltipLocaleProvider initialLocale="ru">
          <MemoryRouter initialEntries={["/settings"]}>
            <AppSettingsPage />
          </MemoryRouter>
        </ItemTooltipLocaleProvider>
      </AppThemeProvider>,
    );

    const about = screen.getByRole("region", { name: "О Raidwise" });
    expect(within(about).getByText(`Версия ${__APP_VERSION__}`)).toBeInTheDocument();
    expect(within(about).getByRole("link", { name: "Исходный код на GitHub" }))
      .toHaveAttribute("href", "https://github.com/sergimax/Raidwise");
    expect(within(about).getByRole("link", { name: "Сайт автора" }))
      .toHaveAttribute("href", "https://sergimax.ru");
  });

  it("shows all changes grouped under the latest 10 versions", () => {
    const versions = [...changelog.matchAll(/^## \[(\d+\.\d+\.\d+)\]/gm)].map((match) => match[1]);
    const firstRelease = changelog.split(`## [${versions[0]}]`)[1].split(`## [${versions[1]}]`)[0];
    const firstReleaseChanges = firstRelease.split(/\r?\n/).filter((line) => /^[-*+] /.test(line));

    render(
      <AppThemeProvider>
        <ItemTooltipLocaleProvider initialLocale="ru">
          <MemoryRouter initialEntries={["/settings"]}>
            <AppSettingsPage />
          </MemoryRouter>
        </ItemTooltipLocaleProvider>
      </AppThemeProvider>,
    );

    const whatsNew = screen.getByRole("region", { name: "Что нового" });
    const releases = within(whatsNew).getAllByRole("article");
    expect(within(whatsNew).getByText("Последние 10 версий")).toBeInTheDocument();
    expect(releases).toHaveLength(10);
    releases.forEach((release, index) => {
      expect(within(release).getByRole("heading", { name: versions[index] })).toBeInTheDocument();
    });
    expect(releases[0].querySelectorAll("p")).toHaveLength(firstReleaseChanges.length);
    expect(within(whatsNew).queryByRole("heading", { name: versions[10] })).not.toBeInTheDocument();
  });
});
