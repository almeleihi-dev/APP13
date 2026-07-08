import {
  EXECUTION_BLUEPRINT_SCHEMA_VERSION,
  EXECUTION_BLUEPRINT_STATUSES,
  PAYMENT_RELEASE_TYPES,
} from "./execution-schema.js";
import type { MilestoneArchetype } from "../../action-blueprint/domain/action-blueprint.js";
import type { QualityGate } from "./quality-gates.js";
import type { AcceptanceCriterion, ExecutionDeliverable } from "./acceptance-rules.js";
import type {
  ExecutionEvidenceRequirement,
  ExecutionMilestone,
  StandardMilestonePattern,
  EvidencePattern,
} from "./milestone-pattern.js";

export type ExecutionBlueprintStatus = (typeof EXECUTION_BLUEPRINT_STATUSES)[number];
export type PaymentReleaseType = (typeof PAYMENT_RELEASE_TYPES)[number];

export interface ExecutionDependency {
  dependencyId: string;
  fromMilestone: MilestoneArchetype;
  toMilestone: MilestoneArchetype;
  dependencyType: "finish_to_start" | "start_to_start";
  blocking: boolean;
}

export interface ExecutionRiskPropagation {
  sourceRiskLevel: number;
  propagatedRiskLevel: number;
  hazardDeclarations: string[];
  insuranceRequired: boolean;
  summary: string;
}

export interface PaymentGatePreview {
  gateId: string;
  milestoneCode: MilestoneArchetype;
  releaseType: PaymentReleaseType;
  percentageHint: number;
  blocking: boolean;
  previewOnly: true;
  summary: string;
}

export interface CompilationTraceStep {
  step: string;
  ruleId: string;
  detail: string;
}

export interface ExecutionBlueprint {
  executionBlueprintId: string;
  blueprintId: string;
  version: string;
  primaryTaxonomyCode: string;
  templateId: string;
  domain: string;
  status: ExecutionBlueprintStatus;
  schemaVersion: typeof EXECUTION_BLUEPRINT_SCHEMA_VERSION;
  milestones: ExecutionMilestone[];
  evidenceRequirements: ExecutionEvidenceRequirement[];
  qualityGates: QualityGate[];
  acceptanceCriteria: AcceptanceCriterion[];
  deliverables: ExecutionDeliverable[];
  executionDependencies: ExecutionDependency[];
  parallelGroups: MilestoneArchetype[][];
  executionRisk: ExecutionRiskPropagation;
  estimatedDurationHours: { min: number; max: number };
  paymentGates: PaymentGatePreview[];
  compilationTrace: CompilationTraceStep[];
}

export interface ExecutionValidationReport {
  valid: boolean;
  compilable: boolean;
  status: ExecutionBlueprintStatus;
  completenessScore: number;
  errors: string[];
  warnings: string[];
  summary: string;
}

export interface ExecutionCompilePreview {
  executionBlueprint: ExecutionBlueprint;
  preview_only: true;
  template_id: string;
  contract_compatible: boolean;
  summary: string;
}

export interface ExecutionBlueprintOverview {
  headline: string;
  schemaVersion: typeof EXECUTION_BLUEPRINT_SCHEMA_VERSION;
  patternCount: number;
  publishedPatternCount: number;
  summary: string;
}

export interface ExecutionBlueprintCenter {
  overview: ExecutionBlueprintOverview;
  generatedAt: Date;
}

export interface PatternCatalog {
  milestonePatterns: StandardMilestonePattern[];
  evidencePatterns: EvidencePattern[];
  qualityGateTemplates: QualityGate[];
}

export function buildExecutionBlueprintOverview(input: {
  patternCount: number;
  publishedPatternCount: number;
}): ExecutionBlueprintOverview {
  return {
    headline: "APP13 Milestone & Evidence Compilation Engine",
    schemaVersion: EXECUTION_BLUEPRINT_SCHEMA_VERSION,
    patternCount: input.patternCount,
    publishedPatternCount: input.publishedPatternCount,
    summary: `Execution blueprint patterns: ${input.patternCount} (${input.publishedPatternCount} published).`,
  };
}

