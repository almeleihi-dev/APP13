export const AN_ACT_BRAND = {
  productName: "AN ACT",
  wordmark: "an act",
  /** Set VITE_AN_ACT_LOGO_URL to swap the typographic wordmark for an official logo asset. */
  logoUrl: (import.meta.env.VITE_AN_ACT_LOGO_URL as string | undefined) || null,
  themeColorNeed: "#FFFFFF",
  themeColorAction: "#000000",
} as const;
