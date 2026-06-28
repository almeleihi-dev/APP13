import type {
  ConfidenceLevel,
  DifficultyLevel,
  DistanceBand,
  PricingScenarioId,
  UrgencyLevel,
} from "./dynamic-pricing-schema.js";

export interface PricingContext {
  scenarioId?: PricingScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface PricingFactor {
  factorId: string;
  label: string;
  category:
    | "complexity"
    | "timeline"
    | "skills"
    | "resources"
    | "parallel"
    | "sequential"
    | "risk"
    | "urgency"
    | "distance"
    | "trust"
    | "market"
    | "difficulty";
  weight: number;
  contributionMin: number;
  contributionMax: number;
  unit: string;
  trace: string;
}

export interface PricingRange {
  min: number;
  max: number;
  currency: string;
  midpoint: number;
}

export interface PricingConfidence {
  level: ConfidenceLevel;
  score: number;
  rationale: string;
  dataCompleteness: number;
}

export interface PricingBreakdown {
  breakdownId: string;
  baseRateMin: number;
  baseRateMax: number;
  factors: PricingFactor[];
  subtotalMin: number;
  subtotalMax: number;
  complexityScore: number;
  difficultyLevel: DifficultyLevel;
}

export interface PricingExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  factorNarratives: string[];
  timelineInfluence: string;
  skillsInfluence: string;
  resourcesInfluence: string;
  riskInfluence: string;
  difficultyInfluence: string;
  trustRecommendation: string;
}

export interface PricingRecommendation {
  recommendationId: string;
  planId: string;
  canonicalActionId: string;
  scenarioId: PricingScenarioId | null;
  goal: string;
  marketCategory: string;
  recommendedRange: PricingRange;
  confidence: PricingConfidence;
  breakdown: PricingBreakdown;
  explanation: PricingExplanation;
  readOnly: true;
}

export interface PricingSummary {
  schemaVersion: string;
  recommendationId: string;
  goal: string;
  canonicalActionId: string;
  scenarioId: PricingScenarioId | null;
  priceRangeSummary: string;
  confidenceLevel: ConfidenceLevel;
  complexityScore: number;
  difficultyLevel: DifficultyLevel;
  factorCount: number;
  pricingChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface PricingValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}
