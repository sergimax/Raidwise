/**
 * Parse BiS markdown sources and write preset `.ts` files under src/data/bis-presets/.
 * - scripts/bis/bis-list-sources.md — Titans + community
 * - scripts/bis/bis-list-mix.md — Kingdom. With variants (numbered weapons + slot alts)
 *
 * Run: npm run generate:bis-presets
 *
 * Also writes scripts/bis/bis-list-sources-resolved.json and bis-list-mix-resolved.json.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { formatPresetSlots } from "./bis-preset-format.mjs";
import {
  KINGDOM_PRESET_ID,
  parseMixEntries,
} from "./bis-resolve-mix.mjs";
import { isTitansGuildList, resolveTitansListLines } from "./bis-resolve-titans.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "../..");

const namesEn = JSON.parse(
  fs.readFileSync(path.join(rootDir, "src/data/wotlk-item-names.json"), "utf8"),
);
const namesRu = JSON.parse(
  fs.readFileSync(path.join(rootDir, "src/data/wotlk-item-names-ru.json"), "utf8"),
);
const gearSlotsByItemId = JSON.parse(
  fs.readFileSync(path.join(rootDir, "src/data/wotlk-item-gear-slots.json"), "utf8"),
);
const itemLevels = JSON.parse(
  fs.readFileSync(path.join(rootDir, "src/data/wotlk-item-levels.json"), "utf8"),
);

const nameToId = new Map();

function registerName(name, itemId) {
  const key = normalizeName(name);
  const existingId = nameToId.get(key);
  if (existingId === undefined) {
    nameToId.set(key, itemId);
    return;
  }

  const existingLevel = itemLevels[String(existingId)] ?? 0;
  const nextLevel = itemLevels[String(itemId)] ?? 0;
  if (nextLevel >= existingLevel) {
    nameToId.set(key, itemId);
  }
}

for (const [id, name] of Object.entries(namesEn)) {
  registerName(name, Number(id));
}
for (const [id, name] of Object.entries(namesRu)) {
  registerName(name, Number(id));
}

/** Informal / mistyped names from community guides. */
const NAME_ALIASES = {
  "bone sentinels amulet": "Bone Sentinel's Amulet",
  "professors bloodied smock": "Professor's Bloodied Smock",
  "ashen verdict": "Ashen Band of Endless Wisdom",
  "black willow": "Idol of the Black Willow",
  "althors abacus": "Althor's Abacus",
  "val'anyr, hammer of ancient kings": "Val'anyr, Hammer of Ancient Kings",
  "valanyr, hammer of ancient kings": "Val'anyr, Hammer of Ancient Kings",
  "sanguine silk robes": "Sanguine Silk Robes",
  "memory of malygos": "Memory of Malygos",
  "greatcloak of the turned champion": "Greatcloak of the Turned Champion",
  "glowing twilight scale": "Glowing Twilight Scale",
  "sundial of eternal dusk": "Sundial of Eternal Dusk",
  "boots of unnatural growth": "Boots of Unnatural Growth",
  "bracers of fiery night": "Bracers of Fiery Night",
  "верvie местi": "Astrylian's Sutured Cinch",
  [String.fromCharCode(0x0432, 0x0435, 0x0440, 0x0432, 0x0438, 0x0435, 0x0020, 0x043c, 0x0435, 0x0441, 0x0442, 0x0438)]: "Astrylian's Sutured Cinch",
  "перчатки анубарского охотника": "Anub'ar Stalker's Gloves",
  "шнурованный ремень нерубарского ловца": "Nerub'ar Stalker's Cord",
  "амулет костяного часового": "Bone Sentinel's Amulet",
  "теплый плащ обращенного защитника": "Greatcloak of the Turned Champion",
  "окровавленные шелковые одеяния": "Sanguine Silk Robes",
  "рукава акушера смерти": "Death Surgeon's Sleeves",
  "непроходящая болезнь": "Lingering Illness",
  "сапоги исследователя чумы": "Plague Scientist's Boots",
  "перстень постепенной регенерации": "Ring of Phased Regeneration",
  "память малигоса": "Memory of Malygos",
  "избавление от кошмаров": "Nightmare Ender",
  "аркус, большой посох антонидаса": "Archus, Greatstaff of Antonidas",
  "сумеречная чешуя": "Sharpened Twilight Scale",
  "утешение павших": "Solace of the Fallen",
  "прогнивший ошейник прелести": "Precious's Putrid Collar",
  "плащ убийцы мрачного свода": "Shadowvault Slayer's Cloak",
  "поручи полной тени": "Umbrage Armbands",
  "пепельное кольцо бесконечного отмщения": "Ashen Band of Endless Vengeance",
  "кольцо костяного колосса": "Band of the Bone Colossus",
  "заостренная сумеречная чешуя": "Sharpened Twilight Scale",
  "геркумлийский боевой знак": "Herkuml War Token",
  "тотем расколотого льда бизури": "Bizuri's Totem of Shattered Ice",
  "зов хаоса, топор королей лордерона": "Havoc's Call, Blade of Lordaeron Kings",
};

