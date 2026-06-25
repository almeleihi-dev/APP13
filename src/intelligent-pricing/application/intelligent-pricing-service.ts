import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../security/guards.js";
import {
  createActionBlueprintRepository,
  type ActionBlueprintRepository,
} from "../../action-blueprint/infrastructure/action-blueprint-repository.js";
import {
  createBlueprintGovernanceRepository,
  type BlueprintGovernanceRepository,
} from "../../blueprint-governance/infrastructure/blueprint-governance-repository.js";
import {
  createMarketplaceCompilationRepository,
  type MarketplaceCompilationRepository,
} from "../../marketplace-compilation/infrastructure/marketplace-compilation-repository.js";
import { compileExecutionBlueprint } from "../../execution-blueprint/domain/execution-compiler.js";
import { synthesizeTekrrProfile } from "../../tekrr-intelligence/domain/tekrr-synthesizer.js";
import { INTELLIGENT_PRICING_JSON_SCHEMA } from "../domain/pricing-schema.js";
import {
  buildIntelligentPricingCenter,
  toIntelligentPricingCenterView,
  toIntelligentPriceView,
  toPricingValidationView,
  type IntelligentPricingCenterView,
} from "../domain/intelligent-price.js";
import {
  buildPricingProfile,
  calculateIntelligentPrice,
  validatePricingInput,
} from "../domain/pricing-calculator.js";
import {
  getDefaultPricingPolicy,
  getPricingPolicyById,
  type PricingPolicy,
} from "../domain/pricing-policy.js";
import {
  createIntelligentPricingRepository,
  type IntelligentPricingRepository,
} from "../infrastructure/intelligent-pricing-repository.js";

export class IntelligentPricingService {
  private readonly repository: IntelligentPricingRepository;
  private readonly marketplaceRepository: MarketplaceCompilationRepository;
  private readonly blueprintRepository: ActionBlueprintRepository;
  private readonly governanceRepository: BlueprintGovernanceRepository;

  constructor(deps?: {
    repository?: IntelligentPricingRepository;
    marketplaceRepository?: MarketplaceCompilationRepository;
    blueprintRepository?: ActionBlueprintRepository;
    governanceRepository?: BlueprintGovernanceRepository;
  }) {
    this.governanceRepository = deps?.governanceRepository ?? createBlueprintGovernanceRepository();
    this.marketplaceRepository =
      deps?.marketplaceRepository ??
      createMarketplaceCompilationRepository({ governanceRepository: this.governanceRepository });
    this.blueprintRepository = deps?.blueprintRepository ?? createActionBlueprintRepository();
    this.repository = deps?.repository ?? createIntelligentPricingRepository();
  }

  getCenter(authContext: AuthContext): IntelligentPricingCenterView {
    this.assertAuthenticated(authContext);
    const center = buildIntelligentPricingCenter({
      profileCount: this.repository.getProfileCount(),
      policyCount: this.repository.getPublishedPolicyCount(),
    });
    return toIntelligentPricingCenterView(center);
  }

  calculate(
    authContext: AuthContext,
    input: {
      listing_id?: string;
      blueprint_id?: string;
      version?: string;
      policy_id?: string;
      region?: string;
    }
  ) {
    this.assertAuthenticated(authContext);
    const resolved = this.resolvePricingContext(input);
    const policy = input.policy_id
      ? getPricingPolicyById(this.repository.listPolicies(), input.policy_id) ?? getDefaultPricingPolicy()
      : getDefaultPricingPolicy();

    const price = calculateIntelligentPrice({
      listing: resolved.listing,
      blueprint: resolved.blueprint,
      registryEntry: resolved.registryEntry,
      tekrrProfile: resolved.tekrrProfile,
      executionBlueprint: resolved.executionBlueprint,
      policy,
      region: input.region,
    });

    const profile = buildPricingProfile({ listing: resolved.listing, price, policy });
    this.repository.saveProfile(profile);

    return {
      price: toIntelligentPriceView(price),
      preview_only: true,
      explainable: true,
      summary: price.explanation.summary,
    };
  }

  preview(
    authContext: AuthContext,
    input: {
      listing_id?: string;
      blueprint_id?: string;
      version?: string;
      policy_id?: string;
      region?: string;
    }
  ) {
    const result = this.calculate(authContext, input);
    return {
      ...result,
      summary: `Pricing preview for ${result.price.listing_id} — calculation only.`,
    };
  }

  explain(
    authContext: AuthContext,
    input: { listing_id?: string; blueprint_id?: string; version?: string; region?: string }
  ) {
    this.assertAuthenticated(authContext);
    const result = this.calculate(authContext, input);
    return {
      explanation: result.price.explanation,
      breakdown: result.price.breakdown,
      price: {
        app13_price_cents: result.price.app13_price_cents,
        estimated_market_price_cents: result.price.estimated_market_price_cents,
        customer_saving_cents: result.price.customer_saving_cents,
        saving_percentage: result.price.saving_percentage,
        pricing_confidence: result.price.pricing_confidence,
      },
      preview_only: true,
      summary: result.price.explanation.summary,
    };
  }

