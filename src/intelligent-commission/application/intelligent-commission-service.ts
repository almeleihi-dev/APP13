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
import {
  createIntelligentPricingRepository,
  type IntelligentPricingRepository,
} from "../../intelligent-pricing/infrastructure/intelligent-pricing-repository.js";
import { compileExecutionBlueprint } from "../../execution-blueprint/domain/execution-compiler.js";
import { synthesizeTekrrProfile } from "../../tekrr-intelligence/domain/tekrr-synthesizer.js";
import { calculateIntelligentPrice } from "../../intelligent-pricing/domain/pricing-calculator.js";
import {
  getDefaultPricingPolicy,
  getPricingPolicyById,
} from "../../intelligent-pricing/domain/pricing-policy.js";
import {
  buildIntelligentCommissionCenter,
  toCommissionCalculationView,
  toIntelligentCommissionCenterView,
  type IntelligentCommissionCenterView,
} from "../domain/commission-calculation.js";
import {
  buildCommissionProfile,
  calculateIntelligentCommission,
} from "../domain/commission-calculator.js";
import {
  getDefaultCommissionPolicy,
  getCommissionPolicyById,
  type CommissionPolicy,
} from "../domain/commission-policy.js";
import {
  createIntelligentCommissionRepository,
  type IntelligentCommissionRepository,
} from "../infrastructure/intelligent-commission-repository.js";

export class IntelligentCommissionService {
  private readonly repository: IntelligentCommissionRepository;
  private readonly pricingRepository: IntelligentPricingRepository;
  private readonly marketplaceRepository: MarketplaceCompilationRepository;
  private readonly blueprintRepository: ActionBlueprintRepository;
  private readonly governanceRepository: BlueprintGovernanceRepository;

  constructor(deps?: {
    repository?: IntelligentCommissionRepository;
    pricingRepository?: IntelligentPricingRepository;
    marketplaceRepository?: MarketplaceCompilationRepository;
    blueprintRepository?: ActionBlueprintRepository;
    governanceRepository?: BlueprintGovernanceRepository;
  }) {
    this.governanceRepository = deps?.governanceRepository ?? createBlueprintGovernanceRepository();
    this.marketplaceRepository =
      deps?.marketplaceRepository ??
      createMarketplaceCompilationRepository({ governanceRepository: this.governanceRepository });
    this.blueprintRepository = deps?.blueprintRepository ?? createActionBlueprintRepository();
    this.pricingRepository = deps?.pricingRepository ?? createIntelligentPricingRepository();
    this.repository = deps?.repository ?? createIntelligentCommissionRepository();
  }

  getCenter(authContext: AuthContext): IntelligentCommissionCenterView {
    this.assertAuthenticated(authContext);
    const center = buildIntelligentCommissionCenter({
      profileCount: this.repository.getProfileCount(),
      policyCount: this.repository.getPublishedPolicyCount(),
    });
    return toIntelligentCommissionCenterView(center);
  }

  calculate(
    authContext: AuthContext,
    input: {
      listing_id?: string;
      blueprint_id?: string;
      version?: string;
      policy_id?: string;
      pricing_policy_id?: string;
    }
  ) {
    this.assertAuthenticated(authContext);
    const resolved = this.resolveCommissionContext(input);
    const policy = input.policy_id
      ? getCommissionPolicyById(this.repository.listPolicies(), input.policy_id) ??
        getDefaultCommissionPolicy()
      : getDefaultCommissionPolicy();

    const calculation = calculateIntelligentCommission({
      listing: resolved.listing,
      intelligentPrice: resolved.intelligentPrice,
      policy,
    });

    const profile = buildCommissionProfile({ listing: resolved.listing, calculation });
    this.repository.saveProfile(profile);

    return {
      calculation: toCommissionCalculationView(calculation),
      preview_only: true,
      explainable: true,
      summary: calculation.explanation.summary,
    };
  }

  preview(
    authContext: AuthContext,
    input: {
      listing_id?: string;
      blueprint_id?: string;
      version?: string;
      policy_id?: string;
      pricing_policy_id?: string;
    }
  ) {
    const result = this.calculate(authContext, input);
    return {
      ...result,
      summary: `Commission preview for ${result.calculation.commission_id} — calculation only.`,
    };
  }

