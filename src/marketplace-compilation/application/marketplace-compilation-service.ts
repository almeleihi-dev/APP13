import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../security/guards.js";
import {
  fromActionBlueprintView,
  type ActionBlueprint,
  type ActionBlueprintView,
} from "../../action-blueprint/domain/action-blueprint.js";
import {
  createActionBlueprintRepository,
  type ActionBlueprintRepository,
} from "../../action-blueprint/infrastructure/action-blueprint-repository.js";
import {
  createBlueprintGovernanceRepository,
  type BlueprintGovernanceRepository,
} from "../../blueprint-governance/infrastructure/blueprint-governance-repository.js";
import { MARKETPLACE_COMPILATION_JSON_SCHEMA } from "../domain/marketplace-schema.js";
import {
  buildMarketplaceCompilePreview,
  compileMarketplaceListing,
} from "../domain/marketplace-compiler.js";
import {
  buildMarketplaceCompilationCenter,
  toMarketplaceCompilationCenterView,
  toMarketplaceListingView,
  toMarketplaceValidationReportView,
  type MarketplaceCompilationCenterView,
} from "../domain/marketplace-listing.js";
import { validateForMarketplaceCompilation } from "../domain/marketplace-validation.js";
import { listCategoryCatalog } from "../domain/category-metadata.js";
import { searchIndexDocuments } from "../domain/search-index.js";
import {
  createMarketplaceCompilationRepository,
  type MarketplaceCompilationRepository,
} from "../infrastructure/marketplace-compilation-repository.js";

export class MarketplaceCompilationService {
  private readonly repository: MarketplaceCompilationRepository;
  private readonly blueprintRepository: ActionBlueprintRepository;
  private readonly governanceRepository: BlueprintGovernanceRepository;

  constructor(deps?: {
    repository?: MarketplaceCompilationRepository;
    blueprintRepository?: ActionBlueprintRepository;
    governanceRepository?: BlueprintGovernanceRepository;
  }) {
    this.governanceRepository = deps?.governanceRepository ?? createBlueprintGovernanceRepository();
    this.repository =
      deps?.repository ??
      createMarketplaceCompilationRepository({ governanceRepository: this.governanceRepository });
    this.blueprintRepository = deps?.blueprintRepository ?? createActionBlueprintRepository();
  }

  getCenter(authContext: AuthContext): MarketplaceCompilationCenterView {
    this.assertAuthenticated(authContext);
    const center = buildMarketplaceCompilationCenter({
      listingCount: this.repository.getListingCount(),
      publishedListingCount: this.repository.getPublishedListingCount(),
    });
    return toMarketplaceCompilationCenterView(center);
  }

  getOverview(authContext: AuthContext): MarketplaceCompilationCenterView["overview"] {
    return this.getCenter(authContext).overview;
  }

  compile(
    authContext: AuthContext,
    input: { blueprint?: ActionBlueprintView; blueprint_id?: string; version?: string }
  ) {
    this.assertAuthenticated(authContext);
    const blueprint = this.resolveBlueprint(input);
    const registryEntry = this.requireRegistryEntry(blueprint);
    const preview = buildMarketplaceCompilePreview({ blueprint, registryEntry });
    this.repository.saveCompiled({
      listing: preview.listing,
      searchIndex: preview.searchIndex,
      status: "compiled",
    });
    return {
      listing: toMarketplaceListingView(preview.listing),
      search_index: preview.searchIndex,
      preview_only: preview.preview_only,
      blueprint_source_of_truth: preview.blueprint_source_of_truth,
      summary: preview.summary,
    };
  }

  preview(
    authContext: AuthContext,
    input: { blueprint?: ActionBlueprintView; blueprint_id?: string; version?: string }
  ) {
    return this.compile(authContext, input);
  }

  validate(
    authContext: AuthContext,
    input: { blueprint?: ActionBlueprintView; blueprint_id?: string; version?: string }
  ) {
    this.assertAuthenticated(authContext);
    const blueprint = this.resolveBlueprint(input);
    const registryEntry = this.governanceRepository.getEntry(blueprint.blueprintId, blueprint.version);
    return toMarketplaceValidationReportView(
      validateForMarketplaceCompilation({ blueprint, registryEntry })
    );
  }

