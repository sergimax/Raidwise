import { describe, expect, it } from "vitest";
import { ClassName, Classes } from "../types/characters.ts";
import {
  CLASS_CHIP_FG_ON_DARK_BG,
  CLASS_CHIP_FG_ON_LIGHT_BG,
  accessibleForegroundForClassColor,
  characterNameDisplaySx,
  formatClassColorHex,
} from "./character-display.ts";

function classByName(name: ClassName) {
  const found = Classes.find((entry) => entry.name === name);
  if (!found) {
    throw new Error(`Missing class ${name}`);
  }
  return found;
}

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

describe("characterNameDisplaySx", () => {
  it("uses class color as background and accessible foreground", () => {
    const priest = characterNameDisplaySx(classByName(ClassName.Priest), "light");
    expect(priest.bgcolor).toBe("#FFFFFF");
    expect(priest.color).toBe(CLASS_CHIP_FG_ON_LIGHT_BG);

    const deathKnight = characterNameDisplaySx(
      classByName(ClassName.DeathKnight),
      "dark",
    );
    expect(deathKnight.bgcolor).toBe("#C41E3A");
    expect(deathKnight.color).toBe(CLASS_CHIP_FG_ON_DARK_BG);
  });

  it("returns weight-only styles when class is missing", () => {
    expect(characterNameDisplaySx(undefined, "light")).toEqual({
      fontWeight: 600,
    });
  });
});
