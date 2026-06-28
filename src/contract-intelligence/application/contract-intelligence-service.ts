import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import {
  CONTRACT_INTELLIGENCE_JSON_SCHEMA,
  CONTRACT_INTELLIGENCE_ROUTES,
  CONTRACT_INTELLIGENCE_SCHEMA_VERSION,
  type ContractScenarioId,
} from "../domain/contract-intelligence-schema.js";
import type { ContractIntelligenceContext } from "../domain/contract-context.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  buildContractIntelligenceHome,
  buildContractIntelligenceSummary,
  toContractExplanationScreen,
  toContractMilestonesScreen,
  toContractPartiesScreen,
  toContractRecommendationScreen,
  toContractStructureScreen,
  toContractSummaryScreen,
  toContractValidationScreen,
} from "../domain/contract-screens.js";
import { getCategoryContractProfile } from "../domain/contract-reference-values.js";
import { resolveCanonicalActionIdForContract } from "./c4-contract-bridge.js";
import {
  createContractStructureBuilder,
  createContractPartiesBuilder,
  createContractMilestoneBuilder,
  createContractEvidenceBuilder,
  createContractApprovalsBuilder,
} from "./contract-structure-builder.js";
import {
  createContractPaymentBuilder,
  createContractEscrowBuilder,
  createContractClauseBuilder,
  createContractExecutionTermsBuilder,
} from "./contract-payment-builder.js";
import {
  createContractConfidenceBuilder,
  createContractExplanationBuilder,
} from "./contract-explanation-builder.js";
import { createContractIntelligenceValidator } from "./contract-intelligence-validator.js";
import {
  createContractIntelligenceRepository,
  type ContractIntelligenceRepository,
} from "../infrastructure/contract-intelligence-repository.js";

