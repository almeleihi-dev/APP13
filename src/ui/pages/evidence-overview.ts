import type {
  EvidenceExperienceSource,
  EvidenceOverviewPageModel,
  EvidenceOverviewView,
  ResponseCard,
} from "../evidence/types.js";

function formatList(values: string[]): string {
  if (values.length === 0) {
    return "None";
  }

  return values.join("; ");
}

function buildEvidenceSummaryCard(source: EvidenceExperienceSource): EvidenceOverviewView["evidence_summary"] {
  return {
    id: "evidence-summary",
    title: "Evidence Summary",
    summary: String(source.summary.totalEvidence),
    fields: [
      { label: "Total Evidence", value: String(source.summary.totalEvidence) },
      { label: "Approved", value: String(source.summary.approved) },
      { label: "Pending", value: String(source.summary.pending) },
      { label: "Rejected", value: String(source.summary.rejected) },
    ],
  };
}

function buildUploadStatisticsCard(
  source: EvidenceExperienceSource
): EvidenceOverviewView["upload_statistics"] {
  return {
    id: "upload-statistics",
    title: "Upload Statistics",
    summary: String(source.uploadStatistics.documents + source.uploadStatistics.images),
    fields: [
      { label: "Images", value: String(source.uploadStatistics.images) },
      { label: "Videos", value: String(source.uploadStatistics.videos) },
      { label: "Documents", value: String(source.uploadStatistics.documents) },
      { label: "Links", value: String(source.uploadStatistics.links) },
    ],
  };
}

function buildVerificationStatusCard(
  source: EvidenceExperienceSource
): EvidenceOverviewView["verification_status"] {
  return {
    id: "verification-status",
    title: "Verification Status",
    summary: String(source.verificationStatus.verifiedCount),
    fields: [
      { label: "Verified Count", value: String(source.verificationStatus.verifiedCount) },
      { label: "Unverified Count", value: String(source.verificationStatus.unverifiedCount) },
      { label: "Attested Count", value: String(source.verificationStatus.attestedCount) },
    ],
  };
}

function buildContractContextCard(
  source: EvidenceExperienceSource
): EvidenceOverviewView["contract_context"] {
  return {
    id: "contract-context",
    title: "Contract Context",
    summary: source.contractContext.contractId,
    fields: [
      { label: "Contract ID", value: source.contractContext.contractId },
      { label: "Milestone ID", value: source.contractContext.milestoneId ?? "—" },
      { label: "Issue ID", value: source.contractContext.issueId ?? "—" },
      { label: "Execution Status", value: source.contractContext.executionStatus },
    ],
  };
}

function buildTrustContextCard(source: EvidenceExperienceSource): EvidenceOverviewView["trust_context"] {
  return {
    id: "trust-context",
    title: "Trust Context",
    summary: source.trustContext.trustTier,
    fields: [
      { label: "Provider Trust Score", value: source.trustContext.providerTrustScore },
      { label: "Trust Tier", value: source.trustContext.trustTier },
      { label: "Verification Level", value: source.trustContext.verificationLevel },
    ],
  };
}

function buildEvidenceHealthCard(source: EvidenceExperienceSource): EvidenceOverviewView["evidence_health"] {
  return {
    id: "evidence-health",
    title: "Evidence Health",
    summary: source.evidenceHealth.completenessIndicator,
    fields: [
      { label: "Completeness Indicator", value: source.evidenceHealth.completenessIndicator },
      { label: "Missing Requirements", value: formatList(source.evidenceHealth.missingRequirements) },
      { label: "Review Readiness", value: source.evidenceHealth.reviewReadiness },
    ],
  };
}

export function buildEvidenceOverviewView(source: EvidenceExperienceSource): EvidenceOverviewView {
  return {
    evidence_summary: buildEvidenceSummaryCard(source),
    upload_statistics: buildUploadStatisticsCard(source),
    verification_status: buildVerificationStatusCard(source),
    contract_context: buildContractContextCard(source),
    trust_context: buildTrustContextCard(source),
    evidence_health: buildEvidenceHealthCard(source),
  };
}

export function createEvidenceOverviewPageModel(
  source: EvidenceExperienceSource
): EvidenceOverviewPageModel {
  return {
    page_id: "evidence-overview",
    title: "Evidence Overview",
    description: "Read-only evidence, upload, verification, and attestation summary for a contract.",
    view: buildEvidenceOverviewView(source),
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

export function renderEvidenceOverviewPage(model: EvidenceOverviewPageModel): string {
  const cards = [
    model.view.evidence_summary,
    model.view.upload_statistics,
    model.view.verification_status,
    model.view.contract_context,
    model.view.trust_context,
    model.view.evidence_health,
  ]
    .map((card) => renderResponseCard(card))
    .join("\n");

  return [
    `<section data-page="${model.page_id}">`,
    `<h1>${model.title}</h1>`,
    `<p>${model.description}</p>`,
    `<section data-section="evidence-cards">`,
    cards,
    `</section>`,
    `</section>`,
  ].join("\n");
}