  explain(
    authContext: AuthContext,
    input: {
      listing_id?: string;
      blueprint_id?: string;
      version?: string;
      policy_id?: string;
      pricing_policy_id?: string;
    }
  ) {
    this.assertAuthenticated(authContext);
    const result = this.calculate(authContext, input);
    return {
      explanation: result.calculation.explanation,
      breakdown: result.calculation.breakdown,
      amounts: {
        intelligent_price_cents: result.calculation.intelligent_price_cents,
        commission_amount_cents: result.calculation.commission_amount_cents,
        commission_percentage: result.calculation.commission_percentage,
        provider_receives_cents: result.calculation.provider_receives_cents,
        customer_total_cents: result.calculation.customer_total_cents,
        platform_revenue_cents: result.calculation.platform_revenue_cents,
      },
      preview_only: true,
      summary: result.calculation.explanation.summary,
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
        base_commission_bps: policy.baseCommissionBps,
        published_at: policy.publishedAt,
      })),
      total_count: policies.length,
      summary: `Commission policies: ${policies.length} entries.`,
    };
  }

  getBreakdown(authContext: AuthContext, listingId: string) {
    this.assertAuthenticated(authContext);
    const cached = this.repository.getLatestCalculation(listingId);
    if (cached) {
      return {
        listing_id: listingId,
        breakdown: cached.breakdown,
        preview_only: true,
        summary: `Commission breakdown for ${listingId}.`,
      };
    }
    const result = this.calculate(authContext, { listing_id: listingId });
    return {
      listing_id: listingId,
      breakdown: result.calculation.breakdown,
      preview_only: true,
      summary: `Commission breakdown for ${listingId}.`,
    };
  }

  getVersion(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return this.repository.getCommissionVersion();
  }

  publishPolicy(authContext: AuthContext, policy: CommissionPolicy) {
    this.assertPlatformAdmin(authContext);
    const published = this.repository.publishPolicy(policy);
    return {
      policy_id: published.policyId,
      status: published.status,
      published_at: published.publishedAt,
      preview_only: true,
      summary: `Published commission policy ${published.policyId}.`,
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
      summary: `Deprecated commission policy ${deprecated.policyId}.`,
    };
  }

  private resolveCommissionContext(input: {
    listing_id?: string;
    blueprint_id?: string;
    version?: string;
    pricing_policy_id?: string;
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

    const pricingPolicy = input.pricing_policy_id
      ? getPricingPolicyById(this.pricingRepository.listPolicies(), input.pricing_policy_id) ??
        getDefaultPricingPolicy()
      : getDefaultPricingPolicy();

    let intelligentPrice = this.pricingRepository.getLatestPrice(listing.id);
    if (!intelligentPrice) {
      intelligentPrice = calculateIntelligentPrice({
        listing,
        blueprint: blueprintEntry.blueprint,
        registryEntry,
        tekrrProfile: synthesizeTekrrProfile({ blueprint: blueprintEntry.blueprint }),
        executionBlueprint: compileExecutionBlueprint({ blueprint: blueprintEntry.blueprint }),
        policy: pricingPolicy,
      });
    }

    return { listing, intelligentPrice };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }

  private assertPlatformAdmin(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createIntelligentCommissionService(deps?: {
  repository?: IntelligentCommissionRepository;
  pricingRepository?: IntelligentPricingRepository;
  marketplaceRepository?: MarketplaceCompilationRepository;
  blueprintRepository?: ActionBlueprintRepository;
  governanceRepository?: BlueprintGovernanceRepository;
}): IntelligentCommissionService {
  return new IntelligentCommissionService(deps);
}

export function createIntelligentCommissionModule(deps?: { rootDir?: string }) {
  const rootDir = deps?.rootDir;
  const governanceRepository = createBlueprintGovernanceRepository({ rootDir });
  const marketplaceRepository = createMarketplaceCompilationRepository({ rootDir, governanceRepository });
  const blueprintRepository = createActionBlueprintRepository({ rootDir });
  const pricingRepository = createIntelligentPricingRepository({ rootDir });
  const repository = createIntelligentCommissionRepository({ rootDir });
  const intelligentCommission = createIntelligentCommissionService({
    repository,
    pricingRepository,
    marketplaceRepository,
    blueprintRepository,
    governanceRepository,
  });
  return { intelligentCommission };
}

export type IntelligentCommissionModule = ReturnType<typeof createIntelligentCommissionModule>;
