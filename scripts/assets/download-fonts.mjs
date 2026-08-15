import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const ua =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const outDir = "public/fonts";
fs.mkdirSync(outDir, { recursive: true });

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": ua } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchBuffer(res.headers.location).then(resolve, reject);
          return;
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

function subsetName(range) {
  if (/U\+0460-052F/.test(range)) return "cyrillic-ext";
  if (/U\+0400-045F/.test(range)) return "cyrillic";
  if (/U\+0000-00FF/.test(range)) return "latin";
  return null;
}

const families = [
  {
    query: "family=Onest:wght@400;500;600;700&display=swap",
    prefix: "onest",
  },
  {
    query:
      "family=Noto+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700&display=swap",
    prefix: "noto-sans",
  },
  {
    query:
      "family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;1,400&display=swap",
    prefix: "jetbrains-mono",
  },
];

const blocks = [];

for (const family of families) {
  const css = (await fetchBuffer(`https://fonts.googleapis.com/css2?${family.query}`)).toString(
    "utf8",
  );
  const faces = css.match(/@font-face\s*\{[^}]+\}/g) ?? [];
  for (const block of faces) {
    const urlMatch = block.match(
      /url\((https:\/\/fonts\.gstatic\.com[^)]+\.woff2)\)/,
    );
    const rangeMatch = block.match(/unicode-range:\s*([^;]+);/);
    if (!urlMatch || !rangeMatch) continue;
    const subset = subsetName(rangeMatch[1].trim());
    if (!subset) continue;
    const weight = (block.match(/font-weight:\s*(\d+)/) ?? [, "400"])[1];
    const style = (block.match(/font-style:\s*(\w+)/) ?? [, "normal"])[1];
    const stylePart = style === "italic" ? "italic-" : "";
    const fileName = `${family.prefix}-${subset}-${stylePart}${weight}.woff2`;
    const outPath = path.join(outDir, fileName);
    if (!fs.existsSync(outPath)) {
      console.log("Downloading", fileName);
      fs.writeFileSync(outPath, await fetchBuffer(urlMatch[1]));
    }
    let next = block.replace(
      /url\([^)]+\)\s*format\('woff2'\)/,
      `url('/raidwise/fonts/${fileName}') format('woff2')`,
    );
    if (!/font-display:/.test(next)) {
      next = next.replace(
        /font-weight:\s*\d+;/,
        (match) => `${match}\n  font-display: swap;`,
      );
    } else {
      next = next.replace(/font-display:\s*[^;]+;/, "font-display: swap;");
    }
    blocks.push(next);
  }
}

fs.writeFileSync("src/fonts.css", `${blocks.join("\n\n")}\n`);
console.log(`faces=${blocks.length} files=${fs.readdirSync(outDir).length}`);
