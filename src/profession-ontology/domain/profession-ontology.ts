import {
  ACTION_DECOMPOSITION_CLASSES,
  HIERARCHY_LEVELS,
  PROFESSION_CATEGORIES,
  PROFESSION_ONTOLOGY_SCHEMA_VERSION,
  PROFESSION_ONTOLOGY_STATUSES,
  type INPUT_CHANNELS,
} from "./profession-schema.js";

export type ProfessionOntologyStatus = (typeof PROFESSION_ONTOLOGY_STATUSES)[number];
export type HierarchyLevel = (typeof HIERARCHY_LEVELS)[number];
export type ProfessionCategory = (typeof PROFESSION_CATEGORIES)[number];
export type ActionDecompositionClass = (typeof ACTION_DECOMPOSITION_CLASSES)[number];
export type InputChannel = (typeof INPUT_CHANNELS)[number];

export interface ProfessionAlias {
  aliasId: string;
  label: string;
  language: "en" | "ar";
}

export interface ProfessionKeyword {
  keywordId: string;
  term: string;
  weight: number;
}

export interface SkillDefinition {
  skillId: string;
  label: string;
  hierarchyLevel: Extract<HierarchyLevel, "skill">;
}

export interface CapabilityDefinition {
  capabilityId: string;
  label: string;
  hierarchyLevel: Extract<HierarchyLevel, "capability">;
  actionClass: ActionDecompositionClass;
}

export interface CredentialRequirement {
  code: string;
  label: string;
  required: boolean;
}

export interface LicenseRequirement {
  licenseId: string;
  label: string;
  jurisdiction?: string;
  required: boolean;
}

export interface ProfessionRelationship {
  relationshipId: string;
  targetProfessionId: string;
  kind: "related" | "specialization_of" | "trade_variant";
}

export interface TaxonomyBinding {
  primaryTaxonomyDomain: string;
  primaryTaxonomyCode: string;
  minProviderTier: "T1" | "T2" | "T3";
}

export interface BlueprintBinding {
  blueprintId: string;
  version: string;
  label: string;
}

export interface ActionFamilyDefinition {
  actionFamilyId: string;
  label: string;
  decompositionClass: ActionDecompositionClass;
  taxonomyCode: string;
}

export interface ProfessionBinding {
  professionId: string;
  taxonomyBinding: TaxonomyBinding;
  blueprintBindings: BlueprintBinding[];
}

export interface ProfessionNode {
  nodeId: string;
  level: HierarchyLevel;
  label: string;
  parentNodeId?: string;
}

export interface ProfessionHierarchy {
  professionId: string;
  nodes: ProfessionNode[];
}

export interface ProfessionOntologyEntry {
  professionId: string;
  label: string;
  category: ProfessionCategory;
  status: ProfessionOntologyStatus;
  summary: string;
  aliases: ProfessionAlias[];
  keywords: ProfessionKeyword[];
  skills: SkillDefinition[];
  capabilities: CapabilityDefinition[];
  credentials: CredentialRequirement[];
  licenses: LicenseRequirement[];
  relationships: ProfessionRelationship[];
  taxonomyBinding: TaxonomyBinding;
  blueprintBindings: BlueprintBinding[];
  actionFamilies: ActionFamilyDefinition[];
  hierarchy: ProfessionHierarchy;
  schemaVersion: typeof PROFESSION_ONTOLOGY_SCHEMA_VERSION;
  deprecatedBy?: string;
}

export interface ProfessionOntology {
  schemaVersion: typeof PROFESSION_ONTOLOGY_SCHEMA_VERSION;
  entries: ProfessionOntologyEntry[];
  generatedAt: Date;
}

export interface ProfessionGraph {
  professionId: string;
  label: string;
  matchedChannels: InputChannel[];
  nodes: ProfessionNode[];
  skills: SkillDefinition[];
  capabilities: CapabilityDefinition[];
  credentials: CredentialRequirement[];
  licenses: LicenseRequirement[];
  actionFamilies: ActionFamilyDefinition[];
  taxonomyBinding: TaxonomyBinding;
  blueprintBindings: BlueprintBinding[];
}

export interface ProfessionTransformationTrace {
  step: string;
  ruleId: string;
  detail: string;
  score: number;
  matchedProfessionId?: string;
  matchedTaxonomyCode?: string;
}

export interface ProfessionClassification {
  professionId: string;
  label: string;
  confidence: number;
  primaryTaxonomyDomain: string;
  primaryTaxonomyCode: string;
  matchedChannels: InputChannel[];
  graph: ProfessionGraph;
  trace: ProfessionTransformationTrace[];
  summary: string;
}

export interface ProfessionOntologyOverview {
  headline: string;
  schemaVersion: typeof PROFESSION_ONTOLOGY_SCHEMA_VERSION;
  registryCount: number;
  publishedCount: number;
  hierarchyLevels: HierarchyLevel[];
  inputChannels: InputChannel[];
  actionDecompositionClasses: ActionDecompositionClass[];
  summary: string;
}

export interface ProfessionOntologyCenter {
  overview: ProfessionOntologyOverview;
  generatedAt: Date;
}

