import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import {
  ACTION_INTELLIGENCE_ROUTES,
  SCENARIO_IDS,
  UNIFIED_ACTION_INTELLIGENCE_JSON_SCHEMA,
  UNIFIED_ACTION_INTELLIGENCE_SCHEMA_VERSION,
  type ScenarioId,
} from "../domain/action-intelligence-schema.js";
import type { ActionIntent } from "../domain/action-intent.js";
import {
  buildActionIntelligenceHome,
  toActionDecompositionScreen,
  toActionIntelligenceHomeView,
  toActionIntelligenceSummaryScreen,
  toExecutionPathScreen,
  toRiskSignalsScreen,
} from "../domain/action-intelligence-screens.js";
import { createActionIntentClassifier } from "./action-intent-classifier.js";
import { createActionDecomposer } from "./action-decomposer.js";
import { createActionExecutionPathBuilder } from "./action-execution-path-builder.js";
import { createActionRiskAnalyzer } from "./action-risk-analyzer.js";
import { createActionIntelligenceValidator } from "./action-intelligence-validator.js";
import {
  createUnifiedActionIntelligenceRepository,
  type UnifiedActionIntelligenceRepository,
} from "../infrastructure/unified-action-intelligence-repository.js";

export class UnifiedActionIntelligenceService {
  private readonly repository: UnifiedActionIntelligenceRepository;
  private readonly classifier = createActionIntentClassifier();
  private readonly decomposer = createActionDecomposer();
  private readonly pathBuilder = createActionExecutionPathBuilder();
  private readonly riskAnalyzer = createActionRiskAnalyzer();
  private readonly validator = createActionIntelligenceValidator();

  constructor(deps?: { repository?: UnifiedActionIntelligenceRepository }) {
    this.repository = deps?.repository ?? createUnifiedActionIntelligenceRepository();
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const scenarios = this.repository.listScenarios().map((seed) => ({
      scenarioId: seed.scenarioId,
      label: seed.goal.label,
      category: seed.goal.category,
      sampleIntent: seed.sampleIntents[0] ?? seed.goal.description,
    }));
    const home = buildActionIntelligenceHome({
      scenarioCount: this.repository.getScenarioCount(),
      scenarios,
    });
    return toActionIntelligenceHomeView(home);
  }

  getDecomposition(authContext: AuthContext, input: ActionIntentQuery) {
    this.assertAuthenticated(authContext);
    const decomposition = this.resolveDecomposition(input);
    return toActionDecompositionScreen(decomposition);
  }

  getExecutionPath(authContext: AuthContext, input: ActionIntentQuery) {
    this.assertAuthenticated(authContext);
    const seed = this.resolveSeed(input);
    const path = this.pathBuilder.build(seed);
    return toExecutionPathScreen(seed.scenarioId, path);
  }

  getRisks(authContext: AuthContext, input: ActionIntentQuery) {
    this.assertAuthenticated(authContext);
    const seed = this.resolveSeed(input);
    const signals = this.riskAnalyzer.analyze(seed);
    return toRiskSignalsScreen(seed.scenarioId, signals);
  }

  getSummary(authContext: AuthContext, input: ActionIntentQuery) {
    this.assertAuthenticated(authContext);
    const decomposition = this.resolveDecomposition(input);
    const summary = this.validator.buildSummary(decomposition);
    return toActionIntelligenceSummaryScreen(summary);
  }

  validate(authContext: AuthContext, input: ActionIntentQuery) {
    this.assertAuthenticated(authContext);
    const decomposition = this.resolveDecomposition(input);
    return this.validator.validateDecomposition(decomposition);
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: UNIFIED_ACTION_INTELLIGENCE_SCHEMA_VERSION,
      routes: ACTION_INTELLIGENCE_ROUTES,
      scenario_ids: SCENARIO_IDS,
      json_schema: UNIFIED_ACTION_INTELLIGENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  listScenarios(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      total_count: this.repository.getScenarioCount(),
      scenarios: this.repository.listScenarios().map((seed) => ({
        scenario_id: seed.scenarioId,
        label: seed.goal.label,
        category: seed.goal.category,
        step_count: seed.steps.length,
        sample_intent: seed.sampleIntents[0] ?? "",
      })),
      read_only: true,
    };
  }

  private resolveSeed(input: ActionIntentQuery) {
    const intent = toActionIntent(input);
    return this.classifier.classify(intent);
  }

  private resolveDecomposition(input: ActionIntentQuery) {
    const seed = this.resolveSeed(input);
    return this.decomposer.decompose(seed);
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

export interface ActionIntentQuery {
  scenario_id?: ScenarioId;
  intent?: string;
  raw_text?: string;
}

function toActionIntent(input: ActionIntentQuery): ActionIntent {
  return {
    rawText: input.intent ?? input.raw_text ?? "",
    scenarioId: input.scenario_id,
    source: "api",
  };
}

export function createUnifiedActionIntelligenceService(
  deps?: ConstructorParameters<typeof UnifiedActionIntelligenceService>[0]
): UnifiedActionIntelligenceService {
  return new UnifiedActionIntelligenceService(deps);
}

export function createUnifiedActionIntelligenceModule(deps?: {
  repository?: UnifiedActionIntelligenceRepository;
}) {
  const unifiedActionIntelligence = createUnifiedActionIntelligenceService(deps);
  return { unifiedActionIntelligence };
}

export type UnifiedActionIntelligenceModule = ReturnType<
  typeof createUnifiedActionIntelligenceModule
>;
