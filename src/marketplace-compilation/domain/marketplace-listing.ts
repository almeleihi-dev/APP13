import {
  EXECUTION_COMPLEXITY_LEVELS,
  LISTING_PUBLISH_STATUSES,
  LISTING_VISIBILITY_LEVELS,
  MARKETPLACE_COMPILATION_SCHEMA_VERSION,
} from "./marketplace-schema.js";
import type { CategoryMetadata } from "./category-metadata.js";
import type { CustomerPresentationModel, CustomerListingView } from "./customer-presentation.js";
import type { ProviderEligibility, ProviderListingView } from "./provider-eligibility.js";
import type { SearchIndexDocument } from "./search-index.js";

export type ListingPublishStatus = (typeof LISTING_PUBLISH_STATUSES)[number];
export type ListingVisibility = (typeof LISTING_VISIBILITY_LEVELS)[number];
export type ExecutionComplexity = (typeof EXECUTION_COMPLEXITY_LEVELS)[number];

export interface PublicationMetadata {
  registryId: string;
  governanceStatus: string;
  certificationLevel: string;
  maturityLevel: string;
  marketplaceReady: boolean;
  publicationVersion: string;
  compiledAt: string;
  previewOnly: true;
  summary: string;
}

export interface MarketplaceListing {
  id: string;
  blueprintId: string;
  version: string;
  primaryTaxonomyCode: string;
  schemaVersion: typeof MARKETPLACE_COMPILATION_SCHEMA_VERSION;
  title: string;
  subtitle: string;
  summary: string;
  category: string;
  subCategory: string;
  searchKeywords: string[];
  tags: string[];
  contractType: string;
  requiredSkills: string[];
  requiredVerification: string;
  executionComplexity: ExecutionComplexity;
  estimatedDuration: { min: number; max: number };
  customerView: CustomerListingView;
  providerView: ProviderListingView;
  visibility: ListingVisibility;
  publishStatus: ListingPublishStatus;
  publicationVersion: string;
  compiledAt: string;
  categoryMetadata: CategoryMetadata;
  contractMetadata: ReturnType<typeof import("./category-metadata.js").buildContractMetadata>;
  providerEligibility: ProviderEligibility;
  customerPresentation: CustomerPresentationModel;
  publicationMetadata: PublicationMetadata;
  searchDocument: SearchIndexDocument;
}

export interface MarketplaceCompilePreview {
  listing: MarketplaceListing;
  searchIndex: SearchIndexDocument;
  preview_only: true;
  blueprint_source_of_truth: true;
  summary: string;
}

