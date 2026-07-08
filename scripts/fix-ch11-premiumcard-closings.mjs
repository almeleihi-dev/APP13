#!/usr/bin/env node
/**
 * Fix PremiumCard blocks wrongly closed with </li> (migration artifact).
 * Uses greedy match to the last </li> before the next sibling block.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const PAGES_DIR = join(import.meta.dirname, "../apps/web/src/pages");

const PREMIUM_CARD_LI_CLOSE = /<PremiumCard([^>]*)>([\s\S]*)<\/li>(?=\s*\n\s*(?:<PremiumCard|<\/section>|<p class|{\/\*|\)\s*:\s*null))/g;

let changed = 0;
for (const file of readdirSync(PAGES_DIR).filter((f) => f.endsWith(".tsx"))) {
  const path = join(PAGES_DIR, file);
  let src = readFileSync(path, "utf8");
  const original = src;

  src = src.replace(PREMIUM_CARD_LI_CLOSE, "<PremiumCard$1>$2</PremiumCard>");

  if (src !== original) {
    writeFileSync(path, src);
    changed += 1;
    console.log("fixed PremiumCard closings:", file);
  }
}

console.log(`Done. ${changed} file(s) updated.`);
