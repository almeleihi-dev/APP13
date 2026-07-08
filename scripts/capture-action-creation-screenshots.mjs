#!/usr/bin/env node
/**
 * Captures Action Creation Intelligence Cycle 01 screenshots via Playwright.
 * Seeds minimal session state for presentation preview only.
 */
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "docs/action-creation-intelligence-c01/screenshots/after");
const BASE = process.env.ACTION_CREATOR_SCREENSHOT_URL ?? "http://localhost:5173";

const PASSPORT = {
  fullName: "Demo Professional",
  professionalTitle: "Licensed Electrician",
  location: "Riyadh",
  mainSkill: "Electrical Services",
  experienceSummary:
    "Residential and commercial electrical work with Live Frame monitoring and code-compliant documentation for homeowners and property managers across the region.",
  createdAt: new Date().toISOString(),
  liveFrameTier: "Gold",
  classification: "Domain Professional",
  actionGroups: ["Electrical Services · Primary", "Live Frame Monitored Actions"],
  trustIndicators: ["Identity established", "Live Frame enrolled", "Government license verified"],
  certifications: ["Licensed", "Insured", "Live Frame Verified"],
  rating: "4.9",
  completedActions: 24,
};

async function seed(page) {
  await page.goto(`${BASE}/home`, { waitUntil: "networkidle" });
  await page.evaluate(
    ({ passport }) => {
      localStorage.setItem("an-act-personal-passport-v1", JSON.stringify(passport));
      localStorage.setItem("an-act-launch-v1-complete", "true");
    },
    { passport: PASSPORT },
  );
  await page.reload({ waitUntil: "networkidle" });
}

async function openActionCreator(page) {
  await page.getByRole("button", { name: "Offer a service" }).click();
  await page.waitForSelector(".an-act-action-creator__flow");
}

async function fillIdentity(page) {
  await page.locator("#action-name").fill("Residential Panel Safety Inspection");
  await page.locator("#action-purpose").fill(
    "Licensed electrical inspection with Live Frame documentation, code-compliant reporting, and prioritized safety recommendations for residential properties.",
  );
  await page.locator("#action-target").fill("Homeowners and property managers preparing for seasonal safety checks or insurance renewals.");
  await page.locator("#action-outcome").fill(
    "Full inspection report, photo evidence, hazard documentation, and warranty-ready compliance checklist.",
  );
}

async function fillStructure(page) {
  await page.locator("#action-requirements").fill(
    "Access to electrical panel, property address, preferred appointment window",
  );
  await page.locator("#action-duration").fill("2–3 hours on-site");
  await page.locator("#action-deliverables").fill(
    "Inspection report, photo evidence, compliance checklist",
  );
  await page.locator("#action-evidence").fill(
    "Government license, insurance certificate, Live Frame continuous monitoring",
  );
  await page.locator("#action-success").fill(
    "All circuits tested, hazards documented, customer sign-off captured in Live Frame",
  );
}

async function advanceThroughBuilding(page) {
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForSelector('[data-stage="blueprint"]', { timeout: 15000 });
}

async function goToStage(page, stage) {
  const steps = { trust: 1, marketplace: 2, quality: 3 };
  const count = steps[stage] ?? 0;
  for (let i = 0; i < count; i += 1) {
    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForTimeout(400);
  }
  await page.waitForSelector(`[data-stage="${stage}"]`);
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  try {
    await seed(page);
    await openActionCreator(page);
    await page.screenshot({ path: join(OUT, "01-action-identity.png"), fullPage: true });

    await fillIdentity(page);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForSelector('[data-stage="structure"]');
    await fillStructure(page);
    await page.getByRole("button", { name: "Continue" }).click();
    await advanceThroughBuilding(page);
    await page.screenshot({ path: join(OUT, "02-action-blueprint.png"), fullPage: true });

    await goToStage(page, "marketplace");
    await page.screenshot({ path: join(OUT, "03-marketplace-preview.png"), fullPage: true });

    await goToStage(page, "quality");
    await page.screenshot({ path: join(OUT, "04-action-quality.png"), fullPage: true });
  } finally {
    await browser.close();
  }

  console.log(`Screenshots saved to ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
