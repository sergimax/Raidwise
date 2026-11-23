import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { formatPresetSlots } from "./bis-preset-format.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(scriptDir, "../../src/data");
const readItems = (file) =>
  JSON.parse(fs.readFileSync(path.join(dataDir, `wotlk-item-${file}.json`), "utf8"));

const buildsByClass = {
  DK: {
    "ФРОСТ (РПБ)": ["Frost", "frost-arp", "Armor penetration"],
    "ФРОСТ (СИЛА)": ["Frost", "frost-strength", "Strength"],
    "АНХОЛИ С ШМ (2h)": ["Unholy", "unholy-shadowmourne", "Shadowmourne (2H)"],
    "АНХОЛИ МОРБ (БЕЗ ШМа, 1h)": ["Unholy", "unholy-morbidity", "Morbidity (1H)"],
    "БЛАД ДПС С ШМ": ["Blood", "blood-dps-shadowmourne", "DPS with Shadowmourne"],
    "БЛАД ДПС (БЕЗ ШМа)": ["Blood", "blood-dps", "DPS without Shadowmourne"],
    "БЛАД ТАНК": ["Blood", "blood-tank", "Tank"],
    "БЛАД ТАНК ТРИТ СЕТ": ["Blood", "blood-threat", "Threat set"],
  },
  Paladin: {
    ХОЛИ: ["Holy", "holy"],
    "РЕТРИК (С ШМ)": ["Retribution", "ret-shadowmourne", "With Shadowmourne"],
    "РЕТРИК (БЕЗ ШМа)": ["Retribution", "ret", "Without Shadowmourne"],
    ПРОТ: ["Protection", "prot", "Tank"],
    "ПРОТ ТРИТ СЕТ": ["Protection", "prot-threat", "Threat set"],
  },
  Warrior: {
    ФУРИ: ["Fury", "fury-shadowmourne", "With Shadowmourne"],
    "ФУРИ (БЕЗ ШМа)": ["Fury", "fury", "Without Shadowmourne"],
    "АРМС (С ШМ)": ["Arms", "arms", "With Shadowmourne"],
    ПРОТ: ["Protection", "prot"],
  },
  Shaman: {
    ЭЛЕМ: ["Elemental", "ele"],
    РЕСТОР: ["Restoration", "resto"],
    "ЭНХ СПД": ["Enhancement", "enh-spell", "Spell power"],
    "ЭНХ ФИЗ": ["Enhancement", "enh-physical", "Physical"],
  },
  Hunter: {
    ММ: ["Marksmanship", "mm"],
    СУРВ: ["Survival", "survival"],
    БМ: ["Beast Mastery", "bm"],
  },
  Druid: {
    КОТ: ["Feral", "cat", "Cat"],
    МЕДВЕДЬ: ["Feral", "bear", "Bear"],
    СОВА: ["Balance", "balance"],
    РЕСТОР: ["Restoration", "resto"],
  },
  Rogue: {
    КОМБАТ: ["Combat", "combat"],
    МУТИ: ["Assassination", "assa"],
  },
  Priest: {
    ШП: ["Shadow", "shadow"],
    "ДЦ ВАРИАНТ 1": ["Discipline", "disc-1", "Variant 1"],
    "ДЦ ВАРИАНТ 2": ["Discipline", "disc-2", "Variant 2"],
    ХОЛИ: ["Holy", "holy"],
  },
  Mage: {
    "ФАЕР ToTW": ["Fire", "fire-totw", "Torment the Weak"],
    АРКАН: ["Arcane", "arcane"],
  },
  Warlock: {
    ДЕМОН: ["Demonology", "demo", "Standard"],
    "ДЕМОН ФУЛ САППОРТ": ["Demonology", "demo-support", "Full support"],
    "АФЛИК ВАРИАНТ 1": ["Affliction", "affli-1", "Variant 1"],
    "АФЛИК ВАРИАНТ 2": ["Affliction", "affli-2", "Variant 2"],
    ДЕСТРИК: ["Destruction", "destro"],
  },
};

const normalizeName = (name) => name.toLowerCase().replaceAll("ё", "е");

