import { AppError, ErrorCodes, problem } from "../../shared/errors/index.js";
import {
  buildComponentScores,
  buildMatchReasons,
  calculateMatchScore,
} from "./matching-rule-library.js";
import { resolveMatchRecommendation } from "./matching-weight-library.js";
import type { MatchingProvider, MatchingRankInput, MatchingRankResult, RankedMatch } from "./types.js";

function validateRequirement(requirement: MatchingRankInput["requirement"]): void {
  if (!requirement) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "matching",
        detail: "requirement is required",
      })
    );
  }

  if (!Array.isArray(requirement.required_action_codes)) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "matching",
        detail: "requirement.required_action_codes must be an array",
      })
    );
  }

  if (!Array.isArray(requirement.required_skills)) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "matching",
        detail: "requirement.required_skills must be an array",
      })
    );
  }

  if (typeof requirement.budget !== "number" || !Number.isFinite(requirement.budget)) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "matching",
        detail: "requirement.budget must be a finite number",
      })
    );
  }
}

function validateProvider(provider: MatchingProvider, index: number): void {
  if (!provider?.provider_id?.trim()) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "matching",
        detail: `providers[${index}].provider_id is required`,
      })
    );
  }

  const numericFields: Array<keyof Pick<MatchingProvider, "trust_score" | "average_rating" | "price_estimate">> = [
    "trust_score",
    "average_rating",
    "price_estimate",
  ];

  for (const field of numericFields) {
    if (typeof provider[field] !== "number" || !Number.isFinite(provider[field])) {
      throw new AppError(
        problem({
          title: "Bad Request",
          status: 400,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "matching",
          detail: `providers[${index}].${field} must be a finite number`,
        })
      );
    }
  }

  if (typeof provider.available_now !== "boolean") {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "matching",
        detail: `providers[${index}].available_now must be a boolean`,
      })
    );
  }
}

export class MatchingIntelligenceService {
  rank(input: MatchingRankInput): MatchingRankResult {
    validateRequirement(input.requirement);

    if (!Array.isArray(input.providers) || input.providers.length === 0) {
      throw new AppError(
        problem({
          title: "Bad Request",
          status: 400,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "matching",
          detail: "providers must be a non-empty array",
        })
      );
    }

    input.providers.forEach((provider, index) => validateProvider(provider, index));

    const ranked_matches: RankedMatch[] = input.providers
      .map((provider) => {
        const component_scores = buildComponentScores(input.requirement, provider);
        const match_score = calculateMatchScore(component_scores);
        const reasons = buildMatchReasons(input.requirement, provider, component_scores);

        return {
          provider_id: provider.provider_id,
          match_score,
          component_scores,
          recommendation: resolveMatchRecommendation(match_score),
          reasons,
        };
      })
      .sort((a, b) => b.match_score - a.match_score || a.provider_id.localeCompare(b.provider_id));

    return { ranked_matches };
  }
}

export function createMatchingIntelligenceService(): MatchingIntelligenceService {
  return new MatchingIntelligenceService();
}
