import { useCallback, useState } from "react";
import type { GearPickCharacterSelection } from "../components/gear-pick-panel/gear-pick-character-select.tsx";
import {
  clampAssignmentsToMaxSofts,
  clearAssignmentForItem,
  DEFAULT_SOFT_ROLL_RULES,
  pruneSoftAssignmentsToItemIds,
  setMySoftsForItem,
  setOthersCountForWeight,
  type SoftAssignmentByItemId,
  type SoftRollRules,
} from "../utils/gear-pick-soft-roll.ts";
import { toggleDungeonIdExclusion } from "../utils/filter-dungeons-excluding-ids.ts";

/**
 * Session-only Soft pick UI state. Owned above the overlay so switching
 * toolbar panels does not reset character / rules / softs / raid exclusions.
 */
export function useGearPickSessionState() {
  const [selection, setSelection] = useState<GearPickCharacterSelection | null>(
    null,
  );
  const [rules, setRules] = useState<SoftRollRules>(DEFAULT_SOFT_ROLL_RULES);
  const [assignmentsByItemId, setAssignmentsByItemId] =
    useState<SoftAssignmentByItemId>({});
  const [excludedDungeonIds, setExcludedDungeonIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [includeCopyCharacterName, setIncludeCopyCharacterName] =
    useState(true);
  const [compactCopyLines, setCompactCopyLines] = useState(false);

  const handleSelectionChange = useCallback(
    (next: GearPickCharacterSelection) => {
      setSelection(next);
      setAssignmentsByItemId({});
    },
    [],
  );

  const handleRulesChange = useCallback(
    (next: SoftRollRules) => {
      setRules(next);
      if (next.maxSofts !== rules.maxSofts) {
        setAssignmentsByItemId((previous) =>
          clampAssignmentsToMaxSofts(previous, next.maxSofts),
        );
      }
    },
    [rules.maxSofts],
  );

  const handleMySoftsChange = useCallback(
    (itemId: number, mySofts: number) => {
      setAssignmentsByItemId((previous) =>
        setMySoftsForItem(previous, itemId, mySofts, rules.maxSofts),
      );
    },
    [rules.maxSofts],
  );

  const handleOthersCountChange = useCallback(
    (itemId: number, weight: number, count: number) => {
      setAssignmentsByItemId((previous) =>
        setOthersCountForWeight(
          previous,
          itemId,
          weight,
          count,
          rules.maxSofts,
        ),
      );
    },
    [rules.maxSofts],
  );

  const handleClearItemAssignment = useCallback((itemId: number) => {
    setAssignmentsByItemId((previous) =>
      clearAssignmentForItem(previous, itemId),
    );
  }, []);

  const toggleDungeonExcluded = useCallback((dungeonId: string) => {
    setExcludedDungeonIds((previous) =>
      toggleDungeonIdExclusion(previous, dungeonId),
    );
  }, []);

  const clearExcludedDungeonIds = useCallback(() => {
    setExcludedDungeonIds(new Set());
  }, []);

  const pruneAssignmentsToItemIds = useCallback(
    (keepItemIds: ReadonlySet<number>) => {
      setAssignmentsByItemId((previous) =>
        pruneSoftAssignmentsToItemIds(previous, keepItemIds),
      );
    },
    [],
  );

  const clearAssignments = useCallback(() => {
    setAssignmentsByItemId({});
  }, []);

  return {
    selection,
    rules,
    assignmentsByItemId,
    excludedDungeonIds,
    includeCopyCharacterName,
    compactCopyLines,
    handleSelectionChange,
    handleRulesChange,
    handleMySoftsChange,
    handleOthersCountChange,
    handleClearItemAssignment,
    toggleDungeonExcluded,
    clearExcludedDungeonIds,
    pruneAssignmentsToItemIds,
    clearAssignments,
    setIncludeCopyCharacterName,
    setCompactCopyLines,
  };
}

export type GearPickSessionState = ReturnType<typeof useGearPickSessionState>;
