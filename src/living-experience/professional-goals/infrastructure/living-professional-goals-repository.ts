import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import { livingOnboardingRepository } from "../../onboarding/infrastructure/living-onboarding-repository.js";
import type { LivingProfessionalGoalsContext } from "../domain/goals-context.js";
import type { LivingProfessionalGoalsExperience } from "../domain/goals-experience.js";
import {
  buildDefaultGoalsHistory,
  recordGoalOutcome,
  type GoalsHistoryProfile,
} from "../domain/goals-sections.js";

export class LivingProfessionalGoalsRepository {
  private readonly experiences = new Map<string, LivingProfessionalGoalsExperience>();
  private readonly histories = new Map<string, GoalsHistoryProfile>();
  private refreshCount = 0;

  getOnboardingResponses(userId: string): OnboardingResponses {
    return { ...livingOnboardingRepository().getOrCreate(userId).responses };
  }

  getCachedExperience(userId: string, dayKey: string): LivingProfessionalGoalsExperience | undefined {
    const cached = this.experiences.get(userId);
    if (cached && cached.generatedAt.slice(0, 10) === dayKey) {
      return cached;
    }
    return undefined;
  }

  saveExperience(userId: string, experience: LivingProfessionalGoalsExperience): void {
    this.experiences.set(userId, experience);
  }

  listExperiences(): LivingProfessionalGoalsExperience[] {
    return [...this.experiences.values()];
  }

  getGoalsHistory(context: LivingProfessionalGoalsContext): GoalsHistoryProfile {
    const existing = this.histories.get(context.userId);
    if (existing) return existing;

    const history = buildDefaultGoalsHistory(context);
    this.histories.set(context.userId, history);
    return history;
  }

  recordGoal(
    userId: string,
    recordId: string,
    goalTitle: string,
    status: "accepted" | "ignored",
    recordedAt: string,
    outcome?: string
  ): GoalsHistoryProfile {
    const history = this.histories.get(userId);
    if (!history) {
      throw new Error("Goals history not initialized");
    }
    const updated = recordGoalOutcome(history, recordId, goalTitle, status, recordedAt, outcome);
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

let defaultRepository: LivingProfessionalGoalsRepository | undefined;

export function createLivingProfessionalGoalsRepository(): LivingProfessionalGoalsRepository {
  return new LivingProfessionalGoalsRepository();
}

export function livingProfessionalGoalsRepository(): LivingProfessionalGoalsRepository {
  if (!defaultRepository) {
    defaultRepository = createLivingProfessionalGoalsRepository();
  }
  return defaultRepository;
}
