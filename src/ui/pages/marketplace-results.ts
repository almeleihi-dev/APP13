import type { ProviderCandidate, WorkflowAnalyzeResult } from "../../orchestrator/intelligence/types.js";
import type {
  MarketplaceResultsPageModel,
  MarketplaceResultsView,
  MarketplaceSearchInput,
  ResponseCard,
} from "../marketplace/types.js";
import { buildProviderCardViews, renderProviderCards } from "./provider-card.js";

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return `${value.toLocaleString("en-US")} SAR`;
}

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return `${Math.round(value * 100)}%`;
}

function resolveDetectedCategory(
  search: MarketplaceSearchInput,
  workflow: WorkflowAnalyzeResult
): string {
  if (search.category?.trim()) {
    return search.category.trim();
  }

  const firstAction = workflow.requirement.suggested_actions[0]?.action_code;
  if (!firstAction) {
    return "general";
  }

  const domain = firstAction.split(".")[0];
  const domainLabels: Record<string, string> = {
    A: "cleaning",
    B: "construction",
    C: "consulting",
    D: "design",
    E: "software",
  };

  return domainLabels[domain ?? ""] ?? "general";
}

function resolveTopProviderProfession(
  search: MarketplaceSearchInput,
  workflow: WorkflowAnalyzeResult
): string {
  if (search.category?.trim()) {
    return search.category.trim();
  }

  return resolveDetectedCategory(search, workflow);
}

function resolveTopProviderAvailability(workflow: WorkflowAnalyzeResult): string {
  const selectedId = workflow.matching.selected_provider_id;
  const topMatch = workflow.matching.ranked_matches.find((match) => match.provider_id === selectedId);

  if (topMatch && topMatch.component_scores.availability >= 85) {
    return "Available now";
  }

  if (topMatch && topMatch.component_scores.availability >= 60) {
    return "Limited availability";
  }

  if (topMatch) {
    return "Unavailable";
  }

  return "—";
}

function buildRequestSummaryCard(
  search: MarketplaceSearchInput,
  workflow: WorkflowAnalyzeResult
): MarketplaceResultsView["request_summary"] {
  return {
    id: "request-summary",
    title: "Request Summary",
    summary: search.request_text.trim(),
    fields: [
      { label: "Detected Category", value: resolveDetectedCategory(search, workflow) },
      { label: "Readiness", value: workflow.requirement.contract_readiness },
      { label: "Recommended Budget", value: formatCurrency(workflow.summary.recommended_price) },
      {
        label: "Risk Profile",
        value: workflow.contract?.risk_profile.risk_level ?? "—",
      },
    ],
  };
}

function buildTopProviderCard(
  search: MarketplaceSearchInput,
  workflow: WorkflowAnalyzeResult
): MarketplaceResultsView["top_provider"] {
  const selectedId = workflow.matching.selected_provider_id;
  const topMatch = workflow.matching.ranked_matches.find((match) => match.provider_id === selectedId);

  return {
    id: "top-provider",
    title: "Top Provider",
    summary: selectedId ?? "No provider selected",
    fields: [
      { label: "Provider ID", value: selectedId ?? "—" },
      { label: "Profession", value: resolveTopProviderProfession(search, workflow) },
      {
        label: "Trust Score",
        value: workflow.trust ? String(workflow.trust.trust_score) : "—",
      },
      { label: "Trust Tier", value: workflow.trust?.trust_tier ?? "—" },
      { label: "Availability", value: resolveTopProviderAvailability(workflow) },
      { label: "Match Score", value: topMatch ? String(topMatch.match_score) : "—" },
    ],
  };
}

function buildPricingCard(workflow: WorkflowAnalyzeResult): MarketplaceResultsView["pricing"] {
  return {
    id: "pricing",
    title: "Pricing",
    summary: formatCurrency(workflow.summary.recommended_price),
    fields: [
      { label: "Minimum", value: formatCurrency(workflow.pricing?.price_range.minimum) },
      { label: "Recommended", value: formatCurrency(workflow.pricing?.price_range.recommended) },
      { label: "Premium", value: formatCurrency(workflow.pricing?.price_range.premium) },
    ],
  };
}

