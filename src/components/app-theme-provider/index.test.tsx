import { useTheme } from "@mui/material/styles";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ItemTooltipLocaleProvider } from "../../contexts/item-tooltip-locale-provider.tsx";
import {
  COLOR_MODE_STORAGE_KEY,
  LEGACY_COLOR_MODE_STORAGE_KEY,
  type ColorMode,
} from "../../hooks/color-mode.ts";
import { useColorMode } from "../../hooks/use-color-mode.ts";
import { appThemeTokens } from "../../theme/create-app-theme.ts";
import { ThemeModeToggle } from "../theme-mode-toggle/index.tsx";
import { AppThemeProvider } from "./index.tsx";

vi.hoisted(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  });
});

function setSystemMode(mode: ColorMode) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query === "(prefers-color-scheme: dark)" && mode === "dark",
    media: query,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

function ThemeState() {
  const { mode } = useColorMode();
  const theme = useTheme();

  return (
    <output
      data-testid="theme-state"
      data-mode={mode}
      data-palette-mode={theme.palette.mode}
      data-background={theme.palette.background.default}
      data-primary={theme.palette.primary.main}
    />
  );
}

function renderTheme() {
  return render(
    <AppThemeProvider>
      <ItemTooltipLocaleProvider initialLocale="en">
        <ThemeModeToggle />
        <ThemeState />
      </ItemTooltipLocaleProvider>
    </AppThemeProvider>,
  );
}

describe("AppThemeProvider", () => {
  let themeColorMeta: HTMLMetaElement;

  beforeEach(() => {
    localStorage.clear();
    setSystemMode("light");
    themeColorMeta = document.createElement("meta");
    themeColorMeta.name = "theme-color";
    document.head.append(themeColorMeta);
  });

  afterEach(() => {
    themeColorMeta.remove();
    document.documentElement.removeAttribute("data-color-mode");
    vi.unstubAllGlobals();
  });

  function expectMode(mode: ColorMode) {
    const state = screen.getByTestId("theme-state");
    expect(state).toHaveAttribute("data-mode", mode);
    expect(state).toHaveAttribute("data-palette-mode", mode);
    expect(state).toHaveAttribute("data-background", appThemeTokens[mode].bg);
    expect(state).toHaveAttribute("data-primary", appThemeTokens[mode].primaryBg);
    expect(document.documentElement).toHaveAttribute("data-color-mode", mode);
    expect(themeColorMeta).toHaveAttribute("content", appThemeTokens[mode].themeColorMeta);
    expect(localStorage.getItem(COLOR_MODE_STORAGE_KEY)).toBe(mode);
  }

  it.each(["light", "dark"] as const)("loads the saved %s mode before the system preference", (mode) => {
    setSystemMode(mode === "light" ? "dark" : "light");
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode);

    renderTheme();

    expectMode(mode);
  });

  it.each(["light", "dark"] as const)("uses the system %s mode without a saved preference", (mode) => {
    setSystemMode(mode);

    renderTheme();

    expectMode(mode);
  });

  it("toggles the theme, DOM, meta tag, and stored preference together", async () => {
    const user = userEvent.setup();
    renderTheme();
    expectMode("light");

    await user.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    expectMode("dark");

    await user.click(screen.getByRole("button", { name: "Switch to light mode" }));
    expectMode("light");
  });

  it("restores a toggled mode after the provider remounts", async () => {
    const user = userEvent.setup();
    const view = renderTheme();
    await user.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    expectMode("dark");

    view.unmount();
    renderTheme();

    expectMode("dark");
  });

  it("migrates a saved mode from the legacy storage key", () => {
    localStorage.setItem(LEGACY_COLOR_MODE_STORAGE_KEY, "dark");

    renderTheme();

    expectMode("dark");
    expect(localStorage.getItem(LEGACY_COLOR_MODE_STORAGE_KEY)).toBeNull();
  });
});
