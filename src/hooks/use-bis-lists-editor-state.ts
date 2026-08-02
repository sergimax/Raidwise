import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "../i18n/use-translation.ts";
import type { BisListPreset } from "../types/bis-lists.ts";
import type { ClassName } from "../types/characters.ts";
import {
  confirmBisSlotItemsText,
  confirmedSlotDraftsToPresetSlots,
  isLocalBisPreset,
  validateBisSlotItemsText,
} from "../utils/bis-lists.ts";
import {
  collectSlotValidationErrors,
  createEmptySlotDrafts,
  isSlotDraftDirty,
  presetToSlotDrafts,
  slotDraftsToPresetSlots,
  type BisSlotDraft,
} from "../utils/bis-list-editor.ts";
import type { CharacterEquipContext } from "../utils/item-equip-restrictions.ts";
import type { BisListsDomain } from "./use-bis-lists-domain.ts";

type UseBisListsEditorStateOptions = {
  editorSessionKey: string;
  className: ClassName;
  activeSpec: string;
  selectedPreset: BisListPreset | undefined;
  isBuiltInPresetSelected: boolean;
  equipContext: CharacterEquipContext;
  bisLists: BisListsDomain;
};

export function useBisListsEditorState({
  editorSessionKey,
  className,
  activeSpec,
  selectedPreset,
  isBuiltInPresetSelected,
  equipContext,
  bisLists,
}: UseBisListsEditorStateOptions) {
  const { t, locale } = useTranslation();
  const [slotDrafts, setSlotDrafts] = useState<BisSlotDraft[]>([]);
  const [slotErrors, setSlotErrors] = useState<Record<number, string>>({});
  const [editingSlots, setEditingSlots] = useState<Record<number, boolean>>({});
  const [saveListName, setSaveListName] = useState("");
  const [error, setError] = useState("");
  const [trackedEditorSessionKey, setTrackedEditorSessionKey] = useState("");

  if (editorSessionKey !== trackedEditorSessionKey) {
    setTrackedEditorSessionKey(editorSessionKey);
    const nextDrafts = selectedPreset
      ? presetToSlotDrafts(selectedPreset)
      : createEmptySlotDrafts();
    setSlotDrafts(nextDrafts);
    setSlotErrors(collectSlotValidationErrors(nextDrafts, "strict", equipContext));
    setEditingSlots({});
    setSaveListName(
      selectedPreset && isLocalBisPreset(selectedPreset) ? selectedPreset.name : "",
    );
    setError("");
  }

  const hasSlotErrors = Object.keys(slotErrors).length > 0;
  const hasUnconfirmedSlots = slotDrafts.some(isSlotDraftDirty);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const updateSlotValidation = useCallback(
    (slot: number, itemsText: string, mode: "partial" | "strict") => {
      const validated = validateBisSlotItemsText(slot, itemsText, mode, equipContext);
      setSlotErrors((previousErrors) => {
        if (validated.error) {
          return { ...previousErrors, [slot]: validated.error };
        }
        if (!(slot in previousErrors)) {
          return previousErrors;
        }
        const nextErrors = { ...previousErrors };
        delete nextErrors[slot];
        return nextErrors;
      });
    },
    [equipContext],
  );

  const persistLocalDraftSlots = useCallback(
    (nextDrafts: BisSlotDraft[]) => {
      if (selectedPreset && isLocalBisPreset(selectedPreset)) {
        bisLists.updateSelectedLocalPresetSlots(
          className,
          activeSpec,
          confirmedSlotDraftsToPresetSlots(nextDrafts),
        );
      }
    },
    [activeSpec, bisLists, className, selectedPreset],
  );

  const handleConfirmSlot = useCallback(
    (slotIndex: number) => {
      const slotDraft = slotDrafts[slotIndex];
      if (!slotDraft) {
        return;
      }

      const confirmed = confirmBisSlotItemsText(
        slotDraft.slot,
        slotDraft.itemsText,
        equipContext,
      );
      if (!confirmed.ok) {
        setSlotErrors((previousErrors) => ({
          ...previousErrors,
          [slotDraft.slot]: confirmed.error,
        }));
        return;
      }

      const nextDrafts = slotDrafts.map((entry, entryIndex) =>
        entryIndex === slotIndex
          ? {
              ...entry,
              itemsText: confirmed.itemsText,
              confirmedText: confirmed.itemsText,
              itemIds: confirmed.itemIds,
            }
          : entry,
      );

      setSlotDrafts(nextDrafts);
      setSlotErrors((previousErrors) => {
        if (!(slotDraft.slot in previousErrors)) {
          return previousErrors;
        }
        const nextErrors = { ...previousErrors };
        delete nextErrors[slotDraft.slot];
        return nextErrors;
      });
      setEditingSlots((previousEditing) => {
        if (!(slotDraft.slot in previousEditing)) {
          return previousEditing;
        }
        const nextEditing = { ...previousEditing };
        delete nextEditing[slotDraft.slot];
        return nextEditing;
      });
      setError("");
      persistLocalDraftSlots(nextDrafts);
    },
    [equipContext, persistLocalDraftSlots, slotDrafts],
  );

  const handleStartEditSlot = useCallback(
    (slot: number) => {
      if (isBuiltInPresetSelected) {
        return;
      }
      setEditingSlots((previousEditing) => ({ ...previousEditing, [slot]: true }));
      setError("");
    },
    [isBuiltInPresetSelected],
  );

  const handleCancelEditSlot = useCallback((slotIndex: number) => {
    setSlotDrafts((previousDrafts) => {
      const slotDraft = previousDrafts[slotIndex];
      if (!slotDraft) {
        return previousDrafts;
      }

      setEditingSlots((previousEditing) => {
        if (!(slotDraft.slot in previousEditing)) {
          return previousEditing;
        }
        const nextEditing = { ...previousEditing };
        delete nextEditing[slotDraft.slot];
        return nextEditing;
      });
      setSlotErrors((previousErrors) => {
        if (!(slotDraft.slot in previousErrors)) {
          return previousErrors;
        }
        const nextErrors = { ...previousErrors };
        delete nextErrors[slotDraft.slot];
        return nextErrors;
      });

      return previousDrafts.map((entry, entryIndex) =>
        entryIndex === slotIndex
          ? { ...entry, itemsText: entry.confirmedText }
          : entry,
      );
    });
  }, []);

  const handleClearSlot = useCallback(
    (slotIndex: number) => {
      if (isBuiltInPresetSelected) {
        return;
      }

      const slotDraft = slotDrafts[slotIndex];
      if (!slotDraft) {
        return;
      }

      const nextDrafts = slotDrafts.map((entry, entryIndex) =>
        entryIndex === slotIndex
          ? {
              ...entry,
              itemsText: "",
              confirmedText: "",
              itemIds: [],
            }
          : entry,
      );

      setSlotDrafts(nextDrafts);
      setSlotErrors((previousErrors) => {
        if (!(slotDraft.slot in previousErrors)) {
          return previousErrors;
        }
        const nextErrors = { ...previousErrors };
        delete nextErrors[slotDraft.slot];
        return nextErrors;
      });
      setEditingSlots((previousEditing) => {
        if (!(slotDraft.slot in previousEditing)) {
          return previousEditing;
        }
        const nextEditing = { ...previousEditing };
        delete nextEditing[slotDraft.slot];
        return nextEditing;
      });
      setError("");
      persistLocalDraftSlots(nextDrafts);
    },
    [isBuiltInPresetSelected, persistLocalDraftSlots, slotDrafts],
  );

  const handleClearAllSlots = useCallback(() => {
    if (isBuiltInPresetSelected) {
      return;
    }

    const nextDrafts = createEmptySlotDrafts();
    setSlotDrafts(nextDrafts);
    setSlotErrors({});
    setEditingSlots({});
    setError("");
    persistLocalDraftSlots(nextDrafts);
  }, [isBuiltInPresetSelected, persistLocalDraftSlots]);

  const handleSaveList = useCallback(() => {
    if (hasUnconfirmedSlots) {
      setError(t("bisPanel.confirmAllSlots"));
      return;
    }

    const strictErrors = collectSlotValidationErrors(slotDrafts, "strict", equipContext);
    if (Object.keys(strictErrors).length > 0) {
      setSlotErrors(strictErrors);
      setError(t("bisPanel.fixItemErrors"));
      return;
    }

    const parsed = slotDraftsToPresetSlots(slotDrafts, locale, equipContext);
    if (parsed.error) {
      setError(parsed.error);
      return;
    }

    const result = bisLists.savePresetByName(
      className,
      activeSpec,
      saveListName,
      parsed.slots,
    );
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError("");
  }, [
    activeSpec,
    bisLists,
    className,
    equipContext,
    hasUnconfirmedSlots,
    locale,
    saveListName,
    slotDrafts,
    t,
  ]);

  const handleItemsTextChange = useCallback(
    (slotIndex: number, slot: number, nextValue: string) => {
      setSlotDrafts((previousDrafts) =>
        previousDrafts.map((entry, entryIndex) =>
          entryIndex === slotIndex ? { ...entry, itemsText: nextValue } : entry,
        ),
      );
      updateSlotValidation(slot, nextValue, "partial");
      setError("");
    },
    [updateSlotValidation],
  );

  const handleItemsTextBlur = useCallback(
    (slot: number, itemsText: string) => {
      updateSlotValidation(slot, itemsText, "strict");
    },
    [updateSlotValidation],
  );

  return useMemo(
    () => ({
      slotDrafts,
      slotErrors,
      editingSlots,
      saveListName,
      setSaveListName,
      error,
      clearError,
      hasSlotErrors,
      hasUnconfirmedSlots,
      handleConfirmSlot,
      handleStartEditSlot,
      handleCancelEditSlot,
      handleClearSlot,
      handleClearAllSlots,
      handleSaveList,
      handleItemsTextChange,
      handleItemsTextBlur,
    }),
    [
      clearError,
      editingSlots,
      error,
      handleCancelEditSlot,
      handleClearAllSlots,
      handleClearSlot,
      handleConfirmSlot,
      handleItemsTextBlur,
      handleItemsTextChange,
      handleSaveList,
      handleStartEditSlot,
      hasSlotErrors,
      hasUnconfirmedSlots,
      saveListName,
      slotDrafts,
      slotErrors,
    ],
  );
}
