import type { WorkflowAnalyzeResult } from "../../orchestrator/intelligence/types.js";
import type {
  ContractReviewContext,
  ContractSummaryPageModel,
  ContractSummaryView,
  ResponseCard,
} from "../contract/types.js";

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

function resolveProjectCategory(
  context: ContractReviewContext,
  workflow: WorkflowAnalyzeResult
): string {
  if (context.category?.trim()) {
    return context.category.trim();
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

function resolveDuration(context: ContractReviewContext, workflow: WorkflowAnalyzeResult): string {
  if (typeof context.duration_days === "number") {
    return `${context.duration_days} days`;
  }

  if (typeof workflow.negotiation?.recommended_days === "number") {
    return `${workflow.negotiation.recommended_days} days`;
  }

  return "—";
}

function buildContractSummaryCard(
  context: ContractReviewContext,
  workflow: WorkflowAnalyzeResult
): ContractSummaryView["contract_summary"] {
  return {
    id: "contract-summary",
    title: "Contract Summary",
    summary: workflow.contract?.contract_readiness ?? workflow.requirement.contract_readiness,
    fields: [
      {
        label: "Readiness",
        value: workflow.contract?.contract_readiness ?? workflow.requirement.contract_readiness,
      },
      { label: "Project Category", value: resolveProjectCategory(context, workflow) },
      { label: "Duration", value: resolveDuration(context, workflow) },
      {
        label: "Risk Level",
        value: workflow.contract?.risk_profile.risk_level ?? "—",
      },
    ],
  };
}

function buildPartiesCard(
  context: ContractReviewContext,
  workflow: WorkflowAnalyzeResult
): ContractSummaryView["parties"] {
  const providerId =
    context.provider_id ??
    workflow.summary.provider_id ??
    workflow.matching.selected_provider_id ??
    "—";

  return {
    id: "parties",
    title: "Parties",
    summary: providerId === "—" ? "Parties unavailable" : String(providerId),
    fields: [
      {
        label: "Customer",
        value: context.customer_label ?? context.customer_id ?? "Customer",
      },
      { label: "Provider", value: providerId },
      {
        label: "Trust Score",
        value: workflow.trust ? String(workflow.trust.trust_score) : "—",
      },
      { label: "Trust Tier", value: workflow.trust?.trust_tier ?? "—" },
    ],
  };
}

function buildScopeCard(
  context: ContractReviewContext,
  workflow: WorkflowAnalyzeResult
): ContractSummaryView["scope"] {
  const actionCodes =
    workflow.requirement.suggested_actions.map((action) => action.action_code).join(", ") || "—";
  const requirements =
    context.requirement_text?.trim() ||
    workflow.contract?.draft_contract.summary ||
    "—";
  const deliverables =
    workflow.contract?.scope_of_work.map((item) => item.title).join("; ") ||
    workflow.requirement.deliverables.map((item) => item.title).join("; ") ||
    "—";

  return {
    id: "scope",
    title: "Scope",
    summary: actionCodes,
    fields: [
      { label: "Action Codes", value: actionCodes },
      { label: "Requirements", value: requirements },
      { label: "Deliverables", value: deliverables },
    ],
  };
}

function buildMilestonesCard(workflow: WorkflowAnalyzeResult): ContractSummaryView["milestones"] {
  const milestones = workflow.contract?.milestones ?? [];
  const percentageAllocation =
    milestones.length > 0
      ? milestones.map((milestone) => `${milestone.percentage}%`).join(", ")
      : "—";
  const releaseAllocation =
    workflow.contract?.escrow_plan.recommended_structure
      .map((stage) => `${stage.label}: ${stage.percentage}%`)
      .join("; ") ?? "—";

  return {
    id: "milestones",
    title: "Milestones",
    summary: milestones.length > 0 ? String(milestones.length) : "0",
    fields: [
      { label: "Milestone Count", value: String(milestones.length) },
      { label: "Percentage Allocation", value: percentageAllocation },
      { label: "Release Allocation", value: releaseAllocation },
    ],
  };
}

function buildPricingCard(workflow: WorkflowAnalyzeResult): ContractSummaryView["pricing"] {
  return {
    id: "pricing",
    title: "Pricing",
    summary: formatCurrency(workflow.summary.recommended_price),
    fields: [
      { label: "Minimum", value: formatCurrency(workflow.pricing?.price_range.minimum) },
      { label: "Recommended", value: formatCurrency(workflow.pricing?.price_range.recommended) },
      { label: "Negotiated", value: formatCurrency(workflow.negotiation?.recommended_price ?? null) },
      { label: "Premium", value: formatCurrency(workflow.pricing?.price_range.premium) },
    ],
  };
}

function buildNegotiationCard(workflow: WorkflowAnalyzeResult): ContractSummaryView["negotiation"] {
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

function buildTrustCard(workflow: WorkflowAnalyzeResult): ContractSummaryView["trust"] {
  const recommendations = workflow.trust
    ? [workflow.trust.recommendation, ...workflow.trust.restrictions].filter(Boolean).join("; ")
    : "—";

  return {
    id: "trust",
    title: "Trust",
    summary: workflow.trust?.trust_tier ?? "Unavailable",
    fields: [
      { label: "Score", value: workflow.trust ? String(workflow.trust.trust_score) : "—" },
      { label: "Tier", value: workflow.trust?.trust_tier ?? "—" },
      { label: "Live Frame", value: workflow.trust?.live_frame_color ?? "—" },
      { label: "Recommendations", value: recommendations },
    ],
  };
}

function buildEscrowCard(workflow: WorkflowAnalyzeResult): ContractSummaryView["escrow"] {
  return {
    id: "escrow",
    title: "Escrow",
    summary: workflow.contract?.escrow_plan.release_strategy ?? "Unavailable",
    fields: [
      {
        label: "Escrow Strategy",
        value: workflow.contract?.escrow_plan.release_strategy ?? "—",
      },
    ],
  };
}

function buildRiskCard(workflow: WorkflowAnalyzeResult): ContractSummaryView["risk"] {
  return {
    id: "risk",
    title: "Risk",
    summary: workflow.contract?.risk_profile.risk_level ?? "Unavailable",
    fields: [
      { label: "Risk Level", value: workflow.contract?.risk_profile.risk_level ?? "—" },
      { label: "Explanation", value: workflow.contract?.risk_profile.reason ?? "—" },
    ],
  };
}

export function buildContractSummaryView(
  workflow: WorkflowAnalyzeResult,
  context: ContractReviewContext = {}
): ContractSummaryView {
  return {
    workflow_status: workflow.workflow_status,
    contract_summary: buildContractSummaryCard(context, workflow),
    parties: buildPartiesCard(context, workflow),
    scope: buildScopeCard(context, workflow),
    milestones: buildMilestonesCard(workflow),
    pricing: buildPricingCard(workflow),
    negotiation: buildNegotiationCard(workflow),
    trust: buildTrustCard(workflow),
    escrow: buildEscrowCard(workflow),
    risk: buildRiskCard(workflow),
  };
}

export function createContractSummaryPageModel(
  workflow: WorkflowAnalyzeResult,
  context: ContractReviewContext = {}
): ContractSummaryPageModel {
  return {
    page_id: "contract-summary",
    title: "Contract Summary",
    description: "Read-only contract review projection from workflow and AI-3 contract intelligence.",
    view: buildContractSummaryView(workflow, context),
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

export function renderContractSummaryPage(model: ContractSummaryPageModel): string {
  const cards = [
    model.view.contract_summary,
    model.view.parties,
    model.view.scope,
    model.view.milestones,
    model.view.pricing,
    model.view.negotiation,
    model.view.trust,
    model.view.escrow,
    model.view.risk,
  ]
    .map((card) => renderResponseCard(card))
    .join("\n");

  return [
    `<section data-page="${model.page_id}">`,
    `<h1>${model.title}</h1>`,
    `<p>${model.description}</p>`,
    `<p data-workflow-status="${model.view.workflow_status}">Status: ${model.view.workflow_status}</p>`,
    `<section data-section="contract-cards">`,
    cards,
    `</section>`,
    `</section>`,
  ].join("\n");
}
