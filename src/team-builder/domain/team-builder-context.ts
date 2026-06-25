import type { AuthContext } from "../../shared/auth/index.js";
import { buildDevelopmentContext } from "../../develop-me/domain/development-context.js";
import { getSeedExpertsForUser } from "../../expert-network/domain/expert-network-seed.js";
import type { SeedNetworkExpert } from "../../expert-network/domain/expert-network-seed.js";
import { createMarketplaceCompilationRepository } from "../../marketplace-compilation/infrastructure/marketplace-compilation-repository.js";
import type { MarketplaceListing } from "../../marketplace-compilation/domain/marketplace-listing.js";

export interface TeamBuilderContext {
  userId: string;
  tier: string;
  displayName: string;
  listing: MarketplaceListing;
  blueprintId: string;
  requiredSkills: string[];
  executionComplexity: string;
  estimatedDurationMax: number;
  candidatePool: SeedNetworkExpert[];
  requesterTrustScore: number;
  requesterSkills: string[];
  generatedAt: string;
}

function resolveDisplayName(userId: string): string {
  const suffix = userId.replace(/[^a-z0-9]/gi, "").slice(-4).toUpperCase();
  return `Team Requester ${suffix || "USER"}`;
}

function selectListing(listings: MarketplaceListing[], listingId?: string): MarketplaceListing {
  if (listingId) {
    const match = listings.find((listing) => listing.id === listingId);
    if (match) return match;
  }
  const published = listings.filter((l) => l.publishStatus === "published");
  const sorted = (published.length > 0 ? published : listings).sort((left, right) =>
    left.id.localeCompare(right.id)
  );
  if (sorted.length === 0) {
    throw new Error("No marketplace listings available for team building");
  }
  return sorted[0]!;
}

export function buildTeamBuilderContext(input: {
  authContext: AuthContext;
  listingId?: string;
  generatedAt?: string;
}): TeamBuilderContext {
  const auth = input.authContext;
  const development = buildDevelopmentContext({
    authContext: auth,
    generatedAt: input.generatedAt,
  });

  const marketplaceRepo = createMarketplaceCompilationRepository();
  const listings = marketplaceRepo.listListings().map((entry) => entry.listing);
  const listing = selectListing(listings, input.listingId);

  return {
    userId: auth.userId,
    tier: development.tier,
    displayName: resolveDisplayName(auth.userId),
    listing,
    blueprintId: listing.blueprintId,
    requiredSkills: listing.requiredSkills.length > 0 ? listing.requiredSkills : ["general_maintenance"],
    executionComplexity: listing.executionComplexity,
    estimatedDurationMax: listing.estimatedDuration.max,
    candidatePool: getSeedExpertsForUser(auth.userId),
    requesterTrustScore: development.trustScore,
    requesterSkills: development.skills,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
  };
}
