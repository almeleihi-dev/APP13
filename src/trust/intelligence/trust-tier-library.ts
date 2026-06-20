import type {
  LiveFrameColor,
  TrustRecommendation,
  TrustTier,
} from "./types.js";

export interface TrustTierDefinition {
  tier: TrustTier;
  minScore: number;
  maxScore: number;
  liveFrameColor: LiveFrameColor;
  recommendation: TrustRecommendation;
  restrictions: string[];
}

export const TRUST_TIER_DEFINITIONS: TrustTierDefinition[] = [
  {
    tier: "platinum",
    minScore: 95,
    maxScore: 100,
    liveFrameColor: "platinum",
    recommendation: "trusted",
    restrictions: [],
  },
  {
    tier: "emerald",
    minScore: 85,
    maxScore: 94,
    liveFrameColor: "emerald",
    recommendation: "trusted",
    restrictions: [],
  },
  {
    tier: "gold",
    minScore: 70,
    maxScore: 84,
    liveFrameColor: "gold",
    recommendation: "trusted",
    restrictions: [],
  },
  {
    tier: "silver",
    minScore: 50,
    maxScore: 69,
    liveFrameColor: "silver",
    recommendation: "conditional",
    restrictions: ["enhanced_monitoring"],
  },
  {
    tier: "restricted",
    minScore: 0,
    maxScore: 49,
    liveFrameColor: "gray",
    recommendation: "restricted",
    restrictions: ["contracts_require_manual_approval", "escrow_hold_extended"],
  },
];

export function resolveTrustTier(trustScore: number): TrustTierDefinition {
  const clamped = Math.max(0, Math.min(100, trustScore));
  const match =
    TRUST_TIER_DEFINITIONS.find(
      (definition) => clamped >= definition.minScore && clamped <= definition.maxScore
    ) ?? TRUST_TIER_DEFINITIONS[TRUST_TIER_DEFINITIONS.length - 1];

  return match;
}