  listListings(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const listings = this.repository.listListings();
    return {
      listings: listings.map((entry) => ({
        id: entry.listing.id,
        blueprint_id: entry.listing.blueprintId,
        title: entry.listing.title,
        category: entry.listing.category,
        publish_status: entry.status,
        visibility: entry.listing.visibility,
        compiled_at: entry.listing.compiledAt,
      })),
      total_count: listings.length,
      summary: `Marketplace listings: ${listings.length} compiled entries.`,
    };
  }

  getListing(authContext: AuthContext, listingId: string) {
    this.assertAuthenticated(authContext);
    const entry = this.repository.getListingById(decodeURIComponent(listingId));
    if (!entry) {
      throw new Error(`Listing not found: ${listingId}`);
    }
    return toMarketplaceListingView(entry.listing);
  }

  getSearchIndex(authContext: AuthContext, query?: string) {
    this.assertAuthenticated(authContext);
    const documents = searchIndexDocuments(this.repository.listSearchIndexDocuments(), query);
    return {
      documents,
      total_count: documents.length,
      summary: `Search index: ${documents.length} documents.`,
    };
  }

  getCategories(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      categories: listCategoryCatalog(),
      summary: "Marketplace category catalog.",
    };
  }

  getSchema(authContext: AuthContext): typeof MARKETPLACE_COMPILATION_JSON_SCHEMA {
    this.assertAuthenticated(authContext);
    return MARKETPLACE_COMPILATION_JSON_SCHEMA;
  }

  publish(
    authContext: AuthContext,
    input: { blueprint?: ActionBlueprintView; blueprint_id?: string; version?: string }
  ) {
    this.assertPlatformAdmin(authContext);
    const blueprint = this.resolveBlueprint(input);
    const registryEntry = this.requireRegistryEntry(blueprint);
    const listing = compileMarketplaceListing({ blueprint, registryEntry });
    const entry = this.repository.publishListing(listing);
    return {
      listing: toMarketplaceListingView(entry.listing),
      preview_only: true,
      summary: `Published marketplace listing ${entry.listing.id} (preview only).`,
    };
  }

  deprecate(
    authContext: AuthContext,
    input: { blueprint_id: string; version: string }
  ) {
    this.assertPlatformAdmin(authContext);
    const entry = this.repository.deprecateListing({
      blueprintId: input.blueprint_id,
      version: input.version,
    });
    return {
      listing: toMarketplaceListingView(entry.listing),
      preview_only: true,
      summary: `Deprecated marketplace listing ${entry.listing.id} (preview only).`,
    };
  }

  private resolveBlueprint(input: {
    blueprint?: ActionBlueprintView;
    blueprint_id?: string;
    version?: string;
  }): ActionBlueprint {
    if (input.blueprint) {
      return fromActionBlueprintView(input.blueprint);
    }
    if (input.blueprint_id) {
      const entry = input.version
        ? this.blueprintRepository.getPublishedVersion(input.blueprint_id, input.version)
        : this.blueprintRepository.getLatestPublished(input.blueprint_id);
      if (!entry) {
        throw new Error(`Blueprint not found: ${input.blueprint_id}`);
      }
      return entry.blueprint;
    }
    throw new Error("blueprint or blueprint_id is required");
  }

  private requireRegistryEntry(blueprint: ActionBlueprint) {
    const registryEntry = this.governanceRepository.getEntry(blueprint.blueprintId, blueprint.version);
    if (!registryEntry) {
      throw new Error(`Governance registry entry not found: ${blueprint.blueprintId}`);
    }
    return registryEntry;
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }

  private assertPlatformAdmin(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createMarketplaceCompilationService(deps?: {
  repository?: MarketplaceCompilationRepository;
  blueprintRepository?: ActionBlueprintRepository;
  governanceRepository?: BlueprintGovernanceRepository;
}): MarketplaceCompilationService {
  return new MarketplaceCompilationService(deps);
}

export function createMarketplaceCompilationModule(deps?: { rootDir?: string }) {
  const rootDir = deps?.rootDir;
  const governanceRepository = createBlueprintGovernanceRepository({ rootDir });
  const blueprintRepository = createActionBlueprintRepository({ rootDir });
  const repository = createMarketplaceCompilationRepository({ rootDir, governanceRepository });
  const marketplaceCompilation = createMarketplaceCompilationService({
    repository,
    blueprintRepository,
    governanceRepository,
  });
  return { marketplaceCompilation };
}

export type MarketplaceCompilationModule = ReturnType<typeof createMarketplaceCompilationModule>;
