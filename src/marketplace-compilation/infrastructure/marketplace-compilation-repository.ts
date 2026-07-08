import { buildSeedRegistry } from "../../action-blueprint/domain/taxonomy-bridge.js";
import {
  createBlueprintGovernanceRepository,
  type BlueprintGovernanceRepository,
} from "../../blueprint-governance/infrastructure/blueprint-governance-repository.js";
import { compileMarketplaceListing } from "../domain/marketplace-compiler.js";
import {
  collectMarketplaceCompilationPaths,
  type MarketplaceListing,
  type ListingPublishStatus,
} from "../domain/marketplace-listing.js";
import type { SearchIndexDocument } from "../domain/search-index.js";

export interface CompiledListingEntry {
  listing: MarketplaceListing;
  searchIndex: SearchIndexDocument;
  status: ListingPublishStatus;
  publishedAt?: string;
  deprecatedAt?: string;
}

function listingKey(blueprintId: string, version: string): string {
  return `${blueprintId}@${version}`;
}

export class MarketplaceCompilationRepository {
  private readonly listings = new Map<string, CompiledListingEntry>();

  constructor(
    private readonly rootDir: string = process.cwd(),
    private readonly governanceRepository: BlueprintGovernanceRepository = createBlueprintGovernanceRepository()
  ) {
    for (const blueprint of buildSeedRegistry()) {
      const registryEntry = this.governanceRepository.getEntry(blueprint.blueprintId, blueprint.version);
      if (!registryEntry) continue;
      try {
        const listing = compileMarketplaceListing({ blueprint, registryEntry });
        const key = listingKey(blueprint.blueprintId, blueprint.version);
        this.listings.set(key, {
          listing: { ...listing, publishStatus: "published" },
          searchIndex: listing.searchDocument,
          status: "published",
          publishedAt: "2026-06-20T00:00:00.000Z",
        });
      } catch {
        // Skip entries that fail governance gate during seed
      }
    }
  }

  listListings(): CompiledListingEntry[] {
    return [...this.listings.values()].sort((left, right) =>
      left.listing.blueprintId.localeCompare(right.listing.blueprintId)
    );
  }

  listSearchIndexDocuments(): SearchIndexDocument[] {
    return this.listListings().map((entry) => entry.searchIndex);
  }

  getListingCount(): number {
    return this.listings.size;
  }

  getPublishedListingCount(): number {
    return this.listListings().filter((entry) => entry.status === "published").length;
  }

  getListing(blueprintId: string, version?: string): CompiledListingEntry | undefined {
    if (version) {
      return this.listings.get(listingKey(blueprintId, version));
    }
    const matches = this.listListings().filter((entry) => entry.listing.blueprintId === blueprintId);
    return matches.find((entry) => entry.status === "published") ?? matches[0];
  }

  getListingById(listingId: string): CompiledListingEntry | undefined {
    return this.listListings().find((entry) => entry.listing.id === listingId);
  }

  saveCompiled(entry: CompiledListingEntry): CompiledListingEntry {
    const key = listingKey(entry.listing.blueprintId, entry.listing.version);
    this.listings.set(key, entry);
    return entry;
  }

  publishListing(listing: MarketplaceListing): CompiledListingEntry {
    const key = listingKey(listing.blueprintId, listing.version);
    if (this.listings.has(key) && this.listings.get(key)?.status === "published") {
      throw new Error(`Listing already published: ${listing.id}`);
    }
    const entry: CompiledListingEntry = {
      listing: { ...listing, publishStatus: "published", visibility: "public" },
      searchIndex: listing.searchDocument,
      status: "published",
      publishedAt: new Date().toISOString(),
    };
    this.listings.set(key, entry);
    return entry;
  }

  deprecateListing(input: { blueprintId: string; version: string }): CompiledListingEntry {
    const key = listingKey(input.blueprintId, input.version);
    const existing = this.listings.get(key);
    if (!existing) {
      throw new Error(`Listing not found: ${input.blueprintId}@${input.version}`);
    }
    const deprecated: CompiledListingEntry = {
      ...existing,
      listing: {
        ...existing.listing,
        publishStatus: "deprecated",
        visibility: "private",
      },
      status: "deprecated",
      deprecatedAt: new Date().toISOString(),
    };
    this.listings.set(key, deprecated);
    return deprecated;
  }

  async verifyArtifacts(): Promise<{ ok: boolean; missing: string[] }> {
    const missing: string[] = [];
    for (const artifactPath of collectMarketplaceCompilationPaths()) {
      try {
        const { access } = await import("node:fs/promises");
        const path = await import("node:path");
        await access(path.join(this.rootDir, artifactPath));
      } catch {
        missing.push(artifactPath);
      }
    }
    return { ok: missing.length === 0, missing };
  }
}

export function createMarketplaceCompilationRepository(deps?: {
  rootDir?: string;
  governanceRepository?: BlueprintGovernanceRepository;
}): MarketplaceCompilationRepository {
  return new MarketplaceCompilationRepository(deps?.rootDir, deps?.governanceRepository);
}

export const marketplaceCompilationRepository = createMarketplaceCompilationRepository();