  getPolicies(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const policies = this.repository.listPolicies();
    return {
      policies: policies.map((policy) => ({
        policy_id: policy.policyId,
        version: policy.version,
        name: policy.name,
        status: policy.status,
        efficiency_factor_default: policy.efficiencyFactorDefault,
        published_at: policy.publishedAt,
      })),
      total_count: policies.length,
      summary: `Pricing policies: ${policies.length} entries.`,
    };
  }

  getBreakdown(authContext: AuthContext, listingId: string) {
    this.assertAuthenticated(authContext);
    const cached = this.repository.getLatestPrice(listingId);
    if (cached) {
      return {
        listing_id: listingId,
        breakdown: cached.breakdown,
        preview_only: true,
        summary: `Pricing breakdown for ${listingId}.`,
      };
    }
    const result = this.calculate(authContext, { listing_id: listingId });
    return {
      listing_id: listingId,
      breakdown: result.price.breakdown,
      preview_only: true,
      summary: `Pricing breakdown for ${listingId}.`,
    };
  }

  getVersion(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return this.repository.getPricingVersion();
  }

  validate(
    authContext: AuthContext,
    input: { listing_id?: string; blueprint_id?: string; version?: string }
  ) {
    this.assertAuthenticated(authContext);
    try {
      const resolved = this.resolvePricingContext(input);
      return toPricingValidationView(
        validatePricingInput({
          listing: resolved.listing,
          blueprint: resolved.blueprint,
          registryEntry: resolved.registryEntry,
        })
      );
    } catch (error) {
      return toPricingValidationView({
        valid: false,
        calculable: false,
        errors: [error instanceof Error ? error.message : "Validation failed"],
        warnings: [],
        summary: "Pricing validation failed.",
      });
    }
  }

  publishPolicy(authContext: AuthContext, policy: PricingPolicy) {
    this.assertPlatformAdmin(authContext);
    const published = this.repository.publishPolicy(policy);
    return {
      policy_id: published.policyId,
      status: published.status,
      published_at: published.publishedAt,
      preview_only: true,
      summary: `Published pricing policy ${published.policyId}.`,
    };
  }

  deprecatePolicy(authContext: AuthContext, input: { policy_id: string }) {
    this.assertPlatformAdmin(authContext);
    const deprecated = this.repository.deprecatePolicy(input.policy_id);
    return {
      policy_id: deprecated.policyId,
      status: deprecated.status,
      deprecated_at: deprecated.deprecatedAt,
      preview_only: true,
      summary: `Deprecated pricing policy ${deprecated.policyId}.`,
    };
  }

  getSchema(authContext: AuthContext): typeof INTELLIGENT_PRICING_JSON_SCHEMA {
    this.assertAuthenticated(authContext);
    return INTELLIGENT_PRICING_JSON_SCHEMA;
  }

  private resolvePricingContext(input: {
    listing_id?: string;
    blueprint_id?: string;
    version?: string;
  }) {
    let listingEntry;
    if (input.listing_id) {
      listingEntry = this.marketplaceRepository.getListingById(input.listing_id);
      if (!listingEntry) {
        throw new Error(`Listing not found: ${input.listing_id}`);
      }
    } else if (input.blueprint_id) {
      listingEntry = this.marketplaceRepository.getListing(input.blueprint_id, input.version);
      if (!listingEntry) {
        throw new Error(`Listing not found for blueprint: ${input.blueprint_id}`);
      }
    } else {
      throw new Error("listing_id or blueprint_id is required");
    }

    const listing = listingEntry.listing;
    const blueprintEntry = input.version
      ? this.blueprintRepository.getPublishedVersion(listing.blueprintId, listing.version)
      : this.blueprintRepository.getLatestPublished(listing.blueprintId);
    if (!blueprintEntry) {
      throw new Error(`Blueprint not found: ${listing.blueprintId}`);
    }

    const registryEntry = this.governanceRepository.getEntry(listing.blueprintId, listing.version);
    if (!registryEntry) {
      throw new Error(`Governance entry not found: ${listing.blueprintId}`);
    }

    const tekrrProfile = synthesizeTekrrProfile({ blueprint: blueprintEntry.blueprint });
    const executionBlueprint = compileExecutionBlueprint({ blueprint: blueprintEntry.blueprint });

    return {
      listing,
      blueprint: blueprintEntry.blueprint,
      registryEntry,
      tekrrProfile,
      executionBlueprint,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }

  private assertPlatformAdmin(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createIntelligentPricingService(deps?: {
  repository?: IntelligentPricingRepository;
  marketplaceRepository?: MarketplaceCompilationRepository;
  blueprintRepository?: ActionBlueprintRepository;
  governanceRepository?: BlueprintGovernanceRepository;
}): IntelligentPricingService {
  return new IntelligentPricingService(deps);
}

export function createIntelligentPricingModule(deps?: { rootDir?: string }) {
  const rootDir = deps?.rootDir;
  const governanceRepository = createBlueprintGovernanceRepository({ rootDir });
  const marketplaceRepository = createMarketplaceCompilationRepository({ rootDir, governanceRepository });
  const blueprintRepository = createActionBlueprintRepository({ rootDir });
  const repository = createIntelligentPricingRepository({ rootDir });
  const intelligentPricing = createIntelligentPricingService({
    repository,
    marketplaceRepository,
    blueprintRepository,
    governanceRepository,
  });
  return { intelligentPricing };
}

export type IntelligentPricingModule = ReturnType<typeof createIntelligentPricingModule>;
