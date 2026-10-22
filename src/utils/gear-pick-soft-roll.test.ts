import { describe, expect, it } from "vitest";
import {
  clampAssignmentsToMaxSofts,
  clampMySofts,
  clearAssignmentForItem,
  competingSoftWeight,
  formatGearPickCopyText,
  pruneSoftAssignmentsToItemIds,
  remainingSoftBudget,
  selectGearPickCopyItems,
  setMySoftsForItem,
  setOthersCountForWeight,
  softWeightKeys,
  sumMySofts,
  summarizeSoftCompetition,
  softCompetitionDemandColor,
  softCompetitionDemandTone,
  buildPlus100OddsAdvice,
  buildRerollOddsOptions,
  highestOthersSoftWeight,
} from "./gear-pick-soft-roll.ts";

describe("gear-pick-soft-roll", () => {
  it("lists soft weight keys up to max", () => {
    expect(softWeightKeys(3)).toEqual([1, 2, 3]);
    expect(softWeightKeys(1)).toEqual([1]);
    expect(softWeightKeys(10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("enforces soft budget across items", () => {
    let byItemId = setMySoftsForItem({}, 1, 2, 3);
    byItemId = setMySoftsForItem(byItemId, 2, 2, 3);
    expect(sumMySofts(byItemId)).toBe(3);
    expect(getSofts(byItemId, 2)).toBe(1);
    expect(remainingSoftBudget(byItemId, 3, 1)).toBe(2);
    expect(clampMySofts(5, byItemId, 3, 1)).toBe(2);
  });

  it("supports a configurable soft budget above four", () => {
    let byItemId = setMySoftsForItem({}, 1, 6, 10);
    byItemId = setMySoftsForItem(byItemId, 2, 4, 10);
    expect(sumMySofts(byItemId)).toBe(10);
    expect(remainingSoftBudget(byItemId, 10, 2)).toBe(4);
    expect(clampMySofts(8, byItemId, 10, 2)).toBe(4);
    expect(setOthersCountForWeight({}, 1, 10, 2, 10)[1]?.othersByWeight[10]).toBe(2);
  });

  it("tracks others histogram by soft weight", () => {
    let byItemId = setOthersCountForWeight({}, 10, 1, 4, 3);
    byItemId = setOthersCountForWeight(byItemId, 10, 2, 2, 3);
    byItemId = setOthersCountForWeight(byItemId, 10, 3, 2, 3);
    expect(competingSoftWeight(byItemId[10]!.othersByWeight)).toBe(1 * 4 + 2 * 2 + 3 * 2);
  });

  it("clears one item assignment without touching others", () => {
    let byItemId = setMySoftsForItem({}, 10, 2, 3);
    byItemId = setOthersCountForWeight(byItemId, 10, 1, 2, 3);
    byItemId = setMySoftsForItem(byItemId, 20, 1, 3);
    const cleared = clearAssignmentForItem(byItemId, 10);
    expect(cleared[10]).toBeUndefined();
    expect(cleared[20]?.mySofts).toBe(1);
    expect(clearAssignmentForItem(cleared, 10)).toBe(cleared);
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

  it("builds re-roll win-share options against others' rolls", () => {
    // Others: 10 rolls → ×1=2/12≈17%, ×2=3/13≈23%, ×3=4/14≈29%.
    expect(buildRerollOddsOptions(10, 3)).toEqual([
      { softs: 1, myRolls: 2, chancePercent: 17 },
      { softs: 2, myRolls: 3, chancePercent: 23 },
      { softs: 3, myRolls: 4, chancePercent: 29 },
    ]);
  });

  it("builds +100 tie/beat advice from the strongest other call", () => {
    expect(highestOthersSoftWeight({ 1: 2, 2: 1 })).toBe(2);
    expect(buildPlus100OddsAdvice({ 1: 1 }, 3)).toEqual({
      highestOthers: 1,
      softsToTie: 1,
      softsToBeat: 2,
    });
    expect(buildPlus100OddsAdvice({ 3: 1 }, 3)).toEqual({
      highestOthers: 3,
      softsToTie: 3,
      softsToBeat: null,
    });
    expect(buildPlus100OddsAdvice({}, 3)).toEqual({
      highestOthers: 0,
      softsToTie: null,
      softsToBeat: null,
    });
  });

  it("selects only my softs for copy and keeps the assigned count", () => {
    const items = [
      { itemId: 1, itemName: "Belt", bossName: "Putricide" },
      { itemId: 2, itemName: "Ring", bossName: "" },
      { itemId: 1, itemName: "Belt", bossName: "Putricide" },
    ];
    expect(selectGearPickCopyItems(items, {})).toEqual([]);
    expect(selectGearPickCopyItems(items, {
      1: { mySofts: 2, othersByWeight: {} },
      2: { mySofts: 0, othersByWeight: { 1: 3 } },
    })).toEqual([{ itemName: "Belt", bossName: "Putricide", softs: 2 }]);
  });

  it("puts reserved items first when the full useful-item list is enabled", () => {
    const items = [
      { itemId: 1, itemName: "Belt", bossName: "Putricide" },
      { itemId: 2, itemName: "Ring", bossName: "Halion" },
      { itemId: 3, itemName: "Trinket", bossName: "Saurfang" },
      { itemId: 2, itemName: "Ring", bossName: "Halion" },
    ];
    const assignments = { 2: { mySofts: 2, othersByWeight: {} } };
    expect(selectGearPickCopyItems(items, assignments, true)).toEqual([
      { itemName: "Ring", bossName: "Halion", softs: 2 },
      { itemName: "Belt", bossName: "Putricide", softs: 0 },
      { itemName: "Trinket", bossName: "Saurfang", softs: 0 },
    ]);
    expect(selectGearPickCopyItems(items, {}, true)).toHaveLength(3);
    expect(formatGearPickCopyText({
      items: selectGearPickCopyItems(items, assignments, true),
    })).toBe([
      "- Ring ×2 (Halion)",
      "- Belt (Putricide)",
      "- Trinket (Saurfang)",
    ].join("\n"));
  });

  it("formats copy text for each selected item and shows assigned soft counts", () => {
    const text = formatGearPickCopyText({
      items: [
        { itemName: "Belt", bossName: "Putricide", softs: 2 },
        { itemName: "Ring", bossName: "", softs: 1 },
        { itemName: "Trinket", bossName: "Halion", softs: 1 },
      ],
    });
    expect(text).toBe(
      ["- Belt ×2 (Putricide)", "- Ring ×1", "- Trinket ×1 (Halion)"].join("\n"),
    );
  });

  it("can hide the assigned soft count without changing selected items", () => {
    const items = [{ itemName: "Belt", bossName: "Putricide", softs: 2 }];
    expect(formatGearPickCopyText({ items, includeSoftCount: false })).toBe(
      "- Belt (Putricide)",
    );
    expect(formatGearPickCopyText({ items, includeSoftCount: false, compactLines: true })).toBe(
      "- Belt",
    );
  });

  it("prefixes the character name when softs are present", () => {
    const text = formatGearPickCopyText({
      characterName: "Elst",
      items: [
        { itemName: "Belt", bossName: "Putricide", softs: 1 },
        { itemName: "Ring", bossName: "", softs: 1 },
        { itemName: "Trinket", bossName: "Halion", softs: 1 },
      ],
    });
    expect(text).toBe(
      ["Elst:", "- Belt ×1 (Putricide)", "- Ring ×1", "- Trinket ×1 (Halion)"].join("\n"),
    );
  });

  it("can hide the character name and compact item lines", () => {
    const items = [
      { itemName: "Belt", bossName: "Putricide", softs: 2 },
      { itemName: "Trinket", bossName: "Halion", softs: 1 },
    ];
    expect(
      formatGearPickCopyText({
        characterName: "Elst",
        items,
        includeCharacterName: false,
      }),
    ).toBe(["- Belt ×2 (Putricide)", "- Trinket ×1 (Halion)"].join("\n"));
    expect(
      formatGearPickCopyText({
        characterName: "Elst",
        items,
        compactLines: true,
      }),
    ).toBe(["Elst:", "- Belt ×2", "- Trinket ×1"].join("\n"));
    expect(
      formatGearPickCopyText({
        characterName: "Elst",
        items,
        includeCharacterName: false,
        compactLines: true,
      }),
    ).toBe(["- Belt ×2", "- Trinket ×1"].join("\n"));
  });

  it("returns empty when no items are provided even if a character name is set", () => {
    expect(
      formatGearPickCopyText({
        characterName: "Elst",
        items: [],
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