export function buildExecutionBlueprintCenter(input: {
  patternCount: number;
  publishedPatternCount: number;
  generatedAt?: Date;
}): ExecutionBlueprintCenter {
  return {
    overview: buildExecutionBlueprintOverview(input),
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function collectExecutionBlueprintPaths(): string[] {
  return [
    "docs/action-intelligence/X44-Milestone-Evidence-Compilation-Engine.md",
    "src/api/routes/execution-blueprint.ts",
    "src/execution-blueprint/module.ts",
    "test/x44-execution-blueprint.test.ts",
    "scripts/verify-x44.sh",
  ];
}

export interface ExecutionBlueprintView {
  execution_blueprint_id: string;
  blueprint_id: string;
  version: string;
  primary_taxonomy_code: string;
  template_id: string;
  domain: string;
  status: ExecutionBlueprintStatus;
  schema_version: typeof EXECUTION_BLUEPRINT_SCHEMA_VERSION;
  milestones: ExecutionMilestone[];
  evidence_requirements: ExecutionEvidenceRequirement[];
  quality_gates: QualityGate[];
  acceptance_criteria: AcceptanceCriterion[];
  deliverables: ExecutionDeliverable[];
  execution_dependencies: ExecutionDependency[];
  parallel_groups: MilestoneArchetype[][];
  execution_risk: ExecutionRiskPropagation;
  estimated_duration_hours: { min: number; max: number };
  payment_gates: Array<Omit<PaymentGatePreview, "previewOnly"> & { preview_only: true }>;
  compilation_trace: CompilationTraceStep[];
}

export function toExecutionBlueprintView(blueprint: ExecutionBlueprint): ExecutionBlueprintView {
  return {
    execution_blueprint_id: blueprint.executionBlueprintId,
    blueprint_id: blueprint.blueprintId,
    version: blueprint.version,
    primary_taxonomy_code: blueprint.primaryTaxonomyCode,
    template_id: blueprint.templateId,
    domain: blueprint.domain,
    status: blueprint.status,
    schema_version: blueprint.schemaVersion,
    milestones: blueprint.milestones,
    evidence_requirements: blueprint.evidenceRequirements,
    quality_gates: blueprint.qualityGates,
    acceptance_criteria: blueprint.acceptanceCriteria,
    deliverables: blueprint.deliverables,
    execution_dependencies: blueprint.executionDependencies,
    parallel_groups: blueprint.parallelGroups,
    execution_risk: blueprint.executionRisk,
    estimated_duration_hours: blueprint.estimatedDurationHours,
    payment_gates: blueprint.paymentGates.map((gate) => ({
      gateId: gate.gateId,
      milestoneCode: gate.milestoneCode,
      releaseType: gate.releaseType,
      percentageHint: gate.percentageHint,
      blocking: gate.blocking,
      preview_only: true,
      summary: gate.summary,
    })),
    compilation_trace: blueprint.compilationTrace,
  };
}

export function toExecutionValidationReportView(report: ExecutionValidationReport) {
  return {
    valid: report.valid,
    compilable: report.compilable,
    status: report.status,
    completeness_score: report.completenessScore,
    errors: report.errors,
    warnings: report.warnings,
    summary: report.summary,
  };
}

export interface ExecutionBlueprintCenterView {
  overview: {
    headline: string;
    schema_version: typeof EXECUTION_BLUEPRINT_SCHEMA_VERSION;
    pattern_count: number;
    published_pattern_count: number;
    summary: string;
  };
  generated_at: string;
}

export function toExecutionBlueprintCenterView(
  center: ExecutionBlueprintCenter
): ExecutionBlueprintCenterView {
  return {
    overview: {
      headline: center.overview.headline,
      schema_version: center.overview.schemaVersion,
      pattern_count: center.overview.patternCount,
      published_pattern_count: center.overview.publishedPatternCount,
      summary: center.overview.summary,
    },
    generated_at: center.generatedAt.toISOString(),
  };
}

export function fromExecutionBlueprintView(view: ExecutionBlueprintView): ExecutionBlueprint {
  return {
    executionBlueprintId: view.execution_blueprint_id,
    blueprintId: view.blueprint_id,
    version: view.version,
    primaryTaxonomyCode: view.primary_taxonomy_code,
    templateId: view.template_id,
    domain: view.domain,
    status: view.status,
    schemaVersion: view.schema_version,
    milestones: view.milestones,
    evidenceRequirements: view.evidence_requirements,
    qualityGates: view.quality_gates,
    acceptanceCriteria: view.acceptance_criteria,
    deliverables: view.deliverables,
    executionDependencies: view.execution_dependencies,
    parallelGroups: view.parallel_groups,
    executionRisk: view.execution_risk,
    estimatedDurationHours: view.estimated_duration_hours,
    paymentGates: view.payment_gates.map((gate) => ({
      gateId: gate.gateId,
      milestoneCode: gate.milestoneCode,
      releaseType: gate.releaseType,
      percentageHint: gate.percentageHint,
      blocking: gate.blocking,
      previewOnly: true,
      summary: gate.summary,
    })),
    compilationTrace: view.compilation_trace,
  };
}

export function validateExecutionBlueprint(blueprint: ExecutionBlueprint): ExecutionValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!blueprint.executionBlueprintId.startsWith("exec://")) {
    errors.push("execution_blueprint_id must start with exec://");
  }
  if (!blueprint.blueprintId.startsWith("blueprint://app13/")) {
    errors.push("blueprint_id must reference an X40 ActionBlueprint");
  }
  if (blueprint.milestones.length === 0) {
    errors.push("at least one milestone is required");
  }
  if (blueprint.evidenceRequirements.length === 0) {
    warnings.push("no evidence requirements compiled");
  }
  if (blueprint.acceptanceCriteria.length === 0) {
    errors.push("acceptance criteria are required");
  }
  if (blueprint.paymentGates.length === 0) {
    warnings.push("no payment gates compiled");
  }

  const blockingMilestones = blueprint.milestones.filter((entry) => entry.blocking);
  if (blockingMilestones.length === 0) {
    errors.push("at least one blocking milestone is required");
  }

  const completenessChecks = [
    blueprint.milestones.length > 0,
    blueprint.evidenceRequirements.length > 0,
    blueprint.qualityGates.length > 0,
    blueprint.acceptanceCriteria.length > 0,
    blueprint.deliverables.length > 0,
    blueprint.executionDependencies.length >= 0,
    blueprint.paymentGates.length > 0,
  ];
  const completenessScore = Math.round(
    (completenessChecks.filter(Boolean).length / completenessChecks.length) * 100
  );

  const valid = errors.length === 0 && completenessScore >= 70;
  const compilable = valid && blueprint.milestones.length >= 3;

  return {
    valid,
    compilable,
    status: valid ? "validated" : "draft",
    completenessScore,
    errors,
    warnings,
    summary: valid
      ? `Execution blueprint ${blueprint.executionBlueprintId} validated at ${completenessScore}% completeness.`
      : `Execution blueprint ${blueprint.executionBlueprintId} failed validation.`,
  };
}
