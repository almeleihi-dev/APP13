import type { MatchScore } from "../../matching/domain/match-score.js";
import { MATCH_SCORE_WEIGHTS } from "../../matching/domain/match-score.js";
import type {
  LiveFrameColor,
  LiveFrameRiskLevel,
  LiveFrameTier,
} from "../../trust/domain/live-frame.js";
import { classifyLiveFrame } from "../../trust/domain/live-frame.js";
import type { ReputationTimelineSeverity } from "../../trust/domain/reputation-timeline.js";
import type { ProviderCard } from "./provider-card.js";

export interface ProviderCardView {
  providerId: string;
  displayName: string;
  actionCodes: string[];
  matchScore: number;
  trustScore: number;
  liveFrameTier: LiveFrameTier;
  liveFrameColor: LiveFrameColor;
  liveFrameLabel: string;
  completedContracts: number;
  averageActionConfidence: number;
}

export interface RankedProviderCardView extends ProviderCardView {
  rankingPosition: number;
  matchScoreExplanation: string;
  trustScoreExplanation: string;
  liveFrameExplanation: string;
  actionConfidenceExplanation: string;
  rankingComparison?: string;
}

export interface MarketplaceResultsView {
  actionCode: string;
  actionName: string;
  results: RankedProviderCardView[];
  generatedAt: Date;
}

export interface ProviderSummaryAction {
  actionCode: string;
  actionName: string;
  confidence: number;
}

export interface ReputationHighlight {
  title: string;
  description: string;
  severity: ReputationTimelineSeverity;
}

export interface ProviderSummary {
  providerId: string;
  displayName: string;
  topActions: ProviderSummaryAction[];
  trustScore: number;
  trustExplanation: string;
  liveFrameTier: LiveFrameTier;
  liveFrameColor: LiveFrameColor;
  liveFrameLabel: string;
  liveFrameExplanation: string;
  completedContracts: number;
  reputationHighlights: ReputationHighlight[];
}

function formatWeight(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}

export function buildMatchScoreExplanation(score: MatchScore): string {
  return (
    `Match score ${score.totalScore} combines trust (${formatWeight(MATCH_SCORE_WEIGHTS.trust)}, ${score.trustScore}), ` +
    `availability (${formatWeight(MATCH_SCORE_WEIGHTS.availability)}, ${score.availabilityScore}), ` +
    `distance (${formatWeight(MATCH_SCORE_WEIGHTS.distance)}, ${score.distanceScore}), ` +
    `experience (${formatWeight(MATCH_SCORE_WEIGHTS.experience)}, ${score.experienceScore}), ` +
    `and price (${formatWeight(MATCH_SCORE_WEIGHTS.price)}, ${score.priceScore}).`
  );
}

export function buildTrustScoreExplanation(trustScore: number): string {
  if (trustScore >= 95) {
    return `Trust score ${trustScore} reflects elite contract completion history and consistently strong customer outcomes.`;
  }
  if (trustScore >= 85) {
    return `Trust score ${trustScore} reflects strong contract completion history and positive customer outcomes.`;
  }
  if (trustScore >= 70) {
    return `Trust score ${trustScore} reflects established platform history with moderate engagement risk.`;
  }
  if (trustScore >= 50) {
    return `Trust score ${trustScore} reflects limited verified history; review provider details before contracting.`;
  }
  return `Trust score ${trustScore} reflects elevated risk signals; proceed with additional due diligence.`;
}

export function buildLiveFrameExplanation(input: {
  liveFrameLabel: string;
  liveFrameTier: LiveFrameTier;
  riskLevel: LiveFrameRiskLevel;
}): string {
  return `${input.liveFrameLabel} live frame (${input.liveFrameTier}) signals ${input.riskLevel} engagement risk based on the current trust score.`;
}

export function buildActionConfidenceExplanation(
  averageActionConfidence: number,
  actionCode?: string
): string {
  const scope = actionCode ? `for ${actionCode}` : "across listed actions";
  return `Action confidence ${averageActionConfidence} ${scope} reflects experience, contract history, and catalog alignment.`;
}

export function buildRankingComparison(
  current: RankedProviderCardView,
  previous: RankedProviderCardView
): string {
  const reasons: string[] = [];

  if (previous.matchScore !== current.matchScore) {
    reasons.push(
      `higher match score (${previous.matchScore} vs ${current.matchScore})`
    );
  }
  if (previous.trustScore !== current.trustScore) {
    reasons.push(
      `higher trust score (${previous.trustScore} vs ${current.trustScore})`
    );
  }
  if (previous.averageActionConfidence !== current.averageActionConfidence) {
    reasons.push(
      `higher action confidence (${previous.averageActionConfidence} vs ${current.averageActionConfidence})`
    );
  }
  if (previous.completedContracts !== current.completedContracts) {
    reasons.push(
      `more completed contracts (${previous.completedContracts} vs ${current.completedContracts})`
    );
  }

  if (reasons.length === 0) {
    return `${previous.displayName} ranks above ${current.displayName} by provider identifier tie-break.`;
  }

  return `${previous.displayName} ranks above ${current.displayName} because ${previous.displayName} has ${reasons.join(", ")}.`;
}

export function mapProviderCardToView(
  card: ProviderCard,
  averageActionConfidence: number
): ProviderCardView {
  const frame = classifyLiveFrame(card.trustScore);

  return {
    providerId: card.providerId,
    displayName: card.displayName,
    actionCodes: [...card.actionCodes],
    matchScore: card.matchScore,
    trustScore: card.trustScore,
    liveFrameTier: frame.frameTier,
    liveFrameColor: frame.frameColor,
    liveFrameLabel: frame.frameLabel,
    completedContracts: card.completedContracts,
    averageActionConfidence,
  };
}
