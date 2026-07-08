export {
  DYNAMIC_PRICING_SCHEMA_VERSION,
  DYNAMIC_PRICING_JSON_SCHEMA,
  DYNAMIC_PRICING_FIXED_TIMESTAMP,
  DYNAMIC_PRICING_ROUTES,
  PRICING_SCENARIO_IDS,
  PRICING_CHAIN,
  PRICING_CURRENCY,
  URGENCY_LEVELS,
  DISTANCE_BANDS,
  DIFFICULTY_LEVELS,
  CONFIDENCE_LEVELS,
  type PricingScenarioId,
  type UrgencyLevel,
  type DistanceBand,
  type DifficultyLevel,
  type ConfidenceLevel,
} from "./domain/dynamic-pricing-schema.js";

export type {
  PricingContext,
  PricingFactor,
  PricingBreakdown,
  PricingExplanation,
  PricingRecommendation,
  PricingRange,
  PricingConfidence,
  PricingSummary,
  PricingValidation,
} from "./domain/pricing-context.js";

export {
  PRICING_REFERENCE_VALUES,
  getCategoryBaseRate,
  resolveDifficultyLevel,
  difficultyMultiplier,
} from "./domain/pricing-reference-values.js";

export {
  buildPricingHome,
  toPricingRangeScreen,
  toPricingBreakdownScreen,
  toPricingExplanationScreen,
  toPricingSummaryScreen,
  toPricingValidationScreen,
  buildPricingSummary,
  collectDynamicPricingPaths,
  type PricingHome,
  type PricingRangeScreen,
  type PricingBreakdownScreen,
  type PricingExplanationScreen,
  type PricingSummaryScreen,
  type PricingValidationScreen,
} from "./domain/pricing-screens.js";

export {
  PRICING_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForPricing,
  isPricingScenarioId,
} from "./application/c3-pricing-bridge.js";

export {
  PricingFactorAnalyzer,
  createPricingFactorAnalyzer,
} from "./application/pricing-factor-analyzer.js";
export { PricingCalculator, createPricingCalculator } from "./application/pricing-calculator.js";
export {
  PricingExplanationBuilder,
  createPricingExplanationBuilder,
} from "./application/pricing-explanation-builder.js";
export {
  PricingConfidenceBuilder,
  createPricingConfidenceBuilder,
} from "./application/pricing-confidence-builder.js";
export { PricingValidator, createPricingValidator } from "./application/pricing-validator.js";

export {
  DynamicPricingService,
  createDynamicPricingService,
  createDynamicPricingModule,
  type DynamicPricingModule,
  type DynamicPricingQuery,
} from "./application/dynamic-pricing-service.js";

export {
  DynamicPricingRepository,
  createDynamicPricingRepository,
} from "./infrastructure/dynamic-pricing-repository.js";
