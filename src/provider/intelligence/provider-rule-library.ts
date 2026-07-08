import type { ActionExtractResult } from "../../action/intelligence/types.js";
import { PROFESSION_ACTION_LIBRARY, localizeLabels } from "../../action/intelligence/profession-action-library.js";
import { resolveBenchmarkBand } from "../../pricing/intelligence/pricing-benchmark-library.js";
import {
  buildComponentScores,
  scoreVerification,
} from "../../trust/intelligence/trust-rule-library.js";
import type { IdentityVerificationLevel, TrustBehaviorMetrics } from "../../trust/intelligence/types.js";
import { buildCapabilityProfile } from "./capability-rule-library.js";
import { resolveProviderRiskProfile } from "./risk-profile-library.js";
import type {
  ActionProfile,
  AvailabilityProfile,
  IdentityProfile,
  MatchingProfile,
  PreferredContractSize,
  PricingPosition,
  PricingProfile,
  ProviderProfileInput,
  ProviderTrustInputs,
} from "./types.js";

const DOMAIN_CATEGORY_MAP: Record<string, string> = {
  A: "cleaning",
  B: "construction",
  C: "consulting",
  D: "personal_care",
  E: "software",
  F: "events",
  G: "education",
  H: "inspection",
};

function clampRate(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function normalizeProfession(value: string | undefined): string {
  return value?.trim() ?? "";
}

function resolveProfessionMapping(profession: string) {
  const normalized = profession.toLowerCase();
  return (
    PROFESSION_ACTION_LIBRARY.find(
      (mapping) =>
        mapping.id === normalized ||
        mapping.profession.en.toLowerCase() === normalized ||
        mapping.profession.ar === profession
    ) ?? null
  );
}

export function resolveVerificationLevel(
  certifications: string[],
  licenses: string[]
): IdentityVerificationLevel {
  if (licenses.length >= 1 && certifications.length >= 2) {
    return "iron";
  }
  if (certifications.length + licenses.length >= 3) {
    return "gold";
  }
  if (certifications.length + licenses.length >= 1) {
    return "silver";
  }
  return "bronze";
}

function deriveEvidenceQualityScore(input: ProviderProfileInput): number {
  let score = 0.5;
  if (input.profile_text?.trim()) score += 0.2;
  if ((input.certifications?.length ?? 0) > 0) score += 0.15;
  if ((input.licenses?.length ?? 0) > 0) score += 0.15;
  return Math.min(1, score);
}

export function buildIdentityProfile(
  input: ProviderProfileInput,
  actionExtract: ActionExtractResult | null
): IdentityProfile {
  const profession =
    normalizeProfession(input.profession) ||
    actionExtract?.profession ||
    "general";
  const certifications = input.certifications ?? [];
  const licenses = input.licenses ?? [];
  const specializations = [
    ...certifications,
    ...(actionExtract?.skills.slice(0, 3) ?? []),
  ].slice(0, 5);

  return {
    profession,
    specializations,
    experience_years: Math.max(0, input.years_experience ?? 0),
    verification_level: resolveVerificationLevel(certifications, licenses),
  };
}

export function buildActionProfileFromExtract(actionExtract: ActionExtractResult): ActionProfile {
  return {
    action_codes: actionExtract.actions.map((action) => action.action_code),
    skills: actionExtract.skills,
    deliverables: actionExtract.deliverables,
  };
}

export function buildActionProfileFromProfession(profession: string): ActionProfile {
  const mapping = resolveProfessionMapping(profession);
  if (!mapping) {
    return { action_codes: [], skills: [], deliverables: [] };
  }

  return {
    action_codes: [...mapping.actionCodes],
    skills: localizeLabels(mapping.skills, "en"),
    deliverables: localizeLabels(mapping.deliverables, "en"),
  };
}

export function buildTrustInputs(input: ProviderProfileInput): ProviderTrustInputs {
  const certifications = input.certifications ?? [];
  const licenses = input.licenses ?? [];
  const verificationLevel = resolveVerificationLevel(certifications, licenses);

  const metrics: TrustBehaviorMetrics = {
    completed_contracts: Math.max(0, input.completed_contracts ?? 0),
    completion_rate: clampRate(input.completion_rate ?? 0),
    average_rating: Math.max(0, Math.min(5, input.rating ?? 0)),
    refund_rate: clampRate(input.refund_rate ?? 0),
    issue_rate: clampRate(input.issue_rate ?? 0),
    evidence_quality_score: deriveEvidenceQualityScore(input),
    identity_verification_level: verificationLevel,
  };

  const components = buildComponentScores(metrics);

  return {
    verification_score: scoreVerification(verificationLevel),
    completion_score: components.completion,
    rating_score: components.rating,
    issue_score: components.issues,
    refund_score: components.refunds,
    evidence_score: components.evidence,
  };
}

function resolvePreferredContractSize(averagePrice: number): PreferredContractSize {
  if (averagePrice < 3000) return "small";
  if (averagePrice <= 15000) return "medium";
  return "large";
}

export function resolvePricingPosition(
  profession: string,
  actionCodes: string[],
  averagePrice: number
): PricingPosition {
  const benchmark = resolveBenchmarkBand(profession, actionCodes);
  if (averagePrice <= benchmark.min * 1.2) return "budget";
  if (averagePrice >= benchmark.max * 0.8) return "premium";
  return "market";
}

export function buildPricingProfile(
  input: ProviderProfileInput,
  profession: string,
  actionCodes: string[]
): PricingProfile {
  const benchmark = resolveBenchmarkBand(profession, actionCodes);
  const averagePrice =
    typeof input.average_price === "number" && input.average_price >= 0
      ? input.average_price
      : Math.round((benchmark.min + benchmark.max) / 2);

  return {
    average_price: averagePrice,
    pricing_position: resolvePricingPosition(profession, actionCodes, averagePrice),
  };
}

export function buildAvailabilityProfile(input: ProviderProfileInput): AvailabilityProfile {
  const availabilityHours = Math.max(0, input.availability_hours_per_week ?? 0);
  const activeContracts = Math.max(0, input.active_contracts ?? 0);
  const availableNow = availabilityHours >= 10 && activeContracts < 5;
  const estimatedStartDays = availableNow
    ? Math.max(0, activeContracts * 3)
    : Math.max(7, activeContracts * 7);

  return {
    available_now: availableNow,
    availability_hours_per_week: availabilityHours,
    active_contracts: activeContracts,
    estimated_start_days: estimatedStartDays,
  };
}

function resolvePreferredCategories(actionCodes: string[]): string[] {
  const categories = new Set<string>();
  for (const actionCode of actionCodes) {
    const domain = actionCode.trim().charAt(0).toUpperCase();
    const category = DOMAIN_CATEGORY_MAP[domain];
    if (category) categories.add(category);
  }
  return [...categories].sort();
}

export function buildMatchingProfile(
  input: ProviderProfileInput,
  identity: IdentityProfile,
  actionProfile: ActionProfile,
  capabilityLevel: string,
  pricingProfile: PricingProfile
): MatchingProfile {
  const tags = [
    identity.profession.toLowerCase(),
    capabilityLevel,
    pricingProfile.pricing_position,
    input.location_tier ?? "city",
    ...actionProfile.skills.slice(0, 3).map((skill) => skill.toLowerCase()),
  ].filter((tag, index, array) => tag.length > 0 && array.indexOf(tag) === index);

  return {
    matching_tags: tags,
    preferred_contract_size: resolvePreferredContractSize(pricingProfile.average_price),
    preferred_categories: resolvePreferredCategories(actionProfile.action_codes),
  };
}

export function buildRiskProfile(input: ProviderProfileInput) {
  return resolveProviderRiskProfile({
    years_experience: Math.max(0, input.years_experience ?? 0),
    completion_rate: clampRate(input.completion_rate ?? 0),
    issue_rate: clampRate(input.issue_rate ?? 0),
    refund_rate: clampRate(input.refund_rate ?? 0),
  });
}

export { buildCapabilityProfile };
