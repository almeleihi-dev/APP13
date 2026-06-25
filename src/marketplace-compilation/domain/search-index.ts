import type { ActionBlueprint } from "../../action-blueprint/domain/action-blueprint.js";
import type { CategoryMetadata } from "./category-metadata.js";
import type { GlobalRegistryEntry } from "../../blueprint-governance/domain/blueprint-registry.js";

export interface SearchIndexDocument {
  documentId: string;
  listingId: string;
  blueprintId: string;
  title: string;
  summary: string;
  category: string;
  subCategory: string;
  taxonomyCode: string;
  domain: string;
  searchKeywords: string[];
  tags: string[];
  certificationLevel: string;
  maturityLevel: string;
  countries: string[];
  languages: string[];
  compiledAt: string;
}

export function buildSearchKeywords(blueprint: ActionBlueprint, category: CategoryMetadata): string[] {
  const tokens = new Set<string>([
    blueprint.title.toLowerCase(),
    blueprint.primaryTaxonomyCode.toLowerCase(),
    blueprint.domain.toLowerCase(),
    category.category.toLowerCase(),
    category.subCategory.toLowerCase(),
    blueprint.intent.verb.toLowerCase(),
    blueprint.intent.object.toLowerCase(),
    ...blueprint.scope.inclusions.map((entry) => entry.toLowerCase()),
    ...blueprint.actorRequirements.requiredCredentials.map((entry) => entry.toLowerCase()),
  ]);
  return [...tokens].filter((token) => token.length > 1);
}

export function buildSearchTags(blueprint: ActionBlueprint, registryEntry: GlobalRegistryEntry): string[] {
  return [
    `domain:${blueprint.domain}`,
    `taxonomy:${blueprint.primaryTaxonomyCode}`,
    `tier:${blueprint.minProviderTier}`,
    `cert:${registryEntry.certificationLevel}`,
    `risk:${blueprint.riskLevelDefault}`,
    `channel:${blueprint.sourceChannel}`,
  ];
}

export function buildSearchIndexDocument(input: {
  listingId: string;
  blueprint: ActionBlueprint;
  category: CategoryMetadata;
  registryEntry: GlobalRegistryEntry;
  searchKeywords: string[];
  tags: string[];
  compiledAt: string;
}): SearchIndexDocument {
  return {
    documentId: `search://${input.listingId}`,
    listingId: input.listingId,
    blueprintId: input.blueprint.blueprintId,
    title: input.blueprint.title,
    summary: input.blueprint.summary,
    category: input.category.category,
    subCategory: input.category.subCategory,
    taxonomyCode: input.blueprint.primaryTaxonomyCode,
    domain: input.blueprint.domain,
    searchKeywords: input.searchKeywords,
    tags: input.tags,
    certificationLevel: input.registryEntry.certificationLevel,
    maturityLevel: input.registryEntry.maturityLevel,
    countries: input.registryEntry.compatibility.countries,
    languages: input.registryEntry.compatibility.languages,
    compiledAt: input.compiledAt,
  };
}

export function searchIndexDocuments(
  documents: SearchIndexDocument[],
  query?: string
): SearchIndexDocument[] {
  if (!query) return documents;
  const normalized = query.toLowerCase();
  return documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(normalized) ||
      doc.summary.toLowerCase().includes(normalized) ||
      doc.searchKeywords.some((keyword) => keyword.includes(normalized)) ||
      doc.taxonomyCode.toLowerCase().includes(normalized)
  );
}
