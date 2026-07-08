import type {
  ResponseCard,
  TrustCenterPageModel,
  TrustCenterView,
  TrustExperienceSource,
} from "../trust/types.js";

function formatList(values: string[]): string {
  if (values.length === 0) {
    return "None";
  }

  return values.join("; ");
}

function buildTrustSummaryCard(source: TrustExperienceSource): TrustCenterView["trust_summary"] {
  return {
    id: "trust-summary",
    title: "Trust Summary",
    summary: source.trustSummary.trustTier,
    fields: [
      { label: "Trust Score", value: source.trustSummary.trustScore },
      { label: "Trust Tier", value: source.trustSummary.trustTier },
      { label: "Confidence", value: source.trustSummary.confidence },
      { label: "Live Frame", value: source.trustSummary.liveFrame },
    ],
  };
}

function buildVerificationProfileCard(
  source: TrustExperienceSource
): TrustCenterView["verification_profile"] {
  return {
    id: "verification-profile",
    title: "Verification Profile",
    summary: source.verificationProfile.verificationLevel,
    fields: [
      { label: "Verification Level", value: source.verificationProfile.verificationLevel },
      { label: "Identity Status", value: source.verificationProfile.identityStatus },
      { label: "Licenses", value: formatList(source.verificationProfile.licenses) },
      { label: "Certifications", value: formatList(source.verificationProfile.certifications) },
    ],
  };
}

function buildPerformanceProfileCard(
  source: TrustExperienceSource
): TrustCenterView["performance_profile"] {
  return {
    id: "performance-profile",
    title: "Performance Profile",
    summary: source.performanceProfile.completionRate,
    fields: [
      { label: "Completion Rate", value: source.performanceProfile.completionRate },
      { label: "Accepted Milestones", value: String(source.performanceProfile.acceptedMilestones) },
      { label: "Rejected Milestones", value: String(source.performanceProfile.rejectedMilestones) },
      { label: "Active Contracts", value: String(source.performanceProfile.activeContracts) },
    ],
  };
}

function buildEvidenceProfileCard(source: TrustExperienceSource): TrustCenterView["evidence_profile"] {
  return {
    id: "evidence-profile",
    title: "Evidence Profile",
    summary: source.evidenceProfile.evidenceHealth,
    fields: [
      { label: "Evidence Count", value: String(source.evidenceProfile.evidenceCount) },
      { label: "Verified Evidence", value: String(source.evidenceProfile.verifiedEvidence) },
      { label: "Attested Evidence", value: String(source.evidenceProfile.attestedEvidence) },
      { label: "Evidence Health", value: source.evidenceProfile.evidenceHealth },
    ],
  };
}

function buildEscrowProfileCard(source: TrustExperienceSource): TrustCenterView["escrow_profile"] {
  return {
    id: "escrow-profile",
    title: "Escrow Profile",
    summary: String(source.escrowProfile.escrowCount),
    fields: [
      { label: "Escrow Count", value: String(source.escrowProfile.escrowCount) },
      { label: "Funded", value: source.escrowProfile.funded },
      { label: "Released", value: source.escrowProfile.released },
      { label: "Refunded", value: source.escrowProfile.refunded },
    ],
  };
}

function buildDisputeProfileCard(source: TrustExperienceSource): TrustCenterView["dispute_profile"] {
  return {
    id: "dispute-profile",
    title: "Dispute Profile",
    summary: String(source.disputeProfile.disputeCount),
    fields: [
      { label: "Dispute Count", value: String(source.disputeProfile.disputeCount) },
      { label: "Resolved Disputes", value: String(source.disputeProfile.resolvedDisputes) },
      { label: "Open Disputes", value: String(source.disputeProfile.openDisputes) },
      { label: "Dispute Impact", value: source.disputeProfile.disputeImpact },
    ],
  };
}

function buildAvailabilityProfileCard(
  source: TrustExperienceSource
): TrustCenterView["availability_profile"] {
  return {
    id: "availability-profile",
    title: "Availability Profile",
    summary: source.availabilityProfile.availableNow,
    fields: [
      { label: "Available Now", value: source.availabilityProfile.availableNow },
      { label: "Response Speed", value: source.availabilityProfile.responseSpeed },
      { label: "Workload", value: source.availabilityProfile.workload },
      { label: "Start Delay", value: source.availabilityProfile.startDelay },
    ],
  };
}