export function buildProfessionOntologyOverview(input: {
  registryCount: number;
  publishedCount: number;
}): ProfessionOntologyOverview {
  return {
    headline: "APP13 Profession Ontology Mapping Engine",
    schemaVersion: PROFESSION_ONTOLOGY_SCHEMA_VERSION,
    registryCount: input.registryCount,
    publishedCount: input.publishedCount,
    hierarchyLevels: [...HIERARCHY_LEVELS],
    inputChannels: [
      "profession_name",
      "trade",
      "specialization",
      "license",
      "certification",
      "cv_job_title",
      "business_category",
    ],
    actionDecompositionClasses: [...ACTION_DECOMPOSITION_CLASSES],
    summary: `Profession ontology registry: ${input.registryCount} entries (${input.publishedCount} published).`,
  };
}

export function buildProfessionOntologyCenter(input: {
  registryCount: number;
  publishedCount: number;
  generatedAt?: Date;
}): ProfessionOntologyCenter {
  return {
    overview: buildProfessionOntologyOverview(input),
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function collectProfessionOntologyPaths(): string[] {
  return [
    "docs/action-intelligence/X41-Profession-Ontology-Mapping-Engine.md",
    "src/api/routes/profession-ontology.ts",
    "src/profession-ontology/module.ts",
    "test/x41-profession-ontology.test.ts",
    "scripts/verify-x41.sh",
  ];
}

// View types

export interface ProfessionOntologyCenterView {
  overview: {
    headline: string;
    schema_version: typeof PROFESSION_ONTOLOGY_SCHEMA_VERSION;
    registry_count: number;
    published_count: number;
    hierarchy_levels: HierarchyLevel[];
    input_channels: InputChannel[];
    action_decomposition_classes: ActionDecompositionClass[];
    summary: string;
  };
  generated_at: string;
}

export interface ProfessionOntologyEntryView {
  profession_id: string;
  label: string;
  category: ProfessionCategory;
  status: ProfessionOntologyStatus;
  summary: string;
  aliases: ProfessionAlias[];
  keywords: ProfessionKeyword[];
  skills: SkillDefinition[];
  capabilities: CapabilityDefinition[];
  credentials: CredentialRequirement[];
  licenses: LicenseRequirement[];
  relationships: ProfessionRelationship[];
  taxonomy_binding: TaxonomyBinding;
  blueprint_bindings: BlueprintBinding[];
  action_families: ActionFamilyDefinition[];
  hierarchy: ProfessionHierarchy;
  schema_version: typeof PROFESSION_ONTOLOGY_SCHEMA_VERSION;
  deprecated_by?: string;
}

export interface ProfessionGraphView {
  profession_id: string;
  label: string;
  matched_channels: InputChannel[];
  nodes: ProfessionNode[];
  skills: SkillDefinition[];
  capabilities: CapabilityDefinition[];
  credentials: CredentialRequirement[];
  licenses: LicenseRequirement[];
  action_families: ActionFamilyDefinition[];
  taxonomy_binding: TaxonomyBinding;
  blueprint_bindings: BlueprintBinding[];
}

export interface ProfessionClassificationView {
  profession_id: string;
  label: string;
  confidence: number;
  primary_taxonomy_domain: string;
  primary_taxonomy_code: string;
  matched_channels: InputChannel[];
  graph: ProfessionGraphView;
  trace: ProfessionTransformationTrace[];
  summary: string;
}

export function toProfessionOntologyEntryView(entry: ProfessionOntologyEntry): ProfessionOntologyEntryView {
  return {
    profession_id: entry.professionId,
    label: entry.label,
    category: entry.category,
    status: entry.status,
    summary: entry.summary,
    aliases: entry.aliases,
    keywords: entry.keywords,
    skills: entry.skills,
    capabilities: entry.capabilities,
    credentials: entry.credentials,
    licenses: entry.licenses,
    relationships: entry.relationships,
    taxonomy_binding: entry.taxonomyBinding,
    blueprint_bindings: entry.blueprintBindings,
    action_families: entry.actionFamilies,
    hierarchy: entry.hierarchy,
    schema_version: entry.schemaVersion,
    deprecated_by: entry.deprecatedBy,
  };
}

export function toProfessionGraphView(graph: ProfessionGraph): ProfessionGraphView {
  return {
    profession_id: graph.professionId,
    label: graph.label,
    matched_channels: graph.matchedChannels,
    nodes: graph.nodes,
    skills: graph.skills,
    capabilities: graph.capabilities,
    credentials: graph.credentials,
    licenses: graph.licenses,
    action_families: graph.actionFamilies,
    taxonomy_binding: graph.taxonomyBinding,
    blueprint_bindings: graph.blueprintBindings,
  };
}

export function toProfessionClassificationView(
  classification: ProfessionClassification
): ProfessionClassificationView {
  return {
    profession_id: classification.professionId,
    label: classification.label,
    confidence: classification.confidence,
    primary_taxonomy_domain: classification.primaryTaxonomyDomain,
    primary_taxonomy_code: classification.primaryTaxonomyCode,
    matched_channels: classification.matchedChannels,
    graph: toProfessionGraphView(classification.graph),
    trace: classification.trace,
    summary: classification.summary,
  };
}

export function toProfessionOntologyCenterView(center: ProfessionOntologyCenter): ProfessionOntologyCenterView {
  return {
    overview: {
      headline: center.overview.headline,
      schema_version: center.overview.schemaVersion,
      registry_count: center.overview.registryCount,
      published_count: center.overview.publishedCount,
      hierarchy_levels: center.overview.hierarchyLevels,
      input_channels: center.overview.inputChannels,
      action_decomposition_classes: center.overview.actionDecompositionClasses,
      summary: center.overview.summary,
    },
    generated_at: center.generatedAt.toISOString(),
  };
}
