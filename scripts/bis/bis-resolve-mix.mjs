/**
 * Resolve Kingdom / mix BiS lists from scripts/bis-list-mix.md.
 *
 * Dialect: `# Class - Ru`, `## Spec - Ru (aliases)`, `- Label[ N[-M]]: Item (source)`.
 * Numbered weapons: Оружие 1=MH, 2=OH, 3=ranged; Щит/Оффхэнд=15; Жезл=16.
 * Alternatives: Label N-M appends to the same slot in document order.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { T10_BY_SPEC } from "./bis-resolve-titans.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "../src/data");

const namesRu = JSON.parse(
  fs.readFileSync(path.join(dataDir, "wotlk-item-names-ru.json"), "utf8"),
);
const namesEn = JSON.parse(
  fs.readFileSync(path.join(dataDir, "wotlk-item-names.json"), "utf8"),
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

export const KINGDOM_PRESET_ID = "kingdom-with-variants";
export const KINGDOM_PRESET_NAME = "Kingdom. With variants";

const ItemType = { Weapon: 13, Ranged: 14 };
const HandType = { MainHand: 1, OneHand: 2, OffHand: 3, TwoHand: 4 };

/** Extra Sanctified T10 maps for specs missing from Titans T10_BY_SPEC. */
const T10_EXTRA = {
  "Warrior|Protection": {
    2: 51224,
    4: 51220,
    6: 51222,
    8: 51223,
  },
  "Warrior|Arms": {
    0: 51227,
    2: 51229,
    4: 51225,
    6: 51226,
    8: 51228,
  },
  // Same healing Crimson Acolyte set as Discipline.
  "Priest|Holy": {
    0: 51261,
    2: 51264,
    4: 51263,
    6: 51260,
    8: 51262,
  },
};

const MANUAL_ITEM_IDS = {
  зов: 50737,
  "зов хаоса": 50737,
  "зов хаоса, топор королей лордерона": 50737,
  "зов хаоса топор королей лордерона": 50737,
  фалинраш: 50733,
  "фал'инраш": 50733,
  "фал'инраш, защитник кельталаса": 50733,
  "фал'инраш, защитник кель'таласа": 50733,
  клятвохранитель: 50735,
  "клятвохранитель, алебарда предводителя следопытов": 50735,
  глоренцельг: 50730,
  "глоренцельг, священный клинок серебряной длани": 50730,
  прилив: 50732,
  "прилив крови, клинок агонии келтузада": 50732,
  "прилив крови, клинок агонии кел'тузада": 50732,
  "катушка тенешелка": 50719,
  "шип для пронзания трупов": 50684,
  "кованая плетью секира": 50654,
  "сила тлеющей стали": 50616,
  теренаска: 50734,
  "королевский скипетр теренаса ii": 50734,
  "темная скорбь": 49623,
  "поручи полной тени": 54580,
  "поручи полой тени": 54580,
  "солнечные часы вечного заката": 50635,
  "вечно холодное кольцо девия": 50622,
  "вечно хладное кольцо девия": 50622,
  скарабей: 47216,
  "упрямый скарабей сатрины": 47216,
  "митриос, наследие бронзоборода": 50738,
  митриос: 50738,
  "клинок отравленной крови": 50672,
  "карабин охотника снов": 50638,
  "мерзлая стена ледяной цитадели": 50729,
  "вал'анир, молот древних королей": 46017,
  валанир: 46017,
};

const ARMOR_SLOT_LABELS = {
  голова: 0,
  шея: 1,
  плечо: 2,
  плащ: 3,
  грудь: 4,
  запястья: 5,
  кисти: 6,
  пояс: 7,
  ноги: 8,
  ступни: 9,
};

const CLASS_FROM_HEADING = {
  warrior: "Warrior",
  paladin: "Paladin",
  hunter: "Hunter",
  rogue: "Rogue",
  priest: "Priest",
  "death knight": "Death Knight",
  shaman: "Shaman",
  mage: "Mage",
  warlock: "Warlock",
  druid: "Druid",
};

const SPEC_FROM_HEADING = {
  arms: "Arms",
  fury: "Fury",
  protection: "Protection",
  holy: "Holy",
  retribution: "Retribution",
  "beast mastery": "Beast Mastery",
  marksmanship: "Marksmanship",
  survival: "Survival",
  assassination: "Assassination",
  combat: "Combat",
  subtlety: "Subtlety",
  discipline: "Discipline",
  shadow: "Shadow",
  blood: "Blood",
  frost: "Frost",
  unholy: "Unholy",
  elemental: "Elemental",
  enhancement: "Enhancement",
  restoration: "Restoration",
  arcane: "Arcane",
  fire: "Fire",
  affliction: "Affliction",
  demonology: "Demonology",
  destruction: "Destruction",
  balance: "Balance",
  "feral combat": "Feral",
  feral: "Feral",
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
  else if (/за лёд|за лед|frost emblem|эмблем/i.test(sourceLower))
    targetIlvl = 264;
  else if (/триумф|triumph/i.test(sourceLower)) targetIlvl = 245;
  return { targetIlvl };
}

