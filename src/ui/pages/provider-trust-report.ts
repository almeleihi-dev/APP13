import type {
  ProviderTrustReportPageModel,
  ProviderTrustReportView,
  TrustExperienceSource,
} from "../trust/types.js";

function formatList(values: string[]): string {
  if (values.length === 0) {
    return "None";
  }

  return values.join("; ");
}

export function buildProviderTrustReportView(source: TrustExperienceSource): ProviderTrustReportView {
  const report = source.providerReport;

  return {
    provider_id: report.providerId,
    header_fields: [
      { label: "Provider ID", value: report.providerId },
      { label: "Profession", value: report.profession },
      { label: "Capability Level", value: report.capabilityLevel },
      { label: "Trust Score", value: report.trustScore },
      { label: "Trust Tier", value: report.trustTier },
    ],
    sections: [
      {
        id: "verification-profile",
        title: "Verification Profile",
        fields: [
          { label: "Verification Level", value: report.verificationProfile.verificationLevel },
          { label: "Identity Status", value: report.verificationProfile.identityStatus },
          { label: "Licenses", value: formatList(report.verificationProfile.licenses) },
          { label: "Certifications", value: formatList(report.verificationProfile.certifications) },
        ],
      },
      {
        id: "risk-profile",
        title: "Risk Profile",
        fields: [
          { label: "Risk Level", value: report.riskProfile.riskLevel },
          { label: "Late Delivery Risk", value: report.riskProfile.lateDeliveryRisk },
          { label: "Dispute Risk", value: report.riskProfile.disputeRisk },
          { label: "Quality Risk", value: report.riskProfile.qualityRisk },
        ],
      },
      {
        id: "escrow-history",
        title: "Escrow History",
        fields: [
          { label: "Total Escrows", value: String(report.escrowHistory.totalEscrows) },
          { label: "Funded", value: report.escrowHistory.fundedLabel },
          { label: "Released", value: report.escrowHistory.releasedLabel },
          { label: "Refunded", value: report.escrowHistory.refundedLabel },
        ],
      },
      {
        id: "dispute-history",
        title: "Dispute History",
        fields: [
          { label: "Total Disputes", value: String(report.disputeHistory.totalDisputes) },
          { label: "Resolved", value: report.disputeHistory.resolvedLabel },
          { label: "Open", value: report.disputeHistory.openLabel },
          { label: "Impact", value: report.disputeHistory.impactLabel },
        ],
      },
      {
        id: "evidence-profile",
        title: "Evidence Profile",
        fields: [
          { label: "Evidence Count", value: String(report.evidenceProfile.evidenceCount) },
          { label: "Verified Evidence", value: String(report.evidenceProfile.verifiedEvidence) },
          { label: "Attested Evidence", value: String(report.evidenceProfile.attestedEvidence) },
          { label: "Evidence Health", value: report.evidenceProfile.evidenceHealth },
        ],
      },
      {
        id: "execution-profile",
        title: "Execution Profile",
        fields: [
          { label: "Active Contracts", value: String(report.executionProfile.activeContracts) },
          { label: "Accepted Milestones", value: String(report.executionProfile.acceptedMilestones) },
          { label: "Rejected Milestones", value: String(report.executionProfile.rejectedMilestones) },
          { label: "Completion Rate", value: report.executionProfile.completionRate },
        ],
      },
    ],
  };
}

export function createProviderTrustReportPageModel(
  source: TrustExperienceSource
): ProviderTrustReportPageModel {
  return {
    page_id: "provider-trust-report",
    title: "Provider Trust Report",
    description: "Read-only provider trust, risk, escrow, dispute, evidence, and execution report.",
    view: buildProviderTrustReportView(source),
  };
}

export function renderProviderTrustReportPage(model: ProviderTrustReportPageModel): string {
  const header = model.view.header_fields
    .map((field) => `<dt>${field.label}</dt><dd>${field.value}</dd>`)
    .join("");

  const sections = model.view.sections
    .map((section) => {
      const fields = section.fields
        .map((field) => `<dt>${field.label}</dt><dd>${field.value}</dd>`)
        .join("");

      return [
        `<section data-section="${section.id}">`,
        `<h2>${section.title}</h2>`,
        `<dl>${fields}</dl>`,
        `</section>`,
      ].join("\n");
    })
    .join("\n");

  return [
    `<section data-page="${model.page_id}">`,
    `<h1>${model.title}</h1>`,
    `<p>${model.description}</p>`,
    `<p data-provider-id="${model.view.provider_id}">Provider: ${model.view.provider_id}</p>`,
    `<section data-section="report-header">`,
    `<dl>${header}</dl>`,
    `</section>`,
    sections,
    `</section>`,
  ].join("\n");
}