function buildFinancialProfileCard(source: TrustExperienceSource): TrustCenterView["financial_profile"] {
  return {
    id: "financial-profile",
    title: "Financial Profile",
    summary: source.financialProfile.pricingPosition,
    fields: [
      { label: "Average Contract Value", value: source.financialProfile.averageContractValue },
      { label: "Pricing Position", value: source.financialProfile.pricingPosition },
      { label: "Budget Band", value: source.financialProfile.budgetBand },
      { label: "Market Band", value: source.financialProfile.marketBand },
      { label: "Premium Band", value: source.financialProfile.premiumBand },
    ],
  };
}

function buildMatchingProfileCard(source: TrustExperienceSource): TrustCenterView["matching_profile"] {
  return {
    id: "matching-profile",
    title: "Matching Profile",
    summary: source.matchingProfile.matchingStrength,
    fields: [
      { label: "Categories", value: formatList(source.matchingProfile.categories) },
      { label: "Specializations", value: formatList(source.matchingProfile.specializations) },
      { label: "Action Codes", value: formatList(source.matchingProfile.actionCodes) },
      { label: "Matching Strength", value: source.matchingProfile.matchingStrength },
    ],
  };
}

function buildTrustTimelineSummaryCard(
  source: TrustExperienceSource
): TrustCenterView["trust_timeline"] {
  return {
    id: "trust-timeline",
    title: "Trust Timeline",
    summary: source.timelineSummary.trustChanges,
    fields: [
      { label: "Verification Events", value: source.timelineSummary.verificationEvents },
      { label: "Milestone Completions", value: source.timelineSummary.milestoneCompletions },
      { label: "Evidence Verification", value: source.timelineSummary.evidenceVerification },
      { label: "Disputes", value: source.timelineSummary.disputes },
      { label: "Trust Changes", value: source.timelineSummary.trustChanges },
    ],
  };
}

export function buildTrustCenterView(source: TrustExperienceSource): TrustCenterView {
  return {
    provider_id: source.providerId,
    trust_tier: source.trustSummary.trustTier,
    trust_summary: buildTrustSummaryCard(source),
    verification_profile: buildVerificationProfileCard(source),
    performance_profile: buildPerformanceProfileCard(source),
    evidence_profile: buildEvidenceProfileCard(source),
    escrow_profile: buildEscrowProfileCard(source),
    dispute_profile: buildDisputeProfileCard(source),
    availability_profile: buildAvailabilityProfileCard(source),
    financial_profile: buildFinancialProfileCard(source),
    matching_profile: buildMatchingProfileCard(source),
    trust_timeline: buildTrustTimelineSummaryCard(source),
  };
}

export function createTrustCenterPageModel(source: TrustExperienceSource): TrustCenterPageModel {
  return {
    page_id: "trust-center",
    title: "Trust Center",
    description: "Read-only unified trust, verification, performance, and lifecycle snapshot view.",
    view: buildTrustCenterView(source),
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

export function renderTrustCenterPage(model: TrustCenterPageModel): string {
  const cards = [
    model.view.trust_summary,
    model.view.verification_profile,
    model.view.performance_profile,
    model.view.evidence_profile,
    model.view.escrow_profile,
    model.view.dispute_profile,
    model.view.availability_profile,
    model.view.financial_profile,
    model.view.matching_profile,
    model.view.trust_timeline,
  ]
    .map((card) => renderResponseCard(card))
    .join("\n");

  return [
    `<section data-page="${model.page_id}">`,
    `<h1>${model.title}</h1>`,
    `<p>${model.description}</p>`,
    `<p data-provider-id="${model.view.provider_id}" data-trust-tier="${model.view.trust_tier}">Provider: ${model.view.provider_id}</p>`,
    `<section data-section="trust-cards">`,
    cards,
    `</section>`,
    `</section>`,
  ].join("\n");
}
