import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import {
  EXECUTIVE_INTELLIGENCE_CENTER_JSON_SCHEMA,
  EXECUTIVE_INTELLIGENCE_CENTER_ROUTES,
  EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION,
  type ExecutiveIntelligenceCenterScenarioId,
} from "../domain/executive-intelligence-center-schema.js";
import type { ExecutiveIntelligenceCenterContext } from "../domain/executive-intelligence-center-context.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  buildExecutiveIntelligenceCenterHome,
  buildExecutiveIntelligenceCenterSummary,
  toExecutiveOverviewScreen,
  toExecutivePlatformHealthScreen,
  toExecutiveStrategicStatusScreen,
  toExecutiveOperationalStatusScreen,
  toExecutiveIntelligenceOverviewScreen,
  toExecutiveReadinessScreen,
  toExecutiveOrchestrationScreen,
  toExecutiveReportsScreen,
  toExecutiveExplanationScreen,
  toExecutiveSummaryScreen,
  toExecutiveValidationScreen,
} from "../domain/executive-intelligence-center-screens.js";
import {
  createExecutiveCommandOverviewBuilder,
  createPlatformHealthStatusBuilder,
  createStrategicStatusBuilder,
  createOperationalStatusBuilder,
  createIntelligenceOverviewBuilder,
  createReadinessStatusBuilder,
  createOrchestrationSummaryBuilder,
  createExecutiveReportsBuilder,
  createExecutiveConfidenceBuilder,
  createExecutiveExplanationBuilder,
} from "./executive-intelligence-center-builder.js";
import { createExecutiveIntelligenceCenterValidator } from "./executive-intelligence-center-validator.js";
import {
  createExecutiveIntelligenceCenterRepository,
  type ExecutiveIntelligenceCenterRepository,
} from "../infrastructure/executive-intelligence-center-repository.js";

