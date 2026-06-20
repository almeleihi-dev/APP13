import type {
  NegotiationAnalyzeInput,
  NegotiationAnalysisContext,
  NegotiationState,
  RecommendedEscrow,
  RiskProfile,
} from "./types.js";

const LARGE_SCOPE_THRESHOLD = 5;

export function calculatePriceGapPercent(customerOffer: number, providerOffer: number): number {
  const reference = Math.max(customerOffer, providerOffer, 1);
  return (Math.abs(customerOffer - providerOffer) / reference) * 100;
}

export function resolveNegotiationState(priceGapPercent: number): NegotiationState {
  if (priceGapPercent <= 10) return "likely_agreement";
  if (priceGapPercent <= 30) return "negotiable";
  if (priceGapPercent <= 60) return "difficult";
  return "unlikely";
}

export function buildAnalysisContext(input: NegotiationAnalyzeInput): NegotiationAnalysisContext {
  const price_gap_percent = calculatePriceGapPercent(input.customer_offer, input.provider_offer);

  let days_gap: number | null = null;
  if (
    typeof input.customer_days === "number" &&
    typeof input.provider_days === "number" &&
    Number.isFinite(input.customer_days) &&
    Number.isFinite(input.provider_days)
  ) {
    days_gap = Math.abs(input.customer_days - input.provider_days);
  }

  return {
    price_gap_percent,
    days_gap,
    scope_items: typeof input.scope_items === "number" ? input.scope_items : 0,
    trust_score: typeof input.trust_score === "number" ? input.trust_score : null,
    risk_profile: input.risk_profile ?? null,
  };
}

export function calculateAgreementProbability(
  context: NegotiationAnalysisContext
): number {
  let score = 100 - context.price_gap_percent;

  if (context.trust_score !== null) {
    if (context.trust_score >= 90) {
      score += 10;
    } else if (context.trust_score >= 75) {
      score += 5;
    }
  }

  if (context.risk_profile === "high") {
    score -= 15;
  } else if (context.risk_profile === "medium") {
    score -= 5;
  }

  if (context.days_gap !== null && context.days_gap > 0) {
    score -= 5;
  }

  if (context.scope_items >= LARGE_SCOPE_THRESHOLD) {
    score -= 5;
  }

  const clamped = Math.max(0, Math.min(100, score));
  return Math.round(clamped) / 100;
}

export function calculateRecommendedPrice(customerOffer: number, providerOffer: number): number {
  const midpoint = (customerOffer + providerOffer) / 2;
  return Math.max(0, Math.round(midpoint / 100) * 100);
}

export function calculateRecommendedDays(
  customerDays: number | undefined,
  providerDays: number | undefined
): number | undefined {
  if (
    typeof customerDays !== "number" ||
    typeof providerDays !== "number" ||
    !Number.isFinite(customerDays) ||
    !Number.isFinite(providerDays)
  ) {
    return undefined;
  }

  return Math.ceil((customerDays + providerDays) / 2);
}

export function resolveRecommendedEscrow(
  trustScore: number | null,
  riskProfile: RiskProfile | null
): RecommendedEscrow {
  const trust = trustScore ?? 0;
  const risk = riskProfile ?? "medium";

  if (trust >= 90 && risk === "low") {
    return "single_release";
  }
  if (trust >= 75) {
    return "two_stage";
  }
  if (risk === "medium") {
    return "four_stage";
  }
  if (risk === "high") {
    return "milestone_based";
  }

  return "two_stage";
}

export function buildExplanation(
  state: NegotiationState,
  context: NegotiationAnalysisContext,
  recommendedPrice: number,
  recommendedEscrow: RecommendedEscrow
): string {
  const gap = Math.round(context.price_gap_percent * 10) / 10;
  const trustText =
    context.trust_score === null ? "unknown trust" : `trust score ${context.trust_score}`;
  const riskText = context.risk_profile ?? "unspecified risk";

  return (
    `Negotiation is ${state.replace(/_/g, " ")} with a ${gap}% price gap. ` +
    `Recommended midpoint price is ${recommendedPrice} SAR with ${recommendedEscrow.replace(/_/g, " ")} escrow ` +
    `based on ${trustText} and ${riskText} profile.`
  );
}
