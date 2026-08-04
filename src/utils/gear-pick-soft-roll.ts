import { formatCharacterDisplayName } from "./character-display.ts";

/** Soft-roll system: +100 per soft, or extra /rolls (best wins). */
export type SoftRollSystem = "plus100" | "reroll";

export type SoftRollMax = 1 | 2 | 3 | 4;

export type SoftRollRules = {
  maxSofts: SoftRollMax;
  system: SoftRollSystem;
};

export const DEFAULT_SOFT_ROLL_RULES: SoftRollRules = {
  maxSofts: 3,
  system: "reroll",
};

/** Count of other players who called exactly `weight` softs on an item. */
export type OthersSoftHistogram = Partial<Record<number, number>>;

export type ItemSoftAssignment = {
  mySofts: number;
  othersByWeight: OthersSoftHistogram;
};

export type SoftAssignmentByItemId = Record<number, ItemSoftAssignment>;

export function emptySoftAssignment(): ItemSoftAssignment {
  return { mySofts: 0, othersByWeight: {} };
}

export function getSoftAssignment(
  byItemId: SoftAssignmentByItemId,
  itemId: number,
): ItemSoftAssignment {
  return byItemId[itemId] ?? emptySoftAssignment();
}

export function softWeightKeys(maxSofts: SoftRollMax): number[] {
  return Array.from({ length: maxSofts }, (_, index) => index + 1);
}

export function sumMySofts(byItemId: SoftAssignmentByItemId): number {
  let total = 0;
  for (const assignment of Object.values(byItemId)) {
    total += assignment.mySofts;
  }
  return total;
}

export function remainingSoftBudget(
  byItemId: SoftAssignmentByItemId,
  maxSofts: SoftRollMax,
  itemId?: number,
): number {
  const total = sumMySofts(byItemId);
  const currentOnItem =
    itemId === undefined ? 0 : getSoftAssignment(byItemId, itemId).mySofts;
  return Math.max(0, maxSofts - (total - currentOnItem));
}

export function clampMySofts(
  nextValue: number,
  byItemId: SoftAssignmentByItemId,
  maxSofts: SoftRollMax,
  itemId: number,
): number {
  const budget = remainingSoftBudget(byItemId, maxSofts, itemId);
  return Math.max(0, Math.min(budget, Math.floor(nextValue)));
}

export function setMySoftsForItem(
  byItemId: SoftAssignmentByItemId,
  itemId: number,
  mySofts: number,
  maxSofts: SoftRollMax,
): SoftAssignmentByItemId {
  const clamped = clampMySofts(mySofts, byItemId, maxSofts, itemId);
  const previous = getSoftAssignment(byItemId, itemId);
  if (clamped === previous.mySofts) {
    return byItemId;
  }
  return {
    ...byItemId,
    [itemId]: { ...previous, mySofts: clamped },
  };
}

export function setOthersCountForWeight(
  byItemId: SoftAssignmentByItemId,
  itemId: number,
  weight: number,
  count: number,
  maxSofts: SoftRollMax,
): SoftAssignmentByItemId {
  if (weight < 1 || weight > maxSofts) {
    return byItemId;
  }
  const nextCount = Math.max(0, Math.floor(count));
  const previous = getSoftAssignment(byItemId, itemId);
  const othersByWeight = { ...previous.othersByWeight };
  if (nextCount === 0) {
    delete othersByWeight[weight];
  } else {
    othersByWeight[weight] = nextCount;
  }
  return {
    ...byItemId,
    [itemId]: { ...previous, othersByWeight },
  };
}

