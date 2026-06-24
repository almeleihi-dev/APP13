import { getActionType } from "../../action/domain/action.js";
import {
  BLUEPRINT_SCHEMA_VERSION,
  BLUEPRINT_STATUSES,
  BLUEPRINT_SOURCE_CHANNELS,
} from "./blueprint-schema.js";

export type BlueprintStatus = (typeof BLUEPRINT_STATUSES)[number];
export type BlueprintSourceChannel = (typeof BLUEPRINT_SOURCE_CHANNELS)[number];
export type ProviderTier = "T1" | "T2" | "T3";
export type RiskLevel = 1 | 2 | 3 | 4 | 5;
export type TekrrDimension = "T" | "E" | "K" | "R" | "S";
export type EvidenceType =
  | "EV-TS"
  | "EV-PHOTO"
  | "EV-DOC"
  | "EV-CHECK"
  | "EV-TEST"
  | "EV-SIGN"
  | "EV-CRED"
  | "EV-NOTE";
export type MilestoneArchetype =
  | "M-ACCESS"
  | "M-SCOPE"
  | "M-WIP"
  | "M-DELIVER"
  | "M-VERIFY"
  | "M-ACCEPT"
  | "M-COMPLETE";

export interface BlueprintIntent {
  verb: string;
  object: string;
  beneficiary: string;
  outcome: string;
}

export interface BlueprintScope {
  inclusions: string[];
  exclusions: string[];
  assumptions: string[];
  jurisdictionHints: string[];
}

export interface ActorRequirements {
  providerRole: string;
  requiredCredentials: string[];
  minProviderTier: ProviderTier;
  partyCount: number;
}

export interface TekrrFieldRef {
  dimension: TekrrDimension;
  field: string;
}

export interface TekrrBinding {
  templateId: string;
  requiredFields: TekrrFieldRef[];
  dimensions: TekrrDimension[];
}

export interface MilestonePatternRef {
  milestoneCode: MilestoneArchetype;
  sequenceOrder: number;
  blocking: boolean;
}

export interface EvidenceRequirement {
  evidenceType: EvidenceType;
  milestoneCode: MilestoneArchetype | string;
  required: boolean;
}

export interface BlueprintComposition {
  kind: "atomic";
}

export interface TransformationStep {
  step: string;
  ruleId: string;
  detail: string;
  score: number;
  matchedTaxonomyCode?: string;
}

export interface ActionBlueprint {
  blueprintId: string;
  version: string;
  status: BlueprintStatus;
  primaryTaxonomyCode: string;
  domain: string;
  title: string;
  summary: string;
  intent: BlueprintIntent;
  scope: BlueprintScope;
  actorRequirements: ActorRequirements;
  tekrrBinding: TekrrBinding;
  milestonePattern: MilestonePatternRef[];
  evidenceRequirements: EvidenceRequirement[];
  composition: BlueprintComposition;
  sourceChannel: BlueprintSourceChannel;
  transformationTrace: TransformationStep[];
  minProviderTier: ProviderTier;
  riskLevelDefault: RiskLevel;
  schemaVersion: typeof BLUEPRINT_SCHEMA_VERSION;
  deprecatedBy?: string;
  supersedes?: string;
}

export interface BlueprintDraft {
  blueprint: ActionBlueprint;
  confidence: number;
  warnings: string[];
}

