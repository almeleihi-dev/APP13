import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import { livingOnboardingRepository } from "../../onboarding/infrastructure/living-onboarding-repository.js";
import type { LivingOpportunitiesExperience } from "../domain/opportunities-experience.js";
import type { OpportunityHistoryEntry, SavedOpportunity } from "../domain/opportunities-sections.js";
import type { OpportunityStatus } from "../domain/opportunities-schema.js";

export class LivingOpportunitiesRepository {
  private readonly experiences = new Map<string, LivingOpportunitiesExperience>();
  private readonly saved = new Map<string, SavedOpportunity[]>();
  private readonly history = new Map<string, OpportunityHistoryEntry[]>();
  private refreshCount = 0;

  getOnboardingResponses(userId: string): OnboardingResponses {
    return { ...livingOnboardingRepository().getOrCreate(userId).responses };
  }

  getCachedExperience(userId: string, dayKey: string): LivingOpportunitiesExperience | undefined {
    const cached = this.experiences.get(userId);
    if (cached && cached.generatedAt.slice(0, 10) === dayKey) {
      return cached;
    }
    return undefined;
  }

  saveExperience(userId: string, experience: LivingOpportunitiesExperience): void {
    this.experiences.set(userId, experience);
  }

  listExperiences(): LivingOpportunitiesExperience[] {
    return [...this.experiences.values()];
  }

  getSavedOpportunities(userId: string): SavedOpportunity[] {
    return [...(this.saved.get(userId) ?? [])];
  }

  getOpportunityHistory(userId: string): OpportunityHistoryEntry[] {
    return [...(this.history.get(userId) ?? [])];
  }

  saveOpportunity(
    userId: string,
    input: { opportunityId: string; title: string; category: string; reminderEnabled?: boolean },
    savedAt: string
  ): SavedOpportunity {
    const existing = this.saved.get(userId) ?? [];
    const without = existing.filter((s) => s.opportunityId !== input.opportunityId);
    const entry: SavedOpportunity = {
      opportunityId: input.opportunityId,
      title: input.title,
      category: input.category,
      savedAt,
      reminderEnabled: input.reminderEnabled ?? false,
    };
    this.saved.set(userId, [entry, ...without]);
    this.recordHistory(userId, {
      opportunityId: input.opportunityId,
      title: input.title,
      status: "saved",
      recordedAt: savedAt,
    });
    return entry;
  }

  recordHistory(userId: string, entry: OpportunityHistoryEntry): void {
    const existing = this.history.get(userId) ?? [];
    this.history.set(userId, [entry, ...existing].slice(0, 50));
  }

  recordView(userId: string, opportunityId: string, title: string, recordedAt: string): void {
    this.recordHistory(userId, {
      opportunityId,
      title,
      status: "viewed" as OpportunityStatus,
      recordedAt,
    });
  }

  incrementRefreshCount(): void {
    this.refreshCount += 1;
  }

  getRefreshCount(): number {
    return this.refreshCount;
  }

  getTotalSavedCount(): number {
    let count = 0;
    for (const entries of this.saved.values()) {
      count += entries.length;
    }
    return count;
  }

  getTotalHistoryCount(): number {
    let count = 0;
    for (const entries of this.history.values()) {
      count += entries.length;
    }
    return count;
  }
}

let defaultRepository: LivingOpportunitiesRepository | undefined;

export function createLivingOpportunitiesRepository(): LivingOpportunitiesRepository {
  return new LivingOpportunitiesRepository();
}

export function livingOpportunitiesRepository(): LivingOpportunitiesRepository {
  if (!defaultRepository) {
    defaultRepository = createLivingOpportunitiesRepository();
  }
  return defaultRepository;
}
