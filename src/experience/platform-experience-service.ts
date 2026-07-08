import type { PlatformExperienceSource } from "../ui/platform/types.js";
import { assemblePlatformExperienceSource } from "./assemblers/platform-assembler.js";
import type { ExperienceDependencies } from "./experience-dependencies.js";

const DEFAULT_PLATFORM_ID = "000e8400-e29b-41d4-a716-446655440001";

export class PlatformExperienceService {
  constructor(private readonly deps: ExperienceDependencies) {}

  async getHome(userId: string, platformId?: string): Promise<PlatformExperienceSource> {
    return this.loadPlatformSource(userId, platformId);
  }

  async getOverview(userId: string, platformId?: string): Promise<PlatformExperienceSource> {
    return this.loadPlatformSource(userId, platformId);
  }

  private async loadPlatformSource(
    userId: string,
    platformId?: string
  ): Promise<PlatformExperienceSource> {
    const contracts = await this.deps.contracts.listContracts(userId);
    const activeContracts = contracts.data.filter((contract) =>
      ["active", "issue_raised", "awaiting_acceptance"].includes(contract.status)
    ).length;

    let escrowCount = 0;
    for (const contract of contracts.data) {
      const escrow = await this.deps.escrow.getByContractId(contract.id);
      if (escrow) escrowCount += 1;
    }

    const me = await this.deps.profile.getMe(userId);

    return assemblePlatformExperienceSource({
      platformId: platformId?.trim() || DEFAULT_PLATFORM_ID,
      contractCount: contracts.data.length,
      activeContracts,
      escrowCount,
      openDisputes: contracts.data.filter((contract) => contract.status === "issue_raised").length,
      providerCount: me.provider_id ? 1 : 0,
      evidenceCount: 0,
      featuredProviderId: me.provider_id ?? undefined,
    });
  }
}
