import type {
  EscrowExperienceSource,
  EscrowOverviewPageModel,
  EscrowOverviewView,
  EscrowStatusHistorySnapshot,
  ResponseCard,
} from "../escrow/types.js";

function formatMoney(minor: number, currencyCode: string): string {
  const major = minor / 100;
  return `${major.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyCode}`;
}

function formatTimestamp(value: string): string {
  return new Date(value).toISOString();
}

function hasReachedStatus(
  source: EscrowExperienceSource,
  status: EscrowStatusHistorySnapshot["toStatus"] | "partially_released"
): string {
  if (status === "partially_released") {
    const partial =
      source.history.some((entry) => entry.toStatus === "partially_refunded") ||
      source.escrow.status === "partially_refunded" ||
      (source.financial.releasedAmountMinor > 0 &&
        source.financial.releasedAmountMinor < source.financial.contractValueMinor &&
        source.escrow.status === "held");

    return partial ? "Yes" : "No";
  }

  const reached =
    source.history.some((entry) => entry.toStatus === status) || source.escrow.status === status;

  return reached ? "Yes" : "No";
}

function buildEscrowSummaryCard(source: EscrowExperienceSource): EscrowOverviewView["escrow_summary"] {
  return {
    id: "escrow-summary",
    title: "Escrow Summary",
    summary: source.escrow.status,
    fields: [
      { label: "Escrow ID", value: source.escrow.id },
      { label: "Contract ID", value: source.escrow.contractId },
      { label: "Status", value: source.escrow.status },
      { label: "Created At", value: formatTimestamp(source.escrow.createdAt) },
    ],
  };
}

function buildFinancialStatusCard(source: EscrowExperienceSource): EscrowOverviewView["financial_status"] {
  const { financial } = source;

  return {
    id: "financial-status",
    title: "Financial Status",
    summary: formatMoney(financial.remainingAmountMinor, financial.currencyCode),
    fields: [
      { label: "Contract Value", value: formatMoney(financial.contractValueMinor, financial.currencyCode) },
      { label: "Held Amount", value: formatMoney(financial.heldAmountMinor, financial.currencyCode) },
      { label: "Released Amount", value: formatMoney(financial.releasedAmountMinor, financial.currencyCode) },
      { label: "Refunded Amount", value: formatMoney(financial.refundedAmountMinor, financial.currencyCode) },
      { label: "Remaining Amount", value: formatMoney(financial.remainingAmountMinor, financial.currencyCode) },
    ],
  };
}

function buildEscrowStateCard(source: EscrowExperienceSource): EscrowOverviewView["escrow_state"] {
  return {
    id: "escrow-state",
    title: "Escrow State",
    summary: source.escrow.status,
    fields: [
      { label: "Pending Funding", value: hasReachedStatus(source, "pending_funding") },
      { label: "Funded", value: hasReachedStatus(source, "funded") },
      { label: "Held", value: hasReachedStatus(source, "held") },
      { label: "Partially Released", value: hasReachedStatus(source, "partially_released") },
      { label: "Released", value: hasReachedStatus(source, "released") },
      { label: "Refunded", value: hasReachedStatus(source, "refunded") },
      { label: "Frozen", value: hasReachedStatus(source, "frozen") },
    ],
  };
}

function buildReleaseStrategyCard(source: EscrowExperienceSource): EscrowOverviewView["release_strategy"] {
  return {
    id: "release-strategy",
    title: "Release Strategy",
    summary: source.releaseStrategy,
    fields: [{ label: "Strategy", value: source.releaseStrategy }],
  };
}

function buildMilestonesCard(source: EscrowExperienceSource): EscrowOverviewView["milestones"] {
  return {
    id: "milestones",
    title: "Milestones",
    summary: String(source.milestones.total),
    fields: [
      { label: "Milestone Count", value: String(source.milestones.total) },
      { label: "Completed", value: String(source.milestones.completed) },
      { label: "Pending", value: String(source.milestones.pending) },
      { label: "Release Allocation", value: source.milestones.releaseAllocation },
    ],
  };
}

function buildTrustContextCard(source: EscrowExperienceSource): EscrowOverviewView["trust_context"] {
  return {
    id: "trust-context",
    title: "Trust Context",
    summary: source.trust.providerTrustTier,
    fields: [
      { label: "Provider Trust Score", value: source.trust.providerTrustScore },
      { label: "Provider Trust Tier", value: source.trust.providerTrustTier },
      { label: "Risk Level", value: source.trust.riskLevel },
    ],
  };
}

function buildContractContextCard(source: EscrowExperienceSource): EscrowOverviewView["contract_context"] {
  return {
    id: "contract-context",
    title: "Contract Context",
    summary: source.contract.readiness,
    fields: [
      { label: "Category", value: source.contract.category },
      { label: "Duration", value: source.contract.duration },
      { label: "Readiness", value: source.contract.readiness },
    ],
  };
}

export function buildEscrowOverviewView(source: EscrowExperienceSource): EscrowOverviewView {
  return {
    escrow_status: source.escrow.status,
    escrow_summary: buildEscrowSummaryCard(source),
    financial_status: buildFinancialStatusCard(source),
    escrow_state: buildEscrowStateCard(source),
    release_strategy: buildReleaseStrategyCard(source),
    milestones: buildMilestonesCard(source),
    trust_context: buildTrustContextCard(source),
    contract_context: buildContractContextCard(source),
  };
}

export function createEscrowOverviewPageModel(source: EscrowExperienceSource): EscrowOverviewPageModel {
  return {
    page_id: "escrow-overview",
    title: "Escrow Overview",
    description: "Read-only escrow status, financial snapshot, milestones, trust, and contract context.",
    view: buildEscrowOverviewView(source),
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

export function renderEscrowOverviewPage(model: EscrowOverviewPageModel): string {
  const cards = [
    model.view.escrow_summary,
    model.view.financial_status,
    model.view.escrow_state,
    model.view.release_strategy,
    model.view.milestones,
    model.view.trust_context,
    model.view.contract_context,
  ]
    .map((card) => renderResponseCard(card))
    .join("\n");

  return [
    `<section data-page="${model.page_id}">`,
    `<h1>${model.title}</h1>`,
    `<p>${model.description}</p>`,
    `<p data-escrow-status="${model.view.escrow_status}">Status: ${model.view.escrow_status}</p>`,
    `<section data-section="escrow-cards">`,
    cards,
    `</section>`,
    `</section>`,
  ].join("\n");
}
