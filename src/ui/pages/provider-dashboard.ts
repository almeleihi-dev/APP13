import type { ProviderProfileResult, ProviderRiskLevel } from "../../provider/intelligence/types.js";
import type {
  AvailabilityResponseCard,
  CapabilityResponseCard,
  IdentityResponseCard,
  MatchingResponseCard,
  PricingResponseCard,
  ProviderDashboardPageModel,
  ProviderDashboardView,
  RiskResponseCard,
  TrustInputsResponseCard,
} from "../provider/types.js";

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return `${value.toLocaleString("en-US")} SAR`;
}

function formatList(values: string[] | null | undefined): string {
  if (!values || values.length === 0) {
    return "—";
  }
  return values.join(", ");
}

function formatBoolean(value: boolean): string {
  return value ? "Yes" : "No";
}

function bucketTrustScore(score: number): ProviderRiskLevel {
  if (score >= 85) {
    return "low";
  }
  if (score >= 65) {
    return "medium";
  }
  return "high";
}

function projectLateDeliveryRisk(result: ProviderProfileResult): ProviderRiskLevel {
  const { availability_profile } = result;

  if (availability_profile.available_now && availability_profile.estimated_start_days <= 3) {
    return "low";
  }

  if (availability_profile.estimated_start_days <= 7) {
    return "medium";
  }

  return "high";
}

function projectDisputeRisk(result: ProviderProfileResult): ProviderRiskLevel {
  return bucketTrustScore(result.trust_inputs.issue_score);
}

function projectQualityRisk(result: ProviderProfileResult): ProviderRiskLevel {
  const score = Math.round(
    (result.trust_inputs.rating_score + result.trust_inputs.refund_score) / 2
  );
  return bucketTrustScore(score);
}

function buildIdentityCard(result: ProviderProfileResult): IdentityResponseCard {
  const identity = result.identity_profile;

  return {
    id: "identity",
    title: "Identity",
    summary: identity.profession,
    fields: [
      { label: "Profession", value: identity.profession },
      { label: "Specializations", value: formatList(identity.specializations) },
      { label: "Experience Years", value: String(identity.experience_years) },
      { label: "Verification Level", value: identity.verification_level },
    ],
  };
}

function buildCapabilityCard(result: ProviderProfileResult): CapabilityResponseCard {
  const capability = result.capability_profile;

  return {
    id: "capability",
    title: "Capability",
    summary: capability.level,
    fields: [
      { label: "Level", value: capability.level },
      { label: "Capability Score", value: String(capability.capability_score) },
    ],
  };
}

function buildRiskCard(result: ProviderProfileResult): RiskResponseCard {
  return {
    id: "risk",
    title: "Risk",
    summary: result.risk_profile,
    fields: [
      { label: "Risk Level", value: result.risk_profile },
      { label: "Late Delivery Risk", value: projectLateDeliveryRisk(result) },
      { label: "Dispute Risk", value: projectDisputeRisk(result) },
      { label: "Quality Risk", value: projectQualityRisk(result) },
    ],
  };
}

function buildTrustInputsCard(result: ProviderProfileResult): TrustInputsResponseCard {
  const trust = result.trust_inputs;

  return {
    id: "trust-inputs",
    title: "Trust Inputs",
    summary: String(trust.verification_score),
    fields: [
      { label: "Verification Score", value: String(trust.verification_score) },
      { label: "Completion Score", value: String(trust.completion_score) },
      { label: "Rating Score", value: String(trust.rating_score) },
      { label: "Issue Score", value: String(trust.issue_score) },
      { label: "Refund Score", value: String(trust.refund_score) },
      { label: "Evidence Score", value: String(trust.evidence_score) },
    ],
  };
}

function buildPricingCard(result: ProviderProfileResult): PricingResponseCard {
  const pricing = result.pricing_profile;

  return {
    id: "pricing",
    title: "Pricing",
    summary: formatCurrency(pricing.average_price),
    fields: [
      { label: "Average Price", value: formatCurrency(pricing.average_price) },
      { label: "Pricing Position", value: pricing.pricing_position },
    ],
  };
}

function buildAvailabilityCard(result: ProviderProfileResult): AvailabilityResponseCard {
  const availability = result.availability_profile;

  return {
    id: "availability",
    title: "Availability",
    summary: formatBoolean(availability.available_now),
    fields: [
      { label: "Available Now", value: formatBoolean(availability.available_now) },
      {
        label: "Availability Hours Per Week",
        value: String(availability.availability_hours_per_week),
      },
      { label: "Active Contracts", value: String(availability.active_contracts) },
      { label: "Estimated Start Days", value: String(availability.estimated_start_days) },
    ],
  };
}

function buildMatchingCard(result: ProviderProfileResult): MatchingResponseCard {
  const matching = result.matching_profile;

  return {
    id: "matching",
    title: "Matching",
    summary: matching.preferred_contract_size,
    fields: [
      { label: "Matching Tags", value: formatList(matching.matching_tags) },
      { label: "Preferred Contract Size", value: matching.preferred_contract_size },
      { label: "Preferred Categories", value: formatList(matching.preferred_categories) },
    ],
  };
}

export function buildProviderDashboardView(result: ProviderProfileResult): ProviderDashboardView {
  return {
    risk_level: result.risk_profile,
    identity: buildIdentityCard(result),
    capability: buildCapabilityCard(result),
    risk: buildRiskCard(result),
    trust_inputs: buildTrustInputsCard(result),
    pricing: buildPricingCard(result),
    availability: buildAvailabilityCard(result),
    matching: buildMatchingCard(result),
  };
}

export function createProviderDashboardPageModel(
  providerId: string,
  result: ProviderProfileResult
): ProviderDashboardPageModel {
  return {
    page_id: "provider-dashboard",
    title: "Provider Dashboard",
    description: "AI-8 provider intelligence output projected into provider-facing cards.",
    provider_id: providerId,
    view: buildProviderDashboardView(result),
  };
}

function renderCard(card: {
  id: string;
  title: string;
  summary: string;
  fields: Array<{ label: string; value: string }>;
}): string {
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

export function renderProviderDashboardPage(model: ProviderDashboardPageModel): string {
  const cards = [
    model.view.identity,
    model.view.capability,
    model.view.risk,
    model.view.trust_inputs,
    model.view.pricing,
    model.view.availability,
    model.view.matching,
  ]
    .map((card) => renderCard(card))
    .join("\n");

  return [
    `<section data-page="${model.page_id}">`,
    `<h1>${model.title}</h1>`,
    `<p>${model.description}</p>`,
    `<p data-provider-id="${model.provider_id}">Provider: ${model.provider_id}</p>`,
    `<p data-risk-level="${model.view.risk_level}">Risk Level: ${model.view.risk_level}</p>`,
    `<section data-section="response-cards">`,
    cards,
    `</section>`,
    `</section>`,
  ].join("\n");
}