export interface ExecutiveIntelligenceCenterQuery {
  scenario_id?: ExecutiveIntelligenceCenterScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class ExecutiveIntelligenceCenterService {
  private readonly repository: ExecutiveIntelligenceCenterRepository;
  private readonly commandOverviewBuilder = createExecutiveCommandOverviewBuilder();
  private readonly platformHealthBuilder = createPlatformHealthStatusBuilder();
  private readonly strategicStatusBuilder = createStrategicStatusBuilder();
  private readonly operationalStatusBuilder = createOperationalStatusBuilder();
  private readonly intelligenceOverviewBuilder = createIntelligenceOverviewBuilder();
  private readonly readinessStatusBuilder = createReadinessStatusBuilder();
  private readonly orchestrationSummaryBuilder = createOrchestrationSummaryBuilder();
  private readonly reportsBuilder = createExecutiveReportsBuilder();
  private readonly confidenceBuilder = createExecutiveConfidenceBuilder();
  private readonly explanationBuilder = createExecutiveExplanationBuilder();
  private readonly validator = createExecutiveIntelligenceCenterValidator();

  constructor(deps?: { repository?: ExecutiveIntelligenceCenterRepository }) {
    this.repository = deps?.repository ?? createExecutiveIntelligenceCenterRepository();
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const scenarios = this.repository.listExecutiveCenterScenarios().map((entry) => ({
      scenario_id: entry.scenarioId,
      canonical_action_id: entry.canonicalActionId,
      goal: entry.goal,
    }));
    return buildExecutiveIntelligenceCenterHome({ scenarios });
  }

  getOverview(authContext: AuthContext, query: ExecutiveIntelligenceCenterQuery = {}) {
    this.assertAuthenticated(authContext);
    return toExecutiveOverviewScreen(this.buildOutput(authContext, query));
  }

  getPlatformHealth(authContext: AuthContext, query: ExecutiveIntelligenceCenterQuery = {}) {
    this.assertAuthenticated(authContext);
    return toExecutivePlatformHealthScreen(this.buildOutput(authContext, query));
  }

  getStrategicStatus(authContext: AuthContext, query: ExecutiveIntelligenceCenterQuery = {}) {
    this.assertAuthenticated(authContext);
    return toExecutiveStrategicStatusScreen(this.buildOutput(authContext, query));
  }

  getOperationalStatus(authContext: AuthContext, query: ExecutiveIntelligenceCenterQuery = {}) {
    this.assertAuthenticated(authContext);
    return toExecutiveOperationalStatusScreen(this.buildOutput(authContext, query));
  }

  getIntelligence(authContext: AuthContext, query: ExecutiveIntelligenceCenterQuery = {}) {
    this.assertAuthenticated(authContext);
    return toExecutiveIntelligenceOverviewScreen(this.buildOutput(authContext, query));
  }

  getReadiness(authContext: AuthContext, query: ExecutiveIntelligenceCenterQuery = {}) {
    this.assertAuthenticated(authContext);
    return toExecutiveReadinessScreen(this.buildOutput(authContext, query));
  }

  getOrchestration(authContext: AuthContext, query: ExecutiveIntelligenceCenterQuery = {}) {
    this.assertAuthenticated(authContext);
    return toExecutiveOrchestrationScreen(this.buildOutput(authContext, query));
  }

  getReports(authContext: AuthContext, query: ExecutiveIntelligenceCenterQuery = {}) {
    this.assertAuthenticated(authContext);
    return toExecutiveReportsScreen(this.buildOutput(authContext, query));
  }

  getExplanation(authContext: AuthContext, query: ExecutiveIntelligenceCenterQuery = {}) {
    this.assertAuthenticated(authContext);
    return toExecutiveExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: ExecutiveIntelligenceCenterQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutiveSummaryScreen(buildExecutiveIntelligenceCenterSummary(output));
  }

  validate(authContext: AuthContext, query: ExecutiveIntelligenceCenterQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toExecutiveValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toExecutiveValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION,
      routes: EXECUTIVE_INTELLIGENCE_CENTER_ROUTES,
      json_schema: EXECUTIVE_INTELLIGENCE_CENTER_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(authContext: AuthContext, query: ExecutiveIntelligenceCenterQuery = {}) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: ExecutiveIntelligenceCenterQuery) {
    const context = toContext(query);
    const { dashboard } = this.repository.resolveUpstream(
      authContext,
      context,
      toDashboardQuery(query)
    );

    const commandOverview = this.commandOverviewBuilder.build(dashboard);
    const platformHealth = this.platformHealthBuilder.build(dashboard);
    const strategicStatus = this.strategicStatusBuilder.build(dashboard);
    const operationalStatus = this.operationalStatusBuilder.build(dashboard);
    const intelligenceOverview = this.intelligenceOverviewBuilder.build(dashboard);
    const readinessStatus = this.readinessStatusBuilder.build(dashboard);
    const orchestrationSummary = this.orchestrationSummaryBuilder.build(dashboard);
    const executiveReports = this.reportsBuilder.build(dashboard);
    const executiveConfidence = this.confidenceBuilder.build(
      dashboard,
      platformHealth.score
    );

    const outputId = `executive-${dashboard.outputId}`;

    const explanation = this.explanationBuilder.build({
      outputId,
      goal: dashboard.goal,
      dashboard,
      overview: commandOverview,
      platform: platformHealth,
      strategic: strategicStatus,
      operational: operationalStatus,
      reports: executiveReports,
      executiveConfidenceScore: executiveConfidence.score,
    });

    return {
      outputId,
      dashboardOutputId: dashboard.outputId,
      experienceOutputId: dashboard.experienceOutputId,
      orchestrationOutputId: dashboard.orchestrationOutputId,
      canonicalActionId: dashboard.canonicalActionId,
      scenarioId: dashboard.scenarioId,
      goal: dashboard.goal,
      commandOverview,
      platformHealth,
      strategicStatus,
      operationalStatus,
      intelligenceOverview,
      readinessStatus,
      orchestrationSummary,
      executiveReports,
      executiveConfidence,
      explanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: ExecutiveIntelligenceCenterQuery): ExecutiveIntelligenceCenterContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toDashboardQuery(query: ExecutiveIntelligenceCenterQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createExecutiveIntelligenceCenterService(
  deps?: ConstructorParameters<typeof ExecutiveIntelligenceCenterService>[0]
): ExecutiveIntelligenceCenterService {
  return new ExecutiveIntelligenceCenterService(deps);
}

export function createExecutiveIntelligenceCenterModule(deps?: {
  repository?: ExecutiveIntelligenceCenterRepository;
}) {
  const executiveIntelligenceCenter = createExecutiveIntelligenceCenterService(deps);
  return { executiveIntelligenceCenter };
}

export type ExecutiveIntelligenceCenterModule = ReturnType<
  typeof createExecutiveIntelligenceCenterModule
>;