function normalizeName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[''`´'\u2019]/g, "")
    .replace(/\s+/g, " ");
}

function resolveName(rawName) {
  let cleaned = rawName
    .replace(/^\[/, "")
    .replace(/\].*$/, "")
    .replace(/\s*\([^)]*\)\s*$/, "")
    .replace(/\s+-\s+[^-]+?\s+25г\.?\s*$/i, "")
    .replace(/\s*за\b.*$/i, "")
    .replace(/\s*является\b.*$/i, "")
    .trim();

  const alias = NAME_ALIASES[normalizeName(cleaned)];
  if (alias) {
    cleaned = alias;
  }

  const id = nameToId.get(normalizeName(cleaned));
  return { cleaned, id };
}

const T10_BY_CONTEXT = {
  "enh shaman": {
    head: "Sanctified Frost Witch's Faceguard",
    shoulder: "Sanctified Frost Witch's Shoulderguards",
    chest: "Sanctified Frost Witch's Chestguard",
    legs: "Sanctified Frost Witch's War-Kilt",
  },
  "feral druid": {
    head: "Sanctified Lasherweave Headguard",
    shoulder: "Sanctified Lasherweave Shoulderpads",
    chest: "Sanctified Lasherweave Raiment",
    legs: "Sanctified Lasherweave Legguards",
  },
  "restoration druid": {
    head: "Sanctified Lasherweave Cover",
    shoulder: "Sanctified Lasherweave Mantle",
    hands: "Sanctified Lasherweave Gloves",
    legs: "Sanctified Lasherweave Trousers",
  },
  "priest holy": {
    head: "Sanctified Crimson Acolyte Hood",
    shoulder: "Sanctified Crimson Acolyte Shoulderpads",
    hands: "Sanctified Crimson Acolyte Gloves",
    legs: "Sanctified Crimson Acolyte Leggings",
  },
  "rogue subtlety": {
    head: "Sanctified Shadowblade Helmet",
    shoulder: "Sanctified Shadowblade Pauldrons",
    chest: "Sanctified Shadowblade Breastplate",
    hands: "Sanctified Shadowblade Gauntlets",
    legs: "Sanctified Shadowblade Legplates",
  },
  "rogue assassination": {
    head: "Sanctified Shadowblade Helmet",
    shoulder: "Sanctified Shadowblade Pauldrons",
    chest: "Sanctified Shadowblade Breastplate",
    hands: "Sanctified Shadowblade Gauntlets",
    legs: "Sanctified Shadowblade Legplates",
  },
  "warlock destruction": {
    head: "Sanctified Dark Coven Hood",
    shoulder: "Sanctified Dark Coven Shoulderpads",
    chest: "Sanctified Dark Coven Robe",
    hands: "Sanctified Dark Coven Gloves",
    legs: "Sanctified Dark Coven Leggings",
  },
  "warrior arms": {
    head: "Sanctified Ymirjar Lord's Helmet",
    shoulder: "Sanctified Ymirjar Lord's Shoulderplates",
    chest: "Sanctified Ymirjar Lord's Battleplate",
    hands: "Sanctified Ymirjar Lord's Gauntlets",
    legs: "Sanctified Ymirjar Lord's Legplates",
  },
  "warrior protection": {
    shoulder: "Sanctified Ymirjar Lord's Pauldrons",
    chest: "Sanctified Ymirjar Lord's Breastplate",
    hands: "Sanctified Ymirjar Lord's Handguards",
    legs: "Sanctified Ymirjar Lord's Legguards",
  },
  "hunter beast mastery": {
    head: "Sanctified Ahn'Kahar Blood Hunter's Headpiece",
    shoulder: "Sanctified Ahn'Kahar Blood Hunter's Spaulders",
    chest: "Sanctified Ahn'Kahar Blood Hunter's Tunic",
    hands: "Sanctified Ahn'Kahar Blood Hunter's Handguards",
    legs: "Sanctified Ahn'Kahar Blood Hunter's Legguards",
  },
  "hunter survival": {
    head: "Sanctified Ahn'Kahar Blood Hunter's Headpiece",
    shoulder: "Sanctified Ahn'Kahar Blood Hunter's Spaulders",
    chest: "Sanctified Ahn'Kahar Blood Hunter's Tunic",
    hands: "Sanctified Ahn'Kahar Blood Hunter's Handguards",
    legs: "Sanctified Ahn'Kahar Blood Hunter's Legguards",
  },
  "mage frost": {
    head: "Sanctified Bloodmage Hood",
    shoulder: "Sanctified Bloodmage Shoulderpads",
    chest: "Sanctified Bloodmage Robe",
    hands: "Sanctified Bloodmage Gloves",
    legs: "Sanctified Bloodmage Leggings",
  },
};

const SLOT_LABEL_ALIASES = {
  helmet: "head",
  gloves: "hands",
  leggings: "legs",
  leggs: "legs",
  wand: "ranged",
  shield: "off hand",
  "off-hand": "off hand",
  "main-hand": "main hand",
  "main hand weapon": "main hand",
  "two hand weapon": "main hand",
  "two-hand weapon": "main hand",
  "melee weapon": "main hand",
  "ranged weapon": "ranged",
  жезл: "ranged",
  ступни: "feet",
  кольцо: "ring",
};

const SLOT_LABELS = {
  head: 0,
  helm: 0,
  helmet: 0,
  голова: 0,
  neck: 1,
  шея: 1,
  shoulder: 2,
  shoulders: 2,
  плечо: 2,
  плечи: 2,
  back: 3,
  cloak: 3,
  спина: 3,
  плащ: 3,
  chest: 4,
  грудь: 4,
  wrist: 5,
  wrists: 5,
  bracers: 5,
  запясть: 5,
  запястye: 5,
  запястья: 5,
  "запястья": 5,
  наручи: 5,
  hands: 6,
  hand: 6,
  gloves: 6,
  перчатки: 6,
  руки: 6,
  waist: 7,
  belt: 7,
  пояс: 7,
  legs: 8,
  leg: 8,
  leggs: 8,
  leggings: 8,
  ноги: 8,
  feet: 9,
  foot: 9,
  boots: 9,
  ботинки: 9,
  ступни: 9,
  "ring 1": 10,
  "ring-1": 10,
  "ring1": 10,
  "кольцо 1": 10,
  "ring 2": 11,
  "ring-2": 11,
  "ring2": 11,
  "кольцо 2": 11,
  "trinket 1": 12,
  "trinket-1": 12,
  "trinket1": 12,
  тринкет: 12,
  трынкет: 12,
  "trinket 2": 13,
  "trinket-2": 13,
  "trinket2": 13,
  weapon: 14,
  "main hand": 14,
  оружие: 14,
  "off hand": 15,
  ranged: 16,
  wand: 16,
  relic: 16,
  idol: 16,
  totem: 16,
  тотем: 16,
  shield: 15,
};

const FLEXIBLE_SLOT_GROUPS = [
  [10, 11],
  [12, 13],
  [14, 15],
];

function nextFlexibleSlot(validSlots, usedSlots) {
  for (const group of FLEXIBLE_SLOT_GROUPS) {
    const matching = group.filter((slot) => validSlots.includes(slot));
    if (matching.length === 0) {
      continue;
    }
    const available = matching.find((slot) => !usedSlots.has(slot));
    if (available !== undefined) {
      return available;
    }
  }

  return validSlots.find((slot) => !usedSlots.has(slot));
}

function inferGearSlot(itemId, usedSlots) {
  const validSlots = gearSlotsByItemId[String(itemId)];
  if (!Array.isArray(validSlots) || validSlots.length === 0) {
    return undefined;
  }

  if (validSlots.length === 1) {
    return validSlots[0];
  }

  return nextFlexibleSlot(validSlots, usedSlots);
}

const CLASS_BY_HEADING = {
  priest: "Priest",
  rogue: "Rogue",
  warlock: "Warlock",
  warrior: "Warrior",
  hunter: "Hunter",
  mage: "Mage",
  druid: "Druid",
  shaman: "Shaman",
  paladin: "Paladin",
  "death knight": "Death Knight",
};

function parseHeading(heading) {
  const text = heading.replace(/^#\s*/, "").trim();
  const lower = text.toLowerCase();
  if (lower.includes("unholy") && lower.includes("dk")) {
    return { className: "Death Knight", spec: "Unholy", context: "unholy dk" };
  }
  if (lower.includes("enh") && lower.includes("shaman")) {
    return { className: "Shaman", spec: "Enhancement", context: "enh shaman" };
  }
  if (lower.includes("feral") && lower.includes("druid")) {
    return { className: "Druid", spec: "Feral", context: "feral druid" };
  }
  if ((lower.includes("restoration") || lower.includes("resto")) && lower.includes("druid")) {
    return { className: "Druid", spec: "Restoration", context: "restoration druid" };
  }

  const dashIndex = text.indexOf(" - ");
  if (dashIndex !== -1) {
    const classPart = text.slice(0, dashIndex).trim().toLowerCase();
    const specPart = text.slice(dashIndex + 3).trim();
    const className = CLASS_BY_HEADING[classPart];
    if (className && specPart) {
      return {
        className,
        spec: specPart,
        context: `${className.toLowerCase()} ${specPart.toLowerCase()}`,
      };
    }
  }

  throw new Error(`Unknown heading: ${heading}`);
}

function parseSubHeading(line) {
  const text = line.replace(/^##\s*/, "").trim();
  const urlMatch = text.match(/(https?:\/\/\S+)\s*$/);
  const url = urlMatch ? urlMatch[1] : undefined;
  const rest = urlMatch
    ? text.slice(0, text.length - url.length).replace(/\s+-\s*$/, "")
    : text;
  const parts = rest.split(" - ").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 3) {
    return null;
  }

  return {
    server: parts[0],
    author: parts[1],
    presetName: parts.slice(2).join(" - "),
    url: url ?? "local",
  };
}

function normalizeListLine(line) {
  return line.replace(/^-\s*/, "").trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function splitLabelValue(line) {
  const colonMatch = line.match(/^(.+?)\s*:\s*(.+)$/);
  if (colonMatch) {
    return { label: colonMatch[1].trim().toLowerCase(), value: colonMatch[2].trim() };
  }

  const match = line.match(/^(.+?)\s+-\s+(.+)$/);
  if (!match) {
    return null;
  }
  return { label: match[1].trim().toLowerCase(), value: match[2].trim() };
}

function resolveSlotLabel(label, usedSlots) {
  let normalized = label.replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();
  if (normalized.startsWith("тринкет") || normalized.startsWith("трынкет")) {
    normalized = normalized.includes("2") ? "trinket 2" : "trinket 1";
  }
  if (normalized.startsWith("аксессуар")) {
    normalized = normalized.includes("2") ? "trinket 2" : "trinket 1";
  }

  const aliased = SLOT_LABEL_ALIASES[normalized] ?? normalized;
  if (aliased === "ring") {
    return nextFlexibleSlot([10, 11], usedSlots);
  }

  let slot = SLOT_LABELS[aliased];
  if (slot === undefined && aliased.startsWith("зап")) {
    slot = 5;
  }
  return slot;
}

function parseLabeledLine(line, context, usedSlots) {
  const split = splitLabelValue(line);
  if (!split) {
    return null;
  }

  let { label, value } = split;
  const slot = resolveSlotLabel(label, usedSlots);
  if (slot === undefined) {
    return null;
  }

  if (/т10(?:\.\d+)?|t10(?:\.\d+)?/i.test(value)) {
    const bracket = value.match(/\[(.+?)\]/);
    if (bracket) {
      value = bracket[1];
    } else {
      const t10 = T10_BY_CONTEXT[context];
      const slotKey =
        slot === 0
          ? "head"
          : slot === 2
            ? "shoulder"
            : slot === 4
              ? "chest"
              : slot === 6
                ? "hands"
                : slot === 8
                  ? "legs"
                  : undefined;
      if (slotKey && t10?.[slotKey]) {
        value = t10[slotKey];
      }
    }
  }

  if (/х2|x2|\bx2\b/i.test(value)) {
    value = value.replace(/\s*х2\s*$/i, "").replace(/\s*x2\s*$/i, "").trim();
    const { cleaned, id } = resolveName(value);
    return { slot, itemNames: [cleaned], itemIds: id ? [id, id] : [], dualWield: true };
  }

  const parts = value.split(/\s*,\s*OR\s+|\s+OR\s+|\s+или\s+/i);
  const itemNames = [];
  const itemIds = [];
  for (const part of parts) {
    const { cleaned, id } = resolveName(part);
    itemNames.push(cleaned);
    if (id) {
      itemIds.push(id);
    }
  }

  return { slot, itemNames, itemIds };
}

function parsePresetItems(listLines, context) {
  const slots = new Map();
  const usedSlots = new Set();
  const unknown = [];
  let isRestoTierBlock = false;

  function assignSlot(slot, itemIds, itemNames) {
    if (itemIds.length === 0) {
      unknown.push(...itemNames);
      return;
    }
    slots.set(slot, { itemIds, itemNames });
    usedSlots.add(slot);
  }

  function assignPlainItem(itemNames, itemIds) {
    if (itemIds.length === 0) {
      unknown.push(...itemNames);
      return;
    }

    if (itemIds.length === 2 && itemIds[0] === itemIds[1]) {
      assignSlot(14, [itemIds[0]], [itemNames[0]]);
      assignSlot(15, [itemIds[1]], [itemNames[1] ?? itemNames[0]]);
      return;
    }

    for (let index = 0; index < itemIds.length; index += 1) {
      const itemId = itemIds[index];
      const slot = inferGearSlot(itemId, usedSlots);
      if (slot === undefined) {
        unknown.push(itemNames[index] ?? String(itemId));
        continue;
      }
      const existing = slots.get(slot);
      if (existing) {
        assignSlot(slot, [...new Set([...existing.itemIds, itemId])], [
          ...existing.itemNames,
          itemNames[index],
        ]);
      } else {
        assignSlot(slot, [itemId], [itemNames[index]]);
      }
    }
  }

  for (const rawLine of listLines) {
    const line = normalizeListLine(rawLine);
    if (!line || /^note:/i.test(line) || /^<!--/.test(line)) {
      continue;
    }

    if (/^tier 10/i.test(line)) {
      isRestoTierBlock = true;
      continue;
    }
    if (/^non tier/i.test(line)) {
      isRestoTierBlock = false;
      continue;
    }

    if (isRestoTierBlock) {
      const slotKey = line.toLowerCase();
      const t10 = T10_BY_CONTEXT[context];
      const slot =
        slotKey === "head"
          ? 0
          : slotKey === "shoulders"
            ? 2
            : slotKey === "hands"
              ? 6
              : slotKey === "legs"
                ? 8
                : undefined;
      if (slot !== undefined && t10) {
        const pieceKey =
          slot === 0 ? "head" : slot === 2 ? "shoulder" : slot === 6 ? "hands" : "legs";
        const { cleaned, id } = resolveName(t10[pieceKey]);
        if (id) {
          assignSlot(slot, [id], [cleaned]);
        } else {
          unknown.push(t10[pieceKey]);
        }
      }
      continue;
    }

    const labeled = parseLabeledLine(line, context, usedSlots);
    if (labeled) {
      if (labeled.dualWield && labeled.itemIds.length === 1) {
        assignSlot(14, [labeled.itemIds[0]], [labeled.itemNames[0]]);
        assignSlot(15, [labeled.itemIds[0]], [labeled.itemNames[0]]);
      } else if (labeled.itemIds.length > 0) {
        assignSlot(labeled.slot, labeled.itemIds, labeled.itemNames);
      } else {
        unknown.push(...labeled.itemNames);
      }
      continue;
    }

    const plainMatch = line.match(/^(.+?)\s+OR\s+(.+)$/i);
    if (plainMatch) {
      const itemIds = [];
      const itemNames = [];
      for (const part of [plainMatch[1], plainMatch[2]]) {
        const { cleaned, id } = resolveName(part.replace(/^[^:]+:\s*/, ""));
        itemNames.push(cleaned);
        if (id) {
          itemIds.push(id);
        }
      }
      if (itemIds.length > 0) {
        const slot = inferGearSlot(itemIds[0], usedSlots);
        if (slot !== undefined) {
          assignSlot(slot, itemIds, itemNames);
        } else {
          unknown.push(...itemNames);
        }
      } else {
        unknown.push(...itemNames);
      }
      continue;
    }

    const { cleaned, id } = resolveName(line.replace(/^[^:]+:\s*/, ""));
    assignPlainItem([cleaned], id ? [id] : []);
  }

  return {
    slots: [...slots.entries()]
      .sort(([left], [right]) => left - right)
      .map(([slot, data]) => ({ slot, ...data })),
    unknown,
  };
}

function buildEntry({ className, spec, server, author, url, presetName, listLines, context }) {
  if (isTitansGuildList(server, presetName)) {
    const { slots, unknown } = resolveTitansListLines(className, spec, listLines);
    return {
      className,
      spec,
      server,
      author,
      url,
      presetName,
      id: "titans",
      displayName: "Titans",
      slots,
      unknown,
    };
  }

  const { slots, unknown } = parsePresetItems(listLines, context);
  return {
    className,
    spec,
    server,
    author,
    url,
    presetName,
    id: slugify(`${server}-${author}-${presetName}`),
    displayName: `${presetName} (${server} · ${author})`,
    slots,
    unknown,
  };
}

function parseEntries(markdown) {
  const sections = markdown.split(/\n(?=# [^#])/);
  const entries = [];

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed.startsWith("# ")) {
      continue;
    }

    const firstNewline = trimmed.indexOf("\n");
    const heading = firstNewline === -1 ? trimmed : trimmed.slice(0, firstNewline);
    const body = firstNewline === -1 ? "" : trimmed.slice(firstNewline + 1);
    const { className, spec, context } = parseHeading(heading);

    if (/^##\s/.test(body.trim()) || body.includes("\n## ")) {
      const subBlocks = body.split(/\n(?=## )/);
      for (const subBlock of subBlocks) {
        const subLines = subBlock.split("\n").map((line) => line.trim()).filter(Boolean);
        if (subLines.length === 0) {
          continue;
        }
        const meta = parseSubHeading(subLines[0]);
        if (!meta) {
          continue;
        }
        entries.push(
          buildEntry({
            className,
            spec,
            context,
            server: meta.server,
            author: meta.author,
            url: meta.url,
            presetName: meta.presetName,
            listLines: subLines.slice(1),
          }),
        );
      }
      continue;
    }

    const lines = body.split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines.length < 5) {
      continue;
    }

    const [server, author, url, presetName, ...listLines] = lines;
    entries.push(
      buildEntry({
        className,
        spec,
        context,
        server,
        author,
        url,
        presetName,
        listLines,
      }),
    );
  }

  return entries;
}

const markdown = fs.readFileSync(path.join(__dirname, "bis-list-sources.md"), "utf8");
const entries = parseEntries(markdown);

for (const entry of entries) {
  console.log("\n===", entry.className, entry.spec, entry.displayName, "===");
  if (entry.unknown.length > 0) {
    console.log("UNKNOWN:", entry.unknown);
  }
  for (const slot of entry.slots) {
    const names = slot.itemNames?.join(" / ") ?? "";
    console.log(`  ${slot.slot}: [${slot.itemIds.join(", ")}]${names ? ` ${names}` : ""}`);
  }
}

fs.writeFileSync(
  path.join(__dirname, "bis-list-sources-resolved.json"),
  `${JSON.stringify(entries, null, 2)}\n`,
);
console.log("\nWrote scripts/bis/bis-list-sources-resolved.json");

const CLASS_ENUM = {
  "Death Knight": "ClassName.DeathKnight",
  Druid: "ClassName.Druid",
  Shaman: "ClassName.Shaman",
  Priest: "ClassName.Priest",
  Rogue: "ClassName.Rogue",
  Warlock: "ClassName.Warlock",
  Warrior: "ClassName.Warrior",
  Hunter: "ClassName.Hunter",
  Mage: "ClassName.Mage",
  Paladin: "ClassName.Paladin",
};

const SPEC_OUTPUT = {
  "Warrior|Fury": {
    fileName: "fury-warrior.ts",
    exportName: "furyWarriorBis",
    comment: "Fury Warrior",
  },
  "Warrior|Arms": {
    fileName: "arms-warrior.ts",
    exportName: "armsWarriorBis",
    comment: "Arms Warrior",
  },
  "Warrior|Protection": {
    fileName: "protection-warrior.ts",
    exportName: "protectionWarriorBis",
    comment: "Protection Warrior",
  },
  "Druid|Feral": {
    fileName: "feral-druid.ts",
    exportName: "feralDruidBis",
    comment: "Feral Druid",
  },
  "Druid|Balance": {
    fileName: "balance-druid.ts",
    exportName: "balanceDruidBis",
    comment: "Balance Druid",
  },
  "Druid|Restoration": {
    fileName: "restoration-druid.ts",
    exportName: "restorationDruidBis",
    comment: "Restoration Druid",
  },
  "Priest|Holy": {
    fileName: "holy-priest.ts",
    exportName: "holyPriestBis",
    comment: "Holy Priest",
  },
  "Priest|Shadow": {
    fileName: "shadow-priest.ts",
    exportName: "shadowPriestBis",
    comment: "Shadow Priest",
  },
  "Priest|Discipline": {
    fileName: "discipline-priest.ts",
    exportName: "disciplinePriestBis",
    comment: "Discipline Priest",
  },
  "Mage|Arcane": {
    fileName: "arcane-mage.ts",
    exportName: "arcaneMageBis",
    comment: "Arcane Mage",
  },
  "Mage|Fire": {
    fileName: "fire-mage.ts",
    exportName: "fireMageBis",
    comment: "Fire Mage",
  },
  "Mage|Frost": {
    fileName: "frost-mage.ts",
    exportName: "frostMageBis",
    comment: "Frost Mage",
  },
  "Hunter|Marksmanship": {
    fileName: "marksmanship-hunter.ts",
    exportName: "marksmanshipHunterBis",
    comment: "Marksmanship Hunter",
  },
  "Hunter|Beast Mastery": {
    fileName: "beast-mastery-hunter.ts",
    exportName: "beastMasteryHunterBis",
    comment: "Beast Mastery Hunter",
  },
  "Hunter|Survival": {
    fileName: "survival-hunter.ts",
    exportName: "survivalHunterBis",
    comment: "Survival Hunter",
  },
  "Paladin|Retribution": {
    fileName: "retribution-paladin.ts",
    exportName: "retributionPaladinBis",
    comment: "Retribution Paladin",
  },
  "Paladin|Protection": {
    fileName: "protection-paladin.ts",
    exportName: "protectionPaladinBis",
    comment: "Protection Paladin",
  },
  "Paladin|Holy": {
    fileName: "holy-paladin.ts",
    exportName: "holyPaladinBis",
    comment: "Holy Paladin",
  },
  "Rogue|Combat": {
    fileName: "combat-rogue.ts",
    exportName: "combatRogueBis",
    comment: "Combat Rogue",
  },
  "Rogue|Subtlety": {
    fileName: "subtlety-rogue.ts",
    exportName: "subtletyRogueBis",
    comment: "Subtlety Rogue",
  },
  "Rogue|Assassination": {
    fileName: "assassination-rogue.ts",
    exportName: "assassinationRogueBis",
    comment: "Assassination Rogue",
  },
  "Death Knight|Blood": {
    fileName: "blood-death-knight.ts",
    exportName: "bloodDeathKnightBis",
    comment: "Blood Death Knight",
  },
  "Death Knight|Unholy": {
    fileName: "unholy-death-knight.ts",
    exportName: "unholyDeathKnightBis",
    comment: "Unholy Death Knight",
  },
  "Death Knight|Frost": {
    fileName: "frost-death-knight.ts",
    exportName: "frostDeathKnightBis",
    comment: "Frost Death Knight",
  },
  "Warlock|Affliction": {
    fileName: "affliction-warlock.ts",
    exportName: "afflictionWarlockBis",
    comment: "Affliction Warlock",
  },
  "Warlock|Demonology": {
    fileName: "demonology-warlock.ts",
    exportName: "demonologyWarlockBis",
    comment: "Demonology Warlock",
  },
  "Warlock|Destruction": {
    fileName: "destruction-warlock.ts",
    exportName: "destructionWarlockBis",
    comment: "Destruction Warlock",
  },
  "Shaman|Elemental": {
    fileName: "elemental-shaman.ts",
    exportName: "elementalShamanBis",
    comment: "Elemental Shaman",
  },
  "Shaman|Enhancement": {
    fileName: "enhancement-shaman.ts",
    exportName: "enhancementShamanBis",
    comment: "Enhancement Shaman",
  },
  "Shaman|Restoration": {
    fileName: "restoration-shaman.ts",
    exportName: "restorationShamanBis",
    comment: "Restoration Shaman",
  },
};

function normalizePresetSlots(slots) {
  const slotMap = new Map(slots.map((entry) => [entry.slot, [...entry.itemIds]]));

  const mainHand = slotMap.get(14);
  if (
    mainHand?.length === 2 &&
    mainHand[0] === mainHand[1] &&
    !slotMap.has(15)
  ) {
    slotMap.set(14, [mainHand[0]]);
    slotMap.set(15, [mainHand[1]]);
  }

  return [...slotMap.entries()]
    .sort(([leftSlot], [rightSlot]) => leftSlot - rightSlot)
    .map(([slot, itemIds]) => ({ slot, itemIds: [...new Set(itemIds)] }));
}

function formatPresetBlock(entry) {
  const slots = normalizePresetSlots(entry.slots);
  const slotLines = formatPresetSlots(slots);

  return `    {
      id: "${entry.id}",
      name: ${JSON.stringify(entry.displayName)},
      slots: [
${slotLines}
      ],
    }`;
}

function sortSpecEntries(specEntries) {
  return [...specEntries].sort((left, right) => {
    if (left.id === KINGDOM_PRESET_ID) return -1;
    if (right.id === KINGDOM_PRESET_ID) return 1;
    if (left.id === "titans") return -1;
    if (right.id === "titans") return 1;
    return left.displayName.localeCompare(right.displayName);
  });
}

const mixMarkdown = fs.readFileSync(
  path.join(__dirname, "bis-list-mix.md"),
  "utf8",
);
const mixEntries = parseMixEntries(mixMarkdown);

for (const entry of mixEntries) {
  console.log("\n=== MIX", entry.className, entry.spec, entry.displayName, "===");
  if (entry.unknown.length > 0) {
    console.log("UNKNOWN:", entry.unknown);
  }
  for (const slot of entry.slots) {
    console.log(`  ${slot.slot}: [${slot.itemIds.join(", ")}]`);
  }
}

fs.writeFileSync(
  path.join(__dirname, "bis-list-mix-resolved.json"),
  `${JSON.stringify(mixEntries, null, 2)}\n`,
);
console.log("\nWrote scripts/bis/bis-list-mix-resolved.json");

const allEntries = [...entries, ...mixEntries];

const grouped = new Map();
for (const entry of allEntries) {
  const key = `${entry.className}|${entry.spec}`;
  if (!grouped.has(key)) {
    grouped.set(key, []);
  }
  grouped.get(key).push(entry);
}

const presetDir = path.join(rootDir, "src/data/bis-presets");

for (const [key, specEntries] of grouped.entries()) {
  const meta = SPEC_OUTPUT[key];
  if (!meta) {
    throw new Error(`Missing SPEC_OUTPUT for ${key}`);
  }

  const [className, spec] = key.split("|");
  const orderedEntries = sortSpecEntries(specEntries);
  const presetBlocks = orderedEntries.map(formatPresetBlock).join(",\n");
  const sourceLines = orderedEntries
    .filter((entry) => entry.url !== "local")
    .map((entry) => ` * @see ${entry.url}`)
    .join("\n");
  const sourceComment = sourceLines.length > 0 ? `${sourceLines}\n` : "";

  const fileContents = `import { ClassName } from "../../types/characters.ts";
import type { BuiltInSpecBis } from "../../types/bis-lists.ts";

/**
 * WotLK BiS presets for ${meta.comment}.
${sourceComment} */
export const ${meta.exportName}: BuiltInSpecBis = {
  className: ${CLASS_ENUM[className]},
  spec: ${JSON.stringify(spec)},
  presets: [
${presetBlocks},
  ],
};
`;

  fs.writeFileSync(path.join(presetDir, meta.fileName), fileContents);
  console.log(`Wrote src/data/bis-presets/${meta.fileName}`);
}