function stripSourceHints(value) {
  return value
    .replace(/\([^)]*\)/g, "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function manualItemId(itemName) {
  return MANUAL_ITEM_IDS[normalize(itemName)] ?? null;
}

function findItemIds(itemName, slotIdx, sourceHint) {
  const cleaned = stripSourceHints(itemName);
  if (!cleaned || /^т10(?:\.\d+)?$/i.test(cleaned)) {
    return [];
  }

  const manualId = manualItemId(cleaned);
  if (manualId) {
    return [manualId];
  }

  const normalizedWant = normalize(cleaned);
  const { targetIlvl } = parseSourceHint(sourceHint);
  const matches = [];

  for (const [id, name] of Object.entries(namesRu)) {
    const normalizedName = normalize(name);
    const nameMatch =
      normalizedName === normalizedWant ||
      normalizedName.includes(normalizedWant) ||
      normalizedWant.includes(normalizedName);
    if (!nameMatch) {
      continue;
    }
    const slots = gearSlots[id];
    if (slotIdx != null && slots && !slots.includes(slotIdx)) {
      continue;
    }
    matches.push({ id: Number(id), ilvl: ilvls[id] ?? 0, name });
  }

  if (matches.length === 0) {
    for (const [id, name] of Object.entries(namesEn)) {
      const normalizedName = normalize(name);
      if (normalizedName !== normalizedWant) {
        continue;
      }
      matches.push({ id: Number(id), ilvl: ilvls[id] ?? 0, name });
    }
  }

  matches.sort((left, right) => right.ilvl - left.ilvl);
  if (targetIlvl != null) {
    const ilvlMatches = matches.filter((match) => match.ilvl === targetIlvl);
    if (ilvlMatches.length > 0) {
      return [ilvlMatches[0].id];
    }
  }
  if (matches.length > 0) {
    return [matches[0].id];
  }
  return [];
}

function t10IdForSlot(className, spec, slot) {
  const key = `${className}|${spec}`;
  return T10_EXTRA[key]?.[slot] ?? T10_BY_SPEC[key]?.[slot] ?? null;
}

function isRangedItem(itemId) {
  return equipProps[String(itemId)]?.t === ItemType.Ranged;
}

function inferBareWeaponSlot(itemId) {
  const props = equipProps[String(itemId)];
  if (!props) {
    return 14;
  }
  if (props.t === ItemType.Ranged) {
    return 16;
  }
  if (props.t !== ItemType.Weapon) {
    return 14;
  }
  const handType = props.h ?? 0;
  if (handType === HandType.OffHand) {
    return 15;
  }
  return 14;
}

/**
 * Parse mix label into slot index.
 * @returns {{ slot: number } | null}
 */
export function parseMixSlotLabel(rawLabel) {
  const label = rawLabel.trim().toLowerCase().replace(/\s+/g, " ");

  if (label === "щит" || label.startsWith("щит ")) {
    return { slot: 15 };
  }
  if (label === "оффхэнд" || label.startsWith("оффхэнд ")) {
    return { slot: 15 };
  }
  if (label === "жезл" || label.startsWith("жезл ")) {
    return { slot: 16 };
  }

  const weaponMatch = label.match(/^оружие(?:\s+(\d+)(?:-(\d+))?)?$/);
  if (weaponMatch) {
    const weaponIndex = weaponMatch[1] ? Number(weaponMatch[1]) : null;
    if (weaponIndex === 1) {
      return { slot: 14 };
    }
    if (weaponIndex === 2) {
      return { slot: 15 };
    }
    if (weaponIndex === 3) {
      return { slot: 16 };
    }
    // Bare "Оружие" / "Оружие-N" — slot inferred after item resolve.
    return { slot: -1 };
  }

  const ringMatch = label.match(/^кольцо\s+(\d+)(?:-(\d+))?$/);
  if (ringMatch) {
    const ringIndex = Number(ringMatch[1]);
    if (ringIndex === 1) {
      return { slot: 10 };
    }
    if (ringIndex === 2) {
      return { slot: 11 };
    }
  }

  const trinketMatch = label.match(/^аксессуар\s+(\d+)(?:-(\d+))?$/);
  if (trinketMatch) {
    const trinketIndex = Number(trinketMatch[1]);
    if (trinketIndex === 1) {
      return { slot: 12 };
    }
    if (trinketIndex === 2) {
      return { slot: 13 };
    }
  }

  const armorMatch = label.match(
    /^(голова|шея|плечо|плащ|грудь|запястья|кисти|пояс|ноги|ступни)(?:\s+(\d+)(?:-(\d+))?)?$/,
  );
  if (armorMatch) {
    const base = ARMOR_SLOT_LABELS[armorMatch[1]];
    if (base !== undefined) {
      return { slot: base };
    }
  }

  return null;
}

