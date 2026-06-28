import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import { livingOnboardingRepository } from "../../onboarding/infrastructure/living-onboarding-repository.js";
import type { LivingProfessionalAnalyticsContext } from "../domain/analytics-context.js";
import type { LivingProfessionalAnalyticsExperience } from "../domain/analytics-experience.js";
import {
  buildDefaultAnalyticsHistory,
  recordAnalyticsOutcome,
  type AnalyticsHistoryProfile,
} from "../domain/analytics-sections.js";

export class LivingProfessionalAnalyticsRepository {
  private readonly experiences = new Map<string, LivingProfessionalAnalyticsExperience>();
  private readonly histories = new Map<string, AnalyticsHistoryProfile>();
  private refreshCount = 0;

  getOnboardingResponses(userId: string): OnboardingResponses {
    return { ...livingOnboardingRepository().getOrCreate(userId).responses };
  }

  getCachedExperience(userId: string, dayKey: string): LivingProfessionalAnalyticsExperience | undefined {
    const cached = this.experiences.get(userId);
    if (cached && cached.generatedAt.slice(0, 10) === dayKey) {
      return cached;
    }
    return undefined;
  }

  saveExperience(userId: string, experience: LivingProfessionalAnalyticsExperience): void {
    this.experiences.set(userId, experience);
  }

  listExperiences(): LivingProfessionalAnalyticsExperience[] {
    return [...this.experiences.values()];
  }

  getAnalyticsHistory(context: LivingProfessionalAnalyticsContext): AnalyticsHistoryProfile {
    const existing = this.histories.get(context.userId);
    if (existing) return existing;

    const history = buildDefaultAnalyticsHistory(context);
    this.histories.set(context.userId, history);
    return history;
  }

  recordInsight(
    userId: string,
    recordId: string,
    insightTitle: string,
    status: "accepted" | "ignored",
    recordedAt: string,
    outcome?: string
  ): AnalyticsHistoryProfile {
    const history = this.histories.get(userId);
    if (!history) {
      throw new Error("Analytics history not initialized");
    }
    const updated = recordAnalyticsOutcome(history, recordId, insightTitle, status, recordedAt, outcome);
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

let defaultRepository: LivingProfessionalAnalyticsRepository | undefined;

export function createLivingProfessionalAnalyticsRepository(): LivingProfessionalAnalyticsRepository {
  return new LivingProfessionalAnalyticsRepository();
}

export function livingProfessionalAnalyticsRepository(): LivingProfessionalAnalyticsRepository {
  if (!defaultRepository) {
    defaultRepository = createLivingProfessionalAnalyticsRepository();
  }
  return defaultRepository;
}
