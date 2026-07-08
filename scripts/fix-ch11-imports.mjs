#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const PAGES_DIR = join(import.meta.dirname, "../apps/web/src/pages");

for (const file of readdirSync(PAGES_DIR).filter((f) => f.endsWith(".tsx"))) {
  const path = join(PAGES_DIR, file);
  let src = readFileSync(path, "utf8");
  const original = src;

  // Fix broken duplicate imports
  src = src.replace(
    /import \{([^}]+)\} import \{([^}]+)\} from "@an-act\/runtime-ui\/react";/g,
    (_, a, b) => {
      const merged = new Set(
        `${a}, ${b}`
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      );
      return `import { ${[...merged].join(", ")} } from "@an-act/runtime-ui/react";`;
    }
  );

  // Fix orphaned leading comma import line
  src = src.replace(/^,\s*PremiumButton\s*\} from "@an-act\/runtime-ui\/react";/m, "");

  // Fix RegisterProvider broken import
  src = src.replace(
    /import \{\s*\n,\s*PremiumButton\s*\} from "@an-act\/runtime-ui\/react";/,
    'import { ThemeProvider, AnActWordmark, PremiumButton } from "@an-act/runtime-ui/react";'
  );

  // Remaining an-act-card articles → PremiumCard
  src = src.replace(/<article key=\{([^}]+)\} className="an-act-card"/g, '<PremiumCard as="article" key={$1} className="');
  src = src.replace(/<article className="an-act-card /g, '<PremiumCard as="article" className="');
  src = src.replace(/<article className="an-act-card"/g, '<PremiumCard as="article" className="');
  src = src.replace(/<li key=\{([^}]+)\} className="an-act-card"/g, '<PremiumCard as="li" key={$1} className="');
  src = src.replace(/<li className="an-act-card"/g, '<PremiumCard as="li" className="');

  // Close article tags that should be PremiumCard - only when opened as PremiumCard
  // Fix section with an-act-card class
  src = src.replace(/<section className="an-act-card /g, '<PremiumCard as="section" className="');
  src = src.replace(/<section className="an-act-card"/g, '<PremiumCard as="section" className="');

  // Submit buttons
  src = src.replace(
    /<button type="submit" className="an-act-button an-act-button--primary"/g,
    '<PremiumButton type="submit" variant="primary"'
  );
  src = src.replace(
    /<button type="button" className="an-act-button an-act-button--primary"/g,
    '<PremiumButton variant="primary"'
  );

  // Fix RegistrationSuccess remaining button
  src = src.replace(
    /className="an-act-button an-act-button--primary"/g,
    'variant="primary"'
  );

  // Fix DemoPresenter broken div premium-console on cards
  src = src.replace(/<div className="premium-console an-act-card">/g, '<PremiumCard as="div" className="');

  // Clean PremiumCard className leading space
  src = src.replace(/className=" /g, 'className="');

  // Fix empty PremiumCard className
  src = src.replace(/className=""/g, 'className="premium-card"');

  if (src !== original) {
    writeFileSync(path, src);
    console.log(`Fixed: ${file}`);
  }
}

console.log("Import fix complete.");