export function generateEmityPresets() {
  const levels = readItems("levels");
  const gearSlots = readItems("gear-slots");
  const equipProps = readItems("equip-props");
  const idsByName = new Map();
  for (const [id, name] of Object.entries(readItems("names-ru"))) {
    const key = normalizeName(name);
    const ids = idsByName.get(key) ?? [];
    ids.push(Number(id));
    idsByName.set(key, ids);
  }

  const markdown = fs.readFileSync(path.join(scriptDir, "bis-lists-emity.md"), "utf8");
  const groups = new Map();
  const seen = new Set();
  for (const classSection of markdown.split(/^# /m).slice(1)) {
    const [header, ...sections] = classSection.split(/^## /m);
    const sourceClass = header.split("\n")[0].trim();
    const className = sourceClass === "DK" ? "DeathKnight" : sourceClass;
    const columns = [
      ...Array.from({ length: 15 }, (_, slot) => slot),
      ...(header.includes("Альтернатива МХ") ? [14] : []),
      15,
      16,
    ];
    for (const section of sections) {
      const [title, ...lines] = section.trim().split(/\r?\n/).map((line) => line.trim());
      const context = `${sourceClass} / ${title}`;
      const build = buildsByClass[sourceClass]?.[title];
      if (!build || seen.has(context)) throw new Error(`Unexpected Emity build: ${context}`);
      seen.add(context);

      const [spec, slug, variant] = build;
      if (lines[0] === title) lines.shift();
      const [phase, ...rows] = lines;
      if (!/^фаза 5 /i.test(phase) || rows.length !== columns.length * 2) {
        throw new Error(`Unexpected Emity layout: ${context}`);
      }

      const slots = new Map();
      for (const [index, declaredSlot] of columns.entries()) {
        const [name, source] = rows.slice(index * 2, index * 2 + 2);
        if (name === "-" && !source) continue;
        if (!name || !source) throw new Error(`Missing item or source: ${context}, column ${index + 1}`);

        // The two protection lists put their shield in the main-hand alternative column.
        const slot =
          className === "Paladin" && spec === "Protection" &&
          index === 15 && name === "Мерзлая стена ледяной цитадели" ? 15 : declaredSlot;
        const itemIds = slots.get(slot) ?? new Set();
        for (const item of name.split(" / ")) {
          const candidates = (idsByName.get(normalizeName(item)) ?? []).filter(
            (id) => gearSlots[id]?.includes(slot) ||
              (spec === "Fury" && slot === 15 && equipProps[id]?.h === 4),
          );
          // Phase 5 lists use the highest available item level for the named item.
          candidates.sort((left, right) => levels[right] - levels[left]);
          const [id, other] = candidates;
          if (!id || (other && levels[id] === levels[other])) {
            throw new Error(`Unresolved item: ${context}, slot ${slot}, ${item} (${source})`);
          }
          itemIds.add(id);
        }
        slots.set(slot, itemIds);
      }

      const key = `${className}|${spec}`;
      const presets = groups.get(key) ?? [];
      const name = variant ? `Emity · ${variant}` : "Emity";
      const presetSlots = [...slots].sort(([left], [right]) => left - right)
        .map(([slot, ids]) => ({ slot, itemIds: [...ids] }));
      presets.push(`    {
      id: ${JSON.stringify(`emity-${sourceClass.toLowerCase()}-${slug}`)},
      name: ${JSON.stringify(name)},
      slots: [
${formatPresetSlots(presetSlots)}
      ],
    },`);
      groups.set(key, presets);
    }
  }

  const expectedCount = Object.values(buildsByClass).reduce(
    (count, builds) => count + Object.keys(builds).length, 0,
  );
  if (seen.size !== expectedCount) throw new Error("Missing Emity builds");

  const blocks = [...groups].map(([key, presets]) => {
    const [className, spec] = key.split("|");
    return `  [\`\${ClassName.${className}}|${spec}\`]: [
${presets.join("\n")}
  ],`;
  });
  fs.writeFileSync(path.join(dataDir, "bis-presets/emity.ts"), `// Generated from scripts/bis/bis-lists-emity.md.
import { ClassName } from "../../types/characters.ts";
import type { BisListPreset } from "../../types/bis-lists.ts";

export const emityPresets: Partial<Record<string, BisListPreset[]>> = {
${blocks.join("\n")}
};
`);
}
