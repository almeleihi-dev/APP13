import type { TrustBehaviorMetrics } from "../trust/intelligence/types.js";
import type { TrustExperienceSource } from "../ui/trust/types.js";
import { assembleTrustExperienceSource } from "./assemblers/trust-assembler.js";
import type { ExperienceDependencies } from "./experience-dependencies.js";

export class TrustExperienceService {
  constructor(private readonly deps: ExperienceDependencies) {}

  async getTrustCenter(providerId: string): Promise<TrustExperienceSource> {
    return this.loadTrustSource(providerId);
  }

  async getProviderReport(providerId: string): Promise<TrustExperienceSource> {
    return this.loadTrustSource(providerId);
  }

  async getTimeline(providerId: string): Promise<TrustExperienceSource> {
    return this.loadTrustSource(providerId);
  }

  private async loadTrustSource(providerId: string): Promise<TrustExperienceSource> {
    const provider = await this.deps.profile.getProvider(providerId);
    const providerProfile = this.deps.providerIntelligence.profile({
      provider_id: providerId,
      profession: provider.primary_trade ?? undefined,
    });

    const metrics: TrustBehaviorMetrics = {
      completed_contracts: 0,
      completion_rate: 0.9,
      average_rating: 4.5,
      refund_rate: 0.01,
      issue_rate: 0.02,
      evidence_quality_score: 0.8,
      identity_verification_level: providerProfile.identity_profile.verification_level,
    };

    const trustResult = this.deps.trustIntelligence.calculate({
      provider_id: providerId,
      metrics,
    });

    return assembleTrustExperienceSource({
      providerId,
      providerDisplayName: provider.display_name,
      providerProfile,
      trustResult,
    });
  }
}
