import {
  KNOWLEDGE_BANK_SCHEMA_VERSION,
  LIFECYCLE_TRANSITIONS,
} from "./knowledge-bank-schema.js";
import type {
  CompiledKnowledgeRegistry,
  KnowledgeCategory,
  KnowledgeConfidenceLevel,
  KnowledgeContribution,
  KnowledgeItem,
  KnowledgeLifecycleState,
  KnowledgeRelationship,
  KnowledgeSourceEngine,
  KnowledgeVersion,
} from "./knowledge-bank-registry.js";

export type { KnowledgeItem, KnowledgeContribution, KnowledgeRelationship, KnowledgeVersion };

export interface KnowledgeLifecycle {
  itemId: string;
  currentState: KnowledgeLifecycleState;
  transitions: Array<{
    action: string;
    from: KnowledgeLifecycleState;
    to: KnowledgeLifecycleState;
    explanation: string;
    allowed: boolean;
  }>;
  lineage: string[];
  explanation: {
    headline: string;
    reasons: string[];
    summary: string;
  };
}

export interface KnowledgeApproval {
  approvalId: string;
  itemId: string;
  approvedBy: string;
  approvedAt: string;
  fromState: KnowledgeLifecycleState;
  toState: KnowledgeLifecycleState;
  explanation: string;
}

export interface KnowledgeValidation {
  valid: boolean;
  itemId: string;
  errors: string[];
  warnings: string[];
  checks: Array<{ checkId: string; label: string; passed: boolean; detail: string }>;
  summary: string;
}

export interface KnowledgeRegistry {
  schemaVersion: typeof KNOWLEDGE_BANK_SCHEMA_VERSION;
  itemCount: number;
  contributionCount: number;
  relationshipCount: number;
  versionCount: number;
  categoryDistribution: Record<string, number>;
  sourceDistribution: Record<string, number>;
  lifecycleDistribution: Record<string, number>;
  compiledAt: string;
}

export interface KnowledgeBankSummary {
  schemaVersion: typeof KNOWLEDGE_BANK_SCHEMA_VERSION;
  headline: string;
  subheadline: string;
  itemCount: number;
  publishedCount: number;
  categoryCount: number;
  sourceEngineCount: number;
  relationshipCount: number;
  registry: KnowledgeRegistry;
  readOnly: true;
  generatedAt: string;
}

export interface KnowledgeBankStatistics {
  totalItems: number;
  totalContributions: number;
  totalRelationships: number;
  publishedItems: number;
  archivedItems: number;
  categoryDistribution: Record<string, number>;
  sourceDistribution: Record<string, number>;
  generatedAt: string;
}

export interface LifecycleTransitionResult {
  itemId: string;
  previousState: KnowledgeLifecycleState;
  newState: KnowledgeLifecycleState;
  action: string;
  explanation: string;
  success: boolean;
  error?: string;
}

const CATEGORY_LABELS: Record<KnowledgeCategory, string> = {
  professional_knowledge: "Professional Knowledge",
  action_knowledge: "Action Knowledge",
  blueprint_knowledge: "Blueprint Knowledge",
  marketplace_knowledge: "Marketplace Knowledge",
  pricing_knowledge: "Pricing Knowledge",
  learning_knowledge: "Learning Knowledge",
  expert_knowledge: "Expert Knowledge",
  team_knowledge: "Team Knowledge",
  trust_knowledge: "Trust Knowledge",
  governance_knowledge: "Governance Knowledge",
};

export function getCategoryCatalog(): Array<{ category: KnowledgeCategory; label: string }> {
  return (Object.keys(CATEGORY_LABELS) as KnowledgeCategory[]).map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
  }));
}

