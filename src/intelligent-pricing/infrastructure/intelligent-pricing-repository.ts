import { buildSeedRegistry } from "../../action-blueprint/domain/taxonomy-bridge.js";
import { compileExecutionBlueprint } from "../../execution-blueprint/domain/execution-compiler.js";
import { createBlueprintGovernanceRepository } from "../../blueprint-governance/infrastructure/blueprint-governance-repository.js";
import { compileMarketplaceListing } from "../../marketplace-compilation/domain/marketplace-compiler.js";
import { synthesizeTekrrProfile } from "../../tekrr-intelligence/domain/tekrr-synthesizer.js";
import {
  calculateIntelligentPrice,
  buildPricingProfile,
} from "../domain/pricing-calculator.js";
import {
  collectIntelligentPricingPaths,
  type IntelligentPrice,
  type PricingProfile,
} from "../domain/intelligent-price.js";
import {
  SEED_PRICING_POLICIES,
  getDefaultPricingPolicy,
  listPricingPolicies,
  type PricingPolicy,
} from "../domain/pricing-policy.js";

export class IntelligentPricingRepository {
  private readonly profiles = new Map<string, PricingProfile>();
  private readonly policies = new Map<string, PricingPolicy>();

  constructor(private readonly rootDir: string = process.cwd()) {
    for (const policy of SEED_PRICING_POLICIES) {
      this.policies.set(policy.policyId, policy);
    }

    const governance = createBlueprintGovernanceRepository();
    const defaultPolicy = getDefaultPricingPolicy();

    for (const blueprint of buildSeedRegistry()) {
      const registryEntry = governance.getEntry(blueprint.blueprintId, blueprint.version);
      if (!registryEntry) continue;
      try {
        const listing = compileMarketplaceListing({ blueprint, registryEntry });
        const tekrrProfile = synthesizeTekrrProfile({ blueprint });
        const executionBlueprint = compileExecutionBlueprint({ blueprint });
        const price = calculateIntelligentPrice({
          listing,
          blueprint,
          registryEntry,
          tekrrProfile,
          executionBlueprint,
          policy: defaultPolicy,
          calculatedAt: "2026-06-20T00:00:00.000Z",
        });
        const profile = buildPricingProfile({ listing, price, policy: defaultPolicy });
        this.profiles.set(listing.id, profile);
      } catch {
        // Skip listings that fail pricing prerequisites
      }
    }
  }

  listProfiles(): PricingProfile[] {
    return [...this.profiles.values()].sort((left, right) =>
      left.listingId.localeCompare(right.listingId)
    );
  }

  getProfileCount(): number {
    return this.profiles.size;
  }

  getProfileByListingId(listingId: string): PricingProfile | undefined {
    return this.profiles.get(listingId);
  }

  getLatestPrice(listingId: string): IntelligentPrice | undefined {
    return this.profiles.get(listingId)?.latestPrice;
  }

  saveProfile(profile: PricingProfile): PricingProfile {
    this.profiles.set(profile.listingId, profile);
    return profile;
  }

  listPolicies(): PricingPolicy[] {
    return listPricingPolicies([...this.policies.values()]);
  }

  getPolicyCount(): number {
    return this.policies.size;
  }

  getPublishedPolicyCount(): number {
    return this.listPolicies().filter((policy) => policy.status === "published").length;
  }

  getPolicy(policyId: string): PricingPolicy | undefined {
    return this.policies.get(policyId);
  }

  publishPolicy(policy: PricingPolicy): PricingPolicy {
    if (this.policies.has(policy.policyId) && this.policies.get(policy.policyId)?.status === "published") {
      throw new Error(`Pricing policy already published: ${policy.policyId}`);
    }
    const published: PricingPolicy = {
      ...policy,
      status: "published",
      publishedAt: new Date().toISOString(),
    };
    this.policies.set(policy.policyId, published);
    return published;
  }

  deprecatePolicy(policyId: string): PricingPolicy {
    const existing = this.policies.get(policyId);
    if (!existing) {
      throw new Error(`Pricing policy not found: ${policyId}`);
    }
    const deprecated: PricingPolicy = {
      ...existing,
      status: "deprecated",
      deprecatedAt: new Date().toISOString(),
    };
    this.policies.set(policyId, deprecated);
    return deprecated;
  }

  getPricingVersion() {
    const defaultPolicy = getDefaultPricingPolicy();
    return {
      pricing_version: "1.0.0",
      schema_version: "intelligent-pricing-v1",
      default_policy_id: defaultPolicy.policyId,
      policy_version: defaultPolicy.version,
      summary: "APP13 intelligent pricing engine version metadata.",
    };
  }

  async verifyArtifacts(): Promise<{ ok: boolean; missing: string[] }> {
    const missing: string[] = [];
    for (const artifactPath of collectIntelligentPricingPaths()) {
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

export function createIntelligentPricingRepository(deps?: {
  rootDir?: string;
}): IntelligentPricingRepository {
  return new IntelligentPricingRepository(deps?.rootDir);
}

export const intelligentPricingRepository = createIntelligentPricingRepository();
