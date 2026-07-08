import {
  INTELLIGENCE_CHAIN,
  UNIFIED_ACTION_INTELLIGENCE_FIXED_TIMESTAMP,
  UNIFIED_ACTION_INTELLIGENCE_SCHEMA_VERSION,
} from "./action-intelligence-schema.js";
import type {
  ActionDecomposition,
  ActionExecutionPath,
  ActionIntelligenceSummary,
  ActionRiskSignal,
} from "./action-intent.js";

export interface ActionIntelligenceHome {
  schema_version: typeof UNIFIED_ACTION_INTELLIGENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  intelligence_chain: readonly string[];
  scenario_count: number;
  scenarios: Array<{
    scenario_id: string;
    label: string;
    category: string;
    sample_intent: string;
  }>;
  read_only: true;
  generated_at: string;
}

export interface ActionDecompositionScreen {
  schema_version: typeof UNIFIED_ACTION_INTELLIGENCE_SCHEMA_VERSION;
  detected_goal: string;
  action_category: string;
  scenario_id: string;
  steps: Array<{
    step_id: string;
    order: number;
    title: string;
    description: string;
    phase: string;
    estimated_minutes: { min: number; max: number };
  }>;
  resources: Array<{
    resource_id: string;
    name: string;
    type: string;
    required: boolean;
  }>;
  skills: Array<{
    skill_id: string;
    name: string;
    level: string;
    rationale: string;
  }>;
  time_band: {
    min_hours: number;
    max_hours: number;
    summary: string;
  };
  read_only: true;
}

export interface ExecutionPathScreen {
  schema_version: typeof UNIFIED_ACTION_INTELLIGENCE_SCHEMA_VERSION;
  scenario_id: string;
  path_id: string;
  phases: Array<{
    phase: string;
    step_ids: string[];
    gate: string;
  }>;
  contract_readiness: string;
  trust_considerations: string[];
  price_band_hint: {
    min: number;
    max: number;
    currency: string;
    basis: string;
  };
  execution_notes: string;
  read_only: true;
}

export interface RiskSignalsScreen {
  schema_version: typeof UNIFIED_ACTION_INTELLIGENCE_SCHEMA_VERSION;
  scenario_id: string;
  risk_count: number;
  signals: Array<{
    signal_id: string;
    category: string;
    severity: string;
    description: string;
    mitigation_hint: string;
  }>;
  read_only: true;
}

export interface ActionIntelligenceSummaryScreen {
  schema_version: typeof UNIFIED_ACTION_INTELLIGENCE_SCHEMA_VERSION;
  summary: ActionIntelligenceSummary;
  read_only: true;
}

export function buildActionIntelligenceHome(input: {
  scenarioCount: number;
  scenarios: Array<{
    scenarioId: string;
    label: string;
    category: string;
    sampleIntent: string;
  }>;
}): ActionIntelligenceHome {
  return {
    schema_version: UNIFIED_ACTION_INTELLIGENCE_SCHEMA_VERSION,
    headline: "Unified Action Intelligence",
    description:
      "Read-only intelligence that interprets user intent as executable actions across goal, resources, skills, time, risk, price, contract, execution, and trust.",
    intelligence_chain: INTELLIGENCE_CHAIN,
    scenario_count: input.scenarioCount,
    scenarios: input.scenarios.map((scenario) => ({
      scenario_id: scenario.scenarioId,
      label: scenario.label,
      category: scenario.category,
      sample_intent: scenario.sampleIntent,
    })),
    read_only: true,
    generated_at: UNIFIED_ACTION_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function toActionIntelligenceHomeView(home: ActionIntelligenceHome): ActionIntelligenceHome {
  return home;
}

export function toActionDecompositionScreen(
  decomposition: ActionDecomposition
): ActionDecompositionScreen {
  return {
    schema_version: UNIFIED_ACTION_INTELLIGENCE_SCHEMA_VERSION,
    detected_goal: decomposition.goal.label,
    action_category: decomposition.category,
    scenario_id: decomposition.goal.scenarioId,
    steps: decomposition.steps.map((step) => ({
      step_id: step.stepId,
      order: step.order,
      title: step.title,
      description: step.description,
      phase: step.phase,
      estimated_minutes: step.estimatedMinutes,
    })),
    resources: decomposition.resources.map((resource) => ({
      resource_id: resource.resourceId,
      name: resource.name,
      type: resource.type,
      required: resource.required,
    })),
    skills: decomposition.skills.map((skill) => ({
      skill_id: skill.skillId,
      name: skill.name,
      level: skill.level,
      rationale: skill.rationale,
    })),
    time_band: {
      min_hours: decomposition.timeBand.minHours,
      max_hours: decomposition.timeBand.maxHours,
      summary: decomposition.timeBand.summary,
    },
    read_only: true,
  };
}

export function toExecutionPathScreen(
  scenarioId: string,
  path: ActionExecutionPath
): ExecutionPathScreen {
  return {
    schema_version: UNIFIED_ACTION_INTELLIGENCE_SCHEMA_VERSION,
    scenario_id: scenarioId,
    path_id: path.pathId,
    phases: path.phases.map((phase) => ({
      phase: phase.phase,
      step_ids: phase.stepIds,
      gate: phase.gate,
    })),
    contract_readiness: path.contractReadiness,
    trust_considerations: path.trustConsiderations,
    price_band_hint: path.priceBandHint,
    execution_notes: path.executionNotes,
    read_only: true,
  };
}

export function toRiskSignalsScreen(
  scenarioId: string,
  signals: ActionRiskSignal[]
): RiskSignalsScreen {
  return {
    schema_version: UNIFIED_ACTION_INTELLIGENCE_SCHEMA_VERSION,
    scenario_id: scenarioId,
    risk_count: signals.length,
    signals: signals.map((signal) => ({
      signal_id: signal.signalId,
      category: signal.category,
      severity: signal.severity,
      description: signal.description,
      mitigation_hint: signal.mitigationHint,
    })),
    read_only: true,
  };
}

export function toActionIntelligenceSummaryScreen(
  summary: ActionIntelligenceSummary
): ActionIntelligenceSummaryScreen {
  return {
    schema_version: UNIFIED_ACTION_INTELLIGENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function collectUnifiedActionIntelligencePaths(): string[] {
  return [
    "docs/action-intelligence/CH4-C1-Unified-Action-Intelligence-Engine.md",
    "src/unified-action-intelligence/module.ts",
    "src/api/routes/action-intelligence.ts",
    "src/bootstrap/intelligence.ts",
    "src/bootstrap/routes.ts",
    "test/ch4-c1-unified-action-intelligence.test.ts",
    "scripts/verify-ch4-c1.sh",
  ];
}
