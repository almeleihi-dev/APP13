import type {
  ActionCategory,
  ResourceType,
  RiskSeverity,
  ScenarioId,
  SkillLevel,
} from "./action-intelligence-schema.js";

export interface ActionIntent {
  rawText: string;
  scenarioId?: ScenarioId;
  language?: string;
  source?: string;
}

export interface ActionGoal {
  goalId: string;
  label: string;
  description: string;
  category: ActionCategory;
  scenarioId: ScenarioId;
}

export interface ActionStep {
  stepId: string;
  order: number;
  title: string;
  description: string;
  phase: string;
  estimatedMinutes: { min: number; max: number };
}

export interface ActionResource {
  resourceId: string;
  name: string;
  type: ResourceType;
  required: boolean;
  notes?: string;
}

export interface ActionSkillRequirement {
  skillId: string;
  name: string;
  level: SkillLevel;
  rationale: string;
}

export interface ActionRiskSignal {
  signalId: string;
  category: string;
  severity: RiskSeverity;
  description: string;
  mitigationHint: string;
}

export interface ActionExecutionPathPhase {
  phase: string;
  stepIds: string[];
  gate: string;
}

export interface ActionExecutionPath {
  pathId: string;
  phases: ActionExecutionPathPhase[];
  contractReadiness: string;
  trustConsiderations: string[];
  priceBandHint: {
    min: number;
    max: number;
    currency: string;
    basis: string;
  };
  executionNotes: string;
}

export interface ActionDecomposition {
  goal: ActionGoal;
  category: ActionCategory;
  steps: ActionStep[];
  resources: ActionResource[];
  skills: ActionSkillRequirement[];
  timeBand: {
    minHours: number;
    maxHours: number;
    summary: string;
  };
  riskSignals: ActionRiskSignal[];
  executionPath: ActionExecutionPath;
}

export interface ActionIntelligenceSummary {
  schemaVersion: string;
  scenarioId: ScenarioId;
  detectedGoal: string;
  actionCategory: ActionCategory;
  stepCount: number;
  skillCount: number;
  resourceCount: number;
  riskCount: number;
  timeBandSummary: string;
  executionReadiness: "ready" | "needs_clarification";
  readOnly: true;
  intelligenceChain: readonly string[];
  generatedAt: string;
}

export interface ActionIntelligenceValidationReport {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}
