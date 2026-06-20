export type {
  IdentityVerificationLevel,
  LiveFrameColor,
  TrustBehaviorMetrics,
  TrustCalculateInput,
  TrustCalculateResult,
  TrustComponentScores,
  TrustRecommendation,
  TrustScoreWeights,
  TrustTier,
} from "./types.js";
export {
  TRUST_TIER_DEFINITIONS,
  resolveTrustTier,
} from "./trust-tier-library.js";
export type { TrustTierDefinition } from "./trust-tier-library.js";
export {
  TRUST_SCORE_WEIGHTS,
  applyBehaviorPenalties,
  buildComponentScores,
  calculateTrustScore,
  calculateWeightedTrustScore,
  scoreCompletion,
  scoreEvidence,
  scoreIssues,
  scoreRating,
  scoreRefunds,
  scoreVerification,
} from "./trust-rule-library.js";
export {
  TrustIntelligenceService,
  createTrustIntelligenceService,
} from "./trust-intelligence-service.js";
