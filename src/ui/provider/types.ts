import type {
  AvailabilityProfile,
  CapabilityProfile,
  IdentityProfile,
  LocationTier,
  MatchingProfile,
  PricingProfile,
  ProviderProfileInput,
  ProviderProfileResult,
  ProviderRiskLevel,
  ProviderTrustInputs,
} from "../../provider/intelligence/types.js";

export type { ProviderProfileInput, ProviderProfileResult, ProviderRiskLevel, LocationTier };

export interface ProviderProfileFormInput {
  provider_id: string;
  profession?: string;
  profile_text?: string;
  years_experience?: number;
  certifications?: string;
  licenses?: string;
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

export type ProviderProfileValidationField = keyof ProviderProfileFormInput;

export interface ProviderProfileValidationError {
  field: ProviderProfileValidationField;
  message: string;
}

export interface ProviderProfileValidationResult {
  valid: boolean;
  errors: ProviderProfileValidationError[];
}

export interface ProviderClientConfig {
  baseUrl: string;
  authToken?: string;
  fetchImpl?: typeof fetch;
}

export type ProviderProfileExecutor = (input: ProviderProfileInput) => Promise<ProviderProfileResult>;

export interface ProviderClientOptions extends ProviderClientConfig {
  executor?: ProviderProfileExecutor;
}

export interface CardField {
  label: string;
  value: string;
}

export interface ResponseCard {
  id: string;
  title: string;
  summary: string;
  fields: CardField[];
}

export interface IdentityResponseCard extends ResponseCard {
  id: "identity";
}

export interface CapabilityResponseCard extends ResponseCard {
  id: "capability";
}

export interface RiskResponseCard extends ResponseCard {
  id: "risk";
}

export interface TrustInputsResponseCard extends ResponseCard {
  id: "trust-inputs";
}

export interface PricingResponseCard extends ResponseCard {
  id: "pricing";
}

export interface AvailabilityResponseCard extends ResponseCard {
  id: "availability";
}

export interface MatchingResponseCard extends ResponseCard {
  id: "matching";
}

export interface ProviderDashboardView {
  risk_level: ProviderRiskLevel;
  identity: IdentityResponseCard;
  capability: CapabilityResponseCard;
  risk: RiskResponseCard;
  trust_inputs: TrustInputsResponseCard;
  pricing: PricingResponseCard;
  availability: AvailabilityResponseCard;
  matching: MatchingResponseCard;
}

export interface ProviderProfilePageModel {
  page_id: "provider-profile";
  title: string;
  description: string;
  submit_label: string;
  fields: Array<{
    name: ProviderProfileValidationField;
    label: string;
    required: boolean;
    type: "text" | "number";
    placeholder?: string;
  }>;
}

export interface ProviderDashboardPageModel {
  page_id: "provider-dashboard";
  title: string;
  description: string;
  provider_id: string;
  view: ProviderDashboardView;
}

export interface AnalyzeProviderResult {
  request: ProviderProfileFormInput;
  profile: ProviderProfileResult;
  view: ProviderDashboardView;
}

export type {
  IdentityProfile,
  CapabilityProfile,
  ProviderTrustInputs,
  PricingProfile,
  AvailabilityProfile,
  MatchingProfile,
};
