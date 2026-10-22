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

async function openThemePage(browser, url, { storedMode, systemMode, blockedStorage }) {
  const page = await browser.newPage();
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: systemMode },
  ]);
  await page.evaluateOnNewDocument((savedMode, storageBlocked) => {
    if (storageBlocked) {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new DOMException("Storage blocked", "SecurityError");
        },
      });
    } else if (savedMode) {
      localStorage.setItem("raidwise-color-mode", savedMode);
    }

    new MutationObserver((mutations, observer) => {
      if (mutations.some(({ target, attributeName }) =>
        target === document.documentElement && attributeName === "data-color-mode"
      )) {
        window.__themeBeforeReact = {
          mode: document.documentElement.dataset.colorMode,
          meta: document.querySelector('meta[name="theme-color"]')?.content,
        };
        observer.disconnect();
      }
    }).observe(document, { attributes: true, subtree: true });
  }, storedMode, blockedStorage);

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.querySelector("#root")?.children.length > 0);
    return {
      beforeReact: await page.evaluate(() => window.__themeBeforeReact),
      afterReact: await page.evaluate(() => ({
        mode: document.documentElement.dataset.colorMode,
        meta: document.querySelector('meta[name="theme-color"]')?.content,
      })),
    };
  } finally {
    await page.close();
  }
}

test("theme is correct before and after React mounts", async (t) => {
  const server = await preview({ preview: { host: "127.0.0.1", port: 0 } });
  let browser;

  try {
    browser = await puppeteer.launch({
      executablePath: findChrome(),
      headless: true,
      args: ["--no-sandbox"],
    });
    const address = server.httpServer.address();
    const url = `http://127.0.0.1:${address.port}/raidwise/`;
    const scenarios = [
      {
        name: "saved dark mode overrides a light system preference",
        options: { storedMode: "dark", systemMode: "light" },
      },
      {
        name: "dark system preference is used without a saved mode",
        options: { systemMode: "dark" },
      },
      {
        name: "dark system preference survives blocked localStorage",
        options: { systemMode: "dark", blockedStorage: true },
      },
    ];

    for (const scenario of scenarios) {
      await t.test(scenario.name, async () => {
        const result = await openThemePage(browser, url, scenario.options);
        assert.deepEqual(result.beforeReact, { mode: "dark", meta: "#1a1a1a" });
        assert.deepEqual(result.afterReact, result.beforeReact);
      });
    }
  } finally {
    await browser?.close();
    await new Promise((resolve, reject) =>
      server.httpServer.close((error) => error ? reject(error) : resolve())
    );
  }
});
