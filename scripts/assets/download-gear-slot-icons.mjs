/**
 * Download WoW paper doll empty-slot icons from the vanilla UI texture mirror.
 *
 * Usage: node scripts/download-gear-slot-icons.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outDir = path.join(rootDir, "src/assets/gear-slot-icons");

const VANILLA_BASE =
  "https://raw.githubusercontent.com/doorknob6/vanilla-wow-interface-textures/master/Interface/PaperDoll";

/** Output file name -> vanilla texture file name */
const VANILLA_ICONS = {
  head: "UI-PaperDoll-Slot-Head.png",
  neck: "UI-PaperDoll-Slot-Neck.png",
  shoulder: "UI-PaperDoll-Slot-Shoulder.png",
  chest: "UI-PaperDoll-Slot-Chest.png",
  wrist: "UI-PaperDoll-Slot-Wrists.png",
  hands: "UI-PaperDoll-Slot-Hands.png",
  waist: "UI-PaperDoll-Slot-Waist.png",
  legs: "UI-PaperDoll-Slot-Legs.png",
  feet: "UI-PaperDoll-Slot-Feet.png",
  finger: "UI-PaperDoll-Slot-Finger.png",
  trinket: "UI-PaperDoll-Slot-Trinket.png",
  "main-hand": "UI-PaperDoll-Slot-MainHand.png",
  "off-hand": "UI-PaperDoll-Slot-SecondaryHand.png",
  ranged: "UI-PaperDoll-Slot-Ranged.png",
  shirt: "UI-PaperDoll-Slot-Shirt.png",
  tabard: "UI-PaperDoll-Slot-Tabard.png",
};

async function downloadFile(url, destinationPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(destinationPath, buffer);
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });

  for (const [outputName, textureName] of Object.entries(VANILLA_ICONS)) {
    const destinationPath = path.join(outDir, `${outputName}.png`);
    const url = `${VANILLA_BASE}/${textureName}`;
    await downloadFile(url, destinationPath);
    console.log(`Wrote ${path.relative(rootDir, destinationPath)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
