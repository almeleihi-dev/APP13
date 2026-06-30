/**
 * Syncs DESIGN_TOKENS from platform source into @an-act/tokens assets.
 * Source of truth: src/design-system/tokens/design-tokens.ts
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDesignTokens } from "../src/design-system/tokens/design-tokens.js";
import { SEMANTIC_COLOR_TOKEN_PATHS } from "../src/design-system/foundation/colors.js";
import type { SemanticColorTokens } from "../src/design-system/foundation/colors.js";
import type { TypographyToken } from "../src/design-system/foundation/typography.js";
import { ACCESSIBILITY_RULES } from "../src/design-system/documentation/design-system.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "packages/tokens/assets");

function flattenTheme(colors: SemanticColorTokens): Record<string, string> {
  const flat: Record<string, string> = {};
  for (const pathKey of SEMANTIC_COLOR_TOKEN_PATHS) {
    const [group, key] = pathKey.split(".") as [keyof SemanticColorTokens, string];
    flat[pathKey] = (colors[group] as Record<string, string>)[key]!;
  }
  return flat;
}

function serializeTypography(
  typography: Record<string, TypographyToken>
): {
  fontFamily: { sans: string; mono: string };
  styles: Record<string, {
    fontFamily: string;
    fontSize: string;
    fontWeight: number;
    lineHeight: string;
    letterSpacing?: string;
  }>;
} {
  const styles: Record<string, {
    fontFamily: string;
    fontSize: string;
    fontWeight: number;
    lineHeight: string;
    letterSpacing?: string;
  }> = {};

  for (const [name, token] of Object.entries(typography)) {
    styles[name] = {
      fontFamily: token.fontFamily,
      fontSize: `${token.fontSize}px`,
      fontWeight: token.fontWeight,
      lineHeight: `${token.lineHeight}px`,
      letterSpacing: token.letterSpacing !== 0 ? `${token.letterSpacing}px` : undefined,
    };
  }

  return {
    fontFamily: {
      sans: '"Inter", "SF Pro Text", system-ui, -apple-system, sans-serif',
      mono: '"SF Mono", "Menlo", "Consolas", monospace',
    },
    styles,
  };
}

function serializeSpacing(spacing: Record<string, number>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(spacing)) {
    out[key] = `${value}px`;
  }
  return out;
}

async function main() {
  const tokens = getDesignTokens();
  const payload = {
    version: tokens.version,
    generated_at: new Date().toISOString(),
    source: "src/design-system/tokens/design-tokens.ts",
    colors: {
      semanticGroups: tokens.colors.semanticGroups,
      semanticPaths: tokens.colors.semanticPaths,
      themes: {
        need: flattenTheme(tokens.colors.themes.need),
        action: flattenTheme(tokens.colors.themes.action),
      },
    },
    typography: serializeTypography(tokens.typography),
    spacing: serializeSpacing(tokens.spacing),
    radius: tokens.radius,
    elevation: tokens.elevation,
    shadows: tokens.shadows,
    motion: tokens.motion,
    transitions: tokens.transitions,
    accessibility: ACCESSIBILITY_RULES,
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, "tokens.json"), JSON.stringify(payload, null, 2), "utf8");
  console.log(`Synced tokens.json → ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
