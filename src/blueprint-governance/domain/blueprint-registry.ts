import type { ActionBlueprint } from "../../action-blueprint/domain/action-blueprint.js";
import { SUPPORTED_COUNTRIES, SUPPORTED_LANGUAGES, REGISTRY_SCHEMA_VERSION } from "./registry-schema.js";
import type { CertificationLevel, CertificationReport } from "./blueprint-certification.js";
import { certifyBlueprint } from "./blueprint-certification.js";
import type { GovernanceStatus, MaturityLevel } from "./blueprint-lifecycle.js";
import { resolveMaturityLevel } from "./blueprint-lifecycle.js";
import type { BlueprintVersionGraph } from "./blueprint-versioning.js";
import { buildVersionGraph } from "./blueprint-versioning.js";

export interface CompatibilityMetadata {
  countries: string[];
  languages: string[];
  jurisdictionHints: string[];
  summary: string;
}

export interface MarketplaceReadinessPreview {
  ready: boolean;
  preview_only: true;
  certificationLevel: CertificationLevel;
  maturityLevel: MaturityLevel;
  blockers: string[];
  summary: string;
}

export interface BlueprintLineage {
  blueprintId: string;
  version: string;
  supersedes?: string;
  supersededBy?: string;
  sourceChannel: string;
  taxonomyCode: string;
}

export interface GlobalRegistryEntry {
  registryId: string;
  blueprintId: string;
  version: string;
  primaryTaxonomyCode: string;
  domain: string;
  title: string;
  status: GovernanceStatus;
  schemaVersion: typeof REGISTRY_SCHEMA_VERSION;
  certificationLevel: CertificationLevel;
  maturityLevel: MaturityLevel;
  canonical: boolean;
  qualityScore: number;
  lineage: BlueprintLineage;
  compatibility: CompatibilityMetadata;
  marketplaceReadiness: MarketplaceReadinessPreview;
  certificationReport?: CertificationReport;
  publishedAt?: string;
  deprecatedAt?: string;
  previewOnly: true;
}

export interface RegistryIndexEntry {
  registryId: string;
  blueprintId: string;
  version: string;
  primaryTaxonomyCode: string;
  domain: string;
  title: string;
  status: GovernanceStatus;
  certificationLevel: CertificationLevel;
  maturityLevel: MaturityLevel;
  canonical: boolean;
  qualityScore: number;
}

export interface DuplicateDetectionResult {
  blueprintId: string;
  duplicates: Array<{
    registryId: string;
    primaryTaxonomyCode: string;
    title: string;
    reason: string;
  }>;
}

export interface RegistrySearchResult {
  query: string;
  totalCount: number;
  entries: RegistryIndexEntry[];
  summary: string;
}

function resolveCompatibility(blueprint: ActionBlueprint): CompatibilityMetadata {
  const countries = blueprint.scope.jurisdictionHints.length > 0
    ? blueprint.scope.jurisdictionHints.filter((hint) =>
        SUPPORTED_COUNTRIES.some((country) => hint.includes(country))
      )
    : ["US", "EU-GENERIC"];

  const normalizedCountries = countries.length > 0 ? [...new Set(countries)] : ["US"];
  const languages = blueprint.domain === "D" ? ["en", "ar"] : ["en"];

  return {
    countries: normalizedCountries,
    languages: languages.filter((lang) => SUPPORTED_LANGUAGES.includes(lang as (typeof SUPPORTED_LANGUAGES)[number])),
    jurisdictionHints: blueprint.scope.jurisdictionHints,
    summary: `Compatibility: ${normalizedCountries.join(", ")} / ${languages.join(", ")}`,
  };
}

