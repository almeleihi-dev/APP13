import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import { livingOnboardingRepository } from "../../onboarding/infrastructure/living-onboarding-repository.js";
import type { LivingProfessionalAchievementsContext } from "../domain/achievements-context.js";
import type { LivingProfessionalAchievementsExperience } from "../domain/achievements-experience.js";
import {
  buildDefaultAchievementHistory,
  recordAchievementOutcome,
  type AchievementHistoryProfile,
} from "../domain/achievements-sections.js";

export class LivingProfessionalAchievementsRepository {
  private readonly experiences = new Map<string, LivingProfessionalAchievementsExperience>();
  private readonly histories = new Map<string, AchievementHistoryProfile>();
  private refreshCount = 0;

  getOnboardingResponses(userId: string): OnboardingResponses {
    return { ...livingOnboardingRepository().getOrCreate(userId).responses };
  }

  getCachedExperience(userId: string, dayKey: string): LivingProfessionalAchievementsExperience | undefined {
    const cached = this.experiences.get(userId);
    if (cached && cached.generatedAt.slice(0, 10) === dayKey) {
      return cached;
    }
    return undefined;
  }

  saveExperience(userId: string, experience: LivingProfessionalAchievementsExperience): void {
    this.experiences.set(userId, experience);
  }

  listExperiences(): LivingProfessionalAchievementsExperience[] {
    return [...this.experiences.values()];
  }

  getAchievementHistory(context: LivingProfessionalAchievementsContext): AchievementHistoryProfile {
    const existing = this.histories.get(context.userId);
    if (existing) return existing;

    const history = buildDefaultAchievementHistory(context);
    this.histories.set(context.userId, history);
    return history;
  }

  recordAchievement(
    userId: string,
    recordId: string,
    achievementTitle: string,
    status: "accepted" | "ignored",
    recordedAt: string,
    outcome?: string
  ): AchievementHistoryProfile {
    const history = this.histories.get(userId);
    if (!history) {
      throw new Error("Achievement history not initialized");
    }
    const updated = recordAchievementOutcome(history, recordId, achievementTitle, status, recordedAt, outcome);
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

let defaultRepository: LivingProfessionalAchievementsRepository | undefined;

export function createLivingProfessionalAchievementsRepository(): LivingProfessionalAchievementsRepository {
  return new LivingProfessionalAchievementsRepository();
}

export function livingProfessionalAchievementsRepository(): LivingProfessionalAchievementsRepository {
  if (!defaultRepository) {
    defaultRepository = createLivingProfessionalAchievementsRepository();
  }
  return defaultRepository;
}
