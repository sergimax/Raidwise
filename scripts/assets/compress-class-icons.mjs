/**
 * Resize class/spec PNGs to 32×32 WebP for table/header display (~14–18 CSS px @2x).
 * Writes `.webp` next to each `.png`, then removes the source PNGs.
 *
 * Usage: node scripts/assets/compress-class-icons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const iconsDir = path.join(root, "src", "assets", "class-icons");
const size = 32;

async function convertPng(filePath) {
  const webpPath = filePath.replace(/\.png$/i, ".webp");
  await sharp(filePath)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 82, alphaQuality: 90 })
    .toFile(webpPath);
  const before = fs.statSync(filePath).size;
  const after = fs.statSync(webpPath).size;
  console.log(
    `${path.relative(root, filePath)} → ${path.basename(webpPath)} (${before} → ${after} B)`,
  );
}

async function main() {
  const classPngs = fs
    .readdirSync(iconsDir)
    .filter((name) => name.endsWith(".png"))
    .map((name) => path.join(iconsDir, name));

  const specsDir = path.join(iconsDir, "specs");
  const specPngs = fs
    .readdirSync(specsDir)
    .filter((name) => name.endsWith(".png"))
    .map((name) => path.join(specsDir, name));

  for (const filePath of [...classPngs, ...specPngs]) {
    await convertPng(filePath);
    fs.unlinkSync(filePath);
    console.log(`  removed ${path.relative(root, filePath)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
