import { describe, expect, it } from "vitest";
import { Classes } from "../types/characters.ts";
import { DEFAULT_EXPORT_ROLE_FILTER } from "./export-spec-role.ts";
import {
  buildClearAllExportSpecSelection,
  buildSelectAllExportSpecSelection,
  clearUnavailableExportSpecSelections,
  defaultExportSpecSelection,
  formatCharacterExportLabel,
  getCharacterExportInactiveReason,
  isCharacterIncludedInExport,
  resolveEffectiveExportSpecSelection,
  resolveExportSpecSelection,
} from "./format-character-export.ts";
import { createTestCharacter } from "../test/fixtures.ts";

const mainOnlySelection = {
  includeMain: true,
  includeOff: false,
  includeWithoutSpec: true,
};

describe("formatCharacterExportLabel", () => {
  it("returns name only when no specs are set", () => {
    expect(formatCharacterExportLabel(createTestCharacter({ name: "Elst" }))).toBe(
      "Elst",
    );
  });

  it("excludes name-only characters when includeWithoutSpec is false", () => {
    expect(
      formatCharacterExportLabel(createTestCharacter({ name: "Elst" }), {
        includeMain: false,
        includeOff: false,
        includeWithoutSpec: false,
      }),
    ).toBeNull();
  });

  it("uses short spec names and gear score without k suffix", () => {
    expect(
      formatCharacterExportLabel(
        createTestCharacter({
          name: "Elst",
          class: Classes[0],
          mainSpec: { spec: "Unholy", gearScore: 6615 },
        }),
      ),
    ).toBe("Elst Udk 6.6");
  });

  it("can omit gear scores or the whole spec segment", () => {
    const character = createTestCharacter({
      name: "Elst",
      class: Classes[0],
      mainSpec: { spec: "Unholy", gearScore: 6615 },
      offSpec: { spec: "Blood", gearScore: 6023 },
    });
    expect(
      formatCharacterExportLabel(character, mainOnlySelection, "en", {
        includeGearScore: false,
      }),
    ).toBe("Elst Udk");
    expect(
      formatCharacterExportLabel(character, mainOnlySelection, "en", {
        includeSpecs: false,
      }),
    ).toBe("Elst");
    expect(
      formatCharacterExportLabel(character, undefined, "en", {
        includeSpecs: true,
        includeGearScore: false,
      }),
    ).toBe("Elst Udk / Blood");
  });

  it("exports one or both specs based on selection", () => {
    const character = createTestCharacter({
      name: "Elst",
      class: Classes[0],
      mainSpec: { spec: "Unholy", gearScore: 6615 },
      offSpec: { spec: "Blood", gearScore: 6023 },
    });
    expect(
      formatCharacterExportLabel(character, {
        includeMain: true,
        includeOff: false,
        includeWithoutSpec: true,
      }),
    ).toBe("Elst Udk 6.6");
    expect(
      formatCharacterExportLabel(character, {
        includeMain: false,
        includeOff: true,
        includeWithoutSpec: true,
      }),
    ).toBe("Elst Blood 6");
    expect(
      formatCharacterExportLabel(character, {
        includeMain: true,
        includeOff: true,
        includeWithoutSpec: true,
      }),
    ).toBe("Elst Udk 6.6 / Blood 6");
    expect(
      formatCharacterExportLabel(character, {
        includeMain: false,
        includeOff: false,
        includeWithoutSpec: true,
      }),
    ).toBeNull();
  });

  it("defaults to off when only off spec is set", () => {
    expect(defaultExportSpecSelection({ offSpec: { spec: "Blood" } })).toEqual({
      includeMain: false,
      includeOff: true,
      includeWithoutSpec: true,
    });
    expect(
      isCharacterIncludedInExport(
        { mainSpec: undefined, offSpec: { spec: "Blood" } },
        { includeMain: false, includeOff: true, includeWithoutSpec: true },
      ),
    ).toBe(true);
  });

  it("omits gear score when not set", () => {
    expect(
      formatCharacterExportLabel(
        createTestCharacter({
          name: "Elst",
          class: Classes[0],
          mainSpec: { spec: "Unholy" },
        }),
        mainOnlySelection,
      ),
    ).toBe("Elst Udk");
  });

  it("omits specs below the minimum gear score filter", () => {
    const character = createTestCharacter({
      name: "Elst",
      class: Classes[0],
      mainSpec: { spec: "Unholy", gearScore: 6615 },
      offSpec: { spec: "Blood", gearScore: 6023 },
    });
    const allRoles = { ...DEFAULT_EXPORT_ROLE_FILTER };

    expect(
      formatCharacterExportLabel(
        character,
        resolveEffectiveExportSpecSelection(
          character,
          undefined,
          allRoles,
          6500,
        ),
      ),
    ).toBe("Elst Udk 6.6");
    expect(
      formatCharacterExportLabel(
        character,
        resolveEffectiveExportSpecSelection(
          character,
          undefined,
          allRoles,
          6700,
        ),
      ),
    ).toBeNull();
  });

  it("keeps specs without gear score when a minimum is set", () => {
    expect(
      formatCharacterExportLabel(
        createTestCharacter({
          name: "Elst",
          class: Classes[0],
          mainSpec: { spec: "Unholy" },
        }),
        resolveEffectiveExportSpecSelection(
          createTestCharacter({
            name: "Elst",
            class: Classes[0],
            mainSpec: { spec: "Unholy" },
          }),
          undefined,
          DEFAULT_EXPORT_ROLE_FILTER,
          6500,
        ),
      ),
    ).toBe("Elst Udk");
  });

  it("omits specs whose role is unchecked in the role filter", () => {
    const character = createTestCharacter({
      name: "Elst",
      class: Classes[0],
      mainSpec: { spec: "Unholy", gearScore: 6615 },
      offSpec: { spec: "Blood", gearScore: 6023 },
    });
    const tanksOnly = {
      ...DEFAULT_EXPORT_ROLE_FILTER,
      healer: false,
      meleeDps: false,
      rangedDps: false,
    };

    expect(
      formatCharacterExportLabel(
        character,
        resolveEffectiveExportSpecSelection(character, undefined, tanksOnly),
      ),
    ).toBe("Elst Blood 6");
  });
});

