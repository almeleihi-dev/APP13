import {
  AUTOMATION_LEVELS,
  DEPENDENCY_COMPLEXITY_LEVELS,
  EVIDENCE_LEVELS,
  SKILL_LEVELS,
  TEKRR_INTELLIGENCE_SCHEMA_VERSION,
  TEKRR_PROFILE_STATUSES,
} from "./tekrr-schema.js";
import type { RiskModel } from "./risk-model.js";
import type { ResourceModel } from "./resource-model.js";

export type TekrrProfileStatus = (typeof TEKRR_PROFILE_STATUSES)[number];
export type SkillLevel = (typeof SKILL_LEVELS)[number];
export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number];
export type AutomationLevel = (typeof AUTOMATION_LEVELS)[number];
export type DependencyComplexityLevel = (typeof DEPENDENCY_COMPLEXITY_LEVELS)[number];

export interface TimeModel {
  scheduledStartRequired: boolean;
  estimatedDurationHours: { min: number; max: number };
  completionDeadlineRequired: boolean;
  slaApplicable: boolean;
  milestoneCount: number;
  summary: string;
}

export interface EffortModel {
  deliverablePattern: string;
  locationType: string;
  materialsResponsibility: string;
  deliverables: string[];
  physicalIntensity: "low" | "medium" | "high";
  summary: string;
}

export interface KnowledgeModel {
  standardOfCare: string;
  requiredCredentials: string[];
  minProviderTier: string;
  skillLevel: SkillLevel;
  domainExpertise: string;
  summary: string;
}

export interface SkillLevelSpec {
  level: SkillLevel;
  minProviderTier: string;
  rationale: string;
}

export interface EvidenceLevelSpec {
  level: EvidenceLevel;
  requiredEvidenceTypes: string[];
  minimumForVerification: string[];
  summary: string;
}

export interface AutomationPotentialSpec {
  level: AutomationLevel;
  score: number;
  rationale: string;
}

export interface ParallelExecutionSpec {
  capable: boolean;
  maxParallelWorkstreams: number;
  rationale: string;
}

export interface DependencyComplexitySpec {
  level: DependencyComplexityLevel;
  edgeCount: number;
  nodeCount: number;
  rationale: string;
}

export interface ExecutionScore {
  score: number;
  timeWeight: number;
  effortWeight: number;
  knowledgeWeight: number;
  riskWeight: number;
  resourceWeight: number;
  summary: string;
}

export interface ValidationRule {
  ruleId: string;
  dimension: "T" | "E" | "K" | "R" | "S" | "execution";
  description: string;
  required: boolean;
}

export interface SynthesisTrace {
  step: string;
  ruleId: string;
  detail: string;
}

export interface TekrrExecutionProfile {
  profileId: string;
  blueprintId: string;
  primaryTaxonomyCode: string;
  domain: string;
  templateId: string;
  status: TekrrProfileStatus;
  schemaVersion: typeof TEKRR_INTELLIGENCE_SCHEMA_VERSION;
  timeModel: TimeModel;
  effortModel: EffortModel;
  knowledgeModel: KnowledgeModel;
  riskModel: RiskModel;
  resourceModel: ResourceModel;
  skillLevel: SkillLevelSpec;
  requiredLicenses: string[];
  requiredTools: string[];
  requiredEvidenceLevel: EvidenceLevelSpec;
  automationPotential: AutomationPotentialSpec;
  parallelExecutionCapability: ParallelExecutionSpec;
  dependencyComplexity: DependencyComplexitySpec;
  executionScore: ExecutionScore;
  validationRules: ValidationRule[];
  synthesisTrace: SynthesisTrace[];
}

export interface TekrrValidationReport {
  valid: boolean;
  status: TekrrProfileStatus;
  completenessScore: number;
  errors: string[];
  warnings: string[];
  ruleResults: Array<{ ruleId: string; passed: boolean; message: string }>;
  summary: string;
}

export interface TekrrCompilePreview {
  profile: TekrrExecutionProfile;
  preview_only: true;
  field_checklist: Array<{ dimension: string; field: string; synthesized: boolean }>;
  summary: string;
}

export interface TekrrIntelligenceOverview {
  headline: string;
  schemaVersion: typeof TEKRR_INTELLIGENCE_SCHEMA_VERSION;
  presetCount: number;
  publishedPresetCount: number;
  summary: string;
}

