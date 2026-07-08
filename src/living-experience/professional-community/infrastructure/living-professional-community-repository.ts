import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import { livingOnboardingRepository } from "../../onboarding/infrastructure/living-onboarding-repository.js";
import type { LivingProfessionalCommunityExperience } from "../domain/community-experience.js";

export class LivingProfessionalCommunityRepository {
  private readonly experiences = new Map<string, LivingProfessionalCommunityExperience>();
  private refreshCount = 0;

  getOnboardingResponses(userId: string): OnboardingResponses {
    return { ...livingOnboardingRepository().getOrCreate(userId).responses };
  }

  getCachedExperience(userId: string, dayKey: string): LivingProfessionalCommunityExperience | undefined {
    const cached = this.experiences.get(userId);
    if (cached && cached.generatedAt.slice(0, 10) === dayKey) {
      return cached;
    }
    return undefined;
  }

  saveExperience(userId: string, experience: LivingProfessionalCommunityExperience): void {
    this.experiences.set(userId, experience);
  }

  listExperiences(): LivingProfessionalCommunityExperience[] {
    return [...this.experiences.values()];
  }

  incrementRefreshCount(): void {
    this.refreshCount += 1;
  }

  getRefreshCount(): number {
    return this.refreshCount;
  }
}

let defaultRepository: LivingProfessionalCommunityRepository | undefined;

export function createLivingProfessionalCommunityRepository(): LivingProfessionalCommunityRepository {
  return new LivingProfessionalCommunityRepository();
}

export function livingProfessionalCommunityRepository(): LivingProfessionalCommunityRepository {
  if (!defaultRepository) {
    defaultRepository = createLivingProfessionalCommunityRepository();
  }
  return defaultRepository;
}
