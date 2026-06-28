import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import {
  DYNAMIC_PRICING_JSON_SCHEMA,
  DYNAMIC_PRICING_ROUTES,
  DYNAMIC_PRICING_SCHEMA_VERSION,
  type DistanceBand,
  type PricingScenarioId,
  type UrgencyLevel,
} from "../domain/dynamic-pricing-schema.js";
import type { PricingContext } from "../domain/pricing-context.js";
import {
  buildPricingHome,
  buildPricingSummary,
  toPricingBreakdownScreen,
  toPricingExplanationScreen,
  toPricingRangeScreen,
  toPricingSummaryScreen,
  toPricingValidationScreen,
} from "../domain/pricing-screens.js";
import { resolveCanonicalActionIdForPricing } from "./c3-pricing-bridge.js";
import { createPricingFactorAnalyzer } from "./pricing-factor-analyzer.js";
import { createPricingCalculator } from "./pricing-calculator.js";
import { createPricingExplanationBuilder } from "./pricing-explanation-builder.js";
import { createPricingConfidenceBuilder } from "./pricing-confidence-builder.js";
import { createPricingValidator } from "./pricing-validator.js";
import { getCategoryBaseRate } from "../domain/pricing-reference-values.js";
import {
  createDynamicPricingRepository,
  type DynamicPricingRepository,
} from "../infrastructure/dynamic-pricing-repository.js";

export interface DynamicPricingQuery {
  scenario_id?: PricingScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class DynamicPricingService {
  private readonly repository: DynamicPricingRepository;
  private readonly factorAnalyzer = createPricingFactorAnalyzer();
  private readonly calculator = createPricingCalculator();
  private readonly explanationBuilder = createPricingExplanationBuilder();
  private readonly confidenceBuilder = createPricingConfidenceBuilder();
  private readonly validator = createPricingValidator();

  constructor(deps?: { repository?: DynamicPricingRepository }) {
    this.repository = deps?.repository ?? createDynamicPricingRepository();
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const scenarios = this.repository.listPricingScenarios().map((entry) => ({
      scenario_id: entry.scenarioId,
      canonical_action_id: entry.canonicalActionId,
      goal: entry.goal,
    }));
    return buildPricingHome({ scenarios });
  }

  getRange(authContext: AuthContext, query: DynamicPricingQuery = {}) {
    this.assertAuthenticated(authContext);
    const recommendation = this.buildRecommendation(toContext(query));
    return toPricingRangeScreen(recommendation);
  }

  getBreakdown(authContext: AuthContext, query: DynamicPricingQuery = {}) {
    this.assertAuthenticated(authContext);
    const recommendation = this.buildRecommendation(toContext(query));
    return toPricingBreakdownScreen(recommendation);
  }

  getExplanation(authContext: AuthContext, query: DynamicPricingQuery = {}) {
    this.assertAuthenticated(authContext);
    const recommendation = this.buildRecommendation(toContext(query));
    return toPricingExplanationScreen(recommendation);
  }

  getSummary(authContext: AuthContext, query: DynamicPricingQuery = {}) {
    this.assertAuthenticated(authContext);
    const recommendation = this.buildRecommendation(toContext(query));
    return toPricingSummaryScreen(buildPricingSummary(recommendation));
  }

  validate(authContext: AuthContext, query: DynamicPricingQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toPricingValidationScreen(this.validator.validateCatalogCoverage());
    }
    const recommendation = this.buildRecommendation(toContext(query));
    return toPricingValidationScreen(this.validator.validateRecommendation(recommendation));
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: DYNAMIC_PRICING_SCHEMA_VERSION,
      routes: DYNAMIC_PRICING_ROUTES,
      json_schema: DYNAMIC_PRICING_JSON_SCHEMA,
      read_only: true,
    };
  }

  private buildRecommendation(context: PricingContext) {
    const resolved = resolveCanonicalActionIdForPricing({
      scenarioId: context.scenarioId,
      canonicalActionId: context.canonicalActionId,
    });

    const plan = this.repository.buildPlanFromContext({
      scenarioId: resolved.scenarioId ?? undefined,
      canonicalActionId: resolved.canonicalActionId,
      rawIntent: context.rawIntent,
      source: context.source ?? "dynamic-pricing",
    });

    const canonicalAction = this.repository.getCanonicalAction(resolved.canonicalActionId);
    if (!canonicalAction) {
      throw new Error(`Canonical action not found: ${resolved.canonicalActionId}`);
    }

    const urgency = context.urgency ?? "standard";
    const distanceBand = context.distanceBand ?? "local";
    const market = getCategoryBaseRate(plan.category);
    const anchor = this.repository.getScenarioPriceAnchor(resolved.scenarioId);

    const analysis = this.factorAnalyzer.analyze({
      plan,
      canonicalAction,
      urgency,
      distanceBand,
      marketLabel: market.marketLabel,
    });

    const { range, breakdown } = this.calculator.calculate({
      plan,
      analysis,
      factors: analysis.factors,
      urgency,
      distanceBand,
      scenarioAnchor: anchor ? { min: anchor.min, max: anchor.max } : undefined,
    });

    const confidence = this.confidenceBuilder.build({
      plan,
      factorCount: breakdown.factors.length,
      hasScenarioAnchor: Boolean(anchor),
      complexityScore: breakdown.complexityScore,
    });

    const explanation = this.explanationBuilder.build({
      plan,
      canonicalAction,
      range,
      breakdown,
    });

    return {
      recommendationId: `pricing-${plan.planId}`,
      planId: plan.planId,
      canonicalActionId: plan.canonicalActionId,
      scenarioId: resolved.scenarioId,
      goal: plan.goal,
      marketCategory: market.marketLabel,
      recommendedRange: range,
      confidence,
      breakdown,
      explanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: DynamicPricingQuery): PricingContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

export function createDynamicPricingService(
  deps?: ConstructorParameters<typeof DynamicPricingService>[0]
): DynamicPricingService {
  return new DynamicPricingService(deps);
}

export function createDynamicPricingModule(deps?: {
  repository?: DynamicPricingRepository;
}) {
  const dynamicPricing = createDynamicPricingService(deps);
  return { dynamicPricing };
}

export type DynamicPricingModule = ReturnType<typeof createDynamicPricingModule>;
