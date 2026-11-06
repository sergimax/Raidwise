import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { platform } from "node:os";
import { test } from "node:test";
import puppeteer from "puppeteer-core";
import { preview } from "vite";

const tooltipUrl = "https://cdn.cavernoftime.com/api/tooltip.js";
const statsAsset = /\/assets\/wotlk-item-stats-[^/]+\.json$/;
const englishNamesAsset = /\/assets\/wotlk-item-names-[^/]+\.json$/;
const itemDataAsset = /\/assets\/(?:wotlk-|raid-loot-)[^/]+\.json$/;

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    ...(platform() === "win32"
      ? ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"]
      : platform() === "darwin"
        ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
        : ["/usr/bin/google-chrome", "/usr/bin/chromium"]),
  ];
  const path = candidates.find((candidate) => candidate && existsSync(candidate));
  assert.ok(path, "Chrome not found; set CHROME_PATH to its executable");
  return path;
}

const waitForText = (page, text) =>
  page.waitForFunction((label) => document.body.innerText.includes(label), { timeout: 10000 }, text);

async function clickButton(page, label) {
  await page.evaluate((text) => {
    const button = [...document.querySelectorAll("button")].find((element) => element.textContent === text);
    if (!button) throw new Error(`Button missing: ${text}`);
    button.click();
  }, label);
}

async function preparePage(browser) {
  const page = await browser.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.evaluateOnNewDocument(() => localStorage.setItem("raidwise-item-tooltip-locale", "en"));
  await page.setRequestInterception(true);
  return { page, pageErrors };
}

test("production item data recovers from network and deployment failures", async (t) => {
  const server = await preview({ preview: { host: "127.0.0.1", port: 0 } });
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: findChrome(), headless: true, args: ["--no-sandbox"],
    });
    const { port } = server.httpServer.address();
    const url = `http://127.0.0.1:${port}/raidwise/raids/bis-builds`;

    await t.test("reloads the workspace when its JavaScript module fails", async () => {
      const { page } = await preparePage(browser);
      const chunk = readdirSync("dist/assets").find((name) => name.endsWith(".js") &&
        readFileSync(`dist/assets/${name}`, "utf8").includes("workspace-backup-title"));
      assert.ok(chunk);
      let blocked = true;
      page.on("request", (request) => {
        if (blocked && new URL(request.url()).pathname.endsWith(`/${chunk}`)) void request.abort();
        else void request.continue();
      });
      try {
        await page.setCacheEnabled(false);
        await page.goto(new URL("./", url).href, { waitUntil: "domcontentloaded" });
        await waitForText(page, "Part of Raidwise could not load.");
        assert.deepEqual(await page.$$eval(".app-recovery button", (buttons) => buttons.map((button) => button.textContent)), ["Reload app"]);
        blocked = false;
        await Promise.all([
          page.waitForNavigation({ waitUntil: "domcontentloaded" }),
          clickButton(page, "Reload app"),
        ]);
        await page.waitForSelector("table", { timeout: 10000 });
      } finally {
        await page.close();
      }
    });

    await t.test("loads item data when entering a populated workspace from settings", async () => {
      const { page, pageErrors } = await preparePage(browser);
      await page.setCacheEnabled(false);
      const itemDataRequests = [];
      page.on("request", (request) => {
        if (itemDataAsset.test(request.url())) itemDataRequests.push(request.url());
        void request.continue();
      });
      await page.evaluateOnNewDocument(() => localStorage.setItem("raidwise", JSON.stringify({
        schemaVersion: 7,
        characters: [{ id: "smoke", name: "Smokehero", className: "Warrior" }],
        dungeons: [{ id: "citadel", name: "Icecrown Citadel", itemLevel: [251], size: 10, difficulty: "Normal" }],
        dungeonToggles: {},
      })));
      try {
        await page.goto(`http://127.0.0.1:${port}/raidwise/settings`, { waitUntil: "networkidle0" });
        await waitForText(page, "Application settings");
        assert.deepEqual(itemDataRequests, []);

        await page.click('button[aria-label="Sections"]');
        await Promise.all([
          page.waitForResponse((response) => statsAsset.test(response.url()) && response.ok()),
          page.locator('[role="menuitem"]').filter((element) => element.textContent.includes("My Raids")).click(),
        ]);
        await waitForText(page, "Smokehero");

        await page.goBack();
        await waitForText(page, "Application settings");
        await page.goForward();
        await waitForText(page, "Smokehero");
        await page.waitForNetworkIdle();
        assert.equal(itemDataRequests.filter((request) => statsAsset.test(request)).length, 1);
        assert.deepEqual(pageErrors, []);
      } finally {
        await page.close();
      }
    });

    await t.test("retries a cold asset and external tooltip without reloading", async () => {
      const { page, pageErrors } = await preparePage(browser);
      let statsRequests = 0;
      let namesRequests = 0;
      let tooltipRequests = 0;
      page.on("request", (request) => {
        if (statsAsset.test(request.url()) && ++statsRequests === 1) {
          void request.abort();
        } else if (request.url() === tooltipUrl) {
          tooltipRequests += 1;
          if (tooltipRequests === 1) void request.abort();
          else void request.respond({ contentType: "application/javascript", body: "window.testTooltipLoaded = true;" });
        } else {
          if (englishNamesAsset.test(request.url())) namesRequests += 1;
          void request.continue();
        }
      });

      try {
        await page.goto(url, { waitUntil: "domcontentloaded" });
        await waitForText(page, "Some item data could not be loaded.");
        await waitForText(page, "This tool needs item data.");
        assert.ok(await page.$("table"), "the raid tracker stays available");
        assert.equal(await page.$('input[placeholder="Custom list name"]'), null);
        await clickButton(page, "Retry");
        await page.waitForSelector('input[placeholder="Custom list name"]', { timeout: 10000 });
        assert.equal(statsRequests, 2);
        assert.equal(namesRequests, 1);

        const item = "a.wow-item-link";
        await page.focus(item);
        await page.waitForFunction(() => !document.getElementById("raidwise-cot-tooltips"));
        assert.equal(tooltipRequests, 1);
        await page.evaluate(() => document.activeElement.blur());
        await page.focus(item);
        await page.waitForFunction(() => window.testTooltipLoaded === true);
        await page.evaluate(() => document.activeElement.blur());
        await page.focus(item);
        assert.equal(tooltipRequests, 2);
        assert.deepEqual(pageErrors, []);
      } finally {
        await page.close();
      }
    });

    await t.test("offers a reload when the running build refers to a missing asset", async () => {
      const { page, pageErrors } = await preparePage(browser);
      let stale = true;
      page.on("request", (request) => {
        if (stale && statsAsset.test(request.url())) {
          void request.respond({ status: 404, headers: { "Cache-Control": "no-store" } });
        } else void request.continue();
      });
      try {
        await page.goto(url, { waitUntil: "domcontentloaded" });
        await waitForText(page, "Some item files are no longer available.");
        stale = false;
        await Promise.all([
          page.waitForNavigation({ waitUntil: "domcontentloaded" }),
          clickButton(page, "Reload app"),
        ]);
        await page.waitForSelector('input[placeholder="Custom list name"]', { timeout: 10000 });
        assert.deepEqual(pageErrors, []);
      } finally {
        await page.close();
      }
    });
  } finally {
    await browser?.close();
    await new Promise((resolve, reject) =>
      server.httpServer.close((error) => error ? reject(error) : resolve()),
    );
  }
});