export interface TekrrIntelligenceCenter {
  overview: TekrrIntelligenceOverview;
  generatedAt: Date;
}

export interface ProjectContextHint {
  node_count?: number;
  edge_count?: number;
  parallel_group_count?: number;
}

export function buildTekrrOverview(input: {
  presetCount: number;
  publishedPresetCount: number;
}): TekrrIntelligenceOverview {
  return {
    headline: "APP13 TEKRR Intelligence Synthesis Engine",
    schemaVersion: TEKRR_INTELLIGENCE_SCHEMA_VERSION,
    presetCount: input.presetCount,
    publishedPresetCount: input.publishedPresetCount,
    summary: `TEKRR synthesis presets: ${input.presetCount} (${input.publishedPresetCount} published).`,
  };
}

export function buildTekrrIntelligenceCenter(input: {
  presetCount: number;
  publishedPresetCount: number;
  generatedAt?: Date;
}): TekrrIntelligenceCenter {
  return {
    overview: buildTekrrOverview(input),
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function collectTekrrIntelligencePaths(): string[] {
  return [
    "docs/action-intelligence/X43-TEKRR-Intelligence-Synthesis-Engine.md",
    "src/api/routes/tekrr-intelligence.ts",
    "src/tekrr-intelligence/module.ts",
    "test/x43-tekrr-intelligence.test.ts",
    "scripts/verify-x43.sh",
  ];
}

// Views

export interface TekrrExecutionProfileView {
  profile_id: string;
  blueprint_id: string;
  primary_taxonomy_code: string;
  domain: string;
  template_id: string;
  status: TekrrProfileStatus;
  schema_version: typeof TEKRR_INTELLIGENCE_SCHEMA_VERSION;
  time_model: TimeModel;
  effort_model: EffortModel;
  knowledge_model: KnowledgeModel;
  risk_model: RiskModel;
  resource_model: ResourceModel;
  skill_level: SkillLevelSpec;
  required_licenses: string[];
  required_tools: string[];
  required_evidence_level: EvidenceLevelSpec;
  automation_potential: AutomationPotentialSpec;
  parallel_execution_capability: ParallelExecutionSpec;
  dependency_complexity: DependencyComplexitySpec;
  execution_score: ExecutionScore;
  validation_rules: ValidationRule[];
  synthesis_trace: SynthesisTrace[];
}

export function toTekrrExecutionProfileView(profile: TekrrExecutionProfile): TekrrExecutionProfileView {
  return {
    profile_id: profile.profileId,
    blueprint_id: profile.blueprintId,
    primary_taxonomy_code: profile.primaryTaxonomyCode,
    domain: profile.domain,
    template_id: profile.templateId,
    status: profile.status,
    schema_version: profile.schemaVersion,
    time_model: profile.timeModel,
    effort_model: profile.effortModel,
    knowledge_model: profile.knowledgeModel,
    risk_model: profile.riskModel,
    resource_model: profile.resourceModel,
    skill_level: profile.skillLevel,
    required_licenses: profile.requiredLicenses,
    required_tools: profile.requiredTools,
    required_evidence_level: profile.requiredEvidenceLevel,
    automation_potential: profile.automationPotential,
    parallel_execution_capability: profile.parallelExecutionCapability,
    dependency_complexity: profile.dependencyComplexity,
    execution_score: profile.executionScore,
    validation_rules: profile.validationRules,
    synthesis_trace: profile.synthesisTrace,
  };
}

export function toTekrrValidationReportView(report: TekrrValidationReport) {
  return {
    valid: report.valid,
    status: report.status,
    completeness_score: report.completenessScore,
    errors: report.errors,
    warnings: report.warnings,
    rule_results: report.ruleResults,
    summary: report.summary,
  };
}

export interface TekrrIntelligenceCenterView {
  overview: {
    headline: string;
    schema_version: typeof TEKRR_INTELLIGENCE_SCHEMA_VERSION;
    preset_count: number;
    published_preset_count: number;
    summary: string;
  };
  generated_at: string;
}

export function toTekrrIntelligenceCenterView(center: TekrrIntelligenceCenter): TekrrIntelligenceCenterView {
  return {
    overview: {
      headline: center.overview.headline,
      schema_version: center.overview.schemaVersion,
      preset_count: center.overview.presetCount,
      published_preset_count: center.overview.publishedPresetCount,
      summary: center.overview.summary,
    },
    generated_at: center.generatedAt.toISOString(),
  };
}