export interface ValidationIssue {
  code: string;
  field?: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationReport {
  valid: boolean;
  status: BlueprintStatus;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  taxonomyAlignmentScore: number;
  compilable: boolean;
  summary: string;
}

export interface CompiledTekrrPreview {
  template_id: string;
  dimensions: TekrrDimension[];
  required_fields: TekrrFieldRef[];
  field_checklist: Array<{ dimension: TekrrDimension; field: string; populated: false }>;
}

export interface CompiledMilestonePreview {
  sequence_order: number;
  milestone_code: MilestoneArchetype;
  blocking: boolean;
  evidence_requirements: EvidenceRequirement[];
}

export interface CompiledBlueprintPreview {
  blueprint_id: string;
  version: string;
  primary_taxonomy_code: string;
  template_id: string;
  tekrr_preview: CompiledTekrrPreview;
  milestones: CompiledMilestonePreview[];
  evidence_matrix: EvidenceRequirement[];
  preview_only: true;
  summary: string;
}

export interface BlueprintRegistryEntry {
  blueprint: ActionBlueprint;
  publishedAt: string;
  deprecatedAt?: string;
}

export interface BlueprintFoundationOverview {
  headline: string;
  schemaVersion: typeof BLUEPRINT_SCHEMA_VERSION;
  ingressChannels: BlueprintSourceChannel[];
  lifecycleStatuses: BlueprintStatus[];
  seedRegistryCount: number;
  publishedCount: number;
  summary: string;
}

export interface BlueprintFoundationCenter {
  overview: BlueprintFoundationOverview;
  schemaVersion: typeof BLUEPRINT_SCHEMA_VERSION;
  ingressChannels: BlueprintSourceChannel[];
  lifecycleStatuses: BlueprintStatus[];
  seedRegistryCount: number;
  publishedCount: number;
  generatedAt: Date;
}

const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;
const BLUEPRINT_ID_PATTERN = /^blueprint:\/\/app13\//;
const DOMAIN_PATTERN = /^[A-H]$/;

export function canTransitionStatus(from: BlueprintStatus, to: BlueprintStatus): boolean {
  if (from === to) return true;
  const transitions: Record<BlueprintStatus, BlueprintStatus[]> = {
    draft: ["validated", "draft"],
    validated: ["draft", "published", "validated"],
    published: ["deprecated", "archived", "published"],
    deprecated: ["archived", "deprecated"],
    archived: ["archived"],
  };
  return transitions[from].includes(to);
}

export function applyValidatedStatus(blueprint: ActionBlueprint, report: ValidationReport): ActionBlueprint {
  return {
    ...blueprint,
    status: report.valid ? "validated" : "draft",
  };
}

export function validateBlueprint(blueprint: ActionBlueprint): ValidationReport {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  if (!BLUEPRINT_ID_PATTERN.test(blueprint.blueprintId)) {
    errors.push({
      code: "invalid_blueprint_id",
      field: "blueprint_id",
      message: "blueprint_id must start with blueprint://app13/",
      severity: "error",
    });
  }

  if (!SEMVER_PATTERN.test(blueprint.version)) {
    errors.push({
      code: "invalid_version",
      field: "version",
      message: "version must be semver (e.g. 1.0.0)",
      severity: "error",
    });
  }

  if (blueprint.schemaVersion !== BLUEPRINT_SCHEMA_VERSION) {
    errors.push({
      code: "invalid_schema_version",
      field: "schema_version",
      message: `schema_version must be ${BLUEPRINT_SCHEMA_VERSION}`,
      severity: "error",
    });
  }

  if (!DOMAIN_PATTERN.test(blueprint.domain)) {
    errors.push({
      code: "invalid_domain",
      field: "domain",
      message: "domain must be A–H",
      severity: "error",
    });
  }

  const actionType = getActionType(blueprint.primaryTaxonomyCode);
  if (!actionType) {
    errors.push({
      code: "unknown_taxonomy_code",
      field: "primary_taxonomy_code",
      message: `Unknown MVP taxonomy code: ${blueprint.primaryTaxonomyCode}`,
      severity: "error",
    });
  } else if (actionType.domain !== blueprint.domain) {
    errors.push({
      code: "domain_taxonomy_mismatch",
      field: "domain",
      message: `Domain ${blueprint.domain} does not match taxonomy domain ${actionType.domain}`,
      severity: "error",
    });
  }

  if (!blueprint.title.trim()) {
    errors.push({ code: "missing_title", field: "title", message: "title is required", severity: "error" });
  }

  if (!blueprint.summary.trim()) {
    errors.push({ code: "missing_summary", field: "summary", message: "summary is required", severity: "error" });
  }

  if (blueprint.milestonePattern.length === 0) {
    errors.push({
      code: "empty_milestone_pattern",
      field: "milestone_pattern",
      message: "milestone_pattern must not be empty",
      severity: "error",
    });
  }

  if (blueprint.tekrrBinding.requiredFields.length === 0) {
    warnings.push({
      code: "empty_tekrr_binding",
      field: "tekrr_binding",
      message: "tekrr_binding has no required fields",
      severity: "warning",
    });
  }

  if (blueprint.composition.kind !== "atomic") {
    errors.push({
      code: "unsupported_composition",
      field: "composition",
      message: "X40 supports atomic composition only",
      severity: "error",
    });
  }

  if (blueprint.transformationTrace.length === 0) {
    warnings.push({
      code: "missing_transformation_trace",
      field: "transformation_trace",
      message: "transformation_trace is empty",
      severity: "warning",
    });
  }

  const taxonomyAlignmentScore = actionType ? 100 : 0;
  const valid = errors.length === 0;
  const compilable = valid && blueprint.milestonePattern.length > 0 && !!actionType;

  return {
    valid,
    status: valid ? "validated" : "draft",
    errors,
    warnings,
    taxonomyAlignmentScore,
    compilable,
    summary: valid
      ? `Blueprint ${blueprint.blueprintId}@${blueprint.version} is valid and taxonomy-aligned.`
      : `Blueprint ${blueprint.blueprintId}@${blueprint.version} failed validation with ${errors.length} errors.`,
  };
}

export function buildFoundationOverview(input: {
  seedRegistryCount: number;
  publishedCount: number;
}): BlueprintFoundationOverview {
  return {
    headline: "APP13 Action Blueprint Foundation Engine",
    schemaVersion: BLUEPRINT_SCHEMA_VERSION,
    ingressChannels: ["service_description", "profession_binding", "project_intent", "registry"],
    lifecycleStatuses: [...BLUEPRINT_STATUSES],
    seedRegistryCount: input.seedRegistryCount,
    publishedCount: input.publishedCount,
    summary: `Action Blueprint Foundation (X40): ${input.seedRegistryCount} seed blueprints, ${input.publishedCount} published registry entries, schema ${BLUEPRINT_SCHEMA_VERSION}.`,
  };
}

export function buildBlueprintFoundationCenter(input: {
  seedRegistryCount: number;
  publishedCount: number;
  generatedAt?: Date;
}): BlueprintFoundationCenter {
  const generatedAt = input.generatedAt ?? new Date();
  const overview = buildFoundationOverview(input);
  return {
    overview,
    schemaVersion: overview.schemaVersion,
    ingressChannels: overview.ingressChannels,
    lifecycleStatuses: overview.lifecycleStatuses,
    seedRegistryCount: overview.seedRegistryCount,
    publishedCount: overview.publishedCount,
    generatedAt,
  };
}

export function collectActionBlueprintPaths(): string[] {
  return [
    "docs/action-intelligence/X40-Action-Blueprint-Foundation-Engine.md",
    "src/api/routes/action-blueprint.ts",
    "src/action-blueprint/module.ts",
    "test/x40-action-blueprint.test.ts",
    "scripts/verify-x40.sh",
    "docs/APP13-Action-Taxonomy-v1.md",
  ];
}

// View mappers

export interface ActionBlueprintView {
  blueprint_id: string;
  version: string;
  status: BlueprintStatus;
  primary_taxonomy_code: string;
  domain: string;
  title: string;
  summary: string;
  intent: BlueprintIntent;
  scope: BlueprintScope;
  actor_requirements: {
    provider_role: string;
    required_credentials: string[];
    min_provider_tier: ProviderTier;
    party_count: number;
  };
  tekrr_binding: {
    template_id: string;
    required_fields: TekrrFieldRef[];
    dimensions: TekrrDimension[];
  };
  milestone_pattern: MilestonePatternRef[];
  evidence_requirements: EvidenceRequirement[];
  composition: BlueprintComposition;
  source_channel: BlueprintSourceChannel;
  transformation_trace: TransformationStep[];
  min_provider_tier: ProviderTier;
  risk_level_default: RiskLevel;
  schema_version: typeof BLUEPRINT_SCHEMA_VERSION;
  deprecated_by?: string;
  supersedes?: string;
}

export function toActionBlueprintView(blueprint: ActionBlueprint): ActionBlueprintView {
  return {
    blueprint_id: blueprint.blueprintId,
    version: blueprint.version,
    status: blueprint.status,
    primary_taxonomy_code: blueprint.primaryTaxonomyCode,
    domain: blueprint.domain,
    title: blueprint.title,
    summary: blueprint.summary,
    intent: blueprint.intent,
    scope: blueprint.scope,
    actor_requirements: {
      provider_role: blueprint.actorRequirements.providerRole,
      required_credentials: blueprint.actorRequirements.requiredCredentials,
      min_provider_tier: blueprint.actorRequirements.minProviderTier,
      party_count: blueprint.actorRequirements.partyCount,
    },
    tekrr_binding: {
      template_id: blueprint.tekrrBinding.templateId,
      required_fields: blueprint.tekrrBinding.requiredFields,
      dimensions: blueprint.tekrrBinding.dimensions,
    },
    milestone_pattern: blueprint.milestonePattern,
    evidence_requirements: blueprint.evidenceRequirements,
    composition: blueprint.composition,
    source_channel: blueprint.sourceChannel,
    transformation_trace: blueprint.transformationTrace,
    min_provider_tier: blueprint.minProviderTier,
    risk_level_default: blueprint.riskLevelDefault,
    schema_version: blueprint.schemaVersion,
    deprecated_by: blueprint.deprecatedBy,
    supersedes: blueprint.supersedes,
  };
}

export function fromActionBlueprintView(view: ActionBlueprintView): ActionBlueprint {
  return {
    blueprintId: view.blueprint_id,
    version: view.version,
    status: view.status,
    primaryTaxonomyCode: view.primary_taxonomy_code,
    domain: view.domain,
    title: view.title,
    summary: view.summary,
    intent: view.intent,
    scope: view.scope,
    actorRequirements: {
      providerRole: view.actor_requirements.provider_role,
      requiredCredentials: view.actor_requirements.required_credentials,
      minProviderTier: view.actor_requirements.min_provider_tier,
      partyCount: view.actor_requirements.party_count,
    },
    tekrrBinding: {
      templateId: view.tekrr_binding.template_id,
      requiredFields: view.tekrr_binding.required_fields,
      dimensions: view.tekrr_binding.dimensions,
    },
    milestonePattern: view.milestone_pattern,
    evidenceRequirements: view.evidence_requirements,
    composition: view.composition,
    sourceChannel: view.source_channel,
    transformationTrace: view.transformation_trace,
    minProviderTier: view.min_provider_tier,
    riskLevelDefault: view.risk_level_default,
    schemaVersion: view.schema_version,
    deprecatedBy: view.deprecated_by,
    supersedes: view.supersedes,
  };
}

export interface BlueprintDraftView {
  blueprint: ActionBlueprintView;
  confidence: number;
  warnings: string[];
}

export function toBlueprintDraftView(draft: BlueprintDraft): BlueprintDraftView {
  return {
    blueprint: toActionBlueprintView(draft.blueprint),
    confidence: draft.confidence,
    warnings: draft.warnings,
  };
}

export interface ValidationReportView {
  valid: boolean;
  status: BlueprintStatus;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  taxonomy_alignment_score: number;
  compilable: boolean;
  summary: string;
}

export function toValidationReportView(report: ValidationReport): ValidationReportView {
  return {
    valid: report.valid,
    status: report.status,
    errors: report.errors,
    warnings: report.warnings,
    taxonomy_alignment_score: report.taxonomyAlignmentScore,
    compilable: report.compilable,
    summary: report.summary,
  };
}

export interface BlueprintFoundationCenterView {
  overview: {
    headline: string;
    schema_version: typeof BLUEPRINT_SCHEMA_VERSION;
    ingress_channels: BlueprintSourceChannel[];
    lifecycle_statuses: BlueprintStatus[];
    seed_registry_count: number;
    published_count: number;
    summary: string;
  };
  schema_version: typeof BLUEPRINT_SCHEMA_VERSION;
  ingress_channels: BlueprintSourceChannel[];
  lifecycle_statuses: BlueprintStatus[];
  seed_registry_count: number;
  published_count: number;
  generated_at: string;
}

export function toBlueprintFoundationCenterView(
  center: BlueprintFoundationCenter
): BlueprintFoundationCenterView {
  return {
    overview: {
      headline: center.overview.headline,
      schema_version: center.overview.schemaVersion,
      ingress_channels: center.overview.ingressChannels,
      lifecycle_statuses: center.overview.lifecycleStatuses,
      seed_registry_count: center.overview.seedRegistryCount,
      published_count: center.overview.publishedCount,
      summary: center.overview.summary,
    },
    schema_version: center.schemaVersion,
    ingress_channels: center.ingressChannels,
    lifecycle_statuses: center.lifecycleStatuses,
    seed_registry_count: center.seedRegistryCount,
    published_count: center.publishedCount,
    generated_at: center.generatedAt.toISOString(),
  };
}

export interface BlueprintRegistryIndexView {
  entries: Array<{
    blueprint_id: string;
    version: string;
    status: BlueprintStatus;
    primary_taxonomy_code: string;
    title: string;
    published_at: string;
  }>;
  total_count: number;
  summary: string;
}

export interface BlueprintRegistryEntryView {
  blueprint: ActionBlueprintView;
  published_at: string;
  deprecated_at?: string;
}

export function toBlueprintRegistryEntryView(entry: BlueprintRegistryEntry): BlueprintRegistryEntryView {
  return {
    blueprint: toActionBlueprintView(entry.blueprint),
    published_at: entry.publishedAt,
    deprecated_at: entry.deprecatedAt,
  };
}
