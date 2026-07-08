import type {
  DisputeDashboardView,
  DisputeExperienceSource,
  DisputeDashboardPageModel,
  ResponseCard,
} from "../dispute/types.js";

function buildDisputeSummaryCard(source: DisputeExperienceSource): DisputeDashboardView["dispute_summary"] {
  return {
    id: "dispute-summary",
    title: "Dispute Summary",
    summary: source.summary.currentStatus,
    fields: [
      { label: "Dispute ID", value: source.summary.disputeId },
      { label: "Contract ID", value: source.summary.contractId },
      { label: "Issue Type", value: source.summary.issueType },
      { label: "Severity", value: source.summary.severity },
      { label: "Current Status", value: source.summary.currentStatus },
    ],
  };
}

function buildPartiesCard(source: DisputeExperienceSource): DisputeDashboardView["parties"] {
  return {
    id: "parties",
    title: "Parties",
    summary: source.parties.disputeOwner,
    fields: [
      { label: "Customer", value: source.parties.customer },
      { label: "Provider", value: source.parties.provider },
      { label: "Dispute Owner", value: source.parties.disputeOwner },
      { label: "Opened By", value: source.parties.openedBy },
    ],
  };
}

function buildEscrowImpactCard(source: DisputeExperienceSource): DisputeDashboardView["escrow_impact"] {
  return {
    id: "escrow-impact",
    title: "Escrow Impact",
    summary: source.escrowImpact.escrowStatus,
    fields: [
      { label: "Escrow Status", value: source.escrowImpact.escrowStatus },
      { label: "Frozen", value: source.escrowImpact.frozen ? "Yes" : "No" },
      { label: "Unfrozen", value: source.escrowImpact.unfrozen ? "Yes" : "No" },
      { label: "Affected Amount", value: source.escrowImpact.affectedAmountLabel },
    ],
  };
}

function buildEvidenceStatusCard(source: DisputeExperienceSource): DisputeDashboardView["evidence_status"] {
  return {
    id: "evidence-status",
    title: "Evidence Status",
    summary: String(source.evidenceStatus.totalEvidence),
    fields: [
      { label: "Total Evidence", value: String(source.evidenceStatus.totalEvidence) },
      { label: "Verified Evidence", value: String(source.evidenceStatus.verifiedEvidence) },
      { label: "Pending Evidence", value: String(source.evidenceStatus.pendingEvidence) },
      { label: "Attested Evidence", value: String(source.evidenceStatus.attestedEvidence) },
    ],
  };
}

function buildResolutionProgressCard(
  source: DisputeExperienceSource
): DisputeDashboardView["resolution_progress"] {
  return {
    id: "resolution-progress",
    title: "Resolution Progress",
    summary: source.summary.currentStatus,
    fields: [
      { label: "Open", value: source.resolutionProgress.open },
      { label: "Investigating", value: source.resolutionProgress.investigating },
      { label: "Mediation", value: source.resolutionProgress.mediation },
      { label: "Resolved", value: source.resolutionProgress.resolved },
      { label: "Closed", value: source.resolutionProgress.closed },
    ],
  };
}

function buildRiskContextCard(source: DisputeExperienceSource): DisputeDashboardView["risk_context"] {
  return {
    id: "risk-context",
    title: "Risk Context",
    summary: source.riskContext.riskLevel,
    fields: [
      { label: "Risk Level", value: source.riskContext.riskLevel },
      { label: "Escalation Indicator", value: source.riskContext.escalationIndicator },
      { label: "Financial Impact", value: source.riskContext.financialImpact },
    ],
  };
}

function buildTrustContextCard(source: DisputeExperienceSource): DisputeDashboardView["trust_context"] {
  return {
    id: "trust-context",
    title: "Trust Context",
    summary: source.trustContext.trustTier,
    fields: [
      { label: "Provider Trust Score", value: source.trustContext.providerTrustScore },
      { label: "Trust Tier", value: source.trustContext.trustTier },
      { label: "Dispute Impact Indicator", value: source.trustContext.disputeImpactIndicator },
    ],
  };
}

function buildTimelineSummaryCard(source: DisputeExperienceSource): DisputeDashboardView["timeline_summary"] {
  return {
    id: "timeline-summary",
    title: "Timeline Summary",
    summary: source.timelineSummary.created,
    fields: [
      { label: "Created", value: source.timelineSummary.created },
      { label: "Evidence Added", value: source.timelineSummary.evidenceAdded },
      { label: "Freeze", value: source.timelineSummary.freeze },
      { label: "Mediation", value: source.timelineSummary.mediation },
      { label: "Resolution", value: source.timelineSummary.resolution },
    ],
  };
}

export function buildDisputeDashboardView(source: DisputeExperienceSource): DisputeDashboardView {
  return {
    dispute_status: source.summary.currentStatus,
    dispute_summary: buildDisputeSummaryCard(source),
    parties: buildPartiesCard(source),
    escrow_impact: buildEscrowImpactCard(source),
    evidence_status: buildEvidenceStatusCard(source),
    resolution_progress: buildResolutionProgressCard(source),
    risk_context: buildRiskContextCard(source),
    trust_context: buildTrustContextCard(source),
    timeline_summary: buildTimelineSummaryCard(source),
  };
}

export function createDisputeDashboardPageModel(source: DisputeExperienceSource): DisputeDashboardPageModel {
  return {
    page_id: "dispute-dashboard",
    title: "Dispute Dashboard",
    description: "Read-only dispute status, resolution context, and linked snapshot summaries.",
    view: buildDisputeDashboardView(source),
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

export function renderDisputeDashboardPage(model: DisputeDashboardPageModel): string {
  const cards = [
    model.view.dispute_summary,
    model.view.parties,
    model.view.escrow_impact,
    model.view.evidence_status,
    model.view.resolution_progress,
    model.view.risk_context,
    model.view.trust_context,
    model.view.timeline_summary,
  ]
    .map((card) => renderResponseCard(card))
    .join("\n");

  return [
    `<section data-page="${model.page_id}">`,
    `<h1>${model.title}</h1>`,
    `<p>${model.description}</p>`,
    `<p data-dispute-status="${model.view.dispute_status}">Status: ${model.view.dispute_status}</p>`,
    `<section data-section="dispute-cards">`,
    cards,
    `</section>`,
    `</section>`,
  ].join("\n");
}
