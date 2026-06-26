import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import { livingOnboardingRepository } from "../../onboarding/infrastructure/living-onboarding-repository.js";
import type { LivingActionPlannerContext } from "../domain/planner-context.js";
import type { LivingActionPlannerExperience } from "../domain/planner-experience.js";
import {
  archiveDayExecution,
  buildDefaultExecutionState,
  recordActionCompleted,
  recordActionPostponed,
  type PlannerExecutionState,
} from "../domain/planner-sections.js";

export class LivingActionPlannerRepository {
  private readonly experiences = new Map<string, LivingActionPlannerExperience>();
  private readonly executions = new Map<string, PlannerExecutionState>();
  private refreshCount = 0;

  getOnboardingResponses(userId: string): OnboardingResponses {
    return { ...livingOnboardingRepository().getOrCreate(userId).responses };
  }

  getCachedExperience(userId: string, dayKey: string): LivingActionPlannerExperience | undefined {
    const cached = this.experiences.get(userId);
    if (cached && cached.generatedAt.slice(0, 10) === dayKey) {
      return cached;
    }
    return undefined;
  }

  saveExperience(userId: string, experience: LivingActionPlannerExperience): void {
    this.experiences.set(userId, experience);
  }

  listExperiences(): LivingActionPlannerExperience[] {
    return [...this.experiences.values()];
  }

  getExecutionState(context: LivingActionPlannerContext): PlannerExecutionState {
    const existing = this.executions.get(context.userId);
    if (existing) return existing;

    const execution = buildDefaultExecutionState(context);
    this.executions.set(context.userId, execution);
    return execution;
  }

  updateExecutionState(userId: string, execution: PlannerExecutionState): void {
    this.executions.set(userId, execution);
  }

  recordActionCompleted(
    userId: string,
    actionId: string,
    title: string,
    recordedAt: string,
    notes?: string
  ): PlannerExecutionState {
    const execution = this.executions.get(userId);
    if (!execution) {
      throw new Error("Execution state not initialized");
    }
    const updated = recordActionCompleted(execution, actionId, title, recordedAt, notes);
    this.executions.set(userId, updated);
    return updated;
  }

  recordActionPostponed(
    userId: string,
    actionId: string,
    title: string,
    recordedAt: string,
    notes?: string
  ): PlannerExecutionState {
    const execution = this.executions.get(userId);
    if (!execution) {
      throw new Error("Execution state not initialized");
    }
    const updated = recordActionPostponed(execution, actionId, title, recordedAt, notes);
    this.executions.set(userId, updated);
    return updated;
  }

  archiveDay(userId: string, dayKey: string, totalPlanned: number, recordedAt: string): PlannerExecutionState {
    const execution = this.executions.get(userId);
    if (!execution) {
      throw new Error("Execution state not initialized");
    }
    const updated = archiveDayExecution(execution, dayKey, totalPlanned, recordedAt);
    this.executions.set(userId, updated);
    return updated;
  }

  incrementRefreshCount(): void {
    this.refreshCount += 1;
  }

  getRefreshCount(): number {
    return this.refreshCount;
  }

  getExecutionProfileCount(): number {
    return this.executions.size;
  }
}

let defaultRepository: LivingActionPlannerRepository | undefined;

export function createLivingActionPlannerRepository(): LivingActionPlannerRepository {
  return new LivingActionPlannerRepository();
}

export function livingActionPlannerRepository(): LivingActionPlannerRepository {
  if (!defaultRepository) {
    defaultRepository = createLivingActionPlannerRepository();
  }
  return defaultRepository;
}
