import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import { livingOnboardingRepository } from "../../onboarding/infrastructure/living-onboarding-repository.js";
import type { LivingProfessionalCareerEngineContext } from "../domain/career-engine-context.js";
import type { LivingProfessionalCareerEngineExperience } from "../domain/career-engine-experience.js";
import {
  buildDefaultCareerEngineHistory,
  recordCareerEngineOutcome,
  type CareerEngineHistoryProfile,
} from "../domain/career-engine-sections.js";

export class LivingProfessionalCareerEngineRepository {
  private readonly experiences = new Map<string, LivingProfessionalCareerEngineExperience>();
  private readonly histories = new Map<string, CareerEngineHistoryProfile>();
  private refreshCount = 0;

  getOnboardingResponses(userId: string): OnboardingResponses {
    return { ...livingOnboardingRepository().getOrCreate(userId).responses };
  }

  getCachedExperience(userId: string, dayKey: string): LivingProfessionalCareerEngineExperience | undefined {
    const cached = this.experiences.get(userId);
    if (cached && cached.generatedAt.slice(0, 10) === dayKey) {
      return cached;
    }
    return undefined;
  }

  saveExperience(userId: string, experience: LivingProfessionalCareerEngineExperience): void {
    this.experiences.set(userId, experience);
  }

  listExperiences(): LivingProfessionalCareerEngineExperience[] {
    return [...this.experiences.values()];
  }

  getCareerEngineHistory(context: LivingProfessionalCareerEngineContext): CareerEngineHistoryProfile {
    const existing = this.histories.get(context.userId);
    if (existing) return existing;

    const history = buildDefaultCareerEngineHistory(context);
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
  ): CareerEngineHistoryProfile {
    const history = this.histories.get(userId);
    if (!history) {
      throw new Error("Career engine history not initialized");
    }
    const updated = recordCareerEngineOutcome(history, recordId, insightTitle, status, recordedAt, outcome);
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

let defaultRepository: LivingProfessionalCareerEngineRepository | undefined;

export function createLivingProfessionalCareerEngineRepository(): LivingProfessionalCareerEngineRepository {
  return new LivingProfessionalCareerEngineRepository();
}

export function livingProfessionalCareerEngineRepository(): LivingProfessionalCareerEngineRepository {
  if (!defaultRepository) {
    defaultRepository = createLivingProfessionalCareerEngineRepository();
  }
  return defaultRepository;
}
