/**
 * Resolve Russian guild (Titans) BiS list lines: T10 tokens, ilvl hints, weapon slots.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "../src/data");

const namesRu = JSON.parse(
  fs.readFileSync(path.join(dataDir, "wotlk-item-names-ru.json"), "utf8"),
);
const ilvls = JSON.parse(
  fs.readFileSync(path.join(dataDir, "wotlk-item-levels.json"), "utf8"),
);
const gearSlots = JSON.parse(
  fs.readFileSync(path.join(dataDir, "wotlk-item-gear-slots.json"), "utf8"),
);
const equipProps = JSON.parse(
  fs.readFileSync(path.join(dataDir, "wotlk-item-equip-props.json"), "utf8"),
);

const ItemType = { Weapon: 13, Ranged: 14 };
const WeaponType = { OffHand: 5 };
const HandType = { MainHand: 1, OneHand: 2, OffHand: 3, TwoHand: 4 };

/** Sanctified T10 (277) by class|spec. */
export const T10_BY_SPEC = {
  "Warrior|Fury": { 0: 51227, 2: 51229, 4: 51225, 6: 51226, 8: 51228 },
  "Druid|Feral": { 0: 51296, 2: 51299, 4: 51300, 6: 51295, 8: 51297 },
  "Druid|Balance": { 0: 51290, 2: 51292, 4: 51294, 6: 51291, 8: 51293 },
  "Druid|Restoration": { 0: 51296, 2: 51299, 4: 51298, 6: 51291, 8: 51297 },
  "Priest|Shadow": { 0: 51255, 2: 51257, 4: 51259, 6: 51256, 8: 51258 },
  "Priest|Discipline": { 0: 51261, 2: 51264, 4: 51263, 6: 51260, 8: 51262 },
  "Mage|Arcane": { 0: 51281, 2: 51284, 4: 51283, 6: 51280, 8: 51282 },
  "Mage|Fire": { 0: 51281, 2: 51284, 4: 51283, 6: 51280, 8: 51282 },
  "Hunter|Marksmanship": { 0: 51286, 2: 51288, 4: 51289, 6: 51285, 8: 51287 },
  "Paladin|Retribution": { 0: 51277, 2: 51279, 4: 51275, 6: 51276, 8: 51278 },
  "Paladin|Protection": { 0: 51266, 2: 51269, 4: 51265, 6: 51267, 8: 51268 },
  "Paladin|Holy": { 0: 51272, 2: 51273, 4: 51274, 6: 51270, 8: 51271 },
  "Rogue|Combat": { 0: 51252, 2: 51254, 4: 51250, 6: 51251, 8: 51253 },
  "Death Knight|Unholy": { 0: 51312, 2: 51314, 4: 51310, 6: 51311, 8: 51313 },
  "Death Knight|Frost": { 0: 51312, 2: 51314, 4: 51310, 6: 51311, 8: 51313 },
  "Death Knight|Blood": { 0: 51306, 2: 51309, 4: 51305, 6: 51307, 8: 51308 },
  "Warlock|Demonology": { 0: 51231, 2: 51234, 4: 51233, 6: 51230, 8: 51232 },
  "Warlock|Affliction": { 0: 51231, 2: 51234, 4: 51233, 6: 51230, 8: 51232 },
  "Shaman|Elemental": { 0: 51247, 2: 51245, 4: 51249, 6: 51248, 8: 51246 },
  "Shaman|Restoration": { 0: 51247, 2: 51245, 4: 51249, 6: 51248, 8: 51246 },
  "Shaman|Enhancement": { 0: 51247, 2: 51245, 4: 51249, 6: 51248, 8: 51246 },
};

const MANUAL_ITEM_IDS = {
  зов: 50737,
  "зов хаоса": 50737,
  "зов хаоса х2": 50737,
  "зов хаоса топор королей лордерона": 50737,
  фалинраш: 50733,
  "фал'инраш": 50733,
  клятвохранитель: 50735,
  глоренцельг: 50730,
  прилив: 50732,
  "катушка тенешелка": 50719,
  "шип для пронзания трупов": 50684,
  "кованая плетью секира": 50654,
  "сила тлеющей стали": 50616,
  теренаска: 50734,
  "темная скорбь": 49623,
  "поручи полой тени": 54580,
  "солнечные часы вечного заката": 50635,
};

