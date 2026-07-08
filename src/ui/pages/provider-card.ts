import type { ProviderCandidate, WorkflowAnalyzeResult } from "../../orchestrator/intelligence/types.js";
import type { ProviderCardView } from "../marketplace/types.js";

function resolvePricePosition(
  priceOffer: number | undefined,
  workflow: WorkflowAnalyzeResult
): string {
  if (priceOffer === undefined || workflow.pricing === null) {
    return "—";
  }

  const { minimum, recommended, premium } = workflow.pricing.price_range;

  if (priceOffer <= minimum) {
    return "budget";
  }

  if (priceOffer >= premium) {
    return "premium";
  }

  if (priceOffer <= recommended) {
    return "market";
  }

  return "market";
}

function resolveAvailabilityLabel(
  candidate: ProviderCandidate | undefined,
  matchAvailabilityScore: number | undefined
): string {
  if (matchAvailabilityScore !== undefined) {
    if (matchAvailabilityScore >= 85) {
      return "Available now";
    }

    if (matchAvailabilityScore >= 60) {
      return "Limited availability";
    }

    return "Unavailable";
  }

  if (typeof candidate?.estimated_days === "number") {
    return `Starts in ${candidate.estimated_days} days`;
  }

  return "—";
}

function resolveDisplayName(candidate: ProviderCandidate | undefined, providerId: string): string {
  if (candidate?.skills.length) {
    return candidate.skills.slice(0, 2).join(" / ");
  }

  return providerId;
}

export function buildProviderCardView(
  workflow: WorkflowAnalyzeResult,
  providerId: string,
  rankingPosition: number,
  candidates: ProviderCandidate[]
): ProviderCardView {
  const candidate = candidates.find((entry) => entry.provider_id === providerId);
  const rankedMatch = workflow.matching.ranked_matches.find((match) => match.provider_id === providerId);
  const isSelected = workflow.matching.selected_provider_id === providerId;

  return {
    provider_id: providerId,
    display_name: resolveDisplayName(candidate, providerId),
    trust_score: isSelected && workflow.trust
      ? String(workflow.trust.trust_score)
      : candidate
        ? String(candidate.trust_score)
        : rankedMatch
          ? String(Math.round(rankedMatch.component_scores.trust))
          : "—",
    trust_tier: isSelected && workflow.trust ? workflow.trust.trust_tier : "—",
    live_frame_color: isSelected && workflow.trust ? workflow.trust.live_frame_color : "—",
    availability: resolveAvailabilityLabel(candidate, rankedMatch?.component_scores.availability),
    price_position: resolvePricePosition(candidate?.price_offer, workflow),
    ranking_position: rankingPosition,
    match_score: rankedMatch ? String(rankedMatch.match_score) : "—",
    recommendation: rankedMatch?.recommendation ?? "—",
  };
}

export function buildProviderCardViews(
  workflow: WorkflowAnalyzeResult,
  candidates: ProviderCandidate[]
): ProviderCardView[] {
  return workflow.matching.ranked_matches.map((match, index) =>
    buildProviderCardView(workflow, match.provider_id, index + 1, candidates)
  );
}

export function renderProviderCard(card: ProviderCardView): string {
  return [
    `<article class="provider-card" data-provider-id="${card.provider_id}" data-rank="${card.ranking_position}">`,
    `<h3>${card.display_name}</h3>`,
    `<p class="provider-id">${card.provider_id}</p>`,
    `<dl>`,
    `<dt>Trust Score</dt><dd>${card.trust_score}</dd>`,
    `<dt>Trust Tier</dt><dd>${card.trust_tier}</dd>`,
    `<dt>Live Frame</dt><dd>${card.live_frame_color}</dd>`,
    `<dt>Availability</dt><dd>${card.availability}</dd>`,
    `<dt>Price Position</dt><dd>${card.price_position}</dd>`,
    `<dt>Match Score</dt><dd>${card.match_score}</dd>`,
    `<dt>Recommendation</dt><dd>${card.recommendation}</dd>`,
    `</dl>`,
    `</article>`,
  ].join("\n");
}

export function renderProviderCards(cards: ProviderCardView[]): string {
  if (cards.length === 0) {
    return `<section data-section="provider-cards"><p>No providers matched.</p></section>`;
  }

  return [
    `<section data-section="provider-cards">`,
    cards.map((card) => renderProviderCard(card)).join("\n"),
    `</section>`,
  ].join("\n");
}