export function buildMarketplaceReadiness(input: {
  certificationLevel: CertificationLevel;
  maturityLevel: MaturityLevel;
  countries: string[];
  languages: string[];
}): MarketplaceReadinessPreview {
  const blockers: string[] = [];
  const order = ["unverified", "bronze", "silver", "gold", "platinum"];
  if (order.indexOf(input.certificationLevel) < order.indexOf("gold")) {
    blockers.push("Requires gold certification for marketplace publication");
  }
  if (input.maturityLevel !== "mature") {
    blockers.push("Requires mature maturity level");
  }
  if (input.countries.length === 0) {
    blockers.push("Country compatibility metadata required");
  }
  if (input.languages.length === 0) {
    blockers.push("Language compatibility metadata required");
  }

  return {
    ready: blockers.length === 0,
    preview_only: true,
    certificationLevel: input.certificationLevel,
    maturityLevel: input.maturityLevel,
    blockers,
    summary: blockers.length === 0
      ? "Marketplace publication readiness: ready (preview only)."
      : `Marketplace publication readiness: blocked (${blockers.length} items).`,
  };
}

export function buildRegistryEntry(input: {
  blueprint: ActionBlueprint;
  status: GovernanceStatus;
  certificationLevel: CertificationLevel;
  maturityLevel: MaturityLevel;
  qualityScore: number;
  canonical: boolean;
  publishedAt?: string;
  deprecatedAt?: string;
  supersedes?: string;
  supersededBy?: string;
  certificationReport?: CertificationReport;
}): GlobalRegistryEntry {
  const compatibility = resolveCompatibility(input.blueprint);
  const certificationReport = input.certificationReport ?? certifyBlueprint(input.blueprint);

  return {
    registryId: `registry://${input.blueprint.blueprintId}@${input.blueprint.version}`,
    blueprintId: input.blueprint.blueprintId,
    version: input.blueprint.version,
    primaryTaxonomyCode: input.blueprint.primaryTaxonomyCode,
    domain: input.blueprint.domain,
    title: input.blueprint.title,
    status: input.status,
    schemaVersion: REGISTRY_SCHEMA_VERSION,
    certificationLevel: input.certificationLevel,
    maturityLevel: input.maturityLevel,
    canonical: input.canonical,
    qualityScore: input.qualityScore,
    lineage: {
      blueprintId: input.blueprint.blueprintId,
      version: input.blueprint.version,
      supersedes: input.supersedes ?? input.blueprint.supersedes,
      supersededBy: input.supersededBy ?? input.blueprint.deprecatedBy,
      sourceChannel: input.blueprint.sourceChannel,
      taxonomyCode: input.blueprint.primaryTaxonomyCode,
    },
    compatibility,
    marketplaceReadiness: buildMarketplaceReadiness({
      certificationLevel: input.certificationLevel,
      maturityLevel: input.maturityLevel,
      countries: compatibility.countries,
      languages: compatibility.languages,
    }),
    certificationReport,
    publishedAt: input.publishedAt,
    deprecatedAt: input.deprecatedAt,
    previewOnly: true,
  };
}

export function buildRegistryIndex(entries: GlobalRegistryEntry[]): RegistryIndexEntry[] {
  return entries.map((entry) => ({
    registryId: entry.registryId,
    blueprintId: entry.blueprintId,
    version: entry.version,
    primaryTaxonomyCode: entry.primaryTaxonomyCode,
    domain: entry.domain,
    title: entry.title,
    status: entry.status,
    certificationLevel: entry.certificationLevel,
    maturityLevel: entry.maturityLevel,
    canonical: entry.canonical,
    qualityScore: entry.qualityScore,
  }));
}

export function selectCanonicalEntries(entries: GlobalRegistryEntry[]): GlobalRegistryEntry[] {
  const byBlueprint = new Map<string, GlobalRegistryEntry[]>();
  for (const entry of entries) {
    const group = byBlueprint.get(entry.blueprintId) ?? [];
    group.push(entry);
    byBlueprint.set(entry.blueprintId, group);
  }

  const canonical: GlobalRegistryEntry[] = [];
  for (const group of byBlueprint.values()) {
    const published = group.filter((entry) => entry.status === "published");
    const pool = published.length > 0 ? published : group;
    const best = [...pool].sort((left, right) => {
      if (left.qualityScore !== right.qualityScore) {
        return right.qualityScore - left.qualityScore;
      }
      return right.version.localeCompare(left.version);
    })[0];
    if (best) {
      canonical.push({ ...best, canonical: true });
    }
  }
  return canonical;
}

