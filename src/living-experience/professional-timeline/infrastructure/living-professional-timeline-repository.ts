import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import { livingOnboardingRepository } from "../../onboarding/infrastructure/living-onboarding-repository.js";
import type { LivingProfessionalTimelineContext } from "../domain/timeline-context.js";
import type { LivingProfessionalTimelineExperience } from "../domain/timeline-experience.js";
import {
  buildDefaultTimelineHistory,
  recordTimelineOutcome,
  type TimelineHistoryProfile,
} from "../domain/timeline-sections.js";

export class LivingProfessionalTimelineRepository {
  private readonly experiences = new Map<string, LivingProfessionalTimelineExperience>();
  private readonly histories = new Map<string, TimelineHistoryProfile>();
  private refreshCount = 0;

  getOnboardingResponses(userId: string): OnboardingResponses {
    return { ...livingOnboardingRepository().getOrCreate(userId).responses };
  }

  getCachedExperience(userId: string, dayKey: string): LivingProfessionalTimelineExperience | undefined {
    const cached = this.experiences.get(userId);
    if (cached && cached.generatedAt.slice(0, 10) === dayKey) {
      return cached;
    }
    return undefined;
  }

  saveExperience(userId: string, experience: LivingProfessionalTimelineExperience): void {
    this.experiences.set(userId, experience);
  }

  listExperiences(): LivingProfessionalTimelineExperience[] {
    return [...this.experiences.values()];
  }

  getTimelineHistory(context: LivingProfessionalTimelineContext): TimelineHistoryProfile {
    const existing = this.histories.get(context.userId);
    if (existing) return existing;

    const history = buildDefaultTimelineHistory(context);
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
  ): TimelineHistoryProfile {
    const history = this.histories.get(userId);
    if (!history) {
      throw new Error("Timeline history not initialized");
    }
    const updated = recordTimelineOutcome(history, recordId, insightTitle, status, recordedAt, outcome);
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

let defaultRepository: LivingProfessionalTimelineRepository | undefined;

export function createLivingProfessionalTimelineRepository(): LivingProfessionalTimelineRepository {
  return new LivingProfessionalTimelineRepository();
}

export function livingProfessionalTimelineRepository(): LivingProfessionalTimelineRepository {
  if (!defaultRepository) {
    defaultRepository = createLivingProfessionalTimelineRepository();
  }
  return defaultRepository;
}
