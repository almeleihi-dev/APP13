import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import { livingOnboardingRepository } from "../../onboarding/infrastructure/living-onboarding-repository.js";
import type { LivingTodayIActedExperience } from "../domain/acted-experience.js";
import type { ProfessionalMemoryEntry } from "../domain/acted-sections.js";
import { buildProfessionalMemoryEntry } from "../domain/acted-sections.js";
import type { LivingTodayIActedContext } from "../domain/acted-context.js";

export class LivingTodayIActedRepository {
  private readonly experiences = new Map<string, LivingTodayIActedExperience>();
  private readonly memories = new Map<string, ProfessionalMemoryEntry[]>();
  private refreshCount = 0;

  getOnboardingResponses(userId: string): OnboardingResponses {
    return { ...livingOnboardingRepository().getOrCreate(userId).responses };
  }

  getCachedExperience(userId: string, dayKey: string): LivingTodayIActedExperience | undefined {
    const cached = this.experiences.get(userId);
    if (cached && cached.generatedAt.slice(0, 10) === dayKey) {
      return cached;
    }
    return undefined;
  }

  saveExperience(userId: string, experience: LivingTodayIActedExperience): void {
    this.experiences.set(userId, experience);
    this.persistTodayMemory(userId, experience);
  }

  listExperiences(): LivingTodayIActedExperience[] {
    return [...this.experiences.values()];
  }

  getMemoryEntries(userId: string): ProfessionalMemoryEntry[] {
    return [...(this.memories.get(userId) ?? [])];
  }

  searchMemories(userId: string, query: string): ProfessionalMemoryEntry[] {
    const entries = this.getMemoryEntries(userId);
    const normalized = query.trim().toLowerCase();
    if (!normalized) return entries.sort((a, b) => b.dayKey.localeCompare(a.dayKey));
    return entries
      .filter((e) => e.searchableText.includes(normalized) || e.dayKey.includes(normalized))
      .sort((a, b) => b.dayKey.localeCompare(a.dayKey));
  }

  incrementRefreshCount(): void {
    this.refreshCount += 1;
  }

  getRefreshCount(): number {
    return this.refreshCount;
  }

  getTotalMemoryCount(): number {
    let count = 0;
    for (const entries of this.memories.values()) {
      count += entries.length;
    }
    return count;
  }

  private persistTodayMemory(userId: string, experience: LivingTodayIActedExperience): void {
    const memorySection = experience.sections.find((s) => s.sectionId === "professional_memory");
    if (!memorySection || memorySection.sectionId !== "professional_memory") return;

    const existing = this.memories.get(userId) ?? [];
    const todayEntry = memorySection.todayEntry;
    const withoutToday = existing.filter((e) => e.dayKey !== todayEntry.dayKey);
    this.memories.set(userId, [todayEntry, ...withoutToday]);
  }

  saveMemoryFromContext(context: LivingTodayIActedContext, story: string, actionsCompleted: number, professionalScore: number): void {
    const entry = buildProfessionalMemoryEntry(context, story, actionsCompleted, professionalScore);
    const existing = this.memories.get(context.userId) ?? [];
    const withoutToday = existing.filter((e) => e.dayKey !== entry.dayKey);
    this.memories.set(context.userId, [entry, ...withoutToday]);
  }
}

let defaultRepository: LivingTodayIActedRepository | undefined;

export function createLivingTodayIActedRepository(): LivingTodayIActedRepository {
  return new LivingTodayIActedRepository();
}

export function livingTodayIActedRepository(): LivingTodayIActedRepository {
  if (!defaultRepository) {
    defaultRepository = createLivingTodayIActedRepository();
  }
  return defaultRepository;
}
