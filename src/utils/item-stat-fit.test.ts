import { describe, expect, it } from "vitest";
import { ClassName } from "../types/characters.ts";
import { isItemStatUsableForSpec } from "./item-stat-fit.ts";

describe("isItemStatUsableForSpec", () => {
  it("allows neutral stamina-only gear", () => {
    expect(
      isItemStatUsableForSpec(40767, {
        className: ClassName.Shaman,
        spec: "Enhancement",
      }),
    ).toBe(true);
  });

  it("allows Agi+AP cross-armor BiS for Retribution Paladin via AP weighting", () => {
    expect(
      isItemStatUsableForSpec(50653, {
        className: ClassName.Paladin,
        spec: "Retribution",
      }),
    ).toBe(true);
  });

  it("allows Agi+AP cross-armor BiS for Fury Warrior via AP weighting", () => {
    expect(
      isItemStatUsableForSpec(54580, {
        className: ClassName.Warrior,
        spec: "Fury",
      }),
    ).toBe(true);
  });

  it("allows caster mail for Enhancement Shaman (Agi or spellhance Int builds)", () => {
    expect(
      isItemStatUsableForSpec(40995, {
        className: ClassName.Shaman,
        spec: "Enhancement",
      }),
    ).toBe(true);
  });

  it("allows the same caster mail for Elemental Shaman", () => {
    expect(
      isItemStatUsableForSpec(40995, {
        className: ClassName.Shaman,
        spec: "Elemental",
      }),
    ).toBe(true);
  });

  it("rejects intellect plate for Fury Warrior", () => {
    expect(
      isItemStatUsableForSpec(37182, {
        className: ClassName.Warrior,
        spec: "Fury",
      }),
    ).toBe(false);
  });

  it("allows strength plate for Fury Warrior", () => {
    expect(
      isItemStatUsableForSpec(51225, {
        className: ClassName.Warrior,
        spec: "Fury",
      }),
    ).toBe(true);
  });

  it("passes through when class or spec is missing", () => {
    expect(isItemStatUsableForSpec(40995, {})).toBe(true);
  });

  it("rejects +spirit loot for Elemental Shaman", () => {
    expect(
      isItemStatUsableForSpec(46976, {
        className: ClassName.Shaman,
        spec: "Elemental",
      }),
    ).toBe(false);
  });

  it("rejects +spirit loot for Restoration Shaman", () => {
    expect(
      isItemStatUsableForSpec(46976, {
        className: ClassName.Shaman,
        spec: "Restoration",
      }),
    ).toBe(false);
  });

  it("rejects agility hunter helm for Elemental Shaman", () => {
    expect(
      isItemStatUsableForSpec(47718, {
        className: ClassName.Shaman,
        spec: "Elemental",
      }),
    ).toBe(false);
  });

  it("rejects agility hunter helm for Restoration Shaman", () => {
    expect(
      isItemStatUsableForSpec(47718, {
        className: ClassName.Shaman,
        spec: "Restoration",
      }),
    ).toBe(false);
  });

  it("allows agility mail for Enhancement Shaman", () => {
    expect(
      isItemStatUsableForSpec(51197, {
        className: ClassName.Shaman,
        spec: "Enhancement",
      }),
    ).toBe(true);
  });

  it("allows spirit-free resto shaman BiS cloak", () => {
    expect(
      isItemStatUsableForSpec(54583, {
        className: ClassName.Shaman,
        spec: "Restoration",
      }),
    ).toBe(true);
  });

  it("rejects off-hand weapons for Restoration Shaman ilvl filtering", () => {
    expect(
      isItemStatUsableForSpec(
        47053,
        { className: ClassName.Shaman, spec: "Restoration" },
        15,
      ),
    ).toBe(false);
  });

  it("allows resto shaman shield off-hand", () => {
    expect(
      isItemStatUsableForSpec(
        50616,
        { className: ClassName.Shaman, spec: "Restoration" },
        15,
      ),
    ).toBe(true);
  });

  it("rejects +hit loot for Restoration Druid", () => {
    expect(
      isItemStatUsableForSpec(46979, {
        className: ClassName.Druid,
        spec: "Restoration",
      }),
    ).toBe(false);
  });

  it("rejects +hit loot for Holy Priest", () => {
    expect(
      isItemStatUsableForSpec(46979, {
        className: ClassName.Priest,
        spec: "Holy",
      }),
    ).toBe(false);
  });

  it("still allows +hit loot for DPS specs", () => {
    expect(
      isItemStatUsableForSpec(50736, {
        className: ClassName.Rogue,
        spec: "Assassination",
      }),
    ).toBe(true);
  });

  it("rejects Ruby Sanctum DPS loot without avoidance for Protection Warrior", () => {
    const protectionWarrior = {
      className: ClassName.Warrior,
      spec: "Protection",
    } as const;

    expect(isItemStatUsableForSpec(53132, protectionWarrior)).toBe(false);
    expect(isItemStatUsableForSpec(53133, protectionWarrior)).toBe(false);
    expect(isItemStatUsableForSpec(53112, protectionWarrior)).toBe(false);
    expect(isItemStatUsableForSpec(53110, protectionWarrior)).toBe(false);
    expect(isItemStatUsableForSpec(53103, protectionWarrior)).toBe(false);
    expect(isItemStatUsableForSpec(53113, protectionWarrior)).toBe(false);
  });

  it("allows tank loot with defense or dodge for Protection Warrior", () => {
    expect(
      isItemStatUsableForSpec(53111, {
        className: ClassName.Warrior,
        spec: "Protection",
      }),
    ).toBe(true);
    expect(
      isItemStatUsableForSpec(50611, {
        className: ClassName.Warrior,
        spec: "Protection",
      }),
    ).toBe(true);
  });

  it("rejects stat-less trinkets for Protection Paladin ilvl filtering", () => {
    expect(
      isItemStatUsableForSpec(
        40431,
        { className: ClassName.Paladin, spec: "Protection" },
        12,
      ),
    ).toBe(false);
  });

  it("rejects tank necks and avoidance gear for Retribution Paladin", () => {
    const retributionPaladin = {
      className: ClassName.Paladin,
      spec: "Retribution",
    } as const;

    expect(isItemStatUsableForSpec(50627, retributionPaladin, 1)).toBe(false);
    expect(isItemStatUsableForSpec(50611, retributionPaladin, 5)).toBe(false);
  });

  it("rejects stamina-only and caster proc trinkets for Retribution Paladin", () => {
    const retributionPaladin = {
      className: ClassName.Paladin,
      spec: "Retribution",
    } as const;

    expect(
      isItemStatUsableForSpec(47088, retributionPaladin, 12),
    ).toBe(false);
    expect(
      isItemStatUsableForSpec(50340, retributionPaladin, 12),
    ).toBe(false);
    expect(
      isItemStatUsableForSpec(50348, retributionPaladin, 13),
    ).toBe(false);
    expect(
      isItemStatUsableForSpec(54588, retributionPaladin, 12),
    ).toBe(false);
  });

  it("still allows hit-based physical trinkets for Retribution Paladin", () => {
    expect(
      isItemStatUsableForSpec(
        50351,
        { className: ClassName.Paladin, spec: "Retribution" },
        12,
      ),
    ).toBe(true);
  });

  it("still allows haste trinkets for Enhancement Shaman hybrid gear", () => {
    expect(
      isItemStatUsableForSpec(
        54588,
        { className: ClassName.Shaman, spec: "Enhancement" },
        12,
      ),
    ).toBe(true);
    expect(
      isItemStatUsableForSpec(
        50360,
        { className: ClassName.Shaman, spec: "Enhancement" },
        12,
      ),
    ).toBe(true);
  });

  it("rejects mismatched trinkets and strength loot for Feral Druid cat", () => {
    const feralCat = { className: ClassName.Druid, spec: "Feral" } as const;

    expect(isItemStatUsableForSpec(54588, feralCat, 12)).toBe(false);
    expect(isItemStatUsableForSpec(54591, feralCat, 12)).toBe(false);
    expect(isItemStatUsableForSpec(50360, feralCat, 12)).toBe(false);
    expect(isItemStatUsableForSpec(53110, feralCat, 14)).toBe(false);
  });

  it("still allows agility feral cat trinkets and weapons", () => {
    expect(
      isItemStatUsableForSpec(
        50363,
        { className: ClassName.Druid, spec: "Feral" },
        12,
      ),
    ).toBe(true);
    expect(
      isItemStatUsableForSpec(
        54590,
        { className: ClassName.Druid, spec: "Feral" },
        13,
      ),
    ).toBe(true);
  });

  it("rejects damage, tank, and melee proc trinkets for Restoration Druid", () => {
    const restorationDruid = {
      className: ClassName.Druid,
      spec: "Restoration",
    } as const;

    expect(
      isItemStatUsableForSpec(54588, restorationDruid, 12),
    ).toBe(false);
    expect(
      isItemStatUsableForSpec(50348, restorationDruid, 13),
    ).toBe(false);
    expect(
      isItemStatUsableForSpec(50342, restorationDruid, 12),
    ).toBe(false);
    expect(
      isItemStatUsableForSpec(47946, restorationDruid, 12),
    ).toBe(false);
    expect(
      isItemStatUsableForSpec(45158, restorationDruid, 12),
    ).toBe(false);
    expect(
      isItemStatUsableForSpec(40431, restorationDruid, 12),
    ).toBe(false);
    expect(
      isItemStatUsableForSpec(40257, restorationDruid, 12),
    ).toBe(false);
    // Reign of the Unliving / Dead — SP stick + damage proc, not a healer trinket.
    expect(isItemStatUsableForSpec(47182, restorationDruid, 12)).toBe(false);
    expect(isItemStatUsableForSpec(47188, restorationDruid, 13)).toBe(false);
    expect(isItemStatUsableForSpec(47316, restorationDruid, 12)).toBe(false);
    expect(isItemStatUsableForSpec(47477, restorationDruid, 13)).toBe(false);
  });

  it("rejects Reign of the Unliving / Dead for other healer specs", () => {
    const healers = [
      { className: ClassName.Priest, spec: "Holy" },
      { className: ClassName.Priest, spec: "Discipline" },
      { className: ClassName.Shaman, spec: "Restoration" },
      { className: ClassName.Paladin, spec: "Holy" },
    ] as const;

    for (const healer of healers) {
      expect(isItemStatUsableForSpec(47182, healer, 12)).toBe(false);
      expect(isItemStatUsableForSpec(47477, healer, 13)).toBe(false);
    }
  });

  it("still allows Reign of the Unliving for Shadow Priest", () => {
    const shadowPriest = {
      className: ClassName.Priest,
      spec: "Shadow",
    } as const;

    expect(isItemStatUsableForSpec(47182, shadowPriest, 12)).toBe(true);
    expect(isItemStatUsableForSpec(47188, shadowPriest, 13)).toBe(true);
  });

  it("still allows spell power healer trinkets for Restoration Druid", () => {
    expect(
      isItemStatUsableForSpec(
        54589,
        { className: ClassName.Druid, spec: "Restoration" },
        12,
      ),
    ).toBe(true);
    expect(
      isItemStatUsableForSpec(
        50366,
        { className: ClassName.Druid, spec: "Restoration" },
        13,
      ),
    ).toBe(true);
    expect(
      isItemStatUsableForSpec(
        47271,
        { className: ClassName.Druid, spec: "Restoration" },
        12,
      ),
    ).toBe(true);
  });

  it("rejects Solace healer proc trinkets for Shadow Priest", () => {
    const shadowPriest = {
      className: ClassName.Priest,
      spec: "Shadow",
    } as const;

    expect(isItemStatUsableForSpec(47271, shadowPriest, 12)).toBe(false);
    expect(isItemStatUsableForSpec(47041, shadowPriest, 13)).toBe(false);
    expect(isItemStatUsableForSpec(47432, shadowPriest, 12)).toBe(false);
  });

  it("rejects Tiny Abomination melee proc trinkets for Demonology Warlock", () => {
    const demonologyWarlock = {
      className: ClassName.Warlock,
      spec: "Demonology",
    } as const;

    expect(isItemStatUsableForSpec(50351, demonologyWarlock, 12)).toBe(false);
    expect(isItemStatUsableForSpec(50706, demonologyWarlock, 13)).toBe(false);
  });

  it("restricts role-exclusive proc trinkets to the intended spec roles", () => {
    const protectionPaladin = {
      className: ClassName.Paladin,
      spec: "Protection",
    } as const;
    const retributionPaladin = {
      className: ClassName.Paladin,
      spec: "Retribution",
    } as const;
    const holyPriest = {
      className: ClassName.Priest,
      spec: "Holy",
    } as const;
    const shadowPriest = {
      className: ClassName.Priest,
      spec: "Shadow",
    } as const;
    const marksmanshipHunter = {
      className: ClassName.Hunter,
      spec: "Marksmanship",
    } as const;

    expect(isItemStatUsableForSpec(50341, protectionPaladin, 12)).toBe(true);
    expect(isItemStatUsableForSpec(50344, protectionPaladin, 13)).toBe(true);
    expect(isItemStatUsableForSpec(50341, retributionPaladin, 12)).toBe(false);
    expect(isItemStatUsableForSpec(50341, shadowPriest, 12)).toBe(false);

    expect(isItemStatUsableForSpec(54589, holyPriest, 12)).toBe(true);
    expect(isItemStatUsableForSpec(50366, holyPriest, 13)).toBe(true);
    expect(isItemStatUsableForSpec(50726, holyPriest, 12)).toBe(true);
    expect(isItemStatUsableForSpec(54589, shadowPriest, 12)).toBe(false);
    expect(isItemStatUsableForSpec(50366, shadowPriest, 13)).toBe(false);
    expect(isItemStatUsableForSpec(50726, shadowPriest, 12)).toBe(false);

    expect(isItemStatUsableForSpec(50351, retributionPaladin, 12)).toBe(true);
    expect(isItemStatUsableForSpec(50706, retributionPaladin, 13)).toBe(true);
    expect(isItemStatUsableForSpec(50351, protectionPaladin, 12)).toBe(false);
    expect(isItemStatUsableForSpec(50351, marksmanshipHunter, 12)).toBe(false);
    expect(isItemStatUsableForSpec(50351, shadowPriest, 12)).toBe(false);
  });

  it("rejects intellect mail armor for Unholy Death Knight ilvl filtering", () => {
    const unholyDeathKnight = {
      className: ClassName.DeathKnight,
      spec: "Unholy",
    } as const;

    expect(isItemStatUsableForSpec(53119, unholyDeathKnight, 4)).toBe(false);
    expect(isItemStatUsableForSpec(40995, unholyDeathKnight, 4)).toBe(false);
    expect(isItemStatUsableForSpec(51197, unholyDeathKnight, 0)).toBe(false);
  });

  it("still allows agility leather cross-armor for Unholy Death Knight", () => {
    expect(
      isItemStatUsableForSpec(
        50653,
        { className: ClassName.DeathKnight, spec: "Unholy" },
        4,
      ),
    ).toBe(true);
  });

  it("still allows intellect mail for Elemental Shaman", () => {
    expect(
      isItemStatUsableForSpec(
        40995,
        { className: ClassName.Shaman, spec: "Elemental" },
        4,
      ),
    ).toBe(true);
  });
});