export function detectDuplicates(entries: GlobalRegistryEntry[]): DuplicateDetectionResult[] {
  const byTaxonomy = new Map<string, GlobalRegistryEntry[]>();
  for (const entry of entries) {
    const group = byTaxonomy.get(entry.primaryTaxonomyCode) ?? [];
    group.push(entry);
    byTaxonomy.set(entry.primaryTaxonomyCode, group);
  }

  const results: DuplicateDetectionResult[] = [];
  for (const [taxonomyCode, group] of byTaxonomy.entries()) {
    if (group.length <= 1) continue;
    const blueprintIds = new Set(group.map((entry) => entry.blueprintId));
    if (blueprintIds.size <= 1) continue;

    for (const entry of group) {
      const duplicates = group
        .filter((other) => other.registryId !== entry.registryId)
        .map((other) => ({
          registryId: other.registryId,
          primaryTaxonomyCode: other.primaryTaxonomyCode,
          title: other.title,
          reason: `Shared taxonomy code ${taxonomyCode}`,
        }));

      if (duplicates.length > 0) {
        results.push({ blueprintId: entry.blueprintId, duplicates });
      }
    }
  }

  return results;
}

export function searchRegistry(input: {
  entries: GlobalRegistryEntry[];
  query?: string;
  domain?: string;
  taxonomyCode?: string;
  status?: GovernanceStatus;
}): RegistrySearchResult {
  let filtered = [...input.entries];

  if (input.domain) {
    filtered = filtered.filter((entry) => entry.domain === input.domain);
  }
  if (input.taxonomyCode) {
    filtered = filtered.filter((entry) => entry.primaryTaxonomyCode === input.taxonomyCode);
  }
  if (input.status) {
    filtered = filtered.filter((entry) => entry.status === input.status);
  }
  if (input.query) {
    const normalized = input.query.toLowerCase();
    filtered = filtered.filter(
      (entry) =>
        entry.title.toLowerCase().includes(normalized) ||
        entry.blueprintId.toLowerCase().includes(normalized) ||
        entry.primaryTaxonomyCode.toLowerCase().includes(normalized)
    );
  }

  const index = buildRegistryIndex(filtered);
  return {
    query: input.query ?? "",
    totalCount: index.length,
    entries: index,
    summary: `Registry search returned ${index.length} entries.`,
  };
}

export function buildLineageGraph(entries: GlobalRegistryEntry[]): BlueprintVersionGraph[] {
  const byBlueprint = new Map<string, GlobalRegistryEntry[]>();
  for (const entry of entries) {
    const group = byBlueprint.get(entry.blueprintId) ?? [];
    group.push(entry);
    byBlueprint.set(entry.blueprintId, group);
  }

  return [...byBlueprint.entries()].map(([blueprintId, group]) =>
    buildVersionGraph(
      blueprintId,
      group.map((entry) => ({
        blueprintId: entry.blueprintId,
        version: entry.version,
        status: entry.status,
        publishedAt: entry.publishedAt,
        supersedes: entry.lineage.supersedes,
        supersededBy: entry.lineage.supersededBy,
      }))
    )
  );
}

export function seedRegistryFromBlueprints(blueprints: ActionBlueprint[]): GlobalRegistryEntry[] {
  return blueprints.map((blueprint) => {
    const certification = certifyBlueprint(blueprint);
    const maturityLevel = resolveMaturityLevel({
      status: "published",
      qualityScore: certification.qualityScore,
      certificationScore: certification.score,
    });

    return buildRegistryEntry({
      blueprint,
      status: "published",
      certificationLevel: certification.level,
      maturityLevel,
      qualityScore: certification.qualityScore,
      canonical: true,
      publishedAt: "2026-06-20T00:00:00.000Z",
      certificationReport: certification,
    });
  });
}
