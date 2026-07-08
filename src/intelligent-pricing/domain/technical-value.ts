import type { ActionBlueprint } from "../../action-blueprint/domain/action-blueprint.js";
import type { ExecutionBlueprint } from "../../execution-blueprint/domain/execution-blueprint.js";
import type { TekrrExecutionProfile } from "../../tekrr-intelligence/domain/tekrr-profile.js";
import type { MarketplaceListing } from "../../marketplace-compilation/domain/marketplace-listing.js";
import { COMPLEXITY_MULTIPLIER, DOMAIN_HOURLY_RATE_CENTS } from "./pricing-schema.js";

export interface TechnicalValue {
  score: number;
  amountCents: number;
  components: {
    blueprintComplexity: number;
    tekrrScore: number;
    executionScore: number;
    skillWeight: number;
    certificationWeight: number;
    durationWeight: number;
    riskWeight: number;
    qualityWeight: number;
  };
  summary: string;
}

const SKILL_WEIGHT: Record<string, number> = {
  entry: 1.0,
  professional: 1.15,
  expert: 1.3,
  master: 1.45,
};

const TIER_WEIGHT: Record<string, number> = {
  T1: 1.0,
  T2: 1.2,
  T3: 1.4,
};

const CERT_WEIGHT: Record<string, number> = {
  unverified: 0.9,
  bronze: 1.0,
  silver: 1.05,
  gold: 1.1,
  platinum: 1.15,
};

function avgDurationHours(listing: MarketplaceListing): number {
  return Math.round(
    (listing.estimatedDuration.min + listing.estimatedDuration.max) / 2
  );
}

export function calculateTechnicalValue(input: {
  listing: MarketplaceListing;
  blueprint: ActionBlueprint;
  tekrrProfile: TekrrExecutionProfile;
  executionBlueprint: ExecutionBlueprint;
  certificationLevel: string;
}): TechnicalValue {
  const hourlyRate = DOMAIN_HOURLY_RATE_CENTS[input.listing.categoryMetadata.domain] ?? 10000;
  const complexityMult =
    COMPLEXITY_MULTIPLIER[input.listing.executionComplexity] ?? 1.15;
  const durationHours = avgDurationHours(input.listing);
  const skillWeight = SKILL_WEIGHT[input.tekrrProfile.skillLevel.level] ?? 1.0;
  const tierWeight = TIER_WEIGHT[input.blueprint.minProviderTier] ?? 1.0;
  const certWeight = CERT_WEIGHT[input.certificationLevel] ?? 1.0;
  const riskWeight = 1 + (input.blueprint.riskLevelDefault - 3) * 0.05;
  const qualityWeight = 1 + input.tekrrProfile.executionScore.score / 500;

  const blueprintComplexity = Math.min(
    100,
    input.executionBlueprint.milestones.length * 12 +
      input.listing.requiredSkills.length * 5 +
      input.blueprint.evidenceRequirements.length * 4
  );
  const tekrrScore = input.tekrrProfile.executionScore.score;
  const executionScore = input.tekrrProfile.executionScore.score;

  const score = Math.round(
    blueprintComplexity * 0.25 +
      tekrrScore * 0.25 +
      executionScore * 0.2 +
      durationHours * 3 +
      skillWeight * 10 +
      certWeight * 8
  );

  const amountCents = Math.round(
    durationHours *
      hourlyRate *
      complexityMult *
      skillWeight *
      tierWeight *
      certWeight *
      riskWeight *
      qualityWeight
  );

  return {
    score: Math.min(100, score),
    amountCents,
    components: {
      blueprintComplexity,
      tekrrScore,
      executionScore,
      skillWeight,
      certificationWeight: certWeight,
      durationWeight: durationHours,
      riskWeight,
      qualityWeight,
    },
    summary: `Technical value ${Math.min(100, score)}/100 → ${amountCents} cents from ${durationHours}h at domain rate.`,
  };
}
