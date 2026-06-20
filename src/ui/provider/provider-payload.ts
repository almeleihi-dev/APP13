import type { ProviderProfileInput } from "../../provider/intelligence/types.js";
import type { ProviderProfileFormInput } from "./types.js";

/** MVP demo provider profile for the provider experience (integration fixture only). */
export const MVP_DEMO_PROVIDER_PROFILE: ProviderProfileFormInput = {
  provider_id: "550e8400-e29b-41d4-a716-446655440000",
  profession: "software_developer",
  profile_text:
    "Full-stack TypeScript developer building APIs, React websites, and backend integrations.",
  years_experience: 8,
  certifications: "AWS Certified, Scrum Master",
  licenses: "Commercial Registration",
  completed_contracts: 52,
  completion_rate: 0.96,
  issue_rate: 0.03,
  refund_rate: 0.01,
  rating: 4.8,
  availability_hours_per_week: 30,
  active_contracts: 1,
  average_price: 12000,
  location_tier: "metro",
};

function parseList(value: string | undefined): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return items.length > 0 ? items : undefined;
}

export function buildProviderProfilePayload(input: ProviderProfileFormInput): ProviderProfileInput {
  return {
    provider_id: input.provider_id.trim(),
    profession: input.profession?.trim() || undefined,
    profile_text: input.profile_text?.trim() || undefined,
    years_experience: input.years_experience,
    certifications: parseList(input.certifications),
    licenses: parseList(input.licenses),
    completed_contracts: input.completed_contracts,
    completion_rate: input.completion_rate,
    issue_rate: input.issue_rate,
    refund_rate: input.refund_rate,
    rating: input.rating,
    availability_hours_per_week: input.availability_hours_per_week,
    active_contracts: input.active_contracts,
    average_price: input.average_price,
    location_tier: input.location_tier,
  };
}
