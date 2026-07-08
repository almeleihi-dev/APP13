import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import { livingOnboardingRepository } from "../../onboarding/infrastructure/living-onboarding-repository.js";
import type { LivingProfessionalImpactExperience } from "../domain/impact-experience.js";

export class LivingProfessionalImpactRepository {
  private readonly experiences = new Map<string, LivingProfessionalImpactExperience>();
  private refreshCount = 0;

  getOnboardingResponses(userId: string): OnboardingResponses {
    return { ...livingOnboardingRepository().getOrCreate(userId).responses };
  }

  getCachedExperience(userId: string, dayKey: string): LivingProfessionalImpactExperience | undefined {
    const cached = this.experiences.get(userId);
    if (cached && cached.generatedAt.slice(0, 10) === dayKey) {
      return cached;
    }
    return undefined;
  }

  saveExperience(userId: string, experience: LivingProfessionalImpactExperience): void {
    this.experiences.set(userId, experience);
  }

  listExperiences(): LivingProfessionalImpactExperience[] {
    return [...this.experiences.values()];
  }

  incrementRefreshCount(): void {
    this.refreshCount += 1;
  }

  getRefreshCount(): number {
    return this.refreshCount;
  }
}

let defaultRepository: LivingProfessionalImpactRepository | undefined;

export function createLivingProfessionalImpactRepository(): LivingProfessionalImpactRepository {
  return new LivingProfessionalImpactRepository();
}

export function livingProfessionalImpactRepository(): LivingProfessionalImpactRepository {
  if (!defaultRepository) {
    defaultRepository = createLivingProfessionalImpactRepository();
  }
  return defaultRepository;
}