describe("bulk export spec selection", () => {
  it("select all matches default per-character selection", () => {
    const characters = [
      createTestCharacter({
        name: "Elst",
        class: Classes[0],
        mainSpec: { spec: "Unholy" },
        offSpec: { spec: "Blood" },
      }),
      createTestCharacter({ name: "Beta" }),
    ];
    const selection = buildSelectAllExportSpecSelection(characters);

    for (const character of characters) {
      expect(resolveExportSpecSelection(character, selection)).toEqual(
        defaultExportSpecSelection(character),
      );
    }
  });

  it("clear all disables every spec slot", () => {
    const characters = [
      createTestCharacter({
        name: "Elst",
        class: Classes[0],
        mainSpec: { spec: "Unholy" },
        offSpec: { spec: "Blood" },
      }),
      createTestCharacter({ name: "Beta" }),
    ];
    const selection = buildClearAllExportSpecSelection(characters);

    for (const character of characters) {
      expect(resolveExportSpecSelection(character, selection)).toEqual({
        includeMain: false,
        includeOff: false,
        includeWithoutSpec: false,
      });
      expect(
        isCharacterIncludedInExport(
          character,
          resolveExportSpecSelection(character, selection),
        ),
      ).toBe(false);
    }
  });

  it("select all leaves characters without visible raids unchecked", () => {
    const available = createTestCharacter({
      id: "character-1",
      name: "Elst",
      class: Classes[0],
      mainSpec: { spec: "Unholy" },
      offSpec: { spec: "Blood" },
    });
    const unavailable = createTestCharacter({ id: "character-2", name: "Beta" });

    const selection = buildSelectAllExportSpecSelection(
      [available, unavailable],
      new Set(["character-1"]),
    );

    expect(resolveExportSpecSelection(available, selection)).toEqual(
      defaultExportSpecSelection(available),
    );
    expect(resolveExportSpecSelection(unavailable, selection)).toEqual({
      includeMain: false,
      includeOff: false,
      includeWithoutSpec: false,
    });
  });

  it("clears stored selections for characters without visible raids", () => {
    const available = createTestCharacter({
      id: "character-1",
      name: "Elst",
      class: Classes[0],
      mainSpec: { spec: "Unholy" },
    });
    const unavailable = createTestCharacter({
      id: "character-2",
      name: "Beta",
      class: Classes[0],
      mainSpec: { spec: "Blood" },
    });

    const nextSelection = clearUnavailableExportSpecSelections(
      [available, unavailable],
      {
        "character-1": { includeMain: false },
        "character-2": { includeMain: true, includeWithoutSpec: true },
      },
      new Set(["character-1"]),
    );

    expect(nextSelection).toEqual({
      "character-1": { includeMain: false },
      "character-2": {
        includeMain: false,
        includeOff: false,
        includeWithoutSpec: false,
      },
    });
  });
});

describe("getCharacterExportInactiveReason", () => {
  it("returns cooldown when every visible raid has CD", () => {
    const character = createTestCharacter({
      id: "character-1",
      class: Classes[0],
      mainSpec: { spec: "Unholy" },
    });

    expect(
      getCharacterExportInactiveReason(character, new Set(), DEFAULT_EXPORT_ROLE_FILTER),
    ).toBe("cooldown");
  });

  it("returns filters when no spec passes role or GS filters", () => {
    const character = createTestCharacter({
      id: "character-1",
      class: Classes[5],
      mainSpec: { spec: "Shadow", gearScore: 5800 },
      offSpec: { spec: "Discipline", gearScore: 5500 },
    });
    const tanksOnly = {
      ...DEFAULT_EXPORT_ROLE_FILTER,
      tank: true,
      healer: false,
      meleeDps: false,
      rangedDps: false,
    };

    expect(
      getCharacterExportInactiveReason(
        character,
        new Set(["character-1"]),
        tanksOnly,
      ),
    ).toBe("filters");

    expect(
      getCharacterExportInactiveReason(
        character,
        new Set(["character-1"]),
        DEFAULT_EXPORT_ROLE_FILTER,
        6500,
      ),
    ).toBe("filters");
  });

  it("returns null when at least one spec passes filters on a visible raid", () => {
    const character = createTestCharacter({
      id: "character-1",
      class: Classes[5],
      mainSpec: { spec: "Shadow", gearScore: 5800 },
    });

    expect(
      getCharacterExportInactiveReason(
        character,
        new Set(["character-1"]),
        DEFAULT_EXPORT_ROLE_FILTER,
      ),
    ).toBeNull();
  });
});
