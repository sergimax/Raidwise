/** Maps a WowSims item record to WowSims gear slot indices (0 = head, …). */
export function itemToGearSlots(item) {
  const itemType = item.type;
  if (itemType >= 1 && itemType <= 10) {
    return [itemType - 1];
  }
  if (itemType === 11) {
    return [10, 11];
  }
  if (itemType === 12) {
    return [12, 13];
  }
  if (itemType === 13) {
    const handType = item.handType;
    if (handType === 3) {
      return [15];
    }
    if (handType === 4 || handType === 1) {
      return [14];
    }
    return [14, 15];
  }
  if (itemType === 14) {
    return [16];
  }
  return [];
}

export function buildItemGearSlotsMap(dbItems, itemLevelIds) {
  const itemsById = new Map(dbItems.map((item) => [item.id, item]));
  const gearSlotsByItemId = {};

  for (const itemId of itemLevelIds) {
    const item = itemsById.get(Number(itemId));
    if (!item) {
      continue;
    }

    const slots = itemToGearSlots(item);
    if (slots.length > 0) {
      gearSlotsByItemId[itemId] = slots;
    }
  }

  return gearSlotsByItemId;
}
