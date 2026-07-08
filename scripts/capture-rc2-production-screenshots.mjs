#!/usr/bin/env node
/**
 * Captures Public Beta RC2 production screenshots from https://anact.app
 */
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "docs/public-beta-rc2/screenshots");
const BASE = process.env.RC2_SCREENSHOT_URL ?? "https://anact.app";

async function main() {
  const { chromium } = await import("playwright");
  mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  try {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
    await page.screenshot({ path: join(OUT, "production-01-launch-splash.png"), fullPage: false });

    await page.goto(`${BASE}/start`, { waitUntil: "networkidle", timeout: 60000 });
    await page.screenshot({ path: join(OUT, "production-02-act-builder.png"), fullPage: false });

    await page.goto(`${BASE}/home`, { waitUntil: "networkidle", timeout: 60000 });
    await page.screenshot({ path: join(OUT, "production-03-enterprise-landing.png"), fullPage: false });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
    await page.screenshot({ path: join(OUT, "production-04-mobile-launch.png"), fullPage: false });
  } finally {
    await browser.close();
  }

  console.log(`Production screenshots saved to ${OUT}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
