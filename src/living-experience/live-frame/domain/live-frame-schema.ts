export const LIVING_LIVE_FRAME_SCHEMA_VERSION = "living-live-frame-v1" as const;

export const LIVING_LIVE_FRAME_SECTIONS = [
  "current_live_frame",
  "frame_meaning",
  "trust_score",
  "frame_history",
  "progress",
  "positive_drivers",
  "negative_drivers",
  "professional_growth",
  "recommendations",
  "timeline",
  "achievements",
  "verified_evidence",
  "future_projection",
] as const;

export type LivingLiveFrameSectionId = (typeof LIVING_LIVE_FRAME_SECTIONS)[number];

export const LIVING_LIVE_FRAME_SECTION_LABELS: Record<LivingLiveFrameSectionId, string> = {
  current_live_frame: "Current Live Frame",
  frame_meaning: "Frame Meaning",
  trust_score: "Trust Score",
  frame_history: "Frame History",
  progress: "Progress to Next Frame",
  positive_drivers: "Positive Drivers",
  negative_drivers: "Negative Drivers",
  professional_growth: "Professional Growth",
  recommendations: "Recommendations",
  timeline: "Frame Timeline",
  achievements: "Achievements",
  verified_evidence: "Verified Evidence",
  future_projection: "Future Projection",
};

export const FRAME_TIERS = [
  "WATCHLIST",
  "STANDARD",
  "TRUSTED",
  "EMERALD_PRO",
  "PLATINUM_ELITE",
] as const;

export type FrameTier = (typeof FRAME_TIERS)[number];

export const FRAME_TIER_LABELS: Record<FrameTier, string> = {
  WATCHLIST: "Watchlist",
  STANDARD: "Standard",
  TRUSTED: "Trusted",
  EMERALD_PRO: "Emerald Pro",
  PLATINUM_ELITE: "Platinum Elite",
};

export const FRAME_TIER_COLORS: Record<FrameTier, string> = {
  WATCHLIST: "#9CA3AF",
  STANDARD: "#60A5FA",
  TRUSTED: "#34D399",
  EMERALD_PRO: "#10B981",
  PLATINUM_ELITE: "#A78BFA",
};

export const LIVING_LIVE_FRAME_ROUTES = [
  "/living-live-frame",
  "/living-live-frame/sections",
  "/living-live-frame/current",
  "/living-live-frame/meaning",
  "/living-live-frame/trust-score",
  "/living-live-frame/history",
  "/living-live-frame/progress",
  "/living-live-frame/positive-drivers",
  "/living-live-frame/negative-drivers",
  "/living-live-frame/growth",
  "/living-live-frame/recommendations",
  "/living-live-frame/timeline",
  "/living-live-frame/achievements",
  "/living-live-frame/evidence",
  "/living-live-frame/projection",
  "/living-live-frame/refresh",
  "/living-live-frame/statistics",
] as const;

export const LIVING_LIVE_FRAME_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/living-live-frame-v1.json",
  title: "LivingLiveFrameExperience",
  type: "object",
  required: ["schema_version", "user_id", "headline"],
  properties: {
    schema_version: { type: "string", const: LIVING_LIVE_FRAME_SCHEMA_VERSION },
    user_id: { type: "string" },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;

export const CONFIDENCE_LEVELS = ["low", "moderate", "high", "very_high"] as const;

export const FRAME_TIER_MIN_SCORES: Record<FrameTier, number> = {
  WATCHLIST: 0,
  STANDARD: 35,
  TRUSTED: 55,
  EMERALD_PRO: 70,
  PLATINUM_ELITE: 85,
};

export const NEXT_TIER: Partial<Record<FrameTier, FrameTier>> = {
  WATCHLIST: "STANDARD",
  STANDARD: "TRUSTED",
  TRUSTED: "EMERALD_PRO",
  EMERALD_PRO: "PLATINUM_ELITE",
};
