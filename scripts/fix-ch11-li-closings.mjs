#!/usr/bin/env node
/**
 * Revert incorrect </PremiumCard> closings on plain <li> elements
 * (introduced by fix-ch11-jsx-corruption.mjs over-matching nested lists).
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const PAGES_DIR = join(import.meta.dirname, "../apps/web/src/pages");

let changed = 0;
for (const file of readdirSync(PAGES_DIR).filter((f) => f.endsWith(".tsx"))) {
  const path = join(PAGES_DIR, file);
  let src = readFileSync(path, "utf8");
  const original = src;

  src = src.replace(/(<li(?:\s[^>]*)?>[\s\S]*?)<\/PremiumCard>/g, "$1</li>");

  if (src !== original) {
    writeFileSync(path, src);
    changed += 1;
    console.log("fixed li closings:", file);
  }
}

console.log(`Done. ${changed} file(s) updated.`);