/** Drop my softs / histogram keys above the new max when rules change. */
export function clampAssignmentsToMaxSofts(
  byItemId: SoftAssignmentByItemId,
  maxSofts: SoftRollMax,
): SoftAssignmentByItemId {
  const next: SoftAssignmentByItemId = {};
  let remainingBudget = maxSofts;

  for (const [itemIdStr, assignment] of Object.entries(byItemId)) {
    const itemId = Number(itemIdStr);
    const othersByWeight: OthersSoftHistogram = {};
    for (const [weightStr, count] of Object.entries(assignment.othersByWeight)) {
      const weight = Number(weightStr);
      if (weight >= 1 && weight <= maxSofts && (count ?? 0) > 0) {
        othersByWeight[weight] = count ?? 0;
      }
    }
    const mySofts = Math.min(assignment.mySofts, remainingBudget, maxSofts);
    remainingBudget -= mySofts;
    if (mySofts === 0 && Object.keys(othersByWeight).length === 0) {
      continue;
    }
    next[itemId] = { mySofts, othersByWeight };
  }

  return next;
}

/** Total soft-weight from others: Σ(weight × playerCount). */
export function competingSoftWeight(othersByWeight: OthersSoftHistogram): number {
  let total = 0;
  for (const [weightStr, count] of Object.entries(othersByWeight)) {
    total += Number(weightStr) * (count ?? 0);
  }
  return total;
}

/** Number of other players who called this item (any soft weight). */
export function competingCallerCount(othersByWeight: OthersSoftHistogram): number {
  let total = 0;
  for (const count of Object.values(othersByWeight)) {
    total += count ?? 0;
  }
  return total;
}

export type SoftCompetitionSummary = {
  mySofts: number;
  competingWeight: number;
  competingCallers: number;
  system: SoftRollSystem;
  /** How many others already put the full soft budget on this item (+100). */
  maxSoftCallerCount: number;
  /**
   * +100: my softs are below max while someone already spent all softs —
   * lower softs cannot beat a full-soft call.
   */
  mySoftsDominated: boolean;
  /**
   * Re-roll: rolls you bring (1 default + soft extras when you call softs).
   * 0 when you have not assigned softs on this item.
   */
  myRollCount: number;
  /**
   * Re-roll: opposing rolls = one default per caller + each soft roll they called.
   */
  othersRollCount: number;
};

/**
 * Competition snapshot for UI.
 * - +100: higher soft weight wins; a full-budget caller dominates lower softs.
 * - re-roll: each soft caller rolls once by default plus once per soft spent.
 */
export function summarizeSoftCompetition(
  assignment: ItemSoftAssignment,
  system: SoftRollSystem,
  maxSofts: SoftRollMax,
): SoftCompetitionSummary {
  const competingWeight = competingSoftWeight(assignment.othersByWeight);
  const competingCallers = competingCallerCount(assignment.othersByWeight);
  const maxSoftCallerCount = assignment.othersByWeight[maxSofts] ?? 0;
  const mySoftsDominated =
    system === "plus100" &&
    maxSoftCallerCount > 0 &&
    assignment.mySofts > 0 &&
    assignment.mySofts < maxSofts;

  return {
    mySofts: assignment.mySofts,
    competingWeight,
    competingCallers,
    system,
    maxSoftCallerCount,
    mySoftsDominated,
    myRollCount: assignment.mySofts > 0 ? 1 + assignment.mySofts : 0,
    othersRollCount: competingCallers + competingWeight,
  };
}

export type GearPickCopyItem = {
  itemName: string;
  bossName: string;
  mySofts: number;
};

export type FormatGearPickCopyOptions = {
  /** Character nickname prepended as `{name}:` when there is at least one soft line. */
  characterName?: string;
  items: readonly GearPickCopyItem[];
};

/** Pasteable soft-call list: character name, then `- Item (Boss) xN` lines. */
export function formatGearPickCopyText(options: FormatGearPickCopyOptions): string {
  const lines: string[] = [];

  for (const item of options.items) {
    if (item.mySofts <= 0) {
      continue;
    }
    const bossSuffix = item.bossName ? ` (${item.bossName})` : "";
    lines.push(`- ${item.itemName}${bossSuffix} x${item.mySofts} `);
  }

  if (lines.length === 0) {
    return "";
  }

  const characterName = options.characterName?.trim();
  if (characterName) {
    return [`${formatCharacterDisplayName(characterName)}:`, ...lines].join("\n");
  }

  return lines.join("\n");
}