function buildNegotiationCard(workflow: WorkflowAnalyzeResult): MarketplaceResultsView["negotiation"] {
  return {
    id: "negotiation",
    title: "Negotiation",
    summary: workflow.negotiation?.negotiation_state ?? "Unavailable",
    fields: [
      { label: "State", value: workflow.negotiation?.negotiation_state ?? "—" },
      {
        label: "Agreement Probability",
        value: workflow.negotiation ? formatPercent(workflow.negotiation.agreement_probability) : "—",
      },
      {
        label: "Recommended Price",
        value: formatCurrency(workflow.negotiation?.recommended_price ?? null),
      },
    ],
  };
}

function buildContractCard(workflow: WorkflowAnalyzeResult): MarketplaceResultsView["contract"] {
  return {
    id: "contract",
    title: "Contract",
    summary: workflow.contract?.contract_readiness ?? "Unavailable",
    fields: [
      { label: "Readiness", value: workflow.contract?.contract_readiness ?? "—" },
      {
        label: "Escrow Strategy",
        value: workflow.contract?.escrow_plan.release_strategy ?? "—",
      },
      {
        label: "Milestone Count",
        value: workflow.contract ? String(workflow.contract.milestones.length) : "—",
      },
    ],
  };
}

function buildMarketplaceMatchCard(workflow: WorkflowAnalyzeResult): MarketplaceResultsView["marketplace_match"] {
  const topMatch = workflow.matching.ranked_matches[0];

  return {
    id: "marketplace-match",
    title: "Marketplace Match",
    summary: topMatch?.recommendation ?? "No match",
    fields: [
      { label: "Recommendation", value: topMatch?.recommendation ?? "—" },
      { label: "Matching Score", value: topMatch ? String(topMatch.match_score) : "—" },
      { label: "Ranking Position", value: topMatch ? "1" : "—" },
    ],
  };
}

export function buildMarketplaceResultsView(
  workflow: WorkflowAnalyzeResult,
  search: MarketplaceSearchInput,
  candidates: ProviderCandidate[]
): MarketplaceResultsView {
  return {
    workflow_status: workflow.workflow_status,
    request_summary: buildRequestSummaryCard(search, workflow),
    top_provider: buildTopProviderCard(search, workflow),
    pricing: buildPricingCard(workflow),
    negotiation: buildNegotiationCard(workflow),
    contract: buildContractCard(workflow),
    marketplace_match: buildMarketplaceMatchCard(workflow),
    provider_cards: buildProviderCardViews(workflow, candidates),
  };
}

export function createMarketplaceResultsPageModel(
  workflow: WorkflowAnalyzeResult,
  search: MarketplaceSearchInput,
  candidates: ProviderCandidate[]
): MarketplaceResultsPageModel {
  return {
    page_id: "marketplace-results",
    title: "Marketplace Results",
    description: "Matched providers, pricing, trust, and contract readiness for your request.",
    view: buildMarketplaceResultsView(workflow, search, candidates),
  };
}

export function renderResponseCard(card: ResponseCard): string {
  const fields = card.fields
    .map((field) => `<dt>${field.label}</dt><dd>${field.value}</dd>`)
    .join("");

  return [
    `<article data-card="${card.id}">`,
    `<h2>${card.title}</h2>`,
    `<p class="summary">${card.summary}</p>`,
    `<dl>${fields}</dl>`,
    `</article>`,
  ].join("\n");
}

export function renderMarketplaceResultsPage(model: MarketplaceResultsPageModel): string {
  const cards = [
    model.view.request_summary,
    model.view.top_provider,
    model.view.pricing,
    model.view.negotiation,
    model.view.contract,
    model.view.marketplace_match,
  ]
    .map((card) => renderResponseCard(card))
    .join("\n");

  const providerCards = renderProviderCards(model.view.provider_cards);

  return [
    `<section data-page="${model.page_id}">`,
    `<h1>${model.title}</h1>`,
    `<p>${model.description}</p>`,
    `<p data-workflow-status="${model.view.workflow_status}">Status: ${model.view.workflow_status}</p>`,
    `<section data-section="response-cards">`,
    cards,
    `</section>`,
    providerCards,
    `</section>`,
  ].join("\n");
}
