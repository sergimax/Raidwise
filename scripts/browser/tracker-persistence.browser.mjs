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

async function holdSaveLock(page, key) {
  const name = `raidwise:save:${key}`;
  await page.evaluate((lockName) => new Promise((ready) => {
    void navigator.locks.request(lockName, () => new Promise((release) => {
      window.releaseTestLock = release;
      ready();
    }));
  }), name);
  return {
    waitForWriters: (count) => page.waitForFunction(async (lockName, expected) => {
      const { pending } = await navigator.locks.query();
      return pending.filter(({ name }) => name === lockName).length === expected;
    }, { polling: 50 }, name, count),
    release: () => page.evaluate(() => { window.releaseTestLock(); }),
  };
}

async function waitForConflict(page) {
  await page.waitForFunction(() =>
    [...document.querySelectorAll('[role="alert"]')].some(
      (alert) => alert.textContent.includes("The saved data changed in another tab."),
    ),
  );
}

test("tracker and BiS restore queued edits and reject concurrent stale writes", async (t) => {
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
    const guard = await browser.newPage();
    await guard.goto(`${url}logo.svg`, { waitUntil: "domcontentloaded" });

    await t.test("tracker reloads while a lock is held and keeps the losing draft", async () => {
      await page.bringToFront();
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
      await page.waitForFunction(() => JSON.parse(localStorage.getItem("raidwise"))?.characters.length === 1);

      const toggleSelector = 'input[type="checkbox"][aria-label="Smokehero — Smoke Raid"]';
      await page.waitForSelector(toggleSelector);
      const staleTab = await browser.newPage();
      await staleTab.goto(`${url}raids/add-new-raid`, { waitUntil: "domcontentloaded" });
      await staleTab.waitForSelector('input[name="dungeonName"]');
      await staleTab.type('input[name="dungeonName"]', "Stale Tab Raid");

      const lock = await holdSaveLock(guard, "raidwise");
      await page.bringToFront();
      await page.click(toggleSelector);
      await lock.waitForWriters(1);
      await page.reload({ waitUntil: "domcontentloaded" });
      await waitForSavedRow(page, "Smoke Raid");
      await waitForSavedRow(page, "Smokehero");
      await page.waitForSelector(toggleSelector);
      assert.equal(await page.$eval(toggleSelector, (input) => input.checked), true);
      await lock.waitForWriters(1);

      await staleTab.bringToFront();
      await staleTab.click('form button[type="submit"]');
      await waitForSavedRow(staleTab, "Stale Tab Raid");
      await lock.waitForWriters(2);
      await lock.release();
      await waitForConflict(staleTab);
      await staleTab.reload({ waitUntil: "domcontentloaded" });
      await waitForSavedRow(staleTab, "Stale Tab Raid");
      await waitForConflict(staleTab);
      const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("raidwise")));
      const character = saved.characters.find(({ name }) => name === "Smokehero");
      const dungeon = saved.dungeons.find(({ name }) => name === "Smoke Raid");
      assert.equal(saved.dungeonToggles[character.id][dungeon.id], true);
      assert.equal(saved.dungeons.some(({ name }) => name === "Stale Tab Raid"), false);
      await staleTab.close();
    });

    await t.test("BiS reloads while a lock is held and keeps the losing draft", async () => {
      await guard.evaluate(() => {
        localStorage.setItem("raidwise-bis-lists", JSON.stringify({
          schemaVersion: 1,
          entries: {
            "Death Knight|Unholy": {
              selectedPresetId: "local-starter",
              presets: [{ id: "local-starter", name: "Starter", slots: [] }],
            },
          },
        }));
      });
      const other = await browser.newPage();
      const bisUrl = `${url}raids/bis-builds`;
      const field = 'input[placeholder="Custom list name"]';
      const saveList = async (tab, name) => {
        await tab.bringToFront();
        await tab.waitForSelector(field);
        await tab.$eval(field, (input) => {
          input.focus();
          input.select();
        });
        await tab.keyboard.press("Backspace");
        await tab.type(field, name);
        assert.equal(await tab.$eval(field, (input) => input.value), name);
        const button = await tab.evaluateHandle(() => {
          return [...document.querySelectorAll("button")].find((element) => element.textContent === "Save list");
        });
        const save = button.asElement();
        assert.ok(save, "Save list button is missing");
        await save.click();
        await button.dispose();
        try {
          await tab.waitForFunction(() => sessionStorage.getItem("raidwise-bis-lists:pending"), { timeout: 5000 });
        } catch (error) {
          const warnings = await tab.evaluate(() =>
            [...document.querySelectorAll('[role="alert"], .Mui-error')].map((element) => element.textContent),
          );
          throw new Error(`BiS draft was not staged: ${JSON.stringify(warnings)}`, { cause: error });
        }
      };
      const waitForList = async (tab, name) => {
        try {
          await tab.waitForFunction((label) =>
            [...document.querySelectorAll(".MuiChip-label")].some((chip) => chip.textContent === label),
          { timeout: 5000 }, name);
        } catch (error) {
          const chips = await tab.evaluate(() => [...document.querySelectorAll(".MuiChip-label")]
            .map((chip) => chip.textContent));
          throw new Error(`BiS list "${name}" missing. Visible chips: ${JSON.stringify(chips)}`, { cause: error });
        }
      };
      await page.goto(bisUrl, { waitUntil: "domcontentloaded" });
      await other.goto(bisUrl, { waitUntil: "domcontentloaded" });
      await other.waitForSelector(field);
      const lock = await holdSaveLock(guard, "raidwise-bis-lists");

      await saveList(page, "Queued First");
      await lock.waitForWriters(1);
      await page.reload({ waitUntil: "domcontentloaded" });
      await waitForList(page, "Queued First");
      await lock.waitForWriters(1);
      await saveList(other, "Queued Second");
      await lock.waitForWriters(2);
      await lock.release();
      await waitForConflict(other);
      await other.reload({ waitUntil: "domcontentloaded" });
      await waitForList(other, "Queued Second");
      await waitForConflict(other);
      const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("raidwise-bis-lists")));
      assert.deepEqual(saved.entries["Death Knight|Unholy"].presets.map(({ name }) => name), ["Starter", "Queued First"]);

      await other.evaluate(() => {
        [...document.querySelectorAll("button")].find((button) => button.textContent === "Reload saved data").click();
      });
      await other.waitForSelector('[role="dialog"]');
      await Promise.all([
        other.waitForNavigation({ waitUntil: "domcontentloaded" }),
        other.evaluate(() => {
          [...document.querySelectorAll('[role="dialog"] button')]
            .find((button) => button.textContent === "Discard working copy").click();
        }),
      ]);
      await waitForList(other, "Queued First");
      assert.equal(await other.evaluate(() => sessionStorage.getItem("raidwise-bis-lists:pending")), null);
      await other.close();
    });
  } finally {
    await browser?.close();
    await new Promise((resolve, reject) =>
      server.httpServer.close((error) => error ? reject(error) : resolve())
    );
  }
});
