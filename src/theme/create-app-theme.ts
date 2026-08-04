import { alpha, createTheme, type PaletteMode } from "@mui/material/styles";
import { getTooltipSurface } from "./tooltip-surface.ts";

/** Super ★ body stack — Cyrillic + Latin. */
const fontFamilyBody = ["'Noto Sans'", "system-ui", "sans-serif"].join(",");

/** Super ★ display stack — brand / titles. */
export const fontFamilyDisplay = [
  "'Onest'",
  "'Noto Sans'",
  "system-ui",
  "sans-serif",
].join(",");

/** Super ★ mono stack — chips / meta. */
export const fontFamilyMono = [
  "'JetBrains Mono'",
  "'IBM Plex Mono'",
  "monospace",
].join(",");

/** Super ★ mode tokens (shared with CSS vars in index.css). */
export const superThemeTokens = {
  light: {
    bg: "#fcfbf9",
    surface: "#ffffff",
    chipBg: "#f3f2ef",
    headerBg: "rgba(252, 251, 249, 0.96)",
    border: "#8a8a8a",
    text: "#141414",
    textStrong: "#0a0a0a",
    textMuted: "#555555",
    brand: "#9a3412",
    brandSoft: "#fff7ed",
    brandBorder: "#c2410c",
    ok: "#166534",
    okBg: "#ecfdf5",
    danger: "#dc2626",
    dangerBg: "#fef2f2",
    link: "#2c5282",
    linkSpot: "#9a3412",
    primaryBg: "#0a0a0a",
    primaryFg: "#ffffff",
    shadow: "0 6px 18px rgba(0, 0, 0, 0.07)",
    inputHoverBorder: "#6b6b6b",
    themeColorMeta: "#fcfbf9",
  },
  dark: {
    bg: "#1a1a1a",
    surface: "#242424",
    chipBg: "#1f1f1f",
    headerBg: "rgba(26, 26, 26, 0.96)",
    border: "#8a8a8a",
    text: "#f2f2f2",
    textStrong: "#fafafa",
    textMuted: "#a3a3a3",
    brand: "#fb923c",
    brandSoft: "#3d2818",
    brandBorder: "#fb923c",
    ok: "#86efac",
    okBg: "rgba(134, 239, 172, 0.12)",
    danger: "#ff7b72",
    dangerBg: "rgba(255, 123, 114, 0.14)",
    link: "#8ab4c8",
    linkSpot: "#fb923c",
    primaryBg: "#fafafa",
    primaryFg: "#111111",
    shadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
    inputHoverBorder: "#a3a3a3",
    themeColorMeta: "#1a1a1a",
  },
} as const;

