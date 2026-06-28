import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import {
  EXECUTION_INTELLIGENCE_JSON_SCHEMA,
  EXECUTION_INTELLIGENCE_ROUTES,
  EXECUTION_INTELLIGENCE_SCHEMA_VERSION,
  type ExecutionScenarioId,
} from "../domain/execution-intelligence-schema.js";
import type { ExecutionIntelligenceContext } from "../domain/execution-context.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  buildExecutionIntelligenceHome,
  buildExecutionIntelligenceSummary,
  toExecutionAcceptanceScreen,
  toExecutionCheckpointsScreen,
  toExecutionExplanationScreen,
  toExecutionRoadmapScreen,
  toExecutionSequencingScreen,
  toExecutionSummaryScreen,
  toExecutionValidationScreen,
} from "../domain/execution-screens.js";
import {
  createExecutionRoadmapBuilder,
  createExecutionSequencingBuilder,
  createExecutionResponsibilityBuilder,
  createExecutionCheckpointBuilder,
  createExecutionAcceptanceBuilder,
  createExecutionExceptionBuilder,
  createExecutionProgressBuilder,
} from "./execution-guidance-builder.js";
import {
  createExecutionConfidenceBuilder,
  createExecutionExplanationBuilder,
} from "./execution-explanation-builder.js";
import { createExecutionIntelligenceValidator } from "./execution-intelligence-validator.js";
import {
  createExecutionIntelligenceRepository,
  type ExecutionIntelligenceRepository,
} from "../infrastructure/execution-intelligence-repository.js";

export interface ExecutionIntelligenceQuery {
  scenario_id?: ExecutionScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class ExecutionIntelligenceEngineService {
  private readonly repository: ExecutionIntelligenceRepository;
  private readonly roadmapBuilder = createExecutionRoadmapBuilder();
  private readonly sequencingBuilder = createExecutionSequencingBuilder();
  private readonly responsibilityBuilder = createExecutionResponsibilityBuilder();
  private readonly checkpointBuilder = createExecutionCheckpointBuilder();
  private readonly acceptanceBuilder = createExecutionAcceptanceBuilder();
  private readonly exceptionBuilder = createExecutionExceptionBuilder();
  private readonly progressBuilder = createExecutionProgressBuilder();
  private readonly confidenceBuilder = createExecutionConfidenceBuilder();
  private readonly explanationBuilder = createExecutionExplanationBuilder();
  private readonly validator = createExecutionIntelligenceValidator();

  constructor(deps?: { repository?: ExecutionIntelligenceRepository }) {
    this.repository = deps?.repository ?? createExecutionIntelligenceRepository();
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const scenarios = this.repository.listExecutionScenarios().map((entry) => ({
      scenario_id: entry.scenarioId,
      canonical_action_id: entry.canonicalActionId,
      goal: entry.goal,
    }));
    return buildExecutionIntelligenceHome({ scenarios });
  }

  getRoadmap(authContext: AuthContext, query: ExecutionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toExecutionRoadmapScreen(this.buildGuidance(authContext, query));
  }

  getSequencing(authContext: AuthContext, query: ExecutionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toExecutionSequencingScreen(this.buildGuidance(authContext, query));
  }

  getCheckpoints(authContext: AuthContext, query: ExecutionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toExecutionCheckpointsScreen(this.buildGuidance(authContext, query));
  }

  getAcceptance(authContext: AuthContext, query: ExecutionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toExecutionAcceptanceScreen(this.buildGuidance(authContext, query));
  }

  getExplanation(authContext: AuthContext, query: ExecutionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toExecutionExplanationScreen(this.buildGuidance(authContext, query));
  }

  getSummary(authContext: AuthContext, query: ExecutionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    const guidance = this.buildGuidance(authContext, query);
    return toExecutionSummaryScreen(buildExecutionIntelligenceSummary(guidance));
  }

  validate(authContext: AuthContext, query: ExecutionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toExecutionValidationScreen(this.validator.validateCatalogCoverage());
    }
    const guidance = this.buildGuidance(authContext, query);
    return toExecutionValidationScreen(this.validator.validateGuidance(guidance));
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: EXECUTION_INTELLIGENCE_SCHEMA_VERSION,
      routes: EXECUTION_INTELLIGENCE_ROUTES,
      json_schema: EXECUTION_INTELLIGENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  private buildGuidance(authContext: AuthContext, query: ExecutionIntelligenceQuery) {
    const context = toContext(query);
    const { contract, plan, canonicalAction } = this.repository.resolveUpstream(
      authContext,
      context,
      toContractQuery(query)
    );

    const executionRoadmap = this.roadmapBuilder.build(plan);
    const { orderedMilestones, taskSequencing } = this.sequencingBuilder.build(plan, contract);
    const responsibilityMatrix = this.responsibilityBuilder.build(plan, taskSequencing, contract);
    const {
      stageEvidence,
      verificationCheckpoints,
      qualityCheckpoints,
      escrowReleaseCheckpoints,
    } = this.checkpointBuilder.build(plan, contract);
    const acceptanceWorkflow = this.acceptanceBuilder.build(contract);
    const { exceptionHandling, recoveryRecommendations } = this.exceptionBuilder.build(
      plan,
      canonicalAction
    );
    const progressModel = this.progressBuilder.build(plan, contract);

    const checkpointCount =
      verificationCheckpoints.length + qualityCheckpoints.length + escrowReleaseCheckpoints.length;

    const guidanceId = `execution-${plan.planId}`;

    const confidence = this.confidenceBuilder.build({
      plan,
      contract,
      checkpointCount,
    });

    const explanation = this.explanationBuilder.build({
      guidanceId,
      goal: plan.goal,
      plan,
      contract,
      taskCount: taskSequencing.length,
      checkpointCount,
      exceptionCount: exceptionHandling.length,
      recoveryCount: recoveryRecommendations.length,
    });

    return {
      guidanceId,
      contractRecommendationId: contract.recommendationId,
      planId: plan.planId,
      canonicalActionId: plan.canonicalActionId,
      scenarioId: contract.scenarioId,
      goal: plan.goal,
      executionRoadmap,
      orderedMilestones,
      taskSequencing,
      responsibilityMatrix,
      stageEvidence,
      verificationCheckpoints,
      qualityCheckpoints,
      escrowReleaseCheckpoints,
      acceptanceWorkflow,
      exceptionHandling,
      recoveryRecommendations,
      progressModel,
      confidence,
      explanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: ExecutionIntelligenceQuery): ExecutionIntelligenceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toContractQuery(query: ExecutionIntelligenceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createExecutionIntelligenceEngineService(
  deps?: ConstructorParameters<typeof ExecutionIntelligenceEngineService>[0]
): ExecutionIntelligenceEngineService {
  return new ExecutionIntelligenceEngineService(deps);
}

export function createExecutionIntelligenceEngineModule(deps?: {
  repository?: ExecutionIntelligenceRepository;
}) {
  const executionIntelligenceEngine = createExecutionIntelligenceEngineService(deps);
  return { executionIntelligenceEngine };
}

export type ExecutionIntelligenceEngineModule = ReturnType<
  typeof createExecutionIntelligenceEngineModule
>;
