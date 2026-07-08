import { REGISTRY_SCHEMA_VERSION } from "./registry-schema.js";
import type { GlobalRegistryEntry, RegistryIndexEntry } from "./blueprint-registry.js";
import type { BlueprintVersionGraph } from "./blueprint-versioning.js";
import type { GovernancePolicy } from "./governance-policy.js";
import type { CertificationLevel } from "./blueprint-certification.js";
import type { GovernanceStatus, MaturityLevel } from "./blueprint-lifecycle.js";

export interface RegistryStatistics {
  totalEntries: number;
  publishedCount: number;
  deprecatedCount: number;
  canonicalCount: number;
  byDomain: Record<string, number>;
  byCertification: Record<CertificationLevel, number>;
  byMaturity: Record<MaturityLevel, number>;
  duplicateGroups: number;
  averageQualityScore: number;
  summary: string;
}

export interface BlueprintGovernanceOverview {
  headline: string;
  schemaVersion: typeof REGISTRY_SCHEMA_VERSION;
  registryCount: number;
  publishedCount: number;
  canonicalCount: number;
  summary: string;
}

export interface BlueprintGovernanceCenter {
  overview: BlueprintGovernanceOverview;
  generatedAt: Date;
}

export function buildRegistryStatistics(input: {
  entries: GlobalRegistryEntry[];
  duplicateGroups: number;
}): RegistryStatistics {
  const byDomain: Record<string, number> = {};
  const byCertification: Record<CertificationLevel, number> = {
    unverified: 0,
    bronze: 0,
    silver: 0,
    gold: 0,
    platinum: 0,
  };
  const byMaturity: Record<MaturityLevel, number> = {
    draft: 0,
    emerging: 0,
    stable: 0,
    mature: 0,
    deprecated: 0,
  };

  for (const entry of input.entries) {
    byDomain[entry.domain] = (byDomain[entry.domain] ?? 0) + 1;
    byCertification[entry.certificationLevel] += 1;
    byMaturity[entry.maturityLevel] += 1;
  }

  const qualityTotal = input.entries.reduce((sum, entry) => sum + entry.qualityScore, 0);
  const averageQualityScore = input.entries.length > 0
    ? Math.round(qualityTotal / input.entries.length)
    : 0;

  return {
    totalEntries: input.entries.length,
    publishedCount: input.entries.filter((entry) => entry.status === "published").length,
    deprecatedCount: input.entries.filter((entry) => entry.status === "deprecated").length,
    canonicalCount: input.entries.filter((entry) => entry.canonical).length,
    byDomain,
    byCertification,
    byMaturity,
    duplicateGroups: input.duplicateGroups,
    averageQualityScore,
    summary: `Registry statistics: ${input.entries.length} entries, ${averageQualityScore} avg quality score.`,
  };
}

export function buildBlueprintGovernanceOverview(input: {
  registryCount: number;
  publishedCount: number;
  canonicalCount: number;
}): BlueprintGovernanceOverview {
  return {
    headline: "APP13 Blueprint Governance & Global Registry",
    schemaVersion: REGISTRY_SCHEMA_VERSION,
    registryCount: input.registryCount,
    publishedCount: input.publishedCount,
    canonicalCount: input.canonicalCount,
    summary: `Global registry: ${input.registryCount} entries (${input.publishedCount} published, ${input.canonicalCount} canonical).`,
  };
}

