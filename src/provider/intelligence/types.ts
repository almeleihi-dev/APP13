import type { IdentityVerificationLevel } from "../../trust/intelligence/types.js";

export type CapabilityLevel = "junior" | "professional" | "senior" | "expert";

export type PricingPosition = "budget" | "market" | "premium";

export type ProviderRiskLevel = "low" | "medium" | "high";

export type LocationTier = "metro" | "city" | "rural";

export type PreferredContractSize = "small" | "medium" | "large";

export interface ProviderProfileInput {
  provider_id: string;
  profession?: string;
  profile_text?: string;
  years_experience?: number;
  certifications?: string[];
  licenses?: string[];
  completed_contracts?: number;
  completion_rate?: number;
  issue_rate?: number;
  refund_rate?: number;
  rating?: number;
  availability_hours_per_week?: number;
  active_contracts?: number;
  average_price?: number;
  location_tier?: LocationTier;
}

export interface IdentityProfile {
  profession: string;
  specializations: string[];
  experience_years: number;
  verification_level: IdentityVerificationLevel;
}

export interface ActionProfile {
  action_codes: string[];
  skills: string[];
  deliverables: string[];
}

export interface CapabilityProfile {
  level: CapabilityLevel;
  capability_score: number;
}

export interface ProviderTrustInputs {
  verification_score: number;
  completion_score: number;
  rating_score: number;
  issue_score: number;
  refund_score: number;
  evidence_score: number;
}

export interface PricingProfile {
  average_price: number;
  pricing_position: PricingPosition;
}

export interface AvailabilityProfile {
  available_now: boolean;
  availability_hours_per_week: number;
  active_contracts: number;
  estimated_start_days: number;
}

export interface MatchingProfile {
  matching_tags: string[];
  preferred_contract_size: PreferredContractSize;
  preferred_categories: string[];
}

export interface ProviderProfileResult {
  identity_profile: IdentityProfile;
  action_profile: ActionProfile;
  capability_profile: CapabilityProfile;
  trust_inputs: ProviderTrustInputs;
  pricing_profile: PricingProfile;
  availability_profile: AvailabilityProfile;
  matching_profile: MatchingProfile;
  risk_profile: ProviderRiskLevel;
}
