import { AppError, ErrorCodes, problem } from "../../shared/errors/index.js";
import { calculateTrustScore } from "./trust-rule-library.js";
import { resolveTrustTier } from "./trust-tier-library.js";
import type { TrustCalculateInput, TrustCalculateResult } from "./types.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeProviderId(value: string): string {
  return value.trim();
}

function validateMetrics(metrics: TrustCalculateInput["metrics"]): void {
  const requiredNumbers: Array<keyof TrustCalculateInput["metrics"]> = [
    "completed_contracts",
    "completion_rate",
    "average_rating",
    "refund_rate",
    "issue_rate",
    "evidence_quality_score",
  ];

  for (const field of requiredNumbers) {
    const value = metrics[field];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new AppError(
        problem({
          title: "Bad Request",
          status: 400,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "trust",
          detail: `metrics.${field} must be a finite number`,
        })
      );
    }
  }

  if (
    typeof metrics.identity_verification_level !== "string" ||
    metrics.identity_verification_level.trim().length === 0
  ) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "trust",
        detail: "metrics.identity_verification_level is required",
      })
    );
  }
}

export class TrustIntelligenceService {
  calculate(input: TrustCalculateInput): TrustCalculateResult {
    const providerId = normalizeProviderId(input.provider_id ?? "");

    if (!providerId) {
      throw new AppError(
        problem({
          title: "Bad Request",
          status: 400,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "trust",
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
          engine: "trust",
          detail: "provider_id must be a valid UUID",
        })
      );
    }

    if (!input.metrics) {
      throw new AppError(
        problem({
          title: "Bad Request",
          status: 400,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "trust",
          detail: "metrics is required",
        })
      );
    }

    validateMetrics(input.metrics);

    const { trust_score, component_scores } = calculateTrustScore(input.metrics);
    const tier = resolveTrustTier(trust_score);

    return {
      trust_score,
      trust_tier: tier.tier,
      live_frame_color: tier.liveFrameColor,
      component_scores,
      recommendation: tier.recommendation,
      restrictions: [...tier.restrictions],
    };
  }
}

export function createTrustIntelligenceService(): TrustIntelligenceService {
  return new TrustIntelligenceService();
}
