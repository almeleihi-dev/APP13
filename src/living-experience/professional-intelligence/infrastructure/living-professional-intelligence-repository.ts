import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import { livingOnboardingRepository } from "../../onboarding/infrastructure/living-onboarding-repository.js";
import type { LivingProfessionalIntelligenceContext } from "../domain/intelligence-context.js";
import type { LivingProfessionalIntelligenceExperience } from "../domain/intelligence-experience.js";
import {
  buildDefaultIntelligenceHistory,
  recordIntelligenceRecommendation,
  type IntelligenceHistoryProfile,
} from "../domain/intelligence-sections.js";

export class LivingProfessionalIntelligenceRepository {
  private readonly experiences = new Map<string, LivingProfessionalIntelligenceExperience>();
  private readonly histories = new Map<string, IntelligenceHistoryProfile>();
  private refreshCount = 0;

  getOnboardingResponses(userId: string): OnboardingResponses {
    return { ...livingOnboardingRepository().getOrCreate(userId).responses };
  }

  getCachedExperience(userId: string, dayKey: string): LivingProfessionalIntelligenceExperience | undefined {
    const cached = this.experiences.get(userId);
    if (cached && cached.generatedAt.slice(0, 10) === dayKey) {
      return cached;
    }
    return undefined;
  }

  saveExperience(userId: string, experience: LivingProfessionalIntelligenceExperience): void {
    this.experiences.set(userId, experience);
  }

  listExperiences(): LivingProfessionalIntelligenceExperience[] {
    return [...this.experiences.values()];
  }

  getIntelligenceHistory(context: LivingProfessionalIntelligenceContext): IntelligenceHistoryProfile {
    const existing = this.histories.get(context.userId);
    if (existing) return existing;

    const history = buildDefaultIntelligenceHistory(context);
    this.histories.set(context.userId, history);
    return history;
  }

  recordRecommendation(
    userId: string,
    recordId: string,
    recommendation: string,
    status: "accepted" | "ignored",
    recordedAt: string,
    outcome?: string
  ): IntelligenceHistoryProfile {
    const history = this.histories.get(userId);
    if (!history) {
      throw new Error("Intelligence history not initialized");
    }
    const updated = recordIntelligenceRecommendation(history, recordId, recommendation, status, recordedAt, outcome);
    this.histories.set(userId, updated);
    return updated;
  }

  incrementRefreshCount(): void {
    this.refreshCount += 1;
  }

  getRefreshCount(): number {
    return this.refreshCount;
  }

  getHistoryProfileCount(): number {
    return this.histories.size;
  }
}

let defaultRepository: LivingProfessionalIntelligenceRepository | undefined;

export function createLivingProfessionalIntelligenceRepository(): LivingProfessionalIntelligenceRepository {
  return new LivingProfessionalIntelligenceRepository();
}

export function livingProfessionalIntelligenceRepository(): LivingProfessionalIntelligenceRepository {
  if (!defaultRepository) {
    defaultRepository = createLivingProfessionalIntelligenceRepository();
  }
  return defaultRepository;
}
