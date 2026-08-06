/** Shared slot-line formatting for built-in BiS preset TypeScript files. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

export const GEAR_SLOT_NAMES = [
  "Head",
  "Neck",
  "Shoulder",
  "Back",
  "Chest",
  "Wrist",
  "Hands",
  "Waist",
  "Legs",
  "Feet",
  "Finger 1",
  "Finger 2",
  "Trinket 1",
  "Trinket 2",
  "Main hand",
  "Off hand",
  "Ranged",
];

let cachedNamesEn = null;

export function loadItemNamesEn() {
  if (cachedNamesEn) return cachedNamesEn;
  cachedNamesEn = JSON.parse(
    fs.readFileSync(
      path.join(rootDir, "src/data/wotlk-item-names.json"),
      "utf8",
    ),
  );
  return cachedNamesEn;
}

export function itemName(itemId, namesEn = loadItemNamesEn()) {
  return namesEn[String(itemId)] ?? `Unknown (${itemId})`;
}

export function formatSlotLine(slot, itemIds, namesEn = loadItemNamesEn()) {
  const slotLabel = GEAR_SLOT_NAMES[slot] ?? `Slot ${slot}`;
  const itemLabels = itemIds.map((itemId) => itemName(itemId, namesEn)).join(" / ");
  return `        { slot: ${slot}, itemIds: [${itemIds.join(", ")}] }, // ${slotLabel}: ${itemLabels}`;
}

export function formatPresetSlots(slots, namesEn = loadItemNamesEn()) {
  return slots
    .map((entry) => formatSlotLine(entry.slot, entry.itemIds, namesEn))
    .join("\n");
}

/** Replace or add trailing comments on `{ slot, itemIds }` lines in preset source. */
export function commentPresetSource(source, namesEn = loadItemNamesEn()) {
  return source.replace(
    /^(\s*\{ slot: (\d+), itemIds: \[([^\]]+)\] \},?)(?: \/\/.*)?$/gm,
    (_match, _line, slot, ids) => {
      const itemIds = ids.split(",").map((part) => Number(part.trim()));
      return formatSlotLine(Number(slot), itemIds, namesEn);
    },
  );
}
