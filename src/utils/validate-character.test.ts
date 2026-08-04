import { describe, expect, it } from "vitest";
import { MAX_CHARACTER_NAME_LENGTH } from "../constants/character.ts";
import { Classes } from "../types/characters.ts";
import { parseCharacterForm } from "./validate-character.ts";
import { createTestCharacter } from "../test/fixtures.ts";

describe("parseCharacterForm", () => {
  it("rejects missing name or class", () => {
    expect(
      parseCharacterForm(
        {
          name: "",
          characterClass: "",
          mainSpec: "",
          mainGearScoreText: "",
          offSpec: "",
          offGearScoreText: "",
        },
        [],
      ),
    ).toEqual({
      ok: false,
      error: "Enter a name and choose a class.",
    });
  });

  it("rejects names over max length", () => {
    const longName = "a".repeat(MAX_CHARACTER_NAME_LENGTH + 1);
    expect(
      parseCharacterForm(
        {
          name: longName,
          characterClass: Classes[0],
          mainSpec: "",
          mainGearScoreText: "",
          offSpec: "",
          offGearScoreText: "",
        },
        [],
      ),
    ).toEqual({
      ok: false,
      error: `Character name must be at most ${MAX_CHARACTER_NAME_LENGTH} characters.`,
    });
  });

  it("rejects names with digits or symbols on create", () => {
    for (const name of ["Elst1", "Elst!", "Elst_x", "El st"]) {
      expect(
        parseCharacterForm(
          {
            name,
            characterClass: Classes[0],
            mainSpec: "",
            mainGearScoreText: "",
            offSpec: "",
            offGearScoreText: "",
          },
          [],
        ),
      ).toEqual({
        ok: false,
        error:
          "Character name may only contain letters (no numbers or symbols).",
      });
    }
  });

  it("accepts Cyrillic letters on create", () => {
    const result = parseCharacterForm(
      {
        name: "элст",
        characterClass: Classes[0],
        mainSpec: "",
        mainGearScoreText: "",
        offSpec: "",
        offGearScoreText: "",
      },
      [],
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.name).toBe("Элст");
    }
  });

  it("capitalizes the first letter on create", () => {
    const result = parseCharacterForm(
      {
        name: "qwe",
        characterClass: Classes[0],
        mainSpec: "",
        mainGearScoreText: "",
        offSpec: "",
        offGearScoreText: "",
      },
      [],
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.name).toBe("Qwe");
    }
  });

  it("rejects duplicate name and class case-insensitively", () => {
    const existing = createTestCharacter({
      name: "Alpha",
      class: Classes[1],
    });
    expect(
      parseCharacterForm(
        {
          name: "  alpha  ",
          characterClass: Classes[1],
          mainSpec: "",
          mainGearScoreText: "",
          offSpec: "",
          offGearScoreText: "",
        },
        [existing],
      ),
    ).toEqual({
      ok: false,
      error: "A character with this name and class already exists.",
    });
  });

  it("accepts valid input with spec + gear score pairs", () => {
    const result = parseCharacterForm(
      {
        name: "  Beta  ",
        characterClass: Classes[0],
        mainSpec: "Blood",
        mainGearScoreText: "5800",
        offSpec: "Frost",
        offGearScoreText: "5200",
      },
      [],
    );
    expect(result).toEqual({
      ok: true,
      name: "Beta",
      characterClass: Classes[0],
      mainSpec: { spec: "Blood", gearScore: 5800 },
      offSpec: { spec: "Frost", gearScore: 5200 },
    });
  });

  it("rejects gear score without a spec", () => {
    const result = parseCharacterForm(
      {
        name: "Beta",
        characterClass: Classes[0],
        mainSpec: "",
        mainGearScoreText: "5800",
        offSpec: "",
        offGearScoreText: "",
      },
      [],
    );
    expect(result).toEqual({
      ok: false,
      error:
        "Choose a main spec specialization to attach a gear score or imported gear.",
    });
  });

  it("attaches imported gear items to the matching spec", () => {
    const gearItems = [{ id: 50733, slot: 0 }];
    const result = parseCharacterForm(
      {
        name: "Beta",
        characterClass: Classes[0],
        mainSpec: "Blood",
        mainGearScoreText: "",
        offSpec: "",
        offGearScoreText: "",
        mainGearItems: gearItems,
      },
      [],
    );
    expect(result).toEqual({
      ok: true,
      name: "Beta",
      characterClass: Classes[0],
      mainSpec: { spec: "Blood", gearItems },
      offSpec: undefined,
    });
  });

  it("rejects imported gear without a spec", () => {
    const result = parseCharacterForm(
      {
        name: "Beta",
        characterClass: Classes[0],
        mainSpec: "",
        mainGearScoreText: "",
        offSpec: "",
        offGearScoreText: "",
        mainGearItems: [{ id: 50733, slot: 0 }],
      },
      [],
    );
    expect(result).toEqual({
      ok: false,
      error:
        "Choose a main spec specialization to attach a gear score or imported gear.",
    });
  });

  it("rejects matching main and off spec", () => {
    const result = parseCharacterForm(
      {
        name: "Beta",
        characterClass: Classes[0],
        mainSpec: "Blood",
        mainGearScoreText: "",
        offSpec: "Blood",
        offGearScoreText: "",
      },
      [],
    );
    expect(result).toEqual({
      ok: false,
      error: "Main and off specialization must be different.",
    });
  });
});
