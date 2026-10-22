import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { platform } from "node:os";
import { test } from "node:test";
import puppeteer from "puppeteer-core";
import { preview } from "vite";

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    ...(platform() === "win32"
      ? [
          "C:/Program Files/Google/Chrome/Application/chrome.exe",
          "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
        ]
      : platform() === "darwin"
        ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
        : ["/usr/bin/google-chrome", "/usr/bin/chromium"]),
  ];
  const executablePath = candidates.find((candidate) => candidate && existsSync(candidate));
  assert.ok(executablePath, "Chrome not found; set CHROME_PATH to its executable");
  return executablePath;
}

async function waitForSavedRow(page, name) {
  const selector = `button[aria-label="Edit details for ${name}"]`;
  try {
    await page.waitForSelector(selector, { timeout: 10_000 });
  } catch (error) {
    const state = await page.evaluate(() => ({
      path: location.pathname,
      forms: [...document.querySelectorAll("form")].map((form) =>
        form.innerText.slice(-500)
      ),
      inputs: [...document.querySelectorAll("form input")].map((input) => ({
        name: input.name,
        value: input.value,
      })),
    }));
    throw new Error(`${name} did not appear: ${JSON.stringify(state)}`, { cause: error });
  }
}

test("created raid data survives a page reload", async () => {
  const server = await preview({ preview: { host: "127.0.0.1", port: 0 } });
  let browser;

  try {
    browser = await puppeteer.launch({
      executablePath: findChrome(),
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem("raidwise-item-tooltip-locale", "en");
    });
    const address = server.httpServer.address();
    const url = `http://127.0.0.1:${address.port}/raidwise/`;

    await page.goto(`${url}raids/add-new-raid`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector('input[name="dungeonName"]');
    await page.type('input[name="dungeonName"]', "Smoke Raid");
    await page.click('form button[type="submit"]');
    await waitForSavedRow(page, "Smoke Raid");
    await page.waitForFunction(() => {
      const raw = localStorage.getItem("raidwise");
      return raw && JSON.parse(raw).dungeons?.some(({ name }) => name === "Smoke Raid");
    });

    await page.goto(`${url}raids/add-character`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector('input[name="characterName"]');
    await page.type('input[name="characterName"]', "Smokehero");
    await page.click('[role="combobox"][aria-labelledby="character-class-label"]');
    await page.waitForSelector('[role="option"][data-value="Death Knight"]');
    await page.click('[role="option"][data-value="Death Knight"]');
    await page.waitForSelector(".MuiMenu-root", { hidden: true });
    await page.click('form button[type="submit"]');
    await waitForSavedRow(page, "Smokehero");

    const toggleSelector = 'input[type="checkbox"][aria-label="Smokehero — Smoke Raid"]';
    await page.waitForSelector(toggleSelector);
    await page.click(toggleSelector);
    await page.waitForFunction(
      (selector) => document.querySelector(selector)?.checked === true,
      {},
      toggleSelector,
    );

    // Persistence is debounced; wait for the final write before reloading.
    await page.waitForFunction(() => {
      const raw = localStorage.getItem("raidwise");
      if (!raw) return false;
      const saved = JSON.parse(raw);
      const character = saved.characters?.find(({ name }) => name === "Smokehero");
      const dungeon = saved.dungeons?.find(({ name }) => name === "Smoke Raid");
      return Boolean(character && dungeon && saved.dungeonToggles?.[character.id]?.[dungeon.id]);
    });

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForSavedRow(page, "Smoke Raid");
    await waitForSavedRow(page, "Smokehero");
    await page.waitForSelector(toggleSelector);
    assert.equal(await page.$eval(toggleSelector, (input) => input.checked), true);
  } finally {
    await browser?.close();
    await new Promise((resolve, reject) =>
      server.httpServer.close((error) => error ? reject(error) : resolve())
    );
  }
});
