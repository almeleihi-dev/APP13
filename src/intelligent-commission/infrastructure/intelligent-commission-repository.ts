import { buildSeedRegistry } from "../../action-blueprint/domain/taxonomy-bridge.js";
import { createBlueprintGovernanceRepository } from "../../blueprint-governance/infrastructure/blueprint-governance-repository.js";
import { compileExecutionBlueprint } from "../../execution-blueprint/domain/execution-compiler.js";
import { compileMarketplaceListing } from "../../marketplace-compilation/domain/marketplace-compiler.js";
import { calculateIntelligentPrice } from "../../intelligent-pricing/domain/pricing-calculator.js";
import { getDefaultPricingPolicy } from "../../intelligent-pricing/domain/pricing-policy.js";
import { synthesizeTekrrProfile } from "../../tekrr-intelligence/domain/tekrr-synthesizer.js";
import {
  calculateIntelligentCommission,
  buildCommissionProfile,
} from "../domain/commission-calculator.js";
import {
  collectIntelligentCommissionPaths,
  type CommissionCalculation,
  type CommissionProfile,
} from "../domain/commission-calculation.js";
import {
  SEED_COMMISSION_POLICIES,
  getDefaultCommissionPolicy,
  listCommissionPolicies,
  type CommissionPolicy,
} from "../domain/commission-policy.js";

export class IntelligentCommissionRepository {
  private readonly profiles = new Map<string, CommissionProfile>();
  private readonly policies = new Map<string, CommissionPolicy>();

  constructor(private readonly rootDir: string = process.cwd()) {
    for (const policy of SEED_COMMISSION_POLICIES) {
      this.policies.set(policy.policyId, policy);
    }

    const governance = createBlueprintGovernanceRepository();
    const pricingPolicy = getDefaultPricingPolicy();
    const commissionPolicy = getDefaultCommissionPolicy();

    for (const blueprint of buildSeedRegistry()) {
      const registryEntry = governance.getEntry(blueprint.blueprintId, blueprint.version);
      if (!registryEntry) continue;
      try {
        const listing = compileMarketplaceListing({ blueprint, registryEntry });
        const tekrrProfile = synthesizeTekrrProfile({ blueprint });
        const executionBlueprint = compileExecutionBlueprint({ blueprint });
        const intelligentPrice = calculateIntelligentPrice({
          listing,
          blueprint,
          registryEntry,
          tekrrProfile,
          executionBlueprint,
          policy: pricingPolicy,
          calculatedAt: "2026-06-20T00:00:00.000Z",
        });
        const calculation = calculateIntelligentCommission({
          listing,
          intelligentPrice,
          policy: commissionPolicy,
          calculatedAt: "2026-06-20T00:00:00.000Z",
        });
        const profile = buildCommissionProfile({ listing, calculation });
        this.profiles.set(listing.id, profile);
      } catch {
        // Skip entries that fail commission prerequisites
      }
    }
  }

  listProfiles(): CommissionProfile[] {
    return [...this.profiles.values()].sort((left, right) =>
      left.listingId.localeCompare(right.listingId)
    );
  }

  getProfileCount(): number {
    return this.profiles.size;
  }

  getProfileByListingId(listingId: string): CommissionProfile | undefined {
    return this.profiles.get(listingId);
  }

  getLatestCalculation(listingId: string): CommissionCalculation | undefined {
    return this.profiles.get(listingId)?.latestCalculation;
  }

  saveProfile(profile: CommissionProfile): CommissionProfile {
    this.profiles.set(profile.listingId, profile);
    return profile;
  }

  listPolicies(): CommissionPolicy[] {
    return listCommissionPolicies([...this.policies.values()]);
  }

  getPolicyCount(): number {
    return this.policies.size;
  }

  getPublishedPolicyCount(): number {
    return this.listPolicies().filter((policy) => policy.status === "published").length;
  }

  publishPolicy(policy: CommissionPolicy): CommissionPolicy {
    if (this.policies.has(policy.policyId) && this.policies.get(policy.policyId)?.status === "published") {
      throw new Error(`Commission policy already published: ${policy.policyId}`);
    }
    const published: CommissionPolicy = {
      ...policy,
      status: "published",
      publishedAt: new Date().toISOString(),
    };
    this.policies.set(policy.policyId, published);
    return published;
  }

  deprecatePolicy(policyId: string): CommissionPolicy {
    const existing = this.policies.get(policyId);
    if (!existing) {
      throw new Error(`Commission policy not found: ${policyId}`);
    }
    const deprecated: CommissionPolicy = {
      ...existing,
      status: "deprecated",
      deprecatedAt: new Date().toISOString(),
    };
    this.policies.set(policyId, deprecated);
    return deprecated;
  }

  getCommissionVersion() {
    const defaultPolicy = getDefaultCommissionPolicy();
    return {
      commission_version: "1.0.0",
      schema_version: "intelligent-commission-v1",
      default_policy_id: defaultPolicy.policyId,
      policy_version: defaultPolicy.version,
      summary: "APP13 intelligent commission engine version metadata.",
    };
  }

  async verifyArtifacts(): Promise<{ ok: boolean; missing: string[] }> {
    const missing: string[] = [];
    for (const artifactPath of collectIntelligentCommissionPaths()) {
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

export function createIntelligentCommissionRepository(deps?: {
  rootDir?: string;
}): IntelligentCommissionRepository {
  return new IntelligentCommissionRepository(deps?.rootDir);
}

export const intelligentCommissionRepository = createIntelligentCommissionRepository();
