import { GearSlotNames } from "../data/gear-slot-names.ts";
import type { AppLocale } from "../i18n/types.ts";
import { getLocalizedGearSlotLabel } from "../i18n/localized-domain.ts";
import type { BisListPreset, BisListSlot } from "../types/bis-lists.ts";
import { formatBisSlotItems, validateBisSlotItemsText } from "./bis-lists.ts";
import type { CharacterEquipContext } from "./item-equip-restrictions.ts";

export type BisSlotDraft = {
  slot: number;
  itemsText: string;
  confirmedText: string;
  itemIds: number[];
};

export function isSlotDraftDirty(slotDraft: BisSlotDraft): boolean {
  return slotDraft.itemsText.trim() !== slotDraft.confirmedText.trim();
}

export function isSlotEditing(
  slotDraft: BisSlotDraft,
  editingSlots: Readonly<Record<number, boolean>>,
  isBuiltInPresetSelected: boolean,
): boolean {
  if (isBuiltInPresetSelected) {
    return false;
  }
  if (isSlotDraftDirty(slotDraft)) {
    return true;
  }
  return editingSlots[slotDraft.slot] === true;
}

export function presetToSlotDrafts(preset: BisListPreset): BisSlotDraft[] {
  const itemIdsBySlot = new Map(
    preset.slots.map((slotEntry) => [slotEntry.slot, slotEntry.itemIds] as const),
  );

  // Always include every gear slot so empty slots stay editable after save/reload.
  return GearSlotNames.map((_, slot) => {
    const itemIds = itemIdsBySlot.get(slot) ?? [];
    const itemsText =
      itemIds.length > 0 ? formatBisSlotItems(itemIds) : "";
    return {
      slot,
      itemsText,
      confirmedText: itemsText,
      itemIds: [...itemIds],
    };
  });
}

export function createEmptySlotDrafts(): BisSlotDraft[] {
  return GearSlotNames.map((_, slot) => ({
    slot,
    itemsText: "",
    confirmedText: "",
    itemIds: [],
  }));
}

export function slotDraftsToPresetSlots(
  slotDrafts: BisSlotDraft[],
  locale: AppLocale,
  equipContext: CharacterEquipContext,
): {
  slots: BisListSlot[];
  error: string;
} {
  const slots: BisListSlot[] = [];
  const errors: string[] = [];

  for (const slotDraft of slotDrafts) {
    const validated = validateBisSlotItemsText(
      slotDraft.slot,
      slotDraft.itemsText,
      "strict",
      equipContext,
    );
    if (validated.error) {
      errors.push(
        `${getLocalizedGearSlotLabel(slotDraft.slot, locale)}: ${validated.error}`,
      );
      continue;
    }
    if (validated.itemIds.length > 0) {
      slots.push({ slot: slotDraft.slot, itemIds: validated.itemIds });
    }
  }

  if (errors.length > 0) {
    return {
      slots: [],
      error: errors.join("; "),
    };
  }

  return { slots, error: "" };
}

export function collectSlotValidationErrors(
  slotDrafts: BisSlotDraft[],
  mode: "partial" | "strict",
  equipContext: CharacterEquipContext,
): Record<number, string> {
  const errors: Record<number, string> = {};

  for (const slotDraft of slotDrafts) {
    const validated = validateBisSlotItemsText(
      slotDraft.slot,
      slotDraft.itemsText,
      mode,
      equipContext,
    );
    if (validated.error) {
      errors[slotDraft.slot] = validated.error;
    }
  }

  return errors;
}
