import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
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
});
