import type { ActionBlueprint } from "../../action-blueprint/domain/action-blueprint.js";
import type { TekrrExecutionProfile } from "../../tekrr-intelligence/domain/tekrr-profile.js";
import type { ExecutionBlueprint } from "../../execution-blueprint/domain/execution-blueprint.js";

export interface ProviderEligibility {
  minProviderTier: string;
  requiredCredentials: string[];
  requiredLicenses: string[];
  requiredTools: string[];
  skillLevel: string;
  evidenceLevel: string;
  insuranceRequired: boolean;
  eligible: boolean;
  summary: string;
}

export function buildProviderEligibility(input: {
  blueprint: ActionBlueprint;
  tekrrProfile: TekrrExecutionProfile;
  executionBlueprint: ExecutionBlueprint;
}): ProviderEligibility {
  const insuranceRequired = input.tekrrProfile.riskModel.insuranceRequired;

  return {
    minProviderTier: input.blueprint.minProviderTier,
    requiredCredentials: input.blueprint.actorRequirements.requiredCredentials,
    requiredLicenses: input.tekrrProfile.requiredLicenses,
    requiredTools: input.tekrrProfile.requiredTools,
    skillLevel: input.tekrrProfile.skillLevel.level,
    evidenceLevel: input.tekrrProfile.requiredEvidenceLevel.level,
    insuranceRequired,
    eligible: input.blueprint.status === "published" || input.blueprint.status === "validated",
    summary: `Provider eligibility requires tier ${input.blueprint.minProviderTier} with ${input.tekrrProfile.skillLevel.level} skill.`,
  };
}

export interface ProviderListingView {
  headline: string;
  scope_summary: string;
  deliverables: string[];
  required_tier: string;
  required_credentials: string[];
  milestone_count: number;
  estimated_duration_hours: { min: number; max: number };
  eligibility: ProviderEligibility;
}

export function buildProviderView(input: {
  blueprint: ActionBlueprint;
  tekrrProfile: TekrrExecutionProfile;
  executionBlueprint: ExecutionBlueprint;
  eligibility: ProviderEligibility;
}): ProviderListingView {
  return {
    headline: `Provide: ${input.blueprint.intent.verb} ${input.blueprint.intent.object}`,
    scope_summary: input.blueprint.summary,
    deliverables: input.executionBlueprint.deliverables.map((entry) => entry.label),
    required_tier: input.blueprint.minProviderTier,
    required_credentials: input.blueprint.actorRequirements.requiredCredentials,
    milestone_count: input.executionBlueprint.milestones.length,
    estimated_duration_hours: input.executionBlueprint.estimatedDurationHours,
    eligibility: input.eligibility,
  };
}
