import type { PaletteMode } from "@mui/material";
import type { CharacterClass } from "../types/characters.ts";

/** WoW class colors are stored without a leading `#`. */
export function formatClassColorHex(color: string): string {
  return color.startsWith("#") ? color : `#${color}`;
}

function parseRgb(hexWithoutHash: string): {
  red: number;
  green: number;
  blue: number;
} {
  return {
    red: Number.parseInt(hexWithoutHash.slice(0, 2), 16),
    green: Number.parseInt(hexWithoutHash.slice(2, 4), 16),
    blue: Number.parseInt(hexWithoutHash.slice(4, 6), 16),
  };
}

/** Relative luminance (sRGB, WCAG). */
export function classColorRelativeLuminance(hexWithoutHash: string): number {
  const { red, green, blue } = parseRgb(hexWithoutHash);
  const channel = (value: number) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
  );
}

function contrastRatio(luminanceA: number, luminanceB: number): number {
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Ink tokens — readable on class-color chips (not a hue complement; those fail WCAG). */
export const CLASS_CHIP_FG_ON_LIGHT_BG = "#0a0a0a" as const;
export const CLASS_CHIP_FG_ON_DARK_BG = "#fafafa" as const;

/**
 * Accessible foreground for a class-color background: black or near-white,
 * whichever has the higher WCAG contrast ratio against the fill.
 */
export function accessibleForegroundForClassColor(
  hexWithoutHash: string,
): typeof CLASS_CHIP_FG_ON_LIGHT_BG | typeof CLASS_CHIP_FG_ON_DARK_BG {
  const backgroundLuminance = classColorRelativeLuminance(hexWithoutHash);
  const blackContrast = contrastRatio(backgroundLuminance, 0);
  const whiteContrast = contrastRatio(backgroundLuminance, 1);
  return whiteContrast >= blackContrast
    ? CLASS_CHIP_FG_ON_DARK_BG
    : CLASS_CHIP_FG_ON_LIGHT_BG;
}

/** Chip chrome: class hue as fill, accessible ink as text. */
export function classColorChipSx(characterClass: CharacterClass) {
  const background = formatClassColorHex(characterClass.color);
  const color = accessibleForegroundForClassColor(characterClass.color);
  return {
    fontWeight: 600,
    color,
    bgcolor: background,
    px: 0.55,
    py: 0.15,
    borderRadius: "4px",
    lineHeight: 1.25,
  } as const;
}

/**
 * Typography sx for a character / class name.
 * Class color is the chip background; text is accessible black/white.
 * `colorMode` kept for call-site compatibility (same treatment in both modes).
 */
export function characterNameDisplaySx(
  characterClass?: CharacterClass,
  _colorMode: PaletteMode = "light",
) {
  if (!characterClass) {
    return { fontWeight: 600 } as const;
  }
  return classColorChipSx(characterClass);
}
