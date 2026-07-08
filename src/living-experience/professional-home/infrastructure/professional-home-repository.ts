import type { GeographicIntelligenceData } from "../../onboarding/domain/onboarding-context.js";
import { livingOnboardingRepository } from "../../onboarding/infrastructure/living-onboarding-repository.js";
import type { ProfessionalHomeExperience } from "../domain/professional-home-experience.js";

export interface GeographicUserProfile {
  displayName?: string;
  onboardingGeographic?: GeographicIntelligenceData;
}

export class ProfessionalHomeRepository {
  private readonly experiences = new Map<string, ProfessionalHomeExperience>();
  private refreshCount = 0;

  getGeographicProfile(userId: string): GeographicUserProfile {
    const onboarding = livingOnboardingRepository().getOrCreate(userId);
    return {
      displayName: onboarding.responses.account?.displayName,
      onboardingGeographic: onboarding.responses.geographicIntelligence,
    };
  }

  getCachedExperience(userId: string, dayKey: string): ProfessionalHomeExperience | undefined {
    const cached = this.experiences.get(userId);
    if (cached && cached.dayKey === dayKey) {
      return cached;
    }
    return undefined;
  }

  saveExperience(userId: string, experience: ProfessionalHomeExperience): void {
    this.experiences.set(userId, experience);
  }

  listExperiences(): ProfessionalHomeExperience[] {
    return [...this.experiences.values()];
  }

  incrementRefreshCount(): void {
    this.refreshCount += 1;
  }

  getRefreshCount(): number {
    return this.refreshCount;
  }
}

let defaultRepository: ProfessionalHomeRepository | undefined;

export function createProfessionalHomeRepository(): ProfessionalHomeRepository {
  return new ProfessionalHomeRepository();
}

export function professionalHomeRepository(): ProfessionalHomeRepository {
  if (!defaultRepository) {
    defaultRepository = createProfessionalHomeRepository();
  }
  return defaultRepository;
}
