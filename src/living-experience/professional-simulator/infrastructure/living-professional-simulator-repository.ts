import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import { livingOnboardingRepository } from "../../onboarding/infrastructure/living-onboarding-repository.js";
import type { LivingProfessionalSimulatorContext } from "../domain/simulator-context.js";
import type { LivingProfessionalSimulatorExperience } from "../domain/simulator-experience.js";
import {
  buildDefaultSimulationHistory,
  recordSimulationOutcome,
  type SimulationHistoryProfile,
} from "../domain/simulator-sections.js";

export class LivingProfessionalSimulatorRepository {
  private readonly experiences = new Map<string, LivingProfessionalSimulatorExperience>();
  private readonly histories = new Map<string, SimulationHistoryProfile>();
  private refreshCount = 0;

  getOnboardingResponses(userId: string): OnboardingResponses {
    return { ...livingOnboardingRepository().getOrCreate(userId).responses };
  }

  getCachedExperience(userId: string, dayKey: string): LivingProfessionalSimulatorExperience | undefined {
    const cached = this.experiences.get(userId);
    if (cached && cached.generatedAt.slice(0, 10) === dayKey) {
      return cached;
    }
    return undefined;
  }

  saveExperience(userId: string, experience: LivingProfessionalSimulatorExperience): void {
    this.experiences.set(userId, experience);
  }

  listExperiences(): LivingProfessionalSimulatorExperience[] {
    return [...this.experiences.values()];
  }

  getSimulationHistory(context: LivingProfessionalSimulatorContext): SimulationHistoryProfile {
    const existing = this.histories.get(context.userId);
    if (existing) return existing;

    const history = buildDefaultSimulationHistory(context);
    this.histories.set(context.userId, history);
    return history;
  }

  recordSimulation(
    userId: string,
    recordId: string,
    scenario: string,
    status: "accepted" | "ignored",
    recordedAt: string,
    outcome?: string
  ): SimulationHistoryProfile {
    const history = this.histories.get(userId);
    if (!history) {
      throw new Error("Simulation history not initialized");
    }
    const updated = recordSimulationOutcome(history, recordId, scenario, status, recordedAt, outcome);
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

let defaultRepository: LivingProfessionalSimulatorRepository | undefined;

export function createLivingProfessionalSimulatorRepository(): LivingProfessionalSimulatorRepository {
  return new LivingProfessionalSimulatorRepository();
}

export function livingProfessionalSimulatorRepository(): LivingProfessionalSimulatorRepository {
  if (!defaultRepository) {
    defaultRepository = createLivingProfessionalSimulatorRepository();
  }
  return defaultRepository;
}