export function buildBlueprintGovernanceCenter(input: {
  registryCount: number;
  publishedCount: number;
  canonicalCount: number;
  generatedAt?: Date;
}): BlueprintGovernanceCenter {
  return {
    overview: buildBlueprintGovernanceOverview(input),
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function collectBlueprintGovernancePaths(): string[] {
  return [
    "docs/action-intelligence/X45-Blueprint-Governance-Global-Registry-Engine.md",
    "src/api/routes/blueprint-governance.ts",
    "src/blueprint-governance/module.ts",
    "test/x45-blueprint-governance.test.ts",
    "scripts/verify-x45.sh",
  ];
}

export interface GlobalRegistryEntryView {
  registry_id: string;
  blueprint_id: string;
  version: string;
  primary_taxonomy_code: string;
  domain: string;
  title: string;
  status: GovernanceStatus;
  schema_version: typeof REGISTRY_SCHEMA_VERSION;
  certification_level: CertificationLevel;
  maturity_level: MaturityLevel;
  canonical: boolean;
  quality_score: number;
  lineage: GlobalRegistryEntry["lineage"];
  compatibility: GlobalRegistryEntry["compatibility"];
  marketplace_readiness: GlobalRegistryEntry["marketplaceReadiness"];
  published_at?: string;
  deprecated_at?: string;
  preview_only: true;
}

export function toGlobalRegistryEntryView(entry: GlobalRegistryEntry): GlobalRegistryEntryView {
  return {
    registry_id: entry.registryId,
    blueprint_id: entry.blueprintId,
    version: entry.version,
    primary_taxonomy_code: entry.primaryTaxonomyCode,
    domain: entry.domain,
    title: entry.title,
    status: entry.status,
    schema_version: entry.schemaVersion,
    certification_level: entry.certificationLevel,
    maturity_level: entry.maturityLevel,
    canonical: entry.canonical,
    quality_score: entry.qualityScore,
    lineage: entry.lineage,
    compatibility: entry.compatibility,
    marketplace_readiness: entry.marketplaceReadiness,
    published_at: entry.publishedAt,
    deprecated_at: entry.deprecatedAt,
    preview_only: true,
  };
}

export interface BlueprintGovernanceCenterView {
  overview: {
    headline: string;
    schema_version: typeof REGISTRY_SCHEMA_VERSION;
    registry_count: number;
    published_count: number;
    canonical_count: number;
    summary: string;
  };
  generated_at: string;
}

export function toBlueprintGovernanceCenterView(
  center: BlueprintGovernanceCenter
): BlueprintGovernanceCenterView {
  return {
    overview: {
      headline: center.overview.headline,
      schema_version: center.overview.schemaVersion,
      registry_count: center.overview.registryCount,
      published_count: center.overview.publishedCount,
      canonical_count: center.overview.canonicalCount,
      summary: center.overview.summary,
    },
    generated_at: center.generatedAt.toISOString(),
  };
}

export interface GovernanceDashboardView {
  policies: GovernancePolicy[];
  version_graphs: BlueprintVersionGraph[];
  certification_levels: CertificationLevel[];
  summary: string;
}

export interface RegistryStatisticsView {
  total_entries: number;
  published_count: number;
  deprecated_count: number;
  canonical_count: number;
  by_domain: Record<string, number>;
  by_certification: Record<CertificationLevel, number>;
  by_maturity: Record<MaturityLevel, number>;
  duplicate_groups: number;
  average_quality_score: number;
  summary: string;
}

export function toRegistryStatisticsView(stats: RegistryStatistics): RegistryStatisticsView {
  return {
    total_entries: stats.totalEntries,
    published_count: stats.publishedCount,
    deprecated_count: stats.deprecatedCount,
    canonical_count: stats.canonicalCount,
    by_domain: stats.byDomain,
    by_certification: stats.byCertification,
    by_maturity: stats.byMaturity,
    duplicate_groups: stats.duplicateGroups,
    average_quality_score: stats.averageQualityScore,
    summary: stats.summary,
  };
}

export function toRegistryIndexView(entries: RegistryIndexEntry[]) {
  return entries.map((entry) => ({
    registry_id: entry.registryId,
    blueprint_id: entry.blueprintId,
    version: entry.version,
    primary_taxonomy_code: entry.primaryTaxonomyCode,
    domain: entry.domain,
    title: entry.title,
    status: entry.status,
    certification_level: entry.certificationLevel,
    maturity_level: entry.maturityLevel,
    canonical: entry.canonical,
    quality_score: entry.qualityScore,
  }));
}
