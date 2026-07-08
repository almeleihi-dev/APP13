import type {
  IdentityVerificationLevel,
  TrustBehaviorMetrics,
  TrustComponentScores,
  TrustScoreWeights,
} from "./types.js";

export const TRUST_SCORE_WEIGHTS: TrustScoreWeights = {
  verification: 0.4,
  completion: 0.2,
  rating: 0.15,
  issues: 0.1,
  refunds: 0.1,
  evidence: 0.05,
};

const VERIFICATION_SCORES: Record<IdentityVerificationLevel, number> = {
  unknown: 0,
  bronze: 40,
  silver: 60,
  gold: 80,
  iron: 100,
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function clampRate(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function normalizeVerificationLevel(level: string): IdentityVerificationLevel {
  const normalized = level.toLowerCase().trim();
  if (normalized in VERIFICATION_SCORES) {
    return normalized as IdentityVerificationLevel;
  }
  return "unknown";
}

export function scoreVerification(level: string): number {
  return VERIFICATION_SCORES[normalizeVerificationLevel(level)];
}

export function scoreCompletion(completionRate: number): number {
  const rate = clampRate(completionRate);
  const base = rate * 100;
  return clampScore(rate < 1 ? base - 1 : base);
}

export function scoreRating(averageRating: number): number {
  const rating = Math.max(0, Math.min(5, averageRating));
  return clampScore((rating / 5) * 100);
}

export function scoreIssues(issueRate: number): number {
  const rate = clampRate(issueRate);
  return clampScore(100 - rate * 333.33);
}

export function scoreRefunds(refundRate: number): number {
  const rate = clampRate(refundRate);
  return clampScore(100 - rate * 200);
}

export function scoreEvidence(evidenceQualityScore: number): number {
  return clampScore(clampRate(evidenceQualityScore) * 100);
}

export function buildComponentScores(metrics: TrustBehaviorMetrics): TrustComponentScores {
  return {
    verification: scoreVerification(metrics.identity_verification_level),
    rating: scoreRating(metrics.average_rating),
    completion: scoreCompletion(metrics.completion_rate),
    issues: scoreIssues(metrics.issue_rate),
    refunds: scoreRefunds(metrics.refund_rate),
    evidence: scoreEvidence(metrics.evidence_quality_score),
  };
}

export function calculateWeightedTrustScore(components: TrustComponentScores): number {
  const weighted =
    components.verification * TRUST_SCORE_WEIGHTS.verification +
    components.completion * TRUST_SCORE_WEIGHTS.completion +
    components.rating * TRUST_SCORE_WEIGHTS.rating +
    components.issues * TRUST_SCORE_WEIGHTS.issues +
    components.refunds * TRUST_SCORE_WEIGHTS.refunds +
    components.evidence * TRUST_SCORE_WEIGHTS.evidence;

  return clampScore(weighted);
}

export function applyBehaviorPenalties(
  trustScore: number,
  metrics: TrustBehaviorMetrics
): number {
  const completionRate = clampRate(metrics.completion_rate);
  const issuePenalty = Math.round(clampRate(metrics.issue_rate) * 150);
  const refundPenalty = Math.round(clampRate(metrics.refund_rate) * 40);
  const completionPenalty =
    completionRate >= 0.95 ? 0 : Math.round((1 - completionRate) * 25);

  return clampScore(trustScore - issuePenalty - refundPenalty - completionPenalty);
}

export function calculateTrustScore(
  metrics: TrustBehaviorMetrics
): { trust_score: number; component_scores: TrustComponentScores } {
  const component_scores = buildComponentScores(metrics);
  const weighted = calculateWeightedTrustScore(component_scores);
  const trust_score = applyBehaviorPenalties(weighted, metrics);

  return { trust_score, component_scores };
}
