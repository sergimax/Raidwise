/**
 * Adds slot + item name comments to built-in BiS preset `.ts` files.
 * Run: npm run comment:bis-presets
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { commentPresetSource } from "./bis-preset-format.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const presetsDir = path.join(__dirname, "../src/data/bis-presets");

for (const fileName of fs.readdirSync(presetsDir)) {
  if (!fileName.endsWith(".ts") || fileName === "index.ts") continue;
  const filePath = path.join(presetsDir, fileName);
  const source = fs.readFileSync(filePath, "utf8");
  const updated = commentPresetSource(source);
  if (updated !== source) {
    fs.writeFileSync(filePath, updated, "utf8");
    console.log(`Commented ${fileName}`);
  }
}

console.log("Done.");
