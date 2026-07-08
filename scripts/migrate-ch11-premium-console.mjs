#!/usr/bin/env node
/**
 * Chapter 11 — Premium design system page migration (presentation only).
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const PAGES_DIR = join(import.meta.dirname, "../apps/web/src/pages");
const SKIP = new Set(["PartnerLandingPage.tsx", "LoginPage.tsx", "RegisterPage.tsx", "RuntimePage.tsx"]);

const OPERATOR_PAGES = readdirSync(PAGES_DIR).filter((f) => f.endsWith(".tsx") && !SKIP.has(f));

function migratePage(filename) {
  const path = join(PAGES_DIR, filename);
  let src = readFileSync(path, "utf8");
  const original = src;

  if (!src.includes("@an-act/runtime-ui/react")) {
    return false;
  }

  // Add PremiumButton/PremiumCard to imports if buttons or cards present
  const needsPremium = src.includes("an-act-button") || src.includes("an-act-card");
  if (needsPremium && !src.includes("PremiumButton")) {
    src = src.replace(
      /from "@an-act\/runtime-ui\/react";/,
      (match) => {
        const existing = src.match(/import \{([^}]+)\} from "@an-act\/runtime-ui\/react";/);
        if (!existing) return match;
        const imports = existing[1];
        const additions = [];
        if (src.includes("an-act-button") && !imports.includes("PremiumButton")) additions.push("PremiumButton");
        if (src.includes("an-act-card") && !imports.includes("PremiumCard")) additions.push("PremiumCard");
        if (additions.length === 0) return match;
        return `import {${imports}, ${additions.join(", ")} } from "@an-act/runtime-ui/react";`;
      }
    );
    // Fix double spaces in import
    src = src.replace(/,  +/g, ", ");
  }

  // Replace buttons
  src = src.replace(
    /<button type="button" className="an-act-button an-act-button--primary"/g,
    '<PremiumButton variant="primary"'
  );
  src = src.replace(
    /<button type="button" className="an-act-button an-act-button--secondary"/g,
    '<PremiumButton variant="secondary"'
  );
  src = src.replace(
    /<button type="button" className="an-act-button an-act-button--ghost"/g,
    '<PremiumButton variant="ghost"'
  );
  src = src.replace(/<\/button>/g, (match, offset) => {
    // Only replace closing tags that follow PremiumButton opens - risky, use simpler approach
    return match;
  });

  // Replace closing button tags for PremiumButton - match PremiumButton...> ... </button>
  src = src.replace(/(<PremiumButton[^>]*>[\s\S]*?)<\/button>/g, "$1</PremiumButton>");

  // Replace an-act-card with PremiumCard
  src = src.replace(/<article className="an-act-card/g, '<PremiumCard as="article" className="');
  src = src.replace(/<article className={`an-act-card/g, '<PremiumCard as="article" className={`');
  src = src.replace(/(<PremiumCard[^>]*>[\s\S]*?)<\/article>/g, "$1</PremiumCard>");

  // Add premium-console to root divs with an-act- or p12- classes
  src = src.replace(
    /<div className="(an-act-[a-z-]+)">/g,
    '<div className="premium-console $1">\n        <div className="premium-console__ambient" aria-hidden="true" />'
  );
  src = src.replace(
    /<div className="(an-act-[a-z-]+) (an-act-[a-z-]+)">/g,
    '<div className="premium-console $1 $2">\n        <div className="premium-console__ambient" aria-hidden="true" />'
  );

  // p12-auth already dark - add premium-console
  if (src.includes('className="p12-auth"') && !src.includes("premium-console")) {
    src = src.replace(
      /<div className="p12-auth">/,
      '<div className="premium-console p12-auth">'
    );
  }

  // an-act-login-shell
  if (src.includes('className="an-act-login-shell"') && !src.includes("premium-console")) {
    src = src.replace(
      /<div className="an-act-login-shell">/,
      '<div className="premium-console an-act-login-shell">\n        <div className="premium-console__ambient" aria-hidden="true" />'
    );
  }

  if (src !== original) {
    writeFileSync(path, src);
    console.log(`Migrated: ${filename}`);
    return true;
  }
  return false;
}

let count = 0;
for (const file of OPERATOR_PAGES) {
  if (migratePage(file)) count++;
}
console.log(`Done. ${count} pages migrated.`);
