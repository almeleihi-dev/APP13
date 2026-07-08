import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import { livingOnboardingRepository } from "../../onboarding/infrastructure/living-onboarding-repository.js";
import type { LivingLiveFrameExperience } from "../domain/live-frame-experience.js";

export class LivingLiveFrameRepository {
  private readonly experiences = new Map<string, LivingLiveFrameExperience>();
  private refreshCount = 0;

  getOnboardingResponses(userId: string): OnboardingResponses {
    const state = livingOnboardingRepository().getOrCreate(userId);
    return { ...state.responses };
  }

  getCachedExperience(userId: string, dayKey: string): LivingLiveFrameExperience | undefined {
    const cached = this.experiences.get(userId);
    if (cached && cached.generatedAt.slice(0, 10) === dayKey) {
      return cached;
    }
    return undefined;
  }

  saveExperience(userId: string, experience: LivingLiveFrameExperience): void {
    this.experiences.set(userId, experience);
  }

  listExperiences(): LivingLiveFrameExperience[] {
    return [...this.experiences.values()];
  }

  incrementRefreshCount(): void {
    this.refreshCount += 1;
  }

  getRefreshCount(): number {
    return this.refreshCount;
  }
}

let defaultRepository: LivingLiveFrameRepository | undefined;

export function createLivingLiveFrameRepository(): LivingLiveFrameRepository {
  return new LivingLiveFrameRepository();
}

export function livingLiveFrameRepository(): LivingLiveFrameRepository {
  if (!defaultRepository) {
    defaultRepository = createLivingLiveFrameRepository();
  }
  return defaultRepository;
}
