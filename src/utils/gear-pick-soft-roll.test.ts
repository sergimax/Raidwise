import { describe, expect, it } from "vitest";
import {
  clampAssignmentsToMaxSofts,
  clampMySofts,
  competingSoftWeight,
  formatGearPickCopyText,
  pruneSoftAssignmentsToItemIds,
  remainingSoftBudget,
  setMySoftsForItem,
  setOthersCountForWeight,
  softWeightKeys,
  sumMySofts,
  summarizeSoftCompetition,
  softCompetitionDemandColor,
  softCompetitionDemandTone,
} from "./gear-pick-soft-roll.ts";

describe("gear-pick-soft-roll", () => {
  it("lists soft weight keys up to max", () => {
    expect(softWeightKeys(3)).toEqual([1, 2, 3]);
    expect(softWeightKeys(1)).toEqual([1]);
  });

  it("enforces soft budget across items", () => {
    let byItemId = setMySoftsForItem({}, 1, 2, 3);
    byItemId = setMySoftsForItem(byItemId, 2, 2, 3);
    expect(sumMySofts(byItemId)).toBe(3);
    expect(getSofts(byItemId, 2)).toBe(1);
    expect(remainingSoftBudget(byItemId, 3, 1)).toBe(2);
    expect(clampMySofts(5, byItemId, 3, 1)).toBe(2);
  });

  it("tracks others histogram by soft weight", () => {
    let byItemId = setOthersCountForWeight({}, 10, 1, 4, 3);
    byItemId = setOthersCountForWeight(byItemId, 10, 2, 2, 3);
    byItemId = setOthersCountForWeight(byItemId, 10, 3, 2, 3);
    expect(competingSoftWeight(byItemId[10]!.othersByWeight)).toBe(1 * 4 + 2 * 2 + 3 * 2);
  });

  it("clamps assignments when max softs decreases", () => {
    const byItemId = {
      1: { mySofts: 2, othersByWeight: { 1: 1, 3: 2, 4: 1 } },
      2: { mySofts: 2, othersByWeight: {} },
    };
    const clamped = clampAssignmentsToMaxSofts(byItemId, 2);
    expect(clamped[1]?.mySofts).toBe(2);
    expect(clamped[1]?.othersByWeight).toEqual({ 1: 1 });
    expect(clamped[2]).toBeUndefined();
    expect(sumMySofts(clamped)).toBe(2);
  });

  it("prunes soft assignments to active item ids", () => {
    const byItemId = {
      10: { mySofts: 1, othersByWeight: { 2: 1 } },
      20: { mySofts: 2, othersByWeight: {} },
      30: { mySofts: 0, othersByWeight: { 1: 3 } },
    };
    const pruned = pruneSoftAssignmentsToItemIds(byItemId, new Set([10, 30]));
    expect(pruned).toEqual({
      10: { mySofts: 1, othersByWeight: { 2: 1 } },
      30: { mySofts: 0, othersByWeight: { 1: 3 } },
    });
    expect(sumMySofts(pruned)).toBe(1);
    expect(pruneSoftAssignmentsToItemIds(pruned, new Set([10, 30]))).toBe(
      pruned,
    );
  });

  it("summarizes +100 competition and dominated softs", () => {
    expect(
      summarizeSoftCompetition(
        { mySofts: 3, othersByWeight: { 2: 1, 3: 1 } },
        "plus100",
        3,
      ),
    ).toEqual({
      mySofts: 3,
      competingWeight: 5,
      competingCallers: 2,
      system: "plus100",
      maxSoftCallerCount: 1,
      mySoftsDominated: false,
      myRollCount: 4,
      othersRollCount: 7,
    });
    expect(
      summarizeSoftCompetition(
        { mySofts: 2, othersByWeight: { 3: 1 } },
        "plus100",
        3,
      ).mySoftsDominated,
    ).toBe(true);
  });

  it("summarizes re-roll rolls as default + soft extras", () => {
    expect(
      summarizeSoftCompetition(
        { mySofts: 2, othersByWeight: { 1: 2, 3: 1 } },
        "reroll",
        3,
      ),
    ).toEqual({
      mySofts: 2,
      competingWeight: 5,
      competingCallers: 3,
      system: "reroll",
      maxSoftCallerCount: 1,
      mySoftsDominated: false,
      myRollCount: 3,
      othersRollCount: 8,
    });
  });

  it("maps competition demand to UI color tones", () => {
    expect(
      softCompetitionDemandTone(
        summarizeSoftCompetition(
          { mySofts: 0, othersByWeight: {} },
          "reroll",
          3,
        ),
      ),
    ).toBe("clear");
    expect(
      softCompetitionDemandTone(
        summarizeSoftCompetition(
          { mySofts: 1, othersByWeight: { 1: 1 } },
          "reroll",
          3,
        ),
      ),
    ).toBe("low");
    expect(
      softCompetitionDemandTone(
        summarizeSoftCompetition(
          { mySofts: 0, othersByWeight: { 1: 2, 2: 1 } },
          "reroll",
          3,
        ),
      ),
    ).toBe("medium");
    expect(
      softCompetitionDemandTone(
        summarizeSoftCompetition(
          { mySofts: 0, othersByWeight: { 1: 4, 2: 1, 3: 1 } },
          "reroll",
          3,
        ),
      ),
    ).toBe("high");
    expect(
      softCompetitionDemandTone(
        summarizeSoftCompetition(
          { mySofts: 2, othersByWeight: { 3: 1 } },
          "plus100",
          3,
        ),
      ),
    ).toBe("blocked");
    expect(softCompetitionDemandColor("clear")).toBe("success");
    expect(softCompetitionDemandColor("high")).toBe("error");
  });

  it("formats copy text for called softs only", () => {
    const text = formatGearPickCopyText({
      items: [
        { itemName: "Belt", bossName: "Putricide", mySofts: 3 },
        { itemName: "Ring", bossName: "", mySofts: 0 },
        { itemName: "Trinket", bossName: "Halion", mySofts: 1 },
      ],
    });
    expect(text).toBe(
      ["- Belt (Putricide) x3 ", "- Trinket (Halion) x1 "].join("\n"),
    );
  });

  it("prefixes the character name when softs are present", () => {
    const text = formatGearPickCopyText({
      characterName: "Elst",
      items: [
        { itemName: "Belt", bossName: "Putricide", mySofts: 3 },
        { itemName: "Ring", bossName: "", mySofts: 0 },
        { itemName: "Trinket", bossName: "Halion", mySofts: 1 },
      ],
    });
    expect(text).toBe(
      ["Elst:", "- Belt (Putricide) x3 ", "- Trinket (Halion) x1 "].join("\n"),
    );
  });

  it("returns empty when no softs even if a character name is set", () => {
    expect(
      formatGearPickCopyText({
        characterName: "Elst",
        items: [{ itemName: "Ring", bossName: "", mySofts: 0 }],
      }),
    ).toBe("");
  });
});

function getSofts(
  byItemId: ReturnType<typeof setMySoftsForItem>,
  itemId: number,
): number {
  return byItemId[itemId]?.mySofts ?? 0;
}