export function createAppTheme(mode: PaletteMode) {
  const isLight = mode === "light";
  const tokens = superThemeTokens[mode];

  return createTheme({
    palette: {
      mode,
      ...(isLight
        ? {
            // Primary CTAs = inverse ink (never brand orange).
            primary: {
              main: tokens.primaryBg,
              light: "#333333",
              dark: "#000000",
              contrastText: tokens.primaryFg,
            },
            // Secondary = brand identity (spotlight / template CTAs).
            secondary: {
              main: tokens.brand,
              light: tokens.brandBorder,
              dark: "#7c2d12",
              contrastText: "#ffffff",
            },
            success: {
              main: tokens.ok,
              light: "#22c55e",
              dark: "#14532d",
              contrastText: "#ffffff",
            },
            error: {
              main: tokens.danger,
              light: "#f87171",
              dark: "#b91c1c",
              contrastText: "#ffffff",
            },
            // Domain: ilvl upgrade hints (keep distinct from brand / ok / danger).
            info: {
              main: "#0284c7",
              light: "#38bdf8",
              dark: "#0369a1",
            },
            // Domain: missing BiS hints (amber ≠ brand orange).
            warning: {
              main: "#d97706",
              light: "#fbbf24",
              dark: "#b45309",
            },
            background: {
              default: tokens.bg,
              paper: tokens.surface,
            },
            divider: tokens.border,
            text: {
              primary: tokens.text,
              secondary: tokens.textMuted,
            },
            action: {
              hover: alpha(tokens.text, 0.04),
              selected: alpha(tokens.brand, 0.1),
            },
          }
        : {
            primary: {
              main: tokens.primaryBg,
              light: "#ffffff",
              dark: "#e5e5e5",
              contrastText: tokens.primaryFg,
            },
            secondary: {
              main: tokens.brand,
              light: "#fdba74",
              dark: "#ea580c",
              contrastText: "#111111",
            },
            success: {
              main: tokens.ok,
              light: "#bbf7d0",
              dark: "#4ade80",
              contrastText: "#111111",
            },
            error: {
              main: tokens.danger,
              light: "#fecaca",
              dark: "#f87171",
              contrastText: "#111111",
            },
            info: {
              main: "#38bdf8",
              light: "#7dd3fc",
              dark: "#0284c7",
            },
            warning: {
              main: "#f59e0b",
              light: "#fbbf24",
              dark: "#d97706",
            },
            background: {
              default: tokens.bg,
              paper: tokens.surface,
            },
            divider: tokens.border,
            text: {
              primary: tokens.text,
              secondary: tokens.textMuted,
            },
            action: {
              hover: alpha(tokens.text, 0.06),
              selected: alpha(tokens.brand, 0.18),
            },
          }),
    },
    typography: {
      fontFamily: fontFamilyBody,
      button: {
        textTransform: "none",
        fontWeight: 600,
        letterSpacing: 0,
      },
      h6: {
        fontFamily: fontFamilyDisplay,
        fontWeight: 700,
        letterSpacing: "-0.02em",
      },
      subtitle1: {
        fontFamily: fontFamilyDisplay,
        fontWeight: 600,
        letterSpacing: "-0.01em",
      },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            // Warm paper atmosphere — brand soft tint, not SaaS blue/teal.
            backgroundImage: isLight
              ? "radial-gradient(1200px 600px at 10% -10%, rgba(154, 52, 18, 0.06), transparent 55%), radial-gradient(900px 500px at 100% 0%, rgba(194, 65, 12, 0.04), transparent 50%)"
              : "radial-gradient(1000px 520px at 8% -12%, rgba(251, 146, 60, 0.1), transparent 55%), radial-gradient(800px 480px at 100% 0%, rgba(61, 40, 24, 0.45), transparent 50%)",
            backgroundAttachment: "fixed",
            lineHeight: 1.55,
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 8,
            paddingInline: 12,
          },
          sizeSmall: {
            paddingBlock: 4,
            paddingInline: 10,
          },
          outlined: ({ theme }) => ({
            borderColor: theme.palette.divider,
            backgroundColor: alpha(theme.palette.background.paper, isLight ? 0.7 : 0.4),
            "&:hover": {
              borderColor: tokens.inputHoverBorder,
              backgroundColor: theme.palette.action.hover,
            },
          }),
        },
        variants: [
          {
            props: { variant: "contained", color: "primary" },
            style: {
              backgroundColor: tokens.primaryBg,
              color: tokens.primaryFg,
              border: `1px solid ${tokens.primaryBg}`,
              "&:hover": {
                backgroundColor: isLight ? "#262626" : "#e5e5e5",
                borderColor: isLight ? "#262626" : "#e5e5e5",
              },
            },
          },
          {
            props: { variant: "contained", color: "inherit" },
            style: ({ theme }) => ({
              backgroundColor: isLight
                ? alpha(theme.palette.common.black, 0.06)
                : alpha(theme.palette.common.white, 0.1),
              color: theme.palette.text.primary,
              "&:hover": {
                backgroundColor: isLight
                  ? alpha(theme.palette.common.black, 0.1)
                  : alpha(theme.palette.common.white, 0.16),
              },
            }),
          },
        ],
      },
      MuiIconButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 8,
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
          outlined: ({ theme }) => ({
            borderColor: theme.palette.divider,
            boxShadow: tokens.shadow,
          }),
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
          outlined: ({ theme }) => ({
            backgroundColor: alpha(theme.palette.background.paper, isLight ? 0.85 : 0.55),
          }),
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: theme.shape.borderRadius,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            boxShadow: tokens.shadow,
          }),
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: ({ theme }) => ({
            backgroundColor: alpha(
              theme.palette.background.paper,
              isLight ? 0.92 : 0.88,
            ),
            backdropFilter: "blur(8px)",
            borderBottomColor: theme.palette.divider,
            fontWeight: 600,
          }),
          body: ({ theme }) => ({
            borderBottomColor: alpha(theme.palette.divider, 0.7),
          }),
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: ({ theme }) => ({
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
            "&:last-of-type .MuiTableCell-body": {
              borderBottom: 0,
            },
          }),
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: ({ theme }) => ({
            borderRadius: 12,
            border: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: ({ theme }) => {
            const surface = getTooltipSurface(theme.palette.mode);
            return {
              bgcolor: surface.bgcolor,
              color: surface.color,
              border: `1px solid ${surface.borderColor}`,
              boxShadow: theme.shadows[theme.palette.mode === "light" ? 8 : 12],
              borderRadius: 8,
            };
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: ({ theme }) =>
            theme.palette.mode === "dark"
              ? {
                  color: tokens.textMuted,
                  "& + .MuiSwitch-track": {
                    backgroundColor: tokens.chipBg,
                    opacity: 1,
                  },
                  "&.Mui-checked": {
                    color: tokens.primaryFg,
                    "& + .MuiSwitch-track": {
                      backgroundColor: theme.palette.primary.main,
                      opacity: 1,
                    },
                  },
                }
              : {},
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: alpha(theme.palette.background.paper, isLight ? 0.8 : 0.35),
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: tokens.inputHoverBorder,
            },
          }),
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: ({ theme }) => ({
            borderRadius: 10,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: isLight
              ? "0 8px 24px rgba(0, 0, 0, 0.12)"
              : "0 8px 24px rgba(0, 0, 0, 0.45)",
          }),
        },
      },
    },
  });
}
