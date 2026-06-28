export const TYPOGRAPHY_STYLES = [
  "display",
  "heading",
  "title",
  "body",
  "caption",
  "label",
  "terminal",
] as const;

export type TypographyStyle = (typeof TYPOGRAPHY_STYLES)[number];

export interface TypographyToken {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform?: "none" | "uppercase" | "lowercase";
}

export const TYPOGRAPHY_FONT_FAMILIES = {
  sans: '"Inter", "SF Pro Text", system-ui, -apple-system, sans-serif',
  display: '"Inter", "SF Pro Display", system-ui, -apple-system, sans-serif',
  terminal: '"SF Mono", "Menlo", "Consolas", monospace',
} as const;

export const TYPOGRAPHY_TOKENS: Record<TypographyStyle, TypographyToken> = {
  display: {
    fontFamily: TYPOGRAPHY_FONT_FAMILIES.display,
    fontSize: 40,
    fontWeight: 700,
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  heading: {
    fontFamily: TYPOGRAPHY_FONT_FAMILIES.display,
    fontSize: 28,
    fontWeight: 600,
    lineHeight: 36,
    letterSpacing: -0.25,
  },
  title: {
    fontFamily: TYPOGRAPHY_FONT_FAMILIES.sans,
    fontSize: 20,
    fontWeight: 600,
    lineHeight: 28,
    letterSpacing: 0,
  },
  body: {
    fontFamily: TYPOGRAPHY_FONT_FAMILIES.sans,
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 24,
    letterSpacing: 0,
  },
  caption: {
    fontFamily: TYPOGRAPHY_FONT_FAMILIES.sans,
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  label: {
    fontFamily: TYPOGRAPHY_FONT_FAMILIES.sans,
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 16,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  terminal: {
    fontFamily: TYPOGRAPHY_FONT_FAMILIES.terminal,
    fontSize: 18,
    fontWeight: 400,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
};

/** Terminal style usage: "an act..." transition screens */
export const TERMINAL_TYPOGRAPHY_USAGE = {
  transitionBrandLine: "an act...",
  transitionStatusLine: "Preparing...",
  style: "terminal" as const,
};
