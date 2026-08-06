/**
 * Download WotLK raid icons from the WoW UI texture mirror (Gobomo/wow-ui-icons).
 *
 * Icons match in-game achievement / LFG raid artwork (see raid-icons.ts).
 *
 * Usage: node scripts/download-raid-icons.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outDir = path.join(rootDir, "src/assets/raid-icons");

const TEXTURE_BASE =
  "https://raw.githubusercontent.com/Gobomo/wow-ui-icons/live/ICONS";

/** Output file stem (kebab-case) -> texture file name on the mirror. */
const RAID_ICON_SOURCES = {
  naxxramas: "Achievement_Dungeon_Naxxramas.PNG",
  "obsidian-sanctum": "Achievement_Dungeon_CoABlackDragonflight.PNG",
  "onyxias-lair": "Achievement_Boss_Onyxia.PNG",
  "vault-of-archavon": "ACHIEVEMENT_WIN_WINTERGRASP.PNG",
  "trial-of-the-crusader": "Achievement_Reputation_ArgentCrusader.PNG",
  ulduar: "Achievement_Dungeon_Ulduar80.PNG",
  "icecrown-citadel": "Achievement_Dungeon_FrozenThrone.PNG",
  "ruby-sanctum": "Achievement_Dungeon_CrimsonHall.PNG",
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

  for (const [fileStem, textureName] of Object.entries(RAID_ICON_SOURCES)) {
    const destinationPath = path.join(outDir, `${fileStem}.png`);
    const url = `${TEXTURE_BASE}/${textureName}`;
    await downloadFile(url, destinationPath);
    console.log(`Wrote ${path.relative(rootDir, destinationPath)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
