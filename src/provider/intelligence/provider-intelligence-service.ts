import { AppError, ErrorCodes, problem } from "../../shared/errors/index.js";
import type { ActionIntelligenceService } from "../../action/intelligence/action-intelligence-service.js";
import { createActionIntelligenceService } from "../../action/intelligence/action-intelligence-service.js";
import {
  buildActionProfileFromExtract,
  buildActionProfileFromProfession,
  buildAvailabilityProfile,
  buildCapabilityProfile,
  buildIdentityProfile,
  buildMatchingProfile,
  buildPricingProfile,
  buildRiskProfile,
  buildTrustInputs,
} from "./provider-rule-library.js";
import type { ProviderProfileInput, ProviderProfileResult } from "./types.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const LOCATION_TIERS = ["metro", "city", "rural"] as const;

function validateInput(input: ProviderProfileInput): void {
  const providerId = input.provider_id?.trim() ?? "";

  if (!providerId) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "provider",
        detail: "provider_id is required",
      })
    );
  }

  if (!UUID_PATTERN.test(providerId)) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "provider",
        detail: "provider_id must be a valid UUID",
      })
    );
  }

  const numericFields: Array<keyof ProviderProfileInput> = [
    "years_experience",
    "completed_contracts",
    "completion_rate",
    "issue_rate",
    "refund_rate",
    "rating",
    "availability_hours_per_week",
    "active_contracts",
    "average_price",
  ];

  for (const field of numericFields) {
    const value = input[field];
    if (value === undefined) continue;

    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new AppError(
        problem({
          title: "Bad Request",
          status: 400,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "provider",
          detail: `${field} must be a non-negative finite number when provided`,
        })
      );
    }
  }

  if (input.rating !== undefined && input.rating > 5) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "provider",
        detail: "rating must be between 0 and 5 when provided",
      })
    );
  }

  for (const field of ["completion_rate", "issue_rate", "refund_rate"] as const) {
    const value = input[field];
    if (value !== undefined && value > 1) {
      throw new AppError(
        problem({
          title: "Bad Request",
          status: 400,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "provider",
          detail: `${field} must be between 0 and 1 when provided`,
        })
      );
    }
  }

  if (input.location_tier !== undefined && !LOCATION_TIERS.includes(input.location_tier)) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "provider",
        detail: "location_tier must be one of: metro, city, rural",
      })
    );
  }

  for (const field of ["certifications", "licenses"] as const) {
    const value = input[field];
    if (value !== undefined && !Array.isArray(value)) {
      throw new AppError(
        problem({
          title: "Bad Request",
          status: 400,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "provider",
          detail: `${field} must be an array when provided`,
        })
      );
    }
  }
}

export class ProviderIntelligenceService {
  constructor(private readonly actionIntelligence: ActionIntelligenceService) {}

  profile(input: ProviderProfileInput): ProviderProfileResult {
    validateInput(input);

    const profileText = input.profile_text?.trim() ?? "";
    const actionExtract = profileText
      ? this.actionIntelligence.extract({
          profession: input.profession,
          cv_text: profileText,
        })
      : null;

    const identity_profile = buildIdentityProfile(input, actionExtract);
    const action_profile = actionExtract
      ? buildActionProfileFromExtract(actionExtract)
      : buildActionProfileFromProfession(identity_profile.profession);
    const capability_profile = buildCapabilityProfile(identity_profile.experience_years);
    const trust_inputs = buildTrustInputs(input);
    const pricing_profile = buildPricingProfile(
      input,
      identity_profile.profession,
      action_profile.action_codes
    );
    const availability_profile = buildAvailabilityProfile(input);
    const matching_profile = buildMatchingProfile(
      input,
      identity_profile,
      action_profile,
      capability_profile.level,
      pricing_profile
    );
    const risk_profile = buildRiskProfile(input);

    return {
      identity_profile,
      action_profile,
      capability_profile,
      trust_inputs,
      pricing_profile,
      availability_profile,
      matching_profile,
      risk_profile,
    };
  }
}

export function createProviderIntelligenceService(): ProviderIntelligenceService {
  return new ProviderIntelligenceService(createActionIntelligenceService());
}
