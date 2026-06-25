import type { ActionBlueprint } from "../../action-blueprint/domain/action-blueprint.js";
import type { GlobalRegistryEntry } from "../../blueprint-governance/domain/blueprint-registry.js";
import { synthesizeTekrrProfile } from "../../tekrr-intelligence/domain/tekrr-synthesizer.js";
import { compileExecutionBlueprint } from "../../execution-blueprint/domain/execution-compiler.js";
import { MARKETPLACE_COMPILATION_SCHEMA_VERSION } from "./marketplace-schema.js";
import { buildCategoryMetadata, buildContractMetadata } from "./category-metadata.js";
import { buildCustomerPresentation, buildCustomerView } from "./customer-presentation.js";
import { buildProviderEligibility, buildProviderView } from "./provider-eligibility.js";
import {
  buildSearchIndexDocument,
  buildSearchKeywords,
  buildSearchTags,
} from "./search-index.js";
import { validateForMarketplaceCompilation } from "./marketplace-validation.js";
import type {
  ExecutionComplexity,
  MarketplaceCompilePreview,
  MarketplaceListing,
  PublicationMetadata,
} from "./marketplace-listing.js";

function resolveExecutionComplexity(riskLevel: number, milestoneCount: number): ExecutionComplexity {
  if (riskLevel >= 4 || milestoneCount >= 6) return "expert";
  if (riskLevel >= 3 || milestoneCount >= 5) return "high";
  if (milestoneCount >= 4) return "moderate";
  return "low";
}

function buildSubtitle(blueprint: ActionBlueprint): string {
  return `${blueprint.intent.verb} ${blueprint.intent.object} for ${blueprint.intent.beneficiary}`;
}

function buildPublicationMetadata(input: {
  registryEntry: GlobalRegistryEntry;
  compiledAt: string;
}): PublicationMetadata {
  return {
    registryId: input.registryEntry.registryId,
    governanceStatus: input.registryEntry.status,
    certificationLevel: input.registryEntry.certificationLevel,
    maturityLevel: input.registryEntry.maturityLevel,
    marketplaceReady: input.registryEntry.marketplaceReadiness.ready,
    publicationVersion: input.registryEntry.version,
    compiledAt: input.compiledAt,
    previewOnly: true,
    summary: input.registryEntry.marketplaceReadiness.summary,
  };
}

export function compileMarketplaceListing(input: {
  blueprint: ActionBlueprint;
  registryEntry: GlobalRegistryEntry;
  compiledAt?: string;
}): MarketplaceListing {
  const validation = validateForMarketplaceCompilation({
    blueprint: input.blueprint,
    registryEntry: input.registryEntry,
  });
  if (!validation.compilable) {
    throw new Error(validation.summary);
  }

  const compiledAt = input.compiledAt ?? new Date().toISOString();
  const tekrrProfile = synthesizeTekrrProfile({ blueprint: input.blueprint });
  const executionBlueprint = compileExecutionBlueprint({ blueprint: input.blueprint });
  const categoryMetadata = buildCategoryMetadata(input.blueprint);
  const contractMetadata = buildContractMetadata(input.blueprint);
  const providerEligibility = buildProviderEligibility({
    blueprint: input.blueprint,
    tekrrProfile,
    executionBlueprint,
  });
  const customerPresentation = buildCustomerPresentation({
    blueprint: input.blueprint,
    executionBlueprint,
  });
  const subtitle = buildSubtitle(input.blueprint);
  const searchKeywords = buildSearchKeywords(input.blueprint, categoryMetadata);
  const tags = buildSearchTags(input.blueprint, input.registryEntry);
  const listingId = `listing://${input.blueprint.blueprintId}@${input.blueprint.version}`;

  const searchDocument = buildSearchIndexDocument({
    listingId,
    blueprint: input.blueprint,
    category: categoryMetadata,
    registryEntry: input.registryEntry,
    searchKeywords,
    tags,
    compiledAt,
  });

  const customerView = buildCustomerView(customerPresentation, subtitle);
  const providerView = buildProviderView({
    blueprint: input.blueprint,
    tekrrProfile,
    executionBlueprint,
    eligibility: providerEligibility,
  });

  return {
    id: listingId,
    blueprintId: input.blueprint.blueprintId,
    version: input.blueprint.version,
    primaryTaxonomyCode: input.blueprint.primaryTaxonomyCode,
    schemaVersion: MARKETPLACE_COMPILATION_SCHEMA_VERSION,
    title: input.blueprint.title,
    subtitle,
    summary: input.blueprint.summary,
    category: categoryMetadata.category,
    subCategory: categoryMetadata.subCategory,
    searchKeywords,
    tags,
    contractType: contractMetadata.contractType,
    requiredSkills: [
      tekrrProfile.skillLevel.level,
      input.blueprint.actorRequirements.providerRole,
      ...input.blueprint.actorRequirements.requiredCredentials,
    ],
    requiredVerification: input.blueprint.minProviderTier,
    executionComplexity: resolveExecutionComplexity(
      input.blueprint.riskLevelDefault,
      executionBlueprint.milestones.length
    ),
    estimatedDuration: executionBlueprint.estimatedDurationHours,
    customerView,
    providerView,
    visibility: input.registryEntry.marketplaceReadiness.ready ? "public" : "restricted",
    publishStatus: "compiled",
    publicationVersion: input.registryEntry.version,
    compiledAt,
    categoryMetadata,
    contractMetadata,
    providerEligibility,
    customerPresentation,
    publicationMetadata: buildPublicationMetadata({
      registryEntry: input.registryEntry,
      compiledAt,
    }),
    searchDocument,
  };
}

export function buildMarketplaceCompilePreview(input: {
  blueprint: ActionBlueprint;
  registryEntry: GlobalRegistryEntry;
  compiledAt?: string;
}): MarketplaceCompilePreview {
  const listing = compileMarketplaceListing(input);
  return {
    listing,
    searchIndex: listing.searchDocument,
    preview_only: true,
    blueprint_source_of_truth: true,
    summary: `Marketplace compile preview for ${listing.id} — blueprint remains source of truth, no runtime records created.`,
  };
}