export interface ContractIntelligenceQuery {
  scenario_id?: ContractScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class ContractIntelligenceEngineService {
  private readonly repository: ContractIntelligenceRepository;
  private readonly structureBuilder = createContractStructureBuilder();
  private readonly partiesBuilder = createContractPartiesBuilder();
  private readonly milestoneBuilder = createContractMilestoneBuilder();
  private readonly evidenceBuilder = createContractEvidenceBuilder();
  private readonly approvalsBuilder = createContractApprovalsBuilder();
  private readonly paymentBuilder = createContractPaymentBuilder();
  private readonly escrowBuilder = createContractEscrowBuilder();
  private readonly clauseBuilder = createContractClauseBuilder();
  private readonly executionTermsBuilder = createContractExecutionTermsBuilder();
  private readonly confidenceBuilder = createContractConfidenceBuilder();
  private readonly explanationBuilder = createContractExplanationBuilder();
  private readonly validator = createContractIntelligenceValidator();

  constructor(deps?: { repository?: ContractIntelligenceRepository }) {
    this.repository = deps?.repository ?? createContractIntelligenceRepository();
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const scenarios = this.repository.listContractScenarios().map((entry) => ({
      scenario_id: entry.scenarioId,
      canonical_action_id: entry.canonicalActionId,
      goal: entry.goal,
    }));
    return buildContractIntelligenceHome({ scenarios });
  }

  getRecommendation(authContext: AuthContext, query: ContractIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toContractRecommendationScreen(this.buildRecommendation(authContext, query));
  }

  getStructure(authContext: AuthContext, query: ContractIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toContractStructureScreen(this.buildRecommendation(authContext, query));
  }

  getParties(authContext: AuthContext, query: ContractIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toContractPartiesScreen(this.buildRecommendation(authContext, query));
  }

  getMilestones(authContext: AuthContext, query: ContractIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toContractMilestonesScreen(this.buildRecommendation(authContext, query));
  }

  getExplanation(authContext: AuthContext, query: ContractIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toContractExplanationScreen(this.buildRecommendation(authContext, query));
  }

  getSummary(authContext: AuthContext, query: ContractIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    const recommendation = this.buildRecommendation(authContext, query);
    return toContractSummaryScreen(buildContractIntelligenceSummary(recommendation));
  }

  validate(authContext: AuthContext, query: ContractIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toContractValidationScreen(this.validator.validateCatalogCoverage());
    }
    const recommendation = this.buildRecommendation(authContext, query);
    return toContractValidationScreen(this.validator.validateRecommendation(recommendation));
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: CONTRACT_INTELLIGENCE_SCHEMA_VERSION,
      routes: CONTRACT_INTELLIGENCE_ROUTES,
      json_schema: CONTRACT_INTELLIGENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  private buildRecommendation(authContext: AuthContext, query: ContractIntelligenceQuery) {
    const context = toContext(query);
    const upstream = this.repository.resolveUpstream(authContext, context, toPricingQuery(query));
    const { plan, canonicalAction, scenarioId, pricingRange, pricingConfidenceScore } = upstream;

    const profile = getCategoryContractProfile(plan.category);
    const structure = this.structureBuilder.build(plan, plan.category);
    const parties = this.partiesBuilder.build(plan, canonicalAction);
    const { milestones, deliverables, acceptanceCriteria } = this.milestoneBuilder.build(plan);
    const requiredEvidence = this.evidenceBuilder.build(canonicalAction, plan);
    const requiredApprovals = this.approvalsBuilder.build(plan);
    const executionTerms = this.executionTermsBuilder.build(plan);

    const paymentRecommendation = this.paymentBuilder.build({
      plan,
      range: {
        min: pricingRange.min,
        max: pricingRange.max,
        currency: pricingRange.currency,
        midpoint: pricingRange.midpoint,
      },
      pricingRecommendationId: pricingRange.recommendationId,
      category: plan.category,
    });

    const escrowRecommendation = this.escrowBuilder.build({
      plan,
      canonicalAction,
      category: plan.category,
      paymentMin: pricingRange.min,
    });

    const { riskClauses, cancellationClauses, warrantySuggestions } = this.clauseBuilder.build({
      plan,
      canonicalAction,
      category: plan.category,
    });

    const resolved = resolveCanonicalActionIdForContract({
      scenarioId: context.scenarioId,
      canonicalActionId: context.canonicalActionId,
    });

    const baseRecommendation = {
      recommendationId: `contract-${plan.planId}`,
      pricingRecommendationId: pricingRange.recommendationId,
      planId: plan.planId,
      canonicalActionId: plan.canonicalActionId,
      scenarioId: resolved.scenarioId ?? scenarioId,
      goal: plan.goal,
      contractType: profile.contractType,
      structure,
      parties,
      deliverables,
      milestones,
      acceptanceCriteria,
      requiredEvidence,
      paymentRecommendation,
      escrowRecommendation,
      riskClauses,
      cancellationClauses,
      warrantySuggestions,
      requiredApprovals,
      executionTerms,
    };

    const confidence = this.confidenceBuilder.build({
      plan,
      pricingConfidenceScore,
      milestoneCount: milestones.length,
      evidenceCount: requiredEvidence.length,
    });

    const explanation = this.explanationBuilder.build({
      recommendationId: baseRecommendation.recommendationId,
      goal: plan.goal,
      milestones,
      parties,
      paymentRecommendation,
      escrowRecommendation,
      riskClauses,
      executionTerms,
      canonicalAction,
      contractType: profile.contractType,
    });

    return {
      ...baseRecommendation,
      confidence,
      explanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: ContractIntelligenceQuery): ContractIntelligenceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toPricingQuery(query: ContractIntelligenceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createContractIntelligenceEngineService(
  deps?: ConstructorParameters<typeof ContractIntelligenceEngineService>[0]
): ContractIntelligenceEngineService {
  return new ContractIntelligenceEngineService(deps);
}

export function createContractIntelligenceEngineModule(deps?: {
  repository?: ContractIntelligenceRepository;
}) {
  const contractIntelligenceEngine = createContractIntelligenceEngineService(deps);
  return { contractIntelligenceEngine };
}

export type ContractIntelligenceEngineModule = ReturnType<
  typeof createContractIntelligenceEngineModule
>;