function appendSlotItem(slotsByIndex, slot, itemId) {
  const existing = slotsByIndex.get(slot);
  if (!existing) {
    slotsByIndex.set(slot, { slot, itemIds: [itemId] });
    return;
  }
  if (!existing.itemIds.includes(itemId)) {
    existing.itemIds.push(itemId);
  }
}

/** @param {string} className @param {string} spec @param {string[]} listLines */
export function resolveMixListLines(className, spec, listLines) {
  const slotsByIndex = new Map();
  const unknown = [];

  for (const rawLine of listLines) {
    const line = rawLine.replace(/^-\s*/, "").trim();
    if (!line || /^капы:/i.test(line)) {
      continue;
    }

    const rowMatch = line.match(/^([^:]+):\s*(.+)$/);
    if (!rowMatch) {
      continue;
    }

    const slotLabel = rowMatch[1].trim();
    const value = rowMatch[2].trim();
    const parsed = parseMixSlotLabel(slotLabel);
    if (!parsed) {
      unknown.push(slotLabel);
      continue;
    }

    const itemName = stripSourceHints(value);
    if (/^т10(?:\.\d+)?$/i.test(itemName)) {
      if (parsed.slot < 0) {
        unknown.push(`${slotLabel}: ${itemName}`);
        continue;
      }
      const t10Id = t10IdForSlot(className, spec, parsed.slot);
      if (t10Id) {
        appendSlotItem(slotsByIndex, parsed.slot, t10Id);
      } else {
        unknown.push(`${slotLabel}: ${itemName}`);
      }
      continue;
    }

    let slot = parsed.slot;
    const itemIds = findItemIds(
      itemName,
      slot >= 0 ? slot : null,
      value,
    );
    if (!itemIds.length) {
      unknown.push(itemName || value);
      continue;
    }

    const itemId = itemIds[0];
    if (slot < 0) {
      slot = inferBareWeaponSlot(itemId);
    }
    // Guard: Оружие 3 must be ranged when possible; if mis-labeled, still place.
    if (slot === 16 && !isRangedItem(itemId) && parsed.slot === 16) {
      // keep as 16 per explicit label
    }
    appendSlotItem(slotsByIndex, slot, itemId);
  }

  const slots = [...slotsByIndex.values()].sort(
    (left, right) => left.slot - right.slot,
  );
  return { slots, unknown };
}

function parseClassHeading(heading) {
  const text = heading.replace(/^#\s*/, "").trim();
  const english = text.split(/\s*-\s*/)[0]?.trim().toLowerCase() ?? "";
  return CLASS_FROM_HEADING[english] ?? null;
}

function parseSpecHeading(heading) {
  const text = heading.replace(/^##\s*/, "").trim();
  const english = text.split(/\s*-\s*/)[0]?.trim().toLowerCase() ?? "";
  return SPEC_FROM_HEADING[english] ?? null;
}

/**
 * Parse bis-list-mix.md into Kingdom preset entries (one per filled spec).
 * @param {string} markdown
 */
export function parseMixEntries(markdown) {
  const lines = markdown.split(/\r?\n/);
  const entries = [];
  let className = null;
  let spec = null;
  let listLines = [];

  function flush() {
    if (!className || !spec) {
      listLines = [];
      return;
    }
    const itemLines = listLines.filter((line) =>
      /^-\s*[^:]+:\s*.+/.test(line.trim()),
    );
    if (itemLines.length === 0) {
      listLines = [];
      return;
    }
    const { slots, unknown } = resolveMixListLines(
      className,
      spec,
      itemLines,
    );
    if (slots.length === 0) {
      listLines = [];
      return;
    }
    entries.push({
      className,
      spec,
      server: "Kingdom",
      author: "Kingdom",
      url: "local",
      presetName: KINGDOM_PRESET_NAME,
      id: KINGDOM_PRESET_ID,
      displayName: KINGDOM_PRESET_NAME,
      slots,
      unknown,
    });
    listLines = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (/^#\s+[^#]/.test(line)) {
      flush();
      className = parseClassHeading(line);
      spec = null;
      listLines = [];
      continue;
    }
    if (/^##\s+/.test(line)) {
      flush();
      spec = parseSpecHeading(line);
      listLines = [];
      continue;
    }
    if (/^###\s+/.test(line)) {
      // Subsection markers are ignored; items stay under current ## Spec.
      continue;
    }
    if (className && spec) {
      listLines.push(line);
    }
  }
  flush();

  return entries;
}
