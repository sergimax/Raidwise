/**
 * React provider for light/dark mode.
 *
 * On change, syncs MUI theme (via useColorMode in AppThemeProvider), global CSS
 * (data-color-mode on <html>), theme-color meta, and localStorage.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  COLOR_MODE_STORAGE_KEY,
  ColorModeContext,
  getInitialColorMode,
  type ColorMode,
  type ColorModeContextValue,
} from "../hooks/color-mode.ts";
import { superThemeTokens } from "../theme/create-app-theme.ts";

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ColorMode>(() => getInitialColorMode());

  useEffect(() => {
    // Keep DOM/CSS/meta in sync after toggles (initial paint handled in color-mode.ts + index.html).
    document.documentElement.dataset.colorMode = mode;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", superThemeTokens[mode].themeColorMeta);
    try {
      localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  }, [mode]);

  const setMode = useCallback((nextMode: ColorMode) => {
    setModeState(nextMode);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((previous) => (previous === "light" ? "dark" : "light"));
  }, []);

  const value = useMemo<ColorModeContextValue>(
    () => ({
      mode,
      setMode,
      toggleMode,
      isDark: mode === "dark",
    }),
    [mode, setMode, toggleMode],
  );

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
}
