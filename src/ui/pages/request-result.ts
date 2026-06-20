import type { WorkflowAnalyzeResult } from "../../orchestrator/intelligence/types.js";
import type {
  ContractResponseCard,
  CustomerRequestInput,
  NegotiationResponseCard,
  PricingResponseCard,
  ProviderResponseCard,
  RequestResultPageModel,
  RequestSummaryCard,
  TrustResponseCard,
  WorkflowResultView,
} from "../workflow/types.js";

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

function buildRequirementClassification(result: WorkflowAnalyzeResult): WorkflowResultView["requirement_classification"] {
  const actions =
    result.requirement.suggested_actions.map((action) => action.action_code).join(", ") || "None";
  const deliverables = result.requirement.deliverables.map((item) => item.title).join("; ") || "None";

  return [
    { label: "Language", value: result.requirement.language_detected },
    { label: "Confidence", value: formatPercent(result.requirement.confidence) },
    { label: "Suggested Actions", value: actions },
    { label: "Deliverables", value: deliverables },
    { label: "Contract Readiness", value: result.requirement.contract_readiness },
    { label: "Workflow Status", value: result.workflow_status },
  ];
}

function buildRequestSummaryCard(
  result: WorkflowAnalyzeResult,
  request: CustomerRequestInput
): RequestSummaryCard {
  return {
    id: "request",
    title: "Request Summary",
    summary: request.request_text.trim(),
    fields: [
      { label: "Budget", value: formatCurrency(request.budget ?? null) },
      { label: "Preferred Days", value: request.preferred_days?.toString() ?? "—" },
      { label: "Missing Questions", value: result.requirement.missing_questions.length.toString() },
    ],
  };
}

function buildProviderCard(result: WorkflowAnalyzeResult): ProviderResponseCard {
  const selectedId = result.matching.selected_provider_id;
  const topMatch = result.matching.ranked_matches.find((match) => match.provider_id === selectedId);

  return {
    id: "provider",
    title: "Top Provider",
    summary: selectedId ?? "No provider selected",
    fields: [
      { label: "Provider ID", value: selectedId ?? "—" },
      { label: "Match Score", value: topMatch ? String(topMatch.match_score) : "—" },
      { label: "Recommendation", value: topMatch?.recommendation ?? "—" },
    ],
  };
}

function buildTrustCard(result: WorkflowAnalyzeResult): TrustResponseCard {
  return {
    id: "trust",
    title: "Trust",
    summary: result.trust?.trust_tier ?? "Unavailable",
    fields: [
      { label: "Trust Score", value: result.trust ? String(result.trust.trust_score) : "—" },
      { label: "Trust Tier", value: result.trust?.trust_tier ?? "—" },
      { label: "Live Frame", value: result.trust?.live_frame_color ?? "—" },
      { label: "Recommendation", value: result.trust?.recommendation ?? "—" },
    ],
  };
}

function buildPricingCard(result: WorkflowAnalyzeResult): PricingResponseCard {
  return {
    id: "pricing",
    title: "Pricing",
    summary: formatCurrency(result.summary.recommended_price),
    fields: [
      { label: "Recommended Price", value: formatCurrency(result.summary.recommended_price) },
      { label: "Minimum", value: formatCurrency(result.pricing?.price_range.minimum) },
      { label: "Recommended Band", value: formatCurrency(result.pricing?.price_range.recommended) },
      { label: "Premium", value: formatCurrency(result.pricing?.price_range.premium) },
      { label: "Currency", value: result.pricing?.currency ?? "—" },
    ],
  };
}

function buildNegotiationCard(result: WorkflowAnalyzeResult): NegotiationResponseCard {
  return {
    id: "negotiation",
    title: "Negotiation",
    summary: result.negotiation?.negotiation_state ?? "Unavailable",
    fields: [
      { label: "Negotiation State", value: result.negotiation?.negotiation_state ?? "—" },
      {
        label: "Agreement Probability",
        value: result.negotiation ? formatPercent(result.negotiation.agreement_probability) : "—",
      },
      {
        label: "Recommended Price",
        value: formatCurrency(result.negotiation?.recommended_price ?? null),
      },
      {
        label: "Recommended Escrow",
        value: result.negotiation?.recommended_escrow ?? "—",
      },
    ],
  };
}

function buildContractCard(result: WorkflowAnalyzeResult): ContractResponseCard {
  return {
    id: "contract",
    title: "Contract",
    summary: result.contract?.contract_readiness ?? "Unavailable",
    fields: [
      { label: "Contract Readiness", value: result.contract?.contract_readiness ?? "—" },
      {
        label: "Escrow Strategy",
        value: result.contract?.escrow_plan.release_strategy ?? "—",
      },
      { label: "Risk Profile", value: result.contract?.risk_profile.risk_level ?? "—" },
      { label: "Milestones", value: result.contract ? String(result.contract.milestones.length) : "—" },
      {
        label: "Draft Title",
        value: result.contract?.draft_contract.title ?? "—",
      },
    ],
  };
}

export function buildWorkflowResultView(
  result: WorkflowAnalyzeResult,
  request: CustomerRequestInput
): WorkflowResultView {
  return {
    workflow_status: result.workflow_status,
    request_summary: buildRequestSummaryCard(result, request),
    requirement_classification: buildRequirementClassification(result),
    provider: buildProviderCard(result),
    trust: buildTrustCard(result),
    pricing: buildPricingCard(result),
    negotiation: buildNegotiationCard(result),
    contract: buildContractCard(result),
  };
}

export function createRequestResultPageModel(
  result: WorkflowAnalyzeResult,
  request: CustomerRequestInput
): RequestResultPageModel {
  return {
    page_id: "request-result",
    title: "Workflow Result",
    description: "Unified intelligence workflow output for your request.",
    view: buildWorkflowResultView(result, request),
  };
}

function renderCard(card: { id: string; title: string; summary: string; fields: Array<{ label: string; value: string }> }): string {
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

export function renderWorkflowResultPage(model: RequestResultPageModel): string {
  const classification = model.view.requirement_classification
    .map((field) => `<dt>${field.label}</dt><dd>${field.value}</dd>`)
    .join("");

  const cards = [
    model.view.request_summary,
    model.view.provider,
    model.view.trust,
    model.view.pricing,
    model.view.negotiation,
    model.view.contract,
  ]
    .map((card) => renderCard(card))
    .join("\n");

  return [
    `<section data-page="${model.page_id}">`,
    `<h1>${model.title}</h1>`,
    `<p>${model.description}</p>`,
    `<section data-section="requirement-classification">`,
    `<h2>Requirement Classification</h2>`,
    `<dl>${classification}</dl>`,
    `</section>`,
    `<section data-section="response-cards">`,
    cards,
    `</section>`,
    `</section>`,
  ].join("\n");
}