export interface MarketplaceValidationReport {
  valid: boolean;
  compilable: boolean;
  governanceApproved: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export interface MarketplaceCompilationOverview {
  headline: string;
  schemaVersion: typeof MARKETPLACE_COMPILATION_SCHEMA_VERSION;
  listingCount: number;
  publishedListingCount: number;
  summary: string;
}

export interface MarketplaceCompilationCenter {
  overview: MarketplaceCompilationOverview;
  generatedAt: Date;
}

export function buildMarketplaceCompilationOverview(input: {
  listingCount: number;
  publishedListingCount: number;
}): MarketplaceCompilationOverview {
  return {
    headline: "APP13 Marketplace Compilation Engine",
    schemaVersion: MARKETPLACE_COMPILATION_SCHEMA_VERSION,
    listingCount: input.listingCount,
    publishedListingCount: input.publishedListingCount,
    summary: `Marketplace listings: ${input.listingCount} (${input.publishedListingCount} published).`,
  };
}

export function buildMarketplaceCompilationCenter(input: {
  listingCount: number;
  publishedListingCount: number;
  generatedAt?: Date;
}): MarketplaceCompilationCenter {
  return {
    overview: buildMarketplaceCompilationOverview(input),
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function collectMarketplaceCompilationPaths(): string[] {
  return [
    "docs/action-intelligence/X46-Marketplace-Compilation-Engine.md",
    "src/api/routes/marketplace-compilation.ts",
    "src/marketplace-compilation/module.ts",
    "test/x46-marketplace-compilation.test.ts",
    "scripts/verify-x46.sh",
  ];
}

export interface MarketplaceListingView {
  id: string;
  blueprint_id: string;
  version: string;
  primary_taxonomy_code: string;
  schema_version: typeof MARKETPLACE_COMPILATION_SCHEMA_VERSION;
  title: string;
  subtitle: string;
  summary: string;
  category: string;
  sub_category: string;
  search_keywords: string[];
  tags: string[];
  contract_type: string;
  required_skills: string[];
  required_verification: string;
  execution_complexity: ExecutionComplexity;
  estimated_duration: { min: number; max: number };
  customer_view: CustomerListingView;
  provider_view: ProviderListingView;
  visibility: ListingVisibility;
  publish_status: ListingPublishStatus;
  publication_version: string;
  compiled_at: string;
  category_metadata: CategoryMetadata;
  contract_metadata: ReturnType<typeof import("./category-metadata.js").buildContractMetadata>;
  provider_eligibility: ProviderEligibility;
  customer_presentation: CustomerPresentationModel;
  publication_metadata: Omit<PublicationMetadata, "previewOnly"> & { preview_only: true };
  search_document: SearchIndexDocument;
}

export function toMarketplaceListingView(listing: MarketplaceListing): MarketplaceListingView {
  return {
    id: listing.id,
    blueprint_id: listing.blueprintId,
    version: listing.version,
    primary_taxonomy_code: listing.primaryTaxonomyCode,
    schema_version: listing.schemaVersion,
    title: listing.title,
    subtitle: listing.subtitle,
    summary: listing.summary,
    category: listing.category,
    sub_category: listing.subCategory,
    search_keywords: listing.searchKeywords,
    tags: listing.tags,
    contract_type: listing.contractType,
    required_skills: listing.requiredSkills,
    required_verification: listing.requiredVerification,
    execution_complexity: listing.executionComplexity,
    estimated_duration: listing.estimatedDuration,
    customer_view: listing.customerView,
    provider_view: listing.providerView,
    visibility: listing.visibility,
    publish_status: listing.publishStatus,
    publication_version: listing.publicationVersion,
    compiled_at: listing.compiledAt,
    category_metadata: listing.categoryMetadata,
    contract_metadata: listing.contractMetadata,
    provider_eligibility: listing.providerEligibility,
    customer_presentation: listing.customerPresentation,
    publication_metadata: {
      registryId: listing.publicationMetadata.registryId,
      governanceStatus: listing.publicationMetadata.governanceStatus,
      certificationLevel: listing.publicationMetadata.certificationLevel,
      maturityLevel: listing.publicationMetadata.maturityLevel,
      marketplaceReady: listing.publicationMetadata.marketplaceReady,
      publicationVersion: listing.publicationMetadata.publicationVersion,
      compiledAt: listing.publicationMetadata.compiledAt,
      preview_only: true,
      summary: listing.publicationMetadata.summary,
    },
    search_document: listing.searchDocument,
  };
}

export interface MarketplaceCompilationCenterView {
  overview: {
    headline: string;
    schema_version: typeof MARKETPLACE_COMPILATION_SCHEMA_VERSION;
    listing_count: number;
    published_listing_count: number;
    summary: string;
  };
  generated_at: string;
}

export function toMarketplaceCompilationCenterView(
  center: MarketplaceCompilationCenter
): MarketplaceCompilationCenterView {
  return {
    overview: {
      headline: center.overview.headline,
      schema_version: center.overview.schemaVersion,
      listing_count: center.overview.listingCount,
      published_listing_count: center.overview.publishedListingCount,
      summary: center.overview.summary,
    },
    generated_at: center.generatedAt.toISOString(),
  };
}

export function toMarketplaceValidationReportView(report: MarketplaceValidationReport) {
  return {
    valid: report.valid,
    compilable: report.compilable,
    governance_approved: report.governanceApproved,
    errors: report.errors,
    warnings: report.warnings,
    summary: report.summary,
  };
}
