#!/usr/bin/env node
/**
 * Repair Chapter 11 migration JSX corruption (presentation only).
 * - Truncated className="> from an-act-card replacement
 * - Mismatched </article|section|li> after <PremiumCard>
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const PAGES_DIR = join(import.meta.dirname, "../apps/web/src/pages");

function fixPremiumCardClosings(src) {
  return src.replace(
    /<PremiumCard([^>]*)>((?:(?!<\/PremiumCard>)[\s\S])*?)<\/(article|section|li)>/g,
    "<PremiumCard$1>$2</PremiumCard>"
  );
}

let changed = 0;
for (const file of readdirSync(PAGES_DIR).filter((f) => f.endsWith(".tsx"))) {
  const path = join(PAGES_DIR, file);
  let src = readFileSync(path, "utf8");
  const original = src;

  src = src.replace(/className="\s*>/g, 'className="premium-card">');
  src = fixPremiumCardClosings(src);

  if (src !== original) {
    writeFileSync(path, src);
    changed += 1;
    console.log("fixed:", file);
  }
}

console.log(`Done. ${changed} file(s) updated.`);