function countBy<T extends string>(values: T[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of values) {
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

export function applyStatusOverrides(
  registry: CompiledKnowledgeRegistry,
  overrides: Map<string, KnowledgeLifecycleState>
): KnowledgeItem[] {
  return registry.items.map((item) => {
    const override = overrides.get(item.itemId);
    if (!override) return item;
    return { ...item, status: override };
  });
}

export function validateKnowledgeItem(item: KnowledgeItem): KnowledgeValidation {
  const checks = [
    {
      checkId: "check://item_id",
      label: "Item ID present",
      passed: item.itemId.length > 0,
      detail: item.itemId || "missing",
    },
    {
      checkId: "check://title",
      label: "Title present",
      passed: item.title.length > 0,
      detail: item.title || "missing",
    },
    {
      checkId: "check://source_engine",
      label: "Source engine identified",
      passed: item.sourceEngine.length > 0,
      detail: item.sourceEngine,
    },
    {
      checkId: "check://version",
      label: "Version present",
      passed: item.version.length > 0,
      detail: item.version,
    },
    {
      checkId: "check://confidence",
      label: "Confidence score valid",
      passed: item.confidenceScore >= 0 && item.confidenceScore <= 100,
      detail: String(item.confidenceScore),
    },
  ];

  const errors: string[] = [];
  const warnings: string[] = [];
  if (!checks.every((check) => check.passed)) {
    errors.push("One or more structural validation checks failed");
  }
  if (item.confidenceScore < 60) {
    warnings.push("Low confidence score — review before publication");
  }

  return {
    valid: errors.length === 0,
    itemId: item.itemId,
    errors,
    warnings,
    checks,
    summary:
      errors.length === 0
        ? "Knowledge item passed validation checks."
        : "Knowledge item failed validation.",
  };
}

export function buildKnowledgeLifecycle(
  item: KnowledgeItem,
  relationships: KnowledgeRelationship[]
): KnowledgeLifecycle {
  const related = relationships.filter(
    (rel) => rel.fromItemId === item.itemId || rel.toItemId === item.itemId
  );
  const lineage = [
    `Contributed by ${item.sourceEngine}`,
    `Category: ${item.category}`,
    `Version: ${item.version}`,
    ...related.map((rel) => rel.label),
  ];

  const transitions = Object.entries(LIFECYCLE_TRANSITIONS).map(([action, config]) => ({
    action,
    from: item.status,
    to: config.to,
    explanation: config.explanation,
    allowed: config.from.includes(item.status),
  }));

  return {
    itemId: item.itemId,
    currentState: item.status,
    transitions,
    lineage,
    explanation: {
      headline: `Lifecycle state: ${item.status}`,
      reasons: lineage,
      summary: `Knowledge item is ${item.status}. ${transitions.filter((t) => t.allowed).length} transition(s) available.`,
    },
  };
}

export function transitionLifecycle(
  item: KnowledgeItem,
  action: keyof typeof LIFECYCLE_TRANSITIONS
): LifecycleTransitionResult {
  const config = LIFECYCLE_TRANSITIONS[action];
  if (!config) {
    return {
      itemId: item.itemId,
      previousState: item.status,
      newState: item.status,
      action,
      explanation: "",
      success: false,
      error: `Unknown lifecycle action: ${action}`,
    };
  }

  if (!config.from.includes(item.status)) {
    return {
      itemId: item.itemId,
      previousState: item.status,
      newState: item.status,
      action,
      explanation: config.explanation,
      success: false,
      error: `Cannot ${action} from state '${item.status}'. Allowed from: ${config.from.join(", ")}`,
    };
  }

  return {
    itemId: item.itemId,
    previousState: item.status,
    newState: config.to,
    action,
    explanation: config.explanation,
    success: true,
  };
}

export function buildKnowledgeRegistry(
  items: KnowledgeItem[],
  registry: CompiledKnowledgeRegistry
): KnowledgeRegistry {
  return {
    schemaVersion: KNOWLEDGE_BANK_SCHEMA_VERSION,
    itemCount: items.length,
    contributionCount: registry.contributions.length,
    relationshipCount: registry.relationships.length,
    versionCount: registry.versions.length,
    categoryDistribution: countBy(items.map((item) => item.category)),
    sourceDistribution: countBy(items.map((item) => item.sourceEngine)),
    lifecycleDistribution: countBy(items.map((item) => item.status)),
    compiledAt: registry.compiledAt,
  };
}

export function buildKnowledgeBankSummary(
  items: KnowledgeItem[],
  registry: CompiledKnowledgeRegistry
): KnowledgeBankSummary {
  const knowledgeRegistry = buildKnowledgeRegistry(items, registry);
  const publishedCount = items.filter((item) => item.status === "published").length;
  const sourceEngines = new Set(items.map((item) => item.sourceEngine));

  return {
    schemaVersion: KNOWLEDGE_BANK_SCHEMA_VERSION,
    headline: "Trusted knowledge registry for the APP13 platform",
    subheadline: `${items.length} knowledge items from ${sourceEngines.size} source engines`,
    itemCount: items.length,
    publishedCount,
    categoryCount: Object.keys(knowledgeRegistry.categoryDistribution).length,
    sourceEngineCount: sourceEngines.size,
    relationshipCount: registry.relationships.length,
    registry: knowledgeRegistry,
    readOnly: true,
    generatedAt: registry.compiledAt,
  };
}

export function buildKnowledgeBankStatistics(items: KnowledgeItem[], registry: CompiledKnowledgeRegistry): KnowledgeBankStatistics {
  return {
    totalItems: items.length,
    totalContributions: registry.contributions.length,
    totalRelationships: registry.relationships.length,
    publishedItems: items.filter((item) => item.status === "published").length,
    archivedItems: items.filter((item) => item.status === "archived").length,
    categoryDistribution: countBy(items.map((item) => item.category)),
    sourceDistribution: countBy(items.map((item) => item.sourceEngine)),
    generatedAt: new Date().toISOString(),
  };
}

export function collectKnowledgeBankPaths(rootDir: string): string[] {
  return [`${rootDir}/src/knowledge-bank`];
}

export function toKnowledgeBankSummaryView(summary: KnowledgeBankSummary) {
  return {
    schema_version: summary.schemaVersion,
    headline: summary.headline,
    subheadline: summary.subheadline,
    item_count: summary.itemCount,
    published_count: summary.publishedCount,
    category_count: summary.categoryCount,
    source_engine_count: summary.sourceEngineCount,
    relationship_count: summary.relationshipCount,
    registry: {
      schema_version: summary.registry.schemaVersion,
      item_count: summary.registry.itemCount,
      contribution_count: summary.registry.contributionCount,
      relationship_count: summary.registry.relationshipCount,
      version_count: summary.registry.versionCount,
      category_distribution: summary.registry.categoryDistribution,
      source_distribution: summary.registry.sourceDistribution,
      lifecycle_distribution: summary.registry.lifecycleDistribution,
      compiled_at: summary.registry.compiledAt,
    },
    read_only: summary.readOnly,
    generated_at: summary.generatedAt,
  };
}

export function toKnowledgeItemView(item: KnowledgeItem) {
  return {
    item_id: item.itemId,
    title: item.title,
    summary: item.summary,
    category: item.category,
    source_engine: item.sourceEngine,
    confidence: item.confidence,
    confidence_score: item.confidenceScore,
    version: item.version,
    status: item.status,
    author: item.author,
    contributed_at: item.contributedAt,
    related_objects: item.relatedObjects,
    read_only: item.readOnly,
  };
}

export function toKnowledgeContributionView(contribution: KnowledgeContribution) {
  return {
    contribution_id: contribution.contributionId,
    item_id: contribution.itemId,
    source_engine: contribution.sourceEngine,
    category: contribution.category,
    confidence: contribution.confidence,
    version: contribution.version,
    status: contribution.status,
    author: contribution.author,
    timestamp: contribution.timestamp,
    related_objects: contribution.relatedObjects,
    summary: contribution.summary,
  };
}

export function toKnowledgeRelationshipView(relationship: KnowledgeRelationship) {
  return {
    relationship_id: relationship.relationshipId,
    from_item_id: relationship.fromItemId,
    to_item_id: relationship.toItemId,
    relationship_type: relationship.relationshipType,
    label: relationship.label,
  };
}

export function toKnowledgeVersionView(version: KnowledgeVersion) {
  return {
    version_id: version.versionId,
    item_id: version.itemId,
    version: version.version,
    status: version.status,
    created_at: version.createdAt,
    summary: version.summary,
  };
}

export function toKnowledgeLifecycleView(lifecycle: KnowledgeLifecycle) {
  return {
    item_id: lifecycle.itemId,
    current_state: lifecycle.currentState,
    transitions: lifecycle.transitions.map((transition) => ({
      action: transition.action,
      from: transition.from,
      to: transition.to,
      explanation: transition.explanation,
      allowed: transition.allowed,
    })),
    lineage: lifecycle.lineage,
    explanation: lifecycle.explanation,
  };
}

export function toKnowledgeValidationView(validation: KnowledgeValidation) {
  return {
    valid: validation.valid,
    item_id: validation.itemId,
    errors: validation.errors,
    warnings: validation.warnings,
    checks: validation.checks,
    summary: validation.summary,
  };
}

export function toKnowledgeBankStatisticsView(stats: KnowledgeBankStatistics) {
  return {
    total_items: stats.totalItems,
    total_contributions: stats.totalContributions,
    total_relationships: stats.totalRelationships,
    published_items: stats.publishedItems,
    archived_items: stats.archivedItems,
    category_distribution: stats.categoryDistribution,
    source_distribution: stats.sourceDistribution,
    generated_at: stats.generatedAt,
  };
}

export function toKnowledgeApprovalView(approval: KnowledgeApproval) {
  return {
    approval_id: approval.approvalId,
    item_id: approval.itemId,
    approved_by: approval.approvedBy,
    approved_at: approval.approvedAt,
    from_state: approval.fromState,
    to_state: approval.toState,
    explanation: approval.explanation,
  };
}

export type { KnowledgeCategory, KnowledgeSourceEngine, KnowledgeConfidenceLevel, KnowledgeLifecycleState };
