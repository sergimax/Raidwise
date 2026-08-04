import { describe, expect, it } from "vitest";
import { ClassName, Classes } from "../types/characters.ts";
import {
  CLASS_CHIP_BG_BRIGHTNESS,
  CLASS_CHIP_FG_ON_DARK_BG,
  CLASS_CHIP_FG_ON_LIGHT_BG,
  accessibleForegroundForClassColor,
  characterNameDisplaySx,
  classColorChipSx,
  darkenClassColorHex,
  formatCharacterDisplayName,
  formatClassColorHex,
} from "./character-display.ts";

function classByName(name: ClassName) {
  const found = Classes.find((entry) => entry.name === name);
  if (!found) {
    throw new Error(`Missing class ${name}`);
  }
  return found;
}

describe("formatCharacterDisplayName", () => {
  it("capitalizes the first letter", () => {
    expect(formatCharacterDisplayName("qwe")).toBe("Qwe");
    expect(formatCharacterDisplayName("элст")).toBe("Элст");
    expect(formatCharacterDisplayName("Elst")).toBe("Elst");
  });
});

describe("formatClassColorHex", () => {
  it("prefixes a hash when missing", () => {
    expect(formatClassColorHex("FFFFFF")).toBe("#FFFFFF");
  });

  it("keeps an existing hash", () => {
    expect(formatClassColorHex("#FFFFFF")).toBe("#FFFFFF");
  });
});

describe("accessibleForegroundForClassColor", () => {
  it("uses dark ink on bright class fills", () => {
    expect(accessibleForegroundForClassColor("FFFFFF")).toBe(
      CLASS_CHIP_FG_ON_LIGHT_BG,
    );
    expect(accessibleForegroundForClassColor("FFF468")).toBe(
      CLASS_CHIP_FG_ON_LIGHT_BG,
    );
  });

  it("uses light ink on dark class fills", () => {
    expect(accessibleForegroundForClassColor("C41E3A")).toBe(
      CLASS_CHIP_FG_ON_DARK_BG,
    );
    expect(accessibleForegroundForClassColor("0070DD")).toBe(
      CLASS_CHIP_FG_ON_DARK_BG,
    );
  });
});

describe("darkenClassColorHex", () => {
  it("scales RGB toward black by the chip brightness factor", () => {
    expect(darkenClassColorHex("FFFFFF")).toBe(
      darkenClassColorHex("FFFFFF", CLASS_CHIP_BG_BRIGHTNESS),
    );
    expect(darkenClassColorHex("FFFFFF", 0.5)).toBe("808080");
    expect(darkenClassColorHex("C41E3A", 1)).toBe("c41e3a");
  });
});

describe("characterNameDisplaySx", () => {
  it("uses a slightly darkened class color as background", () => {
    const priest = classColorChipSx(classByName(ClassName.Priest));
    expect(priest.bgcolor).toBe(
      formatClassColorHex(darkenClassColorHex("FFFFFF")),
    );
    expect(priest.color).toBe(CLASS_CHIP_FG_ON_LIGHT_BG);

    const deathKnight = classColorChipSx(classByName(ClassName.DeathKnight));
    expect(deathKnight.bgcolor).toBe(
      formatClassColorHex(darkenClassColorHex("C41E3A")),
    );
    expect(deathKnight.color).toBe(CLASS_CHIP_FG_ON_DARK_BG);

    expect(characterNameDisplaySx(classByName(ClassName.Priest))).toEqual(
      priest,
    );
    expect(characterNameDisplaySx(classByName(ClassName.DeathKnight))).toEqual(
      deathKnight,
    );
  });

  it("returns weight-only styles when class is missing", () => {
    expect(characterNameDisplaySx(undefined)).toEqual({
      fontWeight: 600,
    });
  });
});
