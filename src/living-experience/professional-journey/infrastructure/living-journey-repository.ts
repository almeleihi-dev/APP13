import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import { livingOnboardingRepository } from "../../onboarding/infrastructure/living-onboarding-repository.js";
import type { LivingProfessionalJourney } from "../domain/journey-experience.js";

export class LivingJourneyRepository {
  private readonly journeys = new Map<string, LivingProfessionalJourney>();
  private refreshCount = 0;

  getOnboardingResponses(userId: string): OnboardingResponses {
    return { ...livingOnboardingRepository().getOrCreate(userId).responses };
  }

  getCachedJourney(userId: string, dayKey: string): LivingProfessionalJourney | undefined {
    const cached = this.journeys.get(userId);
    if (cached && cached.generatedAt.slice(0, 10) === dayKey) {
      return cached;
    }
    return undefined;
  }

  saveJourney(userId: string, journey: LivingProfessionalJourney): void {
    this.journeys.set(userId, journey);
  }

  listJourneys(): LivingProfessionalJourney[] {
    return [...this.journeys.values()];
  }

  incrementRefreshCount(): void {
    this.refreshCount += 1;
  }

  getRefreshCount(): number {
    return this.refreshCount;
  }
}

let defaultRepository: LivingJourneyRepository | undefined;

export function createLivingJourneyRepository(): LivingJourneyRepository {
  return new LivingJourneyRepository();
}

export function livingJourneyRepository(): LivingJourneyRepository {
  if (!defaultRepository) {
    defaultRepository = createLivingJourneyRepository();
  }
  return defaultRepository;
}