const SLOT_KEYS = {
  Голова: 0,
  Шея: 1,
  Плечо: 2,
  Плащ: 3,
  Грудь: 4,
  Запястья: 5,
  Кисти: 6,
  Пояс: 7,
  Ноги: 8,
  Ступни: 9,
  Кольца: "rings",
  Аксессуар: "trinkets",
  Оружие: "weapons",
};

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[`'"«»]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseSourceHint(source) {
  const sourceLower = source.toLowerCase();
  let targetIlvl = null;
  if (/рс.*25.*хм|rs.*25.*h/i.test(sourceLower)) targetIlvl = 284;
  else if (/цлк.*25.*хм|icc.*25.*h/i.test(sourceLower)) targetIlvl = 277;
  else if (/10.*хм/i.test(sourceLower)) targetIlvl = 264;
  else if (/ивк|toc.*25/i.test(sourceLower)) targetIlvl = 258;
  else if (/ульда|ulduar/i.test(sourceLower)) targetIlvl = 239;
  else if (/репа|rep/i.test(sourceLower)) targetIlvl = 277;
  else if (/за лёд|за лед|frost emblem/i.test(sourceLower)) targetIlvl = 264;
  else if (/триумф|triumph/i.test(sourceLower)) targetIlvl = 245;
  return { targetIlvl };
}

function manualItemId(itemName, className, spec) {
  const key = normalize(itemName);
  const manual = MANUAL_ITEM_IDS[key];
  if (typeof manual === "number") return manual;
  if (manual && typeof manual === "object") {
    return manual[`${className}|${spec}`] ?? manual.default;
  }
  return null;
}

function findItemIds(itemName, slotIdx, sourceHint, className, spec) {
  if (/^т10$/i.test(itemName.trim())) return [];

  const manualId = manualItemId(itemName, className, spec);
  if (manualId) return [manualId];

  const normalizedWant = normalize(itemName);
  const { targetIlvl } = parseSourceHint(sourceHint);
  const matches = [];

  for (const [id, name] of Object.entries(namesRu)) {
    const normalizedName = normalize(name);
    const nameMatch =
      normalizedName === normalizedWant ||
      normalizedName.includes(normalizedWant) ||
      normalizedWant.includes(normalizedName);
    if (!nameMatch) continue;
    const slots = gearSlots[id];
    if (slotIdx != null && slots && !slots.includes(slotIdx)) continue;
    matches.push({ id: Number(id), ilvl: ilvls[id] ?? 0, name });
  }

  matches.sort((first, second) => second.ilvl - first.ilvl);
  if (targetIlvl != null) {
    const ilvlMatches = matches.filter((match) => match.ilvl === targetIlvl);
    if (ilvlMatches.length > 0) return [ilvlMatches[0].id];
  }
  if (matches.length > 0) return [matches[0].id];
  return [];
}

function cleanItemPart(part) {
  return stripSourceHints(part.replace(/^[^:]+:\s*/i, "")).trim();
}

function stripSourceHints(value) {
  return value.replace(/\([^)]*\)/g, "").trim();
}

function splitItemParts(value) {
  const withoutAlt = stripSourceHints(value.split(/\s*\/\s*/)[0]);
  return withoutAlt
    .split(/\s*\+\s*/)
    .map((part) => cleanItemPart(part))
    .filter(Boolean);
}

function splitWeaponParts(value) {
  const segments = value.split(/\s*\/\s*/);
  const primarySegment = stripSourceHints(segments[0]);
  const primaryParts = primarySegment
    .split(/\s*\+\s*/)
    .map((part) => cleanItemPart(part))
    .filter(Boolean);

  if (primaryParts.length > 1) {
    return primaryParts;
  }

  for (let index = 1; index < segments.length; index += 1) {
    const segment = stripSourceHints(segments[index]);
    const plusIndex = segment.indexOf("+");
    if (plusIndex === -1) continue;
    const offHandParts = segment
      .slice(plusIndex + 1)
      .split(/\s*\+\s*/)
      .map((part) => cleanItemPart(part))
      .filter(Boolean);
    if (offHandParts.length > 0) {
      const mainPart = primaryParts[0] ?? cleanItemPart(primarySegment);
      return [mainPart, ...offHandParts];
    }
  }

  if (primaryParts.length === 1) {
    return primaryParts;
  }

  const primary = primarySegment.trim();
  if (primary.includes("+")) {
    return splitItemParts(value);
  }

  const splitPrefixes = [
    "Солнечные часы",
    "Катушка",
    "Шип для",
    "Сила тлеющей",
  ];
  for (const prefix of splitPrefixes) {
    const prefixIndex = primary.indexOf(prefix);
    if (prefixIndex > 0) {
      return [primary.slice(0, prefixIndex).trim(), primary.slice(prefixIndex).trim()];
    }
  }
  return [primary.trim()];
}

function canDualWield(className, spec) {
  if (
    className === "Warrior" ||
    className === "Death Knight" ||
    className === "Hunter" ||
    className === "Rogue"
  ) {
    return true;
  }
  return className === "Shaman" && spec === "Enhancement";
}

function canEquipTwoHandInOffHand(className, spec) {
  return className === "Warrior" && spec !== "Protection";
}

function isRangedItem(itemId) {
  return equipProps[String(itemId)]?.t === ItemType.Ranged;
}

function canEquipWeaponInSlot(itemId, gearSlot, className, spec) {
  const props = equipProps[String(itemId)];
  if (!props) {
    return gearSlot >= 14 && gearSlot <= 16;
  }
  if (props.t === ItemType.Ranged) {
    return gearSlot === 16;
  }
  if (props.t !== ItemType.Weapon) {
    return false;
  }

  const handType = props.h ?? 0;
  const weaponType = props.w ?? 0;

  if (gearSlot === 16) {
    return false;
  }
  if (gearSlot === 14) {
    return handType !== HandType.OffHand;
  }
  if (gearSlot === 15) {
    if (handType === HandType.TwoHand) {
      return canEquipTwoHandInOffHand(className, spec);
    }
    if (weaponType === WeaponType.OffHand || handType === HandType.OffHand) {
      return true;
    }
    if (handType === HandType.OneHand) {
      return canDualWield(className, spec);
    }
    return false;
  }
  return false;
}

function assignWeaponSlots(parts, sourceHint, className, spec) {
  const assigned = [];
  const weaponSlots = [14, 15];
  let nextWeaponSlotIndex = 0;

  for (const rawPart of parts) {
    if (/^т10$/i.test(rawPart)) continue;
    const isDual = /х2$/i.test(rawPart);
    const part = cleanItemPart(rawPart);
    const itemIds = findItemIds(part, null, sourceHint, className, spec);
    if (!itemIds.length) {
      assigned.push({ slot: null, itemIds: [], label: part });
      continue;
    }
    const itemId = itemIds[0];

    if (isDual) {
      assigned.push({ slot: 14, itemIds: [itemId], label: part });
      assigned.push({ slot: 15, itemIds: [itemId], label: part });
      nextWeaponSlotIndex = weaponSlots.length;
      continue;
    }

    if (isRangedItem(itemId)) {
      assigned.push({ slot: 16, itemIds: [itemId], label: part });
      continue;
    }

    let slot = null;
    while (nextWeaponSlotIndex < weaponSlots.length) {
      const candidate = weaponSlots[nextWeaponSlotIndex];
      if (canEquipWeaponInSlot(itemId, candidate, className, spec)) {
        slot = candidate;
        nextWeaponSlotIndex += 1;
        break;
      }
      nextWeaponSlotIndex += 1;
    }

    if (slot == null) {
      assigned.push({ slot: null, itemIds: [itemId], label: part });
      continue;
    }
    assigned.push({ slot, itemIds: [itemId], label: part });
  }
  return assigned;
}

function parseListRows(listLines) {
  const rows = [];
  for (const rawLine of listLines) {
    const line = rawLine.replace(/^-\s*/, "").trim();
    if (!line) continue;
    const rowMatch = line.match(/^([^:]+):\s*(.+)$/);
    if (!rowMatch) continue;
    rows.push({
      slotLabel: rowMatch[1].trim().replace(/^[^:]+:\s*/, ""),
      value: rowMatch[2].trim(),
    });
  }
  return rows;
}

function resolveRows(className, spec, rows) {
  const t10Map = T10_BY_SPEC[`${className}|${spec}`];
  const slotEntries = [];
  const unresolved = [];

  for (const row of rows) {
    const slotKey =
      SLOT_KEYS[row.slotLabel] ??
      SLOT_KEYS[row.slotLabel.replace(/^.*:\s*/, "")];

    if (slotKey === "rings" || slotKey === "trinkets") {
      const parts = splitItemParts(row.value);
      const slotIndexes = slotKey === "rings" ? [10, 11] : [12, 13];
      for (let index = 0; index < parts.length && index < slotIndexes.length; index += 1) {
        slotEntries.push({
          slot: slotIndexes[index],
          itemIds: findItemIds(parts[index], slotIndexes[index], row.value, className, spec),
        });
      }
      continue;
    }

    if (slotKey === "weapons") {
      const parts = splitWeaponParts(row.value);
      slotEntries.push(...assignWeaponSlots(parts, row.value, className, spec));
      continue;
    }

    const parts = splitItemParts(row.value);
    const itemName = parts[0];
    if (/^т10$/i.test(itemName)) {
      const itemId = t10Map?.[slotKey];
      slotEntries.push({ slot: slotKey, itemIds: itemId ? [itemId] : [] });
      continue;
    }
    slotEntries.push({
      slot: slotKey,
      itemIds: findItemIds(itemName, slotKey, row.value, className, spec),
    });
  }

  const slotsByIndex = new Map();
  for (const entry of slotEntries) {
    if (entry.slot == null || !entry.itemIds?.length) {
      if (entry.label || entry.itemIds?.length === 0) unresolved.push(entry);
      continue;
    }
    slotsByIndex.set(entry.slot, {
      slot: entry.slot,
      itemIds: entry.itemIds,
    });
  }

  const slots = [...slotsByIndex.values()].sort((first, second) => first.slot - second.slot);
  return { slots, unknown: unresolved.map((entry) => entry.label ?? String(entry.slot)) };
}

/** @param {string} className @param {string} spec @param {string[]} listLines */
export function resolveTitansListLines(className, spec, listLines) {
  return resolveRows(className, spec, parseListRows(listLines));
}

export function isTitansGuildList(server, presetName) {
  return server === "Titans" && presetName === "Titans";
}
