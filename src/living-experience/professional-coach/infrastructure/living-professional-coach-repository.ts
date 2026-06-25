import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import { livingOnboardingRepository } from "../../onboarding/infrastructure/living-onboarding-repository.js";
import type { LivingProfessionalCoachContext } from "../domain/coach-context.js";
import type { LivingProfessionalCoachExperience } from "../domain/coach-experience.js";
import {
  buildDefaultCoachMemory,
  recordSuccessfulRecommendation,
  type CoachMemoryProfile,
} from "../domain/coach-sections.js";

export class LivingProfessionalCoachRepository {
  private readonly experiences = new Map<string, LivingProfessionalCoachExperience>();
  private readonly memories = new Map<string, CoachMemoryProfile>();
  private refreshCount = 0;

  getOnboardingResponses(userId: string): OnboardingResponses {
    return { ...livingOnboardingRepository().getOrCreate(userId).responses };
  }

  getCachedExperience(userId: string, dayKey: string): LivingProfessionalCoachExperience | undefined {
    const cached = this.experiences.get(userId);
    if (cached && cached.generatedAt.slice(0, 10) === dayKey) {
      return cached;
    }
    return undefined;
  }

  saveExperience(userId: string, experience: LivingProfessionalCoachExperience): void {
    this.experiences.set(userId, experience);
  }

  listExperiences(): LivingProfessionalCoachExperience[] {
    return [...this.experiences.values()];
  }

  getCoachMemory(context: LivingProfessionalCoachContext): CoachMemoryProfile {
    const existing = this.memories.get(context.userId);
    if (existing) return existing;

    const memory = buildDefaultCoachMemory(context);
    this.memories.set(context.userId, memory);
    return memory;
  }

  updateCoachMemory(userId: string, memory: CoachMemoryProfile): void {
    this.memories.set(userId, memory);
  }

  recordRecommendationAccepted(
    userId: string,
    recommendation: string,
    acceptedAt: string,
    outcome: string
  ): CoachMemoryProfile {
    const memory = this.memories.get(userId);
    if (!memory) {
      throw new Error("Coach memory not initialized");
    }
    const updated = recordSuccessfulRecommendation(memory, recommendation, acceptedAt, outcome);
    this.memories.set(userId, updated);
    return updated;
  }

  incrementRefreshCount(): void {
    this.refreshCount += 1;
  }

  getRefreshCount(): number {
    return this.refreshCount;
  }

  getMemoryProfileCount(): number {
    return this.memories.size;
  }
}

let defaultRepository: LivingProfessionalCoachRepository | undefined;

export function createLivingProfessionalCoachRepository(): LivingProfessionalCoachRepository {
  return new LivingProfessionalCoachRepository();
}

export function livingProfessionalCoachRepository(): LivingProfessionalCoachRepository {
  if (!defaultRepository) {
    defaultRepository = createLivingProfessionalCoachRepository();
  }
  return defaultRepository;
}
